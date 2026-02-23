'use client';

import { useState, useEffect, useCallback } from 'react';
import EstimateConfidence from './EstimateConfidence';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Task {
  id: string;
  name: string;
  chapterIds: string[];
  agent: string;
  agentEmoji: string;
  status: string;
  statusColor: string;
  estimatedTime: number | null;
  actualTime: number | null;
  cost: number | null;
  dueDate: string | null;
  priority: string | null;
}

interface Chapter {
  id: string;
  name: string;
  projectIds: string[];
  statusPercent: number;
  status: string;
  statusColor: string;
  estimatedHours: number | null;
  actualHours: number | null;
  order: number;
  tasks: Task[];
  cost: number;
}

interface Project {
  id: string;
  name: string;
  statusPercent: number;
  status: string;
  statusColor: string;
  budgetTotal: number;
  budgetSpent: number;
  agentOwner: string;
  agentEmoji: string;
  client: string;
  priority: string | null;
  dueDate: string | null;
  chapters: Chapter[];
  totalTasks: number;
  completedTasks: number;
  totalCost: number;
  budgetRemaining: number;
}

interface ProjectsData {
  version: string;
  lastUpdated: string;
  source: string;
  stats: {
    totalProjects: number;
    totalChapters: number;
    totalTasks: number;
    activeProjects: number;
    completedProjects: number;
  };
  projects: Project[];
}

interface EditingState {
  projectId: string | null;
  chapterId: string | null;
  taskId: string | null;
  field: string | null;
  value: string | number;
}

interface ActiveTimer {
  taskId: string;
  startedAt: string;
}

// ─── Progress Ring Component ──────────────────────────────────────────────────
function ProgressRing({ 
  progress, 
  size = 60, 
  strokeWidth = 4, 
  color = '#3b82f6',
  label
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-sm font-bold">
          {Math.round(progress * 100)}%
        </span>
      </div>
      {label && (
        <span className="absolute -bottom-4 text-[10px] text-secondary">{label}</span>
      )}
    </div>
  );
}

// ─── Budget Bar Component ─────────────────────────────────────────────────────
function BudgetBar({ spent, total }: { spent: number; total: number }) {
  const percent = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
  const color = percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-orange-400' : 'bg-mint';
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-secondary">${spent.toLocaleString()}</span>
        <span className="text-secondary">${total.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ─── Agent Avatar Component ───────────────────────────────────────────────────
function AgentAvatar({ emoji, name, size = 'sm' }: { emoji: string; name: string; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  
  return (
    <div 
      className={`${sizeClasses} rounded-full bg-elevated border border-white/10 flex items-center justify-center`}
      title={name}
    >
      {emoji}
    </div>
  );
}

// ─── Priority Badge Component ─────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;
  
  const colors: Record<string, string> = {
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
    'High': 'bg-orange-400/20 text-orange-400 border-orange-400/30',
    'Normal': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Low': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };
  
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors[priority] || colors.Normal}`}>
      {priority}
    </span>
  );
}

// ─── Status Badge Component ───────────────────────────────────────────────────
function StatusBadge({ status, color }: { status: string; color: string }) {
  return (
    <span 
      className="text-[10px] px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {status}
    </span>
  );
}

// ─── Progress Slider Component ────────────────────────────────────────────────
function ProgressSlider({ 
  value, 
  onChange, 
  onSave, 
  color 
}: { 
  value: number; 
  onChange: (val: number) => void;
  onSave: () => void;
  color: string;
}) {
  const percent = Math.round(value * 100);
  
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min="0"
        max="100"
        value={percent}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        onMouseUp={onSave}
        onTouchEnd={onSave}
        className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} ${percent}%, rgba(255,255,255,0.1) ${percent}%)`
        }}
      />
      <span className="text-white text-xs font-mono w-10 text-right">{percent}%</span>
    </div>
  );
}

