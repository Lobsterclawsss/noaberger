// Client portal data
// To add a client: add a new entry to the CLIENTS array
// Token = the URL slug (keep it random/hard to guess)
// After editing, run: npm run build  (then redeploy to Cloudflare Pages)

export type MilestoneStatus = 'done' | 'in-progress' | 'pending';

export type Milestone = {
  label: string;
  status: MilestoneStatus;
};

export type Deliverable = {
  label: string;
  url: string;
};

export type ProjectStatus = 'planning' | 'in-progress' | 'review' | 'complete';

export type Project = {
  name: string;
  description: string;
  status: ProjectStatus;
  milestones: Milestone[];
  deliverables: Deliverable[];
};

export type Client = {
  token: string;       // URL slug — share this URL: noaberger.com/clients/[token]
  name: string;        // Client or friend’s first name
  greeting?: string;   // Optional custom greeting, defaults to "Here's your project overview."
  projects: Project[];
};

export const CLIENTS: Client[] = [
  // ── EXAMPLE CLIENT ──────────────────────────────────────────────
  // Remove or replace this with real clients
  {
    token: 'f3a8c2d7-9b14-4e61-a059-7c3d8f120e44',
    name: 'Alex',
    greeting: "Here's where things stand on your project.",
    projects: [
      {
        name: 'Website Redesign',
        description: 'Full redesign of alexbrand.com — new copy, dark theme, mobile-first.',
        status: 'in-progress',
        milestones: [
          { label: 'Discovery call & brief', status: 'done' },
          { label: 'Wireframes approved', status: 'done' },
          { label: 'Homepage build', status: 'in-progress' },
          { label: 'Inner pages build', status: 'pending' },
          { label: 'QA & launch', status: 'pending' },
        ],
        deliverables: [
          { label: 'Project Brief (PDF)', url: '#' },
          { label: 'Wireframes (Figma)', url: '#' },
        ],
      },
    ],
  },

  // ── EXAMPLE FRIEND ──────────────────────────────────────────────
  {
    token: 'b91e4f73-2c6a-4d08-8b3e-5a9f7e203c17',
    name: 'Jake',
    greeting: "Dropping some stuff here so you can follow along.",
    projects: [
      {
        name: 'BLEUKEI Intro Deck',
        description: 'Investor-facing one-pager and pitch deck for BLEUKEI.',
        status: 'complete',
        milestones: [
          { label: 'One-pager draft', status: 'done' },
          { label: 'Pitch deck draft', status: 'done' },
          { label: 'Final review', status: 'done' },
        ],
        deliverables: [
          { label: 'One-pager (HTML)', url: '/projects/duke-kahanamoku-one-pager' },
          { label: 'Pitch deck (HTML)', url: '/projects/duke-kahanamoku-pitch-deck' },
        ],
      },
    ],
  },
];

// Helper: look up a client by token
export function getClient(token: string): Client | undefined {
  return CLIENTS.find((c) => c.token === token);
}

// Required by Next.js static export: return all valid token slugs
export function getAllTokens(): string[] {
  return CLIENTS.map((c) => c.token);
}
