'use client';

import { useEffect, useState } from 'react';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_DASHBOARD_API_KEY;

export interface LiveLogEntry {
  id: string;
  title: string;
  agent: string;
  detail: string;
  time: string;
  tag: string;
  source: string;
}

export interface SpreadsheetRow {
  business: string;
  status: string;
  nextAction: string;
  followUp: string;
}

interface LiveLogState {
  logs: LiveLogEntry[];
  spreadsheet: SpreadsheetRow[];
  loading: boolean;
  error?: string;
  lastSynced?: string;
}

export function useLiveLogs(pollMs = 10000) {
  const [state, setState] = useState<LiveLogState>({
    logs: [],
    spreadsheet: [],
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((previous) => ({ ...previous, loading: true }));
      try {
        const headers: Record<string, string> = {};
        if (PUBLIC_KEY) {
          headers['x-dashboard-api-key'] = PUBLIC_KEY;
        }

        const response = await fetch('/api/logs', { headers });
        if (!response.ok) {
          throw new Error('Unable to stream logs');
        }

        const payload = await response.json();
        if (!cancelled) {
          setState({
            logs: payload.logs ?? [],
            spreadsheet: payload.spreadsheetSnapshot ?? [],
            loading: false,
            lastSynced: payload.lastSynced,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error: error instanceof Error ? error.message : 'Stream failed',
          }));
        }
      }
    }

    load();
    const interval = setInterval(load, pollMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pollMs]);

  return state;
}
