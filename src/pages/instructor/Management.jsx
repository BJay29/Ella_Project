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

    // --- Selection States ---
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    // Memoize token to avoid unnecessary re-renders
    const token = useMemo(() => localStorage.getItem('token')?.replace(/"/g, ''), []);

    /**
     * INITIAL FETCH: Load Departments assigned to the instructor
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
        if (token) fetchDepartments();
    }, [fetchDepartments, token]);

    /**
     * PROGRESSIVE FETCH: Programs based on Department
     */
    const fetchPrograms = async (deptId) => {
        try {
            const res = await authAPI.getInstructorPrograms(deptId, token);
            if (res.ok) setPrograms(await res.json());
        } catch (err) { console.error("Error fetching programs:", err); }
    };

    /**
     * PROGRESSIVE FETCH: Year Levels based on Program
     */
    const fetchYearLevels = async (deptId, programId) => {
        try {
            const res = await authAPI.getInstructorYearLevels(deptId, programId, token);
            if (res.ok) setYearLevels(await res.json());
        } catch (err) { console.error("Error fetching year levels:", err); }
    };

    /**
     * PROGRESSIVE FETCH: Sections based on Year Level
     */
    const fetchSections = async (deptId, programId, yearId) => {
        try {
            const res = await authAPI.getInstructorSections(deptId, programId, yearId, token);
            if (res.ok) setSections(await res.json());
        } catch (err) { console.error("Error fetching sections:", err); }
    };

    /**
     * Find the specific object to display the "Google Class" style card
     */
    const finalCardData = useMemo(() => {
        if (!selectedSection) return null;
        // Find the section object that matches the selected ID
        return sections.find(s => String(s.section_id) === String(selectedSection));
    }, [selectedSection, sections]);

    const handleOpenClassroom = (data) => {
        setActiveSection(data);
        setView('focus');
    };

    // --- Selection Handlers with state cleanup ---

    const handleDeptChange = (deptId) => {
        setSelectedDept(deptId);
        // Reset child states
        setSelectedProgram('');
        setSelectedYear('');
        setSelectedSection('');
        setPrograms([]);
        setYearLevels([]);
        setSections([]);
        if (deptId) fetchPrograms(deptId);
    };

    const handleProgramChange = (progId) => {
        setSelectedProgram(progId);
        setSelectedYear('');
        setSelectedSection('');
        setYearLevels([]);
        setSections([]);
        if (progId) fetchYearLevels(selectedDept, progId);
    };

    const handleYearChange = (yearId) => {
        setSelectedYear(yearId);
        setSelectedSection('');
        setSections([]);
        if (yearId) fetchSections(selectedDept, selectedProgram, yearId);
    };

    return (
        <div className="w-full min-h-screen p-4 md:p-8">
            {view === 'list' ? (
                <div className="animate-in fade-in duration-500">
                    {/* Header Section */}
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-black uppercase italic tracking-tighter">
                            Classroom Management
                        </h2>
                        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.2em] mt-1">
                            Select the hierarchy to manage your students
                        </p>
                    </div>

                    {/* Filter Bar with English Labels and Clear Black Text */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-gray-200 flex flex-wrap gap-4 mb-12">
                        
                        {/* Department Dropdown */}
                        <div className="flex flex-col flex-1 min-w-[150px] gap-1.5">
                            <label className="text-[10px] font-black text-black uppercase ml-2">Department</label>
                            <select 
                                value={selectedDept}
                                onChange={(e) => handleDeptChange(e.target.value)}
                                className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-[12px] font-bold text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">-- SELECT DEPT --</option>
                                {departments.map(d => (
                                    <option key={d.dept_id} value={d.dept_id}>{d.dept_abbr || d.dept_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Program Dropdown */}
                        <div className="flex flex-col flex-1 min-w-[150px] gap-1.5">
                            <label className="text-[10px] font-black text-black uppercase ml-2">Program</label>
                            <select 
                                disabled={!selectedDept}
                                value={selectedProgram}
                                onChange={(e) => handleProgramChange(e.target.value)}
                                className="bg-gray-50 disabled:opacity-30 border border-gray-300 rounded-2xl px-4 py-3 text-[12px] font-bold text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">-- SELECT PROGRAM --</option>
                                {programs.map(p => (
                                    <option key={p.program_id} value={p.program_id}>{p.program_abbr || p.program_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year Level Dropdown */}
                        <div className="flex flex-col flex-1 min-w-[120px] gap-1.5">
                            <label className="text-[10px] font-black text-black uppercase ml-2">Year Level</label>
                            <select 
                                disabled={!selectedProgram}
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="bg-gray-50 disabled:opacity-30 border border-gray-300 rounded-2xl px-4 py-3 text-[12px] font-bold text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">-- SELECT YEAR --</option>
                                {yearLevels.map(y => (
                                    <option key={y.year_level_id} value={y.year_level_id}>{y.year_level}</option>
                                ))}
                            </select>
                        </div>

                        {/* Section Dropdown */}
                        <div className="flex flex-col flex-1 min-w-[150px] gap-1.5">
                            <label className="text-[10px] font-black text-black uppercase ml-2">Section / Course</label>
                            <select 
                                disabled={!selectedYear}
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                className="bg-gray-50 disabled:opacity-30 border border-gray-300 rounded-2xl px-4 py-3 text-[12px] font-bold text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">-- SELECT SECTION --</option>
                                {sections.map(s => (
                                    <option key={s.section_id} value={s.section_id}>
                                        {s.section_name} {s.course_name ? `- ${s.course_name}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Card Display Area */}
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        ) : finalCardData ? (
                            <div className="w-full max-w-sm bg-white rounded-[2.5rem] border border-gray-200 shadow-2xl overflow-hidden group animate-in zoom-in-95 duration-300">
                                {/* Google Classroom Style Banner */}
                                <div className="bg-black h-36 p-8 flex flex-col justify-end relative overflow-hidden group-hover:bg-green-700 transition-colors duration-500">
                                    {/* Decorative circles */}
                                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full" />
                                    <div className="absolute top-[20%] right-[10%] w-16 h-16 bg-white/5 rounded-full" />
                                    
                                    <h3 className="text-white text-2xl font-black uppercase italic tracking-tighter leading-none truncate">
                                        {finalCardData.course_name || "Assigned Class"}
                                    </h3>
                                    <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                                        Section: {finalCardData.section_name}
                                    </p>
                                </div>

                                {/* Content Details */}
                                <div className="p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Level</span>
                                            <span className="text-[12px] font-bold text-black">{selectedYear ? "Year " + selectedYear : "N/A"}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Code</span>
                                            <span className="text-[12px] font-bold text-black">{finalCardData.course_code || "N/A"}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleOpenClassroom(finalCardData)}
                                        className="w-full py-4 bg-black group-hover:bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                    >
                                        Open Management
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Empty Placeholder State */
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-300">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-black font-black text-lg uppercase italic">No Selection Made</h3>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-2">
                                    Please complete the filters above to view your class card
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Focus View: Management Interface */
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