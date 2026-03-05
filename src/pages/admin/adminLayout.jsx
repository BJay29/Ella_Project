import React from 'react';
import { C } from './adminConstants';

const NAV = [
  { key: "dashboard",    label: "Dashboard",       icon: "dashboard" },
  { key: "users",        label: "User Management", icon: "manage_accounts" },
  { key: "analytics",    label: "Analytics",       icon: "bar_chart" },
  { key: "reports",      label: "Reports",         icon: "description" },
  { key: "activitylogs", label: "Activity Logs",   icon: "assignment" },
];

export const AdminNavBar = ({ onLogout }) => (
  <header style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: C.navbar, borderBottom: `2px solid ${C.navbarBorder}`,
    padding: "0 28px", height: 72, flexShrink: 0,
  }}>
    <div style={{ borderRight: `2px solid ${C.navbarBorder}`, paddingRight: 24, height: "100%", display: "flex", alignItems: "center" }}>
      <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1, lineHeight: 1.1 }}>
        ELLA<br />QUEST
      </span>
    </div>
    <span style={{ fontWeight: 500, fontSize: 15, color: C.textMid }}>Hello, Admin Ernie J.</span>
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <span className="material-icons" style={{ fontSize: 26, cursor: "pointer" }}>chat_bubble_outline</span>
      <span className="material-icons" style={{ fontSize: 26, cursor: "pointer" }}>notifications_none</span>
      <span
        className="material-icons"
        style={{ fontSize: 26, cursor: "pointer", color: C.red }}
        onClick={onLogout}
        title="Logout"
      >logout</span>
    </div>
  </header>
);

export const AdminSideNav = ({ active, setActive, onLogout }) => (
  <aside style={{
    width: 210, background: C.sidebar,
    borderRight: "1px solid #ddd", display: "flex",
    flexDirection: "column", padding: "28px 0 20px", flexShrink: 0,
  }}>
    <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 12px" }}>
      {NAV.map(n => (
        <button key={n.key} onClick={() => setActive(n.key)} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 8, border: "none",
          background: active === n.key ? "#E8F0E8" : "transparent",
          color: active === n.key ? C.accent : C.textMid,
          fontWeight: active === n.key ? 700 : 500,
          fontSize: 14, cursor: "pointer", textAlign: "left", transition: "all .15s",
        }}>
          <span className="material-icons" style={{ fontSize: 20 }}>{n.icon}</span>
          {n.label}
        </button>
      ))}
    </nav>
    <div style={{ padding: "0 12px", marginTop: 16, borderTop: "1px solid #e0e0e0", paddingTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
      <button style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: 8, border: "none",
        background: "transparent", color: C.textMid, fontWeight: 500,
        fontSize: 14, cursor: "pointer",
      }}>
        <span className="material-icons" style={{ fontSize: 20 }}>settings</span>
        Settings
      </button>
      <button onClick={onLogout} style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: 8, border: "none",
        background: "transparent", color: C.red, fontWeight: 600,
        fontSize: 14, cursor: "pointer",
      }}>
        <span className="material-icons" style={{ fontSize: 20 }}>logout</span>
        Log out
      </button>
    </div>
  </aside>
);