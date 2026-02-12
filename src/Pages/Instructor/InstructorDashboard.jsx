import React from 'react';
import Sidebar from '../../component/Sidebar.jsx';

const InstructorDashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        
        {/* Header */}
        <header className="dashboard-header">
          <h2 className="page-title">DASHBOARD</h2>
          <div className="header-actions">
            <span className="icon">💬</span>
            <span className="icon">🔔</span>
            <span className="icon">➡️</span>
          </div>
        </header>

        <section className="metrics-row">
          <div className="metric-card">
            <h3>Total Students</h3>
            <div className="metric-value">0</div>
            <div className="progress-bar"></div>
          </div>
          
          <div className="metric-card">
            <h3>Flagged Students</h3>
            <div className="metric-value">
              0 <span className="sub-text">Needs attention</span>
            </div>
            <div className="progress-bar"></div>
          </div>

          <div className="metric-card">
            <h3>Avg Class Score</h3>
            <div className="metric-value">0%</div>
            <div className="progress-bar"></div>
          </div>
        </section>

        <section className="action-grid">
          {/* Card 1: Class Progress */}
          <div className="action-card">
            <div className="card-icon-box">📊</div>
            <h4>Class Progress</h4>
            <p>track real time student activity module completion rates and overall engagement metrics across all active courses</p>
            <button className="view-btn">View details ➝</button>
          </div>

          {/* Card 2: Intervention Alerts (Red) */}
          <div className="action-card">
            <div className="card-icon-box red-icon">!</div>
            <h4>Intervention Alerts</h4>
            <p>System-generated alerts for students falling behind or missing critical milestone. Immediate action recommended</p>
            <button className="view-btn">View details ➝</button>
          </div>

          {/* Card 3: Review Task */}
          <div className="action-card">
            <div className="card-icon-box">📋</div>
            <h4>Review Task</h4>
            <p>Pending assignment, quiz reviews, and manual grading task. keep your feedback loop tight and efficient.</p>
            <button className="view-btn">View details ➝</button>
          </div>

          {/* Card 4: Analytics */}
          <div className="action-card">
            <div className="card-icon-box">📈</div>
            <h4>Analytics Dashboard</h4>
            <p>Deep-dive reports into curriculum effectiveness, student demographics, and long term performance trends.</p>
            <button className="view-btn">View details ➝</button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="activity-section">
          <div className="activity-header">
            <h4>Recent activity</h4>
            <button className="view-all-btn">VIEW ALL LOGS</button>
          </div>
          <div className="activity-list">
            {/* Placeholder rows matching the sketch */}
            <div className="activity-row"></div>
            <div className="activity-row"></div>
            <div className="activity-row"></div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default InstructorDashboard;