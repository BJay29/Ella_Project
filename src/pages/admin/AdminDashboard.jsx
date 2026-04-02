import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from './adminConstants';
import { AdminNavBar, AdminSideNav } from './adminLayout';
import AdminDashboardView  from './AdminDashboardView';
import AdminUserManagement from './AdminUserManagement';
import AdminAnalytics      from './AdminAnalytics';
import AdminReports        from './AdminReports';
import AdminActivityLogs   from './AdminActivityLogs';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const views = {
    dashboard:    <AdminDashboardView setActive={setActive} />,
    users:        <AdminUserManagement />,
    analytics:    <AdminAnalytics />,
    reports:      <AdminReports />,
    activitylogs: <AdminActivityLogs />,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <AdminNavBar onLogout={handleLogout} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <AdminSideNav active={active} setActive={setActive} onLogout={handleLogout} />
        <main style={{ flex: 1, background: C.bg, overflowY: "auto", padding: "32px 36px" }}>
          {views[active]}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;