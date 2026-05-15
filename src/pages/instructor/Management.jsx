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

    // Token retrieval and sanitization
    const token = useMemo(() => {
        const rawToken = localStorage.getItem('token');
        const cleanToken = rawToken ? rawToken.replace(/"/g, '') : null;
        if (!cleanToken) console.warn("Management Log: No token found in localStorage.");
        return cleanToken;
    }, []);

    /**
     * Enhanced Helper to extract array data safely
     * Logs the raw response to help identify key mismatches
     */
    const extractData = async (res, label) => {
        if (!res.ok) {
            console.error(`Management API Error [${label}]: Status ${res.status}`);
            return [];
        }
        const json = await res.json();
        console.log(`Management Log [${label} Raw Response]:`, json);

        // Flexible check: extracts from .data, .results, or the body itself if it's an array
        const extracted = Array.isArray(json) ? json : (json.data || json.results || []);
        
        if (extracted.length === 0) {
            console.warn(`Management Log [${label}]: Data received is an empty array.`);
        }
        return extracted;
    };

    /**
     * FETCH 1: Departments (Initial Load)
     */
    const fetchDepartments = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            console.log("Management Log: Fetching Departments...");
            const res = await authAPI.getInstructorDepartments(token);
            const data = await extractData(res, "Departments");
            setDepartments(data);
        } catch (err) {
            console.error("Management Log: Critical error fetching departments:", err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    /**
     * FETCH 2: Programs
     */
    const fetchPrograms = async (deptId) => {
        try {
            console.log(`Management Log: Fetching Programs for Dept ID: ${deptId}`);
            const res = await authAPI.getInstructorPrograms(deptId, token);
            const data = await extractData(res, "Programs");
            setPrograms(data);
        } catch (err) { console.error("Error fetching programs:", err); }
    };

    /**
     * FETCH 3: Year Levels
     */
    const fetchYearLevels = async (deptId, programId) => {
        try {
            console.log(`Management Log: Fetching Year Levels for Program ID: ${programId}`);
            const res = await authAPI.getInstructorYearLevels(deptId, programId, token);
            const data = await extractData(res, "YearLevels");
            setYearLevels(data);
        } catch (err) { console.error("Error fetching year levels:", err); }
    };

    /**
     * FETCH 4: Sections
     */
    const fetchSections = async (deptId, programId, yearId) => {
        try {
            console.log(`Management Log: Fetching Sections for Year ID: ${yearId}`);
            const res = await authAPI.getInstructorSections(deptId, programId, yearId, token);
            const data = await extractData(res, "Sections");
            setSections(data);
        } catch (err) { console.error("Error fetching sections:", err); }
    };

    /**
     * FETCH 5: Courses
     */
    const fetchCourses = async (sectionId) => {
        try {
            console.log(`Management Log: Fetching Courses for Section ID: ${sectionId}`);
            const res = await authAPI.getInstructorCourses(sectionId, token);
            const data = await extractData(res, "Courses");
            setCourses(data);
        } catch (err) { console.error("Error fetching courses:", err); }
    };

    // --- State Reset Handlers (Cascading Reset) ---

    const handleDeptChange = (deptId) => {
        console.log("Selection Changed: Department ->", deptId);
        setSelectedDept(deptId);
        // Clear all downstream states
        setSelectedProgram(''); setSelectedYear(''); setSelectedSection(''); setSelectedCourse('');
        setPrograms([]); setYearLevels([]); setSections([]); setCourses([]);
        if (deptId) fetchPrograms(deptId);
    };

    const handleProgramChange = (progId) => {
        console.log("Selection Changed: Program ->", progId);
        setSelectedProgram(progId);
        setSelectedYear(''); setSelectedSection(''); setSelectedCourse('');
        setYearLevels([]); setSections([]); setCourses([]);
        if (progId) fetchYearLevels(selectedDept, progId);
    };

    const handleYearChange = (yearId) => {
        console.log("Selection Changed: Year Level ->", yearId);
        setSelectedYear(yearId);
        setSelectedSection(''); setSelectedCourse('');
        setSections([]); setCourses([]);
        if (yearId) fetchSections(selectedDept, selectedProgram, yearId);
    };

    const handleSectionChange = (sectionId) => {
        console.log("Selection Changed: Section ->", sectionId);
        setSelectedSection(sectionId);
        setSelectedCourse('');
        setCourses([]);
        if (sectionId) fetchCourses(sectionId);
    };

    /**
     * Logic to find the specific course object to display in the card
     */
    const finalCardData = useMemo(() => {
        if (!selectedCourse) return null;
        // Ensure comparison is string-based to avoid type mismatch
        return courses.find(c => String(c.course_id || c.id) === String(selectedCourse));
    }, [selectedCourse, courses]);

    const handleOpenClassroom = (data) => {
        const yearObj = yearLevels.find(y => String(y.year_level_id || y.id) === String(selectedYear));
        
        const preparedData = {
            ...data,
            year_level: yearObj?.year_level || 'N/A',
            year_level_id: selectedYear
        };
        
        console.log("Management Log: Opening Dashboard with data:", preparedData);
        setActiveSection(preparedData);
        setView('focus');
    };

    return (
        <div className="w-full min-h-screen p-6">
            {view === 'list' ? (
                <div className="animate-in fade-in duration-500">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-black uppercase italic tracking-tighter">
                            Classroom Management
                        </h2>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-1">
                            Complete the sequence below to view your sections
                        </p>
                    </div>

                    {/* Filter Bar with Enhanced Keys */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-wrap gap-4 mb-12">
                        
                        {/* 1. Department */}
                        <div className="flex flex-col flex-1 min-w-[140px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Department</label>
                            <select 
                                value={selectedDept}
                                onChange={(e) => handleDeptChange(e.target.value)}
                                className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black outline-none cursor-pointer"
                            >
                                <option value="">Select Dept</option>
                                {departments.map(d => (
                                    <option key={d.dept_id || d.id} value={d.dept_id || d.id}>
                                        {d.dept_abbr || d.name || d.dept_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Program */}
                        <div className="flex flex-col flex-1 min-w-[140px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Program</label>
                            <select 
                                disabled={!selectedDept}
                                value={selectedProgram}
                                onChange={(e) => handleProgramChange(e.target.value)}
                                className="bg-gray-50 disabled:opacity-40 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black outline-none cursor-pointer"
                            >
                                <option value="">Select Program</option>
                                {programs.map(p => (
                                    <option key={p.program_id || p.id} value={p.program_id || p.id}>
                                        {p.program_abbr || p.program_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Year Level */}
                        <div className="flex flex-col w-[120px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Year Level</label>
                            <select 
                                disabled={!selectedProgram}
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="bg-gray-50 disabled:opacity-40 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black outline-none cursor-pointer"
                            >
                                <option value="">Select Year</option>
                                {yearLevels.map(y => (
                                    <option key={y.year_level_id || y.id} value={y.year_level_id || y.id}>
                                        {y.year_level}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 4. Section */}
                        <div className="flex flex-col flex-1 min-w-[140px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Section</label>
                            <select 
                                disabled={!selectedYear}
                                value={selectedSection}
                                onChange={(e) => handleSectionChange(e.target.value)}
                                className="bg-gray-50 disabled:opacity-40 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black outline-none cursor-pointer"
                            >
                                <option value="">Select Section</option>
                                {sections.map(s => (
                                    <option key={s.section_id || s.id} value={s.section_id || s.id}>
                                        {s.section_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 5. Course */}
                        <div className="flex flex-col flex-[1.2] min-w-[160px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Course</label>
                            <select 
                                disabled={!selectedSection}
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="bg-gray-50 disabled:opacity-40 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black outline-none cursor-pointer"
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => (
                                    <option key={c.course_id || c.id} value={c.course_id || c.id}>
                                        {c.course_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="flex flex-col items-center justify-center min-h-[300px]">
                        {finalCardData ? (
                            <div className="w-full max-w-sm bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden group animate-in zoom-in-95 duration-300">
                                <div className="bg-black h-32 p-8 flex flex-col justify-end relative overflow-hidden group-hover:bg-green-600 transition-colors duration-500">
                                    <h3 className="text-white text-2xl font-black uppercase italic tracking-tighter leading-none truncate">
                                        {finalCardData.course_name}
                                    </h3>
                                    <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                                        Section {sections.find(s => String(s.section_id || s.id) === String(selectedSection))?.section_name}
                                    </p>
                                </div>

                                <div className="p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Program</span>
                                            <span className="text-[11px] font-bold text-black">{finalCardData.program_abbr || "N/A"}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Code</span>
                                            <span className="text-[11px] font-bold text-black">{finalCardData.course_code || "N/A"}</span>
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
                            <div className="text-center select-none opacity-40">
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black">
                                    Complete all selections to preview classroom
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
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