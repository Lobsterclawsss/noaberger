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

// ─── Activity Feed ─────────────────────────────────────────────────────────────
const ACTIVITIES = [
  { time: '2026-02-22', agent: 'Claude Code', action: 'Cost optimization complete — 10 crons rerouted, 7x savings', type: 'success' },
  { time: '2026-02-22', agent: 'Claude Code', action: 'Security hardening applied — HSTS + CSP headers live', type: 'success' },
  { time: '2026-02-22', agent: 'Claude Code', action: 'Context pruning enabled — 30min TTL, soft trim at 65%', type: 'info' },
  { time: '2026-02-21', agent: 'Claude Code', action: 'GSAP scroll animation system deployed to noaberger.com', type: 'success' },
  { time: '2026-02-21', agent: 'Claude Code', action: 'noaberger.com launched — Cloudflare Pages, static export', type: 'success' },
  { time: '2026-02-21', agent: 'Clawd',        action: 'Session auto-review cron active — archives >70% context', type: 'info' },
  { time: '2026-02-19', agent: 'Clawd',        action: '8 new skills installed: notion, github, obsidian, gmail...', type: 'info' },
  { time: '2026-02-18', agent: 'Claude Code',  action: 'Discord channel integrated — guild 1473183121041129485', type: 'info' },
];

const ACTIVITY_DOT: Record<string, string> = {
  success: 'bg-mint', info: 'bg-teal', warn: 'bg-orange-400',
};

