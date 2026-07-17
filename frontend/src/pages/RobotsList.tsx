import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Cpu, Battery, MapPin, Plus, Shield, Truck, RefreshCw } from 'lucide-react';
import { robotsApi, type Robot, type RobotType } from '@/lib/api';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const addRobotSchema = z.object({
  name:     z.string().min(1, 'Name is required').max(50),
  type:     z.enum(['warehouse', 'delivery', 'cleaning', 'security']),
  location: z.string().optional(),
});
type AddRobotForm = z.infer<typeof addRobotSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getRobotIcon(type: RobotType) {
  const icons: Record<RobotType, React.ReactNode> = {
    warehouse: <Cpu size={22} />,
    delivery:  <Truck size={22} />,
    cleaning:  <RefreshCw size={22} />,
    security:  <Shield size={22} />,
  };
  return icons[type] ?? <Cpu size={22} />;
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    online: 'var(--accent-green)',
    active: 'var(--accent-green)',
    offline: 'var(--accent-red)',
    maintenance: 'var(--accent-gold)',
  };
  return map[status] ?? 'var(--text-muted)';
}

// ─── Robot Card ───────────────────────────────────────────────────────────────
function RobotCard({ robot }: { robot: Robot }) {
  const color = getStatusColor(robot.status);
  return (
    <div className="cyber-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ color: 'var(--accent-cyan)', background: 'rgba(0,113,227,0.08)', padding: '8px', borderRadius: '10px' }}>
            {getRobotIcon(robot.type)}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1d1d1f', margin: 0 }}>{robot.name}</h3>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#424245', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{robot.type}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 6px ${color}`, display: 'inline-block' }} />
          {robot.status}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Location</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#1d1d1f' }}>{robot.location || 'Unknown'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Battery size={16} /> Battery</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: robot.battery > 30 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{robot.battery}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${robot.battery}%`, height: '100%', background: robot.battery > 50 ? 'linear-gradient(90deg, #0071e3, #34c759)' : robot.battery > 20 ? '#ff9500' : '#ff3b30', borderRadius: '3px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const RobotsList: React.FC = () => {
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState<string | null>(null);

  const { data: robots = [], isLoading } = useQuery({
    queryKey: ['robots'],
    queryFn: robotsApi.list,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddRobotForm>({
    resolver: zodResolver(addRobotSchema),
    defaultValues: { name: '', type: 'warehouse', location: '' },
  });

  const addRobot = useMutation({
    mutationFn: robotsApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['robots'] });
      setNotification(`DEPLOYMENT PROTOCOL COMPLETE: Robot unit "${variables.name}" registered and online.`);
      reset();
    },
  });

  const onSubmit = (data: AddRobotForm) => addRobot.mutate(data);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
        [LOADING...]
      </div>
    );
  }

  return (
    <div className="robots-page">
      <div className="page-header">
        <h1>Robot Fleet</h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent-cyan)' }}>
          CONNECTED: {robots.length}
        </div>
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
          Add New Robot
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Name</label>
            <input {...register('name')} placeholder="e.g. Alpha-9" className="cyber-input" />
            {errors.name && <span style={{ color: 'var(--accent-red)', fontSize: '12px' }}>{errors.name.message}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Type</label>
            <select {...register('type')} className="cyber-select" style={{ width: '100%', height: '46px' }}>
              <option value="warehouse">Warehouse Arm</option>
              <option value="delivery">Delivery Drone</option>
              <option value="cleaning">Cleaning Unit</option>
              <option value="security">Security Drone</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Location</label>
            <input {...register('location')} placeholder="e.g. Bay 4-A" className="cyber-input" />
          </div>
          <button type="submit" disabled={addRobot.isPending} className="cyber-button" style={{ height: '46px', width: '100%' }}>
            {addRobot.isPending ? 'Deploying...' : 'Deploy'}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {robots.map((robot) => <RobotCard key={robot.id} robot={robot} />)}
      </div>
    </div>
  );
};

export default RobotsList;
