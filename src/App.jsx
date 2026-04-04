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
 * ProtectedRoute: Humaharang sa mga user na walang valid token.
 * Ginagamit ito para sa mga pages na kailangan ng login.
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  
  const normalizedRole = userRole ? userRole.toLowerCase().trim() : '';

  // Kung walang token, balik sa login screen
  if (!token || token === '') {
    return <Navigate to="/login" replace />;
  }

  // Kung may token pero maling dashboard ang sinusubukang pasukin
  if (allowedRole && normalizedRole !== allowedRole.toLowerCase()) {
    if (normalizedRole === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (normalizedRole === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (normalizedRole === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (normalizedRole === 'curriculum_manager') return <Navigate to="/cm/dashboard" replace />; 
    
    // Security fallback
    localStorage.clear(); 
    sessionStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * PublicRoute: Humaharang sa mga user na NAKA-LOGIN na para hindi na bumalik sa Login/Signup.
 * FIX: Papayagan ang user kung isPendingRegistration (may token galing Google pero wala pang role).
 */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userRole = (localStorage.getItem('userRole') || sessionStorage.getItem('userRole'))?.toLowerCase().trim();
  
  // Eto ang "Magic Condition" para sa New Google Users
  const isPendingRegistration = token && !userRole;

  // Check kung may force stop signal sa URL (ginagamit minsan sa logout/error flow)
  const params = new URLSearchParams(window.location.search);
  const shouldForceStop = params.get('stop') === 'true';

  // Kung naka-login na (may token + role), dideretso sa Dashboard
  if (token && token !== '' && !shouldForceStop && !isPendingRegistration) {
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
        {/* --- PUBLIC ACCESSIBLE ROUTES --- */}
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

        {/* REGISTER: Hindi nakabalot sa PublicRoute para payagan 
            ang New Google User na may temporary token na pumasok dito.
        */}
        <Route path="/register" element={<Register />} />

        {/* GOOGLE CALLBACK: Middleman para sa SSO logic */}
        <Route path="/callback" element={<GoogleCallback />} />
        <Route path="/sso-callback" element={<GoogleCallback />} />


        {/* --- PROTECTED STUDENT ROUTES --- */}
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


        {/* --- PROTECTED ADMIN ROUTES --- */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />


        {/* --- PROTECTED INSTRUCTOR ROUTES --- */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute allowedRole="instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        } />


        {/* --- PROTECTED CM ROUTES --- */}
        <Route path="/cm/dashboard" element={
          <ProtectedRoute allowedRole="curriculum_manager">
            <CMDashboard />
          </ProtectedRoute>
        } />


        {/* --- REDIRECTS & FALLBACKS --- */}
        {/* Default landing: Kung may login, dashboard. Kung wala, login. */}
        <Route path="/" element={
          <PublicRoute>
            <Navigate to="/login" replace />
          </PublicRoute>
        } />
        
        {/* 404 Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;