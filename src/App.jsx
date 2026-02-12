import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import Login from './pages/auth/login';
import Register from './pages/auth/register';
import StudentDashboard from './pages/student/dashboard';
import AdminDashboard from './pages/admin/dashboard';

// (Instructor Side) 
import './component/Sidebar.css';
import './Pages/Instructor/InstructorLoginPage.css';
import './Pages/Instructor/InstructorDashboard.css';
import './Pages/Instructor/ClassProgress.css';
import './Pages/Instructor/AlertQueue.css';
import './Pages/Instructor/ReviewTask.css';
import './Pages/Instructor/Analytics.css';
import './Pages/Instructor/Messaging.css';

// Pages - InstructorLogin
import InstructorLogin from './Pages/Instructor/InstructorLoginPage.jsx';
import InstructorDashboard from './Pages/Instructor/InstructorDashboard.jsx';
import ClassProgress from './Pages/Instructor/ClassProgress.jsx';
import InterventionQueue from './Pages/Instructor/AlertQueue.jsx';
import ReviewTask from './Pages/Instructor/ReviewTask.jsx';
import Analytics from './Pages/Instructor/Analytics.jsx';
import Messaging from './Pages/Instructor/Messaging.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- STUDENT / PUBLIC ROUTES --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<StudentDashboard />} />

        {/* --- ADMIN ROUTES (New!) --- */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* --- (INSTRUCTOR ROUTES) --- */}
        <Route path="/instructor/login" element={<InstructorLogin />} />
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/progress" element={<ClassProgress />} />
        <Route path="/instructor/alerts" element={<InterventionQueue />} />
        <Route path="/instructor/review" element={<ReviewTask />} />
        <Route path="/instructor/analytics" element={<Analytics />} />
        <Route path="/instructor/messaging" element={<Messaging />} />

        {/* Catch-all - Redirect unknown pages to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;