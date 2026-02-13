import React, { useState } from 'react';
import Sidebar from "../../components/layout/instructorsidebar.jsx"; 

const InstructorDashboard = () => {
  const [activePage, setActivePage] = useState('Dashboard');

  return (
    <div className="flex min-h-screen bg-[#d9ead3] font-sans text-black">
      {/* Sidebar na may role="instructor" para sa tamang menu items */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} role="instructor" />

      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter">DASHBOARD</h2>
          <div className="flex gap-4 items-center">
            <button className="p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg></button>
            <button className="p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></button>
            <button className="p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
          </div>
        </header>

        {/* Top Stats Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-black">
            <h3 className="font-bold text-lg">Total Students</h3>
            <p className="text-4xl font-black mt-2">0</p>
            <div className="h-1 bg-black mt-4 w-full rounded-full"></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-black">
            <h3 className="font-bold text-lg">Flagged Students</h3>
            <p className="text-4xl font-black mt-2">0 <span className="text-sm font-normal">Needs attention</span></p>
            <div className="h-1 bg-black mt-4 w-full rounded-full"></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-black">
            <h3 className="font-bold text-lg">Avg Class Score</h3>
            <p className="text-4xl font-black mt-2">0%</p>
            <div className="h-1 bg-black mt-4 w-full rounded-full"></div>
          </div>
        </section>

        {/* Main Action Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Class Progress */}
          <div className="bg-white p-8 rounded-[40px] border-4 border-blue-400">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-xl border border-black"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
              <div>
                <h4 className="text-xl font-black">Class Progress</h4>
                <p className="text-xs text-gray-600 mt-1 leading-tight font-bold">Track real-time student activity, module completion rates and overall engagement metrics across all active courses</p>
                <button className="mt-6 flex items-center font-black text-sm uppercase">View details <span className="ml-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">➝</span></button>
              </div>
            </div>
          </div>

          {/* Intervention Alerts */}
          <div className="bg-white p-8 rounded-[40px] border-2 border-black">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-600 text-white rounded-xl border border-black"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div>
                <h4 className="text-xl font-black">Intervention Alerts</h4>
                <p className="text-xs text-gray-600 mt-1 leading-tight font-bold">System-generated alerts for students falling behind or missing critical milestone. Immediate action recommended</p>
                <button className="mt-6 flex items-center font-black text-sm uppercase">View details <span className="ml-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">➝</span></button>
              </div>
            </div>
          </div>

          {/* Review Task */}
          <div className="bg-white p-8 rounded-[40px] border-2 border-black">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-xl border border-black"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
              <div>
                <h4 className="text-xl font-black">Review Task</h4>
                <p className="text-xs text-gray-600 mt-1 leading-tight font-bold">Pending assignment, quiz reviews, and manual grading task. keep your feedback loop tight and efficient.</p>
                <button className="mt-6 flex items-center font-black text-sm uppercase">View details <span className="ml-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">➝</span></button>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="bg-white p-8 rounded-[40px] border-2 border-black">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-xl border border-black"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
              <div>
                <h4 className="text-xl font-black">Analytics Dashboard</h4>
                <p className="text-xs text-gray-600 mt-1 leading-tight font-bold">Deep-dive reports into curriculum effectiveness, student demographics, and long term performance trends.</p>
                <button className="mt-6 flex items-center font-black text-sm uppercase">View details <span className="ml-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">➝</span></button>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity Section */}
        <section className="bg-white p-6 rounded-2xl border-2 border-black">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-black uppercase italic">Recent activity</h4>
            <button className="text-[10px] font-black uppercase underline">View all logs</button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center font-bold">)o(</div>
                <div className="h-[2px] bg-gray-300 flex-1 rounded-full"></div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default InstructorDashboard;