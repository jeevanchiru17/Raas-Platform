import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Calendar, User, Clock, AlertTriangle } from 'lucide-react';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [robots, setRobots] = useState([]);
  const [newTask, setNewTask] = useState({ name: '', robotId: '', priority: 'medium', dueDate: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, robotsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks'),
        axios.get('http://localhost:5000/api/robots')
      ]);
      setTasks(tasksRes.data);
      setRobots(robotsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', newTask);
      setNewTask({ name: '', robotId: '', priority: 'medium', dueDate: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task');
    }
  };

  // Helper to filter tasks by priority lanes
  const getTasksByPriority = (prio) => {
    return tasks.filter(t => t.priority.toLowerCase() === prio);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LOADING TASK SCHEDULER...</p>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1>Task Scheduler</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Dispatch and monitor missions across the robot fleet</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px', alignItems: 'start' }}>
        {/* Create Task Form */}
        <div className="glass-panel">
          <form className="modern-form" onSubmit={handleCreateTask}>
            <h2>Create New Mission</h2>
            
            <div className="input-group">
              <label>Mission / Task Name</label>
              <input
                type="text"
                placeholder="e.g. Move pallet to Dock C"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                required
                className="modern-input"
              />
            </div>

            <div className="input-group">
              <label>Assign Robot</label>
              <select
                value={newTask.robotId}
                onChange={(e) => setNewTask({ ...newTask, robotId: e.target.value })}
                required
                className="modern-select"
              >
                <option value="">Select Target Robot</option>
                {robots.map(robot => (
                  <option key={robot.id} value={robot.id}>{robot.name || robot.id}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Priority Level</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="modern-select"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="input-group">
              <label>Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="modern-input"
              />
            </div>

            <button type="submit" className="modern-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
              <Plus size={18} />
              Dispatch Mission
            </button>
          </form>
        </div>

        {/* Task Priority Board */}
        <div className="tasks-board">
          {/* High Priority Lane */}
          <div className="task-lane">
            <div className="lane-header high">
              <span>High Priority</span>
              <span className="lane-count">{getTasksByPriority('high').length}</span>
            </div>
            {getTasksByPriority('high').map(task => (
              <div key={task.id} className="task-card">
                <h4>{task.name}</h4>
                <div className="task-card-details">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={13} /> {task.robotId}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} /> {task.dueDate || 'No Date'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={13} /> Status: {task.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Medium Priority Lane */}
          <div className="task-lane">
            <div className="lane-header medium">
              <span>Medium Priority</span>
              <span className="lane-count">{getTasksByPriority('medium').length}</span>
            </div>
            {getTasksByPriority('medium').map(task => (
              <div key={task.id} className="task-card">
                <h4>{task.name}</h4>
                <div className="task-card-details">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={13} /> {task.robotId}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} /> {task.dueDate || 'No Date'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={13} /> Status: {task.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Low Priority Lane */}
          <div className="task-lane">
            <div className="lane-header low">
              <span>Low Priority</span>
              <span className="lane-count">{getTasksByPriority('low').length}</span>
            </div>
            {getTasksByPriority('low').map(task => (
              <div key={task.id} className="task-card">
                <h4>{task.name}</h4>
                <div className="task-card-details">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={13} /> {task.robotId}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} /> {task.dueDate || 'No Date'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={13} /> Status: {task.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
