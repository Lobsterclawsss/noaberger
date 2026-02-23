import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClient, getAllTokens, type ProjectStatus } from '../data';

// Required for Next.js static export with dynamic routes
// dynamicParams = false tells Next.js to return 404 for any path not in generateStaticParams()
// This also fixes a Next.js 14 bug where empty generateStaticParams() triggers a false "missing" error
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTokens().map((token) => ({ token }));
}

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  planning:    { label: 'Planning',    color: 'text-secondary border-secondary/30 bg-secondary/5' },
  'in-progress': { label: 'In Progress', color: 'text-teal border-teal/30 bg-teal/5' },
  review:      { label: 'Review',      color: 'text-mint border-mint/30 bg-mint/5' },
  complete:    { label: 'Complete',    color: 'text-mint border-mint/30 bg-mint/10' },
};

const milestoneIcon = {
  done:        '✓',
  'in-progress': '◐',
  pending:     '○',
};

const milestoneColor = {
  done:        'text-mint',
  'in-progress': 'text-teal',
  pending:     'text-secondary',
};

export default function ClientDashboard({ params }: { params: { token: string } }) {
  const client = getClient(params.token);

  if (!client) {
    notFound();
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-16">
          <p className="text-teal text-sm font-medium tracking-widest uppercase mb-3">Project Portal</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Hi, {client.name}.
          </h1>
          <p className="text-secondary text-lg">
            {client.greeting ?? "Here's your project overview."}
          </p>
        </div>

        {/* Projects */}
        <div className="space-y-12">
          {client.projects.map((project, i) => {
            const status = statusConfig[project.status];
            const totalMilestones = project.milestones.length;
            const doneMilestones = project.milestones.filter((m) => m.status === 'done').length;
            const progressPct = totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

            return (
              <div key={i} className="border border-white/10 rounded-2xl p-8 bg-surface">
                {/* Project header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{project.name}</h2>
                    <p className="text-secondary leading-relaxed">{project.description}</p>
                  </div>
                  <span className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-secondary text-sm">Progress</span>
                    <span className="text-white text-sm font-medium">{doneMilestones}/{totalMilestones} milestones</span>
                  </div>
                  <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                {project.milestones.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-secondary uppercase tracking-wider mb-4">Milestones</h3>
                    <ul className="space-y-3">
                      {project.milestones.map((m, j) => (
                        <li key={j} className="flex items-center gap-3">
                          <span className={`text-sm font-mono flex-shrink-0 ${milestoneColor[m.status]}`}>
                            {milestoneIcon[m.status]}
                          </span>
                          <span className={m.status === 'done' ? 'text-secondary line-through' : 'text-white'}>
                            {m.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Deliverables */}
                {project.deliverables.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-secondary uppercase tracking-wider mb-4">Deliverables</h3>
                    <div className="flex flex-wrap gap-3">
                      {project.deliverables.map((d, j) => (
                        <Link
                          key={j}
                          href={d.url}
                          target={d.url.startsWith('http') ? '_blank' : undefined}
                          rel={d.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-2 border border-white/10 hover:border-teal/40 bg-elevated text-white text-sm px-4 py-2.5 rounded-lg transition-colors"
                        >
                          <span className="text-teal text-xs">↓</span>
                          {d.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-secondary mb-4">Questions? Let&apos;s talk.</p>
          <Link
            href="https://calendar.app.google/9HkGH8jzjx82fwfk8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-teal hover:bg-teal-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Schedule a Call
          </Link>
        </div>

      </div>
    </div>
  );
}
