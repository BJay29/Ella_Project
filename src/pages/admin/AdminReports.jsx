import React, { useState } from 'react';
import { C } from './adminConstants';

const AdminReports = () => {
  const [reportType, setReportType] = useState("Student Performance");
  const [startDate, setStartDate]   = useState("03/29/2002");
  const [endDate, setEndDate]       = useState("03/29/2030");
  const [open, setOpen]             = useState(false);
  const types = ["Student Performance","Instructor Activity","Quest Engagement","System Resource Usage"];

  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 4 }}>Reports &amp; CSV Export</h2>
      <p style={{ color: C.textMid, marginBottom: 28 }}>Generate and export institutional data for offline analysis.</p>

      <div style={{ background: C.card, borderRadius: 14, padding: 28, maxWidth: 520, boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20 }}>Generate Institutional Report</div>

        {/* Report Type Dropdown */}
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

        {/* Date Range */}
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

        {/* Action Buttons */}
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

export default AdminReports;