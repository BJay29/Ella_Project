import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import VerifyEmail from './pages/auth/verifyemail'; 

// Student
import StudentDashboard from './pages/student/dashboard';
// Dinagdag na Student Components
import QuestLevels from './pages/student/QuestLevels'; 
import GameEngine from './pages/student/GameEngine';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Instructor - FIXED: Tinitiyak na tama ang casing para sa Vercel (Linux) deployment
// Siguraduhin na ang file sa folder ay eksaktong "InstructorDashboard.jsx" o palitan base sa actual filename
import InstructorDashboard from './pages/instructor/InstructorDashboard';

// Curriculum Manager (CM) - FIXED: Inayos ang casing (cmDashboard -> CMDashboard kung yan ang nasa file)
import CMDashboard from './pages/cm/cmDashboard'; 

// ── Protected Route Guard ─────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  const normalizedRole = userRole ? String(userRole).toLowerCase().trim() : '';
  const targetRole = allowedRole ? String(allowedRole).toLowerCase().trim() : '';

  // 1. Kung walang token, balik sa login
  if (!token || token === '') {
    return <Navigate to="/login" replace />;
  }

  // 2. Role Check
  if (targetRole && normalizedRole !== targetRole) {
    console.warn(`Access Denied: Role ${normalizedRole} is not authorized for ${targetRole} routes.`);
    
    if (normalizedRole === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (normalizedRole === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (normalizedRole === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (normalizedRole === 'curriculum_manager') return <Navigate to="/cm/dashboard" replace />; 
    
    localStorage.clear(); 
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ── Public Route Guard ──
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
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

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
        
        {/* Verification Page */}
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* ── ROLE-BASED DASHBOARD ROUTES ── */}

        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />

        {/* Level Selection View */}
        <Route path="/student/quest/:questId/levels" element={
          <ProtectedRoute allowedRole="student">
            <QuestLevels />
          </ProtectedRoute>
        } />

        {/* ACTUAL GAMEPLAY ROUTE */}
        <Route path="/student/quest/:questId/level/:levelId/play/:typeId" element={
          <ProtectedRoute allowedRole="student">
            <GameEngine />
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

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;