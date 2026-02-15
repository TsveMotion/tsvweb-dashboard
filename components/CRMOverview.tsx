'use client';

import type { CrmResponse } from '@/lib/crm';

const defaultLeadBreakdown = [
  { label: 'New', value: 47, color: '#93C572' },
  { label: 'Contacted', value: 32, color: '#FFD166' },
  { label: 'Qualified', value: 26, color: '#EF476F' },
];

const defaultFollowUps = [
  { label: 'Due this week', value: 9, descriptor: 'Next sync in 04:20 mins' },
  { label: 'Overdue', value: 2, descriptor: 'Needs follow-up' },
];

type CRMOverviewProps = {
  darkMode: boolean;
  loading: boolean;
  data?: CrmResponse;
  error?: string;
};

function formatValue(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

export default function CRMOverview({ darkMode, loading, data, error }: CRMOverviewProps) {
  const metrics = [
    {
      label: 'Total Leads',
      value: loading ? '—' : formatValue(data?.metrics.totalLeads ?? 0),
      helper: loading ? 'Syncing CRM…' : `${data?.metrics.newLeadsThisWeek ?? 0} new this week`,
    },
    {
      label: 'Active Clients',
      value: loading ? '—' : formatValue(data?.metrics.activeClients ?? 0),
      helper:
        loading || data?.metrics.activeClients === undefined
          ? 'Syncing…'
          : data.metrics.activeClients > 0
          ? 'Keeping the roster happy'
          : 'Onboarding soon',
    },
    {
      label: 'Deals in Pipeline',
      value: loading ? '—' : formatValue(data?.metrics.pipelineDeals ?? 0),
      helper:
        loading
          ? 'Syncing…'
          : data
          ? data.metrics.pipelineDeals
            ? `$${(data.metrics.pipelineValue / 1000).toFixed(1)}K estimated value`
            : 'No live pipeline entries'
          : 'No live data yet',
    },
  ];

  const breakdown = data?.leadBreakdown ?? defaultLeadBreakdown;
  const followUps = data?.followUps ?? defaultFollowUps;
  const totalBreakdown = Math.max(
    breakdown.reduce((sum, item) => sum + item.value, 0),
    1,
  );

  return (
    <div
      className={`rounded-3xl border p-6 space-y-6 transition-colors ${
        darkMode
          ? 'bg-gray-900 border-gray-800 text-white'
          : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-2xl p-4 border ${
              darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{metric.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{metric.helper}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="text-xs text-rose-400">Live CRM feed is unavailable. Showing cached layout.</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-300">
              Lead Breakdown
            </h3>
            <span className="text-xs text-gray-400">Updated now</span>
          </div>
          <div className="space-y-2">
            {breakdown.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{item.label}</span>
                  <span>{item.value} leads</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((item.value / totalBreakdown) * 100, 100)}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border p-4 space-y-4 border-dashed border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Follow-ups</h3>
          {followUps.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-lg font-semibold text-[#93C572]">{item.value}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
            {followUps[0]?.descriptor ?? 'Syncing soon'}
          </div>
        </div>
      </div>
    </div>
  );
}
