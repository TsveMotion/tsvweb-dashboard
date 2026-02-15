'use client';

import { useState, useEffect } from 'react';

interface Agent {
  name: string;
  status: 'active' | 'idle';
  currentTask: string;
  lastActivity: string;
  tasksCompletedToday: number;
  tasksPerDay: number;
  successRate: number;
}

const mockAgents: Agent[] = [
  {
    name: 'Nova',
    status: 'active',
    currentTask: 'Coordinating team activities',
    lastActivity: '2 min ago',
    tasksCompletedToday: 12,
    tasksPerDay: 45,
    successRate: 98,
  },
  {
    name: 'Hunter',
    status: 'active',
    currentTask: 'Researching luxury beauty leads',
    lastActivity: '5 min ago',
    tasksCompletedToday: 8,
    tasksPerDay: 25,
    successRate: 92,
  },
  {
    name: 'Sales',
    status: 'active',
    currentTask: 'Following up with Revolution Hair',
    lastActivity: '1 min ago',
    tasksCompletedToday: 6,
    tasksPerDay: 18,
    successRate: 85,
  },
  {
    name: 'PM',
    status: 'active',
    currentTask: 'Building TsvWeb Dashboard',
    lastActivity: 'Just now',
    tasksCompletedToday: 3,
    tasksPerDay: 15,
    successRate: 95,
  },
  {
    name: 'Dev',
    status: 'idle',
    currentTask: 'Awaiting next task',
    lastActivity: '15 min ago',
    tasksCompletedToday: 5,
    tasksPerDay: 12,
    successRate: 99,
  },
  {
    name: 'Tutor',
    status: 'idle',
    currentTask: 'Standby',
    lastActivity: '1 hour ago',
    tasksCompletedToday: 2,
    tasksPerDay: 8,
    successRate: 97,
  },
];

export default function AgentActivityMonitor({ darkMode }: { darkMode: boolean }) {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);

  useEffect(() => {
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      // In production, fetch from API
      // For now, just update timestamps
      setAgents(prev => prev.map(agent => ({
        ...agent,
        // Simulate activity updates
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <div
          key={agent.name}
          className={`p-4 rounded-lg border ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          } hover:shadow-lg transition-shadow`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={agent.status === 'active' ? 'text-2xl' : 'text-2xl opacity-50'}>
                {agent.status === 'active' ? '🟢' : '⚪'}
              </span>
              <h3 className="font-semibold text-lg">{agent.name}</h3>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded ${
                agent.status === 'active'
                  ? 'bg-[#93C572] text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {agent.status}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Current Task:</p>
              <p className="font-medium">{agent.currentTask}</p>
            </div>

            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Last Activity:</span>
              <span className="font-medium">{agent.lastActivity}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Completed Today:</span>
              <span className="font-bold text-[#93C572]">{agent.tasksCompletedToday}</span>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Avg/day:</span>
                <span>{agent.tasksPerDay}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Success rate:</span>
                <span className="text-[#93C572]">{agent.successRate}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
