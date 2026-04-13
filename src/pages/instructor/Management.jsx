import React, { useState } from 'react';
import HandleSectionModal from './HandleSectionModal';
import SectionDashboard from './StudentManagement/SectionDashboard';

// ─────────────────────────────────────────────────────────────────────────────
// Management
// ✅ FIX: This is the SINGLE source of "My Courses" header + "Handle Section" button
//    InstructorDashboard no longer renders these — only mounts <Management />
// ─────────────────────────────────────────────────────────────────────────────
const Management = () => {
    const [view,          setView]          = useState('list');
    const [isModalOpen,   setIsModalOpen]   = useState(false);
    const [mySections,    setMySections]    = useState([]);
    const [activeSection, setActiveSection] = useState(null);

    const handleAddSuccess = (newSectionData) => {
        const newEntry = {
            id:       Date.now(),
            dept:     newSectionData.dept?.name     || newSectionData.dept     || '—',
            program:  newSectionData.program?.name  || newSectionData.program  || '—',
            subject:  newSectionData.subject?.course_name || newSectionData.subject?.name || '—',
            section:  newSectionData.section?.name  || newSectionData.section  || '—',
        };
        setMySections(prev => [...prev, newEntry]);
        setIsModalOpen(false);
    };

    return (
        <div className="w-full relative">

            {/* ── VIEW: LIST ── */}
            {view === 'list' && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">

                    {/* ✅ Single header + button — NOT duplicated in InstructorDashboard */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-gray-800 font-black uppercase italic text-lg tracking-tight leading-none">
                                My Courses
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                                Select a course to view handled sections
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#22C55E] hover:bg-green-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <span className="text-lg">＋</span> Handle Section
                        </button>
                    </div>

                    {/* Section Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mySections.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#22C55E]" />
                                <p className="text-[9px] font-black text-[#22C55E] uppercase tracking-widest mb-1">
                                    {item.dept} • {item.program}
                                </p>
                                <h3 className="text-xl font-black text-gray-800 uppercase italic leading-none tracking-tighter">
                                    {item.subject}
                                </h3>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Section:</span>
                                    <span className="text-[11px] font-black text-gray-800 uppercase italic bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                        {item.section}
                                    </span>
                                </div>
                                <button
                                    onClick={() => { setActiveSection(item); setView('focus'); }}
                                    className="w-full mt-6 py-4 bg-slate-900 group-hover:bg-[#22C55E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Manage Students
                                </button>
                            </div>
                        ))}

                        {mySections.length === 0 && (
                            <div className="col-span-full py-32 border-2 border-dashed border-gray-100 rounded-[3rem] text-center flex flex-col items-center justify-center bg-white/30">
                                <div className="text-4xl mb-4 opacity-20">📚</div>
                                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest italic">
                                    No handled sections yet. Use the "Handle Section" button to start.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── VIEW: FOCUS (Student Management) ── */}
            {view === 'focus' && activeSection && (
                <div className="animate-in fade-in duration-500">
                    <SectionDashboard
                        sectionData={activeSection}
                        onBack={() => { setView('list'); setActiveSection(null); }}
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