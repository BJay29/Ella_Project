import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/APIservice';

// ─────────────────────────────────────────────────────────────────────────────
// Reusable SelectList - Updated Visual Selection
// ─────────────────────────────────────────────────────────────────────────────
const SelectList = ({ items, value, onChange, emptyText = 'No items found', renderLabel, isLoading }) => (
    <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {isLoading ? (
            <div className="py-6 text-center">
                <div className="w-5 h-5 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Fetching Data...</p>
            </div>
        ) : !items || items.length === 0 ? (
            <div className="py-6 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{emptyText}</p>
            </div>
        ) : (
            items.map((item) => {
                const itemId =
                    item._id ||
                    item.id ||
                    item.course_id ||
                    item.dept_id ||
                    item.program_id ||
                    item.section_id;
                
                const isSelected = value && itemId && String(value) === String(itemId);
                
                return (
                    <button
                        key={itemId || Math.random()}
                        type="button"
                        onClick={() => onChange(item)}
                        className={`w-full p-2.5 rounded-xl border-2 transition-all flex items-center justify-between group text-left ${
                            isSelected
                                ? 'border-[#22C55E] bg-green-50 shadow-sm' 
                                : 'border-gray-100 bg-white hover:border-gray-300'
                        }`}
                    >
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            {renderLabel(item)}
                        </div>
                        
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ml-2 text-[8px] font-black transition-all ${
                            isSelected ? 'bg-[#22C55E] text-white scale-110' : 'bg-gray-100 text-gray-400'
                        }`}>
                            {isSelected ? '✓' : '+'}
                        </div>
                    </button>
                );
            })
        )}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────────────────────────────────────
const HandleSectionModal = ({ onClose, onSuccess }) => {
    const [selection, setSelection] = useState({
        course: null, dept: null, program: null, section: null
    });

    const [lists, setLists] = useState({
        courses: [], depts: [], programs: [], sections: []
    });

    const [loading, setLoading] = useState({
        courses: false, depts: false, programs: false, sections: false
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const token = localStorage.getItem('token') || null;

    const isComplete =
        selection.course &&
        selection.dept &&
        selection.program &&
        selection.section;

    // STEP 1: Fetch Courses
    useEffect(() => {
        if (!token) return;
        const fetchCourses = async () => {
            setLoading(p => ({ ...p, courses: true }));
            try {
                const res = await authAPI.getInstructorCourses(token);
                if (res.ok) {
                    const data = await res.json();
                    setLists(p => ({ ...p, courses: Array.isArray(data) ? data : (data.courses || []) }));
                }
            } catch (err) { console.error('Fetch courses error:', err); }
            setLoading(p => ({ ...p, courses: false }));
        };
        fetchCourses();
    }, [token]);

    // STEP 2: Fetch Departments
    useEffect(() => {
        const courseId = selection.course?.course_id || selection.course?._id || selection.course?.id;
        if (!courseId) {
            setLists(p => ({ ...p, depts: [], programs: [], sections: [] }));
            return;
        }
        const fetchDepts = async () => {
            setLoading(p => ({ ...p, depts: true }));
            try {
                const res = await authAPI.getInstructorDepartments(courseId, token);
                if (res.ok) {
                    const data = await res.json();
                    const deptsData = data?.departments || data?.data || data || [];
                    console.log("Department Data Received:", deptsData);
                    setLists(p => ({ ...p, depts: deptsData }));
                }
            } catch (err) { console.error("FETCH ERROR:", err); }
            setLoading(p => ({ ...p, depts: false }));
        };
        fetchDepts();
    }, [selection.course, token]);
    
    // STEP 3: Fetch Programs
    useEffect(() => {
        const courseId = selection.course?.course_id || selection.course?._id || selection.course?.id;
        const deptId = selection.dept?.dept_id || selection.dept?._id || selection.dept?.id;
        if (!courseId || !deptId) {
            setLists(p => ({ ...p, programs: [], sections: [] }));
            return;
        }
        const fetchPrograms = async () => {
            setLoading(p => ({ ...p, programs: true }));
            try {
                const res = await authAPI.getInstructorPrograms(courseId, deptId, token);
                if (res.ok) {
                    const data = await res.json();
                    setLists(p => ({ ...p, programs: data?.programs || data?.data || data || [] }));
                }
            } catch (err) { console.error("Fetch programs error:", err); }
            setLoading(p => ({ ...p, programs: false }));
        };
        fetchPrograms();
    }, [selection.dept, token]);

    // STEP 4: Fetch Sections
    useEffect(() => {
        const courseId = selection.course?.course_id || selection.course?._id || selection.course?.id;
        const deptId = selection.dept?.dept_id || selection.dept?._id || selection.dept?.id;
        const programId = selection.program?.program_id || selection.program?._id || selection.program?.id;
        if (!courseId || !deptId || !programId) {
            setLists(p => ({ ...p, sections: [] }));
            return;
        }
        const fetchSections = async () => {
            setLoading(p => ({ ...p, sections: true }));
            try {
                const res = await authAPI.getInstructorSectionsByProgram(courseId, deptId, programId, token);
                if (res.ok) {
                    const data = await res.json();
                    setLists(p => ({ ...p, sections: data?.sections || data?.data || data || [] }));
                }
            } catch (err) { console.error("Fetch sections error:", err); }
            setLoading(p => ({ ...p, sections: false }));
        };
        fetchSections();
    }, [selection.program, token]);

    const handleChange = (field, item) => {
        const itemId = item?._id || item?.id || item?.course_id || item?.dept_id || item?.program_id || item?.section_id;
        setSelection(prev => {
            const prevId = prev[field]?._id || prev[field]?.id || prev[field]?.course_id || prev[field]?.dept_id || prev[field]?.program_id || prev[field]?.section_id;
            const isUnselecting = prevId && itemId && String(prevId) === String(itemId);
            const newValue = isUnselecting ? null : item;
            const next = { ...prev, [field]: newValue };
            if (field === 'course') { next.dept = null; next.program = null; next.section = null; }
            else if (field === 'dept') { next.program = null; next.section = null; }
            else if (field === 'program') { next.section = null; }
            return next;
        });
    };

    const handleConfirm = () => {
        if (!isComplete) return;
        setIsSubmitting(true);
        
        const finalDeptAbbr = 
            selection.dept.dept_code || 
            selection.dept.code || 
            selection.dept.dept_abbr || 
            selection.dept.abbreviation || 
            (selection.dept.department_name ? selection.dept.department_name.substring(0, 4).toUpperCase() : 'DEPT');

        const finalProgAbbr = 
            selection.program.program_code || 
            selection.program.program_abbr || 
            selection.program.abbreviation || 
            'PROG';

        const cardData = {
            id: selection.section._id || selection.section.id || selection.section.section_id,
            course_name: selection.course.course_name,
            course_code: selection.course.course_code,
            dept_abbr: finalDeptAbbr,
            program_abbr: finalProgAbbr,
            section_name: selection.section.section_name || selection.section.name,
            section_code: selection.section.section_code || selection.section.code,
            semester: selection.section.semester,
            school_year: selection.section.school_year
        };
        onSuccess(cardData);
        onClose();
    };

    const filteredCourses = lists.courses.filter(c => {
        const term = searchTerm.toLowerCase();
        return (c.course_name || '').toLowerCase().includes(term) || (c.course_code || '').toLowerCase().includes(term);
    });

    const stepActive = (num) => {
        if (num === 1) return true;
        if (num === 2) return !!selection.course;
        if (num === 3) return !!selection.dept;
        if (num === 4) return !!selection.program;
        return false;
    };

    const stepLabel = (num, colorClass) => {
        const active = stepActive(num);
        return (
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
                active ? `${colorClass} text-white scale-110 shadow-md` : 'bg-gray-200 text-gray-500'
            }`}>
                {active ? '✓' : num}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative bg-white w-full max-w-5xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[95vh] animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h3 className="text-gray-800 font-black uppercase italic text-xl tracking-tighter leading-none">Handle New Section</h3>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Select from the curriculum to view section</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">✕</button>
                </div>

                {/* Body */}
                <div className="px-8 py-4 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        
                        {/* 1. COURSE */}
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                {stepLabel(1, 'bg-[#22C55E]')} Course / Subject
                            </label>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border-2 border-gray-100 focus:border-[#22C55E] rounded-xl text-[10px] font-bold uppercase outline-none shadow-sm"
                            />
                            <SelectList
                                items={filteredCourses}
                                isLoading={loading.courses}
                                value={selection.course?._id || selection.course?.id || selection.course?.course_id}
                                onChange={(item) => handleChange('course', item)}
                                renderLabel={(c) => (
                                    <>
                                        <span className="text-[8px] font-black text-[#22C55E] uppercase tracking-widest">{c.course_code}</span>
                                        <span className="text-[11px] font-black text-gray-800 uppercase italic truncate">{c.course_name}</span>
                                    </>
                                )}
                            />
                        </div>

                        {/* 2. DEPARTMENT */}
                        <div className={`space-y-3 ${!stepActive(2) ? 'opacity-30 pointer-events-none' : ''}`}>
                            <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                {stepLabel(2, 'bg-indigo-500')} Department
                            </label>
                            <SelectList
                                items={lists.depts}
                                isLoading={loading.depts}
                                value={selection.dept?._id || selection.dept?.id || selection.dept?.dept_id}
                                onChange={(item) => handleChange('dept', item)}
                                emptyText="Select a course first"
                                renderLabel={(d) => (
                                    <>
                                        <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">
                                            {/* Mapping for dept_code from your logs */}
                                            {d.dept_code || d.code || d.dept_abbr || d.abbreviation || 'DEPT'}
                                        </span>
                                        <span className="text-[11px] font-black text-gray-800 uppercase italic truncate">
                                            {d.department_name || d.dept_name || d.name}
                                        </span>
                                    </>
                                )}
                            />
                        </div>

                        {/* 3. PROGRAM */}
                        <div className={`space-y-3 ${!stepActive(3) ? 'opacity-30 pointer-events-none' : ''}`}>
                            <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                {stepLabel(3, 'bg-amber-500')} Academic Program
                            </label>
                            <SelectList
                                items={lists.programs}
                                isLoading={loading.programs}
                                value={selection.program?._id || selection.program?.id || selection.program?.program_id}
                                onChange={(item) => handleChange('program', item)}
                                emptyText="Select a department first"
                                renderLabel={(p) => (
                                    <>
                                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">
                                            {p.program_code || p.program_abbr || p.abbreviation || 'PROG'}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-700 uppercase truncate">
                                            {p.program_name || p.name}
                                        </span>
                                    </>
                                )}
                            />
                        </div>

                        {/* 4. SECTION */}
                        <div className={`space-y-3 ${!stepActive(4) ? 'opacity-30 pointer-events-none' : ''}`}>
                            <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                {stepLabel(4, 'bg-rose-500')} Specific Section
                            </label>
                            <SelectList
                                items={lists.sections}
                                isLoading={loading.sections}
                                value={selection.section?._id || selection.section?.id || selection.section?.section_id}
                                onChange={(item) => handleChange('section', item)}
                                emptyText="Select a program first"
                                renderLabel={(s) => (
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-gray-800 uppercase italic">{s.section_name || s.name}</span>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase">{s.semester} • {s.school_year}</span>
                                        </div>
                                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[8px] font-black">{s.section_code || s.code}</span>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Path Selection Summary */}
                    {(selection.course || selection.dept || selection.program || selection.section) && (
                        <div className="mt-6 p-5 rounded-[1.5rem] bg-white border-2 border-slate-100 shadow-sm animate-in slide-in-from-bottom-4">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Current Selection Path</p>
                            <div className="flex flex-wrap items-center gap-2">
                                {selection.course && (
                                    <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-[9px] font-black border border-green-100">
                                        {selection.course.course_code}
                                    </span>
                                )}
                                {selection.dept && (
                                    <>
                                        <span className="text-slate-300 text-[10px]">→</span>
                                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-black border border-indigo-100">
                                            {selection.dept.dept_code || selection.dept.code || selection.dept.dept_abbr || selection.dept.abbreviation || 'DEPT'}
                                        </span>
                                    </>
                                )}
                                {selection.program && (
                                    <>
                                        <span className="text-slate-300 text-[10px]">→</span>
                                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-black border border-amber-100">
                                            {selection.program.program_code || selection.program.program_abbr || selection.program.abbreviation}
                                        </span>
                                    </>
                                )}
                                {selection.section && (
                                    <>
                                        <span className="text-slate-300 text-[10px]">→</span>
                                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-[9px] font-black border border-rose-100">
                                            {selection.section.section_name || selection.section.name}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-50 bg-white shrink-0">
                    <button
                        onClick={handleConfirm}
                        disabled={!selection.section || isSubmitting}
                        className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                            selection.section && !isSubmitting
                                ? 'bg-[#22C55E] text-white hover:bg-green-600 shadow-green-100'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? 'Saving...' : selection.section ? '✓ Confirm Selection' : 'Complete all steps'}
                    </button>
                    <button onClick={onClose} className="w-full mt-2 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">Cancel</button>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default HandleSectionModal;