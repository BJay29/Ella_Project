import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// PAGES (Admin/Student/Auth)
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import StudentDashboard from './pages/student/dashboard';
import AdminDashboard from './pages/admin/dashboard';

// INSTRUCTOR PAGES 
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import ClassProgress from './pages/instructor/ClassProgress';
import AlertQueue from './pages/instructor/AlertQueue';
import ReviewTask from './pages/instructor/ReviewTask';
import Analytics from './pages/instructor/Analytics';
import Messaging from './pages/instructor/Messaging';

// --- UPDATED PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  // I-normalize natin ang role galing storage
  const userRole = localStorage.getItem('userRole')?.toLowerCase().trim();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Double check: kung ang required role ay 'instructor', siguradong lowercase check din.
  if (allowedRole && userRole !== allowedRole.toLowerCase()) {
    console.warn(`Unauthorized! Role ${userRole} is not allowed for this page.`);
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* STUDENT ROUTES */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>
        } />

        {/* ADMIN ROUTES */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
        } />

        {/* INSTRUCTOR ROUTES */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute allowedRole="instructor"><InstructorDashboard /></ProtectedRoute>
        } />
        <Route path="/instructor/progress" element={
          <ProtectedRoute allowedRole="instructor"><ClassProgress /></ProtectedRoute>
        } />
        <Route path="/instructor/alerts" element={
          <ProtectedRoute allowedRole="instructor"><AlertQueue /></ProtectedRoute>
        } />
        <Route path="/instructor/review" element={
          <ProtectedRoute allowedRole="instructor"><ReviewTask /></ProtectedRoute>
        } />
        <Route path="/instructor/analytics" element={
          <ProtectedRoute allowedRole="instructor"><Analytics /></ProtectedRoute>
        } />
        <Route path="/instructor/messaging" element={
          <ProtectedRoute allowedRole="instructor"><Messaging /></ProtectedRoute>
        } />

        {/* 404 CATCH-ALL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;