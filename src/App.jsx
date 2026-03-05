import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/auth/login';
import Register from './pages/auth/register';

// Student
import StudentDashboard from './pages/student/dashboard';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Instructor
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import ClassProgress from './pages/Instructor/ClassProgress';
import AlertQueue from './pages/Instructor/AlertQueue';
import ReviewTask from './pages/Instructor/ReviewTask';
import Analytics from './pages/Instructor/Analytics';
import Messaging from './pages/Instructor/Messaging';

// ── Protected Route Guard ─────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const normalizedRole = userRole ? userRole.toLowerCase().trim() : '';

  if (!token || token === '') {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && normalizedRole !== allowedRole.toLowerCase()) {
    if (normalizedRole === 'student')    return <Navigate to="/student/dashboard" replace />;
    if (normalizedRole === 'admin')      return <Navigate to="/admin/dashboard" replace />;
    if (normalizedRole === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student - supports both /dashboard and /student/dashboard */}
        <Route path="/dashboard"         element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* Instructor */}
        <Route path="/instructor/dashboard" element={<ProtectedRoute allowedRole="instructor"><InstructorDashboard /></ProtectedRoute>} />
        <Route path="/instructor/progress"  element={<ProtectedRoute allowedRole="instructor"><ClassProgress /></ProtectedRoute>} />
        <Route path="/instructor/alerts"    element={<ProtectedRoute allowedRole="instructor"><AlertQueue /></ProtectedRoute>} />
        <Route path="/instructor/review"    element={<ProtectedRoute allowedRole="instructor"><ReviewTask /></ProtectedRoute>} />
        <Route path="/instructor/analytics" element={<ProtectedRoute allowedRole="instructor"><Analytics /></ProtectedRoute>} />
        <Route path="/instructor/messaging" element={<ProtectedRoute allowedRole="instructor"><Messaging /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;