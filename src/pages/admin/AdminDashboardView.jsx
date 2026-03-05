import React from 'react';
import { C } from './adminConstants';

const StatCard = ({ label, value, icon }) => (
  <div style={{
    background: C.card, borderRadius: 14, padding: "18px 22px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    flex: 1, minWidth: 160, boxShadow: "0 1px 4px rgba(0,0,0,.08)",
  }}>
    <div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
    </div>
    <span className="material-icons" style={{ fontSize: 32, color: C.textLight }}>{icon}</span>
  </div>
);

const QuickCard = ({ icon, title, desc, onClick }) => (
  <div onClick={onClick} style={{
    background: C.card, borderRadius: 14, padding: "24px 22px",
    flex: 1, minWidth: 220, cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,.08)", transition: "transform .15s",
  }}
    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
  >
    <span className="material-icons" style={{ fontSize: 36, color: C.textMid }}>{icon}</span>
    <div style={{ fontWeight: 700, fontSize: 16, marginTop: 10 }}>{title}</div>
    <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>{desc}</div>
  </div>
);

const AdminDashboardView = ({ setActive }) => (
  <div>
    <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 4 }}>Admin Dashboard</h2>
    <p style={{ color: C.textMid, marginBottom: 28 }}>Welcome back! Here's what's happening in your system.</p>

    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
      <StatCard label="Total Users"   value="1738"  icon="person" />
      <StatCard label="Active Users"  value="420"   icon="person_add" />
      <StatCard label="System uptime" value="99.8%" icon="show_chart" />
      <StatCard label="Flagged Cases" value="12"    icon="error_outline" />
    </div>

    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
      <QuickCard icon="manage_accounts" title="User Management"     desc="Manage student and instructor roles and status."           onClick={() => setActive("users")} />
      <QuickCard icon="bar_chart"       title="Analytics Dashboard" desc="View system-wide performance, quest completion and trends." onClick={() => setActive("analytics")} />
    </div>
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <QuickCard icon="description" title="Reports"       desc="Generate institutional reports and export data as CSV." onClick={() => setActive("reports")} />
      <QuickCard icon="assignment"  title="Activity Logs" desc="Monitor system actions and user activity trails."       onClick={() => setActive("activitylogs")} />
    </div>
  </div>
);

export default AdminDashboardView;