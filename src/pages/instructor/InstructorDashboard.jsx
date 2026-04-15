import React, { useState, useMemo } from 'react';
import Management from './Management';
import PendingApproval from './StudentManagement/PendingApproval';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
                <div className="text-center">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🚪</span>
                    </div>
                    <h3 className="text-gray-800 font-black uppercase italic text-xl tracking-tight leading-none">Logging Out?</h3>
                    <p className="text-gray-400 text-[10px] font-bold mt-2 uppercase tracking-widest leading-relaxed">
                        Are you sure you want to end your session?
                    </p>
                </div>
                <div className="flex flex-col gap-2 mt-8">
                    <button onClick={onConfirm} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">
                        Yes, Sign Out
                    </button>
                    <button onClick={onClose} className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

const TopNav = ({ onLogoutClick, userName, userInitials }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <div className="bg-white w-full px-8 py-4 flex justify-between items-center border-b border-gray-100 relative z-50">
            <span className="font-black italic text-lg tracking-tighter text-gray-800 uppercase">Ella Quest</span>
            <div className="relative">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 hover:bg-gray-50 p-1 pr-3 rounded-full transition-all group"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-gray-800 leading-none">{userName}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Instructor</p>
                    </div>
                    <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg group-hover:scale-105 transition-transform">
                        {userInitials}
                    </div>
                </button>
                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-50 py-2 z-20 animate-in slide-in-from-top-2 duration-200">
                            <button className="w-full px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest hover:bg-gray-50">
                                👤 Profile Settings
                            </button>
                            <div className="h-[1px] bg-gray-100 my-1 mx-4" />
                            <button
                                onClick={() => { setIsMenuOpen(false); onLogoutClick(); }}
                                className="w-full px-4 py-3 text-left text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50"
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

const StatCard = ({ icon, label, count, accentColor = 'border-transparent' }) => (
    <div className={`bg-white p-5 rounded-[1.5rem] shadow-sm flex flex-col items-center justify-center border-b-4 ${accentColor} transition-all hover:scale-105 cursor-default`}>
        <span className="text-xl mb-1">{icon}</span>
        <div className="flex flex-col items-center leading-none">
            <span className="text-2xl font-black text-gray-800">{count}</span>
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-2 text-center">{label}</span>
        </div>
    </div>
);

const NavTab = ({ active, label, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 pb-3 text-[10px] font-black tracking-widest transition-all relative group ${
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

// ─────────────────────────────────────────────────────────────────────────────
// InstructorDashboard
// ─────────────────────────────────────────────────────────────────────────────
const InstructorDashboard = () => {
    const [activeTab, setActiveTab] = useState('courses');
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [showPending, setShowPending] = useState(false);
    
    const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Instructor';
    const userInitials = userName.split(' ').map(w => w[0]?.toUpperCase() || '').slice(0, 2).join('') || 'IN';

    const stats = useMemo(() => ({
        pendingAlerts: 0, resolved: 0, totalStudents: 0, speakingPending: 0,
    }), []);

    const handleLogoutConfirm = () => {
        localStorage.removeItem('token');
        sessionStorage.clear();
        window.location.href = '/login';
    };

    // ── RENDER PENDING VIEW ──────────────────────────────────────────────
    if (showPending) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] font-sans">
                <TopNav onLogoutClick={() => setIsLogoutModalOpen(true)} userName={userName} userInitials={userInitials} />
                <PendingApproval onBack={() => setShowPending(false)} />
                <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogoutConfirm} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F4F6] font-sans pb-10">
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogoutConfirm}
            />

            <TopNav
                onLogoutClick={() => setIsLogoutModalOpen(true)}
                userName={userName}
                userInitials={userInitials}
            />

            {/* Hero Banner Section */}
            <div className="px-4 md:px-8 mt-6">
                <div className="bg-[#F59E0B] w-full p-8 rounded-[2rem] shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md hidden sm:block">
                            <span className="text-2xl">📋</span>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-white font-black italic uppercase text-2xl leading-none tracking-tight">
                                Instructor Dashboard
                            </h1>
                            <p className="text-white/80 text-[11px] font-bold mt-2 uppercase tracking-widest">
                                Review student interventions and monitor performance
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 pt-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <StatCard icon="⚠️" label="Pending Alerts"   count={stats.pendingAlerts} />
                    <StatCard icon="✅" label="Resolved"          count={stats.resolved}      accentColor="border-green-500" />
                    <StatCard icon="👥" label="Total Students"    count={stats.totalStudents} />
                    <StatCard icon="🎤" label="Speaking Pending"  count={stats.speakingPending} />
                </div>

                {/* Nav Tabs */}
                <div className="flex items-center gap-6 md:gap-10 px-6 pt-6 border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap bg-transparent scrollbar-hide">
                    <NavTab active={activeTab === 'courses'}         onClick={() => setActiveTab('courses')}       label="MY COURSES"       icon="📚" />
                    <NavTab active={activeTab === 'interventions'} onClick={() => setActiveTab('interventions')} label="INTERVENTIONS"     icon="⚠️" />
                    <NavTab active={activeTab === 'review'}          onClick={() => setActiveTab('review')}        label="SPEAKING REVIEW" icon="🎙️" />
                    <NavTab active={activeTab === 'messages'}        onClick={() => setActiveTab('messages')}      label="MESSAGES"         icon="💬" />
                </div>

                <main className="max-w-[1600px] mx-auto">
                    {activeTab === 'courses' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-3 duration-500">
                            {/* Ipinasa ang setShowPending prop para magamit sa loob ng Management component */}
                            <Management onShowPending={() => setShowPending(true)} />
                        </div>
                    )}

                    {activeTab !== 'courses' && (
                        <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-gray-50 animate-in fade-in zoom-in-95">
                            <div className="text-5xl mb-6 opacity-20">📂</div>
                            <h3 className="text-gray-800 font-black uppercase italic text-xl tracking-widest">No Records Found</h3>
                            <p className="text-gray-400 text-[10px] font-bold mt-2 uppercase tracking-widest">
                                Select another tab or check back later.
                            </p>
                        </div>
                    )}
                </main>

                <footer className="mt-20 pb-6 text-center">
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.5em] opacity-50">
                        Instructor Portal v1.0 • Stable Build • 2026
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default InstructorDashboard;