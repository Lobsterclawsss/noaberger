'use client';

import { useState, useEffect } from 'react';

// ── Types (mirrored from core/estimator.ts — no server dependency) ─────────

interface EstimateEntry {
  taskId: string;
  estimatedHours: number;
  actualHours?: number;
  agentId: string;
  projectType: string;
  ratio?: number;
}

interface HistoryStore {
  entries: EstimateEntry[];
}

interface AgentStats {
  agentId: string;
  sampleCount: number;
  avgRatio: number;
  stdDev: number;
  confidence: number;
  tendency: 'over' | 'under' | 'accurate';
}

interface Prediction {
  predictedHours: number;
  confidence: number;
  sampleCount: number;
  note: string;
}

// ── Pure math (no deps) ────────────────────────────────────────────────────

function stdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function calcConfidence(sampleCount: number, sd: number, avgRatio: number): number {
  const sampleScore = Math.min(0.9, 1 - 1 / (1 + sampleCount / 4));
  const cv = avgRatio > 0 ? sd / avgRatio : 1;
  const varianceScore = 1 - Math.min(0.5, cv);
  return Math.round(sampleScore * varianceScore * 100);
}

function computeStats(entries: EstimateEntry[]): AgentStats[] {
  const completed = entries.filter(e => e.ratio != null);
  const grouped: Record<string, EstimateEntry[]> = {};
  for (const e of completed) {
    if (!grouped[e.agentId]) grouped[e.agentId] = [];
    grouped[e.agentId].push(e);
  }

  return Object.entries(grouped)
    .map(([agentId, group]) => {
      const ratios   = group.map(e => e.ratio!);
      const avg      = ratios.reduce((s, r) => s + r, 0) / ratios.length;
      const sd       = stdDev(ratios, avg);
      const conf     = calcConfidence(ratios.length, sd, avg);
      return {
        agentId,
        sampleCount: ratios.length,
        avgRatio:    +avg.toFixed(3),
        stdDev:      +sd.toFixed(3),
        confidence:  conf,
        tendency:    avg > 1.1 ? 'over' as const : avg < 0.9 ? 'under' as const : 'accurate' as const,
      };
    })
    .sort((a, b) => b.sampleCount - a.sampleCount);
}

