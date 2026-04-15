import React from 'react';
import StudentTable from './StudentTable';

// ─────────────────────────────────────────────────────────────────────────────
// SectionDashboard
//
// Props:
//   sectionData – full section object from the instructor's section list
//   onBack      – callback to return to the card list
// ─────────────────────────────────────────────────────────────────────────────
const SectionDashboard = ({ sectionData, onBack }) => {
    if (!sectionData) return null;

    // ── Normalize field names — Consistent with Management.js logic ──────────
    const sectionId   = sectionData.id           || sectionData.section_id || sectionData._id;
    const sectionName = sectionData.section_name || sectionData.name       || sectionData.section;
    const sectionCode = sectionData.section_code || sectionData.join_code   || sectionData.code;
    const courseName  = sectionData.course_name  || sectionData.subject     || sectionData.course;
    const deptAbbr    = sectionData.dept_abbr    || sectionData.dept        || sectionData.department_abbr;
    const programAbbr = sectionData.program_abbr || sectionData.program     || sectionData.program_name;

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Container para sa Student List. 
                Inalis natin ang hiwalay na Header dito dahil ang StudentTable 
                na ang may hawak ng Search, Back button, at Section Title 
                para sa mas cohesive na Dashboard look.
            */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[70vh]">
                {/* Pass normalized data + onBack callback.
                    Ang onBack ay kailangan ipasa para yung "Back to Sections" button 
                    sa loob ng StudentTable ay gumana.
                */}
                <StudentTable
                    sectionId={sectionId}
                    sectionName={sectionName}
                    sectionCode={sectionCode}
                    joinCode={sectionCode}
                    courseName={courseName}
                    onBack={onBack} 
                />
            </div>
        </div>
    );
};

export default SectionDashboard;