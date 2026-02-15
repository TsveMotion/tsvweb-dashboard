import Papa from 'papaparse';

const DEFAULT_SHEET_ID = '1X9AiH3AYbsSnRpM7REIItFabGeVsL3Lsgh04M2EcE-4';
const SHEET_ID = process.env.CRM_SHEET_ID ?? DEFAULT_SHEET_ID;
const SHEETS_EXPORT_URL =
  process.env.CRM_SHEETS_EXPORT_URL ??
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

const PRIORITY_WEIGHTS: Record<string, number> = {
  high: 25000,
  medium: 14000,
  low: 8000,
};
const ACTIVE_KEYWORDS = ['active', 'client', 'won', 'booked', 'signed'];
const PIPELINE_KEYWORDS = ['contact', 'pipeline', 'proposal', 'new', 'pitch', 'in progress', 'follow'];
const COLOR_PALETTE = ['#93C572', '#FFD166', '#EF476F', '#3B82F6', '#6366F1'];

export interface CrmLead {
  id: string;
  dateAdded?: string;
  businessName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  businessType?: string;
  location?: string;
  source?: string;
  status?: string;
  notes?: string;
  nextAction?: string;
  followUpDate?: string;
  priority?: string;
  mapUrl?: string;
}

export interface CrmMetrics {
  totalLeads: number;
  newLeadsThisWeek: number;
  activeClients: number;
  pipelineDeals: number;
  pipelineValue: number;
}

export interface LeadBreakdownItem {
  label: string;
  value: number;
  color: string;
}

export interface FollowUpSummary {
  label: string;
  value: number;
  descriptor?: string;
}

export interface ActivityItem {
  title: string;
  agent: string;
  detail: string;
  time: string;
  tag: string;
}

export interface CrmResponse {
  leads: CrmLead[];
  metrics: CrmMetrics;
  leadBreakdown: LeadBreakdownItem[];
  followUps: FollowUpSummary[];
  activityFeed: ActivityItem[];
  lastSynced: string;
}

function normalize(value?: string) {
  return value?.trim() ?? '';
}

