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

  // Normalize field names — API may return different shapes
  const sectionId   = sectionData.section_id   || sectionData._id          || sectionData.id;
  const sectionName = sectionData.section_name || sectionData.name         || sectionData.section;
  const sectionCode = sectionData.section_code || sectionData.join_code    || sectionData.code;
  const courseName  = sectionData.course_name  || sectionData.subject      || sectionData.course;
  const deptAbbr    = sectionData.dept_abbr    || sectionData.dept         || sectionData.department_abbr;
  const programAbbr = sectionData.program_abbr || sectionData.program      || sectionData.program_name;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">

      {/* ── Section Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all active:scale-90"
          >
            <span className="text-gray-400 font-black text-xl">←</span>
          </button>

          {/* Breadcrumb + Title */}
          <div>
            <p className="text-[10px] font-black text-[#22C55E] uppercase tracking-[0.2em] leading-none mb-1">
              {deptAbbr && programAbbr ? `${deptAbbr} • ${programAbbr}` : (deptAbbr || programAbbr || '')}
            </p>
            <h2 className="text-3xl font-black italic uppercase text-gray-800 tracking-tighter leading-none">
              {courseName}
              {sectionName && (
                <span className="text-[#22C55E] ml-2">— {sectionName}</span>
              )}
            </h2>
          </div>
        </div>

        {/* Right side: Student list label + optional section code badge */}
        <div className="hidden md:flex items-center gap-3">
          {sectionCode && (
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] px-5 py-3 rounded-2xl">
              <p className="text-[9px] font-black text-[#16a34a] uppercase tracking-widest mb-0.5">
                Section Code
              </p>
              <p className="text-sm font-black text-[#15803d] tracking-widest">
                {sectionCode}
              </p>
            </div>
          )}

          {/* Active tab indicator — Student List only (no Overview tab per spec) */}
          <div className="bg-gray-900 px-6 py-3 rounded-2xl">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">View</p>
            <p className="text-[11px] font-black text-white uppercase italic">Student List</p>
          </div>
        </div>
      </div>

      {/* ── Student List ── */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <StudentTable
          sectionId={sectionId}
          sectionName={sectionName}
          sectionCode={sectionCode}
          joinCode={sectionCode}
        />
      </div>
    </div>
  );
};

export default SectionDashboard;
