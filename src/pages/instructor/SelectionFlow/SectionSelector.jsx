import React from 'react';

// --- MOCK DATA PARA SA SECTIONS ---
// Karaniwan ang sections ay standard (A, B, C) 
// Pero pwede mo rin itong i-filter base sa subjectId kung gusto mo sa future
const MOCK_SECTIONS = [
    { id: 901, name: '3A', schedule: 'MW 8:00 AM - 10:00 AM', room: 'LAB 1' },
    { id: 902, name: '3B', schedule: 'TTH 1:00 PM - 3:00 PM', room: 'LAB 2' },
    { id: 903, name: '3C', schedule: 'F 8:00 AM - 12:00 PM', room: 'LEC 3' },
    { id: 904, name: '4A', schedule: 'MW 10:00 AM - 12:00 PM', room: 'LAB 1' },
    { id: 905, name: '4B', schedule: 'TTH 3:00 PM - 5:00 PM', room: 'LAB 2' }
];

const SectionSelector = ({ onNext }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="mb-10">
                <h2 className="text-3xl font-black italic uppercase text-gray-800 tracking-tighter leading-none">
                    Select Section
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-3 tracking-widest">
                    Step 4: Finalize by selecting the specific class section
                </p>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_SECTIONS.map((section) => (
                    <button 
                        key={section.id}
                        onClick={() => onNext(section)}
                        className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-50 hover:border-[#22C55E] hover:shadow-2xl transition-all group text-left w-full active:scale-95 flex flex-col min-h-[160px] relative overflow-hidden"
                    >
                        {/* Section Header */}
                        <div className="flex justify-between items-start w-full mb-4">
                            <div>
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1 group-hover:text-[#22C55E] transition-colors">
                                    Class Group
                                </p>
                                <h3 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter leading-none">
                                    Section {section.name}
                                </h3>
                            </div>
                            <div className="bg-gray-50 px-3 py-1 rounded-full group-hover:bg-[#22C55E]/10 transition-colors">
                                <span className="text-[9px] font-black text-gray-400 group-hover:text-[#22C55E] uppercase tracking-tighter">
                                    {section.room}
                                </span>
                            </div>
                        </div>

                        {/* Schedule Info */}
                        <div className="mt-auto border-t border-gray-50 pt-4 flex items-center gap-2">
                            <span className="text-sm">🕒</span>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight leading-none group-hover:text-gray-700 transition-colors">
                                {section.schedule}
                            </p>
                        </div>

                        {/* Visual Confirm Hint */}
                        <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[9px] font-black text-[#22C55E] uppercase italic">Confirm Selection</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SectionSelector;