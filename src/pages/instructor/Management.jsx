import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SectionDashboard from './StudentManagement/SectionDashboard';
import { authAPI } from '../../services/APIservice';
import { Plus, User, Trash2, ExternalLink, X } from 'lucide-react';

const Management = () => {
    const [view, setView] = useState('list');
    const [isLoading, setIsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState({ title: '', sub: '' });

    // --- Data States for Dropdowns ---
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [sections, setSections] = useState([]);
    const [courses, setCourses] = useState([]);

    /**
     * PERSISTENCE STATE INITIALIZATION
     */
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    
    // List of created cards (Stored as array to keep multiple cards)
    const [selectedCards, setSelectedCards] = useState(() => {
        // Retrieve saved cards from localStorage on initial load
        const saved = localStorage.getItem('mgt_selectedCards');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing saved cards:", e);
                return [];
            }
        }
        return [];
    });

    // Token retrieval logic
    const token = useMemo(() => {
        const rawToken = localStorage.getItem('token');
        const cleanToken = rawToken ? rawToken.replace(/"/g, '') : null;
        return cleanToken;
    }, []);

    /**
     * EFFECT: Save Cards to LocalStorage
     * This ensures that every time selectedCards state changes, it is mirrored in storage
     */
    useEffect(() => {
        if (selectedCards) {
            localStorage.setItem('mgt_selectedCards', JSON.stringify(selectedCards));
        }
    }, [selectedCards]);

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
     * FETCH FUNCTIONS
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

    const handleSelectCourse = () => {
        if (selectedCourse) {
            const courseObj = courses.find(c => String(c.course_id || c.id) === String(selectedCourse));
            const sectionObj = sections.find(s => String(s.section_id || s.id) === String(selectedSection));
            const yearObj = yearLevels.find(y => String(y.year_level_id || y.id) === String(selectedYear));

            if (courseObj) {
                const newCard = {
                    ...courseObj,
                    unique_key: Date.now(), // timestamp to prevent duplicate key issues
                    section_name: sectionObj?.section_name || 'N/A',
                    section_code: sectionObj?.section_code || 'N/A',
                    year_level: yearObj?.year_name || 'N/A',
                    year_level_id: selectedYear
                };

                // Update state and persistence
                const updatedCards = [newCard, ...selectedCards];
                setSelectedCards(updatedCards);
                
                // Show Success Notification
                setSuccessMessage({ title: 'Course Added', sub: 'Ready for management' });
                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 3000);

                // RESET DROPDOWNS AFTER CREATING CARD
                setSelectedDept('');
                setSelectedProgram('');
                setSelectedYear('');
                setSelectedSection('');
                setSelectedCourse('');
                setPrograms([]);
                setYearLevels([]);
                setSections([]);
                setCourses([]);
            }
        }
    };

    const handleDeleteCard = (e, uniqueKey) => {
        e.stopPropagation(); // Prevent opening classroom view
        const filteredCards = selectedCards.filter(card => card.unique_key !== uniqueKey);
        setSelectedCards(filteredCards);
        
        setSuccessMessage({ title: 'Card Deleted', sub: 'Removed from your list' });
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
    };

    return (
        <div className="w-full min-h-screen p-6 relative">
            
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
                            Follow the sequence to access your assigned classes
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
                                        {d.department_name || d.dept_name || d.name || d.dept_abbr || "Unnamed Dept"}
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
                                        {y.year_name || y.year_level || y.name || `Year ${y.year_level_id || y.id}`}
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
                            disabled={!selectedCourse}
                            onClick={handleSelectCourse}
                            className="bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        >
                            Create Course Card
                        </button>
                    </div>

                    {/* CARD DISPLAY AREA - Persisted from LocalStorage */}
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
                                        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                                            <div className="w-24 h-24 bg-white rounded-full -mr-10 -mt-10" />
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
                            <div className="col-span-full text-left select-none opacity-40 py-20 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Plus size={24} className="text-gray-400" />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black text-center">
                                    No courses selected. Complete selections above to create a card.
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