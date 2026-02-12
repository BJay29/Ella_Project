import React from 'react';
import Sidebar from '../../component/Sidebar.jsx';

const Analytics = () => {
  return (
    <div className="analytics-container">
      <Sidebar />
      
      <main className="analytics-main">
        {/* Top User Header */}
        <header className="analytics-header">
          <h2 className="header-page-title">Analytics</h2>
          <div className="header-profile">
            <div className="instructor-info">
              <span className="inst-name">Dr. Ernie Dadea</span>
              <span className="inst-id">Instructor ID: #0420</span>
            </div>
            <div className="header-actions">
              <span className="icon-bubble">💬</span>
              <div className="profile-circle">ED</div>
            </div>
          </div>
        </header>

        {/* Title & Export */}
        <div className="title-section">
          <div>
            <h1 className="main-heading">📈 INSTRUCTOR ANALYTICS</h1>
            <p className="sub-heading">Deep-dive into class performance and curriculum metrics.</p>
          </div>
          <button className="export-btn">📥 Export to CSV</button>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          
          {/* Chart 1: Bar Chart */}
          <div className="chart-card">
            <h4 className="chart-title">Quest Completion Rates</h4>
            <div className="bar-chart-container">
              {/* Bars for Quest 1-5 */}
              {/* Each group has a dark bar (completed) and light bar (struggling) */}
              <div className="bar-group">
                <div className="bar dark" style={{height: '80%'}}></div>
                <div className="bar light" style={{height: '20%'}}></div>
                <span className="bar-label">Quest 1</span>
              </div>
              <div className="bar-group">
                <div className="bar dark" style={{height: '65%'}}></div>
                <div className="bar light" style={{height: '30%'}}></div>
                <span className="bar-label">Quest 2</span>
              </div>
              <div className="bar-group">
                <div className="bar dark" style={{height: '55%'}}></div>
                <div className="bar light" style={{height: '40%'}}></div>
                <span className="bar-label">Quest 3</span>
              </div>
              <div className="bar-group">
                <div className="bar dark" style={{height: '50%'}}></div>
                <div className="bar light" style={{height: '45%'}}></div>
                <span className="bar-label">Quest 4</span>
              </div>
              <div className="bar-group">
                <div className="bar dark" style={{height: '35%'}}></div>
                <div className="bar light" style={{height: '20%'}}></div>
                <span className="bar-label">Quest 5</span>
              </div>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot dark"></span> COMPLETED</span>
              <span className="legend-item"><span className="dot light"></span> STRUGGLING</span>
            </div>
          </div>

          {/* Chart 2: Donut Chart */}
          <div className="chart-card">
            <h4 className="chart-title">Skill Performance Distribution</h4>
            <div className="donut-chart-wrapper">
              <div className="donut-chart"></div>
            </div>
            <div className="donut-legend">
              <span style={{color: '#6366f1'}}>● Listening</span>
              <span style={{color: '#10b981'}}>● Speaking</span>
              <span style={{color: '#f59e0b'}}>● Reading</span>
              <span style={{color: '#ef4444'}}>● Writing</span>
            </div>
          </div>
        </div>

        {/* Students Table Section */}
        <div className="table-section">
          <h3 className="section-title">👥 Students Needing Intervention</h3>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>BOTTLENECK SKILL</th>
                <th>ENGAGEMENT SCORE</th>
                <th>INTERVENTION PRIORITY</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold">David K.</td>
                <td>Reading</td>
                <td>
                  <div className="engagement-cell">
                    32% 
                    <div className="progress-track"><div className="progress-fill" style={{width: '32%'}}></div></div>
                  </div>
                </td>
                <td><span className="badge critical">CRITICAL</span></td>
              </tr>
              <tr>
                <td className="font-bold">Ana L.</td>
                <td>Listening</td>
                <td>
                  <div className="engagement-cell">
                    45% 
                    <div className="progress-track"><div className="progress-fill" style={{width: '45%'}}></div></div>
                  </div>
                </td>
                <td><span className="badge high">HIGH</span></td>
              </tr>
              <tr>
                <td className="font-bold">John M.</td>
                <td>Writing</td>
                <td>
                  <div className="engagement-cell">
                    52% 
                    <div className="progress-track"><div className="progress-fill" style={{width: '52%'}}></div></div>
                  </div>
                </td>
                <td><span className="badge moderate">MODERATE</span></td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
};

export default Analytics;