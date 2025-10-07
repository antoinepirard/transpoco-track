#!/usr/bin/env node
/*
  Export all pages and assets from the Transpoco Knowledge Base under
  https://www.transpoco.com/knowledge into a local folder.

  Usage:
    pnpm run export:knowledge

  Options (env vars):
    KB_BASE_URL   Base URL to crawl (default: https://www.transpoco.com/knowledge)
    KB_OUT_DIR    Output directory (default: knowledge-export)
    KB_MAX_DEPTH  Max crawl depth (default: 20)
    KB_CONCURRENCY Request concurrency (default: 8)
*/

import path from 'node:path';
import fs from 'node:fs';
import https from 'node:https';
import { load as loadHtml } from 'cheerio';
import TurndownService from 'turndown';
import archiver from 'archiver';
import scrape from 'website-scraper';

const BASE_URL = process.env.KB_BASE_URL || 'https://www.transpoco.com/knowledge';
const OUTPUT_DIR = process.env.KB_OUT_DIR || 'knowledge-export';
const MD_ONLY = String(process.env.KB_ONLY_MD || '').toLowerCase() === '1' || String(process.env.KB_ONLY_MD || '').toLowerCase() === 'true';
const MD_OUT_DIR = process.env.KB_MD_DIR || 'knowledge-export-md';
const ZIP_ENABLED = String(process.env.KB_ZIP || '').toLowerCase() === '1' || String(process.env.KB_ZIP || '').toLowerCase() === 'true';
const MAX_DEPTH = Number(process.env.KB_MAX_DEPTH || 20);
const REQUEST_CONCURRENCY = Number(process.env.KB_CONCURRENCY || 8);


function computeOutputDirectory(preferredDir) {
  const overwriteValue = String(process.env.KB_OVERWRITE || '').toLowerCase();
  const suffixTsValue = String(process.env.KB_SUFFIX_TIMESTAMP || '').toLowerCase();
  const overwrite = overwriteValue === 'true' || overwriteValue === '1';
  const suffixTimestamp = suffixTsValue === 'true' || suffixTsValue === '1';

  if (!fs.existsSync(preferredDir)) return preferredDir;

  if (overwrite) {
    try {
      fs.rmSync(preferredDir, { recursive: true, force: true });
    } catch {
      // If removal fails, fall back to suffixing
      const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
      return `${preferredDir}-${ts}`;
    }
    return preferredDir;
  }

  if (suffixTimestamp) {
    const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    return `${preferredDir}-${ts}`;
  }

  let index = 1;
  let candidate = `${preferredDir}-${index}`;
  while (fs.existsSync(candidate)) {
    index += 1;
    candidate = `${preferredDir}-${index}`;
  }
  return candidate;
}

