import React from 'react';
import Sidebar from '../../component/Sidebar.jsx';

const Messaging = () => {
  // Mock data for the sidebar list
  const chatList = [
    { id: 1, name: 'John D.', msg: 'Sir tapus na po', time: '2m AGO', active: true },
    { id: 2, name: 'John D.', msg: 'Napasa kuna sir', time: '2m AGO', active: false },
  ];

  return (
    <div className="messaging-container">
      <Sidebar />
      
      <main className="messaging-main">
        {/* Header */}
        <header className="msg-header">
          <div className="msg-header-left">
            <h2 className="msg-brand">ELLA QUEST</h2>
            <span className="msg-user-role">[USER: INSTRUCTOR]</span>
          </div>
          <div className="msg-header-right">
            <div className="instructor-details">
              <span className="inst-name">Dr. David D</span>
              <span className="inst-id">Instructor ID: #0420</span>
            </div>
            <div className="header-actions">
              <span className="icon-bubble">💬</span>
              <div className="profile-circle">ED</div>
            </div>
          </div>
        </header>

        {/* Messaging Layout */}
        <div className="msg-content-wrapper">
          
          {/* Left: Chat List Panel */}
          <div className="chat-list-panel">
            <div className="search-bar-container">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search Students..." />
            </div>

            <div className="chat-items">
              {chatList.map((chat) => (
                <div key={chat.id} className={`chat-item ${chat.active ? 'active' : ''}`}>
                  <div className="avatar-small">ED</div>
                  <div className="chat-info">
                    <div className="chat-top-row">
                      <span className="chat-name">{chat.name}</span>
                      <span className="chat-time">{chat.time}</span>
                    </div>
                    <p className="chat-preview">{chat.msg}</p>
                  </div>
                </div>
              ))}
              {/* Empty space filler */}
              <div className="chat-list-filler"></div>
            </div>
          </div>

          {/* Right: Conversation Window */}
          <div className="conversation-panel">
            {/* Chat Header */}
            <div className="chat-window-header">
              <div className="avatar-medium">ED</div>
              <div>
                <h3 className="chat-partner-name">Ernie D.</h3>
                <span className="online-status">ONLINE</span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-area">
              <div className="date-separator">Today</div>
              
              {/* Incoming Message (Left) */}
              <div className="message-row incoming">
                <div className="avatar-msg">ED</div>
                <div className="bubble white">
                  <p>ako si ernie dadea hehhe</p>
                  <span className="msg-time">09:45 AM</span>
                </div>
              </div>

              {/* Outgoing Message (Right) */}
              <div className="message-row outgoing">
                <div className="bubble dark">
                  <p>OKIE</p>
                  <span className="msg-time">09:45 AM</span>
                </div>
                <div className="avatar-msg right">ED</div>
              </div>
            </div>

            {/* Input Area */}
            <div className="input-area">
              <div className="input-box">
                <span className="smiley-icon">☺</span>
                <input type="text" placeholder="Type your feedback message here..." />
                <button className="send-btn">➤</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Messaging;