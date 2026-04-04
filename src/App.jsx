import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages 
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import SignupMethod from './pages/auth/preregister'; 
import GoogleCallback from './pages/auth/googlecallback'; 

// Role-based Pages
import StudentDashboard from './pages/student/dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CMDashboard from './pages/cm/cmDashboard'; 

// Student Specific Pages
import QuestLevels from './pages/student/QuestLevels'; 
import GameEngine from './pages/student/GameEngine'; 

/**
 * ProtectedRoute: Humaharang sa mga user na walang valid token 
 * o maling role para sa page na sinusubukang puntahan.
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  
  const normalizedRole = userRole ? userRole.toLowerCase().trim() : '';

  // Kung walang token, balik sa login
  if (!token || token === '') {
    return <Navigate to="/login" replace />;
  }

  // Kung may token pero maling role, i-redirect sa tamang dashboard nila
  if (allowedRole && normalizedRole !== allowedRole.toLowerCase()) {
    if (normalizedRole === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (normalizedRole === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (normalizedRole === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (normalizedRole === 'curriculum_manager') return <Navigate to="/cm/dashboard" replace />; 
    
    localStorage.clear(); 
    sessionStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * PublicRoute: Humaharang sa mga user na NAKA-LOGIN na.
 * FIX: Dinagdagan ng check para sa 'existing' status para hindi mag-auto-redirect
 * ang system kapag ang user ay galing sa SSO existing account check.
 */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userRole = (localStorage.getItem('userRole') || sessionStorage.getItem('userRole'))?.toLowerCase().trim();
  
  // I-check kung ang current URL ay may signal na existing user (mula sa redirect)
  const isExistingUserRedirect = window.location.search.includes('status=existing') || 
                                 window.location.search.includes('isNewUser=false');

  // Kung may token at HINDI ito existing user redirect, papasukin sa dashboard
  if (token && token !== '' && !isExistingUserRedirect) {
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
        {/* DEFAULT ROUTE */}
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

        <Route path="/signup" element={
            <PublicRoute>
                <SignupMethod />
            </PublicRoute>
        } />

        <Route path="/register" element={
            <PublicRoute>
                <Register />
            </PublicRoute>
        } />

        {/* GOOGLE AUTH CALLBACK ROUTES */}
        <Route path="/callback" element={<GoogleCallback />} />
        <Route path="/sso-callback" element={<GoogleCallback />} />

        {/* STUDENT ROUTES */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/student/quests" element={
          <ProtectedRoute allowedRole="student">
            <QuestLevels />
          </ProtectedRoute>
        } />

        <Route path="/student/quest/:questId/level/:levelId/play/:typeId" element={
          <ProtectedRoute allowedRole="student">
            <GameEngine />
          </ProtectedRoute>
        } />

        {/* ADMIN ROUTES */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* INSTRUCTOR ROUTES */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute allowedRole="instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        } />

        {/* CURRICULUM MANAGER ROUTES */}
        <Route path="/cm/dashboard" element={
          <ProtectedRoute allowedRole="curriculum_manager">
            <CMDashboard />
          </ProtectedRoute>
        } />

        {/* 404 CATCH-ALL: Balik sa Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;