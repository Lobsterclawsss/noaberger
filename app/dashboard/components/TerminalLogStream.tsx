'use client';

import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  id?: string;
  timestamp: string;
  agent: string;
  action: string;
  type: string;
}

interface TerminalLogStreamProps {
  hub: {
    activity?: LogEntry[];
    lastUpdated?: string;
  } | null;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  success: { bg: 'bg-mint/10', text: 'text-mint', icon: '✓' },
  info: { bg: 'bg-teal/10', text: 'text-teal', icon: 'ℹ' },
  warn: { bg: 'bg-orange-400/10', text: 'text-orange-400', icon: '⚠' },
  milestone: { bg: 'bg-purple-400/10', text: 'text-purple-400', icon: '★' },
  error: { bg: 'bg-red-400/10', text: 'text-red-400', icon: '✗' },
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

function truncateAction(action: string, maxLen: number = 50): string {
  if (action.length <= maxLen) return action;
  return action.slice(0, maxLen - 3) + '...';
}

export default function TerminalLogStream({ hub }: TerminalLogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const activities = hub?.activity || [];
  
  // Get last 10 activities, sorted by timestamp desc
  const recentLogs = activities
    .slice(0, 10)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Auto-scroll effect when new data arrives
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [hub?.lastUpdated, autoScroll]);

  return (
    <div className="border border-white/8 rounded-xl bg-surface overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-elevated border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-mint/80" />
          </div>
          <span className="text-secondary text-[10px] font-mono ml-2">activity.log</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-mint text-[10px] font-mono animate-pulse">● LIVE</span>
          <button 
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
              autoScroll ? 'bg-teal/20 text-teal' : 'bg-white/5 text-secondary hover:text-white'
            }`}
          >
            AUTO
          </button>
        </div>
      </div>

      {/* Log Stream */}
      <div 
        ref={scrollRef}
        className="h-48 overflow-y-auto font-mono text-xs scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{ scrollBehavior: 'smooth' }}
      >
        {recentLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-secondary">
            <span className="text-[10px]">Waiting for activity...</span>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {recentLogs.map((log, index) => {
              const style = TYPE_STYLES[log.type] || TYPE_STYLES.info;
              const isLatest = index === 0;
              
              return (
                <div 
                  key={log.id || `${log.timestamp}-${index}`}
                  className={`flex items-start gap-2 px-2 py-1.5 rounded transition-all ${
                    isLatest ? 'bg-white/5' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Timestamp */}
                  <span className="text-secondary/60 text-[10px] flex-shrink-0 w-16">
                    {formatTime(log.timestamp)}
                  </span>
                  
                  {/* Status Badge */}
                  <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center ${style.bg}`}>
                    <span className={`text-[10px] ${style.text}`}>{style.icon}</span>
                  </div>
                  
                  {/* Agent Name */}
                  <span className="text-teal text-[10px] flex-shrink-0 w-20 truncate">
                    {log.agent}
                  </span>
                  
                  {/* Action */}
                  <span className="text-white/80 text-[10px] truncate flex-1" title={log.action}>
                    {truncateAction(log.action)}
                  </span>
                  
                  {/* Type indicator */}
                  <span className={`text-[9px] uppercase tracking-wider ${style.text} flex-shrink-0`}>
                    {log.type}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-elevated border-t border-white/8">
        <span className="text-secondary text-[10px]">
          {recentLogs.length} events
        </span>
        <span className="text-secondary/60 text-[9px] font-mono">
          {hub?.lastUpdated ? `synced ${new Date(hub.lastUpdated).toLocaleTimeString()}` : 'pending...'}
        </span>
      </div>
    </div>
  );
}
