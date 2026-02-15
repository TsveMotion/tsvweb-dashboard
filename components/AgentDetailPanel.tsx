'use client';

import { useMemo, useState } from 'react';
import type { AgentDetailPayload } from '@/lib/agents';
import type { MessageEntry } from '@/hooks/useMessages';

type AgentDetailPanelProps = {
  darkMode: boolean;
  agentName: string | null;
  detail: AgentDetailPayload | null;
  loading: boolean;
  error?: string;
  messages: MessageEntry[];
  messageLoading: boolean;
  onSendMessage: (text: string) => void;
  sending: boolean;
};

export default function AgentDetailPanel({
  darkMode,
  agentName,
  detail,
  loading,
  error,
  messages,
  messageLoading,
  onSendMessage,
  sending,
}: AgentDetailPanelProps) {
  const [draft, setDraft] = useState('');

  const actionItems = detail?.liveTasks ?? [];
  const recentActions = detail?.recentActions ?? [];

  const summary = useMemo(() => {
    if (!detail) {
      return 'Select an agent to review their latest workstream and messages.';
    }
    return `${detail.metrics.leadsOwned} leads, ${detail.metrics.followUps} follow-ups in progress.`;
  }, [detail]);

  const canSend = Boolean(draft.trim()) && !sending && Boolean(agentName);

  return (
    <div
      className={`rounded-3xl border p-6 space-y-6 transition-colors sm:space-y-8 ${
        darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400">Agent detail view</p>
            <h3 className="text-xl font-semibold">{agentName ?? 'Pick an agent'}</h3>
          </div>
          <span className="text-xs text-gray-400">Live CRM backed</span>
        </div>
        {detail?.profile && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {detail.profile.role} · {detail.profile.focus} · {detail.profile.timezone}
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400">{error ?? summary}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`rounded-2xl border p-4 ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-gray-50'}`}>
          <h4 className="text-sm font-semibold text-gray-400">Live tasks</h4>
          <div className="mt-3 space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500">Loading tasks…</p>
            ) : actionItems.length ? (
              actionItems.map((task) => (
                <div key={`${task.title}-${task.status}`} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{task.status}</span>
                    <span className="text-xs text-[#93C572]">Due {task.due}</span>
                  </div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.nextAction}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No live tasks yet.</p>
            )}
          </div>
        </div>
        <div className={`rounded-2xl border p-4 ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-gray-50'}`}>
          <h4 className="text-sm font-semibold text-gray-400">Communication</h4>
          <div className="mt-3 space-y-3 max-h-40 overflow-y-auto">
            {messageLoading ? (
              <p className="text-sm text-gray-500">Pulling recent messages…</p>
            ) : messages.length ? (
              messages.map((message) => (
                <div key={message.id} className="text-sm text-gray-500">
                  <p>
                    <span className="font-semibold text-gray-900 dark:text-white">{message.from}</span>{' '}
                    ↔ <span className="font-semibold text-[#93C572]">{message.to}</span>
                  </p>
                  <p>{message.message}</p>
                  <p className="text-xs text-gray-400">{new Date(message.time).toLocaleTimeString()}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No messages yet.</p>
            )}
          </div>
        </div>
        <div className={`rounded-2xl border p-4 ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-gray-50'}`}>
          <h4 className="text-sm font-semibold text-gray-400">Send a note</h4>
          <textarea
            className={`w-full mt-3 p-3 rounded-xl border ${
              darkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-900'
            }`}
            rows={4}
            placeholder={agentName ? `Tell ${agentName} what you need…` : 'Select an agent first'}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!agentName}
          />
          <button
            className={`mt-3 w-full rounded-2xl px-4 py-2 font-semibold transition-colors disabled:opacity-60 ${
              darkMode
                ? 'bg-[#93C572] text-gray-900 hover:bg-[#7fb75a]'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
            disabled={!canSend}
            onClick={() => {
              if (!canSend) return;
              onSendMessage(draft.trim());
              setDraft('');
            }}
          >
            {sending ? 'Sending…' : 'Send message'}
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border p-4 ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-gray-50'}`}>
        <h4 className="text-sm font-semibold text-gray-400">Latest actions</h4>
        <div className="mt-3 space-y-3">
          {loading ? (
            <p className="text-sm text-gray-500">Loading actions…</p>
          ) : recentActions.length ? (
            recentActions.map((action) => (
              <div key={action.title} className="text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-gray-400">{action.tag}</span>
                  <span className="text-xs text-gray-400">{action.time}</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">{action.title}</p>
                <p className="text-gray-500 dark:text-gray-300">{action.detail}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent actions synced yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
