'use client';

import React, { useMemo, useState } from 'react';
import {
  EnvelopeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  BellIcon,
  DotOutlineIcon,
} from '@phosphor-icons/react';

type NotificationItem = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: number; // epoch ms
  unread: boolean;
  type: 'comment' | 'alert' | 'assignment' | 'system';
  author?: string;
};

type Filter = 'all' | 'unread' | 'mentions';

function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d`;
}

const demoNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'SLA breach: Late arrival to Acme Co.',
    excerpt: 'Vehicle D-1234 missed ETA by 18m for Job #4821 (Dublin 12).',
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    unread: true,
    type: 'alert',
    author: 'Vehicle D-1234',
  },
  {
    id: 'n2',
    title: 'Speeding on M50 (100 km/h limit)',
    excerpt: 'Vehicle D-1234 recorded 124 km/h at 09:14 near Junction 6.',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    unread: true,
    type: 'alert',
    author: 'Vehicle D-1234',
  },
  {
    id: 'n3',
    title: 'Excessive idling detected',
    excerpt: 'Vehicle C-4321 idling for 16m near Galway Retail Park.',
    createdAt: Date.now() - 1000 * 60 * 35,
    unread: true,
    type: 'alert',
    author: 'Vehicle C-4321',
  },
  {
    id: 'n4',
    title: 'Geofence exit after hours: Dublin Depot',
    excerpt: 'Vehicle V-5678 left the Depot geofence at 21:43.',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    unread: false,
    type: 'alert',
    author: 'Vehicle V-5678',
  },
  {
    id: 'n5',
    title: 'Maintenance due soon',
    excerpt: 'Vehicle V-1098 service due in 200 km (odometer: 198,450).',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    unread: true,
    type: 'system',
    author: 'Vehicle V-1098',
  },
  {
    id: 'n6',
    title: 'Harsh braking events (3)',
    excerpt: 'Driver Liam Murphy recorded 3 harsh brakings in the last hour.',
    createdAt: Date.now() - 1000 * 60 * 45,
    unread: true,
    type: 'alert',
    author: 'Driver Liam Murphy',
  },
  {
    id: 'n7',
    title: 'Fuel anomaly detected',
    excerpt: 'Rapid fuel drop while ignition off; possible siphoning (Cork).',
    createdAt: Date.now() - 1000 * 60 * 90,
    unread: false,
    type: 'alert',
    author: 'Vehicle T-2211',
  },
  {
    id: 'n8',
    title: 'Engine fault code reported',
    excerpt: 'Truck T-882 raised DTC P0420 (Catalyst efficiency below threshold).',
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    unread: true,
    type: 'alert',
    author: 'Vehicle T-882',
  },
  {
    id: 'n9',
    title: 'EV low battery',
    excerpt: 'Van EV-22 at 12% SoC. Nearest charger: 2.1 km (Sandyford).',
    createdAt: Date.now() - 1000 * 60 * 15,
    unread: true,
    type: 'alert',
    author: 'Vehicle EV-22',
  },
  {
    id: 'n10',
    title: 'Route deviation detected',
    excerpt: 'Vehicle V-334 deviated 5.2 km from planned route (Route #743).',
    createdAt: Date.now() - 1000 * 60 * 20,
    unread: false,
    type: 'alert',
    author: 'Vehicle V-334',
  },
  {
    id: 'n11',
    title: 'Pre‑trip check failed',
    excerpt: 'Driver Emma O’Connor reported 2 critical defects in walkaround.',
    createdAt: Date.now() - 1000 * 60 * 50,
    unread: true,
    type: 'alert',
    author: 'Driver Emma O’Connor',
  },
  {
    id: 'n12',
    title: 'Route summary ready',
    excerpt: 'Route 2025‑11‑06 completed. On‑time deliveries: 94%.',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    unread: false,
    type: 'system',
  },
];

export default function InboxPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(demoNotifications[0]?.id ?? null);
  const [items, setItems] = useState<NotificationItem[]>(demoNotifications);

  const filtered = useMemo(() => {
    let list = items;
    if (filter === 'unread') list = list.filter((n) => n.unread);
    // Mentions as a demo: include items that look like they mention '@' or contain your name
    if (filter === 'mentions') list = list.filter((n) => /@|you|mention/i.test(n.excerpt));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.excerpt.toLowerCase().includes(q) ||
          (n.author ? n.author.toLowerCase().includes(q) : false)
      );
    }
    return list;
  }, [items, filter, query]);

  const selected = useMemo(
    () => items.find((n) => n.id === selectedId) || null,
    [items, selectedId]
  );

  const markSelected = (unread: boolean) => {
    if (!selected) return;
    setItems((prev) => prev.map((n) => (n.id === selected.id ? { ...n, unread } : n)));
  };

  return (
    <div className="h-full w-full flex">
      {/* Left pane: search, filters, list */}
      <aside className="w-80 min-w-72 max-w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="h-5 w-5 text-gray-500" />
            <h1 className="text-sm font-semibold text-gray-800">Inbox</h1>
          </div>
          <div className="mt-3 relative">
            <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full h-8 pl-8 pr-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#3D88C5] focus:border-transparent"
            />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`h-7 rounded text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#0e0033] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`h-7 rounded text-xs font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-[#0e0033] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('mentions')}
              className={`h-7 rounded text-xs font-medium transition-colors ${
                filter === 'mentions'
                  ? 'bg-[#0e0033] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mentions
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-gray-500">
              No notifications match your filters.
            </div>
          )}
          <ul className="space-y-1 px-2">
            {filtered.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => setSelectedId(n.id)}
                  className={`w-full text-left p-3 rounded transition-colors border ${
                    selectedId === n.id
                      ? 'bg-[#0e0033] text-white border-[#0e0033]'
                      : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {n.unread ? (
                        <span className="inline-block h-2 w-2 rounded-full bg-[#3D88C5]" />
                      ) : (
                        <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">
                          {n.title}
                        </span>
                        <span
                          className={`text-[11px] ${
                            selectedId === n.id ? 'text-white/80' : 'text-gray-500'
                          }`}
                        >
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`truncate text-xs ${
                          selectedId === n.id ? 'text-white/90' : 'text-gray-600'
                        }`}
                      >
                        {n.excerpt}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Right pane: details */}
      <section className="flex-1 min-w-0 bg-white">
        {!selected && (
          <div className="h-full w-full flex items-center justify-center p-8">
            <div className="text-center">
              <BellIcon className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Select a notification to view details</p>
            </div>
          </div>
        )}

        {selected && (
          <div className="h-full w-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900 truncate">
                  {selected.title}
                </h2>
                <div className="mt-1 text-xs text-gray-500">
                  {timeAgo(selected.createdAt)} ago
                  {selected.author ? ` · ${selected.author}` : ''}
                  {selected.type ? ` · ${selected.type}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selected.unread ? (
                  <button
                    onClick={() => markSelected(false)}
                    className="h-8 px-3 rounded bg-gray-900 text-white text-xs font-medium hover:bg-black"
                  >
                    Mark as read
                  </button>
                ) : (
                  <button
                    onClick={() => markSelected(true)}
                    className="h-8 px-3 rounded bg-gray-100 text-gray-800 text-xs font-medium hover:bg-gray-200"
                  >
                    Mark as unread
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-gray-800">
                  {selected.excerpt}
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded border border-gray-200 p-3">
                    <div className="text-gray-500">Notification type</div>
                    <div className="mt-1 font-medium text-gray-800 capitalize">{selected.type}</div>
                  </div>
                  <div className="rounded border border-gray-200 p-3">
                    <div className="text-gray-500">Received</div>
                    <div className="mt-1 font-medium text-gray-800">{timeAgo(selected.createdAt)} ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


