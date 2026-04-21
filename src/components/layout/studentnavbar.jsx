import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../context/useNotification';

// ── helpers ───────────────────────────────────────────────────────────────────

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const CATEGORY_COLORS = {
  enrollment:  'bg-blue-50 dark:bg-blue-900/20',
  quest:       'bg-purple-50 dark:bg-purple-900/20',
  quiz:         'bg-orange-50 dark:bg-orange-900/20',
  achievement: 'bg-yellow-50 dark:bg-yellow-900/20',
  message:     'bg-green-50 dark:bg-green-900/20',
  reminder:    'bg-gray-50 dark:bg-gray-700/30',
};

const UNREAD_DOT = 'w-2 h-2 rounded-full flex-shrink-0 mt-1.5';

// ── NotificationPanel ─────────────────────────────────────────────────────────

const NotificationPanel = () => {
  const { notifications, unreadCount, markAllRead, markOneRead, clearNotifications } = useNotification();
  const [filter, setFilter] = useState('all');

  const categories = ['all', 'enrollment', 'quest', 'quiz', 'achievement', 'message', 'reminder'];

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.category === filter);

  return (
    <div className="absolute right-0 top-full mt-2 w-[360px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[300] overflow-hidden flex flex-col"
      style={{ maxHeight: '480px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800 dark:text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[11px] text-[#4CAF50] font-bold hover:underline">
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearNotifications} className="text-[11px] text-gray-400 hover:text-red-500 font-bold hover:underline">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1 px-3 py-2 overflow-x-auto flex-shrink-0 border-b border-gray-50 dark:border-gray-700 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap capitalize transition-all flex-shrink-0
              ${filter === cat
                ? 'bg-[#4CAF50] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 divide-y divide-gray-50 dark:divide-gray-700/50">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <span className="text-4xl mb-3">🔔</span>
            <p className="text-xs font-semibold">No notifications here</p>
          </div>
        ) : (
          filtered.map((n) => (
            <button
              key={n.id}
              onClick={() => markOneRead(n.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:brightness-95
                ${!n.read
                  ? (CATEGORY_COLORS[n.category] || 'bg-green-50 dark:bg-green-900/10')
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                }`}
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center flex-shrink-0 text-base border border-gray-100 dark:border-gray-600">
                {n.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold leading-snug dark:text-white
                  ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>
                  {n.title}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug line-clamp-2">
                  {n.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.timestamp)}</p>
              </div>

              {/* Unread dot */}
              {!n.read && <span className={`${UNREAD_DOT} bg-[#4CAF50]`} />}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-50 dark:border-gray-700 flex-shrink-0">
        <p className="text-[10px] text-gray-400 text-center">
          {notifications.length} total · {unreadCount} unread
        </p>
      </div>
    </div>
  );
};

// ── StudentNavbar ─────────────────────────────────────────────────────────────

const StudentNavbar = ({ activePage, setActivePage, onSettingsClick, onProfileClick, studentStats }) => {
  const { notificationsEnabled, unreadCount } = useNotification();
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const bellRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems = [
    { label: 'Dashboard',   emoji: '📊' },
    { label: 'My Courses',  emoji: '📚' },
    { label: 'My Quests',   emoji: '🎮' },
    { label: 'My Progress', emoji: '📈' },
    { label: 'Leaderboard', emoji: '🏆' },
    { label: 'My Badges',   emoji: '🏅' },
    { label: 'Messages',    emoji: '💬' },
  ];

  const firstName = sessionStorage.getItem('firstName') || localStorage.getItem('firstName') || 'S';
  const lastName  = sessionStorage.getItem('lastName')  || localStorage.getItem('lastName')  || '';
  const fullName  = `${firstName} ${lastName}`.trim();
  const initials  = `${firstName[0] || 'S'}`.toUpperCase();

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="flex items-center h-[56px] px-6 gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0 mr-4">
          <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">E</span>
          </div>
          <span className="font-bold text-gray-800 dark:text-white">Ella Quest</span>
        </div>

        {/* Nav items */}
        <div className="flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActivePage(item.label)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all
                ${activePage === item.label
                  ? 'bg-[#4CAF50] text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white'}`}
            >
              <span className="text-sm">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {/* Points & Coins Display */}
          <div className="flex items-center gap-3 mr-2">
            {/* Points */}
            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1 rounded-full border border-yellow-100 dark:border-yellow-700/50">
              <span className="text-sm">⭐</span>
              <span className="text-xs font-black text-gray-700 dark:text-yellow-500">
                {studentStats?.points || 0}
              </span>
            </div>
            
            {/* Coins */}
            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-700/50">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-black text-gray-700 dark:text-blue-400">
                {studentStats?.coins || 0}
              </span>
            </div>
          </div>

          {/* 🔔 Bell — only visible when notifications enabled */}
          {notificationsEnabled && (
            <div ref={bellRef} className="relative">
              <button
                onClick={() => setShowNotifPanel((v) => !v)}
                className="relative text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                title="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifPanel && <NotificationPanel />}
            </div>
          )}

          {/* Settings */}
          <button
            onClick={onSettingsClick}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>

          {/* Profile */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onProfileClick}
            title="Edit Profile"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight">{fullName}</p>
              <p className="text-[10px] text-gray-400 leading-tight">Student</p>
            </div>
            <div className="w-9 h-9 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-black text-sm">
              {initials}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;