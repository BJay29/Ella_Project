import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InstructorSidebar = ({ activePage, setActivePage, onLogout }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    // Use parent's onLogout if provided, otherwise handle it directly
    if (onLogout && typeof onLogout === 'function') {
      const isEmptyFn = onLogout.toString().replace(/\s/g, '') === '()=>{}';
      if (!isEmptyFn) {
        onLogout();
        return;
      }
    }
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    {
      label: 'Dashboard',
      page: 'Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: 'Class Progress',
      page: 'Class Progress',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: 'Alert Queue',
      page: 'Intervention Alerts',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      label: 'Review task',
      page: 'Review Task',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
        </svg>
      ),
    },
    {
      label: 'Analytics',
      page: 'Analytics Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      label: 'Message',
      page: 'Messaging',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
    },
  ];

  const routeMap = {
    'Dashboard': '/instructor/dashboard',
    'Class Progress': '/instructor/progress',
    'Intervention Alerts': '/instructor/alerts',
    'Review Task': '/instructor/review',
    'Analytics Dashboard': '/instructor/analytics',
    'Messaging': '/instructor/messaging',
  };

  const handleMenuClick = (item) => {
    setActivePage(item.page);
    if (routeMap[item.page]) {
      navigate(routeMap[item.page]);
    }
  };

  return (
    <aside className="w-[200px] min-h-screen bg-[#e8f5e0] border-r border-black/10 flex flex-col font-sans shrink-0">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-black/10">
        <h1 className="font-black text-xl leading-tight text-black tracking-tight">
          ELLA<br />QUEST
        </h1>
      </div>

      {/* Menu Label */}
      <div className="px-5 pt-5 pb-2">
        <span className="text-[11px] font-bold text-black/40 uppercase tracking-widest">Menu</span>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col px-3 gap-0.5 flex-1">
        {menuItems.map((item) => {
          const isActive = activePage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => handleMenuClick(item)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-left w-full transition-all
                ${isActive
                  ? 'text-[#4a7c2f] font-black'
                  : 'text-black/60 font-medium hover:text-black hover:bg-black/5'
                }
              `}
            >
              <span className={isActive ? 'text-[#4a7c2f]' : 'text-black/40'}>
                {item.icon}
              </span>
              <span className="text-[13px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 border-t border-black/10 mb-3" />

      {/* Bottom: Settings + Logout */}
      <div className="flex flex-col px-3 pb-6 gap-0.5">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-left w-full text-black/60 font-medium hover:text-black hover:bg-black/5 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          <span className="text-[13px]">Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-left w-full text-black/60 font-medium hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[13px]">Log out</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-6">
          <div className="bg-[#C1E1C1] w-full max-w-[450px] p-12 rounded-[50px] shadow-2xl flex flex-col items-center border-4 border-black">
            <h2 className="text-[#1A2E35] text-2xl font-black text-center leading-tight mb-10 italic">
              Are you sure you want to<br />Logout!?
            </h2>
            <div className="flex gap-6 w-full justify-center">
              <button
                onClick={confirmLogout}
                className="w-32 py-3 bg-[#718E5A] text-white border-2 border-black rounded-full font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-32 py-3 bg-[#A2C371] text-white border-2 border-black rounded-full font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default InstructorSidebar;