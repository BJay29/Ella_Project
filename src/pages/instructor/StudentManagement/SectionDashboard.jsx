import React, { useState } from 'react';
import StudentTable from './StudentTable';

const SectionDashboard = ({ sectionData, onBack }) => {
    // State para lumipat sa Table View o Dashboard Overview
    const [currentSubView, setCurrentSubView] = useState('overview');

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* 1. SECTION HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all"
                    >
                        <span className="text-gray-400 font-black">←</span>
                    </button>
                    <div>
                        <p className="text-[10px] font-black text-[#22C55E] uppercase tracking-[0.2em] leading-none mb-1">
                            {sectionData.dept} • {sectionData.program}
                        </p>
                        <h2 className="text-3xl font-black italic uppercase text-gray-800 tracking-tighter leading-none">
                            {sectionData.subject} <span className="text-[#22C55E]">- {sectionData.section}</span>
                        </h2>
                    </div>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    <button 
                        onClick={() => setCurrentSubView('overview')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentSubView === 'overview' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setCurrentSubView('students')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentSubView === 'students' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Student List
                    </button>
                </div>
            </div>

            {currentSubView === 'overview' ? (
                /* --- OVERVIEW CONTENT --- */
                <div className="space-y-6">
                    {/* MINI STATS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Class Performance</p>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-gray-800 italic">82%</span>
                                <span className="text-[10px] font-black text-green-500 mb-2 uppercase tracking-tighter">↑ 5% this week</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Submission Rate</p>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-gray-800 italic">12/15</span>
                                <span className="text-[10px] font-black text-amber-500 mb-2 uppercase tracking-tighter">3 Pending</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Class Attendance</p>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-gray-800 italic">95%</span>
                                <span className="text-[10px] font-black text-green-500 mb-2 uppercase tracking-tighter">Excellent</span>
                            </div>
                        </div>
                    </div>

                    {/* ACTIVITY PLACEHOLDER */}
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-black text-gray-800 uppercase italic tracking-widest mb-6">Recent Activity</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-[#22C55E] group-hover:text-white transition-all">
                                        {i === 1 ? '📝' : i === 2 ? '🎤' : '✅'}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-gray-800 uppercase leading-none italic">
                                            {i === 1 ? 'Juan Dela Cruz submitted Quiz 1' : i === 2 ? 'New Speaking Assessment uploaded' : 'Attendance sheet generated'}
                                        </p>
                                        <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* --- STUDENT LIST VIEW (STUDENT TABLE) --- */
                <StudentTable sectionName={sectionData.section} />
            )}
        </div>
    );
};

export default SectionDashboard;