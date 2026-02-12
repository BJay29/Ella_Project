import React from 'react';
import Sidebar from '../../component/Sidebar.jsx';

const ClassProgress = () => {
  // Mock data based on your screenshot
  const studentData = [
    { name: 'John D', quest: 'Q1', skill: 'Listen', score: 0, status: '❌' },
    { name: 'John D', quest: 'Q2', skill: 'Speak', score: 0, status: '❌' },
    { name: 'John D', quest: 'Q3', skill: 'Speak', score: 0, status: '❌' },
    { name: 'John D', quest: 'Q4', skill: 'Write', score: 0, status: '❌' },
    { name: 'John D', quest: 'Q5', skill: 'Read', score: 0, status: '❌' },
  ];

  return (
    <div className="progress-container">
      <Sidebar />
      
      <main className="progress-main">
        {/* Top Header */}
        <header className="progress-header">
          <h2 className="page-title">Progress</h2>
          <div className="header-icons">
            <span className="icon">💬</span>
            <span className="icon">🔔</span>
            <span className="icon">➡️</span>
          </div>
        </header>

        {/* Content Box */}
        <div className="progress-content-box">
          
          {/* Controls Row: Title + Search */}
          <div className="controls-row">
            <h3>Student Progress Overview</h3>
            <div className="search-bar-wrapper">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search" className="search-input" />
            </div>
          </div>

          {/* Filters Row */}
          <div className="filters-row">
            <div className="filter-dropdown">Class ▾</div>
            <div className="filter-dropdown">Quest ▾</div>
            <div className="filter-dropdown">Skill ▾</div>
          </div>

          {/* Data Table */}
          <table className="progress-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Quest</th>
                <th>Skill</th>
                <th>Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {studentData.map((row, index) => (
                <tr key={index}>
                  <td className="student-name">{row.name}</td>
                  <td>{row.quest}</td>
                  <td>{row.skill}</td>
                  <td className="score-cell">
                    {row.score}% 
                    <div className="score-bar-bg">
                       <div className="score-bar-fill" style={{width: `${row.score}%`}}></div>
                    </div>
                  </td>
                  <td className="status-cell">
                    <div className="status-circle">{row.status}</div>
                  </td>
                  <td>
                    <button className="view-action-btn">
                      👁 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </main>
    </div>
  );
};

export default ClassProgress;