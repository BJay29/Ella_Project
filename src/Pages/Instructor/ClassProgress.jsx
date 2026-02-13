import React from 'react';
import Sidebar from "/src/components/layout/Sidebar.jsx";

const ClassProgress = () => {
  // Mock data nanatili
  const studentData = [
    { name: 'John D', quest: 'Q1', skill: 'Listen', score: 0, status: '❌' },
    { name: 'John D', quest: 'Q2', skill: 'Speak', score: 0, status: '❌' },
    { name: 'John D', quest: 'Q3', skill: 'Speak', score: 0, status: '❌' },
    { name: 'John D', quest: 'Q4', skill: 'Write', score: 0, status: '❌' },
    { name: 'John D', quest: 'Q5', skill: 'Read', score: 0, status: '❌' },
  ];

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      
      <main className="flex-1 p-10">
        {/* Top Header - Replaced .progress-header */}
        <header className="flex justify-between items-center border-b-[3px] border-black pb-2.5 mb-10">
          <h2 className="text-2xl font-black uppercase m-0">Progress</h2>
          <div className="flex gap-5 text-2xl">
            <span className="cursor-pointer hover:scale-110 transition-transform">💬</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">🔔</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">➡️</span>
          </div>
        </header>

        {/* Content Box - Replaced .progress-content-box */}
        <div className="bg-[#d9d9d9] p-8 rounded-xl shadow-inner">
          
          {/* Controls Row: Title + Search - Replaced .controls-row */}
          <div className="flex justify-between items-center mb-5 border-b-2 border-black pb-4">
            <h3 className="m-0 text-lg font-bold">Student Progress Overview</h3>
            <div className="bg-transparent border-2 border-black rounded-full flex items-center px-4 py-1.5 w-[150px]">
              <span className="mr-2 text-sm">🔍</span>
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-transparent border-none outline-none w-full font-bold placeholder-black/50 text-sm" 
              />
            </div>
          </div>

          {/* Filters Row - Replaced .filters-row */}
          <div className="flex gap-4 mb-5 border-b-2 border-black pb-4">
            <div className="border-2 border-black py-1 px-4 rounded font-bold text-sm cursor-pointer hover:bg-black/5 transition-colors">
                Class ▾
            </div>
            <div className="border-2 border-black py-1 px-4 rounded font-bold text-sm cursor-pointer hover:bg-black/5 transition-colors">
                Quest ▾
            </div>
            <div className="border-2 border-black py-1 px-4 rounded font-bold text-sm cursor-pointer hover:bg-black/5 transition-colors">
                Skill ▾
            </div>
          </div>

          {/* Data Table - Replaced .progress-table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left p-2.5 text-sm font-bold">Student</th>
                <th className="text-left p-2.5 text-sm font-bold">Quest</th>
                <th className="text-left p-2.5 text-sm font-bold">Skill</th>
                <th className="text-left p-2.5 text-sm font-bold">Score</th>
                <th className="text-left p-2.5 text-sm font-bold">Status</th>
                <th className="text-left p-2.5 text-sm font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {studentData.map((row, index) => (
                <tr key={index} className="border-b border-gray-600 last:border-none hover:bg-black/5 transition-colors">
                  <td className="p-4 text-sm font-bold">{row.name}</td>
                  <td className="p-4 text-sm">{row.quest}</td>
                  <td className="p-4 text-sm">{row.skill}</td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-2.5 min-w-[120px]">
                      <span className="w-8">{row.score}%</span> 
                      <div className="h-1.5 w-24 border border-black rounded-full bg-transparent overflow-hidden">
                        <div className="h-full bg-gray-600" style={{width: `${row.score}%`}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-lg">{row.status}</div>
                  </td>
                  <td className="p-4">
                    <button className="bg-transparent border-2 border-black rounded-full py-1 px-4 font-bold text-[12px] flex items-center gap-1.5 hover:bg-black hover:text-white transition-all active:scale-95">
                      👁 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </main>
    </div>
  );
};

export default ClassProgress;