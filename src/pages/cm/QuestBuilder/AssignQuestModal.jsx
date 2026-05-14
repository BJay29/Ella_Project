import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';

const AssignQuestModal = ({ isOpen, onClose, quest, onSuccess }) => {
    // --- Data States ---
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [sections, setSections] = useState([]);
    const [courses, setCourses] = useState([]);

    // --- Selection States ---
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [selectedYearId, setSelectedYearId] = useState('');
    const [selectedSectionIds, setSelectedSectionIds] = useState([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);

    // --- UI & Feedback States ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState({
        depts: false, programs: false, years: false, sections: false, courses: false
    });

    // Reset states and fetch initial data when modal opens
    useEffect(() => {
        if (isOpen) {
            resetAll();
            fetchDepartments();
        }
    }, [isOpen]);

    // Cascade 1: Fetch Programs when Department changes
    useEffect(() => {
        if (selectedDeptId) {
            fetchProgramsByDept(selectedDeptId);
        } else {
            setPrograms([]);
        }
        setSelectedProgramId('');
        setSelectedYearId('');
        setSelectedSectionIds([]);
    }, [selectedDeptId]);

    // Cascade 2: Fetch Year Levels when Program changes
    useEffect(() => {
        if (selectedProgramId && selectedDeptId) {
            fetchYearLevelsByProgram(selectedDeptId, selectedProgramId);
        } else {
            setYearLevels([]);
        }
        setSelectedYearId('');
        setSelectedSectionIds([]);
    }, [selectedProgramId, selectedDeptId]);

    // Cascade 3: Fetch Sections when Year Level changes
    useEffect(() => {
        if (selectedYearId && selectedProgramId && selectedDeptId) {
            fetchSectionsByYear(selectedDeptId, selectedProgramId, selectedYearId);
        } else {
            setSections([]);
        }
        setSelectedSectionIds([]);
    }, [selectedYearId, selectedProgramId, selectedDeptId]);

    // Cascade 4: Fetch Courses when Sections are toggled
    useEffect(() => {
        if (selectedSectionIds.length > 0) {
            fetchAllCoursesForSelectedSections();
        } else {
            setCourses([]);
            setSelectedCourseIds([]);
        }
    }, [selectedSectionIds]);

    const resetAll = () => {
        setSelectedDeptId('');
        setSelectedProgramId('');
        setSelectedYearId('');
        setSelectedSectionIds([]);
        setSelectedCourseIds([]);
        setDepartments([]);
        setPrograms([]);
        setYearLevels([]);
        setSections([]);
        setCourses([]);
    };

    // --- API Fetching Logic ---

    const fetchDepartments = async () => {
        setLoading(prev => ({ ...prev, depts: true }));
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getAllDepartments(token);
            if (res.ok) {
                const result = await res.json();
                const data = result.departments || result.data || result;
                setDepartments(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Dept Fetch Error:", err);
            setDepartments([]);
        } finally {
            setLoading(prev => ({ ...prev, depts: false }));
        }
    };

    const fetchProgramsByDept = async (deptId) => {
        setLoading(prev => ({ ...prev, programs: true }));
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getProgramsByDept(deptId, token);
            if (res.ok) {
                const result = await res.json();
                const data = result.programs || result.data || result;
                setPrograms(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            setPrograms([]);
        } finally {
            setLoading(prev => ({ ...prev, programs: false }));
        }
    };

    const fetchYearLevelsByProgram = async (deptId, progId) => {
        setLoading(prev => ({ ...prev, years: true }));
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getYearLevelsByProgram(deptId, progId, token);
            if (res.ok) {
                const result = await res.json();
                // Ensure we capture the array regardless of the key returned by backend
                const data = result.year_levels || result.yearLevels || result.data || result;
                setYearLevels(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Year Level Fetch Error:", err);
            setYearLevels([]);
        } finally {
            setLoading(prev => ({ ...prev, years: false }));
        }
    };

    const fetchSectionsByYear = async (deptId, progId, yearId) => {
        setLoading(prev => ({ ...prev, sections: true }));
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getSectionsByYear(deptId, progId, yearId, token);
            if (res.ok) {
                const result = await res.json();
                const data = result.sections || result.data || result;
                setSections(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            setSections([]);
        } finally {
            setLoading(prev => ({ ...prev, sections: false }));
        }
    };

    const fetchAllCoursesForSelectedSections = async () => {
        setLoading(prev => ({ ...prev, courses: true }));
        try {
            const token = localStorage.getItem('token');
            const coursePromises = selectedSectionIds.map(secId =>
                authAPI.getCoursesBySection(selectedDeptId, selectedProgramId, selectedYearId, secId, token)
            );

            const responses = await Promise.all(coursePromises);
            let allCourses = [];

            for (const res of responses) {
                if (res.ok) {
                    const result = await res.json();
                    const courseList = result.courses || result.data || result;
                    allCourses = [...allCourses, ...(Array.isArray(courseList) ? courseList : [])];
                }
            }

            // Deduplicate courses using 'course_id' as the unique key
            const uniqueCourses = Array.from(new Map(allCourses.map(item => [item.course_id, item])).values());
            setCourses(uniqueCourses);
        } catch (err) {
            console.error("Course Batch Fetch Error:", err);
            setCourses([]);
        } finally {
            setLoading(prev => ({ ...prev, courses: false }));
        }
    };

    // --- Interaction Handlers ---

    const toggleSelection = (id, list, setList) => {
        const numericId = Number(id);
        setList(prev => prev.includes(numericId) ? prev.filter(i => i !== numericId) : [...prev, numericId]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedCourseIds.length === 0) return alert("Please select at least one course.");

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const questId = quest?.quest_id || quest?.id;

            const response = await authAPI.assignQuestToCourses(questId, selectedCourseIds, token);

            if (response.ok) {
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    if (onSuccess) onSuccess();
                    onClose();
                }, 2500);
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to assign'}`);
            }
        } catch (err) {
            alert("Network error. Failed to assign quest.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            
            {showToast && (
                <div className="fixed top-5 right-5 z-[200] bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
                    <span className="text-xl">✅</span>
                    <div>
                        <p className="font-black uppercase text-xs italic">Success!</p>
                        <p className="text-[10px] font-bold opacity-90 uppercase">Quest assigned successfully.</p>
                    </div>
                </div>
            )}

            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300">
                
                {/* Modal Header */}
                <div className="bg-indigo-600 p-8 text-white relative">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Assign Quest</h3>
                    <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mt-1">Hierarchical Selection</p>
                    <button type="button" onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar">
                    
                    <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

                    {/* Step 1: Department Selection */}
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Step 1: Department</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none"
                            value={selectedDeptId} 
                            onChange={(e) => setSelectedDeptId(e.target.value)}
                        >
                            <option value="">{loading.depts ? 'Loading...' : 'Select Department'}</option>
                            {departments.map(d => (
                                <option key={d.dept_id} value={d.dept_id}>
                                    {d.department_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Step 2 & 3: Program & Year Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Step 2: Program</label>
                            <select 
                                disabled={!selectedDeptId || loading.programs}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-black disabled:opacity-50 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                value={selectedProgramId} 
                                onChange={(e) => setSelectedProgramId(e.target.value)}
                            >
                                <option value="">{loading.programs ? 'Loading...' : 'Select Program'}</option>
                                {programs.map(p => (
                                    <option key={p.program_id} value={p.program_id}>
                                        {p.program_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Step 3: Year Level</label>
                            <select 
                                disabled={!selectedProgramId || loading.years}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-black disabled:opacity-50 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                value={selectedYearId} 
                                onChange={(e) => setSelectedYearId(e.target.value)}
                            >
                                <option value="">{loading.years ? 'Loading' : 'Select Year Level'}</option>
                                {yearLevels.map(y => (
                                    <option key={y.year_level_id} value={y.year_level_id}>
                                        {/* Added fallbacks for different property names */}
                                        {y.year_level || y.year_name || `Year ${y.year_level_id}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Step 4: Multi-Select Sections */}
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Step 4: Select Sections</label>
                        <div className="flex flex-wrap gap-2">
                            {sections.length === 0 ? (
                                <p className="text-[10px] italic text-slate-300 uppercase py-2">
                                    {loading.sections ? 'Loading...' : 'Select Year Level first'}
                                </p>
                            ) : (
                                sections.map(s => (
                                    <button
                                        key={s.section_id}
                                        type="button"
                                        onClick={() => toggleSelection(s.section_id, selectedSectionIds, setSelectedSectionIds)}
                                        className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase border-2 transition-all ${
                                            selectedSectionIds.includes(Number(s.section_id)) 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                                            : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
                                        }`}
                                    >
                                        {s.section_name}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Step 5: Grouped Course Selection */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 block">Step 5: Select Courses per Section</label>
                        <div className="space-y-6 bg-slate-50 rounded-[28px] p-5 border border-slate-100">
                            {selectedSectionIds.length === 0 ? (
                                <p className="text-center py-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Awaiting section selection...</p>
                            ) : (
                                selectedSectionIds.map(secId => {
                                    const section = sections.find(s => Number(s.section_id) === Number(secId));
                                    const filteredCourses = courses.filter(c => Number(c.section_id) === Number(secId));

                                    return (
                                        <div key={secId} className="space-y-2">
                                            <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-tighter ml-1">
                                                Section: {section?.section_name || 'Loading...'}
                                            </h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {loading.courses ? (
                                                    <p className="text-[9px] text-slate-400 animate-pulse ml-1">Fetching Courses...</p>
                                                ) : filteredCourses.length > 0 ? (
                                                    filteredCourses.map(c => (
                                                        <div 
                                                            key={c.course_id} 
                                                            onClick={() => toggleSelection(c.course_id, selectedCourseIds, setSelectedCourseIds)}
                                                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                                                                selectedCourseIds.includes(Number(c.course_id)) 
                                                                ? 'bg-white border-indigo-500 shadow-md ring-4 ring-indigo-50' 
                                                                : 'bg-white/60 border-transparent hover:border-slate-200'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-black text-black uppercase leading-none">{c.course_name}</span>
                                                                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{c.course_code}</span>
                                                            </div>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={selectedCourseIds.includes(Number(c.course_id))}
                                                                readOnly
                                                                className="w-5 h-5 rounded-lg border-2 border-slate-200 checked:bg-indigo-600"
                                                            />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[9px] text-slate-400 italic ml-1">No courses found for this section.</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex gap-4 pt-4 pb-2">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || selectedCourseIds.length === 0}
                            className="flex-1 py-4 text-[11px] font-black uppercase bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 transition-all"
                        >
                            {isSubmitting ? 'Assigning...' : 'Confirm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignQuestModal;