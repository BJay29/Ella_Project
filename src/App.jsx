import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login          from './pages/auth/login';
import Register       from './pages/auth/register';
import SignupMethod   from './pages/auth/preregister';
import GoogleCallback from './pages/auth/googlecallback';

// Role-based Pages
import StudentDashboard    from './pages/student/dashboard';
import AdminDashboard      from './pages/admin/AdminDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CMDashboard         from './pages/cm/cmDashboard';

// CM Specific Pages
import AddQuestion from './pages/cm/QuestBuilder/AddQuestion';

// Student Specific Pages
import QuestLevels from './pages/student/QuestLevels';
import GameEngine  from './pages/student/GameEngine';

// ─────────────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRole }) => {
  const token      = localStorage.getItem('token')    || sessionStorage.getItem('token');
  const userRole   = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  const normalized = userRole ? userRole.toLowerCase().trim() : '';

  // 1. Kung walang token, balik sa login
  if (!token || token === '') return <Navigate to="/login" replace />;

  // 2. Role Authorization Logic
  if (allowedRole && normalized !== allowedRole.toLowerCase()) {
    // I-redirect lang sa tamang dashboard ng user, huwag i-clear ang storage
    if (normalized === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (normalized === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (normalized === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (normalized === 'curriculum_manager') return <Navigate to="/cm/dashboard" replace />;
    
    // Kung walang valid role, doon lang mag-lilinis ng session
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    sessionStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ─────────────────────────────────────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const token    = localStorage.getItem('token')    || sessionStorage.getItem('token');
  const userRole = (localStorage.getItem('userRole') || sessionStorage.getItem('userRole'))?.toLowerCase().trim();
  const isPending = token && !userRole;
  const params    = new URLSearchParams(window.location.search);

  // Kung logged in na, i-redirect sa tamang dashboard base sa role
  if (token && token !== '' && !params.get('stop') && !isPending) {
    if (userRole === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (userRole === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (userRole === 'curriculum_manager') return <Navigate to="/cm/dashboard" replace />;
  }
  return children;
};

// ─────────────────────────────────────────────────────────────────────────────
const CM = ({ children }) => (
  <ProtectedRoute allowedRole="curriculum_manager">{children}</ProtectedRoute>
);

// ─────────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Routes>

        {/* ── Public ── */}
        <Route path="/login"         element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup"        element={<PublicRoute><SignupMethod /></PublicRoute>} />
        <Route path="/register"      element={<Register />} />
        <Route path="/callback"      element={<GoogleCallback />} />
        <Route path="/sso-callback"  element={<GoogleCallback />} />

        {/* ── Student ── */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>
        } />
        
        {/* FIXED: Idinagdag ang tamang path para sa levels na may parameter */}
        <Route path="/student/quest/:questId/levels" element={
          <ProtectedRoute allowedRole="student"><QuestLevels /></ProtectedRoute>
        } />

        <Route path="/student/quests" element={
          <ProtectedRoute allowedRole="student"><QuestLevels /></ProtectedRoute>
        } />

        <Route path="/student/quest/:questId/level/:levelId/play/:typeId" element={
          <ProtectedRoute allowedRole="student"><GameEngine /></ProtectedRoute>
        } />

        {/* ── Admin ── */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
        } />

        {/* ── Instructor ── */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute allowedRole="instructor"><InstructorDashboard /></ProtectedRoute>
        } />

        {/* ── CM: main dashboard (list view) ── */}
        <Route path="/cm/dashboard" element={<CM><CMDashboard /></CM>} />

        {/* ── CM Routes with Params ── */}
        <Route path="/cm/dashboard/quest/:questId" element={<CM><CMDashboard /></CM>} />
        <Route path="/cm/dashboard/quest/:questId/level/:levelId" element={<CM><CMDashboard /></CM>} />

        {/* ── CM: Add / Edit Questions ── */}
        <Route
          path="/cm/dashboard/quest/:questId/level/:levelId/activity/:activityId/add-question"
          element={<CM><AddQuestion /></CM>}
        />
        <Route
          path="/cm/dashboard/quest/:questId/level/:levelId/quiz/:quizId/add-question"
          element={<CM><AddQuestion /></CM>}
        />

        {/* ── Redirects ── */}
        <Route path="/"  element={<PublicRoute><Navigate to="/login" replace /></PublicRoute>} />
        <Route path="*"  element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;