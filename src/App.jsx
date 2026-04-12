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
// ProtectedRoute
// ─────────────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRole }) => {
  const token    = localStorage.getItem('token')    || sessionStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  const normalized = userRole ? userRole.toLowerCase().trim() : '';

  if (!token || token === '') return <Navigate to="/login" replace />;

  if (allowedRole && normalized !== allowedRole.toLowerCase()) {
    if (normalized === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (normalized === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (normalized === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (normalized === 'curriculum_manager') return <Navigate to="/cm/dashboard" replace />;
    localStorage.clear();
    sessionStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ─────────────────────────────────────────────────────────────────────────────
// PublicRoute
// ─────────────────────────────────────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const token    = localStorage.getItem('token')    || sessionStorage.getItem('token');
  const userRole = (localStorage.getItem('userRole') || sessionStorage.getItem('userRole'))?.toLowerCase().trim();
  const isPending = token && !userRole;
  const params    = new URLSearchParams(window.location.search);

  if (token && token !== '' && !params.get('stop') && !isPending) {
    if (userRole === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (userRole === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (userRole === 'curriculum_manager') return <Navigate to="/cm/dashboard" replace />;
  }
  return children;
};

// ─────────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Routes>

        {/* ── Public ── */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup"   element={<PublicRoute><SignupMethod /></PublicRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/callback"     element={<GoogleCallback />} />
        <Route path="/sso-callback" element={<GoogleCallback />} />

        {/* ── Student ── */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>
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

        {/* ── CM: main dashboard ── */}
        <Route path="/cm/dashboard" element={
          <ProtectedRoute allowedRole="curriculum_manager"><CMDashboard /></ProtectedRoute>
        } />

        {/* ── CM: quest detail → renders CMDashboard which restores selection-view ──
            When AddQuestion calls navigate(-1), it lands here.
            CMDashboard reads the route params and auto-navigates to selection-view.
        ── */}
        <Route path="/cm/dashboard/quest/:questId" element={
          <ProtectedRoute allowedRole="curriculum_manager"><CMDashboard /></ProtectedRoute>
        } />

        <Route path="/cm/dashboard/quest/:questId/level/:levelId" element={
          <ProtectedRoute allowedRole="curriculum_manager"><CMDashboard /></ProtectedRoute>
        } />

        {/* ── CM: Add/Edit Questions ──
            Two separate routes: one for activity, one for quiz.
            ?mode=add  → AddQuestion opens in add mode
            ?mode=edit → AddQuestion opens in edit mode
        ── */}
        <Route
          path="/cm/dashboard/quest/:questId/level/:levelId/activity/:activityId/add-question"
          element={
            <ProtectedRoute allowedRole="curriculum_manager"><AddQuestion /></ProtectedRoute>
          }
        />
        <Route
          path="/cm/dashboard/quest/:questId/level/:levelId/quiz/:quizId/add-question"
          element={
            <ProtectedRoute allowedRole="curriculum_manager"><AddQuestion /></ProtectedRoute>
          }
        />

        {/* ── Redirects ── */}
        <Route path="/"  element={<PublicRoute><Navigate to="/login" replace /></PublicRoute>} />
        <Route path="*"  element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
