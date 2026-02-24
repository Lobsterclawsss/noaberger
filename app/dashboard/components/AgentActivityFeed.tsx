'use client';

import { useEffect, useRef } from 'react';

export interface AgentActivityEntry {
  id: string;
  timestamp: string;
  agentId: string;
  action: 'start' | 'complete' | 'error' | 'progress' | 'decision';
  task: string;
  details?: string;
}

interface AgentActivityFeedProps {
  hub: {
    agentActivity?: AgentActivityEntry[];
    lastUpdated?: string;
  } | null;
}

const ACTION_STYLES: Record<string, { icon: string; color: string; bg: string }> = {
  start:    { icon: '▶', color: 'text-teal',        bg: 'bg-teal/10' },
  complete: { icon: '✓', color: 'text-mint',        bg: 'bg-mint/10' },
  error:    { icon: '✗', color: 'text-red-400',     bg: 'bg-red-400/10' },
  progress: { icon: '⋯', color: 'text-blue-400',    bg: 'bg-blue-400/10' },
  decision: { icon: '◆', color: 'text-purple-400',  bg: 'bg-purple-400/10' },
};

const AGENT_SHORT: Record<string, string> = {
  main: 'Clawd',
  'agency-leader': 'Agency',
  'azul-leader': 'Azul',
  Administrator: 'Admin',
  Researcher: 'Research',
  'bleukei-leader': 'Bleukei',
  'the-archivist': 'Archivist',
  'the-deblocker': 'Deblocker',
};

function relTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function AgentActivityFeed({ hub }: AgentActivityFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const entries = (hub?.agentActivity ?? [])
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [hub?.lastUpdated]);

  return (
    <div className="border border-white/8 rounded-xl bg-surface p-4 flex flex-col" style={{ minHeight: 220 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Agent Activity</span>
        </div>
        {entries.length > 0 && (
          <span className="text-xs text-secondary font-mono">{entries.length} events</span>
        )}
      </div>

      {/* Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 max-h-48 pr-1">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 gap-2">
            <span className="text-secondary text-xs">No activity yet</span>
            <span className="text-secondary/50 text-xs font-mono">agents call activity_log to appear here</span>
          </div>
        ) : (
          entries.map((entry) => {
            const style = ACTION_STYLES[entry.action] ?? ACTION_STYLES.progress!;
            const agentName = AGENT_SHORT[entry.agentId] ?? entry.agentId;
            return (
              <div key={entry.id} className={`flex items-start gap-2 px-2 py-1.5 rounded-lg ${style.bg}`}>
                <span className={`text-xs font-mono mt-0.5 flex-shrink-0 ${style.color}`}>{style.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-semibold ${style.color}`}>{agentName}</span>
                    <span className="text-secondary text-xs truncate">{entry.task.slice(0, 60)}</span>
                  </div>
                  {entry.details && (
                    <p className="text-secondary/70 text-xs mt-0.5 truncate">{entry.details.slice(0, 80)}</p>
                  )}
                </div>
                <span className="text-secondary/50 text-xs font-mono flex-shrink-0 ml-auto">{relTime(entry.timestamp)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
