import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SectionDashboard from './StudentManagement/SectionDashboard';
import { authAPI } from '../../services/APIservice';
import { Plus, User, MoreVertical, ExternalLink } from 'lucide-react'; // Added for UI icons

const Management = () => {
    const [view, setView] = useState('list');
    const [isLoading, setIsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [showCard, setShowCard] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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
     * EXTRACT DATA HELPER
     * Scans API response for arrays to handle various backend structures
     */
    const extractData = async (res, label) => {
        if (!res.ok) {
            console.error(`Management API Error [${label}]: Status ${res.status}`);
            return [];
        }
        try {
            const json = await res.json();
            if (Array.isArray(json)) return json;
            if (json.data && Array.isArray(json.data)) return json.data;
            const dynamicKey = Object.keys(json).find(key => Array.isArray(json[key]));
            return dynamicKey ? json[dynamicKey] : [];
        } catch (err) {
            console.error(`Management Log [${label}]: JSON Parse Error`, err);
            return [];
        }
    };

    /**
     * FETCH 1: Departments
     */
    const fetchDepartments = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await authAPI.getInstructorDepartments(token);
            const data = await extractData(res, "Departments");
            setDepartments(data);
        } catch (err) {
            console.error("Management Log: Error fetching departments:", err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    /**
     * FETCH 2: Programs (Triggered by Dept selection)
     */
    const fetchPrograms = async (deptId) => {
        try {
            const res = await authAPI.getInstructorPrograms(deptId, token);
            const data = await extractData(res, "Programs");
            setPrograms(data);
        } catch (err) { console.error("Error fetching programs:", err); }
    };

    /**
     * FETCH 3: Year Levels (Triggered by Program selection)
     */
    const fetchYearLevels = async (deptId, programId) => {
        try {
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
            const res = await authAPI.getInstructorSections(deptId, programId, yearId, token);
            const data = await extractData(res, "Sections");
            setSections(data);
        } catch (err) { console.error("Error fetching sections:", err); }
    };

    /**
     * FETCH 5: Courses (Triggered by Section selection)
     */
    const fetchCourses = async (sectionId) => {
        try {
            const res = await authAPI.getInstructorCourses(sectionId, token);
            const data = await extractData(res, "Courses");
            setCourses(data);
        } catch (err) { console.error("Error fetching courses:", err); }
    };

    // --- State Reset Handlers ---

    const handleDeptChange = (deptId) => {
        setSelectedDept(deptId);
        setSelectedProgram(''); setSelectedYear(''); setSelectedSection(''); setSelectedCourse('');
        setPrograms([]); setYearLevels([]); setSections([]); setCourses([]);
        setShowCard(false);
        if (deptId) fetchPrograms(deptId);
    };

    const handleProgramChange = (progId) => {
        setSelectedProgram(progId);
        setSelectedYear(''); setSelectedSection(''); setSelectedCourse('');
        setYearLevels([]); setSections([]); setCourses([]);
        setShowCard(false);
        if (progId) fetchYearLevels(selectedDept, progId);
    };

    const handleYearChange = (yearId) => {
        setSelectedYear(yearId);
        setSelectedSection(''); setSelectedCourse('');
        setSections([]); setCourses([]);
        setShowCard(false);
        if (yearId) fetchSections(selectedDept, selectedProgram, yearId);
    };

    const handleSectionChange = (sectionId) => {
        setSelectedSection(sectionId);
        setSelectedCourse('');
        setCourses([]);
        setShowCard(false);
        if (sectionId) fetchCourses(sectionId);
    };

    /**
     * Logic to identify the selected course and prepare data for the display card
     */
    const finalCardData = useMemo(() => {
        if (!selectedCourse) return null;
        return courses.find(c => String(c.course_id || c.id) === String(selectedCourse));
    }, [selectedCourse, courses]);

    /**
     * Handles navigation to the detailed view/SectionDashboard
     */
    const handleOpenClassroom = (data) => {
        const yearObj = yearLevels.find(y => String(y.year_level_id || y.id) === String(selectedYear));
        const sectionObj = sections.find(s => String(s.section_id || s.id) === String(selectedSection));
        
        const preparedData = {
            ...data,
            section_name: sectionObj?.section_name || sectionObj?.name || 'N/A',
            section_code: sectionObj?.section_code || 'N/A',
            year_level: yearObj?.year_name || yearObj?.year_level || yearObj?.name || 'N/A',
            year_level_id: selectedYear
        };
        setActiveSection(preparedData);
        setView('focus');
    };

    // Trigger Success Toast
    const handleSelectCourse = () => {
        setShowCard(true);
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000); // Auto hide after 3s
    };

    return (
        <div className="w-full min-h-screen p-6 relative">
            
            {/* SUCCESS MODAL / TOAST (Top Right) */}
            {showSuccessModal && (
                <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-10 duration-300">
                    <div className="bg-white border-l-4 border-green-500 shadow-2xl rounded-xl p-4 flex items-center gap-4 min-w-[300px]">
                        <div className="bg-green-100 p-2 rounded-full">
                            <Plus size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase text-black">Course Selected</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Ready for management</p>
                        </div>
                    </div>
                </div>
            )}

            {view === 'list' ? (
                <div className="animate-in fade-in duration-500">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-black uppercase italic tracking-tighter">
                            Classroom Management
                        </h2>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-1">
                            Follow the sequence to access your assigned classes
                        </p>
                    </div>

                    {/* Selection Bar */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-wrap items-end gap-4 mb-12">
                        
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
                                        {d.department_name || d.dept_name || d.name || d.dept_abbr || "Unnamed Dept"}
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
                                        {p.program_name || p.name || p.program_abbr}
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
                                        {y.year_name || y.year_level || y.name || `Year ${y.year_level_id || y.id}`}
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
                                        {s.section_name || s.name}
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
                                onChange={(e) => {
                                    setSelectedCourse(e.target.value);
                                    setShowCard(false);
                                }}
                                className="bg-gray-50 disabled:opacity-40 border border-gray-300 rounded-2xl px-4 py-3 text-[11px] font-black text-black outline-none cursor-pointer"
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => (
                                    <option key={c.course_id || c.id} value={c.course_id || c.id}>
                                        {c.course_name || c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* TRIGGER BUTTON */}
                        <button
                            disabled={!selectedCourse}
                            onClick={handleSelectCourse}
                            className="bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        >
                            Select Course
                        </button>
                    </div>

                    {/* REDESIGNED CARD DISPLAY AREA (Centered) */}
                    <div className="flex flex-col items-center justify-center py-12">
                        {showCard && finalCardData ? (
                            <div 
                                onClick={() => handleOpenClassroom(finalCardData)}
                                className="w-full max-w-[320px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
                            >
                                {/* Header Layout (G-Class Style) */}
                                <div className="bg-[#1a73e8] h-[100px] p-5 relative group-hover:bg-[#185abc] transition-colors">
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex flex-col max-w-[80%]">
                                            <h3 className="text-white text-lg font-bold leading-tight group-hover:underline truncate">
                                                {finalCardData.course_name || finalCardData.name}
                                            </h3>
                                            <p className="text-white text-[12px] font-medium truncate mt-0.5">
                                                {sections.find(s => String(s.section_id || s.id) === String(selectedSection))?.section_name || "N/A"}
                                            </p>
                                        </div>
                                        <button className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
                                    {/* Abstract shapes for background aesthetic */}
                                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                                        <div className="w-24 h-24 bg-white rounded-full -mr-10 -mt-10" />
                                    </div>
                                </div>

                                {/* Body Content */}
                                <div className="p-5 h-[140px] flex flex-col justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Code:</span>
                                            <span className="text-[11px] font-bold text-gray-700">{finalCardData.course_code || "N/A"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Section Code:</span>
                                            <span className="text-[11px] font-bold text-blue-600">
                                                {sections.find(s => String(s.section_id || s.id) === String(selectedSection))?.section_code || "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <User size={16} />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="p-2 text-gray-400 hover:text-[#1a73e8] transition-colors">
                                                <ExternalLink size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center select-none opacity-40 py-20">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plus size={24} className="text-gray-400" />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black">
                                    {selectedCourse ? "Click select button to generate card" : "Complete selections to preview"}
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