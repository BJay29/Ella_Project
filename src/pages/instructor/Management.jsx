import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import SectionDashboard from './StudentManagement/SectionDashboard';
import { authAPI } from '../../services/APIservice';
import { Plus, User, Trash2, ExternalLink, X } from 'lucide-react';

const Management = () => {
    const [view, setView] = useState('list');
    const [isLoading, setIsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState({ title: '', sub: '' });
    
    // Protection flag to prevent overwriting storage with empty state on mount
    const [isLoaded, setIsLoaded] = useState(false);

    // --- Data States for Dropdowns ---
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [sections, setSections] = useState([]);
    const [courses, setCourses] = useState([]);
    
    /**
     * DYNAMIC STORAGE KEY HELPER
     */
    const getTargetStorageKey = useCallback(() => {
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        if (userEmail) return `mgt_selectedCards_${userEmail}`;
        if (userName) return `mgt_selectedCards_${userName}`;
        return 'mgt_selectedCards_guest';
    }, []);

    const [selectedDept, setSelectedDept] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    
    // List of created cards
    const [selectedCards, setSelectedCards] = useState([]);
    const firstLoadRef = useRef(true);

    // Token retrieval logic
    const token = useMemo(() => {
        const rawToken = localStorage.getItem('token');
        const cleanToken = rawToken ? rawToken.replace(/"/g, '') : null;
        return cleanToken;
    }, []);

    /**
     * EXTRACT DATA HELPER
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
     * LOAD PERMANENT CARDS FROM API
     * Fetches saved cards using GET /api/instructor/course-card
     */
    const fetchPermanentCards = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await authAPI.getSavedCourseCards(token);
            const data = await extractData(res, "Permanent Cards");
            
            if (data && data.length > 0) {
                // Map the database data to include a unique_key for the UI
                const formatted = data.map(card => ({
                    ...card,
                    unique_key: card.unique_key || `db-${card.id || card.course_id}-${Math.random().toString(36).substr(2, 9)}`
                }));
                setSelectedCards(formatted);
            } else {
                // If DB is empty, fall back to LocalStorage for safety
                const key = getTargetStorageKey();
                const saved = localStorage.getItem(key);
                if (saved) setSelectedCards(JSON.parse(saved));
            }
        } catch (err) {
            console.error("Error fetching permanent cards:", err);
            // Fallback to local storage if API fails
            const key = getTargetStorageKey();
            const saved = localStorage.getItem(key);
            if (saved) setSelectedCards(JSON.parse(saved));
        } finally {
            setIsLoading(false);
            setIsLoaded(true);
        }
    }, [token, getTargetStorageKey]);

    useEffect(() => {
        fetchPermanentCards();
    }, [fetchPermanentCards]);

    /**
     * EFFECT: SAVE CARDS TO LOCAL STORAGE (Secondary Backup)
     */
    useEffect(() => {
        if (!isLoaded) return;
        if (firstLoadRef.current) {
            firstLoadRef.current = false;
            return;
        }
        const key = getTargetStorageKey();
        try {
            localStorage.setItem(key, JSON.stringify(selectedCards));
        } catch (error) {
            console.error('Error saving cards:', error);
        }
    }, [selectedCards, getTargetStorageKey, isLoaded]);

    /**
     * FETCH FUNCTIONS FOR DROPDOWNS
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

    const fetchPrograms = async (deptId) => {
        try {
            const res = await authAPI.getInstructorPrograms(deptId, token);
            const data = await extractData(res, "Programs");
            setPrograms(data);
        } catch (err) { console.error("Error fetching programs:", err); }
    };

    const fetchYearLevels = async (deptId, programId) => {
        try {
            const res = await authAPI.getInstructorYearLevels(deptId, programId, token);
            const data = await extractData(res, "YearLevels");
            setYearLevels(data);
        } catch (err) { console.error("Error fetching year levels:", err); }
    };

    const fetchSections = async (deptId, programId, yearId) => {
        try {
            const res = await authAPI.getInstructorSections(deptId, programId, yearId, token);
            const data = await extractData(res, "Sections");
            setSections(data);
        } catch (err) { console.error("Error fetching sections:", err); }
    };

    const fetchCourses = async (sectionId) => {
        try {
            const res = await authAPI.getInstructorCourses(sectionId, token);
            const data = await extractData(res, "Courses");
            setCourses(data);
        } catch (err) { console.error("Error fetching courses:", err); }
    };

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    // --- State Reset Handlers ---
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

    const handleOpenClassroom = (cardData) => {
        setActiveSection(cardData);
        setView('focus');
    };

    /**
     * HANDLE SELECT COURSE
     * Calls POST /api/instructor/sections/:sectionId/courses/:courseId/card
     */
    const handleSelectCourse = async () => {
        if (selectedCourse && selectedSection && token) {
            try {
                setIsLoading(true);
                
                // 1. Call API to save card permanently in database via POST
                const res = await authAPI.saveCourseCard(token, selectedSection, selectedCourse);

                if (res.ok) {
                    const courseObj = courses.find(c => String(c.course_id || c.id) === String(selectedCourse));
                    const sectionObj = sections.find(s => String(s.section_id || s.id) === String(selectedSection));
                    const yearObj = yearLevels.find(y => String(y.year_level_id || y.id) === String(selectedYear));

                    if (courseObj) {
                        const newCard = {
                            ...courseObj,
                            unique_key: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                            section_name: sectionObj?.section_name || 'N/A',
                            section_code: sectionObj?.section_code || 'N/A',
                            year_level: yearObj?.year_name || 'N/A',
                            year_level_id: selectedYear
                        };

                        // 2. Update UI and prevent duplicates
                        setSelectedCards(prev => {
                            const exists = prev.some(
                                item =>
                                    String(item.course_id || item.id) === String(newCard.course_id || newCard.id) &&
                                    String(item.section_code) === String(newCard.section_code)
                            );

                            if (exists) {
                                setSuccessMessage({ title: 'Duplicate Course', sub: 'This course card already exists' });
                                setShowSuccessModal(true);
                                setTimeout(() => setShowSuccessModal(false), 3000);
                                return prev;
                            }
                            return [newCard, ...prev];
                        });

                        // 3. Show Success Notification
                        setSuccessMessage({ title: 'Course Saved', sub: 'Card is now permanent in database' });
                        setShowSuccessModal(true);
                        setTimeout(() => setShowSuccessModal(false), 3000);

                        // 4. Reset dropdowns
                        setSelectedDept(''); setSelectedProgram(''); setSelectedYear('');
                        setSelectedSection(''); setSelectedCourse('');
                        setPrograms([]); setYearLevels([]); setSections([]); setCourses([]);
                    }
                } else {
                    console.error("Failed to save card permanently");
                    alert("Server error: Could not save course card.");
                }
            } catch (err) {
                console.error("Error in handleSelectCourse:", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDeleteCard = (e, uniqueKey) => {
        e.stopPropagation();
        const filteredCards = selectedCards.filter(card => card.unique_key !== uniqueKey);
        setSelectedCards(filteredCards);
        
        setSuccessMessage({ title: 'Card Deleted', sub: 'Removed from your list' });
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
    };

    return (
        <div className="w-full min-h-screen p-6 relative bg-gray-50/30">
            
            {/* SUCCESS MODAL / TOAST NOTIFICATION */}
            {showSuccessModal && (
                <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-10 duration-300">
                    <div className="bg-white border-l-4 border-black shadow-2xl rounded-xl p-4 flex items-center gap-4 min-w-[300px]">
                        <div className="bg-gray-100 p-2 rounded-full">
                            <Plus size={18} className="text-black" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase text-black">{successMessage.title}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">{successMessage.sub}</p>
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
                            Follow the sequence to access your assigned classes (Auto-saved per account)
                        </p>
                    </div>

                    {/* Selection Bar / Configuration */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-wrap items-end gap-4 mb-12">
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
                                        {d.department_name || d.dept_name || d.name || d.dept_abbr}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                        {y.year_name || `Year ${y.year_level_id || y.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                        {c.course_name || c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            disabled={!selectedCourse || isLoading}
                            onClick={handleSelectCourse}
                            className="bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? 'Saving...' : 'Create Course Card'}
                        </button>
                    </div>

                    {/* CARD DISPLAY AREA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-12">
                        {selectedCards.length > 0 ? (
                            selectedCards.map((card) => (
                                <div 
                                    key={card.unique_key}
                                    onClick={() => handleOpenClassroom(card)}
                                    className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer animate-in zoom-in-95"
                                >
                                    <div className="bg-[#1a73e8] h-[100px] p-5 relative group-hover:bg-[#185abc] transition-colors">
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="flex flex-col max-w-[80%]">
                                                <h3 className="text-white text-lg font-bold leading-tight group-hover:underline truncate">
                                                    {card.course_name || card.name}
                                                </h3>
                                                <p className="text-white text-[12px] font-medium truncate mt-0.5">
                                                    {card.section_name}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={(e) => handleDeleteCard(e, card.unique_key)}
                                                className="text-white hover:bg-red-500 p-1.5 rounded-full transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 h-[140px] flex flex-col justify-between">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Code:</span>
                                                <span className="text-[11px] font-bold text-gray-700">{card.course_code || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Section Code:</span>
                                                <span className="text-[11px] font-bold text-blue-600">
                                                    {card.section_code}
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
                            ))
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-40">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Plus size={24} className="text-gray-400" />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black text-center">
                                    No courses selected.
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