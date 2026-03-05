import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { C, questData, skillData, trendData } from './adminConstants';

const AdminAnalytics = () => (
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

export default AdminAnalytics;