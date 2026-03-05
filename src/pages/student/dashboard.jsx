import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalyticsCard from './analyticscard'; 

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Home');
  const [selectedQuest, setSelectedQuest] = useState(null);
  
  // MODAL STATES
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');

  const handleLogoutClick = () => setShowLogoutModal(true);
  
  const confirmLogout = () => {
    // Linisin ang token para sa Unified Login logout
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const quests = [
    { id: 1, title: 'Quest 1: Reading', locked: false, progress: 67 },
    { id: 2, title: 'Quest 2: Reading', locked: false, progress: 0 },
    { id: 3, title: 'Quest 3: Listening', locked: true },
    { id: 4, title: 'Quest 4: Listening', locked: true },
    { id: 5, title: 'Quest 5: Writing', locked: true },
    { id: 6, title: 'Quest 6: Writing', locked: true },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-white overflow-hidden font-sans relative">
      
      {/* SIDEBAR */}
      <aside className="fixed md:relative z-40 w-[260px] md:w-[280px] h-full bg-[#C1E1C1] flex flex-col p-5 border-r border-black/5">
        <h1 className="text-4xl font-normal text-gray-800 mb-8 text-center">Ella Quest</h1>

        <nav className="flex flex-col gap-2 w-full px-2">
          {['Home', 'Analytics', 'Skin Shop', 'Settings'].map((page) => (
            <button 
              key={page}
              onClick={() => { 
                setActivePage(page); 
                setSelectedQuest(null); 
              }}
              className={`py-2 px-6 rounded-full font-medium transition-all text-sm border border-black/10
                ${activePage === page ? 'bg-[#A2BC56] text-white shadow-sm' : 'bg-[#8DA674]/70 text-gray-700 hover:bg-[#8DA674]'}`}
            >
              {page}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col items-center w-full">
          <div className="w-full flex justify-center">
            <img 
              src="/src/assets/image.png" 
              alt="Ella" 
              className="w-44 md:w-52 h-auto object-contain max-h-[35vh] transform translate-y-3" 
            />
          </div>
          <button 
            onClick={handleLogoutClick} 
            className="bg-[#8DA674] hover:bg-red-500 hover:text-white text-white font-bold py-1.5 px-10 rounded-full border border-black/10 text-[11px] transition-all mb-4 z-10 shadow-md w-max"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col p-4 md:p-8 bg-white overflow-hidden">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#A2BC56] border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white uppercase">
              Avatar
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">User Name</h2>
              <p className="text-[10px] text-gray-500 font-bold">Lvl: 99999</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4 mr-2">
                <button 
                  onClick={() => setShowCourseModal(true)}
                  className="bg-[#4CAF50] text-white w-9 h-9 flex items-center justify-center rounded-full text-2xl font-bold shadow-sm hover:scale-110 transition-transform"
                >
                  +
                </button>
                <div className="relative cursor-pointer">
                  <span className="text-3xl">💬</span>
                  <span className="absolute -top-1 -right-1 bg-[#FF4B4B] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">1</span>
                </div>
                <div className="relative cursor-pointer">
                  <span className="text-3xl">🔔</span>
                  <span className="absolute -top-1 -right-1 bg-[#FF4B4B] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">1</span>
                </div>
            </div>
            <div className="bg-[#A2BC56] text-white px-8 py-2 rounded-full border border-black/5 font-bold text-xs shadow-sm">
              Coins: 9999999
            </div>
          </div>
        </div>

        {/* --- DYNAMIC CONTENT AREA --- */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* HOME / QUEST VIEW */}
          {activePage === 'Home' && (
            <div className="bg-[#C1E1C1]/60 rounded-[40px] p-6 md:p-10 flex flex-col items-center flex-1 min-h-0 max-w-5xl mx-auto w-full border border-black/5 shadow-inner overflow-hidden">
              <div className="bg-white/60 px-16 py-1.5 rounded-full mb-8 text-xl font-medium text-gray-700 shadow-sm flex-shrink-0">
                Quest
              </div>

              <div className="w-full space-y-4 overflow-y-auto scrollbar-hide flex-1 px-4">
                {quests.map((quest) => (
                  <div key={quest.id} className="w-full">
                    <div 
                      onClick={() => !quest.locked && setSelectedQuest(selectedQuest === quest.id ? null : quest.id)}
                      className={`
                        relative rounded-full py-2.5 px-10 flex items-center transition-all border
                        ${quest.locked 
                          ? 'bg-white/30 border-white/20' 
                          : 'bg-white/70 hover:bg-white/90 border-white/50 cursor-pointer shadow-sm active:scale-[0.98]'}
                      `}
                    >
                      <span className={`font-medium text-sm md:text-base ${quest.locked ? 'text-gray-400 opacity-60' : 'text-gray-700'}`}>
                        {quest.title}
                      </span>
                      {quest.locked && (
                        <div className="absolute left-1/2 transform -translate-x-1/2">
                          <span className="text-yellow-500 text-xl drop-shadow-sm">🔒</span>
                        </div>
                      )}
                    </div>

                    {!quest.locked && selectedQuest === quest.id && (
                      <div className="mt-2 ml-6 mr-6 bg-white/40 rounded-[30px] p-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center px-4">
                            <span className="text-gray-700 text-sm font-medium">Progress: {quest.progress}%</span>
                            <div className="w-32 h-3 bg-black rounded-full overflow-hidden relative">
                              <div className="h-full bg-[#00FF00] shadow-[0_0_8px_#00FF00]" style={{ width: `${quest.progress}%` }}></div>
                              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#B5C7FF] rounded-full border border-gray-400" style={{ left: `calc(${quest.progress}% - 8px)` }}></div>
                            </div>
                          </div>
                          <div className="flex gap-4 justify-center">
                            <button className="bg-[#A2BC56] text-white px-8 py-2 rounded-xl font-bold shadow-md hover:scale-105 transition-all">Activity</button>
                            <button className="bg-[#A2BC56] text-white px-10 py-2 rounded-xl font-bold shadow-md hover:scale-105 transition-all">Quiz</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {activePage === 'Analytics' && (
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <AnalyticsCard />
            </div>
          )}

          {/* SKIN SHOP PLACEHOLDER */}
          {activePage === 'Skin Shop' && (
             <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                <span className="text-6xl mb-4">👕</span>
                <h3 className="text-2xl font-bold text-gray-400 italic">Skin Shop Coming Soon</h3>
             </div>
          )}

          {/* SETTINGS PLACEHOLDER */}
          {activePage === 'Settings' && (
             <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                <span className="text-6xl mb-4">⚙️</span>
                <h3 className="text-2xl font-bold text-gray-400 italic">Settings Coming Soon</h3>
             </div>
          )}

        </div>
      </main>

      {/* MODALS */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#C1E1C1] p-8 rounded-[30px] border border-white/30 shadow-2xl max-w-sm w-full text-center relative">
            <button onClick={() => setShowCourseModal(false)} className="absolute top-4 right-4 text-gray-600 font-bold">✕</button>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Enter Course Code</h2>
            <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="w-full py-3 px-6 rounded-full mb-6 text-center outline-none shadow-inner" placeholder="Type code here..." />
            <button onClick={() => setShowCourseModal(false)} className="bg-[#A2BC56] text-white px-12 py-2.5 rounded-full font-bold shadow-md">Join</button>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#C1E1C1] p-10 rounded-[40px] border border-white/30 shadow-2xl max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-8 text-gray-800">Are you sure you want to Logout!?</h2>
            <div className="flex gap-4 justify-center">
              <button onClick={confirmLogout} className="bg-[#7B9565] text-white px-10 py-2.5 rounded-full font-bold hover:bg-red-600 transition-all shadow-md">Yes</button>
              <button onClick={() => setShowLogoutModal(false)} className="bg-[#A4C46B] text-white px-10 py-2.5 rounded-full font-bold hover:bg-[#8DA674] transition-all shadow-md">No</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default StudentDashboard;