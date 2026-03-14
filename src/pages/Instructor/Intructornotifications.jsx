import React, { useState, useEffect, useCallback } from 'react';
import InstructorSidebar from "../../components/layout/instructorsidebar.jsx";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const InstructorNotifications = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // holds request id being processed

  const token = sessionStorage.getItem('token');

  const fetchJoinRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/course/join-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to fetch join requests.');
      }

      const data = await response.json();
      // Expecting: [{ id, student_name, student_id, class_code, course_name, requested_at }, ...]
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchJoinRequests();
  }, [fetchJoinRequests]);

  const handleAction = async (requestId, action) => {
    // action: 'accept' | 'reject'
    setActionLoading(requestId);
    try {
      const response = await fetch(`${API_BASE}/course/join-requests/${requestId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || `Failed to ${action} request.`);
      }

      // Remove the request from the list after action
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending' || !r.status);
  const handledRequests = requests.filter((r) => r.status === 'accepted' || r.status === 'rejected');

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <InstructorSidebar activePage="Notifications" setActivePage={() => {}} onLogout={() => {}} />

      <main className="flex-1 p-10">

        {/* Header */}
        <header className="flex justify-between items-center border-b-4 border-black pb-2 mb-10">
          <h2 className="text-2xl font-black uppercase m-0">🔔 Notifications</h2>
          <button
            onClick={fetchJoinRequests}
            className="text-sm font-bold text-[#4a7c2f] hover:underline flex items-center gap-1"
          >
            🔄 Refresh
          </button>
        </header>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 font-bold rounded-2xl px-6 py-4 mb-6">
            ❌ {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && pendingRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200">
            <span className="text-4xl mb-2">📭</span>
            <p className="font-bold text-gray-400">No pending join requests.</p>
          </div>
        )}

        {/* Pending Requests */}
        {!loading && pendingRequests.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📨</span>
              <h3 className="text-base font-bold m-0">Pending Join Requests</h3>
              <span className="bg-[#4a7c2f] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Students waiting for your approval to join your class.
            </p>

            <div className="flex flex-col gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#f0f7eb] border-2 border-[#a8d08d] rounded-[24px] py-5 px-8 flex items-center justify-between shadow-sm"
                >
                  {/* Left: Avatar + Info */}
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-[#A2BC56] rounded-full flex items-center justify-center text-white font-black text-lg shadow-sm">
                      {req.student_name ? req.student_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <h4 className="m-0 mb-0.5 text-base font-black">{req.student_name || 'Unknown Student'}</h4>
                      <div className="text-xs text-gray-600 font-bold flex items-center gap-2">
                        {req.student_id && <span>ID: {req.student_id}</span>}
                        {req.student_id && <span className="text-gray-300">|</span>}
                        <span>📘 Class Code: <span className="text-[#4a7c2f] tracking-widest">{req.class_code}</span></span>
                        {req.course_name && <><span className="text-gray-300">|</span><span>{req.course_name}</span></>}
                      </div>
                      {req.requested_at && (
                        <p className="text-[11px] text-gray-400 mt-0.5 m-0">
                          Requested: {new Date(req.requested_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex gap-3 ml-4">
                    <button
                      onClick={() => handleAction(req.id, 'accept')}
                      disabled={actionLoading === req.id}
                      className="bg-[#4a7c2f] text-white border-none py-2.5 px-7 rounded-full font-bold text-xs tracking-wider cursor-pointer hover:opacity-85 active:scale-95 transition-all uppercase disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading === req.id ? (
                        <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                      ) : '✓'} Accept
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'reject')}
                      disabled={actionLoading === req.id}
                      className="bg-white text-red-600 border-2 border-red-300 py-2.5 px-7 rounded-full font-bold text-xs tracking-wider cursor-pointer hover:bg-red-50 active:scale-95 transition-all uppercase disabled:opacity-50"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recently Handled */}
        {!loading && handledRequests.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📋</span>
              <h3 className="text-base font-bold m-0 text-gray-400">Recently Handled</h3>
            </div>
            <div className="flex flex-col gap-3">
              {handledRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-gray-50 border border-gray-200 rounded-[20px] py-4 px-8 flex items-center justify-between opacity-70"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-black">
                      {req.student_name ? req.student_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <h4 className="m-0 text-sm font-bold text-gray-600">{req.student_name}</h4>
                      <p className="m-0 text-xs text-gray-400">Class Code: {req.class_code}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold uppercase px-4 py-1.5 rounded-full ${
                    req.status === 'accepted'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-500'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default InstructorNotifications;