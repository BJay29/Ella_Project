import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/APIservice';

const QuestLevels = () => {
    const { questId } = useParams();
    const navigate = useNavigate();
    
    const [questData, setQuestData] = useState(null);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestProgress = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                // Gagamitin ang bagong API method na inupdate mo sa service
                const response = await authAPI.getQuestLevels(questId, token);
                
                if (!response.ok) throw new Error(`Error: ${response.status}`);

                const data = await response.json();
                
                setQuestData(data);
                // Sinisiguro ang pag-extract ng levels base sa karaniwang structure ng student API
                const extractedLevels = data.levels || (Array.isArray(data) ? data : []);
                setLevels(extractedLevels);
                
            } catch (error) {
                console.error("Error fetching quest levels:", error);
            } finally {
                setLoading(false);
            }
        };

        if (questId) fetchQuestProgress();
    }, [questId]);

    const handlePlay = (levelId, mode, specificId) => {
        if (!specificId) {
            console.error(`Missing ${mode} ID for this level.`, {levelId, mode, specificId});
            alert(`Error: No ${mode} content found for this level yet.`);
            return;
        }
        navigate(`/student/quest/${questId}/level/${levelId}/play/${specificId}?mode=${mode}`);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white italic">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
                    <div className="absolute inset-0 h-16 w-16 rounded-full border-r-4 border-l-4 border-purple-500 animate-spin-reverse opacity-30"></div>
                </div>
                <p className="font-black tracking-[0.3em] uppercase text-[10px] animate-pulse">Syncing Mission Data...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-hidden">
            {/* --- GLOBAL BACKGROUND EFFECTS --- */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                
                <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="absolute inset-0 opacity-[0.05]" 
                    style={{ backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
                </div>
            </div>

            {/* --- NAVIGATION BAR --- */}
            <nav className="relative w-full px-4 py-4 flex items-center border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/student/dashboard', { state: { activeTab: 'My Quests' } })}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group shadow-lg"
                        >
                            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                        </button>
                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/student/dashboard')}>
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg">E</div>
                            <span className="text-xl font-black tracking-tighter text-white uppercase italic">Ella <span className="text-indigo-500">Quest</span></span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative max-w-6xl mx-auto p-6 lg:p-10 z-10">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="h-[2px] w-6 bg-indigo-500"></span>
                            <span className="text-indigo-400 font-black tracking-[0.3em] text-[10px] uppercase">Mission Selection</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent italic">
                            {questData?.quest?.quest_title || questData?.quest_title || 'Quest Missions'}
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl font-medium leading-relaxed">
                            Complete the initial training activity to unlock the Final Quiz. Conquer each level to master the quest.
                        </p>
                    </div>
                </div>

                {/* --- LEVELS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {levels.length === 0 ? (
                        <div className="col-span-full text-center py-32 bg-white/5 rounded-[3rem] border border-white/5 backdrop-blur-sm">
                            <div className="text-5xl mb-4 opacity-50">🛰️</div>
                            <p className="text-gray-500 font-black tracking-widest uppercase text-sm">No missions discovered yet.</p>
                        </div>
                    ) : (
                        levels.map((level, index) => {
                            const isQuizUnlocked = level.has_quiz && (level.activity_passed === true || level.activity_passed === "true" || level.level_status === 'activity_done');
                            const isLevelLocked = level.is_locked; 

                            const currentLevelId = level.quest_level_id || level.id;
                            const activityId = level.activity_id;
                            const quizId = level.quiz_id || level.quest_quiz_id;

                            const displayTitle = level.activity_title || level.level_title || `Mission ${level.level_number || index + 1}`;

                            return (
                                <div key={currentLevelId || index} className={`group relative p-[1px] rounded-[2.5rem] transition-all duration-500 ${isLevelLocked ? 'opacity-40 grayscale' : 'hover:scale-[1.02]'}`}>
                                    {/* Card Outer Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-transparent to-purple-500/30 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                                    
                                    <div className="relative h-full overflow-hidden p-8 rounded-[2.4rem] transition-all bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 group-hover:border-indigo-500/50">
                                        
                                        {/* --- CARD BACKGROUND EFFECTS --- */}
                                        <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                            <div className="absolute -top-[20%] -right-[20%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] animate-pulse"></div>
                                            <div className="absolute -bottom-[20%] -left-[20%] w-64 h-64 bg-purple-500/10 rounded-full blur-[60px] animate-pulse delay-700"></div>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5"></div>
                                        </div>

                                        <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl bg-indigo-600 shadow-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                                                        {level.level_number || index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-indigo-400 transition-colors italic">
                                                            {displayTitle}
                                                        </h3>
                                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{level.difficulty || 'Normal'} Sector</span>
                                                    </div>
                                                </div>
                                                {isLevelLocked && <span className="text-xl animate-bounce">🔒</span>}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${level.activity_passed ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/5 text-gray-500'} uppercase tracking-tighter`}>
                                                    Activity: {level.activity_passed ? 'Passed' : 'Pending'}
                                                </span>
                                                {level.has_quiz && (
                                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${isQuizUnlocked ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-white/5 bg-white/5 text-gray-500'} uppercase tracking-tighter`}>
                                                        Quiz: {isQuizUnlocked ? 'Unlocked' : 'Locked'}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <button 
                                                    disabled={isLevelLocked}
                                                    onClick={() => handlePlay(currentLevelId, 'activity', activityId)}
                                                    className={`py-4 rounded-2xl font-black text-xs transition-all active:scale-95 uppercase tracking-widest border ${level.activity_passed ? 'bg-white/5 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-500 shadow-lg'}`}
                                                >
                                                    {level.activity_passed ? 'Review activity' : 'Start activity'}
                                                </button>
                                                <button 
                                                    disabled={!isQuizUnlocked || isLevelLocked}
                                                    onClick={() => handlePlay(currentLevelId, 'quiz', quizId)}
                                                    className={`py-4 rounded-2xl font-black text-xs transition-all active:scale-95 uppercase tracking-widest border ${isQuizUnlocked ? 'bg-amber-500 border-amber-500 text-amber-950 hover:bg-amber-400 shadow-lg' : 'bg-transparent border-white/5 text-gray-700 cursor-not-allowed'}`}
                                                >
                                                    {isQuizUnlocked ? 'Take Quiz' : 'Quiz Locked'}
                                                </button>
                                            </div>

                                            {/* Progress Bar with Glow */}
                                            <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                                                <div 
                                                    className={`h-full transition-all duration-1000 relative ${level.activity_passed ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-indigo-500'}`} 
                                                    style={{ width: level.activity_passed ? '100%' : '15%' }}
                                                >
                                                    {/* Animated shine on progress bar */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full animate-shimmer"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animate-shimmer { animation: shimmer 2s infinite linear; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animate-spin-reverse { animation: spin 3s linear infinite reverse; }
            `}</style>
        </div>
    );
};

export default QuestLevels;