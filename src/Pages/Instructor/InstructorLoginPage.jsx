import React from 'react';
import { useNavigate } from 'react-router-dom';
import ellaAvatar from '../../assets/ella-avatar.png'; 

const InstructorLoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="login-screen-bg">
      <div className="login-header-label">INSTRUCTOR LOG IN</div>
      
      <div className="login-card-container">
        {/* Avatar Section */}
        <div className="avatar-box">
          <img src={ellaAvatar} alt="Instructor Avatar" className="login-avatar" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
        </div>

        <h2 className="login-subtitle">INSTRUCTOR LOGIN</h2>

        {/* Input Fields */}
        <div className="login-form">
          <div className="input-pill">
            <div className="input-icon">👤</div>
            <div className="input-divider"></div>
            <input type="text" placeholder="USERNAME" className="pill-field" />
          </div>

          <div className="input-pill">
            <div className="input-icon">🔒</div>
            <div className="input-divider"></div>
            <input type="password" placeholder="PASSWORD" className="pill-field" />
            <div className="eye-icon">👁️</div>
          </div>
          
          <div className="forgot-pwd-link">Forgot Password?</div>
        </div>

        {/* Login Action */}
        <button className="pill-submit-btn" onClick={handleLogin}>LOGIN</button>

        <div className="signup-prompt">
          Don't have an account? <span className="blue-link">Sign Up</span>
        </div>

        <p className="login-disclaimer">
          An interactive language center is a system that engages students through active 
          learning tools and encourages consistent language practice.
        </p>
      </div>
    </div>
  );
};

export default InstructorLoginPage;