import React, { useEffect } from 'react';
import StudentTable from './StudentTable';

/**
 * SectionDashboard Component
 * * Props:
 * - sectionData: The full course/section object selected from the 5th dropdown.
 * - onBack: Callback function to return to the classroom list view.
 */
const SectionDashboard = ({ sectionData, onBack }) => {
    
    // --- Pre-render Validation ---
    if (!sectionData) {
        console.error("SectionDashboard Error: No sectionData provided.");
        return (
            <div className="p-10 text-center">
                <p className="text-red-500 font-bold">Error: Failed to load section data.</p>
                <button onClick={onBack} className="mt-4 text-blue-500 underline">Go Back</button>
            </div>
        );
    }

    /**
     * Data Normalization
     * Ensures we extract the correct keys regardless of API naming variations.
     * Since this now receives data from the "Course" level, we prioritize course_id.
     */
    const sectionId   = sectionData.section_id || sectionData.id || sectionData._id;
    const courseId    = sectionData.course_id; 
    const sectionName = sectionData.section_name || '—';
    const sectionCode = sectionData.section_code || sectionData.join_code || '—';
    const courseName  = sectionData.course_name || sectionData.subject || '—';
    const deptAbbr    = sectionData.dept_abbr || '—';
    const programAbbr = sectionData.program_abbr || '—';

    // --- Lifecycle Logging for Debugging ---
    useEffect(() => {
        console.log("SectionDashboard Mounted for Section ID:", sectionId, "and Course ID:", courseId);
        
        if (!sectionId) {
            console.warn("Warning: sectionId is missing. Check your API response keys.", sectionData);
        }
    }, [sectionId, courseId, sectionData]);

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Main Container for the Student List.
                The StudentTable acts as the engine that fetches students 
                based on the sectionId passed down.
            */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[70vh]">
                
                {/* Note: The StudentTable handles the 'View Requests' logic,
                    student list fetching, and filtering for 'PENDING' statuses.
                */}
                <StudentTable
                    sectionId={sectionId}
                    courseId={courseId}
                    sectionName={sectionName}
                    sectionCode={sectionCode}
                    joinCode={sectionCode}
                    courseName={courseName}
                    deptAbbr={deptAbbr}
                    programAbbr={programAbbr}
                    onBack={onBack} 
                />
            </div>
        </div>
    );
};

export default SectionDashboard;