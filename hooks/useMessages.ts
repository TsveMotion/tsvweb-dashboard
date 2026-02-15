'use client';

import { useEffect, useMemo, useState } from 'react';

const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_DASHBOARD_API_KEY;

export interface MessageEntry {
  id: string;
  from: string;
  to: string;
  message: string;
  time: string;
}

interface UseMessagesState {
  messages: MessageEntry[];
  loading: boolean;
  error?: string;
  sending: boolean;
}

export function useMessages(agentName: string | null) {
  const [state, setState] = useState<UseMessagesState>({
    messages: [],
    loading: false,
    sending: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const headers: Record<string, string> = {};
        if (PUBLIC_API_KEY) {
          headers['x-dashboard-api-key'] = PUBLIC_API_KEY;
        }

        const response = await fetch('/api/messages', { headers });
        if (!response.ok) {
          throw new Error('Unable to load messages');
        }

        const payload = await response.json();
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            messages: payload.messages ?? [],
            loading: false,
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load messages',
          }));
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [agentName]);

  const messagesForAgent = useMemo(() => {
    if (!agentName) return [];
    const lower = agentName.toLowerCase();
    return state.messages.filter(
      (message) => message.to.toLowerCase().includes(lower) || message.from.toLowerCase().includes(lower),
    );
  }, [state.messages, agentName]);

  async function sendMessage(text: string) {
    if (!agentName) return;
    setState((prev) => ({ ...prev, sending: true }));

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (PUBLIC_API_KEY) {
        headers['x-dashboard-api-key'] = PUBLIC_API_KEY;
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({ from: 'You', to: agentName, message: text }),
      });

      if (!response.ok) {
        throw new Error('Unable to send message');
      }

      const payload = await response.json();
      setState((prev) => ({
        ...prev,
        messages: payload.messages ?? prev.messages,
        sending: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        sending: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      }));
    }
  }

  return {
    ...state,
    messages: messagesForAgent,
    sendMessage,
  };
}
