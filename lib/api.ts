// ── Island API helpers — all localhost, zero cloud ──

const ENGINE = 'http://127.0.0.1:3002';

export interface LedgerItem {
  id: number;
  title: string | null;
  timestamp: string;
  type: string;
  status: string;
}

export interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'error';
  pid: number | null;
  uptime: string;
  memory: string;
}

export interface LogLine {
  timestamp: string;
  level: string;
  message: string;
}

export async function fetchLedger(limit = 50): Promise<LedgerItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${ENGINE}/api/slate/ledger`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchServiceStatus(): Promise<ServiceStatus[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${ENGINE}/api/status`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Transform status response into service cards
    const services: ServiceStatus[] = [
      {
        name: 'Director Backend',
        status: 'online',
        pid: null,
        uptime: 'active',
        memory: '',
      },
      {
        name: 'ZeroClaw Gateway',
        status: data?.gateway_port ? 'online' : 'offline',
        pid: null,
        uptime: `port ${data?.gateway_port || '?'}`,
        memory: '',
      },
      {
        name: 'Ollama',
        status: 'online',
        pid: null,
        uptime: ':11434',
        memory: '',
      },
      {
        name: 'Postgres Ledger',
        status: 'online',
        pid: null,
        uptime: ':5433',
        memory: '',
      },
    ];
    return services;
  } catch {
    // Return offline state if engine unreachable
    return [
      { name: 'Director Backend', status: 'offline', pid: null, uptime: 'unreachable', memory: '' },
    ];
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchRecentLogs(limit = 20): Promise<LogLine[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${ENGINE}/api/webhook/zeroclaw-audit?limit=${limit}`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.entries || [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function triggerDeploy(id: number, type: string, title: string | null): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${ENGINE}/api/publish_auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, title, timestamp: new Date().toISOString() }),
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
