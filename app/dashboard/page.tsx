'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

// SHA-256 of 'bleukei2026'
const ADMIN_HASH = '401b4d6c69937db32ae45f66b66af19ffc54e07146549bec2ea564b190352156';

// ─── Agent Data ───────────────────────────────────────────────────────────────
const CENTER_AGENT = {
  id: 'main', name: 'Clawd', role: 'Primary Brain', model: 'kimi-k2.5',
  emoji: '🦞', color: '#0683a1', tier: 'premium' as const,
};

type OrbitAgent = {
  id: string; name: string; role: string; model: string;
  emoji: string; color: string; tier: 'premium' | 'mid' | 'budget';
  radius: number; speed: number; startAngle: number;
};

const ORBIT_AGENTS: OrbitAgent[] = [
  { id: 'agency-leader',  name: 'Agency',     role: 'Dev Lead',       model: 'flash-lite',   emoji: '⚙️',  color: '#00D4AA', tier: 'budget',  radius: 120, speed: 22, startAngle: 0   },
  { id: 'azul-leader',    name: 'Azul',        role: 'Personal Lead',  model: 'flash-lite',   emoji: '💙',  color: '#4488FF', tier: 'budget',  radius: 120, speed: 28, startAngle: 120 },
  { id: 'Administrator',  name: 'Admin',       role: 'Crons & Ops',    model: 'flash-lite',   emoji: '🖥️', color: '#A0A0A0', tier: 'budget',  radius: 120, speed: 35, startAngle: 240 },
  { id: 'Researcher',     name: 'Researcher',  role: 'Deep Research',  model: 'kimi-k2.5',    emoji: '🔬',  color: '#0683a1', tier: 'premium', radius: 185, speed: 40, startAngle: 60  },
  { id: 'bleukei-leader', name: 'Bleukei',     role: 'Visual/Image',   model: 'flash-image',  emoji: '🎨',  color: '#FF6B9D', tier: 'mid',     radius: 185, speed: 50, startAngle: 180 },
  { id: 'the-archivist',  name: 'Archivist',   role: 'Memory',         model: 'flash-lite',   emoji: '📚',  color: '#C084FC', tier: 'budget',  radius: 185, speed: 45, startAngle: 300 },
  { id: 'the-deblocker',  name: 'Deblocker',   role: 'Error Recovery', model: 'haiku-4-5',    emoji: '🔧',  color: '#FB923C', tier: 'mid',     radius: 250, speed: 60, startAngle: 90  },
];

const ALL_AGENTS = [CENTER_AGENT, ...ORBIT_AGENTS];

const TIER_LABEL: Record<string, string> = {
  premium: 'Premium', mid: 'Standard', budget: 'Efficient',
};
const TIER_COLOR: Record<string, string> = {
  premium: 'text-teal', mid: 'text-orange-400', budget: 'text-mint',
};

// ─── Hub Data Types ───────────────────────────────────────────────────────────
type Task = {
  id: string; name: string; owner: string; due: string;
  context: string; blocker?: string; spec?: string;
};

type HubData = {
  version: string;
  lastUpdated: string;
  updatedBy: string;
  tasks: {
    lastSync: string;
    overdue: Task[];
    dueThisWeek: Task[];
    inProgress: Task[];
    blocked: Task[];
    eventual?: Task[];
  };
  costs: {
    today: number;
    thisMonth: number;
    dailyLimit: number;
    monthlyLimit: number;
    byAgent: Record<string, number>;
    alerts: string[];
    trackingNote?: string;
    byokNote?: string;
    openRouterUsageTotal?: number;
    openRouterLastSync?: string;
  };
  github: {
    lastSync: string;
    repositories: {
      name: string; owner: string; openIssues: number;
      openPRs: number; lastCommit: string; ciStatus: string;
    }[];
  };
  activity: { timestamp: string; agent: string; action: string; type: string }[];
  handoffs: {
    pending: { id: string; from: string; to: string; title: string; priority: string; createdAt: string }[];
    completed: { id: string; title: string; completedAt: string }[];
  };
  agents: Record<string, {
    name: string; role: string; model: string;
    status: string; currentTask: string | null;
  }>;
};

