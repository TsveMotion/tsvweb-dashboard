'use client';

const activities = [
  {
    title: 'CRM sync completed',
    agent: 'Sales',
    detail: 'Imported 12 new leads from the sheets feed and queued follow-ups.',
    time: 'Just now',
    tag: 'CRM',
  },
  {
    title: 'Campaign review scheduled',
    agent: 'PM',
    detail: 'Sent calendar invite for Rev Hair campaign review at 3:30 PM.',
    time: '5 min ago',
    tag: 'Calendar',
  },
  {
    title: 'Docs update',
    agent: 'Dev',
    detail: 'Prepared endpoint specs for the dashboard polling API.',
    time: '18 min ago',
    tag: 'Engineering',
  },
  {
    title: 'Lead outreach',
    agent: 'Hunter',
    detail: 'Reached out to 4 salon leads with follow-up sequences.',
    time: '42 min ago',
    tag: 'Outreach',
  },
];

export default function ActivityFeed({ darkMode }: { darkMode: boolean }) {
  return (
    <div
      className={`rounded-3xl border p-5 space-y-4 transition-colors ${
        darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      {activities.map((activity) => (
        <div key={activity.title} className="flex gap-3">
          <div
            className={`w-2 h-10 rounded-full ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            } flex-shrink-0`}
          />
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{activity.time}</span>
              <span className="px-2 py-1 rounded-full text-[11px] uppercase tracking-[0.2em] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {activity.tag}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">{activity.title}</h3>
              <span className="text-xs font-semibold text-[#93C572]">{activity.agent}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
