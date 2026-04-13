import React, { useState, useEffect } from 'react';

const ProgramSelector = ({ value, onChange, deptId }) => {
    const [programs, setPrograms] = useState([]);
    const [loading,  setLoading]  = useState(false);

    useEffect(() => {
        if (!deptId) { setPrograms([]); return; }
        setLoading(true);
        const mockByDept = {
            1: [
                { id: 1, name: 'BSIT', fullName: 'Bachelor of Science in Information Technology' },
                { id: 2, name: 'BSCS', fullName: 'Bachelor of Science in Computer Science' },
            ],
            2: [
                { id: 3, name: 'BSCE', fullName: 'Bachelor of Science in Civil Engineering' },
                { id: 4, name: 'BSEE', fullName: 'Bachelor of Science in Electrical Engineering' },
            ],
            3: [
                { id: 5, name: 'BSED', fullName: 'Bachelor of Secondary Education' },
                { id: 6, name: 'BSMATH', fullName: 'Bachelor of Science in Mathematics' },
            ],
        };
        setPrograms(mockByDept[deptId] || []);
        setLoading(false);
    }, [deptId]);

    return (
        <div className="w-full">
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                {loading ? (
                    <div className="py-8 text-center">
                        <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent text-green-500 rounded-full" />
                    </div>
                ) : programs.length > 0 ? (
                    programs.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => onChange(p)}
                            className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between text-left ${
                                value === p.id
                                    ? 'border-[#22C55E] bg-green-50'
                                    : 'border-gray-100 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{p.name}</span>
                                <span className="text-[11px] font-black text-gray-800 leading-tight">{p.fullName}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                value === p.id ? 'bg-[#22C55E] text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                                {value === p.id ? '✓' : '+'}
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            {deptId ? 'No programs in this department' : 'Select a department first'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgramSelector;