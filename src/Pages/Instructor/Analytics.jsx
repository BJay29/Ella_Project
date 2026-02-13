import React from 'react';
import Sidebar from "/src/components/layout/Sidebar.jsx";

const Analytics = () => {
  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-900">
      <Sidebar />
      
      <main className="flex-1 py-8 px-10">
        {/* Top User Header - Replaced .analytics-header */}
        <header className="flex justify-between items-center border-b-[3px] border-black pb-4 mb-8">
          <h2 className="text-2xl font-extrabold m-0">Analytics</h2>
          <div className="flex items-center gap-5">
            <div className="text-right flex flex-col">
              <span className="font-bold text-sm">Dr. Ernie Dadea</span>
              <span className="text-[12px] text-gray-500 font-bold">Instructor ID: #0420</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl cursor-pointer hover:scale-110 transition-transform">💬</span>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm text-gray-600">
                ED
              </div>
            </div>
          </div>
        </header>

        {/* Title & Export - Replaced .title-section */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-[22px] font-black m-0 mb-1 uppercase">📈 Instructor Analytics</h1>
            <p className="text-gray-500 text-sm m-0">Deep-dive into class performance and curriculum metrics.</p>
          </div>
          <button className="bg-white border border-gray-300 py-2.5 px-5 rounded-lg font-bold cursor-pointer flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors">
            📥 Export to CSV
          </button>
        </div>

        {/* Charts Row - Replaced .charts-row */}
        <div className="flex gap-8 mb-10">
          
          {/* Chart 1: Bar Chart */}
          <div className="flex-1 bg-white rounded-[20px] p-6 shadow-lg border border-gray-100">
            <h4 className="text-[#a0a0a0] text-[12px] font-extrabold uppercase mb-8 tracking-wider">Quest Completion Rates</h4>
            <div className="flex justify-around items-end h-[200px] mb-5">
              {/* Bars Mapping */}
              {[
                { label: 'Quest 1', dark: '80%', light: '20%' },
                { label: 'Quest 2', dark: '65%', light: '30%' },
                { label: 'Quest 3', dark: '55%', light: '40%' },
                { label: 'Quest 4', dark: '50%', light: '45%' },
                { label: 'Quest 5', dark: '35%', light: '20%' }
              ].map((q, i) => (
                <div key={i} className="flex flex-col items-center justify-end h-full w-10">
                  <div className="flex items-end gap-[2px]">
                    <div className="w-3 bg-[#1a1f36] rounded-t-sm" style={{ height: q.dark }}></div>
                    <div className="w-3 bg-[#e2e8f0] rounded-t-sm" style={{ height: q.light }}></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2.5 font-bold uppercase">{q.label}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-5 text-[10px] font-bold text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1a1f36]"></span> COMPLETED</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#e2e8f0]"></span> STRUGGLING</span>
            </div>
          </div>

          {/* Chart 2: Donut Chart - Pure Tailwind implementation */}
          <div className="flex-1 bg-white rounded-[20px] p-6 shadow-lg border border-gray-100">
            <h4 className="text-[#a0a0a0] text-[12px] font-extrabold uppercase mb-8 tracking-wider">Skill Performance Distribution</h4>
            <div className="flex justify-center mb-5 relative">
              <div 
                className="w-[180px] h-[180px] rounded-full flex items-center justify-center relative shadow-inner"
                style={{ background: 'conic-gradient(#10b981 0% 25%, #f59e0b 25% 50%, #ef4444 50% 75%, #6366f1 75% 100%)' }}
              >
                {/* Donut hole */}
                <div className="absolute w-[100px] h-[100px] bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
            <div className="flex justify-center gap-4 text-[10px] font-bold">
              <span className="text-[#6366f1]">● Listening</span>
              <span className="text-[#10b981]">● Speaking</span>
              <span className="text-[#f59e0b]">● Reading</span>
              <span className="text-[#ef4444]">● Writing</span>
            </div>
          </div>
        </div>

        {/* Students Table Section */}
        <div className="w-full">
          <h3 className="text-lg font-bold mb-5 flex items-center gap-2">👥 Students Needing Intervention</h3>
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-[#a0a0a0] text-[10px] font-extrabold uppercase">
                <th className="text-left px-5">Student</th>
                <th className="text-left">Bottleneck Skill</th>
                <th className="text-left">Engagement Score</th>
                <th className="text-left">Intervention Priority</th>
              </tr>
            </thead>
            <tbody>
              {/* Table Rows with custom styling for shadows and borders */}
              {[
                { name: 'David K.', skill: 'Reading', score: '32%', badge: 'critical', badgeColor: 'bg-red-50 text-red-500' },
                { name: 'Ana L.', skill: 'Listening', score: '45%', badge: 'high', badgeColor: 'bg-amber-50 text-amber-600' },
                { name: 'John M.', skill: 'Writing', score: '52%', badge: 'moderate', badgeColor: 'bg-indigo-50 text-indigo-700' }
              ].map((row, i) => (
                <tr key={i} className="bg-white shadow-sm hover:shadow-md transition-shadow group">
                  <td className="p-5 font-bold rounded-l-2xl border-y border-l border-gray-50">{row.name}</td>
                  <td className="py-5 border-y border-gray-50 uppercase text-sm font-medium">{row.skill}</td>
                  <td className="py-5 border-y border-gray-50">
                    <div className="flex items-center gap-3 w-[150px] font-bold text-sm">
                      {row.score}
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full" style={{ width: row.score }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 rounded-r-2xl border-y border-r border-gray-50">
                    <span className={`py-1.5 px-4 rounded-full text-[10px] font-bold uppercase ${row.badgeColor}`}>
                      {row.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Analytics;