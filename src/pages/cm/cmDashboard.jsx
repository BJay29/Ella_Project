import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Import your sub-components
import HierarchyManager from './Hierarchy/HierarchyManager'; 
import CourseManager from './Hierarchy/CourseManager'; 
import QuestBuilder from './QuestBuilder/QuestBuilder'; 
import LevelManager from './QuestBuilder/LevelManager'; 

import EllaAvatar from '../../assets/image.png'; 

const CMDashboard = () => {
    const navigate = useNavigate();
    const { questId } = useParams();
    
    // Default tab is now the Academic Structure
    const [activeTab, setActiveTab] = useState('structure');
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Auto-switch to Workshop if a Quest ID is present in the URL
    useEffect(() => {
        if (questId) {
            setActiveTab('quests');
        }
    }, [questId]);

    const handleConfirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');        
        navigate('/login', { replace: true });
    };

    return (
        <div className="h-screen bg-gray-50 font-sans relative overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            
            {/* --- TOP NAVBAR --- */}
            <nav className="bg-white border-b border-gray-200 px-8 py-3 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 p-1 rounded-lg flex items-center justify-center overflow-hidden border border-indigo-200 shadow-sm">
                            <img 
                                src={EllaAvatar} 
                                alt="Ella Quest Logo" 
                                className="w-7 h-7 object-cover rounded-md" 
                            />
                        </div>
                        <span className="font-black text-gray-800 tracking-tight text-lg">Ella Quest</span>
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-md flex items-center gap-2 text-xs font-bold border border-green-200">
                        📊 Dashboard
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div 
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-full transition-all pl-3"
                    >
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-800 leading-none">Curriculum Manager</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Manager Account</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-sm">
                            CM
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- MAIN CONTENT CONTAINER --- */}
            <div className="p-8">
                {/* --- HEADER SECTION --- */}
                <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-2xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold flex items-center gap-2 uppercase tracking-tighter italic">
                            📘 {
                                activeTab === 'structure' ? 'Academic Structure' : 
                                activeTab === 'courses' ? 'Course Management' : 
                                activeTab === 'quests' ? 'Quest Workshop' : 'Settings'
                            }
                        </h1>
                        <p className="opacity-90 mt-2 font-medium">
                            {
                                activeTab === 'structure' ? 'Build your Departments, Programs, and Sections' : 
                                activeTab === 'courses' ? 'Assign subjects to specific sections using hierarchical dropdowns' : 
                                activeTab === 'quests' ? 'Create and assign Quests to your classes' : 'Configure quest levels and requirements'
                            }
                        </p>
                    </div>
                    <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white opacity-10 rounded-full"></div>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] mb-8">
                    {/* Updated Tab List - No more My Materials */}
                    <div className="flex border-b border-gray-100 bg-gray-50/50 px-8 pt-4 gap-8 overflow-x-auto [scrollbar-width:none]">
                        {[
                            { id: 'structure', label: 'Academic Structure' },
                            { id: 'courses', label: 'Courses' },
                            { id: 'quests', label: 'Quest Workshop' }, 
                            { id: 'settings', label: 'Quest Settings' }
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 text-sm font-bold capitalize transition-all whitespace-nowrap relative ${
                                    activeTab === tab.id 
                                    ? 'text-indigo-600' 
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {/* TAB 1: ACADEMIC STRUCTURE (The creation phase) */}
                        {activeTab === 'structure' && (
                            <div className="animate-in fade-in duration-300">
                                <HierarchyManager />
                            </div>
                        )}

                        {/* TAB 2: COURSES (The mapping phase with dropdowns) */}
                        {activeTab === 'courses' && (
                            <div className="animate-in fade-in duration-300">
                                <CourseManager />
                            </div>
                        )}

                        {/* TAB 3: QUEST WORKSHOP */}
                        {activeTab === 'quests' && (
                            <div className="animate-in fade-in duration-300">
                                <QuestBuilder />
                            </div>
                        )}

                        {/* TAB 4: SETTINGS */}
                        {activeTab === 'settings' && (
                            <div className="animate-in fade-in duration-300">
                                <LevelManager />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- LOGOUT MODAL CODE (Same as before) --- */}
            {showLogoutModal && (
                // ... (Modal code remains exactly the same as your provided snippet)
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                     <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl flex flex-col items-center">
                        <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase italic">Log Out</h2>
                        <p className="text-gray-500 text-center mb-8 text-sm">Are you sure you want to exit?</p>
                        <div className="flex flex-col gap-3 w-full">
                            <button onClick={handleConfirmLogout} className="w-full py-4 bg-rose-500 text-white font-black rounded-2xl">Logout Now</button>
                            <button onClick={() => setShowLogoutModal(false)} className="w-full py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl">Cancel</button>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default CMDashboard;