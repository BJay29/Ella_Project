import React from 'react';
import Sidebar from "/src/components/layout/Sidebar.jsx";

const InstructorDashboard = () => {
  return (
    <div className="flex min-h-screen bg-white font-sans text-black">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* Header - Replaced .dashboard-header */}
        <header className="flex justify-between items-center border-b-[3px] border-black pb-2.5 mb-10">
          <h2 className="text-2xl font-black uppercase m-0 tracking-tight">DASHBOARD</h2>
          <div className="flex gap-5 text-2xl cursor-pointer">
            <span className="hover:scale-110 transition-transform">💬</span>
            <span className="hover:scale-110 transition-transform">🔔</span>
            <span className="hover:scale-110 transition-transform">➡️</span>
          </div>
        </header>

        {/* Metrics Row - Replaced .metrics-row */}
        <section className="grid grid-cols-3 gap-8 mb-10">
          <div className="bg-[#d9d9d9] p-6 rounded-[20px] shadow-sm">
            <h3 className="m-0 mb-2.5 text-base font-bold">Total Students</h3>
            <div className="text-[32px] font-bold mb-2.5 flex items-baseline gap-2">0</div>
            <div className="h-2 border-2 border-gray-500 rounded-full w-full bg-transparent"></div>
          </div>
          
          <div className="bg-[#d9d9d9] p-6 rounded-[20px] shadow-sm">
            <h3 className="m-0 mb-2.5 text-base font-bold">Flagged Students</h3>
            <div className="text-[32px] font-bold mb-2.5 flex items-baseline gap-2 text-red-600">
              0 <span className="text-[12px] font-bold text-black uppercase tracking-tighter">Needs attention</span>
            </div>
            <div className="h-2 border-2 border-gray-500 rounded-full w-full bg-transparent"></div>
          </div>

          <div className="bg-[#d9d9d9] p-6 rounded-[20px] shadow-sm">
            <h3 className="m-0 mb-2.5 text-base font-bold">Avg Class Score</h3>
            <div className="text-[32px] font-bold mb-2.5 flex items-baseline gap-2">0%</div>
            <div className="h-2 border-2 border-gray-500 rounded-full w-full bg-transparent"></div>
          </div>
        </section>

        {/* Action Grid - Replaced .action-grid */}
        <section className="grid grid-cols-2 gap-8 mb-10">
          {/* Card 1: Class Progress */}
          <div className="bg-[#d9d9d9] p-8 rounded-[30px] flex flex-col justify-between min-h-[220px] hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-3xl mb-4 shadow-sm">📊</div>
              <h4 className="text-lg font-black m-0 mb-2.5 uppercase">Class Progress</h4>
              <p className="text-[12px] leading-relaxed m-0 mb-5 text-gray-800">
                track real time student activity module completion rates and overall engagement metrics across all active courses
              </p>
            </div>
            <button className="bg-transparent border-none font-bold text-sm cursor-pointer flex items-center gap-1.5 p-0 hover:translate-x-1 transition-transform">
              View details ➝
            </button>
          </div>

          {/* Card 2: Intervention Alerts (Red) */}
          <div className="bg-[#d9d9d9] p-8 rounded-[30px] flex flex-col justify-between min-h-[220px] hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 bg-[#ff3b30] text-white rounded-xl flex items-center justify-center text-3xl font-black mb-4 shadow-sm italic">!</div>
              <h4 className="text-lg font-black m-0 mb-2.5 uppercase">Intervention Alerts</h4>
              <p className="text-[12px] leading-relaxed m-0 mb-5 text-gray-800">
                System-generated alerts for students falling behind or missing critical milestone. Immediate action recommended
              </p>
            </div>
            <button className="bg-transparent border-none font-bold text-sm cursor-pointer flex items-center gap-1.5 p-0 hover:translate-x-1 transition-transform">
              View details ➝
            </button>
          </div>

          {/* Card 3: Review Task */}
          <div className="bg-[#d9d9d9] p-8 rounded-[30px] flex flex-col justify-between min-h-[220px] hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-3xl mb-4 shadow-sm">📋</div>
              <h4 className="text-lg font-black m-0 mb-2.5 uppercase">Review Task</h4>
              <p className="text-[12px] leading-relaxed m-0 mb-5 text-gray-800">
                Pending assignment, quiz reviews, and manual grading task. keep your feedback loop tight and efficient.
              </p>
            </div>
            <button className="bg-transparent border-none font-bold text-sm cursor-pointer flex items-center gap-1.5 p-0 hover:translate-x-1 transition-transform">
              View details ➝
            </button>
          </div>

          {/* Card 4: Analytics */}
          <div className="bg-[#d9d9d9] p-8 rounded-[30px] flex flex-col justify-between min-h-[220px] hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-3xl mb-4 shadow-sm">📈</div>
              <h4 className="text-lg font-black m-0 mb-2.5 uppercase">Analytics Dashboard</h4>
              <p className="text-[12px] leading-relaxed m-0 mb-5 text-gray-800">
                Deep-dive reports into curriculum effectiveness, student demographics, and long term performance trends.
              </p>
            </div>
            <button className="bg-transparent border-none font-bold text-sm cursor-pointer flex items-center gap-1.5 p-0 hover:translate-x-1 transition-transform">
              View details ➝
            </button>
          </div>
        </section>

        {/* Recent Activity - Replaced .activity-section */}
        <section className="bg-[#d9d9d9] rounded-[30px] p-8 shadow-inner">
          <div className="flex justify-between items-center mb-5">
            <h4 className="m-0 text-lg font-black uppercase tracking-tight">Recent activity</h4>
            <button className="bg-transparent border-none font-extrabold text-sm cursor-pointer uppercase hover:underline">
              VIEW ALL LOGS
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {/* Rows matching the sketch */}
            <div className="h-4 bg-white border-2 border-black rounded-full w-full shadow-sm hover:bg-gray-50 cursor-pointer"></div>
            <div className="h-4 bg-white border-2 border-black rounded-full w-full shadow-sm hover:bg-gray-50 cursor-pointer"></div>
            <div className="h-4 bg-white border-2 border-black rounded-full w-full shadow-sm hover:bg-gray-50 cursor-pointer"></div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default InstructorDashboard;