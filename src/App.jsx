import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import SignupMethod from './pages/auth/preregister'; 
import GoogleCallback from './pages/auth/GoogleCallback'; 

// Role-based Pages
import StudentDashboard from './pages/student/dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CMDashboard from './pages/cm/cmDashboard'; 

// --- Protected Route Guard ---
// Prevents unauthorized access. Redirects to login if no token exists.
// Redirects to the correct dashboard if the user tries to access a page they don't own.
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  const normalizedRole = userRole ? userRole.toLowerCase().trim() : '';

  if (!token || token === '') {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && normalizedRole !== allowedRole.toLowerCase()) {
    if (normalizedRole === 'student')            return <Navigate to="/student/dashboard" replace />;
    if (normalizedRole === 'admin')              return <Navigate to="/admin/dashboard" replace />;
    if (normalizedRole === 'instructor')         return <Navigate to="/instructor/dashboard" replace />;
    if (normalizedRole === 'curriculum_manager') return <Navigate to="/cm/dashboard" replace />; 
    
    localStorage.clear(); 
    return <Navigate to="/login" replace />;
  }

  return children;
};

// --- Public Route Guard ---
// Prevents logged-in users from accessing Login/Signup pages.
// Redirects them straight to their respective dashboards.
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

        {/* Instructor Dashboard */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute allowedRole="instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        } />

        {/* Curriculum Manager (CM) Dashboard */}
        <Route path="/cm/dashboard" element={
          <ProtectedRoute allowedRole="curriculum_manager">
            <CMDashboard />
          </ProtectedRoute>
        } />

        {/* Fallback: Catch-all route redirects to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;