// ─── Fallback static activity ─────────────────────────────────────────────────
const STATIC_ACTIVITIES = [
  { time: '2026-02-22', agent: 'Claude Code', action: 'Agent Hub created — centralized agent communication', type: 'success' },
  { time: '2026-02-22', agent: 'Claude Code', action: 'Cost optimization complete — 10 crons rerouted, 7x savings', type: 'success' },
  { time: '2026-02-22', agent: 'Claude Code', action: 'Security hardening applied — HSTS + CSP headers live', type: 'success' },
  { time: '2026-02-21', agent: 'Claude Code', action: 'GSAP scroll animation system deployed to noaberger.com', type: 'success' },
  { time: '2026-02-21', agent: 'Claude Code', action: 'noaberger.com launched — Cloudflare Pages, static export', type: 'success' },
  { time: '2026-02-21', agent: 'Clawd',        action: 'Session auto-review cron active — archives >70% context', type: 'info' },
  { time: '2026-02-19', agent: 'Clawd',        action: '8 new skills installed: notion, github, obsidian, gmail...', type: 'info' },
  { time: '2026-02-18', agent: 'Claude Code',  action: 'Discord channel integrated — guild 1473183121041129485', type: 'info' },
];

const ACTIVITY_DOT: Record<string, string> = {
  success: 'bg-mint', info: 'bg-teal', warn: 'bg-orange-400', milestone: 'bg-purple-400',
};

const STATS = [
  { label: 'Gateway', value: 'ws://127.0.0.1:18789' },
  { label: 'Version', value: 'OpenClaw v2026.2.22-2' },
  { label: 'Node', value: '22.14.0 LTS' },
  { label: 'Agents', value: '8 active' },
  { label: 'Channels', value: 'WhatsApp · Discord' },
  { label: 'Runtime', value: 'PM2' },
];

