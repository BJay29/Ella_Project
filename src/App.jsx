import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import StudentDashboard from "./pages/student/dashboard";
import AdminDashboard from "./pages/admin/dashboard";
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";

// ── Protected Route Guard ──────────────────────────────────────────────────
// Redirects to /login if token is missing or role doesn't match.
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const normalizedRole = userRole ? userRole.toLowerCase().trim() : "";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && normalizedRole !== allowedRole) {
    // Redirect to correct dashboard based on actual role
    if (normalizedRole === "student") return <Navigate to="/dashboard" replace />;
    if (normalizedRole === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (normalizedRole === "instructor") return <Navigate to="/instructor/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};
// ──────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute allowedRole="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;