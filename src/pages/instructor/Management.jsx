import React, { useState, useEffect, useCallback } from 'react';
import HandleSectionModal from './HandleSectionModal';
import SectionDashboard from './StudentManagement/SectionDashboard';
// Siniguro ang tamang casing para sa APIService.js
import { authAPI } from '../../services/APIservice'; 

const Management = () => {
    const [view, setView] = useState('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mySections, setMySections] = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // ── Function to Load Sections from LocalStorage ────────────────────────
    // Dahil sabi ng backend ay "temporary" at "hindi sa DB isasave", 
    // gagamit tayo ng LocalStorage para hindi mawala sa refresh.
    const loadSavedSections = useCallback(() => {
        setIsLoading(true);
        try {
            const savedData = localStorage.getItem('instructor_handled_sections');
            if (savedData) {
                setMySections(JSON.parse(savedData));
            }
        } catch (error) {
            console.error("Error loading sections from storage:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load pagbukas ng page
    useEffect(() => {
        loadSavedSections();
    }, [loadSavedSections]);

    // ── Function to Remove/Delete Card (Frontend Only) ──────────────────────
    const handleUnassign = (sectionId) => {
        if (!window.confirm("Are you sure you want to remove this card from your dashboard?")) return;
        
        // Filter out yung card na gustong tanggalin
        const updatedSections = mySections.filter(section => section.id !== sectionId);
        
        // Update state and storage
        setMySections(updatedSections);
        localStorage.setItem('instructor_handled_sections', JSON.stringify(updatedSections));
    };

    // ── Success Handler from Modal ─────────────────────────────────────────
    // Tinatawag ito kapag nag-confirm sa modal. Ang 'newSection' ay galing sa modal.
    const handleAddSuccess = (newSection) => {
        // I-check kung existing na yung section para walang duplicate
        const isExisting = mySections.some(s => s.id === newSection.id);
        
        if (!isExisting) {
            const updatedSections = [...mySections, newSection];
            setMySections(updatedSections);
            
            // I-save sa browser memory
            localStorage.setItem('instructor_handled_sections', JSON.stringify(updatedSections));
        }
        
        setIsModalOpen(false);
    };

    return (
        <div className="w-full relative">

            {/* ── VIEW: LIST ── */}
            {view === 'list' && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-gray-800 font-black uppercase italic text-lg tracking-tight leading-none">
                                My Handled Sections
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                                Temporary View • Data saved locally in this browser
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
                        {isLoading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-[200px] bg-gray-100 animate-pulse rounded-[2.5rem]" />
                            ))
                        ) : mySections.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#22C55E]" />
                                
                                {/* Remove Card Button */}
                                <button 
                                    onClick={() => handleUnassign(item.id)}
                                    className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors z-10"
                                    title="Remove Card"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>

                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-[9px] font-black text-[#22C55E] uppercase tracking-widest">
                                        {item.dept_abbr || 'DEPT'} • {item.program_abbr || 'PROG'}
                                    </p>
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black tracking-widest mr-6">
                                        {item.section_code || '---'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-black text-gray-800 uppercase italic leading-none tracking-tighter pr-8 min-h-[40px]">
                                    {item.course_name}
                                </h3>
                                
                                <div className="mt-4 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Section:</span>
                                        <span className="text-[11px] font-black text-gray-800 uppercase italic bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                            {item.section_name}
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight italic">
                                        {item.course_code}
                                    </p>
                                </div>

                                <button
                                    onClick={() => { setActiveSection(item); setView('focus'); }}
                                    className="w-full mt-6 py-4 bg-slate-900 group-hover:bg-[#22C55E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Manage Students
                                </button>
                            </div>
                        ))}

                        {!isLoading && mySections.length === 0 && (
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
                    onSuccess={handleAddSuccess} // Ipapasa dito yung selected section data
                />
            )}
        </div>
    );
};

export default Management;