// ─── Orbit Constellation ──────────────────────────────────────────────────────
function Constellation({ hoveredAgent, onHover }: {
  hoveredAgent: string | null;
  onHover: (id: string | null) => void;
}) {
  const anglesRef = useRef<number[]>(ORBIT_AGENTS.map(a => a.startAngle));
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    let running = true;

    function tick(timestamp: number) {
      if (!running) return;
      const delta = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = timestamp;

      ORBIT_AGENTS.forEach((agent, i) => {
        anglesRef.current[i] = (anglesRef.current[i] + (360 / agent.speed) * delta) % 360;
        const el = document.getElementById(`orbit-node-${agent.id}`);
        if (el) {
          const rad = (anglesRef.current[i] * Math.PI) / 180;
          el.style.transform = `translate(${Math.cos(rad) * agent.radius}px, ${Math.sin(rad) * agent.radius}px)`;
        }
        const line = document.getElementById(`orbit-line-${agent.id}`);
        if (line) {
          const rad = (anglesRef.current[i] * Math.PI) / 180;
          line.setAttribute('x2', String(280 + Math.cos(rad) * agent.radius));
          line.setAttribute('y2', String(280 + Math.sin(rad) * agent.radius));
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  const centerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!centerRef.current) return;
    gsap.to(centerRef.current, {
      boxShadow: '0 0 40px rgba(6,131,161,0.8)',
      repeat: -1, yoyo: true, duration: 2, ease: 'power2.inOut',
    });
  }, []);

  const size = 560;
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size, maxWidth: '100%' }}>
      <svg width={size} height={size} className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
        {[120, 185, 250].map(r => (
          <circle key={r} cx={center} cy={center} r={r} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 8" />
        ))}
        {ORBIT_AGENTS.map(agent => {
          const rad = (agent.startAngle * Math.PI) / 180;
          return (
            <line key={agent.id} id={`orbit-line-${agent.id}`}
              x1={center} y1={center}
              x2={center + Math.cos(rad) * agent.radius}
              y2={center + Math.sin(rad) * agent.radius}
              stroke={hoveredAgent === agent.id ? agent.color : 'rgba(6,131,161,0.2)'}
              strokeWidth={hoveredAgent === agent.id ? 1.5 : 0.8}
              style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
            />
          );
        })}
      </svg>

      <div className="absolute" style={{ left: center, top: center, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
        <div ref={centerRef}
          className="w-20 h-20 rounded-full bg-surface border-2 border-teal flex flex-col items-center justify-center cursor-default"
          style={{ boxShadow: '0 0 20px rgba(6,131,161,0.4)' }}
        >
          <span className="text-2xl">🦞</span>
          <span className="text-white text-xs font-bold mt-0.5">Clawd</span>
        </div>
      </div>

      {ORBIT_AGENTS.map(agent => {
        const rad = (agent.startAngle * Math.PI) / 180;
        const isHovered = hoveredAgent === agent.id;
        return (
          <div key={agent.id} id={`orbit-node-${agent.id}`}
            className="absolute flex flex-col items-center cursor-pointer"
            style={{ left: center, top: center, transform: `translate(${Math.cos(rad) * agent.radius}px, ${Math.sin(rad) * agent.radius}px)`, zIndex: 5 }}
            onMouseEnter={() => onHover(agent.id)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="w-12 h-12 rounded-full flex flex-col items-center justify-center border transition-all duration-200"
              style={{
                background: isHovered ? `${agent.color}22` : 'var(--bg-elevated)',
                borderColor: isHovered ? agent.color : 'rgba(255,255,255,0.12)',
                boxShadow: isHovered ? `0 0 16px ${agent.color}66` : 'none',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="text-base leading-none">{agent.emoji}</span>
              <span className="text-white text-[9px] font-semibold mt-0.5 leading-none">{agent.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Task Kanban ──────────────────────────────────────────────────────────────
function TaskKanban({ hub }: { hub: HubData | null }) {
  if (!hub) return <p className="text-secondary text-sm text-center py-8">Loading tasks...</p>;

  const columns = [
    { key: 'overdue',     label: 'Overdue',       dot: 'bg-red-400',    color: 'text-red-400',    tasks: hub.tasks.overdue     },
    { key: 'dueThisWeek', label: 'Due This Week', dot: 'bg-orange-400', color: 'text-orange-400', tasks: hub.tasks.dueThisWeek },
    { key: 'inProgress',  label: 'In Progress',   dot: 'bg-mint',       color: 'text-mint',       tasks: hub.tasks.inProgress  },
    { key: 'blocked',     label: 'Blocked',       dot: 'bg-purple-400', color: 'text-purple-400', tasks: hub.tasks.blocked     },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-secondary text-xs">Source: ACTIVE_TASKS.md</p>
        {hub.tasks.lastSync && (
          <p className="text-secondary text-xs font-mono">{new Date(hub.tasks.lastSync).toLocaleTimeString()}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {columns.map(col => (
          <div key={col.key} className="border border-white/8 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-elevated border-b border-white/8">
              <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
              <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
              <span className="text-secondary text-xs ml-auto">{col.tasks.length}</span>
            </div>
            <div className="divide-y divide-white/6">
              {col.tasks.length === 0
                ? <p className="text-secondary text-xs px-3 py-3 text-center">Empty</p>
                : col.tasks.map(task => (
                  <div key={task.id} className="px-3 py-2.5 bg-surface hover:bg-elevated transition-colors">
                    <p className="text-white text-xs font-medium leading-relaxed">{task.name}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-teal text-[10px]">{task.owner}</span>
                      <span className="text-secondary text-[10px]">{task.context}</span>
                      {task.due !== 'TBD' && <span className="text-orange-400 text-[10px] ml-auto">{task.due}</span>}
                    </div>
                    {task.blocker && <p className="text-red-400 text-[10px] mt-0.5">⚠ {task.blocker}</p>}
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </div>

      {/* Eventual pipeline — full-width strip */}
      {hub.tasks.eventual && hub.tasks.eventual.length > 0 && (
        <div className="mt-3 border border-indigo-400/20 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-elevated border-b border-indigo-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400">Pipeline Queue</span>
            <span className="text-secondary text-[10px] ml-1">awaiting API keys</span>
            <span className="text-secondary text-xs ml-auto">{hub.tasks.eventual.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-0 divide-x divide-white/6">
            {hub.tasks.eventual.map(task => (
              <div key={task.id} className="px-3 py-2.5 bg-surface hover:bg-elevated transition-colors">
                <p className="text-white text-xs font-medium leading-relaxed">{task.name}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-indigo-400 text-[10px]">{task.owner}</span>
                  <span className="text-secondary text-[10px]">{task.context}</span>
                </div>
                {task.spec && (
                  <p className="text-indigo-300/60 text-[10px] mt-0.5 font-mono truncate">📄 {task.spec.split('/').pop()}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cost Tracker ─────────────────────────────────────────────────────────────
function CostTracker({ hub }: { hub: HubData | null }) {
  if (!hub) return <p className="text-secondary text-sm text-center py-8">Loading costs...</p>;
  const { costs } = hub;

  const dailyPct  = Math.min((costs.today     / costs.dailyLimit)   * 100, 100);
  const monthlyPct = Math.min((costs.thisMonth / costs.monthlyLimit) * 100, 100);

  function barColor(pct: number) {
    if (pct >= 80) return 'bg-red-500';
    if (pct >= 60) return 'bg-orange-400';
    return 'bg-mint';
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-white text-sm font-medium">Today</span>
          <span className="text-white text-sm font-mono">
            ${costs.today.toFixed(2)} <span className="text-secondary">/ ${costs.dailyLimit.toFixed(2)}</span>
          </span>
        </div>
        <div className="h-2 bg-elevated rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor(dailyPct)}`} style={{ width: `${dailyPct}%` }} />
        </div>
        <p className="text-secondary text-xs mt-1">{dailyPct.toFixed(0)}% of daily limit</p>
      </div>

      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-white text-sm font-medium">This Month</span>
          <span className="text-white text-sm font-mono">
            ${costs.thisMonth.toFixed(2)} <span className="text-secondary">/ ${costs.monthlyLimit.toFixed(2)}</span>
          </span>
        </div>
        <div className="h-2 bg-elevated rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor(monthlyPct)}`} style={{ width: `${monthlyPct}%` }} />
        </div>
        <p className="text-secondary text-xs mt-1">{monthlyPct.toFixed(0)}% of monthly limit</p>
      </div>

      <div>
        <p className="text-secondary text-xs uppercase tracking-wider mb-2">By Agent</p>
        <div className="border border-white/8 rounded-xl overflow-hidden divide-y divide-white/6">
          {Object.entries(costs.byAgent).map(([agent, cost]) => (
            <div key={agent} className="flex items-center justify-between px-4 py-2.5 bg-surface hover:bg-elevated transition-colors">
              <span className="text-white text-sm">{agent}</span>
              <span className="text-teal text-sm font-mono">${cost.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {costs.alerts.length > 0 && (
        <div className="border border-orange-400/30 rounded-lg px-4 py-3 bg-orange-400/5">
          {costs.alerts.map((a, i) => <p key={i} className="text-orange-400 text-xs">{a}</p>)}
        </div>
      )}

      {(costs.byokNote || costs.trackingNote) && (
        <div className="border border-yellow-400/25 rounded-lg px-4 py-3 bg-yellow-400/5 space-y-1">
          <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">⚠ BYOK Tracking Gap</p>
          {costs.trackingNote && (
            <p className="text-yellow-300/80 text-xs leading-relaxed">{costs.trackingNote}</p>
          )}
          {costs.openRouterUsageTotal != null && (
            <p className="text-yellow-300/60 text-xs font-mono">OpenRouter total: ${costs.openRouterUsageTotal.toFixed(4)}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── GitHub Status ────────────────────────────────────────────────────────────
function GitHubStatus({ hub }: { hub: HubData | null }) {
  if (!hub) return <p className="text-secondary text-sm text-center py-8">Loading repos...</p>;

  const ciColor: Record<string, string> = {
    passing: 'text-mint', failing: 'text-red-400',
    running: 'text-orange-400', unknown: 'text-secondary', 'fetch-failed': 'text-red-400',
  };
  const ciDot: Record<string, string> = {
    passing: 'bg-mint', failing: 'bg-red-400',
    running: 'bg-orange-400', unknown: 'bg-secondary', 'fetch-failed': 'bg-red-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-secondary text-xs">via gh CLI · Lobsterclawsss</p>
        {hub.github.lastSync && (
          <p className="text-secondary text-xs font-mono">{new Date(hub.github.lastSync).toLocaleTimeString()}</p>
        )}
      </div>
      <div className="border border-white/8 rounded-xl overflow-hidden divide-y divide-white/6">
        {hub.github.repositories.map(repo => (
          <div key={repo.name} className="px-4 py-3 bg-surface hover:bg-elevated transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ciDot[repo.ciStatus] ?? 'bg-secondary'}`} />
                <span className="text-white text-sm font-medium">{repo.owner}/{repo.name}</span>
              </div>
              <span className={`text-xs font-semibold ${ciColor[repo.ciStatus] ?? 'text-secondary'}`}>
                {repo.ciStatus}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-secondary">
              <span>{repo.openIssues} issue{repo.openIssues !== 1 ? 's' : ''}</span>
              <span>{repo.openPRs} PR{repo.openPRs !== 1 ? 's' : ''}</span>
              <span className="ml-auto font-mono">{repo.lastCommit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Agent Comms Panel ────────────────────────────────────────────────────────
function AgentComms({ hub }: { hub: HubData | null }) {
  if (!hub) return <p className="text-secondary text-sm text-center py-8">Loading...</p>;

  const priorityBorder: Record<string, string> = {
    critical: 'border-l-red-400', high: 'border-l-orange-400',
    normal: 'border-l-teal', low: 'border-l-white/10',
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-secondary text-xs uppercase tracking-wider mb-2">Agent Status</p>
        <div className="border border-white/8 rounded-xl overflow-hidden divide-y divide-white/6">
          {Object.entries(hub.agents).map(([id, agent]) => (
            <div key={id} className="flex items-center gap-3 px-4 py-2.5 bg-surface hover:bg-elevated transition-colors">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                agent.status === 'active' ? 'bg-mint animate-pulse'
                : agent.status === 'disconnected' ? 'bg-secondary'
                : 'bg-orange-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{agent.name}</p>
                <p className="text-secondary text-xs truncate">{agent.currentTask ?? 'idle'}</p>
              </div>
              <span className="text-secondary text-xs font-mono text-right">{agent.model}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-secondary text-xs uppercase tracking-wider mb-2">
          Pending Handoffs{' '}
          <span className="text-teal">{hub.handoffs.pending.length}</span>
        </p>
        {hub.handoffs.pending.length === 0 ? (
          <div className="border border-white/8 rounded-xl px-4 py-6 text-center">
            <p className="text-secondary text-sm">No pending handoffs</p>
            <p className="text-secondary text-xs mt-1">Drop .md files in hub/handoffs/pending/</p>
          </div>
        ) : (
          <div className="border border-white/8 rounded-xl overflow-hidden divide-y divide-white/6">
            {hub.handoffs.pending.map(h => (
              <div key={h.id} className={`px-4 py-3 bg-surface border-l-2 ${priorityBorder[h.priority] ?? 'border-l-white/10'}`}>
                <p className="text-white text-sm font-medium">{h.title}</p>
                <div className="flex gap-3 mt-1 text-xs text-secondary">
                  <span>{h.from} → {h.to}</span>
                  <span className="ml-auto">{new Date(h.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {hub.handoffs.completed.length > 0 && (
        <div>
          <p className="text-secondary text-xs uppercase tracking-wider mb-2">Recently Completed</p>
          <div className="border border-white/8 rounded-xl overflow-hidden divide-y divide-white/6">
            {hub.handoffs.completed.slice(0, 3).map(h => (
              <div key={h.id} className="flex items-center gap-3 px-4 py-2.5 bg-surface">
                <span className="text-mint text-xs flex-shrink-0">✓</span>
                <p className="text-secondary text-sm flex-1 truncate">{h.title}</p>
                <p className="text-secondary text-xs flex-shrink-0">{new Date(h.completedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
type TabKey = 'agents' | 'activity' | 'tasks' | 'costs' | 'github' | 'handoffs';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'agents',   label: 'Agents'   },
  { key: 'tasks',    label: 'Tasks'    },
  { key: 'costs',    label: 'Costs'    },
  { key: 'github',   label: 'GitHub'   },
  { key: 'handoffs', label: 'Comms'    },
  { key: 'activity', label: 'Activity' },
];

export default function Dashboard() {
  const [unlocked, setUnlocked]     = useState(false);
  const [password, setPassword]     = useState('');
  const [authError, setAuthError]   = useState('');
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<TabKey>('agents');
  const [hub, setHub]               = useState<HubData | null>(null);
  const [lastFetch, setLastFetch]   = useState('');

  const selectedAgent = hoveredAgent ? ALL_AGENTS.find(a => a.id === hoveredAgent) : null;

  // Poll /hub/agent-hub.json every 30 s after unlock
  useEffect(() => {
    if (!unlocked) return;
    async function fetchHub() {
      try {
        const res = await fetch('/hub/agent-hub.json?t=' + Date.now());
        if (res.ok) {
          setHub(await res.json());
          setLastFetch(new Date().toLocaleTimeString());
        }
      } catch {}
    }
    fetchHub();
    const id = setInterval(fetchHub, 30000);
    return () => clearInterval(id);
  }, [unlocked]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (hex === ADMIN_HASH) { setUnlocked(true); setAuthError(''); }
    else setAuthError('Incorrect password.');
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xs">
          <p className="text-teal text-xs tracking-widest uppercase mb-2">OpenClaw</p>
          <p className="text-secondary text-xs tracking-widest uppercase mb-6">Agent Control Center</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Access code" autoFocus
              className="w-full bg-elevated border border-white/10 rounded-lg px-4 py-3 text-white placeholder-secondary focus:outline-none focus:border-teal/50 text-sm"
            />
            {authError && <p className="text-red-400 text-xs">{authError}</p>}
            <button type="submit" className="w-full bg-teal hover:bg-teal-hover text-white py-3 rounded-lg text-sm font-medium transition-colors">
              Access →
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activityItems = hub?.activity
    ? hub.activity.map(a => ({ time: a.timestamp.split('T')[0], agent: a.agent, action: a.action, type: a.type }))
    : STATIC_ACTIVITIES;

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 fade-in">
          <div>
            <p className="text-teal text-xs font-semibold tracking-widest uppercase mb-1">OpenClaw</p>
            <h1 className="text-2xl font-bold text-white">Agent Control Center</h1>
            <p className="text-secondary text-sm mt-1">8 agents · 3 orbital tiers · Hub v1.0</p>
          </div>
          <div className="flex flex-col items-end gap-1 mt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              <span className="text-mint text-xs font-medium">LIVE</span>
            </div>
            {lastFetch && <span className="text-secondary text-[10px]">synced {lastFetch}</span>}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">

          {/* Left — Constellation */}
          <div className="flex flex-col items-center">
            <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-surface p-4"
              style={{ background: 'radial-gradient(ellipse at center, rgba(6,131,161,0.05) 0%, transparent 70%), var(--bg-surface)' }}>
              <Constellation hoveredAgent={hoveredAgent} onHover={setHoveredAgent} />
            </div>

            <div className="mt-4 h-16 flex items-center justify-center">
              {selectedAgent ? (
                <div className="text-center fade-in">
                  <p className="text-white font-semibold">{selectedAgent.emoji} {selectedAgent.name}</p>
                  <p className="text-secondary text-sm">{selectedAgent.role}</p>
                  <p className="text-teal text-xs font-mono mt-0.5">{selectedAgent.model}</p>
                </div>
              ) : (
                <p className="text-secondary text-xs">Hover an agent to inspect</p>
              )}
            </div>

            <div className="flex gap-6 mt-2">
              {[
                { label: 'Inner', color: 'border-teal/40' },
                { label: 'Mid', color: 'border-purple-400/40' },
                { label: 'Outer', color: 'border-orange-400/40' },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-2">
                  <div className={`border-t border-dashed ${t.color}`} style={{ width: 16 }} />
                  <span className="text-secondary text-xs">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Tabs */}
          <div className="flex flex-col">
            <div className="flex gap-0.5 mb-4 bg-surface rounded-lg p-1 border border-white/8">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 text-[11px] font-semibold rounded-md transition-colors tracking-wide ${
                    activeTab === tab.key ? 'bg-elevated text-white' : 'text-secondary hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'agents' && (
              <div className="border border-white/8 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto] gap-3 px-4 py-2 bg-elevated border-b border-white/8">
                  <span className="text-secondary text-xs uppercase tracking-wider">Agent</span>
                  <span className="text-secondary text-xs uppercase tracking-wider">Model</span>
                  <span className="text-secondary text-xs uppercase tracking-wider">Tier</span>
                </div>
                <div className={`grid grid-cols-[auto_1fr_auto] gap-3 items-center px-4 py-3 border-b border-white/6 transition-colors cursor-default ${hoveredAgent === 'main' ? 'bg-teal/5' : 'bg-surface hover:bg-elevated'}`}
                  onMouseEnter={() => setHoveredAgent('main')} onMouseLeave={() => setHoveredAgent(null)}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🦞</span>
                    <div>
                      <p className="text-white text-sm font-semibold">{CENTER_AGENT.name}</p>
                      <p className="text-secondary text-xs">{CENTER_AGENT.role}</p>
                    </div>
                  </div>
                  <p className="text-teal text-xs font-mono">{CENTER_AGENT.model}</p>
                  <span className={`text-xs font-semibold ${TIER_COLOR[CENTER_AGENT.tier]}`}>{TIER_LABEL[CENTER_AGENT.tier]}</span>
                </div>
                {ORBIT_AGENTS.map(agent => (
                  <div key={agent.id}
                    className={`grid grid-cols-[auto_1fr_auto] gap-3 items-center px-4 py-3 border-b border-white/6 last:border-0 transition-colors cursor-default ${hoveredAgent === agent.id ? 'bg-teal/5' : 'bg-surface hover:bg-elevated'}`}
                    onMouseEnter={() => setHoveredAgent(agent.id)} onMouseLeave={() => setHoveredAgent(null)}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{agent.emoji}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{agent.name}</p>
                        <p className="text-secondary text-xs">{agent.role}</p>
                      </div>
                    </div>
                    <p className="text-secondary text-xs font-mono">{agent.model}</p>
                    <span className={`text-xs font-medium ${TIER_COLOR[agent.tier]}`}>{TIER_LABEL[agent.tier]}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tasks'    && <TaskKanban    hub={hub} />}
            {activeTab === 'costs'    && <CostTracker   hub={hub} />}
            {activeTab === 'github'   && <GitHubStatus  hub={hub} />}
            {activeTab === 'handoffs' && <AgentComms    hub={hub} />}

            {activeTab === 'activity' && (
              <div className="border border-white/8 rounded-xl overflow-hidden">
                {activityItems.map((item, i) => (
                  <div key={i} className="flex gap-3 px-4 py-3 border-b border-white/6 last:border-0 bg-surface hover:bg-elevated transition-colors">
                    <div className="flex-shrink-0 mt-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full block ${ACTIVITY_DOT[item.type] ?? 'bg-secondary'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs leading-relaxed">{item.action}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-teal text-xs font-medium">{item.agent}</span>
                        <span className="text-secondary text-xs">{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Stats Bar */}
        <div className="mt-8 border border-white/8 rounded-xl bg-surface px-5 py-3">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {STATS.map(stat => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-secondary text-xs">{stat.label}:</span>
                <span className="text-white text-xs font-mono">{stat.value}</span>
              </div>
            ))}
            {hub && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-secondary text-xs">Hub:</span>
                <span className="text-mint text-xs font-mono">v{hub.version}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
