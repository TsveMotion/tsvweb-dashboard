'use client';

import { useEffect, useState } from 'react';
import type { CrmResponse } from '@/lib/crm';

interface UseCRMDataState {
  data: CrmResponse | null;
  loading: boolean;
  error?: string;
}

export function useCRMData() {
  const [state, setState] = useState<UseCRMDataState>({
    data: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch('/api/crm');
        if (!response.ok) {
          throw new Error('CRM service unavailable');
        }

        const payload: CrmResponse | { error?: string } = await response.json();

        if ('error' in payload && payload.error) {
          throw new Error(payload.error);
        }

        if (!cancelled) {
          setState({ data: payload as CrmResponse, loading: false });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load CRM data',
          });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
