'use client';

import { useEffect, useState } from 'react';
import { slugify } from '@/lib/utils';
import type { AgentDetailPayload } from '@/lib/agents';

const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_DASHBOARD_API_KEY;

interface AgentDetailState {
  detail: AgentDetailPayload | null;
  loading: boolean;
  error?: string;
}

export function useAgentDetail(agentName: string | null) {
  const [state, setState] = useState<AgentDetailState>({ detail: null, loading: false });

  useEffect(() => {
    if (!agentName) {
      setState({ detail: null, loading: false });
      return;
    }

    let cancelled = false;
    const slug = slugify(agentName);

    async function load() {
      setState({ detail: null, loading: true });

      try {
        const headers: Record<string, string> = {};
        if (PUBLIC_API_KEY) {
          headers['x-dashboard-api-key'] = PUBLIC_API_KEY;
        }

        const response = await fetch(`/api/agents/${slug}`, { headers });
        if (!response.ok) {
          throw new Error('Unable to load agent detail');
        }

        const payload = await response.json();
        if (!cancelled) {
          setState({ detail: payload, loading: false });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ detail: null, loading: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [agentName]);

  return state;
}
