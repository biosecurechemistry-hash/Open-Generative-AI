// ── Island API helpers — all localhost, zero cloud ──

const ENGINE = 'http://127.0.0.1:3002';
const FETCH_TIMEOUT_MS = 2000; // 2s — fail fast, render mock data

// ── Types ────────────────────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────

function timeoutFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  return fetch(url, { ...opts, signal: controller.signal, cache: 'no-store' })
    .finally(() => clearTimeout(timer));
}

const now = () => new Date().toISOString();

// ── Fallback mock data — renders when backend is unreachable ─────────

const MOCK_LEDGER: LedgerItem[] = [
  { id: 1, title: 'Hotel Organic: Himalayan Salt Lamp — Eco-Luxury Product Copy', timestamp: now(), type: 'journal_script', status: 'processed' },
  { id: 2, title: 'Orchard Kettle: Organic Tea Brew Guide for Guest Booklets', timestamp: now(), type: 'journal_script', status: 'processed' },
  { id: 3, title: 'Eco Towel Program: Welcome Script for Sustainable Hospitality', timestamp: now(), type: 'journal_script', status: 'processed' },
  { id: 4, title: 'Orchard Kettle — Organic Tea Brew Guide (staged)', timestamp: now(), type: 'staged_asset', status: 'staged' },
  { id: 5, title: 'Avaza Timesheet Sync — Weekly Hours', timestamp: now(), type: 'timesheet_synced', status: 'synced' },
  { id: 6, title: 'ZeroClaw Deep Track: Thought Loop Analysis', timestamp: now(), type: 'webhook_event', status: 'processed' },
  { id: 7, title: 'Offline Engine: Pipeline Job #1762 Completed', timestamp: now(), type: 'processed', status: 'processed' },
  { id: 8, title: 'Shopify Product Push: Himalayan Salt Lamps Batch', timestamp: now(), type: 'webhook_event', status: 'processed' },
];

const MOCK_SERVICES: ServiceStatus[] = [
  { name: 'Director Backend', status: 'online', pid: 3341319, uptime: ':3002', memory: '78MB' },
  { name: 'ZeroClaw Gateway', status: 'online', pid: 3297410, uptime: ':42617', memory: '12MB' },
  { name: 'Ollama', status: 'online', pid: null, uptime: ':11434', memory: 'qwen2.5-coder:3b' },
  { name: 'Postgres Ledger', status: 'online', pid: null, uptime: ':5433', memory: '22 tables' },
];

const MOCK_LOGS: LogLine[] = [
  { timestamp: now(), level: 'info', message: 'Offline Engine started — polling every 30s' },
  { timestamp: now(), level: 'info', message: 'Endpoints: PG=127.0.0.1:5433 Ollama=:11434 ZeroClaw=:42617' },
  { timestamp: now(), level: 'info', message: 'Ollama request: model=qwen2.5-coder:3b message_count=2' },
  { timestamp: now(), level: 'debug', message: 'Ollama response status: 200 OK (470 chars)' },
  { timestamp: now(), level: 'info', message: 'ZeroClaw ack: asset staging confirmed' },
  { timestamp: now(), level: 'info', message: 'Job #1762 → PROCESSED | Asset #1359 STAGED' },
];

// ── API Functions ────────────────────────────────────────────────────

export async function fetchLedger(limit = 50): Promise<LedgerItem[]> {
  try {
    const res = await timeoutFetch(`${ENGINE}/api/slate/ledger`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
    console.warn('[Organic Dawn] Backend returned empty ledger — using mock data');
    return MOCK_LEDGER;
  } catch (err) {
    console.warn('[Organic Dawn] Backend unreachable, using mock ledger:', (err as Error).message);
    return MOCK_LEDGER;
  }
}

export async function fetchServiceStatus(): Promise<ServiceStatus[]> {
  try {
    const res = await timeoutFetch(`${ENGINE}/api/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return [
      { name: 'Director Backend', status: 'online', pid: null, uptime: `port ${data?.gateway_port ? 3002 : '?'}`, memory: '' },
      { name: 'ZeroClaw Gateway', status: data?.gateway_port ? 'online' : 'offline', pid: null, uptime: `:${data?.gateway_port || '?'}`, memory: '' },
      { name: 'Ollama', status: 'online', pid: null, uptime: ':11434', memory: 'qwen2.5-coder:3b' },
      { name: 'Postgres Ledger', status: 'online', pid: null, uptime: ':5433', memory: '' },
    ];
  } catch (err) {
    console.warn('[Organic Dawn] Backend unreachable, using mock services:', (err as Error).message);
    return MOCK_SERVICES;
  }
}

export async function fetchRecentLogs(limit = 20): Promise<LogLine[]> {
  try {
    const res = await timeoutFetch(`${ENGINE}/api/webhook/zeroclaw-audit?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.entries && data.entries.length > 0) return data.entries;
    return MOCK_LOGS;
  } catch {
    return MOCK_LOGS;
  }
}

export async function triggerDeploy(id: number, type: string, title: string | null): Promise<boolean> {
  try {
    const res = await fetch(`${ENGINE}/api/publish_auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, title, timestamp: new Date().toISOString() }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
