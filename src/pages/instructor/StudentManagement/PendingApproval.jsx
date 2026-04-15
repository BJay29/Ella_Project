import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';

const PendingApproval = ({ onBack }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ── Fetch Pending Requests (Centralized/Looping) ───────────────────────
    const fetchRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            // Kunin ang lahat ng sections na sinave ng instructor sa cards
            const storedSections = JSON.parse(localStorage.getItem('mySections')) || [];
            
            if (storedSections.length === 0) {
                setRequests([]);
                setLoading(false);
                return;
            }

            // Sabay-sabay na i-fetch ang bawat section
            const fetchPromises = storedSections.map(async (section) => {
                try {
                    const res = await authAPI.getPendingStudents(
                        section.course_id,
                        section.dept_id,
                        section.program_id,
                        section.section_id,
                        token
                    );
                    if (res.ok) {
                        const data = await res.json();
                        // Isama ang section info sa bawat student object para sa mapping
                        return (data.data || data || []).map(student => ({
                            ...student,
                            // Itatabi natin ang IDs para sa approval action mamaya
                            parentSectionIds: {
                                course_id: section.course_id,
                                dept_id: section.dept_id,
                                program_id: section.program_id,
                                section_id: section.section_id
                            },
                            section_name: section.section_name || section.section_code
                        }));
                    }
                    return [];
                } catch (err) {
                    console.error(`Error fetching section ${section.section_id}:`, err);
                    return [];
                }
            });

            const results = await Promise.all(fetchPromises);
            // Pagsamahin lahat ng arrays (Flatten)
            const combinedRequests = results.flat();
            setRequests(combinedRequests);

        } catch (err) {
            setError('Network error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // ── Handle Action (Approve/Deny) ───────────────────────────────────────
    const handleAction = async (item, action) => {
        // action parameter here is expected as 'approve' or 'deny' 
        // derived from your UI buttons. We map it to 'approved' or 'rejected'.
        const statusMapping = action === 'approve' ? 'approved' : 'rejected';
        
        try {
            const token = localStorage.getItem('token');
            // Ginagamit ang IDs na sinave natin sa student object during fetch
            const { course_id, dept_id, program_id, section_id } = item.parentSectionIds;
            const ssId = item.ss_id || item.id;

            const res = await authAPI.approveRejectStudent(
                course_id,
                dept_id,
                program_id,
                section_id,
                ssId,
                statusMapping,
                token
            );

            if (res.ok) {
                // I-refresh ang listahan para mawala ang na-process na student
                fetchRequests();
            } else {
                alert(`Failed to ${action} request.`);
            }
        } catch (err) {
            console.error(err);
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
                                        {/* Name with Avatar & Sub-Actions */}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-black text-sm group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                                                    {(item.full_name || item.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-sm font-black text-gray-800 uppercase italic">
                                                        {item.full_name || item.name || 'Unknown Student'}
                                                    </span>
                                                    {/* INLINE ACTIONS BELOW NAME */}
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
                                        
                                        {/* Gbox / Email */}
                                        <td className="px-8 py-6 text-sm font-bold text-gray-500 lowercase italic align-top pt-8">
                                            {item.email || 'no-email@univ.edu.ph'}
                                        </td>

                                        {/* Section */}
                                        <td className="px-8 py-6 align-top pt-8">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                                                {item.section_name || 'N/A'}
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