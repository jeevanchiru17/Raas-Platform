import React from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import RobotsList from './pages/RobotsList';
import TaskManager from './pages/TaskManager';
import Billing from './pages/Billing';
import { LayoutDashboard, Cpu, CheckSquare, CreditCard, Bot } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  const pages = {
    dashboard: <Dashboard />,
    robots: <RobotsList />,
    tasks: <TaskManager />,
    billing: <Billing />
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <div>
          <div className="logo">
            <Bot size={28} />
            <h1>RAAS PLATFORM</h1>
          </div>
          <div className="nav-menu">
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className={`nav-item-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
            
            <button 
              onClick={() => setCurrentPage('robots')}
              className={`nav-item-btn ${currentPage === 'robots' ? 'active' : ''}`}
            >
              <Cpu size={20} />
              Robots Fleet
            </button>

            <button 
              onClick={() => setCurrentPage('tasks')}
              className={`nav-item-btn ${currentPage === 'tasks' ? 'active' : ''}`}
            >
              <CheckSquare size={20} />
              Task Manager
            </button>

            <button 
              onClick={() => setCurrentPage('billing')}
              className={`nav-item-btn ${currentPage === 'billing' ? 'active' : ''}`}
            >
              <CreditCard size={20} />
              Billing
            </button>
          </div>
        </div>
        
        <div className="sidebar-footer">
          LOCAL ROS v1.0.0
        </div>
      </nav>
      <main className="main-content">
        {pages[currentPage]}
      </main>
    </div>
  );
}

export default App;
