import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../../services/APIservice';

const PendingApproval = ({ onBack }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ✅ Helper to clean token (Prevents 401 Unauthorized due to extra quotes or "undefined" string)
    const getCleanToken = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') return null;
        // Inaalis ang extra quotes na madalas nase-save ng JSON.stringify
        return token.replace(/['"]+/g, '').trim();
    }, []);

    // ── Fetch Pending Requests ──────────────────────────────────────────────
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = getCleanToken();
            if (!token) {
                setError('Authentication required. Please login again.');
                setLoading(false);
                return;
            }

            // Kunin ang lahat ng sections na sinave ng instructor
            const storedSections = JSON.parse(localStorage.getItem('mySections')) || [];
            
            if (storedSections.length === 0) {
                setRequests([]);
                setLoading(false);
                return;
            }

            // Sabay-sabay na i-fetch ang bawat section gamit ang tamang API path
            const fetchPromises = storedSections.map(async (section) => {
                try {
                    // Siguraduhing may valid ID bago tumawag sa API
                    const sId = section.section_id || section.id || section._id;

                    if (!sId) {
                        console.warn("Skipping section due to missing ID:", section);
                        return [];
                    }

                    // ✅ Gamit ang path sa image 0b95b0: /api/instructor/sections/${sId}/students/pending
                    const res = await authAPI.getPendingStudents(sId, token);

                    if (res.ok) {
                        const data = await res.json();
                        const studentList = Array.isArray(data) ? data : (data.data || []);
                        
                        return studentList.map(student => ({
                            ...student,
                            // Itatago ang section_id para sa handleAction mamaya
                            parentSectionId: sId,
                            section_display_name: section.section_name || section.section_code || 'Unnamed Section'
                        }));
                    }
                    return [];
                } catch (err) {
                    console.error(`Error fetching section:`, err);
                    return [];
                }
            });

            const results = await Promise.all(fetchPromises);
            const combinedRequests = results.flat();
            setRequests(combinedRequests);

        } catch (err) {
            console.error("Fetch error:", err);
            setError('Network error. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [getCleanToken]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // ── Handle Action (Approve or Reject) ───────────────────────────────────
    const handleAction = async (item, action) => {
        const statusMapping = action === 'approve' ? 'approved' : 'rejected';
        const confirmMsg = `Are you sure you want to ${action} this student?`;
        
        if (!window.confirm(confirmMsg)) return;

        try {
            const token = getCleanToken();
            const sId = item.parentSectionId;
            // ssId can be .ss_id (from student_sections table) or just .id
            const ssId = item.ss_id || item.id;

            if (!sId || !ssId) {
                alert("Critical Error: Missing IDs (Section or Student-Section ID) for processing.");
                return;
            }

            // ✅ Gamit ang path sa image 0b95b0: PATCH /api/instructor/sections/${sId}/students/${ssId}
            const res = await authAPI.approveRejectStudent(
                sId,
                ssId,
                statusMapping,
                token
            );

            if (res.ok) {
                // I-refresh ang listahan para mawala ang na-process na student
                fetchRequests();
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`Failed to ${action} request: ${errData.message || res.statusText}`);
            }
        } catch (err) {
            console.error("Action error:", err);
            alert("An error occurred during the process.");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-6">
            
            {/* ── HEADER SECTION ── */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 italic">
                        Access Request
                    </h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Review and manage incoming student join requests
                    </p>
                </div>
                
                <button 
                    onClick={onBack}
                    className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-[#22C55E] hover:text-[#22C55E] transition-all active:scale-95 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>
            </div>

            {/* ── LIST VIEW ── */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Details</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Gbox Account</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Section</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="py-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse">
                                        Synchronizing Data...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="3" className="py-20 text-center text-red-400 text-[10px] font-black uppercase italic">
                                        ⚠️ {error}
                                    </td>
                                </tr>
                            ) : requests.length > 0 ? (
                                requests.map((item) => (
                                    <tr key={item.ss_id || item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-black text-sm group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                                                    {(item.full_name || item.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-sm font-black text-gray-800 uppercase italic">
                                                        {item.full_name || item.name || 'Unknown Student'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => handleAction(item, 'approve')}
                                                            className="px-4 py-1.5 bg-[#22C55E] text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-900 transition-all shadow-md active:scale-95"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(item, 'deny')}
                                                            className="px-4 py-1.5 bg-white border border-gray-200 text-gray-400 text-[8px] font-black uppercase tracking-widest rounded-lg hover:border-red-500 hover:text-red-500 transition-all active:scale-95"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-8 py-6 text-sm font-bold text-gray-500 lowercase italic align-top pt-8">
                                            {item.email || 'no-email@univ.edu.ph'}
                                        </td>

                                        <td className="px-8 py-6 align-top pt-8">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                                                {item.section_display_name || 'N/A'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-32 text-center">
                                        <div className="text-4xl mb-4 opacity-20">📂</div>
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                            Queue is Clear
                                        </h3>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;