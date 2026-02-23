'use client';

import { useMemo } from 'react';

interface ActivityItem {
  timestamp: string;
  agent: string;
  action: string;
  type: string;
}

interface RadialHeatmapProps {
  hub: {
    activity?: ActivityItem[];
  } | null;
}

const HOUR_LABELS = [
  '12AM', '1AM', '2AM', '3AM', '4AM', '5AM',
  '6AM', '7AM', '8AM', '9AM', '10AM', '11AM',
  '12PM', '1PM', '2PM', '3PM', '4PM', '5PM',
  '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'
];

// Color scale based on activity intensity (dark theme: teal/mint/purple accents)
function getActivityColor(intensity: number): string {
  if (intensity === 0) return 'rgba(255,255,255,0.03)';
  if (intensity <= 0.25) return 'rgba(6,131,161,0.4)';   // teal-700
  if (intensity <= 0.5) return 'rgba(6,131,161,0.7)';    // teal-500
  if (intensity <= 0.75) return 'rgba(74,222,128,0.6)';  // mint-400
  return 'rgba(192,132,252,0.8)';                        // purple-400 (peak)
}

function getActivityGlow(intensity: number): string {
  if (intensity <= 0.5) return 'none';
  if (intensity <= 0.75) return '0 0 8px rgba(74,222,128,0.3)';
  return '0 0 12px rgba(192,132,252,0.4)';
}

export default function RadialHeatmap({ hub }: RadialHeatmapProps) {
  const hourData = useMemo(() => {
    const activity = hub?.activity || [];
    const now = new Date();
    const currentHour = now.getHours();
    
    // Count activities per hour for the last 24h
    const hourCounts = new Array(24).fill(0);
    const maxEvents = Math.max(1, ...activity.map(() => 1)); // Base for normalization
    
    activity.forEach(item => {
      const itemDate = new Date(item.timestamp);
      const hoursAgo = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursAgo >= 0 && hoursAgo < 24) {
        const hourIndex = itemDate.getHours();
        hourCounts[hourIndex]++;
      }
    });

    const maxCount = Math.max(1, ...hourCounts);
    
    return hourCounts.map((count, hour) => ({
      hour,
      count,
      intensity: count / maxCount,
      isCurrentHour: hour === currentHour
    }));
  }, [hub?.activity]);

  const totalEvents = hourData.reduce((sum, h) => sum + h.count, 0);
  const peakHour = hourData.reduce((max, h) => h.count > max.count ? h : max, hourData[0]);

  // SVG configuration
  const size = 280;
  const center = size / 2;
  const outerRadius = 100;
  const innerRadius = 45;
  const strokeWidth = (2 * Math.PI * outerRadius) / 24 - 2; // Gap between segments

  return (
    <div className="border border-white/8 rounded-xl bg-surface p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white text-sm font-semibold">Activity Intensity</h3>
          <p className="text-secondary text-[10px]">24-hour cycle</p>
        </div>
        <div className="text-right">
          <p className="text-mint text-xs font-mono">{totalEvents} events</p>
          <p className="text-secondary text-[9px]">Peak: {HOUR_LABELS[peakHour.hour]}</p>
        </div>
      </div>

      {/* Radial Chart */}
      <div className="flex items-center justify-center relative" style={{ height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={(outerRadius + innerRadius) / 2}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={outerRadius - innerRadius}
          />

          {/* Hour segments */}
          {hourData.map((data, index) => {
            const startAngle = (index * 360) / 24;
            const endAngle = ((index + 1) * 360) / 24;
            
            // Create arc path
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const x1 = center + outerRadius * Math.cos(startRad);
            const y1 = center + outerRadius * Math.sin(startRad);
            const x2 = center + outerRadius * Math.cos(endRad);
            const y2 = center + outerRadius * Math.sin(endRad);
            
            const x3 = center + innerRadius * Math.cos(endRad);
            const y3 = center + innerRadius * Math.sin(endRad);
            const x4 = center + innerRadius * Math.cos(startRad);
            const y4 = center + innerRadius * Math.sin(startRad);
            
            const path = [
              `M ${x1} ${y1}`,
              `A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2}`,
              `L ${x3} ${y3}`,
              `A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4}`,
              'Z'
            ].join(' ');

            return (
              <path
                key={index}
                d={path}
                fill={getActivityColor(data.intensity)}
                stroke={data.isCurrentHour ? 'rgba(74,222,128,0.6)' : 'transparent'}
                strokeWidth={data.isCurrentHour ? 1 : 0}
                style={{
                  filter: getActivityGlow(data.intensity),
                  transition: 'all 0.3s ease'
                }}
                className="hover:opacity-80 cursor-pointer"
              >
                <title>{`${HOUR_LABELS[index]}: ${data.count} events`}</title>
              </path>
            );
          })}

          {/* Hour markers */}
          {[0, 6, 12, 18].map(hour => {
            const angle = (hour * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const x = center + (outerRadius + 12) * Math.cos(rad);
            const y = center + (outerRadius + 12) * Math.sin(rad);
            
            return (
              <text
                key={hour}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-secondary text-[8px] font-mono"
                transform={`rotate(90 ${x} ${y})`}
              >
                {HOUR_LABELS[hour]}
              </text>
            );
          })}
        </svg>

        {/* Center info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-white text-2xl font-bold">{new Date().getHours()}</p>
            <p className="text-secondary text-[10px] uppercase tracking-wider">Current Hour</p>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(255,255,255,0.03)' }} />
            <span className="text-secondary text-[8px]">0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-1.5 rounded-sm flex">
              <div className="flex-1" style={{ background: 'rgba(6,131,161,0.4)' }} />
              <div className="flex-1" style={{ background: 'rgba(6,131,161,0.7)' }} />
              <div className="flex-1" style={{ background: 'rgba(74,222,128,0.6)' }} />
              <div className="flex-1" style={{ background: 'rgba(192,132,252,0.8)' }} />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-secondary text-[8px]">Peak</span>
            <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(192,132,252,0.8)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
