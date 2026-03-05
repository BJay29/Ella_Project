import React from 'react';
import { C, activityLogs } from './adminConstants';

const AdminActivityLogs = () => (
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

export default AdminActivityLogs;