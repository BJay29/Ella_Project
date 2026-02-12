import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Home');
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 1. STATE PARA SA MODAL
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 2. LOGOUT LOGIC FUNCTIONS
  const handleLogoutClick = () => {
    setShowLogoutModal(true); 
  };

  const confirmLogout = () => {
    navigate('/login'); 
  };

  const quests = [
    { id: 1, title: 'Quest 1: Reading' },
    { id: 2, title: 'Quest 2: Reading' },
    { id: 3, title: 'Quest 3: Listening' },
    { id: 4, title: 'Quest 4: Listening' },
    { id: 5, title: 'Quest 5: Writing' },
    { id: 6, title: 'Quest 6: Writing' },
    { id: 7, title: 'Quest 7: Speaking' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#E5E5E5] overflow-hidden font-sans relative">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-[#D3D3D3] p-4 flex justify-between items-center border-b border-black/10">
        <h1 className="text-xl font-bold text-gray-800">Ella Quest</h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-[#388E3C] text-white rounded-lg"
        >
          <span className="material-icons">{isSidebarOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* SIDEBAR - Fixed height and Flex-Between layout */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:relative z-50 w-[280px] md:w-[300px] h-full bg-[#D3D3D3] flex flex-shrink-0 flex-col p-8 
        transition-transform duration-300 ease-in-out border-r border-black/5
      `}>
        <h1 className="hidden md:block text-4xl font-bold text-gray-800 mb-10">Ella Quest</h1>

        {/* NAVIGATION LINKS */}
        <nav className="flex flex-col gap-4 w-full">
          {['Home', 'Analytics', 'Skin Shop'].map((page) => (
            <button 
              key={page}
              onClick={() => {
                setActivePage(page);
                setIsSidebarOpen(false); 
              }}
              className={`py-3 px-8 rounded-full border border-black text-white font-semibold transition-all shadow-md text-sm md:text-base
                ${activePage === page ? 'bg-[#2E7D32]' : 'bg-[#388E3C] hover:bg-[#2E7D32]'}`}
            >
              {page}
            </button>
          ))}
        </nav>

        {/* CHARACTER IMAGE */}
        <div className="flex-1 flex items-center justify-center py-6 overflow-hidden">
          <img 
            src="/src/assets/image.png" 
            alt="Ella" 
            className="w-32 md:w-48 h-auto object-contain max-h-full"
          />
        </div>

        {/* LOGOUT BUTTON  */}
        <div className="mt-auto pt-6 pb-2 flex justify-center w-full">
            <button 
              onClick={handleLogoutClick} 
              className="bg-[#8DA674] hover:bg-red-600 text-white font-bold py-1.5 px-6 rounded-full border border-black shadow-sm transition-all 
              text-[10px] md:text-[11px] uppercase tracking-widest leading-none"
              style={{ minWidth: '120px' }} 
            >
              Logout
            </button>
        </div>
      </aside>

      {/* OVERLAY for mobile sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col p-4 md:p-10 overflow-hidden w-full">
        
        {/* User Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-10 gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-black bg-white flex items-center justify-center
             text-[8px] md:text-[10px] font-bold flex-shrink-0">
              Avatar
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold leading-none">User Name</h2>
              <p className="text-[10px] font-bold">Lvl: 99999</p>
            </div>
          </div>
          <div className="bg-[#4FC3F7] w-full sm:w-auto text-center px-6 md:px-8 py-2 rounded-full border border-black font-bold shadow-sm text-xs md:text-sm">
            Coins: 9999999
          </div>
        </div>

        {/* Home Content (Quest List) */}
        {activePage === 'Home' && (
          <div className="bg-[#1B5E20] rounded-[20px] md:rounded-[30px] p-4 md:p-8 shadow-xl max-w-4xl mx-auto border-2
           border-black/10 w-full flex flex-col overflow-hidden h-full">
            <div className="bg-[#2E7D32] border border-black text-white py-1 px-8 md:px-12 rounded-full w-max mx-auto 
            mb-4 md:mb-6 text-[10px] md:text-xs font-bold uppercase tracking-widest flex-shrink-0">
              Quest
            </div>

            <div className="bg-[#4FC3F7] rounded-[15px] md:rounded-[25px] p-3 md:p-4 border border-black overflow-y-auto scrollbar-hide flex-1">
              {quests.map((quest) => (
                <div key={quest.id} className="border-b border-black/10 last:border-0">
                  <div onClick={() => setSelectedQuest(selectedQuest === quest.id ? null : quest.id)} className="flex justify-between items-center py-2 md:py-3 px-2 
                  cursor-pointer hover:bg-sky-300/30 rounded-lg transition-all">
                    <span className="font-bold text-gray-800 text-xs md:text-sm">{quest.title}</span>
                    <span className="text-sm md:text-lg tracking-widest">☆☆☆</span>
                  </div>
                  {selectedQuest === quest.id && (
                    <div className="flex justify-center pb-3 md:pb-4 pt-1 animate-fadeIn">
                      <button className="bg-[#2E7D32] text-white px-6 md:px-8 py-1.5 rounded-lg border border-black text-xs md:text-sm 
                      font-bold hover:bg-[#1B5E20] shadow-sm transition-all" onClick={() => alert(`Play ${quest.title}`)}>
                        Play
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Pages Placeholder */}
        {activePage !== 'Home' && (
           <div className="flex-1 flex items-center justify-center text-gray-500 font-bold italic text-sm">
             {activePage} Content Coming Soon...
           </div>
        )}
      </main>

      {/* 3. LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#C1E1C1] p-8 rounded-[30px] border-2 border-black/10 shadow-2xl max-w-sm w-full text-center animate-fadeInModal">
            <h2 className="text-xl md:text-2xl font-bold mb-8 text-gray-800">
              Are you sure you want to Logout!?
            </h2>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={confirmLogout}
                className="bg-[#7B9565] text-white px-8 py-2 rounded-full font-bold hover:bg-green-800 transition-all border border-black/10"
              >
                Yes
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="bg-[#A4C46B] text-white px-8 py-2 rounded-full font-bold hover:bg-green-700 transition-all border border-black/10"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles for Scrollbar and Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInModal { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-fadeInModal { animation: fadeInModal 0.2s ease-out; }
      `}} />
    </div>
  );
};

export default StudentDashboard;