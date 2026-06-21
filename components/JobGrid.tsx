'use client';

import React, { useEffect, useState } from 'react';
import { fetchLedger, triggerDeploy, type LedgerItem } from '../lib/api';

export default function JobGrid() {
  const [data, setData] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchLedger()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetchLedger()
        .then(setData)
        .catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleDeploy = async (id: number, type: string, title: string | null) => {
    const key = `${type}-${id}`;
    setDeployingId(key);
    const ok = await triggerDeploy(id, type, title);
    setDeployingId(null);
    setToast(ok ? `Item #${id} deployed.` : `Deploy failed for #${id}.`);
    setTimeout(() => setToast(null), 4000);
  };

  const getBadge = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('journal') || t.includes('script'))
      return { bg: 'bg-blue-950', text: 'text-blue-300', label: 'JOURNAL' };
    if (t.includes('staged') || t.includes('asset'))
      return { bg: 'bg-brand-950', text: 'text-brand-300', label: 'STAGED' };
    if (t.includes('synced') || t.includes('timesheet'))
      return { bg: 'bg-amber-950', text: 'text-amber-300', label: 'SYNCED' };
    if (t.includes('processed') || t.includes('complete'))
      return { bg: 'bg-emerald-950', text: 'text-emerald-300', label: 'READY' };
    return { bg: 'bg-surface-800', text: 'text-surface-300', label: type.slice(0, 12).toUpperCase() };
  };

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-900/50 overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg bg-brand-900 border border-brand-600 text-brand-200 text-sm font-medium shadow-lg animate-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-800 border-b border-surface-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
            Live Ledger — {data.length} entries
          </span>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchLedger()
              .then(setData)
              .catch((err) => setError(err.message))
              .finally(() => setLoading(false));
          }}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="overflow-x-auto">
        {loading && (
          <div className="flex items-center gap-3 p-8 text-brand-400">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Loading live pipeline entries...</span>
          </div>
        )}

        {error && (
          <div className="p-5 m-4 bg-red-950/30 border border-red-800 rounded-lg">
            <strong className="text-red-400">Connection Error</strong>
            <p className="mt-1 text-sm text-red-300">
              Could not reach backend on port 3002. Check that director-backend is online.
            </p>
            <small className="text-surface-500 font-mono">{error}</small>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="p-8 text-center text-surface-500">
            <p className="text-lg mb-1">No ledger entries yet.</p>
            <p className="text-sm">
              Insert a job via{' '}
              <code className="text-brand-400 bg-surface-800 px-1 rounded">
                POST /api/webhook/offline-ingest
              </code>{' '}
              or the offline engine.
            </p>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-800/50 border-b border-surface-700">
                <th className="py-2 px-4 w-14 text-[0.65rem] uppercase tracking-wider text-surface-500">ID</th>
                <th className="py-2 px-4 w-24 text-[0.65rem] uppercase tracking-wider text-surface-500">Type</th>
                <th className="py-2 px-4 text-[0.65rem] uppercase tracking-wider text-surface-500">Payload</th>
                <th className="py-2 px-4 w-40 text-[0.65rem] uppercase tracking-wider text-surface-500">Timestamp</th>
                <th className="py-2 px-4 w-28 text-center text-[0.65rem] uppercase tracking-wider text-surface-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const key = `${item.type}-${item.id}`;
                const isDeploying = deployingId === key;
                const badge = getBadge(item.type);

                return (
                  <tr key={key} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors">
                    <td className="py-2 px-4 font-mono text-xs text-brand-400">#{item.id}</td>
                    <td className="py-2 px-4">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[0.6rem] font-semibold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-xs leading-relaxed max-w-md truncate">
                      {item.title || <em className="text-surface-600">[Empty]</em>}
                    </td>
                    <td className="py-2 px-4 text-[0.65rem] text-surface-500 font-mono">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : '—'}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => handleDeploy(item.id, item.type, item.title)}
                        disabled={isDeploying}
                        className={`px-3 py-1 rounded text-[0.65rem] font-semibold transition-all ${
                          isDeploying
                            ? 'bg-surface-700 text-surface-500 cursor-not-allowed'
                            : 'bg-brand-700 hover:bg-brand-600 text-white active:scale-95'
                        }`}
                      >
                        {isDeploying ? '...' : 'Go Live'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
