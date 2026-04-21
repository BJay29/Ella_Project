import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';

const AssignQuestModal = ({ isOpen, onClose, quest, onSuccess }) => {
    // States for Data
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [sections, setSections] = useState([]);

    // States for Selections
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [selectedSectionIds, setSelectedSectionIds] = useState([]);

    // Loading & UI States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Error States
    const [courseError, setCourseError] = useState('');
    const [deptError, setDeptError] = useState('');
    const [programError, setProgramError] = useState('');
    const [sectionError, setSectionError] = useState('');

    // Triggered when modal opens
    useEffect(() => {
        if (isOpen) {
            resetAll();
            fetchCourses();
        }
    }, [isOpen]);

    // Step 1: When Course changes
    useEffect(() => {
        if (selectedCourseId) {
            setSelectedDeptId('');
            setSelectedProgramId('');
            setDepartments([]);
            setPrograms([]);
            setSections([]);
            setSelectedSectionIds([]);
            setDeptError('');
            fetchDepartmentsByCourse(selectedCourseId);
        }
    }, [selectedCourseId]);

    // Step 2: When Department changes
    useEffect(() => {
        if (selectedDeptId) {
            setSelectedProgramId('');
            setPrograms([]);
            setSections([]);
            setSelectedSectionIds([]);
            setProgramError('');
            fetchProgramsByDept(selectedDeptId);
        }
    }, [selectedDeptId]);

    // Step 3: When Program changes
    useEffect(() => {
        if (selectedProgramId) {
            setSections([]);
            setSelectedSectionIds([]);
            setSectionError('');
            fetchSectionsByProgram(selectedProgramId);
        }
    }, [selectedProgramId]);

    const resetAll = () => {
        setSelectedCourseId('');
        setSelectedDeptId('');
        setSelectedProgramId('');
        setSelectedSectionIds([]);
        setCourses([]);
        setDepartments([]);
        setPrograms([]);
        setSections([]);
        setCourseError('');
        setDeptError('');
        setProgramError('');
        setSectionError('');
    };

    // --- API FETCHERS ---

    const fetchCourses = async () => {
        setLoadingCourses(true);
        setCourseError('');
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getAllCoursesAssign(token); 
            if (res.ok) {
                const rawData = await res.json();
                const arr = Array.isArray(rawData) ? rawData : (rawData.courses || rawData.data || []);
                setCourses(arr.map(c => ({
                    id: c.course_id || c.id,
                    name: c.course_name || c.name || 'Unknown Course'
                })));
            } else {
                setCourseError(`Error loading courses (${res.status})`);
            }
        } catch (err) {
            setCourseError('Connection error loading courses.');
            console.error(err);
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchDepartmentsByCourse = async (courseId) => {
        setLoadingDepartments(true);
        setDeptError('');
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getDepartmentsByCourse(courseId, token); 
            if (res.ok) {
                const rawData = await res.json();
                const arr = Array.isArray(rawData) ? rawData : (rawData.departments || rawData.data || []);
                setDepartments(arr.map(d => ({
                    id: d.dept_id || d.department_id || d.id,
                    name: d.department_name || d.dept_name || d.name || 'Unknown'
                })));
            } else {
                setDeptError('Error loading departments.');
            }
        } catch (err) {
            setDeptError('Connection error.');
        } finally {
            setLoadingDepartments(false);
        }
    };

    const fetchProgramsByDept = async (deptId) => {
        setLoadingPrograms(true);
        setProgramError('');
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getProgramsByDept(deptId, token);
            if (res.ok) {
                const rawData = await res.json();
                const arr = Array.isArray(rawData) ? rawData : (rawData.programs || rawData.data || []);
                setPrograms(arr.map(p => ({
                    id: p.program_id || p.id,
                    name: p.program_name || p.name || 'Unknown'
                })));
            } else {
                setProgramError('Error loading programs.');
            }
        } catch (err) {
            setProgramError('Connection error.');
        } finally {
            setLoadingPrograms(false);
        }
    };

    const fetchSectionsByProgram = async (programId) => {
        setLoadingSections(true);
        setSectionError('');
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getSectionsByProgramId(programId, token);
            if (res.ok) {
                const rawData = await res.json();
                const arr = Array.isArray(rawData) ? rawData : (rawData.sections || rawData.data || []);
                setSections(arr);
            } else {
                setSectionError('Error loading sections.');
            }
        } catch (err) {
            setSectionError('Connection error.');
        } finally {
            setLoadingSections(false);
        }
    };

    // --- UI HELPERS ---

    const toggleSection = (sectionId) => {
        setSelectedSectionIds(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const selectAll = () => {
        if (selectedSectionIds.length === sections.length && sections.length > 0) {
            setSelectedSectionIds([]);
        } else {
            setSelectedSectionIds(sections.map(s => s.section_id || s.id));
        }
    };

    // --- SUBMIT HANDLER ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSectionIds.length) return alert('Please select at least one section.');

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const questId = quest?.quest_id || quest?.id;

            // 1. Publishing Logic: publish the quest if not yet published
            if (quest?.status !== 'published') {
                const publishRes = await authAPI.toggleQuestPublish(questId, token);
                if (!publishRes.ok) {
                    const pubErr = await publishRes.json().catch(() => ({}));
                    throw new Error(pubErr.message || 'Failed to publish quest. Please try again.');
                }
            }
            
            // 2. Assignment Logic
            const response = await authAPI.assignQuestToSection(
                questId, 
                selectedSectionIds, 
                token
            );

            if (response.ok) {
                setShowToast(true);
                setTimeout(() => {
                    if (onSuccess) onSuccess(); 
                    setShowToast(false);
                    onClose(); 
                }, 2000);
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message || 'Assignment failed. The quest might already be assigned to these sections.');
            }
        } catch (err) {
            console.error("Submit Error:", err);
            alert(err.message || 'An error occurred during assignment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* --- SUCCESS TOAST (TOP RIGHT) --- */}
            {showToast && (
                <div className="fixed top-5 right-5 z-[200] animate-in slide-in-from-right duration-300">
                    <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-b-4 border-emerald-700">
                        <div className="bg-white/20 p-2 rounded-full">
                            <span className="text-xl">✓</span>
                        </div>
                        <div>
                            <p className="font-black text-[11px] uppercase tracking-tighter italic">Success!</p>
                            <p className="text-[10px] font-bold opacity-90">Quest published & assigned.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-indigo-600 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter italic">Assign Quest</h3>
                                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mt-1">
                                    Link this quest to specific sections
                                </p>
                            </div>
                            <button onClick={onClose} className="text-white/50 hover:text-white font-bold text-xl transition-colors">✕</button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">

                        {/* Step 1: Course */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                                Step 1: Select Course
                            </label>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                disabled={loadingCourses}
                                required
                            >
                                <option value="" disabled className="text-gray-400">{loadingCourses ? 'Loading...' : 'Choose a course...'}</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id} className="text-gray-900">{course.name}</option>
                                ))}
                            </select>
                            {courseError && <p className="text-[9px] text-red-500 mt-1 font-bold">{courseError}</p>}
                        </div>

                        {/* Step 2: Department */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                                Step 2: Select Department
                            </label>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={selectedDeptId}
                                onChange={(e) => setSelectedDeptId(e.target.value)}
                                disabled={!selectedCourseId || loadingDepartments}
                                required
                            >
                                <option value="" disabled className="text-gray-400">
                                    {!selectedCourseId ? 'Select course first' : loadingDepartments ? 'Loading...' : 'Choose a department...'}
                                </option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id} className="text-gray-900">{dept.name}</option>
                                ))}
                            </select>
                            {deptError && <p className="text-[9px] text-red-500 mt-1 font-bold">{deptError}</p>}
                        </div>

                        {/* Step 3: Program */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                                Step 3: Select Program
                            </label>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={selectedProgramId}
                                onChange={(e) => setSelectedProgramId(e.target.value)}
                                disabled={!selectedDeptId || loadingPrograms}
                                required
                            >
                                <option value="" disabled className="text-gray-400">
                                    {!selectedDeptId ? 'Select department first' : loadingPrograms ? 'Loading...' : 'Choose a program...'}
                                </option>
                                {programs.map(prog => (
                                    <option key={prog.id} value={prog.id} className="text-gray-900">{prog.name}</option>
                                ))}
                            </select>
                            {programError && <p className="text-[9px] text-red-500 mt-1 font-bold">{programError}</p>}
                        </div>

                        {/* Step 4: Sections */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Step 4: Select Sections
                                </label>
                                {selectedProgramId && sections.length > 0 && !loadingSections && (
                                    <button type="button" onClick={selectAll} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700">
                                        {selectedSectionIds.length === sections.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                )}
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl max-h-40 overflow-y-auto">
                                {!selectedProgramId ? (
                                    <p className="text-center text-gray-400 text-xs font-bold uppercase py-6 italic">Select program first</p>
                                ) : loadingSections ? (
                                    <p className="text-center text-indigo-500 text-xs font-bold uppercase py-6 animate-pulse">Loading sections...</p>
                                ) : sections.length === 0 ? (
                                    <p className="text-center text-gray-400 text-xs font-bold uppercase py-6">No sections found</p>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {sections.map(sec => {
                                            const secId = sec.section_id || sec.id;
                                            const isChecked = selectedSectionIds.includes(secId);
                                            return (
                                                <div
                                                    key={secId}
                                                    onClick={() => toggleSection(secId)}
                                                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${isChecked ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                                                        {isChecked && <span className="text-white text-[8px]">✓</span>}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800">{sec.section_name || sec.name}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase">{sec.school_year} {sec.semester && `• ${sec.semester}`}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            {sectionError && <p className="text-[9px] text-red-500 mt-1 font-bold">{sectionError}</p>}
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-black text-gray-500 text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || selectedSectionIds.length === 0}
                                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm Assignment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AssignQuestModal;
