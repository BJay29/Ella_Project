import React, { useState, useMemo } from 'react';
import Management from './Management';

// --- COMPONENTS ---

// 1. CONFIRMATION MODAL COMPONENT (Logout Confirmation)
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
                <div className="text-center">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🚪</span>
                    </div>
                    <h3 className="text-gray-800 font-black uppercase italic text-xl tracking-tight leading-none">
                        Logging Out?
                    </h3>
                    <p className="text-gray-400 text-[10px] font-bold mt-2 uppercase tracking-widest leading-relaxed">
                        Are you sure you want to end your session, Prof. Garcia?
                    </p>
                </div>
                
                <div className="flex flex-col gap-2 mt-8">
                    <button 
                        onClick={onConfirm}
                        className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-100 active:scale-95"
                    >
                        Yes, Sign Out
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. TOP NAV STRIP (With Interactive Profile & Dropdown)
const TopNav = ({ onLogoutClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="bg-white w-full px-8 py-4 flex justify-between items-center border-b border-gray-100 relative z-50">
            <div className="flex items-center gap-2">
                <span className="font-black italic text-lg tracking-tighter text-gray-800 uppercase">
                    Ella Quest
                </span>
            </div>
            
            <div className="relative">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 hover:bg-gray-50 p-1 pr-3 rounded-full transition-all group"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-gray-800 leading-none">Prof. Garcia</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Instructor</p>
                    </div>
                    <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-orange-200 group-hover:scale-105 transition-transform">
                        PG
                    </div>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-50 py-2 z-20 animate-in slide-in-from-top-2 duration-200">
                            <button className="w-full px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest hover:bg-gray-50 transition-colors">
                                👤 Profile Settings
                            </button>
                            <div className="h-[1px] bg-gray-100 my-1 mx-4"></div>
                            <button 
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onLogoutClick();
                                }}
                                className="w-full px-4 py-3 text-left text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 transition-colors"
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// 3. ORANGE TITLE BANNER
const DashboardBanner = () => (
    <div className="px-4 md:px-8 mt-6">
        <div className="bg-[#F59E0B] w-full p-6 rounded-2xl shadow-xl shadow-orange-100 flex items-start gap-4 transition-transform hover:scale-[1.01] duration-300">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                <span className="text-xl">📋</span>
            </div>
            <div>
                <h1 className="text-white font-black italic uppercase text-lg leading-none tracking-tight">
                    Instructor Dashboard
                </h1>
                <p className="text-white/80 text-[10px] font-medium mt-1 uppercase tracking-tight">
                    Review student interventions and monitor performance
                </p>
            </div>
        </div>
    </div>
);

// Reusable StatCard Component
const StatCard = ({ icon, label, count, accentColor = "border-transparent" }) => (
    <div className={`bg-white p-5 rounded-[1.5rem] shadow-sm flex flex-col items-center justify-center border-b-4 ${accentColor} transition-all hover:scale-105 hover:shadow-md cursor-default`}>
        <span className="text-xl mb-1">{icon}</span>
        <div className="flex flex-col items-center leading-none">
            <span className="text-2xl font-black text-gray-800">{count}</span>
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-2 text-center leading-tight">
                {label}
            </span>
        </div>
    </div>
);

// Navigation Tab Component
const NavTab = ({ active, label, onClick, icon }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 pb-3 text-[10px] font-black tracking-widest transition-all relative group whitespace-nowrap ${
            active ? 'text-[#22C55E]' : 'text-gray-400 hover:text-gray-600'
        }`}
    >
        <span className={`${active ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>{icon}</span>
        {label}
        {active && (
            <div className="absolute -bottom-[1px] left-0 w-full h-[3px] bg-[#22C55E] rounded-full animate-in slide-in-from-left-2 duration-300" />
        )}
    </button>
);

// --- MAIN DASHBOARD ---

const InstructorDashboard = () => {
    const [activeTab, setActiveTab] = useState('courses');
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    
    // Stats calculation
    const stats = useMemo(() => ({
        pendingAlerts: 0,
        resolved: 0,
        totalStudents: 3,
        speakingPending: 0
    }), []);

    // LOGOUT LOGIC: Babalik sa login page
    const handleLogoutConfirm = () => {
        console.log("Redirecting to login...");
        // Linisin ang local storage o session kung kailangan
        localStorage.clear(); 
        sessionStorage.clear();
        
        // I-redirect ang user sa root login page
        window.location.href = '/login'; 
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] font-sans transition-colors duration-500">
            
            {/* MODALS */}
            <LogoutModal 
                isOpen={isLogoutModalOpen} 
                onClose={() => setIsLogoutModalOpen(false)} 
                onConfirm={handleLogoutConfirm} 
            />

            {/* TOP NAVIGATION STRIP */}
            <TopNav onLogoutClick={() => setIsLogoutModalOpen(true)} />

            {/* ORANGE BANNER SECTION */}
            <DashboardBanner />

            <div className="p-4 md:p-8 pt-6">
                
                {/* 1. TOP SECTION: STATS CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <StatCard icon="⚠️" label="Pending Alerts" count={stats.pendingAlerts} />
                    <StatCard icon="✅" label="Resolved" count={stats.resolved} accentColor="border-green-500" />
                    <StatCard icon="👥" label="Total Students" count={stats.totalStudents} />
                    <StatCard icon="🎤" label="Speaking Pending" count={stats.speakingPending} />
                </div>

                {/* 2. NAVIGATION TABS */}
                <div className="flex items-center gap-6 md:gap-10 px-6 pt-6 border-b border-gray-200 bg-transparent mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <NavTab active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} label="MY COURSES" icon="📚" />
                    <NavTab active={activeTab === 'interventions'} onClick={() => setActiveTab('interventions')} label="INTERVENTIONS" icon="⚠️" />
                    <NavTab active={activeTab === 'review'} onClick={() => setActiveTab('review')} label="SPEAKING REVIEW" icon="🎙️" />
                    <NavTab active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} label="MESSAGES" icon="💬" />
                </div>

                {/* 3. DYNAMIC CONTENT AREA */}
                <main className="transition-all duration-300">
                    {activeTab === 'courses' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-3">
                            <Management />
                        </div>
                    )}

                    {activeTab === 'interventions' && (
                        <div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm border border-gray-50 animate-in fade-in zoom-in-95">
                            <div className="text-4xl mb-4">⚠️</div>
                            <h3 className="text-gray-800 font-black uppercase italic text-xl tracking-widest">Interventions</h3>
                            <p className="text-gray-400 text-[10px] font-bold mt-2 uppercase tracking-widest">No active interventions for your sections.</p>
                        </div>
                    )}

                    {activeTab === 'review' && (
                        <div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm border border-gray-50 animate-in fade-in zoom-in-95">
                            <div className="text-4xl mb-4">🎙️</div>
                            <h3 className="text-gray-800 font-black uppercase italic text-xl tracking-widest">Speaking Review</h3>
                            <p className="text-gray-400 text-[10px] font-bold mt-2 uppercase tracking-widest">Pending student audio recordings will appear here.</p>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm border border-gray-50 animate-in fade-in zoom-in-95">
                            <div className="text-4xl mb-4">💬</div>
                            <h3 className="text-gray-800 font-black uppercase italic text-xl tracking-widest">Messages</h3>
                            <p className="text-gray-400 text-[10px] font-black mt-2 uppercase tracking-[0.2em]">Inbox is empty</p>
                        </div>
                    )}
                </main>

                <footer className="mt-12 pb-6 text-center">
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.5em]">
                        Instructor Portal v1.0 • Stable Build
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default InstructorDashboard;