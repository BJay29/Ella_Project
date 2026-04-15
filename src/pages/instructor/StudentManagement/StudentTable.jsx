import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../../../services/APIservice';

// ─────────────────────────────────────────────────────────────────────────────
// UI Components & Helpers
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-50">
        {[1, 2, 3, 4, 5, 6].map(i => (
            <td key={i} className="px-6 py-6"><div className="h-3 bg-gray-100 rounded shadow-sm" /></td>
        ))}
    </tr>
);

const StatusBadge = ({ status }) => {
    const s = (status || 'active').toLowerCase();
    const isAtRisk = s === 'at risk' || s === 'at-risk';
    
    return (
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
            isAtRisk ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
        }`}>
            {status || 'Active'}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component: StudentTable
// ─────────────────────────────────────────────────────────────────────────────
const StudentTable = ({ sectionId, sectionName, sectionCode, deptAbbr, programAbbr, onBack }) => {
    const [students, setStudents] = useState([]); // Placeholder muna ito hangga't wala pang getStudentsBySection
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');

    // ✅ Helper to clean token
    const getCleanToken = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') return null;
        return token.replace(/['"]+/g, '').trim();
    }, []);

    // ── Data Fetching Logic ────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        const storedSection = localStorage.getItem('selectedSection');
        const activeSection = storedSection ? JSON.parse(storedSection) : null;
        
        // Priority: LocalStorage ID -> Prop ID
        const sId = activeSection?.section_id || activeSection?.id || sectionId;

        if (!sId) {
            console.error("No active section ID found");
            setError('Section ID is missing. Please go back.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const token = getCleanToken();
            if (!token) {
                setError('Session expired. Please login again.');
                setLoading(false);
                return;
            }

            // 1. Fetch Pending Join Requests (Ito lang muna ang active)
            const pendingRes = await authAPI.getPendingStudents(sId, token);
            
            if (pendingRes.ok) {
                const pData = await pendingRes.json();
                setPendingRequests(Array.isArray(pData) ? pData : (pData.data || []));
            } else {
                const errData = await pendingRes.json().catch(() => ({}));
                console.error("Pending Students Error:", errData);
            }

            // NOTE: getStudentsBySection is temporarily removed as per request.
            // setStudents([]); 

        } catch (err) {
            setError('Failed to sync data with the server.');
            console.error("FetchData Error:", err);
        } finally {
            setLoading(false);
        }
    }, [sectionId, getCleanToken]);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    // ── Handle Action (Approve/Reject) ────────────────────────────────────
    const handleAction = async (requestId, action) => {
        const storedSection = localStorage.getItem('selectedSection');
        const activeSection = storedSection ? JSON.parse(storedSection) : null;
        const sId = activeSection?.section_id || activeSection?.id || sectionId;
        
        if (!sId || !requestId) {
            alert("Missing Section or Request ID.");
            return;
        }

        const statusMapping = action === 'approve' ? 'approved' : 'rejected';
        const confirmMsg = `Are you sure you want to ${action} this request?`;
        if (!window.confirm(confirmMsg)) return;
        
        try {
            const token = getCleanToken();
            const res = await authAPI.approveRejectStudent(sId, requestId, statusMapping, token);

            if (res.ok) {
                fetchData(); // Refresh requests list
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`Error: ${errData.message || res.statusText}`);
            }
        } catch (err) {
            console.error("HandleAction Error:", err);
            alert("An error occurred.");
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const fullName = (s.full_name || `${s.first_name || ''} ${s.last_name || ''}` || '').toLowerCase();
            const email = (s.email || '').toLowerCase();
            const sIdStr = (s.student_id || s.id || '').toString().toLowerCase();
            const search = searchTerm.toLowerCase();
            
            return fullName.includes(search) || email.includes(search) || sIdStr.includes(search);
        });
    }, [students, searchTerm]);

    return (
        <div className="flex flex-col h-full bg-white relative overflow-hidden">
            
            {/* ── HEADER AREA ── */}
            <div className="px-10 pt-10 pb-8 bg-white border-b border-gray-50">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={onBack}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-[#22C55E] hover:bg-green-50 transition-all border border-gray-100"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-[#22C55E] uppercase tracking-[0.2em]">
                                    {deptAbbr || "Academic"} Management — {programAbbr || "Course"}
                                </span>
                            </div>
                            <h2 className="text-3xl font-black uppercase text-gray-900 tracking-tighter leading-none">
                                {sectionName || "Section Details"}
                            </h2>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-end px-6 py-2 bg-green-50/50 border border-green-100 rounded-2xl">
                             <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Section Code</span>
                             <span className="text-sm font-black text-gray-800 tracking-widest">{sectionCode || '---'}</span>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#22C55E] transition-all flex items-center gap-3 relative"
                        >
                            View Requests
                            {pendingRequests.length > 0 && (
                                <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-4 border-white animate-bounce">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="relative group max-w-2xl">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-300 group-focus-within:text-[#22C55E] transition-colors" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="SEARCH BY NAME, ID, OR EMAIL..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-8 py-5 bg-gray-50 border-none rounded-[1.5rem] text-[11px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-[#22C55E]/5 transition-all outline-none text-gray-800"
                    />
                </div>
            </div>

            {/* ── STUDENT TABLE (Official List) ── */}
            <div className="flex-1 overflow-auto px-10 py-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                        ⚠️ {error}
                    </div>
                )}
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                            <th className="px-6 py-5">Student Name</th>
                            <th className="px-6 py-5">Gbox Account</th>
                            <th className="px-6 py-5">Progress</th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5">Last Active</th>
                            <th className="px-6 py-5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student.ss_id || student.id} className="group hover:bg-[#F8FAFC] transition-all">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-[#22C55E] flex items-center justify-center text-white text-[10px] font-black">
                                                {(student.full_name || 'ST').substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-black text-gray-800 uppercase italic tracking-tight group-hover:text-[#22C55E] transition-colors">
                                                {student.full_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="text-[11px] font-bold text-gray-500 lowercase">{student.email}</span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-[#22C55E] rounded-full transition-all duration-1000"
                                                    style={{ width: `${student.progress || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400">{student.progress || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <StatusBadge status={student.status} />
                                    </td>
                                    <td className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {student.last_active || 'Never'}
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <button className="px-5 py-2.5 bg-green-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg shadow-green-100">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-32 text-center opacity-30 grayscale">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                                        {loading ? "Syncing data..." : "No official students found"}
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── SLIDE-OVER REQUESTS PANEL ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div 
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
                        onClick={() => setIsModalOpen(false)} 
                    />
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-3xl font-black italic uppercase text-gray-900 tracking-tighter">Join Requests</h3>
                                <p className="text-[10px] font-black text-[#22C55E] uppercase tracking-widest mt-1">Verification Needed</p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:text-black transition-all font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-6">
                            {pendingRequests.length > 0 ? (
                                pendingRequests.map((req) => (
                                    <div key={req.ss_id || req.id} className="group p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-green-100 hover:bg-green-50/30 transition-all">
                                        <div className="mb-4">
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Student Name</span>
                                            <h4 className="text-lg font-black text-gray-800 uppercase italic tracking-tight group-hover:text-[#22C55E]">
                                                {req.full_name || req.name}
                                            </h4>
                                        </div>
                                        <div className="mb-6">
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Gbox Account</span>
                                            <p className="text-xs font-bold text-gray-500 lowercase">{req.email || 'No email provided'}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => handleAction(req.ss_id || req.id, 'approve')}
                                                className="flex-1 py-4 bg-[#22C55E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-green-100"
                                            >
                                                Confirm
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req.ss_id || req.id, 'deny')}
                                                className="px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                                            >
                                                Deny
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
                                    <div className="text-5xl mb-4">✅</div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Pending Joiners</p>
                                </div>
                            )}
                        </div>

                        <div className="p-10 border-t border-gray-50 bg-gray-50/50">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:border-gray-300 hover:text-gray-600 transition-all"
                            >
                                Close Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentTable;