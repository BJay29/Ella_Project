import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import StudentDashboard from "./pages/student/dashboard";
import AdminDashboard from "./pages/admin/dashboard";  // <-- ADD THIS

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<StudentDashboard />} />

        {/* NEW ADMIN ROUTE */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