function parseDate(value?: string) {
  if (!value) return null;
  const normalized = value.replace(/\./g, '/');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function getPriorityWeight(priority?: string) {
  if (!priority) return 8000;
  const normalized = priority.toLowerCase().trim();
  return PRIORITY_WEIGHTS[normalized] ?? 8000;
}

function isActiveStatus(status?: string) {
  if (!status) return false;
  const lower = status.toLowerCase();
  return ACTIVE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function isPipelineStatus(status?: string) {
  if (!status) return true;
  const lower = status.toLowerCase();
  return PIPELINE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export function formatRelativeTime(value?: string) {
  const date = parseDate(value);
  if (!date) return 'Just now';
  const diff = Date.now() - date.getTime();
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / 60000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);
  const isFuture = diff < 0;

  if (abs < 60_000) {
    return 'Just now';
  }
  if (abs < 3_600_000) {
    return isFuture ? `In ${minutes} min` : `${minutes} min ago`;
  }
  if (abs < 86_400_000) {
    return isFuture ? `In ${hours}h` : `${hours}h ago`;
  }
  return isFuture ? `In ${days}d` : `${days}d ago`;
}

function buildActivityTitle(lead: CrmLead) {
  if (lead.status) {
    return `${lead.status}: ${lead.businessName}`;
  }
  return `New lead: ${lead.businessName}`;
}

function buildLead(row: Record<string, string>): CrmLead {
  const businessName = normalize(row['Business Name'] ?? row['Business'] ?? 'Unknown');
  const dateAdded = normalize(row['Date Added']);

  return {
    id: `${businessName}-${dateAdded}-${normalize(row['Phone'])}`,
    businessName,
    dateAdded,
    contactName: normalize(row['Contact Name']),
    phone: normalize(row['Phone']),
    email: normalize(row['Email']),
    businessType: normalize(row['Business Type']),
    location: normalize(row['Location']),
    source: normalize(row['Source']),
    status: normalize(row['Status']),
    notes: normalize(row['Notes']),
    nextAction: normalize(row['Next Action']),
    followUpDate: normalize(row['Follow-up Date']),
    priority: normalize(row['Priority']),
    mapUrl: normalize(row['Google Maps URL']),
  };
}

export async function buildCrmPayload(): Promise<CrmResponse> {
  const response = await fetch(SHEETS_EXPORT_URL, {
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error('Unable to reach CRM sheet');
  }

  const csv = await response.text();
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const leads = parsed.data
    .map((row) => buildLead(row))
    .filter((lead) => Boolean(lead.businessName));

  const metrics = buildMetrics(leads);
  const leadBreakdown = buildBreakdown(leads);
  const followUps = buildFollowUps(leads);
  const activityFeed = buildActivityFeed(leads);

  return {
    leads,
    metrics,
    leadBreakdown,
    followUps,
    activityFeed,
    lastSynced: new Date().toISOString(),
  };
}

function buildMetrics(leads: CrmLead[]): CrmMetrics {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const newLeadsThisWeek = leads.filter((lead) => {
    const added = parseDate(lead.dateAdded);
    return added ? added >= weekAgo : false;
  }).length;

  const activeClients = leads.filter((lead) => isActiveStatus(lead.status)).length;

  const pipelineCandidates = leads.filter((lead) => !isActiveStatus(lead.status) && isPipelineStatus(lead.status));
  const pipelineDeals = pipelineCandidates.length;
  const pipelineValue = pipelineCandidates.reduce((sum, lead) => sum + getPriorityWeight(lead.priority), 0);

  return {
    totalLeads: leads.length,
    newLeadsThisWeek,
    activeClients,
    pipelineDeals,
    pipelineValue,
  };
}

function buildBreakdown(leads: CrmLead[]): LeadBreakdownItem[] {
  const counts: Record<string, number> = {};
  leads.forEach((lead) => {
    const key = lead.status || 'Other';
    counts[key] = (counts[key] ?? 0) + 1;
  });

  const breakdown = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, value], index) => ({
      label,
      value,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }));

  if (!breakdown.length) {
    return [
      {
        label: 'Other',
        value: 0,
        color: COLOR_PALETTE[0],
      },
    ];
  }

  return breakdown;
}

function buildFollowUps(leads: CrmLead[]): FollowUpSummary[] {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);

  const candidateDates = leads
    .map((lead) => parseDate(lead.followUpDate))
    .filter((date): date is Date => Boolean(date));

  const dueThisWeek = candidateDates.filter((candidate) => candidate >= now && candidate <= weekEnd).length;
  const overdue = candidateDates.filter((candidate) => candidate < now).length;

  return [
    {
      label: 'Due this week',
      value: dueThisWeek,
      descriptor: dueThisWeek ? `${dueThisWeek} follow-ups scheduled` : 'No follow-ups due',
    },
    {
      label: 'Overdue',
      value: overdue,
      descriptor: overdue ? `${overdue} need immediate attention` : 'No overdue tasks',
    },
  ];
}

function buildActivityFeed(leads: CrmLead[]): ActivityItem[] {
  const sorted = [...leads].sort((a, b) => {
    const aTime = parseDate(a.dateAdded)?.getTime() ?? 0;
    const bTime = parseDate(b.dateAdded)?.getTime() ?? 0;
    return bTime - aTime;
  });

  return sorted.slice(0, 4).map((lead) => {
    const preview = lead.notes || lead.nextAction || lead.location || 'Live CRM record';

    return {
      title: buildActivityTitle(lead),
      agent: lead.contactName || lead.source || 'CRM sync',
      detail: preview,
      time: formatRelativeTime(lead.dateAdded || lead.followUpDate),
      tag: lead.status || 'CRM',
    };
  });
}
