import React from 'react';

const InterventionView = ({ students = [] }) => {
  // Logic para makuha lang ang mga "At Risk" (score < 75)
  const flaggedStudents = students.filter(s => (s.average_score || s.grade) < 75);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="mb-6 flex items-center gap-2">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          ⚠️ Pending Interventions
        </h2>
      </div>

      {flaggedStudents.length === 0 ? (
        /* EMPTY STATE: Ito yung lumalabas sa screenshot mo */
        <div className="flex flex-col items-center justify-center mt-20">
          <div className="text-8xl mb-4 transform hover:scale-110 transition-transform cursor-default">
            ✅
          </div>
          <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
            No pending interventions
          </h3>
        </div>
      ) : (
        /* DATA STATE: Ito ang lalabas kapag may kailangang i-intervene */
        <div className="grid grid-cols-1 gap-4">
          {flaggedStudents.map((student) => (
            <div 
              key={student.id} 
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-red-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 font-bold">
                  {student.name?.charAt(0) || "S"}
                </div>
                <div>
                  <h4 className="font-black text-gray-800 uppercase text-sm leading-none mb-1">
                    {student.name || student.student_name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Section: {student.section_name || 'Not Assigned'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Average</p>
                  <span className="text-lg font-black text-red-600">
                    {student.average_score || student.grade}%
                  </span>
                </div>
                <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black active:scale-95 transition-all shadow-lg">
                  Review Performance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterventionView;