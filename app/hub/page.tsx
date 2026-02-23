'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

// SHA-256 of 'bleukei2026' (same password)
const ADMIN_HASH = '401b4d6c69937db32ae45f66b66af19ffc54e07146549bec2ea564b190352156';

// Pornhub-inspired theme colors
const THEME = {
  bg: '#000000',
  surface: '#1a1a1a',
  elevated: '#2a2a2a',
  orange: '#ff9000',
  orangeHover: '#ffaa33',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  border: 'rgba(255, 144, 0, 0.3)',
  red: '#ff4444',
  yellow: '#ffcc00',
  green: '#00cc66',
  purple: '#cc66ff',
};

// ─── Agent Data ───────────────────────────────────────────────────────────────
const CENTER_AGENT = {
  id: 'main', name: 'Agent Hub', role: 'Mission Control', model: 'kimi-k2.5',
  emoji: '🍆', color: '#ff9000', tier: 'premium' as const,
};

type OrbitAgent = {
  id: string; name: string; role: string; model: string;
  emoji: string; color: string; tier: 'premium' | 'mid' | 'budget';
  radius: number; speed: number; startAngle: number;
};

const ORBIT_AGENTS: OrbitAgent[] = [
  { id: 'agency-leader',  name: 'Agency',     role: 'Dev Lead',       model: 'flash-lite',   emoji: '🔧',  color: '#ff9000', tier: 'budget',  radius: 120, speed: 22, startAngle: 0   },
  { id: 'azul-leader',    name: 'Azul',        role: 'Personal Lead',  model: 'flash-lite',   emoji: '💙',  color: '#ff6600', tier: 'budget',  radius: 120, speed: 28, startAngle: 120 },
  { id: 'Administrator',  name: 'Admin',       role: 'Crons & Ops',    model: 'flash-lite',   emoji: '⚙️', color: '#ffaa33', tier: 'budget',  radius: 120, speed: 35, startAngle: 240 },
  { id: 'Researcher',     name: 'Researcher',  role: 'Deep Research',  model: 'kimi-k2.5',    emoji: '🔍',  color: '#ff9000', tier: 'premium', radius: 185, speed: 40, startAngle: 60  },
  { id: 'bleukei-leader', name: 'Bleukei',     role: 'Visual/Image',   model: 'flash-image',  emoji: '🎨',  color: '#ff6600', tier: 'mid',     radius: 185, speed: 50, startAngle: 180 },
  { id: 'the-archivist',  name: 'Archivist',   role: 'Memory',         model: 'flash-lite',   emoji: '📚',  color: '#ffaa33', tier: 'budget',  radius: 185, speed: 45, startAngle: 300 },
  { id: 'the-deblocker',  name: 'Deblocker',   role: 'Error Recovery', model: 'haiku-4-5',    emoji: '🚑',  color: '#ff4444', tier: 'mid',     radius: 250, speed: 60, startAngle: 90  },
];

const ALL_AGENTS = [CENTER_AGENT, ...ORBIT_AGENTS];

const TIER_LABEL: Record<string, string> = {
  premium: 'Premium', mid: 'Standard', budget: 'Efficient',
};

