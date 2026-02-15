'use client';

import { useState } from 'react';
import AgentActivityMonitor from '@/components/AgentActivityMonitor';
import AgentDetailPanel from '@/components/AgentDetailPanel';
import CRMOverview from '@/components/CRMOverview';
import ProjectStatusBoard from '@/components/ProjectStatusBoard';
import ActivityFeed from '@/components/ActivityFeed';
import LiveLogStream from '@/components/LiveLogStream';
import { useCRMData } from '@/hooks/useCRMData';
import { useAgentDetail } from '@/hooks/useAgentDetail';
import { useLiveLogs } from '@/hooks/useLiveLogs';
import { useMessages } from '@/hooks/useMessages';

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('Nova');
  const { data, loading, error } = useCRMData();
  const agentDetail = useAgentDetail(selectedAgent);
  const liveLogs = useLiveLogs();
  const messages = useMessages(selectedAgent);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">TsvWeb Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Real-time operations monitor</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Agent Activity</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-gray-400">Live data</span>
          </div>
          <AgentActivityMonitor
            darkMode={darkMode}
            selectedAgent={selectedAgent}
            onSelect={setSelectedAgent}
          />
          <AgentDetailPanel
            darkMode={darkMode}
            agentName={selectedAgent}
            detail={agentDetail.detail}
            loading={agentDetail.loading}
            error={agentDetail.error}
            messages={messages.messages}
            messageLoading={messages.loading}
            sending={messages.sending}
            onSendMessage={messages.sendMessage}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">CRM Overview</h2>
          <CRMOverview darkMode={darkMode} loading={loading} data={data ?? undefined} error={error} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
            <ProjectStatusBoard darkMode={darkMode} />
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>
            <ActivityFeed darkMode={darkMode} activities={data?.activityFeed} loading={loading} />
          </section>
        </div>

        <section>
          <LiveLogStream
            darkMode={darkMode}
            logs={liveLogs.logs}
            spreadsheet={liveLogs.spreadsheet}
            loading={liveLogs.loading}
            error={liveLogs.error}
            lastSynced={liveLogs.lastSynced}
          />
        </section>
      </main>
    </div>
  );
}
