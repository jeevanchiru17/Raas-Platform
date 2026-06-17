import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, Battery, Activity, Play, Square, RefreshCw, Zap, Navigation, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRobots: 0,
    activeRobots: 0,
    pendingTasks: 0,
    totalCredits: 100
  });
  
  const [rosStatus, setRosStatus] = useState({ connected: false, url: '' });
  const [robots, setRobots] = useState([]);
  const [selectedRobotId, setSelectedRobotId] = useState('robot_1');
  const [liveTelemetry, setLiveTelemetry] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [targetMarker, setTargetMarker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const socketRef = useRef(null);

  // Poll ROS Status and fetch basic metrics
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [robotsRes, tasksRes, rosRes, billingRes] = await Promise.all([
          axios.get('http://localhost:5000/api/robots'),
          axios.get('http://localhost:5000/api/tasks'),
          axios.get('http://localhost:5000/api/ros/status'),
          axios.get('http://localhost:5000/api/billing/subscription')
        ]);

        setRobots(robotsRes.data);
        setRosStatus({ connected: rosRes.data.connected, url: rosRes.data.url });
        
        const active = robotsRes.data.filter(r => r.status !== 'offline').length;
        const pending = tasksRes.data.filter(t => t.status === 'pending').length;
        const credits = billingRes.data.credits - billingRes.data.creditsUsed;

        setStats({
          totalRobots: robotsRes.data.length,
          activeRobots: active,
          pendingTasks: pending,
          totalCredits: credits
        });

        // Setup initial chart mock data in case live is slow
        if (chartData.length === 0) {
          setChartData([
            { time: 'T-20s', battery: 90 },
            { time: 'T-15s', battery: 89 },
            { time: 'T-10s', battery: 89 },
            { time: 'T-5s', battery: 88 }
          ]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard base data:', err);
        setErrorMsg('Failed to connect to backend server APIs');
        setLoading(false);
      }
    };

    fetchBaseData();
    const interval = setInterval(fetchBaseData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Establish socket connection and listen to live telemetry
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    // Subscribe to selected robot
    socketRef.current.emit('subscribe:robot', selectedRobotId);

    socketRef.current.on('connect', () => {
      console.log('Socket connected to backend');
      socketRef.current.emit('subscribe:robot', selectedRobotId);
    });

    socketRef.current.on('robot:telemetry', (data) => {
      if (data.id === selectedRobotId) {
        setLiveTelemetry(data);
        
        // Add to real-time battery history chart
        setChartData(prev => {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const nextData = [...prev, { time: timestamp, battery: Math.round(data.battery) }];
          // Limit to last 15 points
          return nextData.slice(-15);
        });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedRobotId]);

  // Handle map click to command move_to
  const handleMapClick = async (e) => {
    if (!liveTelemetry) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Scale click pixels to simulator coordinates (-10 to 10)
    // 5% margin on boundaries -> scale matches getMapPosition
    const x = ((clickX / rect.width) - 0.05) / 0.9 * 20 - 10;
    const y = -(((clickY / rect.height) - 0.05) / 0.9 * 20 - 10);

    setTargetMarker({ x: clickX, y: clickY });

    try {
      await axios.post(`http://localhost:5000/api/robots/${selectedRobotId}/command`, {
        command: 'move_to',
        params: { x, y, z: 0 }
      });
      console.log(`Command move_to sent: (${x.toFixed(2)}, ${y.toFixed(2)})`);
    } catch (err) {
      console.error('Error sending move command:', err);
    }
  };

  // Quick Command Handlers
  const handleStop = async () => {
    try {
      await axios.post(`http://localhost:5000/api/robots/${selectedRobotId}/command`, { command: 'stop' });
      setTargetMarker(null);
    } catch (err) { console.error(err); }
  };

  const handleCharge = async () => {
    try {
      await axios.post(`http://localhost:5000/api/robots/${selectedRobotId}/command`, { command: 'charge' });
      setTargetMarker(null);
    } catch (err) { console.error(err); }
  };

  const handleReset = async () => {
    try {
      await axios.post(`http://localhost:5000/api/robots/${selectedRobotId}/command`, { command: 'reset' });
      setTargetMarker(null);
    } catch (err) { console.error(err); }
  };

  // Convert ROS coordinates to Map CSS percentages
  const getMapPosition = (pos) => {
    if (!pos) return { left: '50%', top: '50%' };
    // Map -10 to 10 coordinate range to 5% to 95% of CSS container
    const minCoord = -10;
    const maxCoord = 10;
    
    const scale = (val) => {
      const percentage = ((val - minCoord) / (maxCoord - minCoord)) * 90 + 5;
      return `${Math.max(5, Math.min(95, percentage))}%`;
    };
    
    return {
      left: scale(pos.x),
      top: scale(-pos.y) // Invert Y for screen coordinate top-down flow
    };
  };

  // Battery bar status styling
  const getBatteryClass = (lvl) => {
    if (lvl > 50) return 'battery-high';
    if (lvl > 20) return 'battery-medium';
    return 'battery-low';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '20px' }}>
        <RefreshCw className="pulse-dot" size={48} style={{ animation: 'spin 2s linear infinite', color: 'var(--accent-cyan)' }} />
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>INITIALIZING REAL-TIME CORE...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Control Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Real-time telemetry and fleet scheduling</p>
        </div>
        <div className="ros-status-tag">
          <div className={`pulse-dot ${rosStatus.connected ? '' : 'disconnected'}`} />
          <span>ROS BRIDGE: {rosStatus.connected ? 'CONNECTED' : 'OFFLINE'}</span>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '15px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle style={{ color: 'var(--accent-rose)' }} />
          <span style={{ color: 'var(--text-main)', fontSize: '14px' }}>{errorMsg}. Make sure the docker containers are running.</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="glass-panel stat-card total-robots">
          <h3>Total Fleet</h3>
          <div className="stat-value-container">
            <span className="stat-value">{stats.totalRobots}</span>
            <div className="stat-icon"><Cpu size={20} /></div>
          </div>
        </div>
        <div className="glass-panel stat-card active-robots">
          <h3>Active Online</h3>
          <div className="stat-value-container">
            <span className="stat-value">{stats.activeRobots}</span>
            <div className="stat-icon"><Activity size={20} /></div>
          </div>
        </div>
        <div className="glass-panel stat-card pending-tasks">
          <h3>Queue Tasks</h3>
          <div className="stat-value-container">
            <span className="stat-value">{stats.pendingTasks}</span>
            <div className="stat-icon"><Play size={20} /></div>
          </div>
        </div>
        <div className="glass-panel stat-card credits-available">
          <h3>Credits Bal</h3>
          <div className="stat-value-container">
            <span className="stat-value">{stats.totalCredits}</span>
            <div className="stat-icon"><Zap size={20} /></div>
          </div>
        </div>
      </div>

      {/* Primary Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Interactive Map */}
        <div className="glass-panel map-container">
          <h2><Navigation size={18} /> Warehouse 2D Mapping Blueprint</h2>
          
          <div className="map-wrapper" onClick={handleMapClick}>
            <div className="map-crosshairs" />
            
            <span className="map-bounds-label top-left">[-10.0, 10.0]</span>
            <span className="map-bounds-label top-right">[10.0, 10.0]</span>
            <span className="map-bounds-label bottom-left">[-10.0, -10.0]</span>
            <span className="map-bounds-label bottom-right">[10.0, -10.0]</span>

            {/* Target Marker */}
            {targetMarker && (
              <div 
                className="map-target-marker"
                style={{ left: targetMarker.x, top: targetMarker.y }}
              />
            )}

            {/* Robot Indicator */}
            {liveTelemetry && (
              <div 
                className="map-robot" 
                style={getMapPosition(liveTelemetry.position)}
              >
                <div className="map-robot-label">
                  {selectedRobotId} ({liveTelemetry.position ? `${liveTelemetry.position.x.toFixed(1)}, ${liveTelemetry.position.y.toFixed(1)}` : '0, 0'})
                </div>
              </div>
            )}
          </div>
          <p className="map-instruction">
            <Zap size={12} style={{ color: 'var(--accent-cyan)' }} />
            Click anywhere on the blueprint grid to transmit a target coordinate to the robot simulator.
          </p>
        </div>

        {/* Right Column: Telemetry Specs & Controls */}
        <div className="telemetry-sidebar">
          <div className="glass-panel">
            <div className="telemetry-header">
              <h2>Real-time Telemetry</h2>
              <select 
                value={selectedRobotId} 
                onChange={(e) => setSelectedRobotId(e.target.value)}
                className="modern-select"
                style={{ width: '100%', marginTop: '10px', padding: '8px 12px' }}
              >
                {robots.map(r => (
                  <option key={r.id} value={r.id}>{r.name || r.id}</option>
                ))}
              </select>
            </div>

            {liveTelemetry ? (
              <div className="telemetry-grid">
                <div className="telemetry-item">
                  <div className="telemetry-label">Status</div>
                  <div className={`telemetry-value ${liveTelemetry.status}`}>
                    {liveTelemetry.status.toUpperCase()}
                  </div>
                </div>
                <div className="telemetry-item">
                  <div className="telemetry-label">Battery</div>
                  <div className="telemetry-value">
                    {Math.round(liveTelemetry.battery)}%
                  </div>
                  <div className="battery-indicator-wrapper">
                    <div className="battery-pill">
                      <div 
                        className={`battery-fill ${getBatteryClass(liveTelemetry.battery)}`}
                        style={{ width: `${liveTelemetry.battery}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="telemetry-item" style={{ gridColumn: 'span 2' }}>
                  <div className="telemetry-label">Position Coordinate</div>
                  <div className="telemetry-value" style={{ fontSize: '15px' }}>
                    X: {liveTelemetry.position?.x.toFixed(4) || '0.0000'} | 
                    Y: {liveTelemetry.position?.y.toFixed(4) || '0.0000'}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                Awaiting telemetry updates...
              </p>
            )}
          </div>

          {/* Quick Actions Console */}
          <div className="glass-panel">
            <h2 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--accent-purple)' }}>Quick Actions Console</h2>
            <div className="console-actions">
              <button className="console-btn danger" onClick={handleStop}>
                <Square />
                STOP
              </button>
              <button className="console-btn success" onClick={handleCharge}>
                <Zap />
                CHARGE
              </button>
              <button className="console-btn" onClick={handleReset}>
                <RefreshCw />
                RESET
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Battery Chart */}
      <div className="glass-panel chart-container" style={{ marginTop: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--accent-cyan)' }}>Real-time Battery Level History</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="var(--text-muted)" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }} />
            <YAxis stroke="var(--text-muted)" domain={[0, 100]} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="battery" 
              stroke="var(--accent-cyan)" 
              strokeWidth={3}
              dot={{ stroke: 'var(--accent-cyan)', strokeWidth: 1, r: 3 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              fill="url(#batteryGrad)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
