import React, { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Inline Selector Components
// ✅ FIX: All 4 selectors now have mock data so text is visible.
//    Replace the mockData arrays with real API calls when ready.
// ─────────────────────────────────────────────────────────────────────────────

const SelectList = ({ items, value, onChange, emptyText = 'No items found', renderLabel }) => (
    <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {items.length === 0 ? (
            <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{emptyText}</p>
            </div>
        ) : (
            items.map((item) => {
                const isSelected = value === item.id;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onChange(item)}
                        className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between group text-left ${
                            isSelected
                                ? 'border-[#22C55E] bg-green-50 shadow-sm'
                                : 'border-gray-100 bg-white hover:border-gray-300'
                        }`}
                    >
                        <div className="flex flex-col gap-0.5 min-w-0">
                            {renderLabel(item)}
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2 text-[10px] font-black transition-all ${
                            isSelected ? 'bg-[#22C55E] text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                            {isSelected ? '✓' : '+'}
                        </div>
                    </button>
                );
            })
        )}
        <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        `}</style>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// HandleSectionModal
// ─────────────────────────────────────────────────────────────────────────────
const HandleSectionModal = ({ onClose, onSuccess }) => {
    const [selection, setSelection] = useState({
        course: null, dept: null, program: null, section: null
    });
    const [searchTerm, setSearchTerm] = useState('');

    // ── Mock data — replace with API calls when ready ──────────────────────
    const allCourses = [
        { id: 1, course_code: 'IT111', course_name: 'Introduction to Computing' },
        { id: 2, course_code: 'IT112', course_name: 'Computer Programming 1' },
        { id: 3, course_code: 'GE101', course_name: 'Understanding the Self' },
        { id: 4, course_code: 'NET101', course_name: 'Networking Technologies' },
    ];

    const allDepts = [
        { id: 1, name: 'College of Information Technology', abbr: 'CIT' },
        { id: 2, name: 'College of Engineering',            abbr: 'COE' },
        { id: 3, name: 'College of Arts and Sciences',      abbr: 'CAS' },
    ];

    const allPrograms = {
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
        ],
    };

    const allSections = {
        1: [
            { id: 1, name: 'BSIT-1A', year: '1st Year', room: 'Room 201', schedule: 'MWF 7:00-8:30 AM' },
            { id: 2, name: 'BSIT-1B', year: '1st Year', room: 'Room 202', schedule: 'TTH 7:00-8:30 AM' },
            { id: 3, name: 'BSIT-2A', year: '2nd Year', room: 'Room 301', schedule: 'MWF 9:00-10:30 AM' },
        ],
        2: [
            { id: 4, name: 'BSCS-1A', year: '1st Year', room: 'Room 101', schedule: 'MWF 1:00-2:30 PM' },
        ],
        3: [
            { id: 5, name: 'BSCE-1A', year: '1st Year', room: 'Lab 1',   schedule: 'TTH 10:00-11:30 AM' },
        ],
        4: [
            { id: 6, name: 'BSEE-2A', year: '2nd Year', room: 'Lab 3',   schedule: 'MWF 3:00-4:30 PM' },
        ],
        5: [
            { id: 7, name: 'BSED-1A', year: '1st Year', room: 'Room 401', schedule: 'TTH 1:00-2:30 PM' },
        ],
    };

    // ── Derived lists based on selection ───────────────────────────────────
    const filteredCourses = allCourses.filter(c =>
        c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.course_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableDepts   = allDepts;
    const availablePrograms = selection.dept ? (allPrograms[selection.dept.id] || []) : [];
    const availableSections = selection.program ? (allSections[selection.program.id] || []) : [];

    // ── Selection change with cascade reset ────────────────────────────────
    const handleChange = (field, data) => {
        setSelection(prev => {
            const next = { ...prev, [field]: data };
            if (field === 'course')  { next.dept = null; next.program = null; next.section = null; }
            if (field === 'dept')    { next.program = null; next.section = null; }
            if (field === 'program') { next.section = null; }
            return next;
        });
    };

    const isComplete = !!(selection.course && selection.dept && selection.program && selection.section);

    const handleConfirm = () => {
        if (!isComplete) return;
        onSuccess({
            subject: selection.course,
            dept:    selection.dept,
            program: selection.program,
            section: selection.section,
        });
    };

    const stepActive = (step) => {
        if (step === 1) return true;
        if (step === 2) return !!selection.course;
        if (step === 3) return !!selection.dept;
        if (step === 4) return !!selection.program;
        return false;
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h3 className="text-gray-800 font-black uppercase italic text-xl tracking-tighter leading-none">
                            Handle New Section
                        </h3>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            Link a class to your dashboard
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">

                        {/* ── STEP 1: Course ── */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#22C55E] text-white flex items-center justify-center text-[9px] font-black">1</span>
                                Course / Subject
                            </label>
                            {/* Search */}
                            <div className="relative mb-2">
                                <span className="absolute inset-y-0 left-3 flex items-center text-gray-300 text-xs">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search code or subject..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-100 focus:border-[#22C55E] rounded-2xl text-[10px] font-bold uppercase tracking-wider outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                            <SelectList
                                items={filteredCourses}
                                value={selection.course?.id}
                                onChange={(item) => handleChange('course', item)}
                                emptyText="No subjects found"
                                renderLabel={(c) => (
                                    <>
                                        <span className="text-[9px] font-black text-[#22C55E] uppercase tracking-widest">{c.course_code}</span>
                                        <span className="text-[11px] font-black text-gray-800 uppercase italic truncate">{c.course_name}</span>
                                    </>
                                )}
                            />
                        </div>

                        {/* ── STEP 2: Department ── */}
                        <div className={`space-y-3 transition-all duration-300 ${!stepActive(2) ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                    stepActive(2) ? 'bg-[#22C55E] text-white' : 'bg-gray-200 text-gray-500'
                                }`}>2</span>
                                Department
                            </label>
                            <SelectList
                                items={availableDepts}
                                value={selection.dept?.id}
                                onChange={(item) => handleChange('dept', item)}
                                emptyText="No departments found"
                                renderLabel={(d) => (
                                    <>
                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{d.abbr}</span>
                                        <span className="text-[11px] font-black text-gray-800 uppercase italic leading-tight">{d.name}</span>
                                    </>
                                )}
                            />
                        </div>

                        {/* ── STEP 3: Program ── */}
                        <div className={`space-y-3 transition-all duration-300 ${!stepActive(3) ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                    stepActive(3) ? 'bg-[#22C55E] text-white' : 'bg-gray-200 text-gray-500'
                                }`}>3</span>
                                Academic Program
                            </label>
                            <SelectList
                                items={availablePrograms}
                                value={selection.program?.id}
                                onChange={(item) => handleChange('program', item)}
                                emptyText={selection.dept ? 'No programs in this department' : 'Select a department first'}
                                renderLabel={(p) => (
                                    <>
                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{p.name}</span>
                                        <span className="text-[10px] font-bold text-gray-600 truncate leading-tight">{p.fullName}</span>
                                    </>
                                )}
                            />
                        </div>

                        {/* ── STEP 4: Section ── */}
                        <div className={`space-y-3 transition-all duration-300 ${!stepActive(4) ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                    stepActive(4) ? 'bg-[#22C55E] text-white' : 'bg-gray-200 text-gray-500'
                                }`}>4</span>
                                Specific Section
                            </label>
                            <SelectList
                                items={availableSections}
                                value={selection.section?.id}
                                onChange={(item) => handleChange('section', item)}
                                emptyText={selection.program ? 'No sections in this program' : 'Select a program first'}
                                renderLabel={(s) => (
                                    <>
                                        <span className="text-[11px] font-black text-gray-800 uppercase italic">{s.name}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">{s.schedule} • {s.room}</span>
                                    </>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-50 bg-white flex flex-col gap-3 shrink-0">
                    {/* Selection summary */}
                    {isComplete && (
                        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-3 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest text-green-700">
                            <span>📚 {selection.course?.course_code}</span>
                            <span>•</span>
                            <span>🏛️ {selection.dept?.abbr}</span>
                            <span>•</span>
                            <span>🎓 {selection.program?.name}</span>
                            <span>•</span>
                            <span>📋 {selection.section?.name}</span>
                        </div>
                    )}
                    <button
                        onClick={handleConfirm}
                        disabled={!isComplete}
                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                            isComplete
                                ? 'bg-[#22C55E] hover:bg-green-600 text-white shadow-green-100'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {isComplete ? '✓ Confirm & Add Section' : 'Complete all 4 steps to continue'}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HandleSectionModal;