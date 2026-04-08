import React from 'react';

// --- MOCK DATA PARA SA PROGRAMS ---
// Naka-map ito base sa Dept ID para sa filtering logic
const MOCK_PROGRAMS = {
    // CCS (Dept ID: 1)
    1: [
        { id: 101, name: 'BSIT', fullName: 'Bachelor of Science in Information Technology' },
        { id: 102, name: 'BSCS', fullName: 'Bachelor of Science in Computer Science' },
        { id: 103, name: 'BSIS', fullName: 'Bachelor of Science in Information Systems' }
    ],
    // CBM (Dept ID: 2)
    2: [
        { id: 201, name: 'BSHM', fullName: 'Bachelor of Science in Hospitality Management' },
        { id: 202, name: 'BSBA', fullName: 'Bachelor of Science in Business Administration' },
        { id: 203, name: 'BSTM', fullName: 'Bachelor of Science in Tourism Management' }
    ],
    // CAS (Dept ID: 3)
    3: [
        { id: 301, name: 'AB Psych', fullName: 'Bachelor of Arts in Psychology' },
        { id: 302, name: 'AB Comm', fullName: 'Bachelor of Arts in Communication' }
    ],
    // COE (Dept ID: 4)
    4: [
        { id: 401, name: 'BSCE', fullName: 'Bachelor of Science in Civil Engineering' },
        { id: 402, name: 'BSEE', fullName: 'Bachelor of Science in Electrical Engineering' }
    ]
};

const ProgramSelector = ({ deptId, onNext }) => {
    // I-filter ang programs base sa napiling Department
    const programList = MOCK_PROGRAMS[deptId] || [];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="mb-10">
                <h2 className="text-3xl font-black italic uppercase text-gray-800 tracking-tighter leading-none">
                    Select Program
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-3 tracking-widest">
                    Step 2: Filter subjects by degree program
                </p>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programList.length > 0 ? (
                    programList.map((prog) => (
                        <button 
                            key={prog.id}
                            onClick={() => onNext(prog)}
                            className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 hover:border-[#22C55E] hover:shadow-2xl transition-all group text-left w-full active:scale-95 flex flex-col justify-between min-h-[180px] shadow-sm"
                        >
                            <div>
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1 group-hover:text-[#22C55E] transition-colors">
                                    Degree Program
                                </p>
                                <h3 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter leading-none">
                                    {prog.name}
                                </h3>
                                <p className="text-[11px] text-gray-400 font-medium mt-3 leading-tight group-hover:text-gray-600 transition-colors">
                                    {prog.fullName}
                                </p>
                            </div>

                            {/* Arrow Indicator */}
                            <div className="mt-6 flex justify-end">
                                <div className="h-10 w-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-[#22C55E]/10 group-hover:rotate-45 transition-all duration-300">
                                    <span className="text-[#22C55E] font-bold">→</span>
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    /* Fallback if no programs are found */
                    <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 font-black uppercase text-[10px] italic tracking-widest">
                            No programs found for this department.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgramSelector;