import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ListTodo, Cpu, AlertTriangle, Calendar,
  Plus, Play, CheckCircle2, Clock,
} from 'lucide-react';
import { tasksApi, robotsApi, type Task, type TaskPriority, type TaskStatus } from '@/lib/api';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const createTaskSchema = z.object({
  name:     z.string().min(1, 'Task name is required').max(100),
  robotId:  z.string().min(1, 'Please assign a robot'),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate:  z.string().optional(),
});
type CreateTaskForm = z.infer<typeof createTaskSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPriorityStyle(priority: TaskPriority) {
  const map: Record<TaskPriority, { borderColor: string; boxShadow: string; leftColor: string }> = {
    high:   { borderColor: 'var(--accent-red)',    boxShadow: '0 0 15px rgba(255,59,59,0.15)',   leftColor: 'var(--accent-red)' },
    medium: { borderColor: 'var(--accent-gold)',   boxShadow: '0 0 15px rgba(255,170,68,0.15)',  leftColor: 'var(--accent-gold)' },
    low:    { borderColor: 'var(--panel-border)',  boxShadow: 'none',                            leftColor: 'var(--text-muted)' },
  };
  return map[priority];
}

function getStatusIcon(status: TaskStatus) {
  const map: Record<TaskStatus, React.ReactNode> = {
    pending:   <Clock size={16} style={{ color: 'var(--accent-gold)' }} />,
    running:   <Play size={16} style={{ color: 'var(--accent-cyan)' }} />,
    active:    <Play size={16} style={{ color: 'var(--accent-cyan)' }} />,
    completed: <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />,
  };
  return map[status] ?? <Clock size={16} />;
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, robotName }: { task: Task; robotName: string }) {
  const pStyle = getPriorityStyle(task.priority);
  return (
    <div className="cyber-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: pStyle.borderColor, boxShadow: pStyle.boxShadow, padding: '16px 24px', borderLeft: `4px solid ${pStyle.leftColor}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1d1d1f' }}>{task.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Cpu size={14} /> {robotName}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {task.dueDate || 'ASAP'}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', padding: '4px 10px', background: 'rgba(0,0,0,0.04)', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
          {task.priority === 'high' && <AlertTriangle size={12} style={{ color: 'var(--accent-red)' }} />}
          <span style={{ color: pStyle.leftColor, fontWeight: 'bold' }}>{task.priority}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
          {getStatusIcon(task.status)}
          <span style={{ color: '#1d1d1f' }}>{task.status}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const TaskManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState<string | null>(null);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.list,
  });

  const { data: robots = [], isLoading: robotsLoading } = useQuery({
    queryKey: ['robots'],
    queryFn: robotsApi.list,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { name: '', robotId: '', priority: 'medium', dueDate: '' },
  });

  const createTask = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNotification(`TASK SCHEDULED: "${variables.name}" successfully queued and active.`);
      reset();
    },
  });

  const onSubmit = (data: CreateTaskForm) => createTask.mutate(data);

  const isLoading = tasksLoading || robotsLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
        [LOADING...]
      </div>
    );
  }

  const robotMap = Object.fromEntries(robots.map((r) => [r.id, r.name]));

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1>Task Scheduler</h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent-cyan)' }}>QUEUE ACTIVE</div>
      </div>

      {notification && (
        <div style={{ padding: '14px 18px', borderRadius: '6px', background: 'rgba(0,240,255,0.1)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>{notification}</div>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>[DISMISS]</button>
        </div>
      )}

      <div className="cyber-panel" style={{ marginBottom: '28px' }}>
        <h2 className="cyber-title">
          <Plus size={20} style={{ color: 'var(--accent-cyan)' }} />
          New Task
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Task Name</label>
              <input {...register('name')} placeholder="e.g. Scan Sector B-9" className="cyber-input" />
              {errors.name && <span style={{ color: 'var(--accent-red)', fontSize: '12px' }}>{errors.name.message}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Assign Robot</label>
              <select {...register('robotId')} className="cyber-select" style={{ height: '46px' }}>
                <option value="">Select Robot</option>
                {robots.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
              </select>
              {errors.robotId && <span style={{ color: 'var(--accent-red)', fontSize: '12px' }}>{errors.robotId.message}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Priority</label>
              <select {...register('priority')} className="cyber-select" style={{ height: '46px' }}>
                <option value="low">Low (Routine)</option>
                <option value="medium">Medium (Standard)</option>
                <option value="high">High (Critical)</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Due Date</label>
              <input {...register('dueDate')} type="date" className="cyber-input" style={{ height: '46px' }} />
            </div>
          </div>
          <button type="submit" disabled={createTask.isPending} className="cyber-button" style={{ alignSelf: 'flex-end', minWidth: '180px', height: '46px' }}>
            {createTask.isPending ? 'Scheduling...' : 'Create Task'}
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 className="cyber-title">
          <ListTodo size={20} style={{ color: 'var(--accent-cyan)' }} />
          Active Tasks
        </h2>
        {tasks.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>[NO ACTIVE TASKS]</div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} robotName={robotMap[task.robotId] ?? 'Unassigned'} />)
        )}
      </div>
    </div>
  );
};

export default TaskManager;
