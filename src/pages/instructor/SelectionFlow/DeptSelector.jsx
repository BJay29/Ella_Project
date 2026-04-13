import React, { useState, useEffect } from 'react';

const DeptSelector = ({ value, onChange, courseId }) => {
    const [departments, setDepartments] = useState([]);
    const [loading,     setLoading]     = useState(false);

    useEffect(() => {
        // Always load all departments (or filter by courseId when API is ready)
        setLoading(true);
        const mockData = [
            { id: 1, name: 'College of Information Technology', abbr: 'CIT', icon: '💻' },
            { id: 2, name: 'College of Engineering',            abbr: 'COE', icon: '⚙️' },
            { id: 3, name: 'College of Arts and Sciences',      abbr: 'CAS', icon: '🎨' },
        ];
        setDepartments(mockData);
        setLoading(false);
    }, [courseId]);

    return (
        <div className="w-full">
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                {loading ? (
                    <div className="py-8 text-center">
                        <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent text-green-500 rounded-full" />
                    </div>
                ) : departments.length > 0 ? (
                    departments.map((d) => (
                        <button
                            key={d.id}
                            type="button"
                            onClick={() => onChange(d)}
                            className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between text-left ${
                                value === d.id
                                    ? 'border-[#22C55E] bg-green-50'
                                    : 'border-gray-100 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{d.icon}</span>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{d.abbr}</span>
                                    <span className="text-[11px] font-black text-gray-800 uppercase italic leading-tight">{d.name}</span>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                value === d.id ? 'bg-[#22C55E] text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                                {value === d.id ? '✓' : '+'}
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No Departments Found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeptSelector;