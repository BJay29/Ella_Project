import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SectionDashboard from './StudentManagement/SectionDashboard';
import { authAPI } from '../../services/APIservice'; 

const Management = () => {
    const [view, setView] = useState('list');
    const [mySections, setMySections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(null);
    
    // --- States for Hierarchical Filtering ---
    const [selectedDept, setSelectedDept] = useState('All');
    const [selectedCourse, setSelectedCourse] = useState('All');

    /**
     * Fetch all assigned courses/sections for the instructor from the Backend
     * This replaces the old localStorage logic to follow the new API-driven flow.
     */
    const fetchSectionsFromAPI = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token')?.replace(/"/g, '');
        try {
            const res = await authAPI.getInstructorCourses(token); 
            if (res.ok) {
                const data = await res.json();
                // Expecting an array of sections/courses
                setMySections(Array.isArray(data) ? data : data.courses || []);
            } else {
                console.error("Failed to fetch assigned courses.");
            }
        } catch (err) {
            console.error("Connection error while fetching sections:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSectionsFromAPI();
    }, [fetchSectionsFromAPI]);

    /**
     * Dynamic Filter Options
     * Extract unique Departments and Courses from the fetched API data
     */
    const departments = useMemo(() => {
        const depts = mySections.map(s => s.dept_abbr || s.dept_name).filter(Boolean);
        return ['All', ...new Set(depts)];
    }, [mySections]);

    const courses = useMemo(() => {
        let filtered = mySections;
        if (selectedDept !== 'All') {
            filtered = mySections.filter(s => (s.dept_abbr || s.dept_name) === selectedDept);
        }
        const subjects = filtered.map(s => s.course_name || s.subject).filter(Boolean);
        return ['All', ...new Set(subjects)];
    }, [mySections, selectedDept]);

    /**
     * Final Filtered Data
     * Filters the grid based on the user's dropdown selections
     */
    const filteredSections = useMemo(() => {
        return mySections.filter(item => {
            const deptMatch = selectedDept === 'All' || (item.dept_abbr || item.dept_name) === selectedDept;
            const courseMatch = selectedCourse === 'All' || (item.course_name || item.subject) === selectedCourse;
            return deptMatch && courseMatch;
        });
    }, [mySections, selectedDept, selectedCourse]);

    const handleManageStudents = (item) => {
        setActiveSection(item); 
        setView('focus');
    };

    return (
        <div className="w-full relative">
            {/* ── VIEW: LIST (Dashboard & Filtering) ── */}
            {view === 'list' ? (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                    
                    <div className="flex flex-col gap-8 mb-10">
                        <div>
                            <h2 className="text-gray-800 font-black uppercase italic text-2xl tracking-tight leading-none">
                                Instructor Dashboard
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                                New Flow: Assigned Departments → Course Selection → Section Management
                            </p>
                        </div>

                        {/* Hierarchical Filter Bar */}
                        <div className="flex flex-wrap items-center gap-4 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="flex flex-col gap-2">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Department</span>
                                <select 
                                    value={selectedDept}
                                    onChange={(e) => { setSelectedDept(e.target.value); setSelectedCourse('All'); }}
                                    className="bg-white border-none rounded-xl px-4 py-2 text-[11px] font-black uppercase shadow-sm focus:ring-2 focus:ring-green-500 transition-all outline-none"
                                >
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Course</span>
                                <select 
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="bg-white border-none rounded-xl px-4 py-2 text-[11px] font-black uppercase shadow-sm focus:ring-2 focus:ring-green-500 transition-all outline-none min-w-[150px]"
                                >
                                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="ml-auto">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-gray-100">
                                    Assigned: {filteredSections.length} Sections
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            // Skeleton loading state
                            [1, 2, 3].map(i => <div key={i} className="h-[220px] bg-gray-100 animate-pulse rounded-[2.5rem]" />)
                        ) : filteredSections.length > 0 ? (
                            filteredSections.map((item, idx) => (
                                <div 
                                    key={item.id || idx} 
                                    className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-full bg-[#22C55E]" />
                                    
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-[9px] font-black text-[#22C55E] uppercase tracking-widest">
                                            {item.dept_abbr || 'N/A'} • {item.program_abbr || 'COURSE'}
                                        </p>
                                    </div>

                                    <h3 className="text-xl font-black text-gray-800 uppercase italic leading-none tracking-tighter mb-4 pr-4">
                                        {item.course_name || item.subject}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Section:</span>
                                        <span className="text-[11px] font-black text-gray-800 uppercase italic bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                            {item.section_name || item.name}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleManageStudents(item)}
                                        className="w-full py-4 bg-slate-900 group-hover:bg-[#22C55E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                                    >
                                        Manage Students
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                    No assigned sections found matching filters.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ── VIEW: FOCUS (Section Dashboard with Tabs) ── */
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionDashboard
                        sectionData={activeSection}
                        onBack={() => { 
                            setView('list'); 
                            setActiveSection(null); 
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Management;