// ─── Inline Edit Field Component ──────────────────────────────────────────────
function InlineEditField({
  value,
  type = 'text',
  onSave,
  onCancel,
  options
}: {
  value: string | number;
  type?: 'text' | 'number' | 'select';
  onSave: (val: string | number) => void;
  onCancel: () => void;
  options?: string[];
}) {
  const [editValue, setEditValue] = useState(value);
  
  const handleSave = () => {
    onSave(type === 'number' ? Number(editValue) : editValue);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onCancel();
  };
  
  if (type === 'select' && options) {
    return (
      <div className="flex items-center gap-2">
        <select
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="bg-elevated border border-white/20 rounded px-2 py-1 text-white text-xs"
          autoFocus
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <button onClick={handleSave} className="text-mint text-xs">✓</button>
        <button onClick={onCancel} className="text-red-400 text-xs">✕</button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <input
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="bg-elevated border border-white/20 rounded px-2 py-1 text-white text-xs w-24"
        autoFocus
      />
      <button onClick={handleSave} className="text-mint text-xs">✓</button>
      <button onClick={onCancel} className="text-red-400 text-xs">✕</button>
    </div>
  );
}

// ─── Task Row Component ───────────────────────────────────────────────────────
function TaskRow({ 
  task, 
  isEditing,
  onEdit,
  onUpdate,
  activeTimer,
  onStartTimer,
  onCompleteTask,
  authToken
}: { 
  task: Task;
  isEditing: boolean;
  onEdit: (field: string, value: string | number) => void;
  onUpdate: (updates: Partial<Task>) => void;
  activeTimer: ActiveTimer | null;
  onStartTimer: (taskId: string) => void;
  onCompleteTask: (taskId: string, startedAt?: string) => void;
  authToken: string;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const hasActiveTimer = activeTimer?.taskId === task.id;
  
  const handleUpdate = async (updates: Partial<Task>) => {
    setIsUpdating(true);
    try {
      // Convert to Notion property format
      const properties: Record<string, unknown> = {};
      if (updates.status)                properties['Status']              = { select: { name: updates.status } };
      if (updates.actualTime  != null)   properties['Actual Time (hrs)'] = { number: updates.actualTime };
      if (updates.cost        != null)   properties['Cost']           = { number: updates.cost };
      if (Object.keys(properties).length === 0) { onUpdate(updates); return; }

      const res = await fetch('/api/notion/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Hash': authToken },
        body: JSON.stringify({ pageId: task.id, properties }),
      });
      if (res.ok) onUpdate(updates);
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleComplete = async () => {
    const startedAt = hasActiveTimer ? activeTimer.startedAt : undefined;
    await onCompleteTask(task.id, startedAt);
  };
  
  return (
    <div className={`flex items-center gap-3 px-3 py-2 hover:bg-white/[0.02] rounded-lg transition-colors ${isUpdating ? 'opacity-50' : ''}`}>
      <AgentAvatar emoji={task.agentEmoji} name={task.agent} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs truncate">{task.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-secondary">{task.agent}</span>
          {task.priority && (
            <span className={`text-[9px] ${
              task.priority === 'Critical' ? 'text-red-400' :
              task.priority === 'High' ? 'text-orange-400' :
              'text-secondary'
            }`}>{task.priority}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Status with inline edit */}
        {isEditing ? (
          <select
            value={task.status}
            onChange={(e) => handleUpdate({ status: e.target.value })}
            className="bg-elevated border border-white/20 rounded px-1 py-0.5 text-[10px] text-white"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Done">Done</option>
            <option value="On Hold">On Hold</option>
            <option value="Blocked">Blocked</option>
          </select>
        ) : (
          <StatusBadge status={task.status} color={task.statusColor} />
        )}
        
        {/* Cost */}
        {isEditing ? (
          <input
            type="number"
            value={task.cost || ''}
            onChange={(e) => handleUpdate({ cost: Number(e.target.value) })}
            className="bg-elevated border border-white/20 rounded px-1 py-0.5 text-[10px] text-white w-12"
            placeholder="$"
          />
        ) : task.cost ? (
          <span className="text-[10px] text-mint font-mono">${task.cost}</span>
        ) : null}
        
        {/* Actual Time */}
        {isEditing ? (
          <input
            type="number"
            value={task.actualTime || ''}
            onChange={(e) => handleUpdate({ actualTime: Number(e.target.value) })}
            className="bg-elevated border border-white/20 rounded px-1 py-0.5 text-[10px] text-white w-12"
            placeholder="h"
            step="0.1"
          />
        ) : task.actualTime ? (
          <span className="text-[10px] text-secondary">{task.actualTime}h</span>
        ) : null}
        
        {/* Timer / Complete buttons */}
        {task.status !== 'Done' && (
          <>
            {hasActiveTimer ? (
              <button
                onClick={handleComplete}
                className="text-[10px] bg-mint/20 text-mint px-2 py-0.5 rounded hover:bg-mint/30 transition-colors"
              >
                Stop & Complete
              </button>
            ) : (
              <button
                onClick={() => onStartTimer(task.id)}
                className="text-[10px] bg-teal/20 text-teal px-2 py-0.5 rounded hover:bg-teal/30 transition-colors"
              >
                Start
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Chapter Row Component ────────────────────────────────────────────────────
function ChapterRow({ 
  chapter, 
  isExpanded, 
  onToggle,
  isEditing,
  onUpdate,
  authToken,
  activeTimer,
  onStartTimer,
  onCompleteTask
}: { 
  chapter: Chapter; 
  isExpanded: boolean;
  onToggle: () => void;
  isEditing: boolean;
  onUpdate: (updates: Partial<Chapter>) => void;
  authToken: string;
  activeTimer: ActiveTimer | null;
  onStartTimer: (taskId: string) => void;
  onCompleteTask: (taskId: string, startedAt?: string) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStatusPercent, setLocalStatusPercent] = useState(chapter.statusPercent);
  
  const handleUpdate = async (updates: Partial<Chapter>) => {
    setIsUpdating(true);
    try {
      const properties: Record<string, unknown> = {};
      if (updates.status !== undefined)       properties['Status']   = { select: { name: updates.status } };
      if (updates.statusPercent !== undefined) properties['Progress'] = { number: Math.round(updates.statusPercent * 100) };
      if (Object.keys(properties).length === 0) { onUpdate(updates); return; }

      const res = await fetch('/api/notion/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Hash': authToken },
        body: JSON.stringify({ pageId: chapter.id, properties }),
      });

      if (res.ok) {
        onUpdate(updates);
      }
    } catch (err) {
      console.error('Failed to update chapter:', err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleProgressSave = () => {
    handleUpdate({ statusPercent: localStatusPercent });
  };
  
  return (
    <div className={`border border-white/6 rounded-lg overflow-hidden ${isUpdating ? 'opacity-50' : ''}`}>
      {/* Chapter Header */}
      <button 
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-elevated/50 hover:bg-elevated transition-colors text-left"
      >
        <span className={`text-secondary text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate">{chapter.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] text-secondary">
              {chapter.tasks.length} tasks
            </span>
            {chapter.estimatedHours && (
              <span className="text-[10px] text-secondary">
                {chapter.actualHours || 0}/{chapter.estimatedHours}h
              </span>
            )}
          </div>
        </div>
        
        {/* Progress with slider when editing */}
        {isEditing ? (
          <div className="w-24">
            <ProgressSlider
              value={localStatusPercent}
              onChange={setLocalStatusPercent}
              onSave={handleProgressSave}
              color={chapter.statusColor}
            />
          </div>
        ) : (
          <ProgressRing 
            progress={chapter.statusPercent} 
            size={36} 
            strokeWidth={3}
            color={chapter.statusColor}
          />
        )}
        
        {chapter.cost > 0 && (
          <span className="text-[10px] text-mint font-mono">${chapter.cost}</span>
        )}
      </button>
      
      {/* Tasks List */}
      {isExpanded && chapter.tasks.length > 0 && (
        <div className="divide-y divide-white/6 bg-surface">
          {chapter.tasks.map(task => (
            <TaskRow 
              key={task.id} 
              task={task} 
              isEditing={isEditing}
              onEdit={() => {}}
              onUpdate={(updates) => {
                // Update local task data optimistically
                Object.assign(task, updates);
                onUpdate({});
              }}
              activeTimer={activeTimer}
              onStartTimer={onStartTimer}
              onCompleteTask={onCompleteTask}
              authToken={authToken}
            />
          ))}
        </div>
      )}
      
      {isExpanded && chapter.tasks.length === 0 && (
        <div className="px-3 py-4 text-center">
          <p className="text-secondary text-xs">No tasks yet</p>
        </div>
      )}
    </div>
  );
}

// ─── Project Card Component ───────────────────────────────────────────────────
function ProjectCard({ 
  project, 
  isExpanded, 
  onToggle,
  expandedChapters,
  onToggleChapter,
  isEditing,
  onUpdate,
  authToken,
  activeTimer,
  onStartTimer,
  onCompleteTask
}: { 
  project: Project; 
  isExpanded: boolean;
  onToggle: () => void;
  expandedChapters: Set<string>;
  onToggleChapter: (chapterId: string) => void;
  isEditing: boolean;
  onUpdate: (updates: Partial<Project>) => void;
  authToken: string;
  activeTimer: ActiveTimer | null;
  onStartTimer: (taskId: string) => void;
  onCompleteTask: (taskId: string, startedAt?: string) => void;
}) {
  const budgetPercent = project.budgetTotal > 0 
    ? (project.budgetSpent / project.budgetTotal) * 100 
    : 0;
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStatusPercent, setLocalStatusPercent] = useState(project.statusPercent);
  
  const handleUpdate = async (updates: Partial<Project>) => {
    setIsUpdating(true);
    try {
      const properties: Record<string, unknown> = {};
      if (updates.status !== undefined)        properties['Status']        = { select: { name: updates.status } };
      if (updates.statusPercent !== undefined) properties['Progress']      = { number: Math.round(updates.statusPercent * 100) };
      if (updates.budgetSpent !== undefined)   properties['Budget Spent']  = { number: updates.budgetSpent };
      if (updates.budgetTotal !== undefined)   properties['Budget Total']  = { number: updates.budgetTotal };
      if (Object.keys(properties).length === 0) { onUpdate(updates); return; }

      const res = await fetch('/api/notion/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Hash': authToken },
        body: JSON.stringify({ pageId: project.id, properties }),
      });

      if (res.ok) {
        onUpdate(updates);
      }
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleProgressSave = () => {
    handleUpdate({ statusPercent: localStatusPercent });
  };
  
  return (
    <div className={`border border-white/8 rounded-xl overflow-hidden bg-surface ${isUpdating ? 'opacity-50' : ''}`}>
      {/* Project Header */}
      <button 
        onClick={onToggle}
        className="w-full p-4 hover:bg-elevated/50 transition-colors text-left"
      >
        <div className="flex items-start gap-4">
          {/* Progress Ring or Slider */}
          {isEditing ? (
            <div className="w-16 flex flex-col items-center">
              <ProgressRing 
                progress={localStatusPercent} 
                size={64}
                strokeWidth={5}
                color={project.statusColor}
              />
              <div className="w-full mt-2">
                <ProgressSlider
                  value={localStatusPercent}
                  onChange={setLocalStatusPercent}
                  onSave={handleProgressSave}
                  color={project.statusColor}
                />
              </div>
            </div>
          ) : (
            <ProgressRing 
              progress={project.statusPercent} 
              size={64}
              strokeWidth={5}
              color={project.statusColor}
            />
          )}
          
          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold truncate">{project.name}</h3>
              <PriorityBadge priority={project.priority} />
            </div>
            
            <div className="flex items-center gap-3 text-xs text-secondary mb-2">
              <span className="flex items-center gap-1">
                <AgentAvatar emoji={project.agentEmoji} name={project.agentOwner} size="sm" />
                {project.agentOwner}
              </span>
              <span>•</span>
              <span>{project.client}</span>
              {project.dueDate && (
                <>
                  <span>•</span>
                  <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
                </>
              )}
            </div>
            
            {/* Stats Row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-secondary">Tasks</span>
                <span className="text-xs text-white">{project.completedTasks}/{project.totalTasks}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-secondary">Chapters</span>
                <span className="text-xs text-white">{project.chapters.length}</span>
              </div>
              {isEditing ? (
                <select
                  value={project.status}
                  onChange={(e) => handleUpdate({ status: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-elevated border border-white/20 rounded px-2 py-0.5 text-[10px] text-white"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Complete">Complete</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Blocked">Blocked</option>
                </select>
              ) : (
                <StatusBadge status={project.status} color={project.statusColor} />
              )}
            </div>
          </div>
          
          {/* Budget & Expand */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-[10px] text-secondary">Budget</p>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={project.budgetSpent}
                    onChange={(e) => handleUpdate({ budgetSpent: Number(e.target.value) })}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-elevated border border-white/20 rounded px-1 py-0.5 text-xs text-white w-16"
                  />
                  <span className="text-xs text-secondary">/</span>
                  <input
                    type="number"
                    value={project.budgetTotal}
                    onChange={(e) => handleUpdate({ budgetTotal: Number(e.target.value) })}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-elevated border border-white/20 rounded px-1 py-0.5 text-xs text-white w-16"
                  />
                </div>
              ) : (
                <p className={`text-xs font-mono ${budgetPercent > 90 ? 'text-red-400' : 'text-mint'}`}>
                  ${project.budgetSpent.toLocaleString()} / ${project.budgetTotal.toLocaleString()}
                </p>
              )}
            </div>
            <span className={`text-secondary text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
          </div>
        </div>
        
        {/* Budget Bar */}
        <div className="mt-3">
          <BudgetBar spent={project.budgetSpent} total={project.budgetTotal} />
        </div>
      </button>
      
      {/* Expanded Chapters */}
      {isExpanded && (
        <div className="border-t border-white/8 p-4 space-y-2 bg-elevated/20">
          {project.chapters.length > 0 ? (
            project.chapters.map(chapter => (
              <ChapterRow 
                key={chapter.id}
                chapter={chapter}
                isExpanded={expandedChapters.has(chapter.id)}
                onToggle={() => onToggleChapter(chapter.id)}
                isEditing={isEditing}
                onUpdate={(updates) => {
                  Object.assign(chapter, updates);
                  onUpdate({});
                }}
                authToken={authToken}
                activeTimer={activeTimer}
                onStartTimer={onStartTimer}
                onCompleteTask={onCompleteTask}
              />
            ))
          ) : (
            <p className="text-secondary text-xs text-center py-4">No chapters yet</p>
          )}
          
          {/* Project Summary */}
          <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between text-xs">
            <span className="text-secondary">
              Total Cost: <span className="text-mint font-mono">${project.totalCost.toLocaleString()}</span>
            </span>
            <span className="text-secondary">
              Remaining: <span className="text-white font-mono">${project.budgetRemaining.toLocaleString()}</span>
            </span>
          </div>

          {/* Estimate Accuracy */}
          <div className="mt-3 pt-3 border-t border-white/8">
            <EstimateConfidence
              agentId={project.agentOwner.toLowerCase().replace(/\s+/g, '-')}
              showPredictor={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stats Summary Component ──────────────────────────────────────────────────
function StatsSummary({ stats }: { stats: ProjectsData['stats'] }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {[
        { label: 'Projects', value: stats.totalProjects, color: 'text-white' },
        { label: 'Active', value: stats.activeProjects, color: 'text-blue-400' },
        { label: 'Chapters', value: stats.totalChapters, color: 'text-purple-400' },
        { label: 'Tasks', value: stats.totalTasks, color: 'text-mint' },
        { label: 'Complete', value: stats.completedProjects, color: 'text-green-400' },
      ].map(stat => (
        <div key={stat.label} className="border border-white/8 rounded-lg p-3 text-center bg-surface">
          <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-[10px] text-secondary uppercase tracking-wider mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Projects Panel ──────────────────────────────────────────────────────
export default function ProjectsPanel() {
  const [data, setData] = useState<ProjectsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [lastFetch, setLastFetch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [authToken, setAuthToken] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Get auth token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('dashboard_auth');
    if (token) setAuthToken(token);
  }, []);

  // Fetch projects data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/hub/projects.json?t=' + Date.now());
        if (!res.ok) throw new Error('Failed to fetch projects');
        const json = await res.json();
        setData(json);
        setLastFetch(new Date().toLocaleTimeString());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    const interval = setInterval(fetchData, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const handleProjectUpdate = (projectId: string, updates: Partial<Project>) => {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        projects: prev.projects.map(p => 
          p.id === projectId ? { ...p, ...updates } : p
        )
      };
    });
    setSyncStatus('syncing');
    setTimeout(() => setSyncStatus('idle'), 1000);
  };

  const handleStartTimer = (taskId: string) => {
    setActiveTimer({ taskId, startedAt: new Date().toISOString() });
  };

  const handleCompleteTask = async (taskId: string, startedAt?: string) => {
    if (!authToken) return;

    // Compute actualHours from timer or prompt
    let actualHours = 0;
    if (startedAt) {
      const elapsed = Date.now() - new Date(startedAt).getTime();
      actualHours = Math.round((elapsed / 3600000) * 10) / 10;
    } else {
      const input = prompt('Actual hours spent (e.g. 2.5):');
      if (!input) return;
      actualHours = parseFloat(input);
      if (isNaN(actualHours) || actualHours < 0) return;
    }

    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/notion/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Hash': authToken },
        body: JSON.stringify({ pageId: taskId, actualHours }),
      });
      
      if (res.ok) {
        // Clear timer if this was the active task
        if (activeTimer?.taskId === taskId) {
          setActiveTimer(null);
        }
        
        // Optimistically update UI
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            projects: prev.projects.map(p => ({
              ...p,
              chapters: p.chapters.map(c => ({
                ...c,
                tasks: c.tasks.map(t => 
                  t.id === taskId 
                    ? { ...t, status: 'Done', statusColor: '#22c55e' }
                    : t
                )
              }))
            }))
          };
        });
        
        setSyncStatus('idle');
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
      setSyncStatus('error');
    }
  };

  const handleAuth = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Store hash (never plaintext) for API calls
    localStorage.setItem('dashboard_auth', hashHex);
    setAuthToken(hashHex);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-secondary">
          <div className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading projects...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500/30 rounded-xl p-6 text-center bg-red-500/5">
        <p className="text-red-400 text-sm">Failed to load projects</p>
        <p className="text-secondary text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (!data || data.projects.length === 0) {
    return (
      <div className="border border-white/8 rounded-xl p-8 text-center">
        <p className="text-secondary text-sm">No projects found</p>
        <p className="text-secondary text-xs mt-1">Add projects in Notion to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          <p className="text-secondary text-xs">Source: Notion • Synced {lastFetch}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sync Status */}
          {syncStatus === 'syncing' && (
            <span className="flex items-center gap-1 text-[10px] text-teal">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              Syncing...
            </span>
          )}
          {syncStatus === 'error' && (
            <span className="text-[10px] text-red-400">Sync failed</span>
          )}
          
          {/* Edit Toggle */}
          <button
            onClick={() => {
              if (!isEditing && !authToken) {
                const password = prompt('Enter dashboard password:');
                if (password) handleAuth(password);
              }
              setIsEditing(!isEditing);
            }}
            className={`text-xs px-3 py-1.5 rounded transition-colors ${
              isEditing 
                ? 'bg-mint/20 text-mint hover:bg-mint/30' 
                : 'bg-elevated text-secondary hover:text-white'
            }`}
          >
            {isEditing ? 'Done Editing' : 'Edit'}
          </button>
          
          <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
          <span className="text-mint text-xs">Live</span>
        </div>
      </div>

      {/* Editing Mode Indicator */}
      {isEditing && (
        <div className="bg-teal/10 border border-teal/30 rounded-lg px-3 py-2">
          <p className="text-teal text-xs">
            ✏️ Editing mode: Click on progress sliders, status dropdowns, or budget fields to update Notion directly.
            Changes are saved automatically.
          </p>
        </div>
      )}

      {/* Stats */}
      <StatsSummary stats={data.stats} />

      {/* Projects Grid */}
      <div className="space-y-3">
        {data.projects.map(project => (
          <ProjectCard 
            key={project.id}
            project={project}
            isExpanded={expandedProjects.has(project.id)}
            onToggle={() => toggleProject(project.id)}
            expandedChapters={expandedChapters}
            onToggleChapter={toggleChapter}
            isEditing={isEditing}
            onUpdate={(updates) => handleProjectUpdate(project.id, updates)}
            authToken={authToken}
            activeTimer={activeTimer}
            onStartTimer={handleStartTimer}
            onCompleteTask={handleCompleteTask}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-secondary pt-2">
        <span>v{data.version} • {data.source}</span>
        <span>Last updated: {new Date(data.lastUpdated).toLocaleString()}</span>
      </div>
    </div>
  );
}
