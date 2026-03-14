import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructorSidebar from "../../components/layout/instructorsidebar.jsx";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // NOTIFICATION STATES
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const dropdownRef = useRef(null);

  const token = sessionStorage.getItem('token');

  const fetchJoinRequests = useCallback(async () => {
    setNotifLoading(true);
    setNotifError('');
    try {
      const res = await fetch(`${API_BASE}/course/join-requests`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load requests.');
      const data = await res.json();
      setJoinRequests(data);
    } catch (err) {
      setNotifError(err.message);
    } finally {
      setNotifLoading(false);
    }
  }, [token]);

  // Fetch when dropdown opens
  useEffect(() => {
    if (showNotifDropdown) fetchJoinRequests();
  }, [showNotifDropdown, fetchJoinRequests]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = async (requestId, action) => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`${API_BASE}/course/join-requests/${requestId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`Failed to ${action}.`);
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = joinRequests.filter(r => !r.status || r.status === 'pending');
  const pendingCount = pendingRequests.length;

  const confirmLogout = () => {
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#d9ead3] font-sans text-black relative">

      {/* SIDEBAR */}
      <InstructorSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={() => setShowLogoutModal(true)}
      />

      <main className="flex-1 p-8 overflow-y-auto">

        {/* Header Section */}
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter">
            {activePage}
          </h2>
          <div className="flex gap-4 items-center">

            {/* Chat */}
            <button className="p-1 hover:scale-110 transition-transform">
              <span className="text-2xl">💬</span>
            </button>

            {/* 🔔 Bell + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifDropdown((prev) => !prev)}
                className="p-1 hover:scale-110 transition-transform relative"
              >
                <span className="text-2xl">🔔</span>
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#d9ead3]">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN PANEL */}
              {showNotifDropdown && (
                <div className="absolute right-0 top-12 w-[360px] bg-white rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-gray-100 z-[500] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                  {/* Header */}
                  <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm uppercase tracking-tight">Join Requests</span>
                      {pendingCount > 0 && (
                        <span className="bg-[#4a7c2f] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {pendingCount}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={fetchJoinRequests}
                      className="text-[11px] font-bold text-[#4a7c2f] hover:underline"
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  {/* Body */}
                  <div className="max-h-[380px] overflow-y-auto">

                    {notifLoading && (
                      <div className="flex items-center justify-center py-10">
                        <div className="animate-spin w-6 h-6 border-4 border-[#4a7c2f] border-t-transparent rounded-full"></div>
                      </div>
                    )}

                    {!notifLoading && notifError && (
                      <div className="px-5 py-4 text-xs font-bold text-red-500">
                        ❌ {notifError}
                      </div>
                    )}

                    {!notifLoading && !notifError && pendingRequests.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <span className="text-3xl mb-2">📭</span>
                        <p className="text-xs font-bold">No pending requests</p>
                      </div>
                    )}

                    {!notifLoading && pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-none"
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-[#d9ead3] border-2 border-[#a8d08d] flex items-center justify-center text-[#4a7c2f] font-black text-sm shrink-0">
                          {req.student_name ? req.student_name.charAt(0).toUpperCase() : '?'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm m-0 truncate">{req.student_name || 'Unknown Student'}</p>
                          <p className="text-[11px] text-gray-500 font-bold m-0">
                            wants to join{' '}
                            <span className="text-[#4a7c2f] font-black tracking-widest uppercase">{req.class_code}</span>
                          </p>
                          {req.requested_at && (
                            <p className="text-[10px] text-gray-400 m-0">
                              {new Date(req.requested_at).toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleAction(req.id, 'accept')}
                            disabled={actionLoading === req.id}
                            className="bg-[#4a7c2f] text-white text-[11px] font-bold px-3 py-1.5 rounded-full hover:opacity-85 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            {actionLoading === req.id
                              ? <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                              : '✓'
                            }
                            Accept
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'reject')}
                            disabled={actionLoading === req.id}
                            className="bg-white text-red-500 border border-red-300 text-[11px] font-bold px-3 py-1.5 rounded-full hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-1 hover:text-red-600 transition-all hover:scale-110 font-bold uppercase text-sm"
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* DYNAMIC CONTENT AREA */}

        {/* 1. DASHBOARD VIEW */}
        {activePage === 'Dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-bold text-lg text-gray-700">Total Students</h3>
                <p className="text-4xl font-black mt-2">24</p>
                <div className="h-1 bg-black mt-4 w-full rounded-full opacity-20"></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-bold text-lg text-gray-700">Flagged Students</h3>
                <p className="text-4xl font-black mt-2 text-red-600">3</p>
                <p className="text-[10px] font-bold uppercase text-red-400">Needs attention</p>
                <div className="h-1 bg-red-600 mt-4 w-full rounded-full"></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-bold text-lg text-gray-700">Avg Class Score</h3>
                <p className="text-4xl font-black mt-2">85%</p>
                <div className="h-1 bg-green-600 mt-4 w-full rounded-full opacity-50"></div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {[
                { title: "Class Progress", color: "border-blue-400", desc: "Track real-time student activity and module completion." },
                { title: "Intervention Alerts", color: "border-black", iconColor: "bg-red-600", desc: "System-generated alerts for students falling behind." },
                { title: "Review Task", color: "border-black", desc: "Pending assignments and manual grading tasks." },
                { title: "Analytics Dashboard", color: "border-black", desc: "Deep-dive reports into curriculum effectiveness." }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePage(item.title)}
                  className={`bg-white p-8 rounded-[40px] border-2 ${item.color} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all cursor-pointer group`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border border-black ${item.iconColor || 'bg-gray-100'}`}>
                      <div className="w-8 h-8 flex items-center justify-center font-bold">📄</div>
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tight">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-bold leading-tight">{item.desc}</p>
                      <button className="mt-6 flex items-center font-black text-sm uppercase group-hover:gap-3 transition-all">
                        View details{' '}
                        <span className="ml-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px]">➝</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* 2. OTHER VIEWS */}
        {activePage !== 'Dashboard' && (
          <div className="flex flex-col items-center justify-center h-[60vh] bg-white/50 rounded-[40px] border-4 border-dashed border-black/10 animate-in zoom-in duration-300">
            <h3 className="text-4xl font-black italic text-black/20 uppercase">{activePage}</h3>
            <p className="font-bold text-black/30 mt-2">Coming Soon: Section is under development.</p>
            <button
              onClick={() => setActivePage('Dashboard')}
              className="mt-6 bg-black text-white px-8 py-2 rounded-full font-bold hover:scale-105 transition-all shadow-lg"
            >
              BACK TO DASHBOARD
            </button>
          </div>
        )}
      </main>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-6">
          <div className="bg-[#C1E1C1] w-full max-w-[450px] p-12 rounded-[50px] shadow-2xl flex flex-col items-center border-4 border-black animate-in zoom-in duration-200">
            <h2 className="text-[#1A2E35] text-2xl md:text-3xl font-black text-center leading-tight mb-10 italic">
              Are you sure you want to<br />Logout!?
            </h2>
            <div className="flex gap-6 w-full justify-center">
              <button
                onClick={confirmLogout}
                className="w-32 py-3 bg-[#718E5A] text-white border-2 border-black rounded-full font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-32 py-3 bg-[#A2C371] text-white border-2 border-black rounded-full font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
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