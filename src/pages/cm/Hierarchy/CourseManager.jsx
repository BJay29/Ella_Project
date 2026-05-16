import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';
// Import Toast components for modern top-right notifications
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * CourseManager Component
 * Orchestrates the full academic hierarchy (Dept > Program > Year > Section)
 * to manage and assign courses. Captures and renders generated course join codes.
 */
const CourseManager = () => {
    // --- DATA STATE ---
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [sections, setSections] = useState([]); 
    const [assignedCourses, setAssignedCourses] = useState([]);

    // --- SELECTION STATE ---
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedYear, setSelectedYear] = useState(''); 
    const [selectedSection, setSelectedSection] = useState('');

    // --- FORM INPUT STATE ---
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- INITIAL FETCH ---
    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getDepartments(token);
            if (res.ok) {
                const data = await res.json();
                setDepartments(data.departments || data || []);
            }
        } catch (err) {
            setError("Could not load departments.");
            toast.error("Failed to load departments.");
        }
    };

    /**
     * Fetches courses based on the current hierarchy selection.
     */
    const fetchRegisteredCourses = async () => {
        if (!selectedDept || !selectedProgram || !selectedYear || !selectedSection) {
            setAssignedCourses([]);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getCoursesBySection(
                parseInt(selectedDept), 
                parseInt(selectedProgram), 
                parseInt(selectedYear),
                parseInt(selectedSection),
                token
            );
            
            if (res.ok) {
                const data = await res.json();
                const courses = Array.isArray(data) ? data : data.courses || [];
                setAssignedCourses(courses);
            }
        } catch (err) {
            console.error("Failed to fetch course list", err);
        }
    };

    // --- CASCADING HIERARCHY LOGIC ---
    
    // 1. Department Change: Fetch Programs
    useEffect(() => {
        const fetchPrograms = async () => {
            if (!selectedDept) { 
                setPrograms([]); 
                return; 
            }
            try {
                const res = await authAPI.getPrograms(parseInt(selectedDept), localStorage.getItem('token'));
                if (res.ok) {
                    const data = await res.json();
                    setPrograms(data.programs || data || []);
                }
            } catch (err) {
                console.error("Error fetching programs", err);
            }
        };
        fetchPrograms();
        setSelectedProgram(''); 
        setSelectedYear(''); 
        setSelectedSection('');
    }, [selectedDept]);

    // 2. Program Change: Fetch Year Levels
    useEffect(() => {
        const fetchYears = async () => {
            if (!selectedProgram || !selectedDept) { 
                setYearLevels([]); 
                return; 
            }
            try {
                const res = await authAPI.getYearLevels(
                    parseInt(selectedDept), 
                    parseInt(selectedProgram), 
                    localStorage.getItem('token')
                );
                if (res.ok) {
                    const data = await res.json();
                    setYearLevels(data.year_levels || data || []);
                }
            } catch (err) {
                console.error("Error fetching year levels", err);
            }
        };
        fetchYears();
        setSelectedYear(''); 
        setSelectedSection('');
    }, [selectedProgram, selectedDept]);

    // 3. Year Level Change: Fetch Sections
    useEffect(() => {
        const fetchSections = async () => {
            if (!selectedYear || !selectedProgram || !selectedDept) { 
                setSections([]); 
                return; 
            }
            try {
                const token = localStorage.getItem('token');
                const res = await authAPI.getSections(
                    parseInt(selectedDept), 
                    parseInt(selectedProgram), 
                    parseInt(selectedYear), 
                    token
                );
                if (res.ok) {
                    const data = await res.json();
                    setSections(data.sections || data || []);
                }
            } catch (err) {
                console.error("Connection error fetching sections", err);
            }
        };
        fetchSections();
        setSelectedSection('');
    }, [selectedYear, selectedDept, selectedProgram]);

    // 4. Section Change: Load Courses
    useEffect(() => {
        fetchRegisteredCourses();
    }, [selectedSection]);


    // --- FORM SUBMISSION ---
    const handleAssignCourse = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedSection || !courseName || !courseCode) {
            setError("Selection incomplete: All hierarchy levels and Course details required.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                course_name: courseName.trim(),
                course_code: courseCode.trim().toUpperCase(),
                description: description.trim(),
                section_id: parseInt(selectedSection) 
            };

            const res = await authAPI.createCourse(
                parseInt(selectedDept), 
                parseInt(selectedProgram), 
                parseInt(selectedYear), 
                parseInt(selectedSection),
                payload, 
                token
            );

            if (res.ok) {
                const data = await res.json();
                
                // Fetch updated dataset immediately to render new card with code
                await fetchRegisteredCourses(); 
                setCourseName(''); 
                setCourseCode(''); 
                setDescription(''); 
                
                // Extract generated code across common response properties
                const activeCode = data.course_join_code || data.join_code || data.data?.course_join_code || data.data?.join_code;

                const successMsg = activeCode
                    ? `Course successfully deployed! Code: ${activeCode}`
                    : "Course successfully deployed to section!";

                toast.success(successMsg, {
                    position: "top-right",
                    autoClose: 5000,
                    theme: "colored",
                });
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.message || "Deployment failed.");
                toast.error(errData.message || "Failed to deploy course.");
            }
        } catch (err) {
            setError("Network error encountered.");
            toast.error("Connection failed.");
        } finally {
            setLoading(false);
        }
    };

    // --- INSTANT DELETION HANDLER ---
    const handleDelete = async (courseId, targetCourseCode) => {
        if (!window.confirm(`Are you sure you want to remove ${targetCourseCode || 'this course'} from the curriculum?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            const res = await authAPI.deleteCourse(
                parseInt(selectedDept),
                parseInt(selectedProgram),
                parseInt(selectedYear),
                parseInt(selectedSection),
                parseInt(courseId),
                token
            );

            if (res.ok) {
                await fetchRegisteredCourses();
                toast.error(`Course ${targetCourseCode || ''} removed from curriculum.`, { 
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored"
                });
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Delete operation rejected by server.");
            }
        } catch (err) {
            console.error("Delete Error:", err);
            toast.error("Delete operation failed due to connection error.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            {/* Notification container element */}
            <ToastContainer />

            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
                    Course Manager
                </h2>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.2em] opacity-80">
                    Syllabus & Section Assignment
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* --- SIDEBAR: HIERARCHY & FORM --- */}
                <div className="lg:col-span-4 sticky top-6">
                    <form onSubmit={handleAssignCourse} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-6">
                        
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest ml-2">Academic Path</label>
                            
                            <select 
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                            >
                                <option value="">Select Department</option>
                                {departments.map(d => (
                                    <option key={`dept-${d.id || d.dept_id}`} value={d.id || d.dept_id}>
                                        {d.department_name || d.name}
                                    </option>
                                ))}
                            </select>

                            <select 
                                disabled={!selectedDept}
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white disabled:opacity-40 transition-all outline-none"
                            >
                                <option value="">{selectedDept ? "Select Program" : "Select Dept first"}</option>
                                {programs.map(p => (
                                    <option key={`prog-${p.id || p.program_id}`} value={p.id || p.program_id}>
                                        {p.program_name || p.name}
                                    </option>
                                ))}
                            </select>

                            <select 
                                disabled={!selectedProgram}
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white disabled:opacity-40 transition-all outline-none"
                            >
                                <option value="">{selectedProgram ? "Select Year Level" : "Select Program first"}</option>
                                {yearLevels.map(y => (
                                    <option key={`year-${y.id || y.year_id || y.year_level_id}`} value={y.id || y.year_id || y.year_level_id}>
                                        {y.year_name || y.name}
                                    </option>
                                ))}
                            </select>

                            <select 
                                disabled={!selectedYear}
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white disabled:opacity-40 transition-all outline-none"
                            >
                                <option value="">{selectedYear ? "Select Section" : "Select Year first"}</option>
                                {sections.map(s => (
                                    <option key={`sec-${s.id || s.section_id}`} value={s.id || s.section_id}>
                                        {s.section_name || s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-2 space-y-4">
                            <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest ml-2">Course Information</label>
                            <input 
                                required
                                type="text" placeholder="Title (e.g. Machine Learning)" value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                            />
                            <input 
                                required
                                type="text" placeholder="Code (e.g. CS-402)" value={courseCode}
                                onChange={(e) => setCourseCode(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white transition-all outline-none uppercase"
                            />
                            <textarea 
                                placeholder="Syllabus/Course Description" value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white transition-all outline-none h-24 resize-none"
                            />
                        </div>

                        {error && <p className="text-[10px] font-black text-rose-500 uppercase text-center">{error}</p>}

                        <button 
                            type="submit" disabled={loading}
                            className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all uppercase text-xs tracking-widest disabled:bg-slate-300"
                        >
                            {loading ? "Processing..." : "Add Course"}
                        </button>
                    </form>
                </div>

                {/* --- DISPLAY AREA --- */}
                <div className="lg:col-span-8">
                    {assignedCourses.length === 0 ? (
                        <div className="bg-white border-4 border-dashed border-slate-100 rounded-[4rem] p-32 flex flex-col items-center justify-center text-center">
                            <h3 className="text-2xl font-black text-slate-300 uppercase italic leading-tight">
                                {!selectedSection ? "Select a Section to View Courses" : "No Registered Courses Found"}
                            </h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {assignedCourses.map((course) => {
                                // Dynamic resolve key for displaying generated codes safely on cards
                                const displayCode = course.course_join_code || course.join_code;

                                return (
                                    <div 
                                        key={`course-${course.id || course.course_id}`} 
                                        className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all border-b-4 border-b-transparent hover:border-b-indigo-500 text-left"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="px-3 py-1 bg-indigo-50 rounded-full">
                                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">
                                                    {course.course_code}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleDelete(course.id || course.course_id, course.course_code)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Delete Course"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        <h4 className="text-lg font-black text-slate-900 leading-tight mb-2 uppercase">
                                            {course.course_name}
                                        </h4>
                                        <p className="text-xs text-slate-500 italic mb-6 line-clamp-2">
                                            {course.description || "No description provided."}
                                        </p>

                                        <div className="pt-4 border-t border-slate-50 flex justify-between items-center flex-wrap gap-2">
                                            <div className="flex gap-2">
                                                <div className="text-[9px] font-black bg-slate-900 text-white px-2 py-1 rounded-lg uppercase">
                                                    SID: {course.section_id}
                                                </div>
                                            </div>

                                            {/* Renders generated code or alternative error-prevention text fallback */}
                                            {displayCode ? (
                                                <div className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl border border-emerald-200 select-all tracking-wider uppercase">
                                                    Code: {displayCode}
                                                </div>
                                            ) : (
                                                <div className="text-[9px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-lg italic">
                                                    Code Pending
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseManager;