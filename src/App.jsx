import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// AUTH PAGES
import Login from './pages/auth/login';
import Register from './pages/auth/register';

// STUDENT PAGES
import StudentDashboard from './pages/student/dashboard';

// ADMIN PAGES
import AdminDashboard from './pages/admin/dashboard';

// INSTRUCTOR PAGES 
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import ClassProgress from './pages/instructor/ClassProgress';
import AlertQueue from './pages/instructor/AlertQueue';
import ReviewTask from './pages/instructor/ReviewTask';
import Analytics from './pages/instructor/Analytics';
import Messaging from './pages/instructor/Messaging';

// --- PROTECTED ROUTE COMPONENT ---
// Ito ang taga-bantay. Kung walang token o mali ang role, hindi papapasukin.
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); // Dapat lowercase na ito galing sa Login.jsx update natin

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // Kung student trying to access instructor page, balik sa login or default dashboard
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        {/* 'index' ensures this is the absolute starting point */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- STUDENT ROUTES --- */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />

        {/* --- ADMIN ROUTES --- */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* --- INSTRUCTOR ROUTES --- */}
        {/* Binalot natin lahat ng Instructor routes sa ProtectedRoute */}
        <Route 
          path="/instructor/dashboard" 
          element={
            <ProtectedRoute allowedRole="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/instructor/progress" 
          element={
            <ProtectedRoute allowedRole="instructor">
              <ClassProgress />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/instructor/alerts" 
          element={
            <ProtectedRoute allowedRole="instructor">
              <AlertQueue />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/instructor/review" 
          element={
            <ProtectedRoute allowedRole="instructor">
              <ReviewTask />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/instructor/analytics" 
          element={
            <ProtectedRoute allowedRole="instructor">
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/instructor/messaging" 
          element={
            <ProtectedRoute allowedRole="instructor">
              <Messaging />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all - Kung mali ang URL or unauthorized, balik sa login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;