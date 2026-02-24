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

function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC / AUTH ROUTES --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- STUDENT ROUTES --- */}
        <Route path="/dashboard" element={<StudentDashboard />} />

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

     
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/progress" element={<ClassProgress />} />
        <Route path="/instructor/alerts" element={<AlertQueue />} />
        <Route path="/instructor/review" element={<ReviewTask />} />
        <Route path="/instructor/analytics" element={<Analytics />} />
        <Route path="/instructor/messaging" element={<Messaging />} />

        {/* Catch-all - Redirect sa login kung mali ang URL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;