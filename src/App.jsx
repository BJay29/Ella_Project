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

// Curriculum Manager (CM)
import CMDashboard from './pages/cm/cmDashboard'; 

// ── Protected Route Guard ─────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  // Normalize ang role para iwas error sa casing
  const normalizedRole = userRole ? userRole.toLowerCase().trim() : '';

  // 1. Kung walang token, balik sa login
  if (!token || token === '') {
    return <Navigate to="/login" replace />;
  }

  // 2. Kung may token pero hindi match ang role sa "allowedRole"
  if (allowedRole && normalizedRole !== allowedRole.toLowerCase()) {
    // Redirection Logic base sa role para hindi sila ma-stuck
    if (normalizedRole === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (normalizedRole === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (normalizedRole === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (normalizedRole === 'curriculum_manager') return <Navigate to="/cm/dashboard" replace />; 
    
    // Fallback kung logged in pero weird ang role
    localStorage.clear(); // Clean up para sigurado
    return <Navigate to="/login" replace />;
  }

  // 3. Kung pasado sa lahat, ipakita ang page
  return children;
};

// ── Public Route Guard (Bawal mag-login/register kung logged in na) ──
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole')?.toLowerCase().trim();

  if (token && token !== '') {
    if (userRole === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (userRole === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (userRole === 'curriculum_manager') return <Navigate to="/cm/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route - I-check kung logged in o hindi */}
        <Route path="/" element={
            <PublicRoute>
                <Navigate to="/login" replace />
            </PublicRoute>
        } />

        {/* Public Routes */}
        <Route path="/login" element={
            <PublicRoute>
                <Login />
            </PublicRoute>
        } />
        <Route path="/register" element={
            <PublicRoute>
                <Register />
            </PublicRoute>
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* ── ROLE-BASED DASHBOARD ROUTES ── */}

        {/* Student Routes */}
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

        {/* Curriculum Manager (CM) Routes */}
        <Route path="/cm/dashboard" element={
          <ProtectedRoute allowedRole="curriculum_manager">
            <CMDashboard />
          </ProtectedRoute>
        } />

        {/* Catch-all route - Redirect sa login kung walang match */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;