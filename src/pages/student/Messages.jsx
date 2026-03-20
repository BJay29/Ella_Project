import React, { useState } from 'react';

const Messages = () => {
  const [selectedContact, setSelectedContact] = useState(1);
  const [message, setMessage] = useState('');

  const contacts = [
    { id: 1, name: 'Anna L.',      role: 'instructor', initials: 'AL', color: 'bg-pink-500'   },
    { id: 2, name: 'Juan D.',      role: 'student',    initials: 'JD', color: 'bg-yellow-400' },
    { id: 3, name: 'Maria Santos', role: 'student',    initials: 'MS', color: 'bg-[#4CAF50]'  },
  ];

  const mockMessages = {
    1: [
      { id: 1, from: 'me',   text: 'Good morning, Prof. Garcia! I have a question about the speaking quiz.', time: '09:30 AM' },
      { id: 2, from: 'them', text: 'Good morning, Maria! Of course, what would you like to know?',           time: '09:35 AM' },
    ],
    2: [],
    3: [],
  };

  const active = contacts.find((c) => c.id === selectedContact);
  const messages = mockMessages[selectedContact] || [];

  const handleSend = () => {
    if (!message.trim()) return;
    setMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">💬 Messages</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Communicate with your instructor or classmates.</p>
      </div>

      <div className="flex gap-4 h-[520px]">

        {/* Contacts */}
        <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
            <p className="font-bold text-sm text-gray-700 dark:text-gray-200 px-1">Contacts</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact) => (
              <button key={contact.id} onClick={() => setSelectedContact(contact.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-700 last:border-none transition-colors text-left
                  ${selectedContact === contact.id ? 'bg-[#f0f7eb] dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}
              >
                <div className={`w-10 h-10 ${contact.color} rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                  {contact.initials}
                </div>
                <div className="min-w-0">
                  <p className={`font-bold text-sm truncate ${selectedContact === contact.id ? 'text-[#4CAF50]' : 'text-gray-800 dark:text-white'}`}>
                    {contact.name}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 capitalize">{contact.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden transition-colors">
          {active && (
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className={`w-10 h-10 ${active.color} rounded-full flex items-center justify-center text-white font-black text-sm`}>
                {active.initials}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800 dark:text-white">{active.name}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 capitalize">{active.role}</p>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <span className="text-4xl mb-3">💬</span>
                <p className="font-bold text-sm">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation!</p>
              </div>
            ) : (
              <>
                <div className="text-center text-xs text-gray-400 dark:text-gray-500 font-bold mb-2">Today</div>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.from === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.from === 'them' && (
                      <div className={`w-8 h-8 ${active?.color} rounded-full flex items-center justify-center text-white font-black text-xs flex-shrink-0`}>
                        {active?.initials}
                      </div>
                    )}
                    <div className={`max-w-[60%] px-4 py-3 rounded-2xl text-sm leading-snug
                      ${msg.from === 'me'
                        ? 'bg-[#4CAF50] text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'}`}
                    >
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right font-bold ${msg.from === 'me' ? 'text-white/70' : 'text-gray-400 dark:text-gray-400'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-full px-4 py-2.5">
              <input
                type="text" placeholder="Type a message..." value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
              />
              <button onClick={handleSend}
                className="w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center text-white hover:bg-[#43A047] transition-colors flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;