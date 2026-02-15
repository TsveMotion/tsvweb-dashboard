'use client';

import type { LiveLogEntry, SpreadsheetRow } from '@/hooks/useLiveLogs';

type LiveLogStreamProps = {
  darkMode: boolean;
  logs: LiveLogEntry[];
  spreadsheet: SpreadsheetRow[];
  loading: boolean;
  error?: string;
  lastSynced?: string;
};

export default function LiveLogStream({ darkMode, logs, spreadsheet, loading, error, lastSynced }: LiveLogStreamProps) {
  const textTone = darkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div
      className={`rounded-3xl border p-6 space-y-6 transition-colors ${
        darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">Live stream</p>
          <h3 className="text-xl font-semibold">Activity + sheet stream</h3>
        </div>
        <span className="text-xs text-gray-400">{lastSynced ? `Synced ${new Date(lastSynced).toLocaleTimeString()}` : 'syncing…'}</span>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={`rounded-2xl border p-4 ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-500">Activity log</h4>
            <span className="text-xs text-gray-400">Streaming</span>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-gray-500">Receiving live updates…</p>
            ) : logs.length ? (
              logs.map((log) => (
                <div key={log.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{log.agent}</span>
                    <span>{log.time}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.title}</p>
                  <p className={`text-sm ${textTone}`}>{log.detail}</p>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{log.tag}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Waiting for activity…</p>
            )}
          </div>
        </div>

        <div className={`rounded-2xl border p-4 ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-500">Spreadsheet snapshot</h4>
            <span className="text-xs text-gray-400">Live rows</span>
          </div>
          <div className="space-y-2 overflow-auto max-h-60">
            {loading ? (
              <p className="text-sm text-gray-500">Syncing spreadsheet…</p>
            ) : spreadsheet.length ? (
              spreadsheet.map((row) => (
                <div key={`${row.business}-${row.followUp}`} className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <span className="font-semibold text-gray-900 dark:text-white">{row.business}</span>
                  <span className="text-right">{row.status}</span>
                  <span>{row.nextAction}</span>
                  <span className="text-right text-[#93C572]">Follow-up {row.followUp}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Waiting for CRM rows…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
