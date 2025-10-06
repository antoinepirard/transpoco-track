'use client';

import { useState, useEffect } from 'react';

// Resolution data parsed from resolution-sizes.csv
const widthData: Record<number, number> = {
  1920: 776146, 1536: 127512, 1280: 81096, 1600: 34823, 1366: 33211,
  2560: 22780, 1440: 20828, 2048: 12852, 3440: 12472, 1680: 9007,
  384: 5800, 360: 5299, 393: 5193, 1080: 4214, 2240: 4054,
  390: 3648, 1229: 3210, 430: 3138, 385: 3004, 1512: 2909,
  1728: 2667, 440: 2540, 1250: 2490, 3840: 2376, 1715: 2134,
  412: 2085, 1664: 1949, 1368: 1591, 402: 1466, 375: 1462,
  2752: 1429, 1024: 1383, 2195: 1378, 1847: 1348, 432: 1333,
  1344: 1324, 1746: 1195, 1470: 1177, 1463: 1166, 407: 1157,
  377: 1071, 1291: 1041, 2657: 1017, 1143: 1003, 1200: 986,
  1537: 952, 1239: 952, 1307: 848, 1500: 826, 414: 825,
  1360: 771, 1830: 757, 428: 699, 1506: 666, 2144: 655,
  820: 653, 1720: 611, 1376: 609, 1504: 593, 320: 532,
  1829: 528, 1434: 523, 2304: 517, 1700: 501, 1805: 424,
  2400: 422, 1856: 372, 339: 372, 2561: 359, 1603: 332,
  1970: 305, 1762: 298, 1281: 289, 1046: 268, 810: 250,
  1268: 243, 834: 225, 1352: 221, 1707: 214, 1865: 209,
  1396: 205, 1670: 190, 2439: 190, 1997: 189, 1792: 171,
  1639: 165, 1098: 155, 424: 153, 1155: 147, 800: 138,
  1696: 132, 1392: 119, 769: 114, 1760: 112, 408: 107,
  387: 103, 376: 101, 388: 99, 1710: 98, 1676: 95,
  1524: 86, 1112: 82, 1466: 76, 806: 73, 1740: 72,
  448: 70, 378: 70, 396: 68, 1587: 66, 4096: 66,
  1372: 66, 1642: 60, 1314: 57, 2637: 55, 370: 54,
  1492: 52, 980: 52, 1011: 48, 1264: 47, 427: 46,
  1812: 45, 434: 45, 1120: 39, 2328: 37, 5120: 37,
  3072: 36, 876: 34, 668: 33, 1751: 33, 600: 32,
  691: 29, 750: 29, 1400: 28, 832: 28, 1050: 24,
  708: 23, 854: 22, 1912: 22, 867: 21, 686: 20,
  915: 20, 1407: 19, 823: 17, 369: 17, 1042: 15,
  960: 15, 1373: 15, 1496: 15, 1220: 15, 352: 15,
  1825: 12, 2001: 12, 1323: 12, 824: 10, 1528: 9,
  2478: 9, 1123: 9, 367: 7, 1058: 7, 366: 7,
  2872: 7, 1408: 7, 1088: 7, 804: 7, 1320: 7,
  1739: 6, 350: 6, 1476: 6, 839: 6, 2112: 5,
  744: 5, 325: 5, 873: 5, 345: 4, 346: 4,
  1334: 4, 892: 4, 740: 3, 780: 3, 0: 2,
  386: 2, 3680: 1, 747: 1, 1510: 1, 912: 1,
  968: 1, 998: 1
};


// Calculate total width events
const totalWidthEvents = Object.values(widthData).reduce((sum, count) => sum + count, 0);

// Responsive breakpoint-based buckets
const widthBreakpoints = [
  { min: 0, max: 639, label: 'Mobile', category: 'Mobile' },
  { min: 640, max: 1023, label: 'Tablet', category: 'Tablet' },
  { min: 1024, max: 1439, label: 'Laptop', category: 'Laptop' },
  { min: 1440, max: 1919, label: 'Desktop', category: 'Desktop' },
  { min: 1920, max: 2559, label: 'XL Desktop', category: 'XL Desktop' },
  { min: 2560, max: Infinity, label: 'Ultra-wide', category: 'Ultra-wide' },
];

// Calculate percentage for each breakpoint bucket
const calculateBreakpointPercentages = () => {
  const buckets = widthBreakpoints.map(bp => ({
    ...bp,
    count: 0,
    percentage: 0,
  }));

  // Sum events for each bucket
  for (const [key, eventCount] of Object.entries(widthData)) {
    const value = Number(key);
    const bucket = buckets.find(b => value >= b.min && value <= b.max);
    if (bucket) {
      bucket.count += eventCount;
    }
  }

  // Calculate percentages
  for (const bucket of buckets) {
    bucket.percentage = totalWidthEvents > 0 ? (bucket.count / totalWidthEvents) * 100 : 0;
  }

  return buckets;
};

// Get bucket for a specific width value
const getBucketForWidth = (width: number, buckets: typeof widthBreakpoints) => {
  const bucket = buckets.find(b => width >= b.min && width <= b.max);
  return bucket || buckets[0]; // Default to first bucket if not found
};

// Pre-calculate breakpoint buckets
const widthBuckets = calculateBreakpointPercentages();

export function ResolutionMetadata() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };

    // Initial update
    updateWidth();

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateWidth, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Get bucket information for current width
  const widthBucket = getBucketForWidth(width, widthBuckets);

  // Use width bucket percentage as the metric
  const userPercentage = widthBucket?.percentage || 0;

  const formatPercentage = (percentage: number) => {
    if (percentage < 0.1) return '< 0.1%';
    if (percentage < 1) return `${percentage.toFixed(1)}%`;
    return `${Math.round(percentage)}%`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 min-w-[280px]">
      <div className="flex flex-col space-y-2">
        {/* Primary: Main percentage message */}
        <div className="text-2xl font-bold text-gray-900">
          ~{formatPercentage(userPercentage)}
        </div>
        <div className="text-sm text-gray-600">
          have similar width
        </div>

        {/* Bar chart visualization */}
        <div className="pt-1">
          <div className="flex gap-0.5 h-2">
            {widthBuckets.map((bucket) => {
              const isCurrentBucket = widthBucket?.category === bucket.category;
              return (
                <div
                  key={bucket.category}
                  className={`relative group transition-opacity ${
                    isCurrentBucket
                      ? 'bg-blue-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  style={{ width: `${bucket.percentage}%` }}
                  title={`${bucket.category}: ${formatPercentage(bucket.percentage)}`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                    {bucket.category}: {formatPercentage(bucket.percentage)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Secondary: Current width and category */}
        <div className="text-xs text-gray-500 pt-1 border-t border-gray-200">
          {width}px ({widthBucket?.category || 'Unknown'})
        </div>

        {/* Tertiary: Width range breakdown */}
        <div className="text-[10px] text-gray-400">
          {widthBucket && (
            <div>
              {widthBucket.min === 0 ? '0' : widthBucket.min}
              {widthBucket.max === Infinity ? '+' : `-${widthBucket.max}`}px range
            </div>
          )}
        </div>

        {/* PostHog link */}
        <div className="pt-1 border-t border-gray-200">
          <a
            href="https://eu.posthog.com/project/75456/insights/eqDOk5IK"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1"
          >
            View data in PostHog
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