// ─── Hub Data Types ───────────────────────────────────────────────────────────
type Task = {
  id: string; name: string; owner: string; due: string;
  context: string; blocker?: string;
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
  };
  costs: {
    today: number;
    thisMonth: number;
    dailyLimit: number;
    monthlyLimit: number;
    byAgent: Record<string, number>;
    alerts: string[];
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: THEME.bg,
    color: THEME.text,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    background: `linear-gradient(90deg, ${THEME.orange}22, transparent)`,
    borderBottom: `2px solid ${THEME.orange}`,
    padding: '20px',
  },
  title: {
    color: THEME.orange,
    fontSize: '2rem',
    fontWeight: 'bold',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: THEME.textSecondary,
    fontSize: '0.875rem',
  },
  tabButton: {
    flex: 1,
    padding: '12px 16px',
    background: THEME.surface,
    border: `1px solid ${THEME.border}`,
    color: THEME.textSecondary,
    cursor: 'pointer',
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: '11px',
    letterSpacing: '0.5px',
  },
  tabButtonActive: {
    background: THEME.orange,
    color: THEME.bg,
    borderColor: THEME.orange,
  },
  card: {
    background: THEME.surface,
    border: `1px solid ${THEME.border}`,
    borderRadius: '8px',
    overflow: 'hidden',
  },
  cardHeader: {
    background: THEME.elevated,
    padding: '12px 16px',
    borderBottom: `1px solid ${THEME.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  progressBar: {
    height: '8px',
    background: THEME.elevated,
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: (pct: number) => ({
    height: '100%',
    background: pct > 80 ? THEME.red : pct > 60 ? THEME.yellow : THEME.orange,
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  }),
  button: {
    background: THEME.orange,
    color: THEME.bg,
    border: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  input: {
    background: THEME.surface,
    border: `1px solid ${THEME.border}`,
    padding: '12px 16px',
    borderRadius: '4px',
    color: THEME.text,
    fontSize: '14px',
    width: '100%',
  },
  badge: (color: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    background: `${color}22`,
    color: color,
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
  }),
};

// ─── Components ───────────────────────────────────────────────────────────────
function Constellation({ hoveredAgent, onHover }: { hoveredAgent: string | null; onHover: (id: string | null) => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = gsap.context(() => {
      ORBIT_AGENTS.forEach(agent => {
        gsap.to(`[data-agent="${agent.id}"]`, {
          rotation: 360,
          duration: agent.speed,
          repeat: -1,
          ease: 'none',
          transformOrigin: `-${agent.radius}px center`,
        });
      });
    }, canvasRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={canvasRef} className="relative" style={{ width: 600, height: 600 }}>
      {/* Orbital rings */}
      {[120, 185, 250].map((r, i) => (
        <div
          key={r}
          className="absolute rounded-full border border-dashed"
          style={{
            width: r * 2,
            height: r * 2,
            borderColor: `${THEME.orange}${20 + i * 10}`,
            left: 300 - r,
            top: 300 - r,
          }}
        />
      ))}
      
      {/* Center */}
      <div
        className="absolute rounded-full flex items-center justify-center font-bold text-3xl"
        style={{
          width: 80,
          height: 80,
          background: `linear-gradient(135deg, ${THEME.orange}, ${THEME.orangeHover})`,
          left: 260,
          top: 260,
          boxShadow: `0 0 30px ${THEME.orange}66`,
        }}
      >
        🍆
      </div>
      
      {/* Orbiting agents */}
      {ORBIT_AGENTS.map(agent => (
        <div
          key={agent.id}
          data-agent={agent.id}
          className="absolute cursor-pointer transition-all"
          style={{
            left: 300,
            top: 300,
          }}
          onMouseEnter={() => onHover(agent.id)}
          onMouseLeave={() => onHover(null)}
        >
          <div
            className="absolute rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all"
            style={{
              width: 40,
              height: 40,
              background: hoveredAgent === agent.id ? `${agent.color}44` : THEME.surface,
              borderColor: agent.color,
              color: agent.color,
              left: agent.radius - 20,
              top: -20,
              boxShadow: hoveredAgent === agent.id ? `0 0 20px ${agent.color}` : 'none',
            }}
          >
            {agent.emoji}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskKanbanPH({ hub }: { hub: HubData | null }) {
  if (!hub) return <p style={{ color: THEME.textSecondary, textAlign: 'center', padding: 32 }}>Loading tasks...</p>;

  const columns = [
    { key: 'overdue',     label: 'OVERDUE',       color: THEME.red,     tasks: hub.tasks.overdue     },
    { key: 'dueThisWeek', label: 'DUE THIS WEEK', color: THEME.yellow,  tasks: hub.tasks.dueThisWeek },
    { key: 'inProgress',  label: 'IN PROGRESS',   color: THEME.green,   tasks: hub.tasks.inProgress  },
    { key: 'blocked',     label: 'BLOCKED',       color: THEME.purple,  tasks: hub.tasks.blocked     },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: THEME.textSecondary, fontSize: 12 }}>Source: ACTIVE_TASKS.md</span>
        {hub.tasks.lastSync && (
          <span style={{ color: THEME.textSecondary, fontSize: 12, fontFamily: 'monospace' }}>
            {new Date(hub.tasks.lastSync).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {columns.map(col => (
          <div key={col.key} style={styles.card}>
            <div style={{ ...styles.cardHeader, borderLeft: `4px solid ${col.color}` }}>
              <span style={{ color: col.color, fontSize: 14, fontWeight: 700 }}>{col.label}</span>
              <span style={{ ...styles.badge(col.color), marginLeft: 'auto' }}>{col.tasks.length}</span>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {col.tasks.length === 0 ? (
                <p style={{ color: THEME.textSecondary, fontSize: 12, textAlign: 'center', padding: 16 }}>Empty</p>
              ) : (
                col.tasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: `1px solid ${THEME.border}`,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = THEME.elevated}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <p style={{ color: THEME.text, fontSize: 13, fontWeight: 500, margin: 0 }}>{task.name}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ color: THEME.orange, fontSize: 10 }}>{task.owner}</span>
                      <span style={{ color: THEME.textSecondary, fontSize: 10 }}>{task.context}</span>
                      {task.due !== 'TBD' && (
                        <span style={{ color: THEME.yellow, fontSize: 10, marginLeft: 'auto' }}>{task.due}</span>
                      )}
                    </div>
                    {task.blocker && (
                      <p style={{ color: THEME.red, fontSize: 10, margin: '4px 0 0 0' }}>⚠ {task.blocker}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostTrackerPH({ hub }: { hub: HubData | null }) {
  if (!hub) return <p style={{ color: THEME.textSecondary, textAlign: 'center', padding: 32 }}>Loading costs...</p>;
  const { costs } = hub;

  const dailyPct = Math.min((costs.today / costs.dailyLimit) * 100, 100);
  const monthlyPct = Math.min((costs.thisMonth / costs.monthlyLimit) * 100, 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ color: THEME.text, fontWeight: 600 }}>TODAY</span>
          <span style={{ color: THEME.text, fontFamily: 'monospace' }}>
            ${costs.today.toFixed(2)} <span style={{ color: THEME.textSecondary }}>/ ${costs.dailyLimit.toFixed(2)}</span>
          </span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill(dailyPct), width: `${dailyPct}%` }} />
        </div>
        <p style={{ color: THEME.textSecondary, fontSize: 11, marginTop: 4 }}>{dailyPct.toFixed(0)}% of daily limit</p>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ color: THEME.text, fontWeight: 600 }}>THIS MONTH</span>
          <span style={{ color: THEME.text, fontFamily: 'monospace' }}>
            ${costs.thisMonth.toFixed(2)} <span style={{ color: THEME.textSecondary }}>/ ${costs.monthlyLimit.toFixed(2)}</span>
          </span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill(monthlyPct), width: `${monthlyPct}%` }} />
        </div>
        <p style={{ color: THEME.textSecondary, fontSize: 11, marginTop: 4 }}>{monthlyPct.toFixed(0)}% of monthly limit</p>
      </div>

      <div>
        <p style={{ color: THEME.textSecondary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>By Agent</p>
        <div style={styles.card}>
          {Object.entries(costs.byAgent).map(([agent, cost], i, arr) => (
            <div
              key={agent}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: i < arr.length - 1 ? `1px solid ${THEME.border}` : 'none',
              }}
            >
              <span style={{ color: THEME.text, fontSize: 14 }}>{agent}</span>
              <span style={{ color: THEME.orange, fontSize: 14, fontFamily: 'monospace', fontWeight: 600 }}>
                ${cost.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {costs.alerts.length > 0 && (
        <div style={{ border: `1px solid ${THEME.red}44`, borderRadius: 8, padding: 12, background: `${THEME.red}11` }}>
          {costs.alerts.map((a, i) => (
            <p key={i} style={{ color: THEME.red, fontSize: 12, margin: 0 }}>{a}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
type TabKey = 'agents' | 'tasks' | 'costs';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'agents', label: 'Agents' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'costs', label: 'Costs' },
];

export default function HubDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('agents');
  const [hub, setHub] = useState<HubData | null>(null);
  const [lastFetch, setLastFetch] = useState('');

  const selectedAgent = hoveredAgent ? ALL_AGENTS.find(a => a.id === hoveredAgent) : null;

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
    if (hex === ADMIN_HASH) {
      setUnlocked(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password.');
    }
  }

  if (!unlocked) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 320 }}>
          <p style={{ color: THEME.orange, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Agent Hub
          </p>
          <p style={{ color: THEME.textSecondary, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>
            Mission Control
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Access code"
              autoFocus
              style={styles.input}
            />
            {authError && <p style={{ color: THEME.red, fontSize: 12, marginTop: 8 }}>{authError}</p>}
            <button type="submit" style={{ ...styles.button, width: '100%', marginTop: 16 }}>
              Access →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ ...styles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <p style={{ color: THEME.orange, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
              Agent Hub
            </p>
            <h1 style={styles.title}>Mission Control</h1>
            <p style={styles.subtitle}>8 agents · Orbital command · Live data</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: THEME.green, animation: 'pulse 2s infinite' }} />
              <span style={{ color: THEME.green, fontSize: 12, fontWeight: 600 }}>LIVE</span>
            </div>
            {lastFetch && <span style={{ color: THEME.textSecondary, fontSize: 10 }}>synced {lastFetch}</span>}
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
          {/* Left - Constellation */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: `1px solid ${THEME.border}`,
                background: `radial-gradient(ellipse at center, ${THEME.orange}08, transparent 70%), ${THEME.surface}`,
              }}
            >
              <Constellation hoveredAgent={hoveredAgent} onHover={setHoveredAgent} />
            </div>

            <div style={{ marginTop: 16, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedAgent ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: THEME.text, fontWeight: 600, fontSize: 16 }}>
                    {selectedAgent.emoji} {selectedAgent.name}
                  </p>
                  <p style={{ color: THEME.textSecondary, fontSize: 14 }}>{selectedAgent.role}</p>
                  <p style={{ color: THEME.orange, fontSize: 12, fontFamily: 'monospace' }}>{selectedAgent.model}</p>
                </div>
              ) : (
                <p style={{ color: THEME.textSecondary, fontSize: 12 }}>Hover an agent to inspect</p>
              )}
            </div>
          </div>

          {/* Right - Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', marginBottom: 16, borderRadius: 4, overflow: 'hidden' }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    ...styles.tabButton,
                    ...(activeTab === tab.key ? styles.tabButtonActive : {}),
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'agents' && (
              <div style={styles.card}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 12,
                    padding: '12px 16px',
                    background: THEME.elevated,
                    borderBottom: `1px solid ${THEME.border}`,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: THEME.textSecondary,
                  }}
                >
                  <span>Agent</span>
                  <span>Model</span>
                  <span>Tier</span>
                </div>
                {ALL_AGENTS.map((agent, i) => (
                  <div
                    key={agent.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: i < ALL_AGENTS.length - 1 ? `1px solid ${THEME.border}` : 'none',
                      background: hoveredAgent === agent.id ? `${THEME.orange}11` : 'transparent',
                      cursor: 'default',
                    }}
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{agent.emoji}</span>
                      <div>
                        <p style={{ color: THEME.text, fontWeight: 600, fontSize: 14, margin: 0 }}>{agent.name}</p>
                        <p style={{ color: THEME.textSecondary, fontSize: 12, margin: 0 }}>{agent.role}</p>
                      </div>
                    </div>
                    <p style={{ color: THEME.textSecondary, fontSize: 12, fontFamily: 'monospace' }}>{agent.model}</p>
                    <span
                      style={{
                        color: agent.tier === 'premium' ? THEME.orange : agent.tier === 'mid' ? THEME.yellow : THEME.textSecondary,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      {agent.tier}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tasks' && <TaskKanbanPH hub={hub} />}
            {activeTab === 'costs' && <CostTrackerPH hub={hub} />}
          </div>
        </div>

        {/* Footer stats */}
        <div
          style={{
            marginTop: 32,
            padding: '16px 20px',
            borderRadius: 8,
            background: THEME.surface,
            border: `1px solid ${THEME.border}`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px 32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: THEME.textSecondary, fontSize: 12 }}>Gateway:</span>
            <span style={{ color: THEME.text, fontSize: 12, fontFamily: 'monospace' }}>ws://127.0.0.1:18789</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: THEME.textSecondary, fontSize: 12 }}>Version:</span>
            <span style={{ color: THEME.text, fontSize: 12, fontFamily: 'monospace' }}>1.0.0</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: THEME.textSecondary, fontSize: 12 }}>Node:</span>
            <span style={{ color: THEME.text, fontSize: 12, fontFamily: 'monospace' }}>v22.14.0</span>
          </div>
          {hub && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <span style={{ color: THEME.textSecondary, fontSize: 12 }}>Hub:</span>
              <span style={{ color: THEME.green, fontSize: 12, fontFamily: 'monospace' }}>v{hub.version}</span>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
