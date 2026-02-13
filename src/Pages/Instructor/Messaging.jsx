import React from 'react';
import Sidebar from "/src/components/layout/Sidebar.jsx";

const Messaging = () => {
  const chatList = [
    { id: 1, name: 'John D.', msg: 'Sir tapus na po', time: '2m AGO', active: true },
    { id: 2, name: 'John D.', msg: 'Napasa kuna sir', time: '2m AGO', active: false },
  ];

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col py-5 px-10">
        {/* Header - Replaced .msg-header */}
        <header className="flex justify-between items-center border-b-[3px] border-black pb-2.5 mb-5">
          <div className="flex items-center gap-5">
            <h2 className="font-black text-lg m-0">ELLA QUEST</h2>
            <span className="font-bold text-[12px] uppercase">[User: Instructor]</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right flex flex-col">
              <span className="font-bold text-sm">Dr. David D</span>
              <span className="text-[12px] font-bold text-gray-600">Instructor ID: #0420</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl cursor-pointer">💬</span>
              <div className="w-[35px] h-[35px] bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 text-[12px]">
                ED
              </div>
            </div>
          </div>
        </header>

        {/* Messaging Layout - Replaced .msg-content-wrapper */}
        <div className="flex gap-5 flex-1 overflow-hidden mb-5">
          
          {/* Left: Chat List Panel - Replaced .chat-list-panel */}
          <div className="w-[300px] flex flex-col">
            <div className="bg-[#d9d9d9] rounded-t-[20px] p-2.5 px-4 flex items-center gap-2.5 border-b border-black/10">
              <span className="text-sm">🔍</span>
              <input 
                type="text" 
                placeholder="Search Students..." 
                className="bg-transparent border-none outline-none text-[12px] w-full placeholder-black/50"
              />
            </div>

            <div className="bg-[#d9d9d9] flex-1 overflow-y-auto border-t border-black/5">
              {chatList.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`flex p-4 border-b border-black/20 cursor-pointer transition-colors ${chat.active ? 'bg-[#e5e5e5]' : 'bg-[#d9d9d9] hover:bg-black/5'}`}
                >
                  <div className="w-[35px] h-[35px] bg-white rounded-full flex items-center justify-center text-[10px] font-bold mr-2.5 shrink-0 shadow-sm">
                    ED
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-[13px] truncate">{chat.name}</span>
                      <span className="text-[10px] text-gray-600 shrink-0">{chat.time}</span>
                    </div>
                    <p className="m-0 text-[12px] text-gray-700 truncate font-medium">{chat.msg}</p>
                  </div>
                </div>
              ))}
              <div className="flex-1 bg-[#d9d9d9] min-h-[50px]"></div>
            </div>
          </div>

          {/* Right: Conversation Window - Replaced .conversation-panel */}
          <div className="flex-1 flex flex-col border border-black/5 rounded-[15px] overflow-hidden">
            {/* Chat Header */}
            <div className="bg-[#d9d9d9] p-2.5 px-5 flex items-center gap-4 border-b border-black/10">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">ED</div>
              <div>
                <h3 className="m-0 text-sm font-bold">Ernie D.</h3>
                <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">● Online</span>
              </div>
            </div>

            {/* Messages Area - Replaced .messages-area */}
            <div className="flex-1 bg-[#d9d9d9] p-5 overflow-y-auto flex flex-col gap-5">
              <div className="text-center text-[12px] text-gray-600 font-bold mb-2">Today</div>
              
              {/* Incoming Message (Left) */}
              <div className="flex gap-2.5 items-end">
                <div className="w-[30px] h-[30px] bg-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">ED</div>
                <div className="bg-white p-4 rounded-[15px] rounded-bl-none max-w-[60%] shadow-sm">
                  <p className="m-0 mb-1 text-sm font-bold text-gray-800">ako si ernie dadea hehhe</p>
                  <span className="text-[10px] block text-right text-gray-400 font-bold tracking-tighter">09:45 AM</span>
                </div>
              </div>

              {/* Outgoing Message (Right) */}
              <div className="flex gap-2.5 items-end justify-end">
                <div className="bg-[#555] text-white p-4 rounded-[15px] rounded-br-none max-w-[60%] shadow-md">
                  <p className="m-0 mb-1 text-sm font-bold">OKIE</p>
                  <span className="text-[10px] block text-right text-gray-300 font-bold tracking-tighter">09:45 AM</span>
                </div>
                <div className="w-[30px] h-[30px] bg-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">ED</div>
              </div>
            </div>

            {/* Input Area - Replaced .input-area */}
            <div className="bg-white py-5">
              <div className="bg-gray-100 rounded-[30px] flex items-center px-5 py-2.5 mx-2">
                <span className="text-xl mr-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">☺</span>
                <input 
                  type="text" 
                  placeholder="Type your feedback message here..." 
                  className="flex-1 border-none bg-transparent outline-none text-sm font-medium"
                />
                <button className="bg-black text-white w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] cursor-pointer hover:scale-105 active:scale-95 transition-all">
                  ➤
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Messaging;