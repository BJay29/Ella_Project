import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// STUDENT / ADMIN PAGES
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import StudentDashboard from './pages/student/dashboard';
import AdminDashboard from './pages/admin/dashboard';

// INSTRUCTOR PAGES - Siguraduhin na tama ang 'pages' vs 'Pages'
import InstructorLogin from './pages/Instructor/InstructorLoginPage.jsx';
import InstructorDashboard from './pages/Instructor/InstructorDashboard.jsx';
import ClassProgress from './pages/Instructor/ClassProgress.jsx';
import InterventionQueue from './pages/Instructor/AlertQueue.jsx';
import ReviewTask from './pages/Instructor/ReviewTask.jsx';
import Analytics from './pages/Instructor/Analytics.jsx';
import Messaging from './pages/Instructor/Messaging.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- STUDENT / PUBLIC ROUTES --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<StudentDashboard />} />

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* --- INSTRUCTOR ROUTES --- */}
        <Route path="/instructor/login" element={<InstructorLogin />} />
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/progress" element={<ClassProgress />} />
        <Route path="/instructor/alerts" element={<InterventionQueue />} />
        <Route path="/instructor/review" element={<ReviewTask />} />
        <Route path="/instructor/analytics" element={<Analytics />} />
        <Route path="/instructor/messaging" element={<Messaging />} />

        {/* Catch-all - Iwas sa blank screen */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;