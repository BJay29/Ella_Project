import React from 'react';

// --- MOCK DATA PARA SA MGA ESTUDYANTE ---
const MOCK_STUDENTS = [
    { id: '2021-0001', name: 'JUAN DELA CRUZ', email: 'juan.dc@univ.edu.ph', status: 'Active', progress: 85 },
    { id: '2021-0042', name: 'MARIA CLARA', email: 'm.clara@univ.edu.ph', status: 'Active', progress: 92 },
    { id: '2021-0105', name: 'JOSE RIZAL', email: 'j.rizal@univ.edu.ph', status: 'Pending', progress: 0 },
    { id: '2022-0312', name: 'SIMOUN IBARRA', email: 's.ibarra@univ.edu.ph', status: 'Active', progress: 45 },
];

const StudentTable = ({ sectionName, onBack }) => {
    return (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            {/* Header ng Table Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <button 
                        onClick={onBack}
                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline mb-2 block"
                    >
                        ← Back to Sections
                    </button>
                    <h2 className="text-3xl font-black italic uppercase text-gray-800 tracking-tighter leading-none">
                        Section {sectionName || 'N/A'}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">
                        Student Roster & Performance Monitoring
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                        Export CSV
                    </button>
                    <button className="flex-1 md:flex-none bg-[#22C55E] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all">
                        + Add Student
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Progress</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {MOCK_STUDENTS.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <span className="text-[11px] font-black text-gray-400 group-hover:text-indigo-600 transition-colors">
                                            {student.id}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div>
                                            <p className="text-sm font-black text-gray-800 uppercase italic leading-none">
                                                {student.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1">
                                                {student.email}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                            student.status === 'Active' 
                                            ? 'bg-green-100 text-green-600' 
                                            : 'bg-amber-100 text-amber-600'
                                        }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                                                <div 
                                                    className="h-full bg-[#22C55E] rounded-full" 
                                                    style={{ width: `${student.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-700 italic">
                                                {student.progress}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer / Pagination Placeholder */}
                <div className="bg-gray-50/30 px-8 py-4 border-t border-gray-50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Showing {MOCK_STUDENTS.length} students enrolled in this section
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentTable;