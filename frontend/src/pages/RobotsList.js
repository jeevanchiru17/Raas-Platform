import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cpu, Plus, Battery, MapPin, Activity, ShieldAlert, Trash2 } from 'lucide-react';

const RobotsList = () => {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRobot, setNewRobot] = useState({ name: '', type: 'warehouse', location: '' });

  useEffect(() => {
    fetchRobots();
  }, []);

  const fetchRobots = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/robots');
      setRobots(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching robots:', error);
      setLoading(false);
    }
  };

  const handleAddRobot = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/robots', newRobot);
      setNewRobot({ name: '', type: 'warehouse', location: '' });
      fetchRobots();
    } catch (error) {
      console.error('Error adding robot:', error);
      alert('Error registering robot');
    }
  };

  const handleDeleteRobot = async (robotId) => {
    if (!window.confirm(`Are you sure you want to decommission robot: ${robotId}?`)) return;
    try {
      await axios.post(`http://localhost:5000/api/robots/${robotId}/command`, {
        command: 'reset'
      });
      fetchRobots();
    } catch (error) {
      console.error('Error deleting robot:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LOADING FLEET DATA...</p>
      </div>
    );
  }

  return (
    <div className="robots-page">
      <div className="page-header">
        <div>
          <h1>Robot Fleet</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Register, view, and decommission active RaaS units</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
        {/* Register Form */}
        <div className="glass-panel">
          <form className="modern-form" onSubmit={handleAddRobot}>
            <h2>Register New Robot</h2>
            <div className="input-group">
              <label>Robot Name / ID</label>
              <input
                type="text"
                placeholder="e.g. Warehouse Bot 2"
                value={newRobot.name}
                onChange={(e) => setNewRobot({ ...newRobot, name: e.target.value })}
                required
                className="modern-input"
              />
            </div>
            
            <div className="input-group">
              <label>Operational Type</label>
              <select
                value={newRobot.type}
                onChange={(e) => setNewRobot({ ...newRobot, type: e.target.value })}
                className="modern-select"
              >
                <option value="warehouse">Warehouse AGV</option>
                <option value="delivery">Delivery Drone</option>
                <option value="cleaning">Cleaning Bot</option>
                <option value="security">Security Patrol</option>
              </select>
            </div>

            <div className="input-group">
              <label>Default Deployment Location</label>
              <input
                type="text"
                placeholder="e.g. Zone B-12"
                value={newRobot.location}
                onChange={(e) => setNewRobot({ ...newRobot, location: e.target.value })}
                className="modern-input"
              />
            </div>

            <button type="submit" className="modern-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
              <Plus size={18} />
              Register Unit
            </button>
          </form>
        </div>

        {/* Fleet Grid */}
        <div className="robots-grid">
          {robots.map((robot) => (
            <div key={robot.id} className="glass-panel robot-card">
              <div className="robot-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={20} style={{ color: 'var(--accent-cyan)' }} />
                  <h3>{robot.name || robot.id}</h3>
                </div>
                <div className={`robot-card-status ${robot.status === 'offline' ? 'offline' : 'online'}`}>
                  {robot.status === 'offline' ? <ShieldAlert size={12} /> : <Activity size={12} />}
                  {robot.status}
                </div>
              </div>

              <div className="robot-details">
                <div className="robot-detail-row">
                  <span className="robot-detail-label">Type</span>
                  <span className="robot-detail-val" style={{ textTransform: 'capitalize' }}>{robot.type}</span>
                </div>
                <div className="robot-detail-row">
                  <span className="robot-detail-label">Battery Level</span>
                  <span className="robot-detail-val" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Battery size={16} style={{ color: robot.battery > 20 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }} />
                    {Math.round(robot.battery)}%
                  </span>
                </div>
                <div className="robot-detail-row">
                  <span className="robot-detail-label">Current Node</span>
                  <span className="robot-detail-val" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={16} style={{ color: 'var(--accent-blue)' }} />
                    {robot.location || (robot.position ? `${robot.position.x.toFixed(1)}, ${robot.position.y.toFixed(1)}` : 'Unknown')}
                  </span>
                </div>
              </div>

              <button 
                className="console-btn danger" 
                onClick={() => handleDeleteRobot(robot.id)}
                style={{ width: '100%', marginTop: '10px', flexDirection: 'row', gap: '5px', padding: '10px' }}
              >
                <Trash2 size={14} />
                Decommission Unit
              </button>
            </div>
          ))}

          {robots.length === 0 && (
            <p style={{ gridColumn: 'span 2', textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              No robots currently registered in the local fleet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RobotsList;
