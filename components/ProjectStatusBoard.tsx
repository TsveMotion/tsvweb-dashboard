'use client';

const projects = [
  {
    name: 'TsvWeb Dashboard',
    client: 'Internal',
    progress: 68,
    deadline: 'Feb 25, 2026',
    countdown: '10d',
    status: 'On Track',
    milestone: 'Integrate Google Sheets data',
  },
  {
    name: 'Revolution Hair',
    client: 'Revolution Hair Studio',
    progress: 82,
    deadline: 'Feb 20, 2026',
    countdown: '5d',
    status: 'At Risk',
    milestone: 'Finalize booking flow',
  },
  {
    name: 'Aurora Med Spa',
    client: 'Aurora Medical Spa',
    progress: 56,
    deadline: 'Mar 05, 2026',
    countdown: '19d',
    status: 'On Track',
    milestone: 'Launch marketing site',
  },
  {
    name: 'BrightSide Labs',
    client: 'BrightSide Labs',
    progress: 33,
    deadline: 'Mar 12, 2026',
    countdown: '26d',
    status: 'Delayed',
    milestone: 'Prototype scheduling API',
  },
];

const statusColors: Record<string, string> = {
  'On Track': 'text-[#93C572]',
  'At Risk': 'text-amber-400',
  Delayed: 'text-rose-500',
};

export default function ProjectStatusBoard({ darkMode }: { darkMode: boolean }) {
  return (
    <div className={`space-y-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {projects.map((project) => (
        <div
          key={project.name}
          className={`rounded-3xl border p-5 shadow-sm transition-colors ${
            darkMode
              ? 'bg-gray-900 border-gray-800 shadow-gray-900/30'
              : 'bg-white border-gray-200 shadow-gray-200/60'
          }`}
        >
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{project.client}</p>
              <h3 className="text-lg font-semibold">{project.name}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Deadline</p>
              <p className="font-medium">{project.deadline}</p>
              <span className="text-xs text-gray-400">{project.countdown} left</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Progress</span>
              <span className="font-semibold">{project.progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 mt-2">
              <div
                className="h-full rounded-full bg-[#93C572]"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span
              className={`font-semibold ${statusColors[project.status] ?? 'text-white'}`}
            >
              {project.status}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">Next: {project.milestone}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
