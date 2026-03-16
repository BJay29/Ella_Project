import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import VerifyEmail from './pages/auth/verifyemail'; 

// Student
import StudentDashboard from './pages/student/dashboard';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Instructor
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import ClassProgress from './pages/instructor/ClassProgress';
import AlertQueue from './pages/instructor/AlertQueue';
import ReviewTask from './pages/instructor/ReviewTask';
import Analytics from './pages/instructor/Analytics';
import Messaging from './pages/instructor/Messaging';

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
        {/* BINAGO: Ang default "/" ay magdidirect na sa Verify Email imbes na Login */}
        <Route path="/" element={<Navigate to="/verify-email" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Verification flow: Verification muna bago Register */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/register" element={<Register />} />

        {/* Student - supports parehong /dashboard at /student/dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Dashboard */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Instructor Routes */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute allowedRole="instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/instructor/progress" element={
          <ProtectedRoute allowedRole="instructor">
            <ClassProgress />
          </ProtectedRoute>
        } />
        <Route path="/instructor/alerts" element={
          <ProtectedRoute allowedRole="instructor">
            <AlertQueue />
          </ProtectedRoute>
        } />
        <Route path="/instructor/review" element={
          <ProtectedRoute allowedRole="instructor">
            <ReviewTask />
          </ProtectedRoute>
        } />
        <Route path="/instructor/analytics" element={
          <ProtectedRoute allowedRole="instructor">
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/instructor/messaging" element={
          <ProtectedRoute allowedRole="instructor">
            <Messaging />
          </ProtectedRoute>
        } />

        {/* BINAGO: Catch-all route ay magdidirect na sa Verify Email */}
        <Route path="*" element={<Navigate to="/verify-email" replace />} />
      </Routes>
    </Router>
  );
}

export default App;