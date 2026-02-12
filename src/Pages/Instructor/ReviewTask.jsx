import React from 'react';
import Sidebar from '../../component/Sidebar.jsx';

const ReviewTask = () => {
  return (
    <div className="review-task-container">
      <Sidebar />
      
      <main className="review-task-main">
        {/* Header */}
        <header className="page-header">
          <div className="header-left">
            <h2 className="header-brand">ELLA QUEST</h2>
            <span className="header-user">[USER: INSTRUCTOR]</span>
          </div>
          <div className="header-icons">
            <span className="icon">💬</span>
            <span className="icon">🔔</span>
            <span className="icon">➡️</span>
          </div>
        </header>

        {/* Toggle Tabs */}
        <div className="review-tabs">
          <button className="tab-btn active">Writing Review</button>
          <button className="tab-btn">Speaking Review</button>
        </div>

        <div className="review-workspace">
          
          {/* LEFT: Student Submission Panel */}
          <section className="submission-panel">
            {/* Student Header Info */}
            <div className="student-review-header">
              <div className="student-info">
                <div className="avatar-circle"></div>
                <div>
                  <h3 className="student-name">Ernie Bading</h3>
                  <p className="quest-info">Quest 5 Writing</p>
                </div>
              </div>
              <div className="status-badge">Pending Review</div>
            </div>

            <hr className="divider-line" />

            {/* Prompt Section */}
            <div className="content-group">
              <label>Writing Prompt</label>
              <div className="content-box prompt-box">
                {/* Placeholder for prompt text */}
              </div>
            </div>

            {/* Response Section */}
            <div className="content-group">
              <label>Student Response</label>
              <div className="content-box response-box">
                 {/* Placeholder for student answer */}
              </div>
            </div>
          </section>

          {/* RIGHT: Scoring/Grading Panel */}
          <aside className="grading-panel">
            <div className="grading-box">
              <label className="grading-label">Score</label>
              <input type="text" className="score-input" />
              
              <div className="comment-box">
                {/* Placeholder for comments */}
              </div>
              
              <div className="small-box"></div>
            </div>

            <button className="submit-grading-btn">
              {/* Bottom generic button placeholder from wireframe */}
            </button>
          </aside>

        </div>
      </main>
    </div>
  );
};

export default ReviewTask;