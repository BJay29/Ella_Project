import React, { useEffect } from 'react';
import StudentTable from './StudentTable';

// ─────────────────────────────────────────────────────────────────────────────
// SectionDashboard
//
// Props:
//   sectionData – full section object from the instructor's section list
//   onBack      – callback to return to the card list
// ─────────────────────────────────────────────────────────────────────────────
const SectionDashboard = ({ sectionData, onBack }) => {
    // ── Pre-render Check ──
    if (!sectionData) {
        console.error("SectionDashboard Error: No sectionData provided.");
        return null;
    }

    // ── Normalize field names — Consistent with Management.js logic ──────────
    // Sinisiguro natin na makuha ang tamang keys mula sa sectionData object
    const sectionId   = sectionData.id || sectionData.section_id || sectionData._id || sectionData.sectionId;
    const sectionName = sectionData.section_name || sectionData.name || sectionData.section || '—';
    const sectionCode = sectionData.section_code || sectionData.join_code || sectionData.code || '—';
    const courseName  = sectionData.course_name || sectionData.subject || sectionData.course || '—';
    const deptAbbr    = sectionData.dept_abbr || sectionData.dept || sectionData.department_abbr || '—';
    const programAbbr = sectionData.program_abbr || sectionData.program || sectionData.program_name || '—';

    // ── Debugging Log ──
    useEffect(() => {
        console.log("SectionDashboard Mounted with ID:", sectionId);
        if (!sectionId) {
            console.warn("Warning: sectionId is missing! Check your sectionData object keys.", sectionData);
        }
    }, [sectionId, sectionData]);

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Container para sa Student List. 
                Ang StudentTable ang main engine dito na nag-fefetch ng students
                base sa sectionId na ipinasa natin.
            */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[70vh]">
                {/* Mahalaga: Ang StudentTable ang mag-handle ng 'View Requests' button.
                    Dahil doon nifefetch ang student list, doon din natin gagawin ang 
                    filtering para sa mga students na may status === 'PENDING'.
                */}
                <StudentTable
                    sectionId={sectionId}
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