import React, { useState, useCallback } from 'react';
import { NotificationContext } from './NotificationContext';

// ── Mock notifications covering all student-relevant events ──────────────────
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'enrollment_approved',
    icon: '✅',
    title: 'Enrollment Approved',
    message: 'You\'ve been accepted into Section A — English Fundamentals 2026 by Prof. Garcia.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),   // 5 min ago
    read: false,
    category: 'enrollment',
  },
  {
    id: 2,
    type: 'enrollment_pending',
    icon: '⏳',
    title: 'Join Request Sent',
    message: 'Your request to join Section B — English Fundamentals 2026 is pending approval.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),  // 30 min ago
    read: false,
    category: 'enrollment',
  },
  {
    id: 3,
    type: 'enrollment_rejected',
    icon: '❌',
    title: 'Enrollment Rejected',
    message: 'Your request to join Section C was rejected. Please contact your instructor.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),  // 1 hr ago
    read: true,
    category: 'enrollment',
  },
  {
    id: 4,
    type: 'quest_unlocked',
    icon: '🎮',
    title: 'New Quest Unlocked!',
    message: 'Quest 3 — Listening Skills is now available. Start your adventure!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hrs ago
    read: false,
    category: 'quest',
  },
  {
    id: 5,
    type: 'level_unlocked',
    icon: '🔓',
    title: 'Level Unlocked',
    message: 'You passed the activity! Level 3 in Reading Quest is now unlocked.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: true,
    category: 'quest',
  },
  {
    id: 6,
    type: 'quiz_passed',
    icon: '🏆',
    title: 'Quiz Passed!',
    message: 'You passed the Level 2 Quiz in Writing Quest with a score of 90%. Keep it up!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
    category: 'quiz',
  },
  {
    id: 7,
    type: 'quiz_failed',
    icon: '📝',
    title: 'Quiz Not Passed',
    message: 'You scored 55% on the Level 1 Quiz in Listening Quest. You need 70% to pass. Try again!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    read: true,
    category: 'quiz',
  },
  {
    id: 8,
    type: 'badge_earned',
    icon: '🏅',
    title: 'Badge Earned!',
    message: 'You earned the "Quick Learner" badge for completing 5 activities in one day.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    category: 'achievement',
  },
  {
    id: 9,
    type: 'streak',
    icon: '🔥',
    title: '3-Day Streak!',
    message: 'Amazing! You\'ve been learning for 3 days in a row. Don\'t break the streak!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    category: 'achievement',
  },
  {
    id: 10,
    type: 'leaderboard',
    icon: '📊',
    title: 'Leaderboard Update',
    message: 'You moved up to #3 on the Global Leaderboard! You\'re just 200 points from #1.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
    category: 'achievement',
  },
  {
    id: 11,
    type: 'message',
    icon: '💬',
    title: 'New Message',
    message: 'Prof. Garcia sent you a message: "Great work on your last quiz! Keep pushing."',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    read: true,
    category: 'message',
  },
  {
    id: 12,
    type: 'reminder',
    icon: '⏰',
    title: 'Learning Reminder',
    message: 'You haven\'t practiced today! Complete at least one activity to keep your streak alive.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    read: true,
    category: 'reminder',
  },
];

const NotificationProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem('ellaNotifications') === 'true'
  );

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('ellaNotifications', String(next));
      return next;
    });
  };

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markOneRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Add a real notification (used by MyCourses join flow)
  const addJoinNotification = useCallback((sectionCode, sectionName = '', courseName = '') => {
    const notif = {
      id: Date.now(),
      type: 'enrollment_pending',
      icon: '⏳',
      title: 'Join Request Sent',
      message: `Your request to join ${sectionName || sectionCode}${courseName ? ` — ${courseName}` : ''} is pending approval.`,
      timestamp: new Date().toISOString(),
      read: false,
      category: 'enrollment',
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notificationsEnabled,
      toggleNotifications,
      notifications,
      unreadCount,
      markAllRead,
      markOneRead,
      clearNotifications,
      addJoinNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;