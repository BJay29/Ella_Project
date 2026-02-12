import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Global CSS Imports
import './component/Sidebar.css';
import './Pages/Instructor/InstructorLoginPage.css';
import './Pages/Instructor/InstructorDashboard.css';
import './Pages/Instructor/ClassProgress.css';
import './Pages/Instructor/AlertQueue.css';
import './Pages/Instructor/ReviewTask.css';
import './Pages/Instructor/Analytics.css';
import './Pages/Instructor/Messaging.css';

// Import all the pages we created
import Login from './Pages/Instructor/InstructorLoginPage.jsx';
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
        {/* 1. The Entry Point (Login Screen) */}
        <Route path="/" element={<Login />} />

        {/* 2. Main Dashboard */}
        <Route path="/dashboard" element={<InstructorDashboard />} />

        {/* 3. Class Progress Table */}
        <Route path="/progress" element={<ClassProgress />} />

        {/* 4. Intervention / Alert Queue */}
        <Route path="/alerts" element={<InterventionQueue />} />

        {/* 5. Review Task / Grading Page */}
        <Route path="/review" element={<ReviewTask />} />

        {/* 6. Analytics Dashboard */}
        <Route path="/analytics" element={<Analytics />} />

        {/* 7. Catch-all for Message (Placeholder since we haven't built it yet) */}
        <Route path="/messaging" element={<Messaging/>} />
      </Routes>
    </Router>
  );
}

export default App;