import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestBuilder from './QuestBuilder';
import LevelManager from './LevelManager';
import ActivityEditor from './ActivityEditor';

const CMDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('materials');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    // Naka-empty array na ito para sa simula
    const [materials, setMaterials] = useState([]);

    // DYNAMIC LOGIC: Binibilang nito ang status mula sa materials array
    const stats = {
        total: materials.length,
        approved: materials.filter(m => m.status === 'approved').length,
        pending: materials.filter(m => m.status === 'pending').length
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-600 border-green-200';
            case 'pending': return 'bg-orange-100 text-orange-600 border-orange-200';
            case 'decline': return 'bg-red-100 text-red-600 border-red-200';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    // Logout Function
    const handleConfirmLogout = () => {
        localStorage.clear();

        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans relative">
            
            {/* --- TOP NAVBAR (Added based on image_ea38b6.png) --- */}
            <nav className="bg-white border-b border-gray-200 px-8 py-3 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-600 p-1.5 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="font-black text-gray-800 tracking-tight text-lg">Ella Quest</span>
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-md flex items-center gap-2 text-xs font-bold border border-green-200">
                        📊 Dashboard
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-2 rounded-full border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    {/* PROFILE SECTION - Tig click dito para mag-logout */}
                    <div 
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-full transition-all pl-3"
                    >
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-800 leading-none">Curriculum Manager</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Manager</p>
                        </div>
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-sm">
                            CM
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- MAIN CONTENT CONTAINER --- */}
            <div className="p-8">
                {/* --- HEADER SECTION --- */}
                <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            📘 Curriculum Manager
                        </h1>
                        <p className="opacity-90 mt-2">Manage content, quests, activities, and quizzes</p>
                    </div>
                    <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white opacity-10 rounded-full"></div>
                </div>

                {/* --- DYNAMIC STATS CARDS --- */}
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">📁 My Materials</p>
                        <h2 className="text-4xl font-black text-gray-800 mt-2">{stats.total}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">✅ Approved</p>
                        <h2 className="text-4xl font-black text-green-500 mt-2">{stats.approved}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">⏳ Pending Review</p>
                        <h2 className="text-4xl font-black text-orange-400 mt-2">{stats.pending}</h2>
                    </div>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                    {/* TABS NAVIGATION */}
                    <div className="flex border-b border-gray-100 bg-gray-50/50 px-8 pt-4 gap-8">
                        {['materials', 'builder', 'settings'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-bold capitalize transition-all ${
                                    activeTab === tab 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {tab === 'materials' ? 'My Materials' : tab === 'builder' ? 'Quest Builder' : 'Quest Settings'}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {activeTab === 'materials' && (
                            <div>
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">My Uploaded Materials</h3>
                                        <p className="text-sm text-gray-400">See all of your macro skills content</p>
                                    </div>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-2">
                                        <span>Upload Material</span>
                                    </button>
                                </div>

                                {/* Alert Banner */}
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-700 text-sm mb-8 flex items-start gap-3">
                                    <span className="text-lg">📌</span>
                                    <p className="leading-relaxed">
                                        Uploaded materials are sent to **Admin** for content validation and approval before being available in quests.
                                    </p>
                                </div>

                                {/* LIST LOGIC */}
                                {materials.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-3xl">
                                        <div className="text-6xl mb-4 opacity-20">📁</div>
                                        <p className="text-gray-400 font-medium">No materials uploaded yet.</p>
                                        <p className="text-gray-300 text-xs">Your uploaded files will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {materials.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                                                        {item.type === 'PDF' ? '📄' : '🎵'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800">{item.name}</h4>
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                                                            {item.type} • {item.date}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                    {item.status === 'decline' && (
                                                        <button className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-gray-200 transition-colors">
                                                            Re-upload
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'builder' && <QuestBuilder />}
                        {activeTab === 'settings' && <LevelManager />}
                    </div>
                </div>
            </div>

            {/* --- INTERNAL LOGOUT MODAL --- */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tighter">Logging Out?</h2>
                        <p className="text-gray-500 text-center font-medium mb-8 leading-relaxed text-sm px-4">
                            Are you sure you want to exit the Curriculum Manager dashboard?
                        </p>
                        <div className="flex flex-col gap-3 w-full">
                            <button 
                                onClick={handleConfirmLogout}
                                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                            >
                             Logout
                            </button>
                            <button 
                                onClick={() => setShowLogoutModal(false)}
                                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CMDashboard;