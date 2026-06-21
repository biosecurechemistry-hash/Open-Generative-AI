'use client';

import React, { useEffect, useRef, useState } from 'react';
import { fetchRecentLogs, type LogLine } from '../lib/api';

export default function LogTerminal() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecentLogs()
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetchRecentLogs()
        .then((fresh) => {
          setLogs((prev) => {
            // Deduplicate by received_at timestamp
            const seen = new Set(prev.map((l) => l.timestamp + l.message));
            const newItems = fresh.filter((l) => !seen.has(l.timestamp + l.message));
            return [...prev, ...newItems].slice(-100);
          });
        })
        .catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-900/80 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-800 border-b border-surface-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
            Deep Track Terminal
          </span>
        </div>
        <span className="text-[0.65rem] text-surface-600 font-mono">
          {logs.length} entries
        </span>
      </div>
      <div className="h-64 overflow-y-auto p-3 font-mono text-xs leading-relaxed">
        {loading && (
          <div className="text-surface-600 animate-pulse">Loading trace entries...</div>
        )}
        {!loading && logs.length === 0 && (
          <div className="text-surface-600">
            <span className="text-brand-500">●</span> Terminal ready — awaiting deep-track events...
            <br />
            <span className="text-surface-700">
              ZeroClaw runtime traces and engine logs appear here.
            </span>
          </div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2 hover:bg-surface-800/30 px-1 rounded">
            <span className="text-surface-600 shrink-0">
              {log.timestamp?.slice(11, 19) || '--:--:--'}
            </span>
            <span
              className={`shrink-0 w-10 ${
                log.level === 'error'
                  ? 'text-red-400'
                  : log.level === 'warn'
                  ? 'text-amber-400'
                  : 'text-brand-400'
              }`}
            >
              {log.level?.toUpperCase() || 'INFO'}
            </span>
            <span className="text-surface-300 truncate">{log.message || JSON.stringify(log)}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
