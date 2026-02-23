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
  // Add real clients here
  // Template:
  // {
  //   token: 'unique-token-here',
  //   name: 'Client Name',
  //   greeting: "Here's your project overview.",
  //   projects: [
  //     {
  //       name: 'Project Name',
  //       description: 'Project description here.',
  //       status: 'in-progress',
  //       milestones: [
  //         { label: 'Milestone 1', status: 'done' },
  //         { label: 'Milestone 2', status: 'in-progress' },
  //       ],
  //       deliverables: [
  //         { label: 'Deliverable Name', url: '#' },
  //       ],
  //     },
  //   ],
  // },
];

// Helper: look up a client by token
export function getClient(token: string): Client | undefined {
  return CLIENTS.find((c) => c.token === token);
}

// Required by Next.js static export: return all valid token slugs
export function getAllTokens(): string[] {
  return CLIENTS.map((c) => c.token);
}
