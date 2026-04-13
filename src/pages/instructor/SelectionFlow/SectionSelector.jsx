import React, { useState, useEffect } from 'react';

const SectionSelector = ({ value, onChange, programId }) => {
    const [sections, setSections] = useState([]);
    const [loading,  setLoading]  = useState(false);

    useEffect(() => {
        if (!programId) { setSections([]); return; }
        setLoading(true);
        const mockByProgram = {
            1: [
                { id: 1, name: 'BSIT-1A', year: '1st Year', room: 'Room 201', schedule: 'MWF 7:00-8:30 AM' },
                { id: 2, name: 'BSIT-1B', year: '1st Year', room: 'Room 202', schedule: 'TTH 7:00-8:30 AM' },
                { id: 3, name: 'BSIT-2A', year: '2nd Year', room: 'Room 301', schedule: 'MWF 9:00-10:30 AM' },
            ],
            2: [
                { id: 4, name: 'BSCS-1A', year: '1st Year', room: 'Room 101', schedule: 'MWF 1:00-2:30 PM' },
                { id: 5, name: 'BSCS-2A', year: '2nd Year', room: 'Room 102', schedule: 'TTH 3:00-4:30 PM' },
            ],
            3: [
                { id: 6, name: 'BSCE-1A', year: '1st Year', room: 'Lab 1',    schedule: 'TTH 10:00-11:30 AM' },
            ],
            4: [
                { id: 7, name: 'BSEE-2A', year: '2nd Year', room: 'Lab 3',    schedule: 'MWF 3:00-4:30 PM' },
            ],
            5: [
                { id: 8, name: 'BSED-1A', year: '1st Year', room: 'Room 401', schedule: 'TTH 1:00-2:30 PM' },
            ],
            6: [
                { id: 9, name: 'BSMATH-1A', year: '1st Year', room: 'Room 501', schedule: 'MWF 10:00-11:30 AM' },
            ],
        };
        setSections(mockByProgram[programId] || []);
        setLoading(false);
    }, [programId]);

    return (
        <div className="w-full">
            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                {loading ? (
                    <div className="py-8 text-center">
                        <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent text-green-500 rounded-full" />
                    </div>
                ) : sections.length > 0 ? (
                    sections.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => onChange(s)}
                            className={`w-full p-3 rounded-2xl border-2 transition-all flex flex-col text-left gap-1 ${
                                value === s.id
                                    ? 'border-[#22C55E] bg-green-50'
                                    : 'border-gray-100 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] font-black text-gray-800 uppercase italic">{s.name}</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{s.year}</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    value === s.id ? 'bg-[#22C55E] text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {value === s.id ? '✓' : '+'}
                                </div>
                            </div>
                            <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[9px] font-bold ${
                                value === s.id ? 'bg-white text-gray-600' : 'bg-gray-50 text-gray-400'
                            }`}>
                                <span>🕒</span>
                                <span>{s.schedule}</span>
                                <span className="mx-1 opacity-40">•</span>
                                <span>📍</span>
                                <span>{s.room}</span>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                        <div className="text-xl mb-1 opacity-20">📅</div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            {programId ? 'No sections in this program' : 'Select a program first'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SectionSelector;