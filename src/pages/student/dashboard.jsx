import React, { useState } from 'react';

const StudentDashboard = () => {
  const [activePage, setActivePage] = useState('Home');
  const [selectedQuest, setSelectedQuest] = useState(null);

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
   
    <div className="flex h-screen w-full bg-[#E5E5E5] overflow-hidden font-sans">
      
      {/* SIDEBAR  */}
      <aside className="w-[300px] bg-[#D3D3D3] flex flex-col p-8 flex-shrink-0">
        <h1 className="text-4xl font-bold text-gray-800 mb-10">Ella Quest</h1>

        <nav className="flex flex-col gap-4 w-full">
          {['Home', 'Analytics', 'Skin Shop'].map((page) => (
            <button 
              key={page}
              onClick={() => setActivePage(page)}
              className={`py-3 px-8 rounded-full border border-black text-white font-semibold transition-all shadow-md
                ${activePage === page ? 'bg-[#2E7D32]' : 'bg-[#388E3C] hover:bg-[#2E7D32]'}`}
            >
              {page}
            </button>
          ))}
        </nav>

        <div className="mt-auto self-center">
          <img 
            src="/src/assets/image.png" 
            alt="Ella" 
            className="w-48 h-auto object-contain"
          />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col p-10 overflow-hidden">
        
        {/* Header*/}
        <div className="flex justify-between items-center mb-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-black bg-white flex items-center justify-center text-[10px] font-bold">
              Avatar
            </div>
            <div>
              <h2 className="text-xl font-bold leading-none">User Name</h2>
              <p className="text-[10px] font-bold">Lvl: 99999</p>
            </div>
          </div>
          <div className="bg-[#4FC3F7] px-8 py-2 rounded-full border border-black font-bold shadow-sm text-sm">
            Coins: 9999999
          </div>
        </div>

        {/* Quest Container */}
        {activePage === 'Home' && (
          <div className="bg-[#1B5E20] rounded-[30px] p-8 shadow-xl max-w-4xl mx-auto border-2 border-black/10 w-full flex flex-col overflow-hidden">
            <div className="bg-[#2E7D32] border border-black text-white py-1.5 px-12 rounded-full w-max mx-auto mb-6 text-xs 
            font-bold uppercase tracking-widest flex-shrink-0">
              Quest
            </div>

            {/* Quest List - Dito lang ang pwedeng mag-scroll */}
            <div className="bg-[#4FC3F7] rounded-[25px] p-4 border border-black overflow-y-auto scrollbar-hide">
              {quests.map((quest) => (
                <div key={quest.id} className="border-b border-black/10 last:border-0">
                  <div 
                    onClick={() => setSelectedQuest(selectedQuest === quest.id ? null : quest.id)}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-sky-300/30 rounded-lg transition-all"
                  >
                    <span className="font-bold text-gray-800 text-sm">{quest.title}</span>
                    <span className="text-lg tracking-widest">☆☆☆</span>
                  </div>

                  {selectedQuest === quest.id && (
                    <div className="flex justify-center pb-4 pt-1 animate-fadeIn">
                      <button 
                        className="bg-[#2E7D32] text-white px-8 py-1.5 rounded-lg border border-black text-sm font-bold hover:bg-[#1B5E20] shadow-sm transition-all"
                        onClick={() => alert(`Play ${quest.title}`)}
                      >
                        Play
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activePage !== 'Home' && (
           <div className="flex-1 flex items-center justify-center text-gray-500 font-bold italic">
             {activePage} Content Coming Soon...
           </div>
        )}
      </main>

      {/* Global Styles for animations and scroll hiding */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}} />
    </div>
  );
};

export default StudentDashboard;