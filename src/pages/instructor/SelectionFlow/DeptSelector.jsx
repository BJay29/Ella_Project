import React from 'react';

// --- MOCK DATA PARA SA DEPARTMENTS ---
const MOCK_DEPARTMENTS = [
    { 
        id: 1, 
        name: 'CCS', 
        description: 'College of Computer Studies',
        icon: '💻'
    },
    { 
        id: 2, 
        name: 'CBM', 
        description: 'College of Business Management',
        icon: '📊'
    },
    { 
        id: 3, 
        name: 'CAS', 
        description: 'College of Arts and Sciences',
        icon: '🎨'
    },
    { 
        id: 4, 
        name: 'COE', 
        description: 'College of Engineering',
        icon: '⚙️'
    }
];

const DeptSelector = ({ onNext }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="mb-10">
                <h2 className="text-3xl font-black italic uppercase text-gray-800 tracking-tighter leading-none">
                    Select Department
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-3 tracking-widest">
                    Step 1: Choose the department of the course
                </p>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_DEPARTMENTS.map((dept) => (
                    <button 
                        key={dept.id}
                        onClick={() => onNext(dept)}
                        className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 hover:border-[#22C55E] hover:shadow-2xl transition-all group text-left w-full active:scale-95 flex flex-col items-start min-h-[200px] relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute -right-4 -top-4 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">
                            {dept.icon}
                        </div>

                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                            {dept.icon}
                        </div>

                        <div>
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1 group-hover:text-[#22C55E] transition-colors">
                                Department
                            </p>
                            <h3 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter leading-none">
                                {dept.name}
                            </h3>
                            <p className="text-[11px] text-gray-400 font-medium mt-3 leading-tight group-hover:text-gray-600 transition-colors">
                                {dept.description}
                            </p>
                        </div>

                        {/* Hover Indicator */}
                        <div className="mt-auto pt-4 w-full flex justify-end">
                            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#22C55E] group-hover:text-white transition-all">
                                <span className="text-lg">→</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DeptSelector;