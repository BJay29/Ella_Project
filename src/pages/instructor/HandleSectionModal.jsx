import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/APIservice';

// ─────────────────────────────────────────────────────────────────────────────
// Reusable SelectList - Inayos ang Visual Selection (Green Highlight & Check)
// ─────────────────────────────────────────────────────────────────────────────
const SelectList = ({ items, value, onChange, emptyText = 'No items found', renderLabel, isLoading }) => (
    <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {isLoading ? (
            <div className="py-8 text-center">
                <div className="w-6 h-6 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Fetching Data...</p>
            </div>
        ) : !items || items.length === 0 ? (
            <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{emptyText}</p>
            </div>
        ) : (
            items.map((item) => {
             const itemId = item._id || item.id || item.course_id || item.dept_id || item.program_id || Math.random();               
              const isSelected = value && itemId && String(value) === String(itemId);

                return (
                    <button
                 key={itemId || Math.random()}                        
                 type="button"
                        onClick={() => onChange(item)}
                        className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between group text-left ${
                            isSelected
                                ? 'border-[#22C55E] bg-green-50 shadow-sm' // Green style kapag selected
                                : 'border-gray-100 bg-white hover:border-gray-300'
                        }`}
                    >
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            {renderLabel(item)}
                        </div>
                        
                        {/* Visual Indicator: Checkmark (Green) o Plus (Gray) */}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2 text-[10px] font-black transition-all ${
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

    const token = localStorage.getItem('token') || null;

    if (!token) {
    console.error("❌ No token found. Please login again.");
    return;
}
   
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

    // STEP 1: Fetch Courses
    useEffect(() => {
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

    // STEP 2: Fetch Departments based on Course
useEffect(() => {
    const courseId =
        selection.course?.course_id ||
        selection.course?._id ||
        selection.course?.id;

    console.log("SELECTED COURSE:", selection.course);
    console.log("COURSE ID:", courseId);

    if (!courseId) {
        console.log("NO COURSE ID, RESETTING...");
        setLists(p => ({ ...p, depts: [], programs: [], sections: [] }));
        return;
    }

    const fetchDepts = async () => {
        setLoading(p => ({ ...p, depts: true }));

        try {
            console.log("CALLING API...");

            const res = await authAPI.getInstructorDepartments(courseId, token);

            console.log("RAW RESPONSE:", res);

            if (res.ok) {
                const data = await res.json();

                console.log("DEPT RESPONSE:", data);

                setLists(p => ({
                    ...p,
                    depts: data?.departments || data?.data || data || []
                }));
            } else {
                console.error("API ERROR:", res.status);
            }

        } catch (err) {
            console.error("FETCH ERROR:", err);
        } finally {
            setLoading(p => ({ ...p, depts: false }));
        }
    };

    fetchDepts();
}, [selection.course, token]);
    
// STEP 3: Fetch Programs based on Course & Dept
  useEffect(() => {
    const courseId =
        selection.course?.course_id ||
        selection.course?._id ||
        selection.course?.id;

    const deptId =
        selection.dept?.dept_id ||
        selection.dept?._id ||
        selection.dept?.id;

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

                setLists(p => ({
                    ...p,
                    programs: data?.programs || data?.data || data || []
                }));
            }
        } catch (err) {
            console.error("Fetch programs error:", err);
        } finally {
            setLoading(p => ({ ...p, programs: false }));
        }
    };

    fetchPrograms();
}, [selection.dept, token]);
    // STEP 4: Fetch Sections based on Program
  useEffect(() => {
    const courseId =
        selection.course?.course_id ||
        selection.course?._id ||
        selection.course?.id;

    const deptId =
        selection.dept?.dept_id ||
        selection.dept?._id ||
        selection.dept?.id;

    const programId =
        selection.program?.program_id ||
        selection.program?._id ||
        selection.program?.id;

    if (!courseId || !deptId || !programId) {
        setLists(p => ({ ...p, sections: [] }));
        return;
    }

    const fetchSections = async () => {
        setLoading(p => ({ ...p, sections: true }));

        try {
            const res = await authAPI.getInstructorSectionsByProgram(
                courseId,
                deptId,
                programId,
                token
            );

            if (res.ok) {
                const data = await res.json();

                setLists(p => ({
                    ...p,
                    sections: data?.sections || data?.data || data || []
                }));
            }
        } catch (err) {
            console.error("Fetch sections error:", err);
        } finally {
            setLoading(p => ({ ...p, sections: false }));
        }
    };

    fetchSections();
}, [selection.program, token]);
    const handleChange = (field, item) => {
        const itemId = item?._id || item?.id;
        setSelection(prev => {
            const prevId = prev[field]?._id || prev[field]?.id;
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
        if (!(selection.course && selection.dept && selection.program && selection.section)) return;
        setIsSubmitting(true);

        const cardData = {
            id: selection.section._id || selection.section.id,
            course_name: selection.course.course_name,
            course_code: selection.course.course_code,
            dept_abbr: selection.dept.dept_abbr || selection.dept.abbreviation || 'DEPT',
            program_abbr: selection.program.program_abbr || selection.program.abbreviation || 'PROG',
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

    const stepActive = (step) => {
        if (step === 1) return true;
        if (step === 2) return !!selection.course;
        if (step === 3) return !!selection.dept;
        if (step === 4) return !!selection.program;
        return false;
    };

    const stepLabel = (num, colorClass) => (
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
            stepActive(num) ? `${colorClass} text-white` : 'bg-gray-200 text-gray-500'
        }`}>{num}</span>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h3 className="text-gray-800 font-black uppercase italic text-2xl tracking-tighter leading-none">Handle New Section</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Select from the curriculum to view section</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">✕</button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        
                        {/* 1. COURSE */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                {stepLabel(1, 'bg-[#22C55E]')} Course / Subject
                            </label>
                            <input
                                type="text"
                                placeholder="Search code or subject..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-5 py-3.5 bg-white border-2 border-gray-100 focus:border-[#22C55E] rounded-2xl text-[11px] font-bold uppercase outline-none shadow-sm"
                            />
                            <SelectList
                                items={filteredCourses}
                                isLoading={loading.courses}
                                value={selection.course?._id || selection.course?.id}
                                onChange={(item) => handleChange('course', item)}
                                renderLabel={(c) => (
                                    <>
                                        <span className="text-[9px] font-black text-[#22C55E] uppercase tracking-widest">{c.course_code}</span>
                                        <span className="text-[12px] font-black text-gray-800 uppercase italic truncate">{c.course_name}</span>
                                    </>
                                )}
                            />
                        </div>

                        {/* 2. DEPARTMENT */}
                        <div className={`space-y-4 ${!stepActive(2) ? 'opacity-30 pointer-events-none' : ''}`}>
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                {stepLabel(2, 'bg-indigo-500')} Department
                            </label>
                            <SelectList
                                items={lists.depts}
                                isLoading={loading.depts}
                                value={selection.dept?._id || selection.dept?.id}
                                onChange={(item) => handleChange('dept', item)}
                                emptyText={selection.course ? "No departments found" : "Select a course first"}
                                renderLabel={(d) => (
                                    <>
                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{d.dept_abbr || d.abbreviation || 'DEPT'}</span>
                                        <span className="text-[12px] font-black text-gray-800 uppercase italic"> {d.department_name || d.dept_name || d.name}</span>
                                    </>
                                )}
                            />
                        </div>

                        {/* 3. PROGRAM */}
                        <div className={`space-y-4 ${!stepActive(3) ? 'opacity-30 pointer-events-none' : ''}`}>
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                {stepLabel(3, 'bg-amber-500')} Academic Program
                            </label>
                            <SelectList
                                items={lists.programs}
                                isLoading={loading.programs}
                                value={selection.program?._id || selection.program?.id}
                                onChange={(item) => handleChange('program', item)}
                                emptyText={selection.dept ? "No programs found" : "Select a department first"}
                                renderLabel={(p) => (
                                    <>
                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{p.program_abbr || p.abbreviation || 'PROG'}</span>
                                        <span className="text-[11px] font-bold text-gray-700 uppercase truncate">{p.program_name || p.name}</span>
                                    </>
                                )}
                            />
                        </div>

                        {/* 4. SECTION */}
                        <div className={`space-y-4 ${!stepActive(4) ? 'opacity-30 pointer-events-none' : ''}`}>
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                {stepLabel(4, 'bg-rose-500')} Specific Section
                            </label>
                            <SelectList
                                items={lists.sections}
                                isLoading={loading.sections}
                                value={selection.section?._id || selection.section?.id}
                                onChange={(item) => handleChange('section', item)}
                                emptyText={selection.program ? "No sections found" : "Select a program first"}
                                renderLabel={(s) => (
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-black text-gray-800 uppercase italic">{s.section_name || s.name}</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase">{s.semester} • {s.school_year}</span>
                                        </div>
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-black">{s.section_code || s.code}</span>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-50 bg-white shrink-0">
                    <button
                        onClick={handleConfirm}
                        disabled={!selection.section || isSubmitting}
                        className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] transition-all shadow-xl active:scale-95 ${
                            selection.section && !isSubmitting
                                ? 'bg-[#22C55E] text-white hover:bg-green-600 shadow-green-100'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? 'Saving to Database...' : selection.section ? '✓ Confirm Selection' : 'Complete all steps to continue'}
                    </button>
                    <button onClick={onClose} className="w-full mt-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">Cancel</button>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default HandleSectionModal;