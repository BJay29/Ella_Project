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

    // Clean token from local storage
    const token = useMemo(() => {
        const rawToken = localStorage.getItem('token');
        return rawToken ? rawToken.replace(/"/g, '') : null;
    }, []);

    /**
     * FETCH 1: Departments (Initial Load)
     */
    const fetchDepartments = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await authAPI.getInstructorDepartments(token);
            if (res.ok) {
                const data = await res.json();
                // Ensure data is an array
                setDepartments(Array.isArray(data) ? data : (data.data || []));
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
     * FETCH 2: Programs (Triggered by Dept Change)
     */
    const fetchPrograms = async (deptId) => {
        try {
            const res = await authAPI.getInstructorPrograms(deptId, token);
            if (res.ok) {
                const data = await res.json();
                setPrograms(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (err) { console.error("Error fetching programs:", err); }
    };

    /**
     * FETCH 3: Year Levels (Triggered by Program Change)
     */
    const fetchYearLevels = async (deptId, programId) => {
        try {
            const res = await authAPI.getInstructorYearLevels(deptId, programId, token);
            if (res.ok) {
                const data = await res.json();
                setYearLevels(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (err) { console.error("Error fetching year levels:", err); }
    };

    /**
     * FETCH 4: Sections (Triggered by Year Change)
     */
    const fetchSections = async (deptId, programId, yearId) => {
        try {
            const res = await authAPI.getInstructorSections(deptId, programId, yearId, token);
            if (res.ok) {
                const data = await res.json();
                setSections(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (err) { console.error("Error fetching sections:", err); }
    };

    /**
     * Logic to find the specific section object to display in the card
     */
    const finalCardData = useMemo(() => {
        if (!selectedSection) return null;
        // Match by ID. We convert both to string to ensure comparison works
        return sections.find(s => String(s.section_id) === String(selectedSection));
    }, [selectedSection, sections]);

    const handleOpenClassroom = (data) => {
        setActiveSection(data);
        setView('focus');
    };

    // --- CHANGE HANDLERS (Clear lower levels when top levels change) ---

    const handleDeptChange = (deptId) => {
        setSelectedDept(deptId);
        // Reset all child states
        setSelectedProgram(''); setSelectedYear(''); setSelectedSection('');
        setPrograms([]); setYearLevels([]); setSections([]);
        if (deptId) fetchPrograms(deptId);
    };

    const handleProgramChange = (progId) => {
        setSelectedProgram(progId);
        setSelectedYear(''); setSelectedSection('');
        setYearLevels([]); setSections([]);
        if (progId) fetchYearLevels(selectedDept, progId);
    };

    const handleYearChange = (yearId) => {
        setSelectedYear(yearId);
        setSelectedSection('');
        setSections([]);
        if (yearId) fetchSections(selectedDept, selectedProgram, yearId);
    };

    return (
        <div className="w-full min-h-screen p-6">
            {view === 'list' ? (
                <div className="animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-black uppercase italic tracking-tighter">
                            Classroom Management
                        </h2>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-1">
                            Follow the sequence to access your assigned sections
                        </p>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-wrap gap-4 mb-12">
                        
                        {/* Department Dropdown */}
                        <div className="flex flex-col flex-1 min-w-[140px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Department</label>
                            <select 
                                value={selectedDept}
                                onChange={(e) => handleDeptChange(e.target.value)}
                                className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Select Dept</option>
                                {departments.map(d => (
                                    <option key={d.dept_id} value={d.dept_id}>
                                        {d.dept_abbr || d.dept_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Program Dropdown */}
                        <div className="flex flex-col flex-1 min-w-[140px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Program</label>
                            <select 
                                disabled={!selectedDept}
                                value={selectedProgram}
                                onChange={(e) => handleProgramChange(e.target.value)}
                                className="bg-gray-50 disabled:opacity-40 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Select Program</option>
                                {programs.map(p => (
                                    <option key={p.program_id} value={p.program_id}>
                                        {p.program_abbr || p.program_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Year Level Dropdown */}
                        <div className="flex flex-col w-[120px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Year Level</label>
                            <select 
                                disabled={!selectedProgram}
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="bg-gray-50 disabled:opacity-40 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Select Year</option>
                                {yearLevels.map(y => (
                                    <option key={y.year_level_id} value={y.year_level_id}>
                                        {y.year_level}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Section Dropdown */}
                        <div className="flex flex-col flex-[1.5] min-w-[180px] gap-1.5">
                            <label className="text-[9px] font-black text-black uppercase ml-2">Section / Course</label>
                            <select 
                                disabled={!selectedYear}
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                className="bg-gray-50 disabled:opacity-40 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Select Section</option>
                                {sections.map(s => (
                                    <option key={s.section_id} value={s.section_id}>
                                        {s.section_name} - {s.course_name || s.subject || 'No Course Name'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Display Area */}
                    <div className="flex flex-col items-center justify-center min-h-[300px]">
                        {finalCardData ? (
                            <div className="w-full max-w-sm bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden group animate-in zoom-in-95 duration-300">
                                {/* Card Header */}
                                <div className="bg-black h-32 p-8 flex flex-col justify-end relative overflow-hidden group-hover:bg-green-600 transition-colors duration-500">
                                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full" />
                                    <h3 className="text-white text-2xl font-black uppercase italic tracking-tighter leading-none truncate">
                                        {finalCardData.course_name || finalCardData.subject || "Classroom"}
                                    </h3>
                                    <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                                        Section {finalCardData.section_name}
                                    </p>
                                </div>

                                {/* Card Content */}
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
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black">
                                    Select details to preview classroom
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