function computePrediction(
  estimatedHours: number,
  agentId: string,
  entries: EstimateEntry[],
): Prediction {
  const relevant = entries.filter(e => e.ratio != null && e.agentId === agentId);
  if (relevant.length < 2) {
    return {
      predictedHours: estimatedHours,
      confidence: 35,
      sampleCount: relevant.length,
      note: 'Insufficient history — using estimate as-is',
    };
  }

  const ratios   = relevant.map(e => e.ratio!);
  const avg      = ratios.reduce((s, r) => s + r, 0) / ratios.length;
  const sd       = stdDev(ratios, avg);
  const conf     = calcConfidence(relevant.length, sd, avg);
  const predicted = +(estimatedHours * avg).toFixed(2);
  const diffPct   = ((avg - 1) * 100).toFixed(0);
  const dir       = avg > 1.1 ? `runs ~${diffPct}% over`
                  : avg < 0.9 ? `runs ~${Math.abs(+diffPct)}% under`
                  : 'typically on-time';

  return {
    predictedHours: predicted,
    confidence: conf,
    sampleCount: relevant.length,
    note: `Based on ${relevant.length} tasks — ${dir}`,
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────

const TENDENCY_CONFIG = {
  over:      { label: 'tends over',  color: 'text-orange-400', dot: 'bg-orange-400' },
  under:     { label: 'tends under', color: 'text-mint',       dot: 'bg-mint'       },
  accurate:  { label: 'on target',   color: 'text-teal',       dot: 'bg-teal'       },
};

function ConfidenceRing({ confidence }: { confidence: number }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const offset = circ - (confidence / 100) * circ;
  const color = confidence >= 70 ? '#00C896'   // mint
              : confidence >= 45 ? '#F59E0B'   // amber
              : '#9CA3AF';                      // gray

  return (
    <div className="relative inline-flex items-center justify-center w-10 h-10 flex-shrink-0">
      <svg width={40} height={40} className="-rotate-90">
        <circle cx={20} cy={20} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
        <circle
          cx={20} cy={20} r={r} fill="none"
          stroke={color} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="absolute text-[9px] font-bold text-white">{confidence}%</span>
    </div>
  );
}

function AgentAccuracyRow({ stat }: { stat: AgentStats }) {
  const tc = TENDENCY_CONFIG[stat.tendency];
  const ratioColor = stat.avgRatio > 1.15 ? 'text-orange-400'
                   : stat.avgRatio < 0.85  ? 'text-mint'
                   : 'text-white';

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-surface hover:bg-elevated transition-colors">
      <ConfidenceRing confidence={stat.confidence} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white text-xs font-medium">{stat.agentId}</p>
          <span className={`text-[9px] px-1 py-0.5 rounded ${tc.color}`}>{tc.label}</span>
        </div>
        <p className="text-secondary text-[10px] mt-0.5">
          {stat.sampleCount} task{stat.sampleCount !== 1 ? 's' : ''} · ±{(stat.stdDev * 100).toFixed(0)}% variance
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-mono font-semibold ${ratioColor}`}>{stat.avgRatio.toFixed(2)}×</p>
        <p className="text-secondary text-[9px]">avg ratio</p>
      </div>
    </div>
  );
}

// ── Predict Widget ─────────────────────────────────────────────────────────

function PredictWidget({
  entries,
  defaultAgent,
}: {
  entries: EstimateEntry[];
  defaultAgent?: string;
}) {
  const agents = Array.from(new Set(entries.filter(e => e.ratio != null).map(e => e.agentId)));
  const [hours, setHours]   = useState('');
  const [agent, setAgent]   = useState(defaultAgent ?? agents[0] ?? '');
  const [result, setResult] = useState<Prediction | null>(null);

  function handlePredict() {
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0) return;
    setResult(computePrediction(h, agent, entries));
  }

  if (agents.length === 0) return null;

  return (
    <div className="border-t border-white/8 pt-3 mt-1">
      <p className="text-secondary text-[10px] uppercase tracking-wider mb-2">Predict task duration</p>
      <div className="flex gap-2">
        <input
          type="number" min="0.5" step="0.5" placeholder="hrs"
          value={hours} onChange={e => setHours(e.target.value)}
          className="w-16 bg-elevated border border-white/10 rounded-md px-2 py-1 text-white text-xs focus:outline-none focus:border-teal/50"
        />
        <select
          value={agent} onChange={e => setAgent(e.target.value)}
          className="flex-1 bg-elevated border border-white/10 rounded-md px-2 py-1 text-white text-xs focus:outline-none focus:border-teal/50"
        >
          {agents.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <button
          onClick={handlePredict}
          className="bg-teal hover:bg-teal-hover text-white text-xs font-medium px-3 py-1 rounded-md transition-colors"
        >
          →
        </button>
      </div>

      {result && (
        <div className="mt-2 p-2.5 rounded-lg border border-white/8 bg-elevated/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-secondary text-[10px]">Predicted actual</span>
            <span className="text-white text-sm font-mono font-semibold">
              {result.predictedHours}h
              {result.predictedHours !== parseFloat(hours) && (
                <span className={`text-xs ml-1 ${result.predictedHours > parseFloat(hours) ? 'text-orange-400' : 'text-mint'}`}>
                  ({result.predictedHours > parseFloat(hours) ? '+' : ''}{(result.predictedHours - parseFloat(hours)).toFixed(1)}h)
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary text-[10px]">Confidence</span>
            <span className={`text-xs font-semibold ${result.confidence >= 70 ? 'text-mint' : result.confidence >= 45 ? 'text-yellow-400' : 'text-secondary'}`}>
              {result.confidence}%
            </span>
          </div>
          <p className="text-secondary text-[10px] leading-relaxed">{result.note}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

interface EstimateConfidenceProps {
  /** If provided, only show stats for this agent and pre-select it in the predictor */
  agentId?: string;
  /** If provided, filter history to this project type */
  projectType?: string;
  /** Show the estimate predictor input */
  showPredictor?: boolean;
}

export default function EstimateConfidence({
  agentId,
  projectType,
  showPredictor = true,
}: EstimateConfidenceProps) {
  const [entries, setEntries] = useState<EstimateEntry[]>([]);
  const [error, setError]    = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/hub/estimate-history.json?t=' + Date.now());
        if (!res.ok) throw new Error();
        const data: HistoryStore = await res.json();
        setEntries(data.entries);
      } catch {
        setError(true);
      }
    }
    fetchHistory();
  }, []);

  if (error) return (
    <p className="text-secondary text-[10px] py-2">Estimate history unavailable</p>
  );

  if (entries.length === 0) return (
    <p className="text-secondary text-[10px] py-2">Loading accuracy data...</p>
  );

  const filtered = projectType
    ? entries.filter(e => e.projectType === projectType)
    : entries;

  const stats = computeStats(filtered);
  const visibleStats = agentId ? stats.filter(s => s.agentId === agentId) : stats;

  if (visibleStats.length === 0) return (
    <p className="text-secondary text-[10px] py-2">No completed tasks for this context yet</p>
  );

  return (
    <div className="space-y-2">
      <p className="text-secondary text-[10px] uppercase tracking-wider">Estimate Accuracy</p>

      <div className="border border-white/8 rounded-xl overflow-hidden divide-y divide-white/6">
        {visibleStats.map(stat => (
          <AgentAccuracyRow key={stat.agentId} stat={stat} />
        ))}
      </div>

      {showPredictor && (
        <PredictWidget entries={filtered} defaultAgent={agentId} />
      )}
    </div>
  );
}