// ─── System Stats ─────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Gateway', value: 'ws://127.0.0.1:18789' },
  { label: 'Version', value: 'OpenClaw v2026.2.21-2' },
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
  const containerRef = useRef<HTMLDivElement>(null);
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
          const x = Math.cos(rad) * agent.radius;
          const y = Math.sin(rad) * agent.radius;
          el.style.transform = `translate(${x}px, ${y}px)`;
        }
        // Update SVG line
        const line = document.getElementById(`orbit-line-${agent.id}`);
        if (line) {
          const rad = (anglesRef.current[i] * Math.PI) / 180;
          const x2 = 280 + Math.cos(rad) * agent.radius;
          const y2 = 280 + Math.sin(rad) * agent.radius;
          line.setAttribute('x2', String(x2));
          line.setAttribute('y2', String(y2));
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Pulse center node on mount
  const centerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!centerRef.current) return;
    gsap.to(centerRef.current, {
      boxShadow: '0 0 40px rgba(6,131,161,0.8)',
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: 'power2.inOut',
    });
  }, []);

  const size = 560; // SVG + container size
  const center = size / 2;

  return (
    <div ref={containerRef} className="relative" style={{ width: size, height: size, maxWidth: '100%' }}>
      {/* SVG orbital rings + lines */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        {/* Orbital ring paths */}
        {[120, 185, 250].map((r) => (
          <circle
            key={r}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
        ))}
        {/* Connection lines from center to each agent */}
        {ORBIT_AGENTS.map((agent) => {
          const rad = (agent.startAngle * Math.PI) / 180;
          return (
            <line
              key={agent.id}
              id={`orbit-line-${agent.id}`}
              x1={center}
              y1={center}
              x2={center + Math.cos(rad) * agent.radius}
              y2={center + Math.sin(rad) * agent.radius}
              stroke={hoveredAgent === agent.id ? agent.color : 'rgba(6,131,161,0.2)'}
              strokeWidth={hoveredAgent === agent.id ? 1.5 : 0.8}
              style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
            />
          );
        })}
      </svg>

      {/* Center node — Clawd */}
      <div
        className="absolute"
        style={{
          left: center,
          top: center,
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}
      >
        <div
          ref={centerRef}
          className="w-20 h-20 rounded-full bg-surface border-2 border-teal flex flex-col items-center justify-center cursor-default"
          style={{ boxShadow: '0 0 20px rgba(6,131,161,0.4)' }}
        >
          <span className="text-2xl">🦞</span>
          <span className="text-white text-xs font-bold mt-0.5">Clawd</span>
        </div>
      </div>

      {/* Orbiting agent nodes */}
      {ORBIT_AGENTS.map((agent) => {
        const rad = (agent.startAngle * Math.PI) / 180;
        const initX = Math.cos(rad) * agent.radius;
        const initY = Math.sin(rad) * agent.radius;
        const isHovered = hoveredAgent === agent.id;

        return (
          <div
            key={agent.id}
            id={`orbit-node-${agent.id}`}
            className="absolute flex flex-col items-center cursor-pointer"
            style={{
              left: center,
              top: center,
              transform: `translate(${initX}px, ${initY}px)`,
              zIndex: 5,
            }}
            onMouseEnter={() => onHover(agent.id)}
            onMouseLeave={() => onHover(null)}
          >
            <div
              className="w-12 h-12 rounded-full flex flex-col items-center justify-center border transition-all duration-200"
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'agents' | 'activity'>('agents');

  const selectedAgent = hoveredAgent
    ? ALL_AGENTS.find((a) => a.id === hoveredAgent)
    : null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const encoder = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', encoder.encode(password));
    const hex = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    if (hex === ADMIN_HASH) {
      setUnlocked(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password.');
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xs">
          <p className="text-teal text-xs tracking-widest uppercase mb-2">OpenClaw</p>
          <p className="text-secondary text-xs tracking-widest uppercase mb-6">Agent Control Center</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Access code"
              autoFocus
              className="w-full bg-elevated border border-white/10 rounded-lg px-4 py-3 text-white placeholder-secondary focus:outline-none focus:border-teal/50 text-sm"
            />
            {authError && <p className="text-red-400 text-xs">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-teal hover:bg-teal-hover text-white py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Access →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 fade-in">
          <div>
            <p className="text-teal text-xs font-semibold tracking-widest uppercase mb-1">OpenClaw</p>
            <h1 className="text-2xl font-bold text-white">Agent Control Center</h1>
            <p className="text-secondary text-sm mt-1">8 agents · 3 orbital tiers · Live since 2026-02-18</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            <span className="text-mint text-xs font-medium">LIVE</span>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">

          {/* Left — Constellation */}
          <div className="flex flex-col items-center">
            <div
              className="relative rounded-2xl overflow-hidden border border-white/8 bg-surface p-4"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(6,131,161,0.05) 0%, transparent 70%), var(--bg-surface)',
              }}
            >
              <Constellation hoveredAgent={hoveredAgent} onHover={setHoveredAgent} />
            </div>

            {/* Hover tooltip */}
            <div
              className="mt-4 h-16 flex items-center justify-center transition-all duration-200"
            >
              {selectedAgent ? (
                <div className="text-center fade-in">
                  <p className="text-white font-semibold">
                    {selectedAgent.emoji} {selectedAgent.name}
                  </p>
                  <p className="text-secondary text-sm">{selectedAgent.role}</p>
                  <p className="text-teal text-xs font-mono mt-0.5">{selectedAgent.model}</p>
                </div>
              ) : (
                <p className="text-secondary text-xs">Hover an agent to inspect</p>
              )}
            </div>

            {/* Orbital legend */}
            <div className="flex gap-6 mt-2">
              {[
                { r: 'Inner', label: 'Coordination', color: 'border-teal/40' },
                { r: 'Mid', label: 'Research/Visual', color: 'border-purple-400/40' },
                { r: 'Outer', label: 'Recovery', color: 'border-orange-400/40' },
              ].map((tier) => (
                <div key={tier.r} className="flex items-center gap-2">
                  <div className={`w-4 h-px border-t border-dashed ${tier.color}`} style={{ width: 16 }} />
                  <span className="text-secondary text-xs">{tier.r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Tabs */}
          <div className="flex flex-col">
            {/* Tab switcher */}
            <div className="flex gap-1 mb-4 bg-surface rounded-lg p-1 border border-white/8">
              {(['agents', 'activity'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors capitalize tracking-wide ${
                    activeTab === tab
                      ? 'bg-elevated text-white'
                      : 'text-secondary hover:text-white'
                  }`}
                >
                  {tab === 'agents' ? 'Agents' : 'Activity'}
                </button>
              ))}
            </div>

            {/* Agents tab */}
            {activeTab === 'agents' && (
              <div className="border border-white/8 rounded-xl overflow-hidden">
                {/* Header row */}
                <div className="grid grid-cols-[auto_1fr_auto] gap-3 px-4 py-2 bg-elevated border-b border-white/8">
                  <span className="text-secondary text-xs uppercase tracking-wider">Agent</span>
                  <span className="text-secondary text-xs uppercase tracking-wider">Model</span>
                  <span className="text-secondary text-xs uppercase tracking-wider">Tier</span>
                </div>
                {/* Center agent */}
                <div
                  className={`grid grid-cols-[auto_1fr_auto] gap-3 items-center px-4 py-3 border-b border-white/6 transition-colors cursor-default ${
                    hoveredAgent === 'main' ? 'bg-teal/5' : 'bg-surface hover:bg-elevated'
                  }`}
                  onMouseEnter={() => setHoveredAgent('main')}
                  onMouseLeave={() => setHoveredAgent(null)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🦞</span>
                    <div>
                      <p className="text-white text-sm font-semibold">{CENTER_AGENT.name}</p>
                      <p className="text-secondary text-xs">{CENTER_AGENT.role}</p>
                    </div>
                  </div>
                  <p className="text-teal text-xs font-mono">{CENTER_AGENT.model}</p>
                  <span className={`text-xs font-semibold ${TIER_COLOR[CENTER_AGENT.tier]}`}>
                    {TIER_LABEL[CENTER_AGENT.tier]}
                  </span>
                </div>
                {/* Orbit agents */}
                {ORBIT_AGENTS.map((agent, i) => (
                  <div
                    key={agent.id}
                    className={`grid grid-cols-[auto_1fr_auto] gap-3 items-center px-4 py-3 border-b border-white/6 last:border-0 transition-colors cursor-default ${
                      hoveredAgent === agent.id ? 'bg-teal/5' : 'bg-surface hover:bg-elevated'
                    }`}
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{agent.emoji}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{agent.name}</p>
                        <p className="text-secondary text-xs">{agent.role}</p>
                      </div>
                    </div>
                    <p className="text-secondary text-xs font-mono">{agent.model}</p>
                    <span className={`text-xs font-medium ${TIER_COLOR[agent.tier]}`}>
                      {TIER_LABEL[agent.tier]}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Activity tab */}
            {activeTab === 'activity' && (
              <div className="border border-white/8 rounded-xl overflow-hidden">
                {ACTIVITIES.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-3 px-4 py-3 border-b border-white/6 last:border-0 bg-surface hover:bg-elevated transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full block ${ACTIVITY_DOT[item.type] ?? 'bg-secondary'}`}
                      />
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
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-secondary text-xs">{stat.label}:</span>
                <span className="text-white text-xs font-mono">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
