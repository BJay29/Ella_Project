// delete nalang kapag naconnect na sa db
// ─── 
// Colour tokens ───────────────────────────────────────────────
export const C = {
  bg:           "#8FAF8F",
  sidebar:      "#F5F5F5",
  navbar:       "#F5F5F5",
  navbarBorder: "#222",
  card:         "#FFFFFF",
  accent:       "#6B8F6B",
  textDark:     "#111",
  textMid:      "#444",
  textLight:    "#666",
  red:          "#E53935",
  green:        "#2E7D32",
};

// ─── Mock data ───────────────────────────────────────────────────
export const questData = [
  { name: "Quest 1", completion: 85, dropout: 10 },
  { name: "Quest 2", completion: 72, dropout: 15 },
  { name: "Quest 3", completion: 68, dropout: 20 },
  { name: "Quest 4", completion: 60, dropout: 25 },
  { name: "Quest 5", completion: 48, dropout: 28 },
];

export const skillData = [
  { name: "Critical Thinking", value: 35, color: "#4FC3F7" },
  { name: "Communication",     value: 25, color: "#81C784" },
  { name: "Problem Solving",   value: 25, color: "#FFB74D" },
  { name: "Teamwork",          value: 15, color: "#9575CD" },
];

export const trendData = [
  { month: "Jan", users: 450 },
  { month: "Feb", users: 620 },
  { month: "Mar", users: 760 },
  { month: "Apr", users: 940 },
  { month: "May", users: 910 },
  { month: "Jun", users: 1200 },
];

export const activityLogs = [
  { id: 1, user: "Ernie Jordan",   action: "Logged in",            time: "2025-03-05 08:12" },
  { id: 2, user: "Ernie Lebron",   action: "Uploaded material",    time: "2025-03-05 08:45" },
  { id: 3, user: "Ernie Bryant",   action: "Completed Quest 3",    time: "2025-03-05 09:00" },
  { id: 4, user: "Ernie Manaloto", action: "Created new quest",    time: "2025-03-05 09:30" },
  { id: 5, user: "Ernie Pacquio",  action: "Updated profile",      time: "2025-03-05 10:05" },
  { id: 6, user: "Admin Ernie J.", action: "Deleted user account", time: "2025-03-05 10:22" },
];

export const initialUsers = [
  { id: 1, name: "Ernie Jordan",   role: "Student",    email: "Erniejordan@gbox",   status: "Active"   },
  { id: 2, name: "Ernie Lebron",   role: "Instructor", email: "ErnieLebron@gbox",   status: "Active"   },
  { id: 3, name: "Ernie Bryant",   role: "Student",    email: "ErnieBryant@gbox",   status: "Inactive" },
  { id: 4, name: "Ernie Manaloto", role: "Instructor", email: "Ernieloto@gbox",     status: "Active"   },
  { id: 5, name: "Ernie Pacquio",  role: "Student",    email: "Erditipaklong@gbox", status: "Active"   },
];