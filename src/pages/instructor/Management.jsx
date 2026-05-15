import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SectionDashboard from './StudentManagement/SectionDashboard';
import { authAPI } from '../../services/APIservice'; 

const Management = () => {
    const [view, setView] = useState('list');
    const [allAvailableData, setAllAvailableData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(null);

    // --- Selection States for Progressive Filtering ---
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');

    /**
     * Fetch all available sections assigned to the instructor.
     * This data acts as the source for all dropdown filters.
     */
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token')?.replace(/"/g, '');
        try {
            const res = await authAPI.getInstructorCourses(token); 
            if (res.ok) {
                const data = await res.json();
                setAllAvailableData(Array.isArray(data) ? data : data.courses || []);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Hierarchical Filter Logic ---

    // 1. Get unique Departments
    const departments = useMemo(() => 
        [...new Set(allAvailableData.map(item => item.dept_abbr))].filter(Boolean)
    , [allAvailableData]);

    // 2. Get Programs based on chosen Department
    const programs = useMemo(() => {
        if (!selectedDept) return [];
        const filtered = allAvailableData.filter(i => i.dept_abbr === selectedDept);
        return [...new Set(filtered.map(i => i.program_abbr))].filter(Boolean);
    }, [selectedDept, allAvailableData]);

    // 3. Get Year Levels based on chosen Program
    const yearLevels = useMemo(() => {
        if (!selectedProgram) return [];
        const filtered = allAvailableData.filter(i => 
            i.dept_abbr === selectedDept && i.program_abbr === selectedProgram
        );
        return [...new Set(filtered.map(i => i.year_level))].filter(Boolean).sort();
    }, [selectedProgram, selectedDept, allAvailableData]);

    // 4. Get Sections based on Year Level
    const sections = useMemo(() => {
        if (!selectedYear) return [];
        const filtered = allAvailableData.filter(i => 
            i.program_abbr === selectedProgram && i.year_level === selectedYear
        );
        return [...new Set(filtered.map(i => i.section_name))].filter(Boolean);
    }, [selectedYear, selectedProgram, allAvailableData]);

    // 5. Get Courses/Subjects based on Section
    const courses = useMemo(() => {
        if (!selectedSection) return [];
        return allAvailableData.filter(i => 
            i.program_abbr === selectedProgram && 
            i.year_level === selectedYear && 
            i.section_name === selectedSection
        );
    }, [selectedSection, selectedProgram, selectedYear, allAvailableData]);

    // Find the specific object for the final selected card
    const finalCardData = useMemo(() => {
        if (!selectedCourse) return null;
        return courses.find(c => (c.course_name || c.subject) === selectedCourse);
    }, [selectedCourse, courses]);

    const handleOpenClassroom = (data) => {
        setActiveSection(data);
        setView('focus');
    };

    // Helper to reset lower-level filters when a high-level filter changes
    const resetFiltersFrom = (level) => {
        if (level <= 1) setSelectedProgram('');
        if (level <= 2) setSelectedYear('');
        if (level <= 3) setSelectedSection('');
        if (level <= 4) setSelectedCourse('');
    };

    return (
        <div className="w-full min-h-screen">
            {view === 'list' ? (
                <div className="animate-in fade-in duration-500">
                    {/* Header Section */}
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
                            Classroom Management
                        </h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                            Follow the sequence to access your assigned sections
                        </p>
                    </div>

                    {/* Progressive Filter Bar */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-wrap gap-4 mb-12">
                        {/* Dept Select */}
                        <div className="flex flex-col flex-1 min-w-[140px] gap-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Department</label>
                            <select 
                                value={selectedDept}
                                onChange={(e) => { setSelectedDept(e.target.value); resetFiltersFrom(1); }}
                                className="bg-gray-50 border-none rounded-2xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Select Dept</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Program Select */}
                        <div className="flex flex-col flex-1 min-w-[140px] gap-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Program</label>
                            <select 
                                disabled={!selectedDept}
                                value={selectedProgram}
                                onChange={(e) => { setSelectedProgram(e.target.value); resetFiltersFrom(2); }}
                                className="bg-gray-50 disabled:opacity-40 border-none rounded-2xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Select Program</option>
                                {programs.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        {/* Year Select */}
                        <div className="flex flex-col w-[100px] gap-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Year</label>
                            <select 
                                disabled={!selectedProgram}
                                value={selectedYear}
                                onChange={(e) => { setSelectedYear(e.target.value); resetFiltersFrom(3); }}
                                className="bg-gray-50 disabled:opacity-40 border-none rounded-2xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Year</option>
                                {yearLevels.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        {/* Section Select */}
                        <div className="flex flex-col w-[120px] gap-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Section</label>
                            <select 
                                disabled={!selectedYear}
                                value={selectedSection}
                                onChange={(e) => { setSelectedSection(e.target.value); resetFiltersFrom(4); }}
                                className="bg-gray-50 disabled:opacity-40 border-none rounded-2xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Section</option>
                                {sections.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Course Select */}
                        <div className="flex flex-col flex-[2] min-w-[200px] gap-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Course Name</label>
                            <select 
                                disabled={!selectedSection}
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="bg-gray-50 disabled:opacity-40 border-none rounded-2xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c.id} value={c.course_name || c.subject}>{c.course_name || c.subject}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Card Display Area */}
                    <div className="flex flex-col items-center justify-center min-h-[300px]">
                        {finalCardData ? (
                            <div className="w-full max-w-sm bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden group animate-in zoom-in-95 duration-300">
                                {/* GClass Style Banner */}
                                <div className="bg-slate-900 h-32 p-8 flex flex-col justify-end relative overflow-hidden group-hover:bg-green-600 transition-colors duration-500">
                                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full" />
                                    <div className="absolute top-[20%] right-[10%] w-16 h-16 bg-white/10 rounded-full" />
                                    
                                    <h3 className="text-white text-2xl font-black uppercase italic tracking-tighter leading-none truncate">
                                        {finalCardData.course_name || finalCardData.subject}
                                    </h3>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                                        Section {finalCardData.section_name}
                                    </p>
                                </div>

                                {/* Card Details */}
                                <div className="p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Program</span>
                                            <span className="text-[11px] font-bold text-gray-700">{finalCardData.program_abbr}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Dept</span>
                                            <span className="text-[11px] font-bold text-gray-700">{finalCardData.dept_abbr}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleOpenClassroom(finalCardData)}
                                        className="w-full py-4 bg-slate-900 group-hover:bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                    >
                                        Manage Students
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Empty State / Instruction */
                            <div className="text-center opacity-30 select-none">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">
                                    Select class details to view card
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Focus View (Student Management) */
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