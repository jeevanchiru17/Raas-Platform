import React from 'react';
import './App.css';
import { LayoutDashboard, Cpu, ListTodo, CreditCard, Coffee } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import RobotsList from './pages/RobotsList';
import TaskManager from './pages/TaskManager';
import Billing from './pages/Billing';
import RoboBarista from './pages/RoboBarista';

function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  const pages = {
    dashboard: <Dashboard />,
    robots: <RobotsList />,
    tasks: <TaskManager />,
    billing: <Billing />,
    barista: <RoboBarista />
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="logo">
          <h1>
            <Cpu size={24} style={{ color: 'var(--accent-cyan)' }} /> 
            RaaS Control
          </h1>
        </div>
        <ul className="nav-menu">
          <li>
            <a onClick={() => setCurrentPage('dashboard')}
               className={currentPage === 'dashboard' ? 'active' : ''}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </a>
          </li>
          <li>
            <a onClick={() => setCurrentPage('robots')}
               className={currentPage === 'robots' ? 'active' : ''}
            >
              <Cpu size={20} />
              Robots Fleet
            </a>
          </li>
          <li>
            <a onClick={() => setCurrentPage('barista')}
               className={currentPage === 'barista' ? 'active' : ''}
            >
              <Coffee size={20} />
              Robo Barista
            </a>
          </li>
          <li>
            <a onClick={() => setCurrentPage('tasks')}
               className={currentPage === 'tasks' ? 'active' : ''}
            >
              <ListTodo size={20} />
              Task Queue
            </a>
          </li>
          <li>
            <a onClick={() => setCurrentPage('billing')}
               className={currentPage === 'billing' ? 'active' : ''}
            >
              <CreditCard size={20} />
              Billing & Tiers
            </a>
          </li>
        </ul>
      </nav>
      <main className="main-content">
        {pages[currentPage]}
      </main>
    </div>
  );
}

export default App;
