import React from 'react';

// --- MOCK DATA PARA SA SUBJECTS ---
const MOCK_SUBJECTS = {
    // IT Subjects (deptId 1 -> progId 101)
    101: [
        { id: 501, name: 'PROG 1', code: 'IT111', units: 3 },
        { id: 502, name: 'NETWORKING 1', code: 'IT112', units: 3 },
        { id: 503, name: 'WEB DEV', code: 'IT113', units: 3 }
    ],
    // CS Subjects (deptId 1 -> progId 102)
    102: [
        { id: 601, name: 'CS 101', code: 'CS211', units: 3 },
        { id: 602, name: 'ALGORITHMS', code: 'CS212', units: 4 },
        { id: 603, name: 'DISCRETE MATH', code: 'CS213', units: 3 }
    ],
    // HM Subjects (deptId 2 -> progId 201)
    201: [
        { id: 701, name: 'KITCHEN MGMT', code: 'HM101', units: 5 },
        { id: 702, name: 'FRONT OFFICE', code: 'HM102', units: 3 }
    ]
};

const CourseSelector = ({ programId, onNext }) => {
    // Kunin ang listahan base sa programId na pinasa ng Management.jsx
    const subjectList = MOCK_SUBJECTS[programId] || [];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header ng Selector */}
            <div className="mb-8">
                <h2 className="text-2xl font-black italic uppercase text-gray-800 tracking-tighter leading-none">
                    Select Subject
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">
                    Step 3: Choose the specific course/subject you are handling
                </p>
            </div>

            {/* Grid ng mga Subjects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjectList.length > 0 ? (
                    subjectList.map((subject) => (
                        <button 
                            key={subject.id}
                            onClick={() => onNext(subject)}
                            className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 hover:border-[#22C55E] hover:shadow-xl transition-all group text-left w-full active:scale-95 flex flex-col justify-between min-h-[160px]"
                        >
                            <div>
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1 group-hover:text-[#22C55E] transition-colors">
                                    {subject.code}
                                </p>
                                <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter leading-tight">
                                    {subject.name}
                                </h3>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 w-full flex justify-between items-center">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    {subject.units} Units
                                </span>
                                <div className="h-6 w-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#22C55E]/10 transition-colors">
                                    <span className="text-[#22C55E] text-xs">→</span>
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-gray-400 font-black uppercase text-[10px] italic">
                            No subjects found for this program.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseSelector;