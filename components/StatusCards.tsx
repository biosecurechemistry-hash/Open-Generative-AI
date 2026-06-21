'use client';

import React, { useEffect, useState } from 'react';
import { fetchServiceStatus, type ServiceStatus } from '../lib/api';

export default function StatusCards() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceStatus()
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetchServiceStatus()
        .then(setServices)
        .catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const statusDot = (status: string) => {
    switch (status) {
      case 'online':
        return <span className="w-2 h-2 rounded-full bg-brand-500 inline-block mr-2" />;
      case 'offline':
        return <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-2" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-2" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-surface-800 rounded-lg p-4 h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {services.map((svc) => (
        <div
          key={svc.name}
          className={`rounded-lg p-4 border transition-colors ${
            svc.status === 'online'
              ? 'bg-surface-900/50 border-brand-800/50'
              : 'bg-surface-900/50 border-red-800/50'
          }`}
        >
          <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1">
            {statusDot(svc.status)}
            {svc.status}
          </div>
          <div className="text-sm font-medium text-surface-100 truncate">{svc.name}</div>
          <div className="text-xs text-surface-500 mt-1 font-mono">{svc.uptime}</div>
        </div>
      ))}
    </div>
  );
}
