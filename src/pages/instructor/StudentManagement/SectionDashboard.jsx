import React, { useEffect } from 'react';
import StudentTable from './StudentTable';

/**
 * SectionDashboard Component
 * * Props:
 * - sectionData: The full object containing Dept, Program, Year, Section, and Course info.
 * - onBack: Callback function to return to the Management list view.
 */
const SectionDashboard = ({ sectionData, onBack }) => {
    
    // --- Pre-render Validation ---
    if (!sectionData) {
        console.error("SectionDashboard Error: No sectionData provided.");
        return (
            <div className="p-10 text-center">
                <p className="text-red-500 font-bold uppercase tracking-tighter">
                    Error: Failed to load section data.
                </p>
                <button 
                    onClick={onBack} 
                    className="mt-4 text-[11px] font-black uppercase text-blue-600 hover:underline"
                >
                    Return to Selection
                </button>
            </div>
        );
    }

    /**
     * Data Normalization
     * Mapping keys from the sectionData object to local variables.
     * Includes the Year Level which was previously missing.
     */
    const sectionId    = sectionData.section_id || sectionData.id;
    const courseId     = sectionData.course_id; 
    const yearLevelId  = sectionData.year_level_id;
    
    // Display Names
    const sectionName  = sectionData.section_name || '—';
    const courseName   = sectionData.course_name || '—';
    const yearLevel    = sectionData.year_level || '—'; // Added Year Level support
    const deptAbbr     = sectionData.dept_abbr || '—';
    const programAbbr  = sectionData.program_abbr || '—';
    
    // Identifiers/Codes
    const sectionCode  = sectionData.section_code || sectionData.join_code || '—';
    const courseCode   = sectionData.course_code || '—';

    // --- Debugging Log ---
    useEffect(() => {
        console.log("SectionDashboard Active:", {
            Section: sectionId,
            Course: courseId,
            Year: yearLevel
        });
        
        if (!sectionId || !courseId) {
            console.warn("Missing Critical IDs: Ensure Management.js is passing the full object.");
        }
    }, [sectionId, courseId, yearLevel]);

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Main Wrapper for the Student Management Interface.
                The StudentTable handles the actual data fetching for students 
                enrolled in this specific Section/Course combination.
            */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[70vh]">
                
                {/* Passing the normalized data to StudentTable.
                    The StudentTable will use these to display headers and 
                    filter student requests (Pending/Approved).
                */}
                <StudentTable
                    sectionId={sectionId}
                    courseId={courseId}
                    yearLevelId={yearLevelId}
                    sectionName={sectionName}
                    sectionCode={sectionCode}
                    joinCode={sectionCode}
                    courseName={courseName}
                    courseCode={courseCode}
                    yearLevel={yearLevel}
                    deptAbbr={deptAbbr}
                    programAbbr={programAbbr}
                    onBack={onBack} 
                />
            </div>
        </div>
    );
};

export default SectionDashboard;