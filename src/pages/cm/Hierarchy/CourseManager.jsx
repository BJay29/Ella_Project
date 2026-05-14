import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';

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
                // Matches your JSON: { "departments": [...] }
                setDepartments(data.departments || []);
            }
        } catch (err) {
            setError("Could not load departments.");
        }
    };

    /**
     * Fetches courses assigned to the selected hierarchy.
     */
    const fetchRegisteredCourses = async () => {
        if (!selectedDept || !selectedProgram) {
            setAssignedCourses([]);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getCourses(selectedDept, selectedProgram, token);
            if (res.ok) {
                const data = await res.json();
                // Set the list of courses (Assumes array or data.courses)
                setAssignedCourses(Array.isArray(data) ? data : data.courses || []);
            }
        } catch (err) {
            console.error("Failed to fetch course list", err);
        }
    };

    // --- CASCADING FETCH LOGIC ---
    
    // Fetch Programs when Department changes
    useEffect(() => {
        const fetchPrograms = async () => {
            if (!selectedDept) { setPrograms([]); return; }
            const res = await authAPI.getPrograms(selectedDept, localStorage.getItem('token'));
            if (res.ok) {
                const data = await res.json();
                // Supports both nested {programs: []} or direct array
                setPrograms(data.programs || data);
            }
        };
        fetchPrograms();
        // Reset dependent selections
        setSelectedProgram(''); setSelectedYear(''); setSelectedSection('');
    }, [selectedDept]);

    // Fetch Year Levels when Program changes
    useEffect(() => {
        const fetchYears = async () => {
            if (!selectedProgram) { setYearLevels([]); return; }
            const res = await authAPI.getYearLevels(selectedDept, selectedProgram, localStorage.getItem('token'));
            if (res.ok) {
                const data = await res.json();
                setYearLevels(data.year_levels || data);
            }
        };
        fetchYears();
        fetchRegisteredCourses(); 
        setSelectedYear(''); setSelectedSection('');
    }, [selectedProgram]);

    // Fetch Sections when Year Level changes
    useEffect(() => {
        const fetchSections = async () => {
            if (!selectedYear) { setSections([]); return; }
            const res = await authAPI.getSections(selectedDept, selectedProgram, selectedYear, localStorage.getItem('token'));
            if (res.ok) {
                const data = await res.json();
                setSections(data.sections || data);
            }
        };
        fetchSections();
        setSelectedSection('');
    }, [selectedYear]);

    // --- FORM HANDLERS ---
    const handleAssignCourse = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedSection || !courseName || !courseCode) {
            setError("Please complete the hierarchy and course details.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                course_name: courseName.trim(),
                course_code: courseCode.trim().toUpperCase(),
                description: description.trim(),
                section_id: selectedSection 
            };

            const res = await authAPI.createCourse(selectedDept, selectedProgram, selectedYear, payload, token);

            if (res.ok) {
                fetchRegisteredCourses();
                setCourseName(''); setCourseCode(''); setDescription('');
                alert("Course assigned successfully!");
            } else {
                const errData = await res.json();
                setError(errData.message || "Failed to create course.");
            }
        } catch (err) {
            setError("Server connection failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this course assignment?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.deleteCourse(id, token);
            if (res.ok) fetchRegisteredCourses();
        } catch (err) {
            alert("Delete failed.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
                    Course Assignment
                </h2>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.2em] opacity-80">
                    Map subjects to specific university tiers
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* --- SIDEBAR: HIERARCHY SELECTION --- */}
                <div className="lg:col-span-4 sticky top-6">
                    <form onSubmit={handleAssignCourse} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-6">
                        
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest ml-2">University Hierarchy</label>
                            
                            {/* Department Dropdown - Matches your JSON: dept_id / department_name */}
                            <select 
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                            >
                                <option value="">Select Department</option>
                                {departments.map(d => (
                                    <option key={`dept-${d.dept_id || d.id}`} value={d.dept_id || d.id}>
                                        {d.department_name || d.dept_name || d.name}
                                    </option>
                                ))}
                            </select>

                            {/* Program Dropdown */}
                            <select 
                                disabled={!selectedDept}
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white disabled:opacity-40 transition-all outline-none"
                            >
                                <option value="">{selectedDept ? "Select Program" : "Awaiting Department..."}</option>
                                {programs.map(p => (
                                    <option key={`prog-${p.program_id || p.id}`} value={p.program_id || p.id}>
                                        {p.program_name || p.name}
                                    </option>
                                ))}
                            </select>

                            {/* Year Level Dropdown */}
                            <select 
                                disabled={!selectedProgram}
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white disabled:opacity-40 transition-all outline-none"
                            >
                                <option value="">{selectedProgram ? "Select Year Level" : "Awaiting Program..."}</option>
                                {yearLevels.map(y => (
                                    <option key={`year-${y.year_id || y.id}`} value={y.year_id || y.id}>
                                        {y.year_name || y.name}
                                    </option>
                                ))}
                            </select>

                            {/* Section Dropdown */}
                            <select 
                                disabled={!selectedYear}
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 focus:border-indigo-500 focus:bg-white disabled:opacity-40 transition-all outline-none"
                            >
                                <option value="">{selectedYear ? "Select Section" : "Awaiting Year Level..."}</option>
                                {sections.map(s => (
                                    <option key={`sec-${s.section_id || s.id}`} value={s.section_id || s.id}>
                                        {s.section_name || s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-2 space-y-4">
                            <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest ml-2">Subject Information</label>
                            <input 
                                type="text" placeholder="Course Name" value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                            />
                            <input 
                                type="text" placeholder="Course Code" value={courseCode}
                                onChange={(e) => setCourseCode(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white transition-all outline-none uppercase"
                            />
                            <textarea 
                                placeholder="Description" value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white transition-all outline-none h-24 resize-none"
                            />
                        </div>

                        {error && <p className="text-[10px] font-black text-rose-500 uppercase text-center">{error}</p>}

                        <button 
                            type="submit" disabled={loading}
                            className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all uppercase text-xs tracking-widest"
                        >
                            {loading ? "Syncing..." : "Assign Subject →"}
                        </button>
                    </form>
                </div>

                {/* --- CONTENT: CARDS DISPLAY --- */}
                <div className="lg:col-span-8">
                    {assignedCourses.length === 0 ? (
                        <div className="bg-white border-4 border-dashed border-slate-100 rounded-[4rem] p-32 flex flex-col items-center justify-center text-center">
                            <h3 className="text-2xl font-black text-slate-300 uppercase italic">Database Empty</h3>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
                                {!selectedProgram ? "Select a Program to view courses" : "No courses assigned yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {assignedCourses.map((course) => (
                                <div key={`course-${course.course_id || course.id}`} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all border-b-4 border-b-transparent hover:border-b-indigo-500">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="px-3 py-1 bg-indigo-50 rounded-full">
                                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">
                                                {course.course_code}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(course.course_id || course.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
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
                                        {course.description}
                                    </p>
                                    <div className="pt-4 border-t border-slate-50 flex gap-2">
                                        <div className="text-[9px] font-black bg-indigo-600 text-white px-2 py-1 rounded-lg uppercase">
                                            {course.Section?.section_name || 'Assigned'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseManager;