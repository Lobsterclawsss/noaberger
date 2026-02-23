'use client';

import { useState, useEffect } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

interface BudgetTask {
  id: string;
  name: string;
  agent: string;
  agentEmoji: string;
  status: string;
  statusColor: string;
  cost: number | null;
  estimatedTime: number | null;
  actualTime: number | null;
  priority: string | null;
}

interface BudgetChapter {
  id: string;
  name: string;
  statusPercent: number;
  cost: number;
  estimatedHours: number | null;
  actualHours: number | null;
  tasks: BudgetTask[];
}

interface BudgetProject {
  id: string;
  name: string;
  agentEmoji: string;
  client: string;
  budgetTotal: number;
  budgetSpent: number;
  budgetRemaining: number;
  statusPercent: number;
  totalTasks: number;
  completedTasks: number;
  chapters: BudgetChapter[];
}

interface ProjectsData {
  projects: BudgetProject[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

type AlertLevel = 'ok' | 'warn' | 'alert' | 'critical';

function alertLevel(spent: number, total: number): AlertLevel {
  if (total <= 0) return 'ok';
  const pct = spent / total;
  if (pct >= 1)    return 'critical';
  if (pct >= 0.9)  return 'critical';
  if (pct >= 0.75) return 'alert';
  if (pct >= 0.5)  return 'warn';
  return 'ok';
}

const LEVEL_BAR: Record<AlertLevel, string> = {
  ok:       'bg-mint',
  warn:     'bg-yellow-400',
  alert:    'bg-orange-400',
  critical: 'bg-red-500',
};

const LEVEL_TEXT: Record<AlertLevel, string> = {
  ok:       'text-mint',
  warn:     'text-yellow-400',
  alert:    'text-orange-400',
  critical: 'text-red-400',
};

const LEVEL_BORDER: Record<AlertLevel, string> = {
  ok:       'border-mint/20',
  warn:     'border-yellow-400/25',
  alert:    'border-orange-400/30',
  critical: 'border-red-500/40',
};

function pct(spent: number, total: number) {
  return total > 0 ? Math.min((spent / total) * 100, 100) : 0;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function BarRow({
  label,
  spent,
  total,
  sub,
}: {
  label: string;
  spent: number;
  total: number;
  sub?: string;
}) {
  const level = alertLevel(spent, total);
  const p = pct(spent, total);

  return (
    <div className="py-2.5 px-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-white text-xs font-medium truncate flex-1 mr-2">{label}</span>
        <span className={`text-xs font-mono flex-shrink-0 ${LEVEL_TEXT[level]}`}>
          ${spent.toFixed(2)}
          <span className="text-secondary"> / ${total.toFixed(2)}</span>
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${LEVEL_BAR[level]}`}
          style={{ width: `${p}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-0.5">
        {sub && <span className="text-secondary text-[10px]">{sub}</span>}
        <span className={`text-[10px] ml-auto ${LEVEL_TEXT[level]}`}>
          {p.toFixed(0)}%
          {level === 'warn'     && ' ⚠ over half'}
          {level === 'alert'    && ' ⚠ near limit'}
          {level === 'critical' && ' ✖ over budget'}
        </span>
      </div>
    </div>
  );
}

function ProjectBlock({ project }: { project: BudgetProject }) {
  const [expanded, setExpanded] = useState(false);
  const level = alertLevel(project.budgetSpent, project.budgetTotal);

  return (
    <div className={`border rounded-xl overflow-hidden ${LEVEL_BORDER[level]}`}>
      {/* Project header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left"
      >
        <div className={`flex items-center gap-2 px-3 py-2 bg-elevated border-b ${LEVEL_BORDER[level]}`}>
          <span className="text-base leading-none">{project.agentEmoji}</span>
          <div className="flex-1 min-w-0">
            <span className="text-white text-xs font-semibold truncate block">{project.name}</span>
            <span className="text-secondary text-[10px]">{project.client}</span>
          </div>
          <span className="text-secondary text-xs">
            {project.completedTasks}/{project.totalTasks} tasks
          </span>
          <span className={`text-[10px] font-mono ${LEVEL_TEXT[level]}`}>
            {pct(project.budgetSpent, project.budgetTotal).toFixed(0)}%
          </span>
          <span className={`text-secondary text-[10px] ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`}>›</span>
        </div>
        <BarRow
          label=""
          spent={project.budgetSpent}
          total={project.budgetTotal}
          sub={`$${project.budgetRemaining.toFixed(2)} remaining`}
        />
      </button>

      {/* Chapter breakdown */}
      {expanded && project.chapters.length > 0 && (
        <div className="divide-y divide-white/6 border-t border-white/8">
          {project.chapters.map(ch => (
            <ChapterRow key={ch.id} chapter={ch} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChapterRow({ chapter }: { chapter: BudgetChapter }) {
  const [expanded, setExpanded] = useState(false);
  // chapters don't have their own budget limit — show cost vs. estimated
  const estCost = (chapter.estimatedHours ?? 0) * 25; // rough $25/hr rate
  const level = alertLevel(chapter.cost, estCost || chapter.cost * 1.5);

  return (
    <div className="bg-surface">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between px-4 py-2 hover:bg-elevated transition-colors">
          <span className="text-secondary text-xs">{chapter.name}</span>
          <div className="flex items-center gap-3">
            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${LEVEL_BAR[level]}`}
                style={{ width: `${Math.round(chapter.statusPercent * 100)}%` }}
              />
            </div>
            <span className={`text-xs font-mono ${LEVEL_TEXT[level]}`}>${chapter.cost.toFixed(2)}</span>
            {chapter.tasks.length > 0 && (
              <span className={`text-[10px] text-secondary transition-transform ${expanded ? 'rotate-90' : ''}`}>›</span>
            )}
          </div>
        </div>
      </button>

      {expanded && chapter.tasks.length > 0 && (
        <div className="px-4 pb-2 space-y-1">
          {chapter.tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between py-1 border-t border-white/5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm">{task.agentEmoji}</span>
                <span className="text-secondary text-[10px] truncate">{task.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: task.statusColor + '22', color: task.statusColor }}
                >
                  {task.status}
                </span>
                {task.cost != null ? (
                  <span className="text-[10px] font-mono text-teal">${task.cost.toFixed(2)}</span>
                ) : (
                  <span className="text-[10px] text-secondary">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Alert Banner ───────────────────────────────────────────────────────────

function AlertBanner({ projects }: { projects: BudgetProject[] }) {
  const alerts = projects
    .map(p => ({ name: p.name, level: alertLevel(p.budgetSpent, p.budgetTotal), pct: pct(p.budgetSpent, p.budgetTotal) }))
    .filter(a => a.level !== 'ok')
    .sort((a, b) => b.pct - a.pct);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-1 mb-3">
      {alerts.map(a => (
        <div
          key={a.name}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs
            ${a.level === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
              a.level === 'alert'    ? 'bg-orange-400/10 border-orange-400/25 text-orange-400' :
              'bg-yellow-400/8 border-yellow-400/20 text-yellow-300'}`}
        >
          <span>{a.level === 'critical' ? '✖' : '⚠'}</span>
          <span className="flex-1">
            <strong>{a.name}</strong>
            {' '}is at {a.pct.toFixed(0)}% of budget
            {a.level === 'critical' && ' — over limit!'}
            {a.level === 'alert'    && ' — near limit'}
            {a.level === 'warn'     && ' — past halfway'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function BudgetBars() {
  const [data, setData] = useState<ProjectsData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/hub/projects.json?t=' + Date.now());
        if (!res.ok) throw new Error();
        setData(await res.json());
      } catch {
        setError(true);
      }
    }
    fetchProjects();
    const id = setInterval(fetchProjects, 60_000);
    return () => clearInterval(id);
  }, []);

  if (error) return (
    <p className="text-red-400 text-sm text-center py-8">Failed to load budget data</p>
  );

  if (!data) return (
    <p className="text-secondary text-sm text-center py-8">Loading budgets...</p>
  );

  const projects = data.projects as BudgetProject[];

  const totalBudget = projects.reduce((s, p) => s + p.budgetTotal, 0);
  const totalSpent  = projects.reduce((s, p) => s + p.budgetSpent, 0);
  const overallLevel = alertLevel(totalSpent, totalBudget);

  return (
    <div className="space-y-3">
      {/* Overall summary */}
      <div className={`border rounded-xl overflow-hidden ${LEVEL_BORDER[overallLevel]}`}>
        <div className={`px-3 py-2 bg-elevated border-b ${LEVEL_BORDER[overallLevel]}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">All Projects</span>
            <span className={`text-xs font-semibold ${LEVEL_TEXT[overallLevel]}`}>
              ${totalSpent.toFixed(2)} / ${totalBudget.toLocaleString()}
            </span>
          </div>
        </div>
        <BarRow
          label=""
          spent={totalSpent}
          total={totalBudget}
          sub={`${projects.length} projects · $${(totalBudget - totalSpent).toFixed(2)} remaining`}
        />
      </div>

      {/* Alert banner */}
      <AlertBanner projects={projects} />

      {/* Per-project breakdown */}
      <div className="space-y-2">
        {projects.map(project => (
          <ProjectBlock key={project.id} project={project} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
        {[
          { level: 'ok'      as AlertLevel, label: '< 50%' },
          { level: 'warn'    as AlertLevel, label: '50–75%' },
          { level: 'alert'   as AlertLevel, label: '75–90%' },
          { level: 'critical'as AlertLevel, label: '> 90%' },
        ].map(({ level, label }) => (
          <div key={level} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${LEVEL_BAR[level]}`} />
            <span className="text-secondary text-[10px]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
