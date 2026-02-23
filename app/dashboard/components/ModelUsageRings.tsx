'use client';

import { useMemo } from 'react';

interface CostBreakdown {
  byAgent: Record<string, number>;
  today: number;
  dailyLimit: number;
}

interface ModelUsageRingsProps {
  hub: {
    costs?: CostBreakdown;
  } | null;
}

// Model tier classification
const MODEL_TIERS: Record<string, { tier: 'premium' | 'mid' | 'budget'; label: string; color: string }> = {
  'kimi-k2.5': { tier: 'premium', label: 'Kimi K2.5', color: '#0683a1' },
  'claude-sonnet-4-6': { tier: 'premium', label: 'Claude Sonnet', color: '#C084FC' },
  'claude-haiku-4-5': { tier: 'mid', label: 'Claude Haiku', color: '#FB923C' },
  'gemini-3-pro': { tier: 'mid', label: 'Gemini Pro', color: '#4488FF' },
  'flash-lite': { tier: 'budget', label: 'Flash Lite', color: '#00D4AA' },
  'flash-image': { tier: 'budget', label: 'Flash Image', color: '#FF6B9D' },
  'default': { tier: 'budget', label: 'Other', color: '#A0A0A0' }
};

const TIER_COLORS = {
  premium: { bg: 'bg-teal', text: 'text-teal', ring: '#0683a1', label: 'Premium' },
  mid: { bg: 'bg-orange-400', text: 'text-orange-400', ring: '#FB923C', label: 'Standard' },
  budget: { bg: 'bg-mint', text: 'text-mint', ring: '#4ADE80', label: 'Efficient' }
};

export default function ModelUsageRings({ hub }: ModelUsageRingsProps) {
  const tierData = useMemo(() => {
    const byAgent = hub?.costs?.byAgent || {};
    const dailyTotal = hub?.costs?.today || 0;
    const dailyLimit = hub?.costs?.dailyLimit || 5;

    // Group by tier
    const tiers: Record<string, { cost: number; agents: string[] }> = {
      premium: { cost: 0, agents: [] },
      mid: { cost: 0, agents: [] },
      budget: { cost: 0, agents: [] }
    };

    Object.entries(byAgent).forEach(([agent, cost]) => {
      // Determine tier based on agent name patterns
      let tier: 'premium' | 'mid' | 'budget' = 'budget';
      let modelInfo = MODEL_TIERS.default;
      
      // Check for specific agent/pattern matches
      const agentLower = agent.toLowerCase();
      if (agentLower.includes('kimi') || agentLower.includes('brian') || agentLower.includes('claude-code')) {
        tier = 'premium';
        modelInfo = MODEL_TIERS['kimi-k2.5'];
      } else if (agentLower.includes('deblocker') || agentLower.includes('antigravity')) {
        tier = 'mid';
        modelInfo = MODEL_TIERS['claude-haiku-4-5'];
      } else if (agentLower.includes('admin') || agentLower.includes('agency') || agentLower.includes('azul') || agentLower.includes('archivist') || agentLower.includes('bleukei')) {
        tier = 'budget';
        modelInfo = MODEL_TIERS['flash-lite'];
      }

      tiers[tier].cost += cost;
      if (!tiers[tier].agents.find(a => a === agent)) {
        tiers[tier].agents.push(agent);
      }
    });

    // Calculate percentages
    const totalTracked = Object.values(tiers).reduce((sum, t) => sum + t.cost, 0);
    
    return {
      tiers,
      totalTracked,
      dailyTotal,
      dailyLimit,
      utilization: Math.min((dailyTotal / dailyLimit) * 100, 100)
    };
  }, [hub?.costs]);

  // SVG ring configuration
  const size = 200;
  const center = size / 2;
  const strokeWidth = 12;
  const gap = 4;
  
  const rings = [
    { radius: 70, tier: 'premium', data: tierData.tiers.premium },
    { radius: 85, tier: 'mid', data: tierData.tiers.mid },
    { radius: 100, tier: 'budget', data: tierData.tiers.budget }
  ];

  return (
    <div className="border border-white/8 rounded-xl bg-surface p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white text-sm font-semibold">Model Usage</h3>
          <p className="text-secondary text-[10px]">Cost by tier</p>
        </div>
        <div className="text-right">
          <p className="text-white text-xs font-mono">${tierData.dailyTotal.toFixed(2)}</p>
          <p className="text-secondary text-[9px]">/ ${tierData.dailyLimit}/day</p>
        </div>
      </div>

      {/* Rings Visualization */}
      <div className="flex items-center justify-center py-2">
        <svg width={size} height={size}>
          {rings.map(({ radius, tier, data }) => {
            const circumference = 2 * Math.PI * radius;
            const percentage = tierData.dailyTotal > 0 
              ? (data.cost / tierData.dailyTotal) 
              : 0;
            const strokeDasharray = `${circumference * percentage} ${circumference}`;
            const offset = circumference * 0.25; // Start from top
            const tierColor = TIER_COLORS[tier as keyof typeof TIER_COLORS];

            return (
              <g key={tier}>
                {/* Background track */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={strokeWidth}
                />
                {/* Usage arc */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={tierColor.ring}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  style={{
                    filter: percentage > 0 ? `drop-shadow(0 0 4px ${tierColor.ring})` : 'none',
                    transition: 'all 0.5s ease-out'
                  }}
                />
                {/* Percentage label on ring */}
                {percentage > 0.1 && (
                  <text
                    x={center + (radius + 20) * Math.cos(-Math.PI / 2 + 2 * Math.PI * percentage / 2)}
                    y={center + (radius + 20) * Math.sin(-Math.PI / 2 + 2 * Math.PI * percentage / 2)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white text-[9px] font-mono"
                  >
                    {Math.round(percentage * 100)}%
                  </text>
                )}
              </g>
            );
          })}

          {/* Center utilization */}
          <text
            x={center}
            y={center - 5}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-lg font-bold"
          >
            {tierData.utilization.toFixed(0)}%
          </text>
          <text
            x={center}
            y={center + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-secondary text-[8px] uppercase tracking-wider"
          >
            Used
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-2">
        {rings.map(({ tier, data }) => {
          const tierColor = TIER_COLORS[tier as keyof typeof TIER_COLORS];
          const percentage = tierData.dailyTotal > 0 
            ? Math.round((data.cost / tierData.dailyTotal) * 100)
            : 0;

          return (
            <div key={tier} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ background: tierColor.ring }}
                />
                <span className="text-white text-xs">{tierColor.label}</span>
                <span className="text-secondary text-[9px]">
                  ({data.agents.length} agent{data.agents.length !== 1 ? 's' : ''})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${tierColor.text}`}>
                  ${data.cost.toFixed(2)}
                </span>
                <span className="text-secondary text-[9px]">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily limit progress */}
      <div className="mt-4 pt-3 border-t border-white/8">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-secondary text-[10px]">Daily Budget</span>
          <span className={`text-[10px] font-mono ${
            tierData.utilization >= 80 ? 'text-red-400' : 
            tierData.utilization >= 60 ? 'text-orange-400' : 'text-mint'
          }`}>
            {tierData.utilization.toFixed(0)}%
          </span>
        </div>
        <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              tierData.utilization >= 80 ? 'bg-red-400' : 
              tierData.utilization >= 60 ? 'bg-orange-400' : 'bg-gradient-to-r from-teal to-mint'
            }`}
            style={{ width: `${tierData.utilization}%` }}
          />
        </div>
      </div>
    </div>
  );
}
