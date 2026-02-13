import React from 'react';
import Sidebar from "/src/components/layout/Sidebar.jsx";

const InterventionQueue = () => {
  // Mock data nanatili
  const alerts = [
    { id: 1, name: 'Ana L.', quest: 3, skill: 'Listening', attempts: 2 },
    { id: 2, name: 'Ana L.', quest: 5, skill: 'Listening', attempts: 3 },
    { id: 3, name: 'Ana L.', quest: 2, skill: 'Listening', attempts: 4 },
  ];

  return (
    // Replaced .intervention-container with Tailwind
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      
      {/* Replaced .intervention-main */}
      <main className="flex-1 p-10">
        
        {/* Page Header - Replaced .page-header */}
        <header className="flex justify-between items-center border-b-4 border-black pb-2 mb-10">
          <h2 className="text-2xl font-black uppercase m-0">INTERVENTION</h2>
          <div className="flex gap-5 text-2xl">
            <span className="cursor-pointer hover:scale-110 transition-transform">💬</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">🔔</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">➡️</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="w-full">
          
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              <h3 className="text-base font-bold m-0">Intervention Alerts</h3>
            </div>
            <a href="#" className="text-[#6a5acd] no-underline text-sm font-bold hover:underline">
              View All Logs ➝
            </a>
          </div>

          <p className="text-sm text-gray-800 mt-0 mb-10">
            High-priority alerts for students failing to meet performance benchmarks.
          </p>

          {/* Alerts List */}
          <div className="flex flex-col gap-5">
            {alerts.map((alert) => (
              /* Alert Card - Replaced .alert-card */
              <div key={alert.id} className="bg-[#e0e0e0] rounded-[50px] py-5 px-10 flex items-center justify-between shadow-sm">
                
                {/* Left: Icon Box */}
                <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mr-5 shadow-sm shrink-0">
                  <div className="w-8 h-8 border-2 border-red-600 rounded-full text-red-600 font-bold text-xl flex items-center justify-center">
                    !
                  </div>
                </div>

                {/* Middle: Info Section */}
                <div className="flex-grow">
                  <h4 className="m-0 mb-1 text-lg font-bold">{alert.name}</h4>
                  <div className="text-[12px] text-gray-700 flex items-center gap-2 font-bold">
                    <span>📖 Quest {alert.quest}</span>
                    <span className="text-gray-400">|</span>
                    <span>👤 {alert.skill}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-red-600 flex items-center gap-1">
                      🔄 {alert.attempts} failed attempts
                    </span>
                  </div>
                </div>

                {/* Right: Actions Buttons */}
                <div className="flex gap-4 ml-4">
                  <button className="bg-black text-white border-none py-3 px-7 rounded-full font-bold text-[12px] tracking-wider cursor-pointer hover:opacity-80 active:scale-95 transition-all uppercase">
                    Review Student
                  </button>
                  <button className="bg-[#c0c0c0] text-white border-none py-3 px-7 rounded-full font-bold text-[12px] tracking-wider cursor-pointer hover:bg-[#a0a0a0] active:scale-95 transition-all uppercase">
                    Assign Remedial
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
};

export default InterventionQueue;