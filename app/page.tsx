'use client';

import { useState } from 'react';
import AgentActivityMonitor from '@/components/AgentActivityMonitor';
import CRMOverview from '@/components/CRMOverview';
import ProjectStatusBoard from '@/components/ProjectStatusBoard';
import ActivityFeed from '@/components/ActivityFeed';
import { useCRMData } from '@/hooks/useCRMData';

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const { data, loading, error } = useCRMData();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Agent Activity Monitor */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Agent Activity</h2>
            <AgentActivityMonitor darkMode={darkMode} />
          </section>

          {/* CRM Overview */}
          <section>
            <h2 className="text-xl font-semibold mb-4">CRM Overview</h2>
            <CRMOverview darkMode={darkMode} loading={loading} data={data ?? undefined} error={error} />
          </section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Status Board */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
              <ProjectStatusBoard darkMode={darkMode} />
            </section>

            {/* Activity Feed */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>
              <ActivityFeed darkMode={darkMode} activities={data?.activityFeed} loading={loading} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
