import React, { useState, useEffect, useCallback } from 'react';
import HandleSectionModal from './HandleSectionModal';
import SectionDashboard from './StudentManagement/SectionDashboard';

const Management = ({ onShowPending }) => {
    const [view, setView] = useState('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const STORAGE_KEY = 'instructor_handled_sections';
    const SELECTED_SECTION_KEY = 'selectedSection'; // Key na ginagamit ng StudentTable at SectionDashboard

    const [mySections, setMySections] = useState(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                return Array.isArray(parsedData) ? parsedData : [];
            }
        } catch (err) {
            console.error('Initial load error:', err);
        }
        return [];
    });

    const [activeSection, setActiveSection] = useState(null);
    const [isLoading, setIsLoading] = useState(false); 

    const getSectionId = (item) => item?.id || item?.section_id || item?._id;

    const fetchMySections = useCallback(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setMySections(Array.isArray(parsedData) ? parsedData : []);
            }
        } catch (err) {
            console.error('Error loading sections from localStorage:', err);
        }
    }, []);

    useEffect(() => {
        fetchMySections();
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEY) fetchMySections();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fetchMySections]);

    // ── Handle Manage Students (View Switcher) ──
    const handleManageStudents = (item) => {
        // I-save ang buong object sa localStorage para sa StudentTable / API calls
        localStorage.setItem(SELECTED_SECTION_KEY, JSON.stringify(item));
        
        setActiveSection(item); 
        setView('focus');
    };

    const handleUnassign = (sectionId) => {
        if (!window.confirm('Are you sure you want to remove this course from your dashboard?')) return;
        
        const updatedCards = mySections.filter(card => 
            String(getSectionId(card)) !== String(sectionId)
        );
        
        setMySections(updatedCards);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
        
        // Linisin ang selected kung ito yung tinanggal
        const currentSelected = JSON.parse(localStorage.getItem(SELECTED_SECTION_KEY));
        if (currentSelected && String(getSectionId(currentSelected)) === String(sectionId)) {
            localStorage.removeItem(SELECTED_SECTION_KEY);
        }
    };

    const handleAddSuccess = (updatedListOrNewItem) => {
        let finalSections = [];

        if (Array.isArray(updatedListOrNewItem)) {
            finalSections = updatedListOrNewItem; 
        } else if (updatedListOrNewItem) {
            finalSections = [updatedListOrNewItem, ...mySections];
        }

        const unique = finalSections.filter((v, i, a) => 
            a.findIndex(t => getSectionId(t) === getSectionId(v)) === i
        );
        
        setMySections(unique);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));        
        setIsModalOpen(false);
    };

    return (
        <div className="w-full relative">

            {/* ── VIEW: LIST ── */}
            {view === 'list' && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-gray-800 font-black uppercase italic text-lg tracking-tight leading-none">
                                My Courses
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                                Select a course to view handled sections
                            </p>
                        </div>

                        {/* Button Group */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onShowPending}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3 group border border-white/10 shadow-xl"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                Pending Requests
                            </button>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-[#22C55E] hover:bg-green-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span className="text-lg">＋</span> Handle Section
                            </button>
                        </div>
                    </div>

                    {/* ── Cards Grid ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {isLoading && mySections.length === 0 && [1, 2, 3].map(i => (
                            <div key={i} className="h-[220px] bg-gray-100 animate-pulse rounded-[2.5rem]" />
                        ))}

                        {!isLoading && mySections.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No courses handled yet. Click "Handle Section" to start.</p>
                            </div>
                        )}

                        {!isLoading && mySections.map((item, idx) => {
                            const sectionId   = getSectionId(item);
                            const courseName  = item.course_name  || item.subject     || '—';
                            const deptAbbr    = item.dept_abbr    || item.dept_name   || '—';
                            const progAbbr    = item.program_abbr || item.program_name|| '—';
                            const sectionName = item.section_name || item.name         || '—';

                            return (
                                <div
                                    key={sectionId || `section-${idx}`}
                                    className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-full bg-[#22C55E]" />

                                    <button
                                        onClick={() => handleUnassign(sectionId)}
                                        className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors z-10 p-2"
                                        title="Unassign Section"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>

                                    <div className="flex justify-between items-start mb-1 pr-8">
                                        <p className="text-[9px] font-black text-[#22C55E] uppercase tracking-widest">
                                            {deptAbbr} • {progAbbr}
                                        </p>
                                    </div>

                                    <h3 className="text-xl font-black text-gray-800 uppercase italic leading-none tracking-tighter pr-8 min-h-[40px]">
                                        {courseName}
                                    </h3>

                                    <div className="mt-4 flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Section:</span>
                                            <span className="text-[11px] font-black text-gray-800 uppercase italic bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                                {sectionName}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleManageStudents(item)}
                                        className="w-full mt-6 py-4 bg-slate-900 group-hover:bg-[#22C55E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-[0.98]"
                                    >
                                        Manage Students
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── VIEW: FOCUS ── */}
            {view === 'focus' && activeSection && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionDashboard
                        sectionData={activeSection}
                        onBack={() => { 
                            setView('list'); 
                            setActiveSection(null); 
                            // Opsyonal: linisin ang selection sa pag-back
                            // localStorage.removeItem(SELECTED_SECTION_KEY);
                        }}
                    />
                </div>
            )}

            {/* ── Handle Section Modal ── */}
            {isModalOpen && (
                <HandleSectionModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleAddSuccess}
                />
            )}
        </div>
    );
};

export default Management;