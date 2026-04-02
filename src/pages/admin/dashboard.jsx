import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ─── colour tokens ───────────────────────────────────────────────
const C = {
  bg: "#8FAF8F",          // main sage green content area
  sidebar: "#F5F5F5",     // off-white sidebar
  navbar: "#F5F5F5",
  navbarBorder: "#222",
  card: "#FFFFFF",
  accent: "#6B8F6B",      // darker sage for active nav
  textDark: "#111",
  textMid: "#444",
  textLight: "#666",
  red: "#E53935",
  green: "#2E7D32",
};

// ─── mock data ───────────────────────────────────────────────────
const questData = [
  { name: "Quest 1", completion: 85, dropout: 10 },
  { name: "Quest 2", completion: 72, dropout: 15 },
  { name: "Quest 3", completion: 68, dropout: 20 },
  { name: "Quest 4", completion: 60, dropout: 25 },
  { name: "Quest 5", completion: 48, dropout: 28 },
];
const skillData = [
  { name: "Critical Thinking", value: 35, color: "#4FC3F7" },
  { name: "Communication",     value: 25, color: "#81C784" },
  { name: "Problem Solving",   value: 25, color: "#FFB74D" },
  { name: "Teamwork",          value: 15, color: "#9575CD" },
];
const trendData = [
  { month: "Jan", users: 450 },
  { month: "Feb", users: 620 },
  { month: "Mar", users: 760 },
  { month: "Apr", users: 940 },
  { month: "May", users: 910 },
  { month: "Jun", users: 1200 },
];
const activityLogs = [
  { id: 1, user: "Ernie Jordan",   action: "Logged in",           time: "2025-03-05 08:12" },
  { id: 2, user: "Ernie Lebron",   action: "Uploaded material",   time: "2025-03-05 08:45" },
  { id: 3, user: "Ernie Bryant",   action: "Completed Quest 3",   time: "2025-03-05 09:00" },
  { id: 4, user: "Ernie Manaloto", action: "Created new quest",   time: "2025-03-05 09:30" },
  { id: 5, user: "Ernie Pacquio",  action: "Updated profile",     time: "2025-03-05 10:05" },
  { id: 6, user: "Admin Ernie J.", action: "Deleted user account",time: "2025-03-05 10:22" },
];
const initialUsers = [
  { id: 1, name: "Ernie Jordan",   role: "Student",    email: "Erniejordan@gbox",    status: "Active"   },
  { id: 2, name: "Ernie Lebron",   role: "Instructor", email: "ErnieLebron@gbox",    status: "Active"   },
  { id: 3, name: "Ernie Bryant",   role: "Student",    email: "ErnieBryant@gbox",    status: "Inactive" },
  { id: 4, name: "Ernie Manaloto", role: "Instructor", email: "Ernieloto@gbox",      status: "Active"   },
  { id: 5, name: "Ernie Pacquio",  role: "Student",    email: "Erditipaklong@gbox",  status: "Active"   },
];

// ─── NavBar ──────────────────────────────────────────────────────
const NavBar = ({ onLogout }) => (
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

// ─── Sidebar ─────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard",   label: "Dashboard",      icon: "dashboard" },
  { key: "users",       label: "User Management",icon: "manage_accounts" },
  { key: "analytics",   label: "Analytics",      icon: "bar_chart" },
  { key: "reports",     label: "Reports",        icon: "description" },
  { key: "activitylogs",label: "Activity Logs",  icon: "assignment" },
];
const SideNav = ({ active, setActive, onLogout }) => (
  <aside style={{
    width: 210, background: C.sidebar,
    borderRight: `1px solid #ddd`, display: "flex",
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

// ─── Stat Card ───────────────────────────────────────────────────
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

// ─── Quick-link Card ─────────────────────────────────────────────
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

// ─── DASHBOARD VIEW ──────────────────────────────────────────────
const DashboardView = ({ setActive }) => (
  <div>
    <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 4 }}>Admin Dashboard</h2>
    <p style={{ color: C.textMid, marginBottom: 28 }}>Welcome back! Here's what's happening in your system.</p>

    {/* Stats Row */}
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
      <StatCard label="Total Users"    value="1738" icon="person" />
      <StatCard label="Active Users"   value="420"  icon="person_add" />
      <StatCard label="System uptime"  value="99.8%" icon="show_chart" />
      <StatCard label="Flagged Cases"  value="12"   icon="error_outline" />
    </div>

    {/* Quick Links */}
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
      <QuickCard icon="manage_accounts" title="User Management"    desc="Management student and instructor, roles and status" onClick={() => setActive("users")} />
      <QuickCard icon="bar_chart"       title="Analytics Dashboard" desc="View system-wide performance, quest completion and trends." onClick={() => setActive("analytics")} />
    </div>
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <QuickCard icon="description"  title="Reports"       desc="Generate institutional reports and export data as CSV" onClick={() => setActive("reports")} />
      <QuickCard icon="assignment"   title="Activity Logs" desc="Monitor system actions and user activity trails" onClick={() => setActive("activitylogs")} />
    </div>
  </div>
);

// ─── USER MANAGEMENT VIEW ────────────────────────────────────────
const UserManagementView = () => {
  const [users, setUsers]           = useState(initialUsers);
  const [search, setSearch]         = useState("");
  const [editUser, setEditUser]     = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [addModal, setAddModal]     = useState(false);
  const [newUser, setNewUser]       = useState({ name: "", role: "Student", email: "", status: "Active" });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveEdit = () => {
    setUsers(us => us.map(u => u.id === editUser.id ? editUser : u));
    setEditUser(null);
  };
  const handleDelete = () => {
    setUsers(us => us.filter(u => u.id !== deleteUser.id));
    setDeleteUser(null);
  };
  const handleAdd = () => {
    setUsers(us => [...us, { ...newUser, id: Date.now() }]);
    setAddModal(false);
    setNewUser({ name: "", role: "Student", email: "", status: "Active" });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 4 }}>User Management</h2>
          <p style={{ color: C.textMid }}>Manage system users, roles, and access levels.</p>
        </div>
        <button onClick={() => setAddModal(true)} style={{
          background: C.textDark, color: "#fff", border: "none",
          borderRadius: 10, padding: "10px 20px", fontWeight: 700,
          fontSize: 14, cursor: "pointer",
        }}>Add New User</button>
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", background: C.card,
        borderRadius: 40, padding: "10px 20px", marginBottom: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,.08)", gap: 10,
      }}>
        <span className="material-icons" style={{ color: C.textLight, fontSize: 22 }}>search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search Users..."
          style={{ border: "none", outline: "none", fontSize: 15, flex: 1, background: "transparent" }}
        />
      </div>

      {/* Table */}
      <div style={{ background: C.card, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee" }}>
              {["Name","Role","Email","Status","Actions"].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 14, color: C.textMid, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "14px 20px", fontSize: 15 }}>{u.name}</td>
                <td style={{ padding: "14px 20px", fontSize: 14, color: C.textMid }}>{u.role}</td>
                <td style={{ padding: "14px 20px", fontSize: 14, color: C.textMid }}>{u.email}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: u.status === "Active" ? C.green : C.red,
                  }}>{u.status}</span>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <button onClick={() => setEditUser({ ...u })} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <span className="material-icons" style={{ fontSize: 20, color: C.textMid }}>edit</span>
                  </button>
                  <button onClick={() => setDeleteUser(u)} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 6 }}>
                    <span className="material-icons" style={{ fontSize: 20, color: C.red }}>delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          <ModalField label="Name"  value={editUser.name}  onChange={v => setEditUser(u => ({ ...u, name: v }))} />
          <ModalField label="Email" value={editUser.email} onChange={v => setEditUser(u => ({ ...u, email: v }))} />
          <div style={{ display: "flex", gap: 16 }}>
            <ModalSelect label="Role"   value={editUser.role}   options={["Student","Instructor","Admin"]} onChange={v => setEditUser(u => ({ ...u, role: v }))} />
            <ModalSelect label="Status" value={editUser.status} options={["Active","Inactive"]}            onChange={v => setEditUser(u => ({ ...u, status: v }))} />
          </div>
          <ModalActions onCancel={() => setEditUser(null)} onSave={handleSaveEdit} />
        </Modal>
      )}

      {/* DELETE MODAL */}
      {deleteUser && (
        <ConfirmModal
          message={`Are you sure you want to delete this Account .`}
          onCancel={() => setDeleteUser(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* ADD MODAL */}
      {addModal && (
        <Modal title="Add New User" onClose={() => setAddModal(false)}>
          <ModalField label="Name"  value={newUser.name}  onChange={v => setNewUser(u => ({ ...u, name: v }))} />
          <ModalField label="Email" value={newUser.email} onChange={v => setNewUser(u => ({ ...u, email: v }))} />
          <div style={{ display: "flex", gap: 16 }}>
            <ModalSelect label="Role"   value={newUser.role}   options={["Student","Instructor","Admin"]} onChange={v => setNewUser(u => ({ ...u, role: v }))} />
            <ModalSelect label="Status" value={newUser.status} options={["Active","Inactive"]}            onChange={v => setNewUser(u => ({ ...u, status: v }))} />
          </div>
          <ModalActions onCancel={() => setAddModal(false)} onSave={handleAdd} saveLabel="Add User" />
        </Modal>
      )}
    </div>
  );
};

// ─── ANALYTICS VIEW ──────────────────────────────────────────────
const AnalyticsView = () => (
  <div>
    <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 4 }}>Institutional Analytics</h2>
    <p style={{ color: C.textMid, marginBottom: 28 }}>Comprehensive system-wide performance and engagement metrics.</p>

    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
      {/* Bar Chart */}
      <div style={{ background: C.card, borderRadius: 14, padding: 24, flex: 2, minWidth: 300, boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Total Quest Completion</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={questData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0,100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="completion" name="Completion Rate (%)" fill="#4FC3F7" radius={[4,4,0,0]} />
            <Bar dataKey="dropout"    name="Dropout Rate (%)"    fill="#EF5350" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Donut Chart */}
      <div style={{ background: C.card, borderRadius: 14, padding: 24, flex: 1, minWidth: 220, boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Skill Performance Breakdown</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={skillData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
              {skillData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip />
            <Legend iconType="circle" iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Line Chart */}
    <div style={{ background: C.card, borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
      <div style={{ fontWeight: 700, marginBottom: 16 }}>Active Users Trend</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="users" name="Active Users" stroke="#5C6BC0" strokeWidth={2} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// ─── REPORTS VIEW ────────────────────────────────────────────────
const ReportsView = () => {
  const [reportType, setReportType] = useState("Student Performance");
  const [startDate, setStartDate]   = useState("03/29/2002");
  const [endDate, setEndDate]       = useState("03/29/2030");
  const [open, setOpen]             = useState(false);
  const types = ["Student Performance","Instructor Activity","Quest Engagement","System Resource Usage"];

  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 4 }}>Reports &amp; CSV Export</h2>
      <p style={{ color: C.textMid, marginBottom: 28 }}>Generate and export institutional data for offline analysis</p>

      <div style={{ background: C.card, borderRadius: 14, padding: 28, maxWidth: 520, boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20 }}>Generate Institutional Report</div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>Report type</label>
          <div style={{ position: "relative" }}>
            <button onClick={() => setOpen(o => !o)} style={{
              width: "100%", padding: "12px 16px", border: "1px solid #ddd",
              borderRadius: 8, background: "#fff", textAlign: "left",
              fontSize: 14, cursor: "pointer", display: "flex", justifyContent: "space-between",
            }}>
              {reportType}
              <span className="material-icons" style={{ fontSize: 20 }}>expand_more</span>
            </button>
            {open && (
              <div style={{
                position: "absolute", top: "110%", left: 0, right: 0,
                background: "#fff", border: "1px solid #ddd", borderRadius: 8,
                zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,.1)",
              }}>
                {types.map(t => (
                  <div key={t} onClick={() => { setReportType(t); setOpen(false); }} style={{
                    padding: "12px 16px", fontSize: 14, cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >{t}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>Start date</label>
            <input type="text" value={startDate} onChange={e => setStartDate(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>End Date</label>
            <input type="text" value={endDate} onChange={e => setEndDate(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 22px", borderRadius: 10,
            background: C.textDark, color: "#fff", border: "none",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            <span className="material-icons" style={{ fontSize: 18 }}>send</span>
            Generate Report
          </button>
          <button style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 22px", borderRadius: 10,
            background: C.textDark, color: "#fff", border: "none",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            <span className="material-icons" style={{ fontSize: 18 }}>download</span>
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ACTIVITY LOGS VIEW ──────────────────────────────────────────
const ActivityLogsView = () => (
  <div>
    <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 4 }}>Activity Logs</h2>
    <p style={{ color: C.textMid, marginBottom: 28 }}>Monitor system actions and user activity trails.</p>

    <div style={{ background: C.card, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #eee" }}>
            {["#","User","Action","Timestamp"].map(h => (
              <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 14, color: C.textMid, fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activityLogs.map(log => (
            <tr key={log.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "14px 20px", fontSize: 14, color: C.textLight }}>{log.id}</td>
              <td style={{ padding: "14px 20px", fontSize: 15, fontWeight: 600 }}>{log.user}</td>
              <td style={{ padding: "14px 20px", fontSize: 14, color: C.textMid }}>{log.action}</td>
              <td style={{ padding: "14px 20px", fontSize: 13, color: C.textLight }}>{log.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Modal helpers ───────────────────────────────────────────────
const Overlay = ({ children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  }}>{children}</div>
);

const Modal = ({ title, children, onClose }) => (
  <Overlay>
    <div style={{
      background: "#fff", borderRadius: 16, padding: "32px 36px",
      minWidth: 380, maxWidth: 480, width: "90%", position: "relative",
      boxShadow: "0 8px 32px rgba(0,0,0,.18)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <span style={{ fontWeight: 700, fontSize: 20 }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span className="material-icons">close</span>
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </div>
  </Overlay>
);

const ModalField = ({ label, value, onChange }) => (
  <div>
    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "12px 16px", border: "1.5px solid #e0e0e0",
      borderRadius: 10, fontSize: 15, boxSizing: "border-box", background: "#f5f5f5",
    }} />
  </div>
);

const ModalSelect = ({ label, value, options, onChange }) => (
  <div style={{ flex: 1 }}>
    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0",
      borderRadius: 10, fontSize: 14, background: "#f5f5f5", cursor: "pointer",
    }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const ModalActions = ({ onCancel, onSave, saveLabel = "Save" }) => (
  <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
    <button onClick={onCancel} style={{
      flex: 1, padding: "12px", borderRadius: 10, border: "none",
      background: C.textDark, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
    }}>Cancel</button>
    <button onClick={onSave} style={{
      flex: 1, padding: "12px", borderRadius: 10, border: "none",
      background: "#D8EDD8", color: C.textDark, fontWeight: 700, fontSize: 15, cursor: "pointer",
    }}>{saveLabel}</button>
  </div>
);

const ConfirmModal = ({ message, onCancel, onConfirm }) => (
  <Overlay>
    <div style={{
      background: "#D8EDD8", borderRadius: 16, padding: "40px 40px 32px",
      maxWidth: 420, width: "90%", textAlign: "center",
      boxShadow: "0 8px 32px rgba(0,0,0,.18)",
    }}>
      <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 32, lineHeight: 1.4 }}>{message}</p>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <button onClick={onCancel} style={{
          padding: "12px 32px", borderRadius: 12, border: "none",
          background: "#e0e0e0", fontWeight: 700, fontSize: 16, cursor: "pointer",
        }}>Cancel</button>
        <button onClick={onConfirm} style={{
          padding: "12px 32px", borderRadius: 12, border: "none",
          background: C.red, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
        }}>Yes Delete</button>
      </div>
    </div>
  </Overlay>
);

// ─── ROOT ────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate  = useNavigate();
  const [active, setActive] = useState("dashboard");
  const handleLogout = () => navigate("/login");

  const views = {
    dashboard:    <DashboardView setActive={setActive} />,
    users:        <UserManagementView />,
    analytics:    <AnalyticsView />,
    reports:      <ReportsView />,
    activitylogs: <ActivityLogsView />,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <NavBar onLogout={handleLogout} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <SideNav active={active} setActive={setActive} onLogout={handleLogout} />
        <main style={{
          flex: 1, background: C.bg, overflowY: "auto", padding: "32px 36px",
        }}>
          {views[active]}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;