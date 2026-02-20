import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../components/layout/instructorsidebar.jsx"; 

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#d9ead3] font-sans text-black relative">
      {/* SIDEBAR - Sakto na ang props dito */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={() => setShowLogoutModal(true)} 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter">DASHBOARD</h2>
          <div className="flex gap-4 items-center">
             <button className="p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg></button>
             <button className="p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></button>
             <button onClick={() => setShowLogoutModal(true)} className="p-1 hover:text-red-600 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-black font-bold text-center italic opacity-70 italic">Stats Here...</div>
          <div className="bg-white p-6 rounded-2xl border-2 border-black font-bold text-center italic opacity-70 italic">Stats Here...</div>
          <div className="bg-white p-6 rounded-2xl border-2 border-black font-bold text-center italic opacity-70 italic">Stats Here...</div>
        </section>
      </main>

      {/* MODAL - Nilagyan ko ng z-[999] para sigurado */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-6">
          <div className="bg-[#C1E1C1] w-full max-w-[450px] p-12 rounded-[50px] shadow-2xl flex flex-col items-center border-4 border-black animate-in zoom-in duration-200">
            <h2 className="text-[#1A2E35] text-2xl md:text-3xl font-bold text-center leading-snug mb-10">
              Are you sure you want to<br />Logout!?
            </h2>
            <div className="flex gap-6 w-full justify-center">
              <button 
                onClick={() => navigate("/instructor/login")} 
                className="w-32 py-3 bg-[#718E5A] text-white rounded-full font-bold text-lg shadow-lg hover:bg-black transition-all"
              >
                Yes
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="w-32 py-3 bg-[#A2C371] text-white rounded-full font-bold text-lg shadow-lg hover:bg-black transition-all"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;