import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SectionDashboard from './StudentManagement/SectionDashboard';
import { authAPI } from '../../services/APIservice'; 

const Management = () => {
    const [view, setView] = useState('list');
    const [isLoading, setIsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState(null);

    // --- Data States for Dropdowns ---
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [sections, setSections] = useState([]);
    const [courses, setCourses] = useState([]);

    // --- Selection States ---
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');

    const token = useMemo(() => localStorage.getItem('token')?.replace(/"/g, ''), []);

    /**
     * INITIAL FETCH: Load Departments on component mount
     */
    const fetchDepartments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await authAPI.getInstructorDepartments(token);
            if (res.ok) {
                const data = await res.json();
                setDepartments(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Error fetching departments:", err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    /**
     * PROGRESSIVE FETCH FUNCTIONS
     */
    const fetchPrograms = async (deptId) => {
        try {
            const res = await authAPI.getInstructorPrograms(deptId, token);
            if (res.ok) setPrograms(await res.json());
        } catch (err) { console.error("Error fetching programs:", err); }
    };

    const fetchYearLevels = async (deptId, programId) => {
        try {
            const res = await authAPI.getInstructorYearLevels(deptId, programId, token);
            if (res.ok) setYearLevels(await res.json());
        } catch (err) { console.error("Error fetching year levels:", err); }
    };

    const fetchSections = async (deptId, programId, yearId) => {
        try {
            const res = await authAPI.getInstructorSections(deptId, programId, yearId, token);
            if (res.ok) setSections(await res.json());
        } catch (err) { console.error("Error fetching sections:", err); }
    };

    const fetchCourses = async (sectionId) => {
        try {
            // Adjust this API call based on your service structure
            const res = await authAPI.getInstructorCourses(sectionId, token);
            if (res.ok) setCourses(await res.json());
        } catch (err) { console.error("Error fetching courses:", err); }
    };

    /**
     * Determine which data to display in the Class Card
     */
    const finalCardData = useMemo(() => {
        if (!selectedCourse) return null;
        // Search through the courses array for the selected ID/Name
        return courses.find(c => (c.course_id?.toString() === selectedCourse || c.course_name === selectedCourse));
    }, [selectedCourse, courses]);

    const handleOpenClassroom = (data) => {
        setActiveSection(data);
        setView('focus');
    };

    // --- CHANGE HANDLERS (Clears subsequent fields to prevent UI glitches) ---

    const handleDeptChange = (deptId) => {
        setSelectedDept(deptId);
        setSelectedProgram(''); setSelectedYear(''); setSelectedSection(''); setSelectedCourse('');
        setPrograms([]); setYearLevels([]); setSections([]); setCourses([]);
        if (deptId) fetchPrograms(deptId);
    };

    const handleProgramChange = (progId) => {
        setSelectedProgram(progId);
        setSelectedYear(''); setSelectedSection(''); setSelectedCourse('');
        setYearLevels([]); setSections([]); setCourses([]);
        if (progId) fetchYearLevels(selectedDept, progId);
    };

    const handleYearChange = (yearId) => {
        setSelectedYear(yearId);
        setSelectedSection(''); setSelectedCourse('');
        setSections([]); setCourses([]);
        if (yearId) fetchSections(selectedDept, selectedProgram, yearId);
    };

    const handleSectionChange = (sectionId) => {
        setSelectedSection(sectionId);
        setSelectedCourse('');
        setCourses([]);
        if (sectionId) fetchCourses(sectionId);
    };

    return (
        <div className="w-full min-h-screen p-6">
            {view === 'list' ? (
                <div className="animate-in fade-in duration-500">
                    {/* Header Section */}
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-black uppercase italic tracking-tighter">
                            Classroom Management
                        </h2>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-1">
                            Follow the sequence to access your assigned sections
                        </p>
                    </div>

                    {/* Progressive Filter Bar */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-wrap gap-4 mb-12">
                        
                        {/* Dept Select */}
                        <div className="flex flex-col flex-1 min-w-[140px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Department</label>
                            <select 
                                value={selectedDept}
                                onChange={(e) => handleDeptChange(e.target.value)}
                                className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_abbr || d.dept_name}</option>)}
                            </select>
                        </div>

                        {/* Program Select */}
                        <div className="flex flex-col flex-1 min-w-[140px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Program</label>
                            <select 
                                disabled={!selectedDept}
                                value={selectedProgram}
                                onChange={(e) => handleProgramChange(e.target.value)}
                                className="bg-gray-50 disabled:opacity-40 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Select Program</option>
                                {programs.map(p => <option key={p.program_id} value={p.program_id}>{p.program_abbr || p.program_name}</option>)}
                            </select>
                        </div>

                        {/* Year Level Select */}
                        <div className="flex flex-col w-[120px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Year Level</label>
                            <select 
                                disabled={!selectedProgram}
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="bg-gray-50 disabled:opacity-40 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Select Year</option>
                                {yearLevels.map(y => <option key={y.year_level_id} value={y.year_level_id}>{y.year_level}</option>)}
                            </select>
                        </div>

                        {/* Section Select */}
                        <div className="flex flex-col flex-1 min-w-[140px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Section</label>
                            <select 
                                disabled={!selectedYear}
                                value={selectedSection}
                                onChange={(e) => handleSectionChange(e.target.value)}
                                className="bg-gray-50 disabled:opacity-40 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Select Section</option>
                                {sections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_name}</option>)}
                            </select>
                        </div>

                        {/* Course Select */}
                        <div className="flex flex-col flex-[1.5] min-w-[180px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Course</label>
                            <select 
                                disabled={!selectedSection}
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="bg-gray-50 disabled:opacity-40 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => (
                                    <option key={c.course_id} value={c.course_id || c.course_name}>
                                        {c.course_name || c.subject}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Card Display Area */}
                    <div className="flex flex-col items-center justify-center min-h-[300px]">
                        {finalCardData ? (
                            <div className="w-full max-w-sm bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden group animate-in zoom-in-95 duration-300">
                                {/* Card Banner */}
                                <div className="bg-black h-32 p-8 flex flex-col justify-end relative overflow-hidden group-hover:bg-green-600 transition-colors duration-500">
                                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full" />
                                    <h3 className="text-white text-2xl font-black uppercase italic tracking-tighter leading-none truncate">
                                        {finalCardData.course_name || "Classroom"}
                                    </h3>
                                    <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                                        {finalCardData.course_code || "N/A"}
                                    </p>
                                </div>

                                {/* Card Body */}
                                <div className="p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Program</span>
                                            <span className="text-[11px] font-bold text-black">{finalCardData.program_abbr || "N/A"}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Section</span>
                                            <span className="text-[11px] font-bold text-black">{finalCardData.section_name || "N/A"}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleOpenClassroom(finalCardData)}
                                        className="w-full py-4 bg-black group-hover:bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                    >
                                        Manage Students
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Empty state when no course is selected */
                            <div className="text-center select-none opacity-50">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black">
                                    Select details above to preview class
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Focus Mode Dashboard */
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionDashboard 
                        sectionData={activeSection} 
                        onBack={() => setView('list')} 
                    />
                </div>
            )}
        </div>
    );
};

export default Management;