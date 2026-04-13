import React, { useState, useEffect } from 'react';

const CourseSelector = ({ value, onChange }) => {
    const [courses,    setCourses]    = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading,    setLoading]    = useState(false);

    useEffect(() => {
        setLoading(true);
        // Replace with real API call
        const mockData = [
            { id: 1, course_code: 'IT111',  course_name: 'Introduction to Computing' },
            { id: 2, course_code: 'IT112',  course_name: 'Computer Programming 1' },
            { id: 3, course_code: 'GE101',  course_name: 'Understanding the Self' },
            { id: 4, course_code: 'NET101', course_name: 'Networking Technologies' },
        ];
        setCourses(mockData);
        setLoading(false);
    }, []);

    const filtered = courses.filter(c =>
        c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.course_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full">
            <div className="relative mb-3">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-300 text-xs">🔍</span>
                <input
                    type="text"
                    placeholder="Search Code or Subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-100 focus:border-[#22C55E] rounded-2xl text-[10px] font-bold uppercase tracking-wider outline-none transition-all placeholder:text-gray-300"
                />
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                {loading ? (
                    <div className="py-8 text-center">
                        <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent text-green-500 rounded-full" />
                    </div>
                ) : filtered.length > 0 ? (
                    filtered.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => onChange(c)}
                            className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between text-left ${
                                value === c.id
                                    ? 'border-[#22C55E] bg-green-50'
                                    : 'border-gray-100 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-black text-[#22C55E] uppercase tracking-widest">{c.course_code}</span>
                                <span className="text-[11px] font-black text-gray-800 uppercase italic">{c.course_name}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                value === c.id ? 'bg-[#22C55E] text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                                {value === c.id ? '✓' : '+'}
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">No Subjects Found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseSelector;