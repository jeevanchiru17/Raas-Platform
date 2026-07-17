import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Cpu, Activity, ListTodo, Zap } from 'lucide-react';
import { robotsApi, tasksApi, type TelemetryPoint, type DashboardStats } from '@/lib/api';

const MOCK_TELEMETRY: TelemetryPoint[] = [
  { time: '00:00', battery: 85 },
  { time: '04:00', battery: 78 },
  { time: '08:00', battery: 92 },
  { time: '12:00', battery: 88 },
  { time: '16:00', battery: 75 },
  { time: '20:00', battery: 95 },
];

function StatCard({
  icon, label, value, bg, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bg: string;
  color: string;
}) {
  return (
    <div className="cyber-panel" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
      <div style={{ padding: '12px', background: bg, borderRadius: '12px', color }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
          {label}
        </h3>
        <p style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color, marginTop: '4px' }}>
          {value}
        </p>
      </div>
    </div>
  );
}

const Dashboard: React.FC = () => {
  const { data: robots = [], isLoading: robotsLoading } = useQuery({
    queryKey: ['robots'],
    queryFn: robotsApi.list,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.list,
  });

  const isLoading = robotsLoading || tasksLoading;

  const stats: DashboardStats = {
    totalRobots:   robots.length,
    activeRobots:  robots.filter((r) => r.status === 'active' || r.status === 'online').length,
    pendingTasks:  tasks.filter((t) => t.status === 'pending').length,
    totalCredits:  100,
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
        [LOADING...]
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Operations Dashboard</h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent-cyan)' }}>
          SYSTEM ONLINE
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <StatCard icon={<Cpu size={26} />}      label="Total Fleet"   value={stats.totalRobots}  bg="rgba(0,113,227,0.08)"   color="var(--accent-cyan)" />
        <StatCard icon={<Activity size={26} />} label="Active Nodes"  value={stats.activeRobots} bg="rgba(52,199,89,0.08)"   color="var(--accent-green)" />
        <StatCard icon={<ListTodo size={26} />} label="Queued Tasks"  value={stats.pendingTasks} bg="rgba(255,149,0,0.08)"   color="var(--accent-gold)" />
        <StatCard icon={<Zap size={26} />}      label="Core Credits"  value={stats.totalCredits} bg="rgba(175,82,222,0.08)"  color="var(--accent-purple)" />
      </div>

      <div className="cyber-panel">
        <h2 className="cyber-title">
          <Activity size={20} style={{ color: 'var(--accent-cyan)' }} />
          Fleet Telemetry
        </h2>
        <div style={{ width: '100%', height: 350, marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_TELEMETRY} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />
              <XAxis dataKey="time" stroke="#86868b" tick={{ fill: '#86868b', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <YAxis stroke="#86868b" tick={{ fill: '#86868b', fontFamily: 'var(--font-mono)', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', color: '#1d1d1f', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                labelStyle={{ fontFamily: 'var(--font-mono)', color: '#0071e3', marginBottom: '4px' }}
              />
              <Legend wrapperStyle={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: '#6e6e73' }} />
              <Line type="monotone" dataKey="battery" name="Average Battery (%)" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ stroke: 'var(--accent-cyan)', strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="cyber-panel" style={{ marginTop: '28px', background: 'linear-gradient(135deg, #0d121f 0%, #07090e 100%)', border: '1px solid rgba(124,58,237,0.25)' }}>
        <h2 className="cyber-title" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#f3f4f6' }}>
          <Activity size={20} style={{ color: 'var(--accent-purple)' }} />
          Foxglove Live Observability Node
        </h2>
        <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '44px', marginBottom: '16px' }}>🛰️</div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f3f4f6', marginBottom: '8px' }}>Security Handshake Required</h3>
          <p style={{ fontSize: '14px', color: '#9ca3af', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Foxglove Studio&apos;s security policy restricts cross-origin iframe rendering. Launch the layout workspace in a secure tab to inspect your physical AI stream records.
          </p>
          <a
            href="https://app.foxglove.dev/jeevan-h-r/view?ds=foxglove-sample-stream&ds.recordingId=rec_0dtkuuK43PadKny8&layoutId=f1366b1a-0e21-4c96-95f8-570a7325cb1f"
            target="_blank"
            rel="noopener noreferrer"
            className="cyber-button"
            style={{ background: 'linear-gradient(135deg, var(--accent-purple), #6d28d9)', color: '#fff', textDecoration: 'none', padding: '12px 32px', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(124,58,237,0.45)' }}
          >
            Launch Observability Node ↗
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
