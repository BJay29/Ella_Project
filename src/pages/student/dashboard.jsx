import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StudentNavbar from '../../components/layout/studentnavbar';
import MyCourses from './MyCourses';
import MyQuests from './MyQuests';
import MyProgress from './MyProgress';
import Leaderboard from './Leaderboard';
import MyBadges from './MyBadges';
import Messages from './Messages';
import SettingsCard from './settingscard';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ellaquest-backend.onrender.com';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Added to detect navigation state
  const dropdownRef = useRef(null);

  // --- STATES ---
  const [activePage, setActivePage] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('Macro Skills');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  const [profileData, setProfileData] = useState({
    firstName: sessionStorage.getItem('firstName') || localStorage.getItem('firstName') || '',
    lastName:  sessionStorage.getItem('lastName')  || localStorage.getItem('lastName')  || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const firstName = profileData.firstName || 'Student';

  // --- HANDLER FOR EXTERNAL NAVIGATION (Quest Navigation Support) ---
  useEffect(() => {
    // If the user is coming back from a specific Quest Level, 
    // we ensure the "My Quests" page is active.
    if (location.state?.activePage) {
      setActivePage(location.state.activePage);
    }
  }, [location]);

  // --- CLOSE DROPDOWN ON CLICK OUTSIDE ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleConfirmLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    navigate('/login', { replace: true });
  };

  const handleProfileSave = async () => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) return;
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE}/api/student/student/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ first_name: profileData.firstName, last_name: profileData.lastName }),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem('firstName', profileData.firstName);
        sessionStorage.setItem('lastName',  profileData.lastName);
        localStorage.setItem('firstName',   profileData.firstName);
        localStorage.setItem('lastName',    profileData.lastName);
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setShowProfileModal(false), 1500);
      } else {
        setProfileMsg({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const stats = [
    { label: 'Activities Done', value: 7   },
    { label: 'Quizzes Passed',  value: 4   },
    { label: 'Avg Score',       value: '80%' },
    { label: 'Global Rank',     value: '#3'  },
  ];

  const macroSkills = [
    { label: 'Reading',   emoji: '📖', percent: 80, status: 'Quest active', color: 'bg-[#4CAF50]'  },
    { label: 'Listening', emoji: '🎧', percent: 0,  status: 'Quest active', color: 'bg-blue-400'   },
    { label: 'Writing',   emoji: '✏️', percent: 0,  status: 'Quest active', color: 'bg-yellow-400' },
    { label: 'Speaking',  emoji: '🎤', percent: 0,  status: 'Quest active', color: 'bg-purple-400' },
  ];

  const tabs = ['Macro Skills', 'Active Quest', 'My Results'];

  return (
    <div className="min-h-screen bg-[#f0f4f0] dark:bg-gray-950 font-sans transition-colors duration-300">
      
      {/* --- NAVIGATION --- */}
      <div className="relative">
        <StudentNavbar
          activePage={activePage}
          setActivePage={setActivePage}
          onSettingsClick={() => setShowSettings(true)}
          onProfileClick={() => setShowDropdown(!showDropdown)} 
        />

        {/* --- PROFILE DROPDOWN MENU --- */}
        {showDropdown && (
          <div 
            ref={dropdownRef}
            className="absolute right-6 top-16 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[300] overflow-hidden"
          >
            <div className="p-2 space-y-1">
              <button
                onClick={() => { setShowProfileModal(true); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">👤</span> 
                Edit Profile
              </button>
              
              <div className="h-[1px] bg-gray-100 dark:bg-gray-700 mx-2" />
              
              <button
                onClick={() => { setShowLogoutConfirm(true); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">🚪</span> 
                Logout Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- PAGES --- */}
      {activePage === 'My Courses'  && <MyCourses />}
      {activePage === 'My Quests'   && <MyQuests />}
      {activePage === 'My Progress' && <MyProgress />}
      {activePage === 'Leaderboard' && <Leaderboard />}
      {activePage === 'My Badges'   && <MyBadges />}
      {activePage === 'Messages'    && <Messages />}

      {activePage === 'Dashboard' && (
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Welcome Card */}
          <div className="bg-[#d4edda] dark:bg-green-900/30 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  Welcome back, {firstName}! 👋
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Keep going — your English journey...</p>
              </div>
              <div className="bg-[#4CAF50] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                🔥 3-Day Streak!
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-5">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/70 dark:bg-gray-800/60 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-gray-800 dark:text-white">{stat.value}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-100 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-semibold transition-all
                    ${activeTab === tab ? 'border-b-2 border-[#4CAF50] text-[#4CAF50]' : 'text-gray-400'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-5">
              {activeTab === 'Macro Skills' && (
                <div className="grid grid-cols-2 gap-3">
                  {macroSkills.map((skill) => (
                    <div key={skill.label} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-700/40">
                      <p className="text-xs text-gray-500 dark:text-gray-300 font-medium">{skill.emoji} {skill.label}</p>
                      <p className="text-2xl font-black text-gray-800 dark:text-white my-1">{skill.percent}%</p>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className={`h-full ${skill.color}`} style={{ width: `${skill.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab !== 'Macro Skills' && (
                <div className="py-10 text-center text-gray-400 text-xs font-bold uppercase">No data available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS & MESSAGES --- */}
      
      {/* Settings Modal */}
      {showSettings && (
        <SettingsCard
          onClose={() => setShowSettings(false)}
          soundEffects={soundEffects}
          setSoundEffects={setSoundEffects}
        />
      )}

      {/* Simplified Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[500] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-[300px] p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Logout</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-[10px] uppercase hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-[10px] uppercase shadow-md shadow-red-200 dark:shadow-none transition-all hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 z-[400] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/20">
            <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-black text-gray-800 dark:text-white uppercase tracking-widest text-sm">Profile Settings</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-tr from-[#4CAF50] to-[#81C784] rounded-full flex items-center justify-center text-white font-black text-3xl shadow-lg mb-2">
                  {profileData.firstName?.[0]?.toUpperCase()}
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Student</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-1 block ml-1">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(p => ({ ...p, firstName: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-[#4CAF50] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-1 block ml-1">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(p => ({ ...p, lastName: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-[#4CAF50] transition-all"
                  />
                </div>
              </div>
              {profileMsg.text && (
                <div className={`mt-4 p-3 rounded-xl text-[10px] font-black uppercase text-center ${profileMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profileMsg.text}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 text-gray-400 font-black text-[10px] uppercase hover:bg-gray-50 transition-all"
                >Cancel</button>
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="py-3 rounded-2xl bg-[#4CAF50] text-white font-black text-[10px] uppercase shadow-md shadow-green-200 hover:shadow-lg transition-all disabled:opacity-50"
                >{profileSaving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;