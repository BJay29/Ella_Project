import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login          from './pages/auth/login';
import GoogleCallback from './pages/auth/googlecallback';

// Dashboard Pages
import StudentDashboard    from './pages/student/dashboard';
import AdminDashboard      from './pages/admin/AdminDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CMDashboard         from './pages/cm/cmDashboard';

// Curriculum Manager Components
import AddQuestion from './pages/cm/QuestBuilder/AddQuestion';

// Student Game Components
import QuestLevels from './pages/student/QuestLevels';
import GameEngine  from './pages/student/GameEngine';

/**
 * ProtectedRoute Component
 * Restricts access based on authentication token and user role.
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  const token      = localStorage.getItem('token')    || sessionStorage.getItem('token');
  const userRole   = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  const normalized = userRole ? userRole.toLowerCase().trim() : '';

  // Redirect to login if no token is found
  if (!token || token === '') return <Navigate to="/login" replace />;

  // Redirect to appropriate dashboard if role is unauthorized for this route
  if (allowedRole && normalized !== allowedRole.toLowerCase()) {
    if (normalized === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (normalized === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (normalized === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (normalized === 'curriculum_manager' || normalized === 'cm') return <Navigate to="/cm/dashboard" replace />;
    
    // Clear storage if role is invalid
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    sessionStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * PublicRoute Component
 * Prevents authenticated users from accessing login/landing pages.
 */
const PublicRoute = ({ children }) => {
  const token    = localStorage.getItem('token')    || sessionStorage.getItem('token');
  const userRole = (localStorage.getItem('userRole') || sessionStorage.getItem('userRole'))?.toLowerCase().trim();
  const isPending = token && !userRole;
  const params    = new URLSearchParams(window.location.search);

  // If already logged in, redirect to respective dashboard
  if (token && token !== '' && !params.get('stop') && !isPending) {
    if (userRole === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (userRole === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (userRole === 'curriculum_manager' || userRole === 'cm') return <Navigate to="/cm/dashboard" replace />;
  }
  return children;
};

// Helper component for Curriculum Manager access
const CM = ({ children }) => (
  <ProtectedRoute allowedRole="curriculum_manager">{children}</ProtectedRoute>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC AUTH ROUTES --- */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        
        {/* SSO Callbacks - Handles both Login and Auto-Registration */}
        <Route path="/callback"     element={<GoogleCallback />} />
        <Route path="/sso-callback" element={<GoogleCallback />} />

        {/* --- STUDENT ROUTES --- */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>
        } />

        <Route path="/student/quest/:questId/levels" element={
          <ProtectedRoute allowedRole="student"><QuestLevels /></ProtectedRoute>
        } />

        <Route path="/student/quest/:questId/:quest_level_id/levels" element={
          <ProtectedRoute allowedRole="student"><QuestLevels /></ProtectedRoute>
        } />

        <Route path="/student/quests" element={
          <ProtectedRoute allowedRole="student"><QuestLevels /></ProtectedRoute>
        } />

        <Route path="/student/quest/:questId/level/:quest_level_id/play/:content_id" element={
          <ProtectedRoute allowedRole="student"><GameEngine /></ProtectedRoute>
        } />

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
        } />

        {/* --- INSTRUCTOR ROUTES --- */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute allowedRole="instructor"><InstructorDashboard /></ProtectedRoute>
        } />

        {/* --- CURRICULUM MANAGER (CM) ROUTES --- */}
        <Route path="/cm/dashboard" element={<CM><CMDashboard /></CM>} />
        <Route path="/cm/dashboard/quest/:questId" element={<CM><CMDashboard /></CM>} />
        <Route path="/cm/dashboard/quest/:questId/level/:quest_level_id" element={<CM><CMDashboard /></CM>} />

        <Route path="/cm/dashboard/quest/:questId/level/:quest_level_id/activity/:activityId/add-question"
          element={<CM><AddQuestion /></CM>} />
        <Route path="/cm/dashboard/quest/:questId/level/:quest_level_id/quiz/:quizId/add-question"
          element={<CM><AddQuestion /></CM>} />

        {/* --- SYSTEM ROUTES --- */}
        <Route path="/"  element={<PublicRoute><Navigate to="/login" replace /></PublicRoute>} />
        <Route path="*"  element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;