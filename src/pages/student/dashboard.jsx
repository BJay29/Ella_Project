import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [activePage, setActivePage] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('Macro Skills');

  const [showSettings, setShowSettings] = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  const [profileData, setProfileData] = useState({
    firstName: sessionStorage.getItem('firstName') || localStorage.getItem('firstName') || '',
    lastName:  sessionStorage.getItem('lastName')  || localStorage.getItem('lastName')  || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg,    setProfileMsg]    = useState({ type: '', text: '' });

  const firstName = profileData.firstName || 'Student';

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
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
      <StudentNavbar
        activePage={activePage}
        setActivePage={setActivePage}
        onSettingsClick={() => setShowSettings(true)}
        onProfileClick={() => setShowProfile(true)}
      />

      {activePage === 'My Courses'  && <MyCourses />}
      {activePage === 'My Quests'   && <MyQuests />}
      {activePage === 'My Progress' && <MyProgress />}
      {activePage === 'Leaderboard' && <Leaderboard />}
      {activePage === 'My Badges'   && <MyBadges />}
      {activePage === 'Messages'    && <Messages />}

      {activePage === 'Dashboard' && (
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Welcome Card */}
          <div className="bg-[#d4edda] dark:bg-green-900/30 rounded-2xl p-6 mb-6 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  Welcome back, {firstName}! 👋
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Keep going — your English journey...</p>
              </div>
              <div className="bg-[#4CAF50] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 flex-shrink-0">
                🔥 3-Day Streak! Don't stop now!
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-5">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/70 dark:bg-gray-800/60 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-gray-800 dark:text-white">{stat.value}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-tight leading-tight mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs + Content Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="flex border-b border-gray-100 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5
                    ${activeTab === tab
                      ? 'border-b-2 border-[#4CAF50] text-[#4CAF50]'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                  {tab === 'Macro Skills' && '📊'}
                  {tab === 'Active Quest' && '🎮'}
                  {tab === 'My Results'   && '📋'}
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'Macro Skills' && (
                <div>
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-1">Your Macro Skill</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">See All of your Macro Skills</p>
                  <div className="grid grid-cols-2 gap-3">
                    {macroSkills.map((skill) => (
                      <div key={skill.label} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer group bg-white dark:bg-gray-700/40">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-300 font-medium">{skill.emoji} {skill.label}</p>
                            <p className="text-[10px] text-gray-300 dark:text-gray-500 mt-0.5">{skill.status}</p>
                          </div>
                          <span className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity">{skill.emoji}</span>
                        </div>
                        <p className="text-2xl font-black text-gray-800 dark:text-white mb-2">{skill.percent}%</p>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div className={`h-full ${skill.color} rounded-full transition-all duration-700`} style={{ width: `${skill.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Active Quest' && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                  <span className="text-4xl mb-3">🎮</span>
                  <p className="font-bold text-sm">No active quest yet</p>
                  <p className="text-xs mt-1">Go to My Quests to start one</p>
                </div>
              )}

              {activeTab === 'My Results' && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                  <span className="text-4xl mb-3">📋</span>
                  <p className="font-bold text-sm">No results yet</p>
                  <p className="text-xs mt-1">Complete a quest to see your results here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!['Dashboard','My Courses','My Quests','My Progress','Leaderboard','My Badges','Messages'].includes(activePage) && (
        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
          <span className="text-5xl mb-4">🚧</span>
          <p className="font-bold text-lg">{activePage}</p>
          <p className="text-sm mt-1">Coming soon</p>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsCard
          onClose={() => setShowSettings(false)}
          soundEffects={soundEffects}
          setSoundEffects={setSoundEffects}
        />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/30 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transition-colors">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <h2 className="font-bold text-gray-800 dark:text-white text-base">Edit Profile</h2>
              </div>
              <button
                onClick={() => { setShowProfile(false); setProfileMsg({ type: '', text: '' }); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-xl font-bold leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >×</button>
            </div>

            <div className="flex flex-col items-center pt-6 pb-2">
              <div className="w-16 h-16 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-black text-2xl mb-2">
                {profileData.firstName?.[0]?.toUpperCase() || 'S'}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Student</p>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData((p) => ({ ...p, firstName: e.target.value }))}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-[#4CAF50] transition-colors bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData((p) => ({ ...p, lastName: e.target.value }))}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-[#4CAF50] transition-colors bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400"
                  placeholder="Last name"
                />
              </div>

              {profileMsg.text && (
                <div className={`text-xs font-semibold rounded-lg px-4 py-2.5 flex items-center gap-2
                  ${profileMsg.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400'}`}>
                  {profileMsg.type === 'success' ? '✅' : '❌'} {profileMsg.text}
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 border border-red-100 dark:border-red-800"
                >
                  <span className="text-lg">🚪</span> Logout Account
                </button>
              </div>
            </div>

            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={() => { setShowProfile(false); setProfileMsg({ type: '', text: '' }); }}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >Cancel</button>
              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="flex-1 py-2.5 rounded-xl bg-[#4CAF50] text-white font-bold text-sm hover:bg-[#43A047] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {profileSaving ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" /> Saving...</>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;