function listFilesRecursively(rootDir) {
  const results = [];
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function toAbsoluteUrl(base, maybeRelative) {
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return maybeRelative;
  }
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

function getSlugFromUrl(pageUrl) {
  try {
    const { pathname } = new URL(pageUrl);
    const segments = pathname.split('/').filter(Boolean);
    let base = segments[segments.length - 1] || 'index';
    if (base === 'index' && segments.length > 1) {
      base = segments[segments.length - 2];
    }
    return slugify(base || 'page');
  } catch {
    return slugify(pageUrl);
  }
}

function ensureUniqueSlug(baseSlug, usedSlugs) {
  let candidate = baseSlug || 'page';
  let counter = 1;
  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${counter++}`;
  }
  usedSlugs.add(candidate);
  return candidate;
}

function selectMainContent($) {
  const candidates = [
    'article .article-body',
    'article',
    'main .article-body',
    'main',
    '.article-body',
    '.post-content',
    '.post-body',
    '.hs_cos_wrapper_type_rich_text',
    '.rich-text',
    '.content',
    '#content'
  ];
  for (const sel of candidates) {
    const node = $(sel).first();
    if (node && node.length) return node;
  }
  return $('body');
}

function extractTitle($) {
  const h1 = $('h1').first().text().trim();
  if (h1) return h1;
  const title = $('title').first().text().trim();
  return title || '';
}

function convertHtmlToMarkdown(html) {
  const $ = loadHtml(html);
  // Remove non-content elements early
  $('script, style, noscript, header, footer, nav, aside').remove();

  // Detect video embeds/links before stripping
  const hadVideoEmbeds = $('video, iframe').length > 0;
  const videoLinkSelectors = 'a[href*="youtube.com"],a[href*="youtu.be"],a[href*="vimeo.com"],a[href*="wistia"],a[href$=".mp4"],a[href$=".webm"],a[href$=".m3u8"],a[href*="loom.com"]';
  const hadVideoLinks = $(videoLinkSelectors).length > 0;

  // Replace anchors with just their inner text (drop URLs)
  $('a').each((_, el) => {
    const text = $(el).text();
    $(el).replaceWith(text);
  });

  // Replace images with their alt text, or remove
  $('img').each((_, el) => {
    const alt = ($(el).attr('alt') || '').trim();
    if (alt) $(el).replaceWith(alt);
    else $(el).remove();
  });

  // Remove any remaining media containers
  $('video, source, iframe').remove();

  const $content = selectMainContent($).clone();
  const rawText = $content.text().replace(/\s+/g, ' ').trim();
  const title = extractTitle($);

  const turndown = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*'
  });
  turndown.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement(content) {
      return `~~${content}~~`;
    }
  });

  let markdownBody = turndown.turndown($content.html() || '');
  // Drop any lingering URLs (just to be safe)
  markdownBody = markdownBody.replace(/https?:[^\s)]+/g, '');
  // Normalize excessive blank lines
  markdownBody = markdownBody.replace(/\n{3,}/g, '\n\n').trim();

  const isMostlyEmpty = markdownBody.replace(/[^A-Za-z0-9]/g, '').length < 40 && rawText.length < 60;
  const isVideoOnly = isMostlyEmpty && (hadVideoEmbeds || hadVideoLinks);

  const header = title ? `# ${title}\n\n` : '';
  let finalMd = header + markdownBody + (markdownBody ? '\n' : '');
  if (!markdownBody) {
    finalMd = header;
  }
  if (isVideoOnly) {
    finalMd += (finalMd ? '\n' : '') + '_This article primarily contains a video. Content omitted._\n';
  }

  return { markdown: finalMd, title, isVideoOnly };
}

async function writeZipFromDirectory(sourceDir, zipFilePath) {
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

function isKnowledgeBaseUrl(urlString) {
  try {
    const u = new URL(urlString);
    if (u.hostname !== 'www.transpoco.com') return false;
    return u.pathname === '/knowledge' || u.pathname.startsWith('/knowledge/');
  } catch {
    return false;
  }
}

function fetchText(urlString) {
  return new Promise((resolve, reject) => {
    const doRequest = (u, redirects = 0) => {
      const req = https.get(u, (res) => {
        const status = res.statusCode || 0;
        const location = res.headers.location;
        if (status >= 300 && status < 400 && location && redirects < 5) {
          const nextUrl = new URL(location, u).toString();
          res.resume();
          doRequest(nextUrl, redirects + 1);
          return;
        }
        if (status < 200 || status >= 300) {
          res.resume();
          reject(new Error(`HTTP ${status} fetching ${u}`));
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
    };
    doRequest(urlString);
  });
}

async function getSitemapUrls(baseUrl) {
  const base = new URL(baseUrl);
  const candidates = [
    `${base.origin}/knowledge/sitemap.xml`,
    `${base.origin}/knowledge/sitemap_index.xml`,
    `${base.origin}/sitemap.xml`,
    `${base.origin}/sitemap_index.xml`
  ];
  const discovered = new Set();
  for (const candidate of candidates) {
    try {
      const xml = await fetchText(candidate);
      const locMatches = Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi));
      for (const m of locMatches) {
        const loc = m[1];
        if (isKnowledgeBaseUrl(loc)) {
          discovered.add(loc);
        }
      }
    } catch {
      // ignore missing sitemap
    }
  }
  return Array.from(discovered);
}

async function run() {
  const absoluteOutputBase = path.resolve(process.cwd(), OUTPUT_DIR);
  const absoluteOutput = computeOutputDirectory(absoluteOutputBase);

  console.log('[kb-export] Starting export');
  console.log(`[kb-export] Base URL: ${BASE_URL}`);
  console.log(`[kb-export] Output dir: ${absoluteOutput}`);
  if (absoluteOutput !== absoluteOutputBase) {
    console.log(`[kb-export] Note: base output ${absoluteOutputBase} was occupied; using ${absoluteOutput}`);
  }
  console.log(`[kb-export] Max depth: ${MAX_DEPTH}`);
  console.log(`[kb-export] Concurrency: ${REQUEST_CONCURRENCY}`);

  let seedUrls = [BASE_URL];
  try {
    const sitemapUrls = await getSitemapUrls(BASE_URL);
    if (sitemapUrls.length > 0) {
      console.log(`[kb-export] Discovered ${sitemapUrls.length} URLs from sitemap`);
      seedUrls = Array.from(new Set([BASE_URL, ...sitemapUrls]));
    }
  } catch (e) {
    console.warn('[kb-export] Failed to parse sitemap:', e && e.message ? e.message : e);
  }

  const options = {
    urls: seedUrls,
    directory: absoluteOutput,
    recursive: true,
    maxDepth: MAX_DEPTH,
    requestConcurrency: REQUEST_CONCURRENCY,
    filenameGenerator: 'bySiteStructure',
    prettifyUrls: true,
    urlFilter: (url) => isKnowledgeBaseUrl(url),
    request: {
      headers: {
        'user-agent': 'transpoco-track-kb-export/1.0 (+https://www.transpoco.com)'
      }
    },
    sources: [
      { selector: 'img', attr: 'src' },
      { selector: 'img', attr: 'srcset' },
      { selector: 'link[rel="icon"]', attr: 'href' },
      { selector: 'link[rel="apple-touch-icon"]', attr: 'href' },
      { selector: 'link[rel="stylesheet"]', attr: 'href' },
      { selector: 'script', attr: 'src' },
      { selector: 'a', attr: 'href' },
      { selector: 'source', attr: 'src' },
      { selector: 'video', attr: 'src' },
      { selector: 'audio', attr: 'src' }
    ]
  };

  try {
    const results = await scrape(options);
    const total = Array.isArray(results) ? results.length : 0;
    console.log(`[kb-export] Export complete. Files saved: ${total}`);
    console.log(`[kb-export] Location: ${absoluteOutput}`);

    // Markdown extraction step
    const mdOutBase = path.resolve(process.cwd(), MD_OUT_DIR);
    const mdOutDir = computeOutputDirectory(mdOutBase);
    console.log(`[kb-export] Markdown output dir: ${mdOutDir}`);
    const htmlFiles = listFilesRecursively(absoluteOutput).filter((p) => p.endsWith('.html'));
    const usedSlugs = new Set();
    for (const htmlPath of htmlFiles) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      // Derive the web URL from local path
      const rel = path.relative(absoluteOutput, htmlPath);
      const parts = rel.split(path.sep);
      const webPath = '/' + parts.slice(1).join('/'); // drop host folder
      const pageUrl = toAbsoluteUrl('https://www.transpoco.com', webPath);
      const { markdown: md, title } = convertHtmlToMarkdown(html);
      // Use article title for filename when available
      const baseSlug = slugify(title) || getSlugFromUrl(pageUrl);
      const fileSlug = ensureUniqueSlug(baseSlug, usedSlugs);
      const outFile = path.join(mdOutDir, `${fileSlug}.md`);
      fs.mkdirSync(mdOutDir, { recursive: true });
      fs.writeFileSync(outFile, md, 'utf8');
    }
    console.log(`[kb-export] Markdown files written`);

    // Optionally remove HTML export if only markdown requested
    if (MD_ONLY) {
      try {
        fs.rmSync(absoluteOutput, { recursive: true, force: true });
        console.log('[kb-export] Removed HTML export (MD_ONLY enabled)');
      } catch (e) {
        console.warn('[kb-export] Failed to remove HTML export:', e && e.message ? e.message : e);
      }
    }

    // Optional ZIP packaging
    if (ZIP_ENABLED) {
      const zipName = MD_ONLY ? `${path.basename(mdOutDir)}.zip` : `${path.basename(absoluteOutput)}.zip`;
      const zipTarget = path.resolve(process.cwd(), zipName);
      const zipSource = MD_ONLY ? mdOutDir : absoluteOutput;
      console.log(`[kb-export] Creating zip: ${zipTarget}`);
      await writeZipFromDirectory(zipSource, zipTarget);
      console.log('[kb-export] Zip created');
    }
  } catch (error) {
    console.error('[kb-export] Export failed:', error && error.message ? error.message : error);
    process.exitCode = 1;
  }
}

run();


