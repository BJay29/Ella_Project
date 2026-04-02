import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import SignupMethod from './pages/auth/preregister'; 
import GoogleCallback from './pages/auth/GoogleCallback'; 

// Role-based Pages
import StudentDashboard from './pages/student/dashboard';
<<<<<<< HEAD
import AdminDashboard from './pages/admin/AdminDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
=======
// Dinagdag na Student Components
import QuestLevels from './pages/student/QuestLevels'; 
import GameEngine from './pages/student/GameEngine';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Instructor - FIXED: Tinitiyak na tama ang casing para sa Vercel (Linux) deployment
// Siguraduhin na ang file sa folder ay eksaktong "InstructorDashboard.jsx" o palitan base sa actual filename
import InstructorDashboard from './pages/Instructor/InstructorDashboard';

// Curriculum Manager (CM) - FIXED: Inayos ang casing (cmDashboard -> CMDashboard kung yan ang nasa file)
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
import CMDashboard from './pages/cm/cmDashboard'; 

// --- Protected Route Guard ---
// Prevents unauthorized access. Redirects to login if no token exists.
// Redirects to the correct dashboard if the user tries to access a page they don't own.
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
<<<<<<< HEAD
  const normalizedRole = userRole ? userRole.toLowerCase().trim() : '';
=======
  const normalizedRole = userRole ? String(userRole).toLowerCase().trim() : '';
  const targetRole = allowedRole ? String(allowedRole).toLowerCase().trim() : '';
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1

  // 1. Kung walang token, balik sa login
  if (!token || token === '') {
    return <Navigate to="/login" replace />;
  }

<<<<<<< HEAD
  if (allowedRole && normalizedRole !== allowedRole.toLowerCase()) {
=======
  // 2. Role Check
  if (targetRole && normalizedRole !== targetRole) {
    console.warn(`Access Denied: Role ${normalizedRole} is not authorized for ${targetRole} routes.`);
    
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
    if (normalizedRole === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (normalizedRole === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (normalizedRole === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (normalizedRole === 'curriculum_manager') return <Navigate to="/cm/dashboard" replace />; 
    
    localStorage.clear(); 
    return <Navigate to="/login" replace />;
  }

  return children;
};

<<<<<<< HEAD
// --- Public Route Guard ---
// Prevents logged-in users from accessing Login/Signup pages.
// Redirects them straight to their respective dashboards.
=======
// ── Public Route Guard ──
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
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
<<<<<<< HEAD
        {/* --- ROOT & AUTH ROUTES --- */}
        <Route path="/" element={
            <PublicRoute>
                <Navigate to="/login" replace />
            </PublicRoute>
        } />

        <Route path="/login" element={
            <PublicRoute>
                <Login />
            </PublicRoute>
        } />

        {/* Unified Signup Flow: Selection of Method */}
        <Route path="/signup" element={
            <PublicRoute>
                <SignupMethod />
            </PublicRoute>
        } />

        {/* Final Registration Form */}
        <Route path="/register" element={
            <PublicRoute>
                <Register />
            </PublicRoute>
        } />

        {/* --- GOOGLE SSO CALLBACK ROUTE --- */}
        {/* This handles the data returned by Google after authentication */}
        <Route path="/auth/callback" element={<GoogleCallback />} />

        {/* --- ROLE-BASED DASHBOARD ROUTES --- */}

        {/* Student Dashboard */}
        <Route path="/student/dashboard" element={
=======
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
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
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

        {/* Instructor Dashboard */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute allowedRole="instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        } />

<<<<<<< HEAD
        {/* Curriculum Manager (CM) Dashboard */}
=======
        {/* Curriculum Manager (CM) Routes */}
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
        <Route path="/cm/dashboard" element={
          <ProtectedRoute allowedRole="curriculum_manager">
            <CMDashboard />
          </ProtectedRoute>
        } />

<<<<<<< HEAD
        {/* Fallback: Catch-all route redirects to Login */}
=======
        {/* Catch-all route */}
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;