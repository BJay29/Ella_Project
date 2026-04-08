import React from 'react';

// --- MOCK DATA PARA SA PENDING REQUESTS ---
const MOCK_PENDING = [
    { id: 1, type: 'STUDENT_ENROLLMENT', name: 'ANDRES BONIFACIO', section: '3A', date: '2026-04-07' },
    { id: 2, type: 'STUDENT_ENROLLMENT', name: 'APOLINARIO MABINI', section: '3B', date: '2026-04-06' },
    { id: 3, type: 'COURSE_ACCESS', name: 'SECTION 4A - REQUEST ACCESS', section: '4A', date: '2026-04-05' }
];

const PendingApproval = ({ onBack }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-black italic uppercase text-gray-800 tracking-tighter leading-none">
                        Pending Approvals
                    </h2>
                    <p className="text-[10px] text-amber-500 font-black uppercase mt-2 tracking-[0.2em] flex items-center gap-2">
                        <span className="animate-pulse text-lg">⚠️</span> 
                        Requires action from department head
                    </p>
                </div>
                
                <button 
                    onClick={onBack}
                    className="text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* PENDING LIST GRID */}
            <div className="grid grid-cols-1 gap-4">
                {MOCK_PENDING.length > 0 ? (
                    MOCK_PENDING.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between group hover:shadow-md transition-all">
                            
                            <div className="flex items-center gap-6 w-full">
                                {/* Type Icon */}
                                <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                                    {item.type === 'STUDENT_ENROLLMENT' ? '👤' : '📚'}
                                </div>

                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">
                                        {item.type.replace('_', ' ')}
                                    </p>
                                    <h3 className="text-lg font-black text-gray-800 uppercase italic leading-none tracking-tight">
                                        {item.name}
                                    </h3>
                                    <div className="flex gap-4 mt-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                                            Section: <span className="text-gray-600 font-black">{item.section}</span>
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                                            Requested: <span className="text-gray-600 font-black">{item.date}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-6 md:mt-0 w-full md:w-auto">
                                <button className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                                    Deny
                                </button>
                                <button className="flex-1 md:flex-none px-6 py-3 bg-[#22C55E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-100">
                                    Approve
                                </button>
                            </div>

                        </div>
                    ))
                ) : (
                    /* Empty State */
                    <div className="py-32 bg-white/50 border-2 border-dashed border-gray-100 rounded-[3rem] text-center">
                        <div className="text-4xl mb-4">✨</div>
                        <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest italic">
                            Everything is clear! No pending approvals.
                        </p>
                    </div>
                )}
            </div>

            {/* NOTIFICATION BOX (Gaya nung sa Image 3) */}
            <div className="mt-12 bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 flex items-start gap-4">
                <span className="text-2xl">💡</span>
                <div>
                    <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Instructor Tip</h4>
                    <p className="text-[11px] text-indigo-400 font-bold mt-1 leading-relaxed uppercase tracking-tighter">
                        Approving student enrollment will automatically sync them to your section roster. Please verify identity before confirming.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;