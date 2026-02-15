import type { CrmLead, ActivityItem } from '@/lib/crm';
import { formatRelativeTime } from '@/lib/crm';
import { slugify } from '@/lib/utils';

export interface AgentProfile {
  name: string;
  slug: string;
  role: string;
  focus: string;
  timezone: string;
  highlight: string;
  keywords: string[];
}

export interface AgentTaskItem {
  title: string;
  status: string;
  nextAction: string;
  due: string;
}

export interface AgentLeadSummary {
  businessName: string;
  status?: string;
  nextAction?: string;
  followUpDate?: string;
}

export interface AgentDetailPayload {
  profile: AgentProfile;
  liveTasks: AgentTaskItem[];
  recentActions: ActivityItem[];
  topLeads: AgentLeadSummary[];
  metrics: {
    leadsOwned: number;
    followUps: number;
  };
  lastSynced: string;
}

const baseAgents: Omit<AgentProfile, 'slug'>[] = [
  {
    name: 'Nova',
    role: 'Operations Director',
    focus: 'Coordinating agent workloads + CRM accuracy',
    timezone: 'UTC',
    highlight: 'Keeping everybody aligned',
    keywords: ['nova', 'operations', 'coordination', 'team'],
  },
  {
    name: 'Hunter',
    role: 'Lead Researcher',
    focus: 'Hunting high-value salon prospects',
    timezone: 'GMT+1',
    highlight: 'Running nightly outreach cadences',
    keywords: ['hunter', 'luxury', 'outreach', 'prospecting'],
  },
  {
    name: 'Sales',
    role: 'Head of Sales',
    focus: 'Closing pipeline deals and follow-ups',
    timezone: 'GMT',
    highlight: 'Driving weekly pipe review',
    keywords: ['sales', 'deal', 'closing', 'pipeline'],
  },
  {
    name: 'PM',
    role: 'Project Manager',
    focus: 'Delivering sprints and coordinating agents',
    timezone: 'GMT+0',
    highlight: 'Keeping engineering on schedule',
    keywords: ['pm', 'project', 'dashboard', 'delivery'],
  },
  {
    name: 'Dev',
    role: 'Engineering Lead',
    focus: 'Keeping the dashboard secure and tuned',
    timezone: 'GMT+0',
    highlight: 'Implementing rate limits and detail views',
    keywords: ['dev', 'engineer', 'code', 'security'],
  },
  {
    name: 'Tutor',
    role: 'Training Specialist',
    focus: 'Mentoring agents and calibrating KPIs',
    timezone: 'UTC',
    highlight: 'Running coaching loops',
    keywords: ['tutor', 'training', 'coach'],
  },
];

export const AGENT_PROFILES: AgentProfile[] = baseAgents.map((agent) => ({
  ...agent,
  slug: slugify(agent.name),
}));

export function buildAgentDetail(agentName: string, leads: CrmLead[]): AgentDetailPayload {
  const slug = slugify(agentName);
  const profile = AGENT_PROFILES.find((entry) => entry.slug === slug) ?? AGENT_PROFILES[0];

  const normalizedKeywords = profile.keywords.map((keyword) => keyword.toLowerCase());

  const filteredLeads = leads.filter((lead) => {
    const haystack = [lead.businessName, lead.contactName, lead.notes, lead.status, lead.source]
      .join(' ')
      .toLowerCase();
    return normalizedKeywords.some((keyword) => haystack.includes(keyword));
  });

  const leadPool = filteredLeads.length ? filteredLeads : leads;

  const liveTasks = leadPool.slice(0, 3).map((lead) => ({
    title: lead.businessName,
    status: lead.status || 'Awaiting update',
    nextAction: lead.nextAction || 'Discuss next steps',
    due: lead.followUpDate
      ? new Date(lead.followUpDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      : 'TBD',
  }));

  const followUps = leadPool.filter((lead) => Boolean(lead.followUpDate)).length;

  const recentActions = leadPool
    .sort((a, b) => {
      const aTime = new Date(a.dateAdded || a.followUpDate || Date.now()).getTime();
      const bTime = new Date(b.dateAdded || b.followUpDate || Date.now()).getTime();
      return bTime - aTime;
    })
    .slice(0, 4)
    .map((lead) => ({
      title: `${lead.status ?? 'CRM update'} · ${lead.businessName}`,
      agent: agentName,
      detail: lead.notes || lead.nextAction || lead.businessType || 'Live coordination',
      time: formatRelativeTime(lead.dateAdded || lead.followUpDate),
      tag: lead.status || 'CRM',
    }));

  const topLeads = leadPool.slice(0, 4).map((lead) => ({
    businessName: lead.businessName,
    status: lead.status,
    nextAction: lead.nextAction,
    followUpDate: lead.followUpDate,
  }));

  return {
    profile,
    liveTasks,
    recentActions,
    topLeads,
    metrics: {
      leadsOwned: leadPool.length,
      followUps,
    },
    lastSynced: new Date().toISOString(),
  };
}
