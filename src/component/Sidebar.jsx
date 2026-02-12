import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Menu configuration to match your screenshot
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Class Progress', path: '/progress' },
    { name: 'Alert Queue', path: '/alerts'},
    { name: 'Review task', path: '/review',},
    { name: 'Analytics', path: '/analytics'},
    { name: 'Message', path: '/messaging'},
  ];

  return (
    <aside className="sidebar-container">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <h1>ELLA</h1>
        <h1>QUEST</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-menu">
        <p className="menu-label">Menu</p>
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Footer / Settings */}
      <div className="sidebar-footer">
        <div className="footer-item">
          <span className="icon">⚙️</span> Settings
        </div>
        <div className="footer-item logout" onClick={() => navigate('/')}>
          <span className="icon">➡️</span> Log out
        </div>
      </div>
    </aside>
  );
}