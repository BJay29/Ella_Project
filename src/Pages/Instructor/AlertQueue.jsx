import React from 'react';
import Sidebar from '../../component/Sidebar.jsx';

const InterventionQueue = () => {
  // Mock data to match the screenshot
  const alerts = [
    { id: 1, name: 'Ana L.', quest: 3, skill: 'Listening', attempts: 2 },
    { id: 2, name: 'Ana L.', quest: 5, skill: 'Listening', attempts: 3 },
    { id: 3, name: 'Ana L.', quest: 2, skill: 'Listening', attempts: 4 },
  ];

  return (
    <div className="intervention-container">
      <Sidebar />
      
      <main className="intervention-main">
        {/* Page Header */}
        <header className="page-header">
          <h2 className="header-title">INTERVENTION</h2>
          <div className="header-icons">
            <span className="icon">💬</span>
            <span className="icon">🔔</span>
            <span className="icon">➡️</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="alerts-content">
          
          <div className="alerts-top-bar">
            <div className="alerts-title-group">
              <span className="siren-icon">🚨</span>
              <h3>Intervention Alerts</h3>
            </div>
            <a href="#" className="view-logs-link">View All Logs ➝</a>
          </div>

          <p className="alerts-description">
            High-priority alerts for students failing to meet performance benchmarks.
          </p>

          <div className="alerts-list">
            {alerts.map((alert) => (
              <div key={alert.id} className="alert-card">
                
                {/* Left: Icon */}
                <div className="alert-icon-box">
                  <div className="red-circle-icon">!</div>
                </div>

                {/* Middle: Info */}
                <div className="alert-info">
                  <h4>{alert.name}</h4>
                  <div className="alert-meta">
                    <span>📖 Quest {alert.quest}</span>
                    <span className="divider">|</span>
                    <span>👤 {alert.skill}</span>
                    <span className="divider">|</span>
                    <span className="red-text">🔄 {alert.attempts} failed attempts</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="alert-actions">
                  <button className="btn-review">REVIEW STUDENT</button>
                  <button className="btn-remedial">ASSIGN REMEDIAL</button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
};

export default InterventionQueue;