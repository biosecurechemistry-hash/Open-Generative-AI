import StatusCards from '../components/StatusCards';
import JobGrid from '../components/JobGrid';
import LogTerminal from '../components/LogTerminal';

export default function Home() {
  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      {/* ── Header ── */}
      <header className="mb-8 pb-6 border-b border-surface-700">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-3 h-3 rounded-full bg-brand-500 animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Organic Dawn</h1>
        </div>
        <p className="text-surface-400 text-sm">
          Island Dashboard · Engine :3002 · Model :11434 · Gateway :42617
        </p>
      </header>

      {/* ── Status Cards: PM2 processes + systemd state ── */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-3">
          Infrastructure Status
        </h2>
        <StatusCards />
      </section>

      {/* ── Two-column: Jobs + Terminal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Job Grid — spans 2 cols on desktop */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-3">
            Pipeline Jobs
          </h2>
          <JobGrid />
        </div>

        {/* Log Terminal — 1 col */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-3">
            Runtime Trace
          </h2>
          <LogTerminal />
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="mt-12 pt-6 border-t border-surface-800 text-center text-xs text-surface-600">
        Organic Dawn v2.0 · Island Infrastructure · Zero cloud dependencies ·{' '}
        <a href="http://127.0.0.1:42617" target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">
          ZeroClaw
        </a>
        {' · '}
        <a href="http://127.0.0.1:3335" target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">
          Open WebUI
        </a>
        {' · '}
        <a href="http://127.0.0.1:3334/en" target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">
          Ghostfolio
        </a>
      </footer>
    </main>
  );
}
