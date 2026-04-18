import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../../services/APIservice';

const QuestLevels = () => {
    const { questId } = useParams();
    const navigate = useNavigate();
    
    const [questData, setQuestData] = useState(null);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // --- MODAL & TRANSITION STATES ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMission, setSelectedMission] = useState(null);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const fetchQuestProgress = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                const response = await authAPI.getQuestLevels(questId, token);
                if (!response.ok) throw new Error(`Error: ${response.status}`);
                const data = await response.json();
                
                setQuestData(data);
                // Simple mapping lang, hindi na tayo mag-pe-fetch ng titles dito para malinis ang Cards
                const rawLevels = data.levels || (Array.isArray(data) ? data : []);

                const mappedLevels = rawLevels.map((level, index) => ({
                    ...level,
                    quest_level_id: level.quest_level_id || level.id,
                    // Generic title lang para sa Card UI gaya ng gusto mo
                    display_title: level.level_title || `Level ${level.level_number || index + 1}`,
                }));

                setLevels(mappedLevels);

                const firstIncomplete = mappedLevels.findIndex(l => !l.is_completed && !l.is_locked);
                if (firstIncomplete !== -1) {
                    setCurrentIndex(firstIncomplete);
                } else if (mappedLevels.length > 0) {
                    setCurrentIndex(mappedLevels.length - 1);
                }
                
            } catch (error) {
                console.error("Error fetching quest levels:", error);
            } finally {
                setLoading(false);
            }
        };

        if (questId) fetchQuestProgress();
    }, [questId]);

    const handleBackNavigation = () => {
        navigate('/student/dashboard?tab=quests'); 
    };

    // --- OPEN MODAL LOGIC ---
    // Dito lang tayo mag-fe-fetch ng specific data kapag pinindot na ang button
    const openMissionModal = async (level, mode) => {
        try {
            const token = localStorage.getItem('token');
            const quest_level_id = level.quest_level_id;

            // Fetch details only when needed for the modal
            const response = mode === 'activity' 
                ? await authAPI.getActivities(questId, quest_level_id, token)
                : await authAPI.getQuizzes(questId, quest_level_id, token);

            if (!response.ok) throw new Error("Content not found");
            const data = await response.json();

            // Unwrap data
            const content = mode === 'activity' 
                ? (data?.activity || (Array.isArray(data) ? data[0] : data))
                : (data?.quiz || (Array.isArray(data) ? data[0] : data));

            if (!content) {
                alert(`Error: No ${mode} content found for this level.`);
                return;
            }

            setSelectedMission({
                levelId: quest_level_id,
                mode: mode,
                title: content.activity_title || content.title || content.quiz_title || 'Untitled Mission',
                difficulty: content.difficulty || level.difficulty || 'Normal',
                passingScore: content.passing_score || 0,
                totalQuestions: content.total_questions || 0,
                contentId: mode === 'activity' ? (content.activity_id || content.id) : (content.quiz_id || content.id),
                attempts: mode === 'activity' ? 'Unlimited' : '3 Attempts Only'
            });
            setIsModalOpen(true);
        } catch (err) {
            console.error("Error loading mission details:", err);
            alert("Could not load mission details. Please try again.");
        }
    };

    // --- START WITH COUNTDOWN ---
    const confirmStart = () => {
        setIsModalOpen(false);
        setIsCountingDown(true);
        setCountdown(3);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    const { levelId, mode, contentId } = selectedMission;
                    navigate(`/student/quest/${questId}/level/${levelId}/play/${contentId}?mode=${mode}`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const nextLevel = () => currentIndex < levels.length - 1 && setCurrentIndex(currentIndex + 1);
    const prevLevel = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);

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
        <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-hidden flex flex-col">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="absolute inset-0 opacity-[0.05]" 
                    style={{ backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
                </div>
            </div>

            {/* Navbar */}
            <nav className="relative w-full px-4 py-4 flex items-center border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBackNavigation} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group shadow-lg">
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

            {/* Main Content */}
            <div className="relative flex-1 flex flex-col items-center justify-center p-6 z-10">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="h-[2px] w-6 bg-indigo-500"></span>
                        <span className="text-indigo-400 font-black tracking-[0.3em] text-[10px] uppercase">Mission Selection</span>
                        <span className="h-[2px] w-6 bg-indigo-500"></span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent italic uppercase">
                        {questData?.quest?.quest_title || questData?.quest_title || 'Quest Missions'}
                    </h1>
                </div>

                {/* CAROUSEL WRAPPER */}
                <div className="relative w-full max-w-5xl h-[500px] flex items-center justify-center">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-50 pointer-events-none">
                        <button onClick={prevLevel} className={`pointer-events-auto w-14 h-14 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-indigo-600 transition-all shadow-2xl backdrop-blur-md ${currentIndex === 0 ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                            <span className="text-2xl">←</span>
                        </button>
                        <button onClick={nextLevel} className={`pointer-events-auto w-14 h-14 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-indigo-600 transition-all shadow-2xl backdrop-blur-md ${currentIndex === levels.length - 1 ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                            <span className="text-2xl">→</span>
                        </button>
                    </div>

                    <div className="relative w-full h-full flex items-center justify-center">
                        <AnimatePresence mode="popLayout">
                            {levels.map((level, index) => {
                                const isCenter = index === currentIndex;
                                const isLeft = index === currentIndex - 1;
                                const isRight = index === currentIndex + 1;
                                if (!isCenter && !isLeft && !isRight) return null;

                                const isQuizUnlocked = level.has_quiz && (level.activity_passed === true || level.activity_passed === "true" || level.level_status === 'activity_done' || level.is_completed);
                                const isLevelLocked = level.is_locked;

                                return (
                                    <motion.div
                                        key={level.quest_level_id || index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{
                                            opacity: isCenter ? 1 : 0.3,
                                            scale: isCenter ? 1 : 0.8,
                                            x: isCenter ? 0 : isLeft ? -380 : 380,
                                            zIndex: isCenter ? 30 : 10,
                                            filter: isCenter ? 'blur(0px)' : 'blur(4px)',
                                        }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className={`absolute w-full max-w-[400px] p-1 ${isCenter ? 'cursor-default' : 'cursor-pointer pointer-events-none'}`}
                                        onClick={() => !isCenter && setCurrentIndex(index)}
                                    >
                                        <div className={`relative overflow-hidden p-10 rounded-[3rem] bg-gradient-to-br from-white/[0.12] to-transparent backdrop-blur-3xl border-2 shadow-2xl transition-all duration-500 ${isCenter ? 'border-indigo-500/50' : 'border-white/5'}`}>
                                            <div className="flex flex-col items-center text-center gap-6">
                                                <div className={`h-20 w-20 rounded-2xl flex items-center justify-center font-black text-3xl shadow-xl transition-transform duration-700 ${isCenter ? 'bg-indigo-600 rotate-0 shadow-indigo-500/40' : 'bg-gray-800 rotate-12'}`}>
                                                    {level.level_number || index + 1}
                                                </div>

                                                <div>
                                                    <h3 className="text-3xl font-black tracking-tight uppercase italic mb-2 line-clamp-2">
                                                        {level.display_title}
                                                    </h3>
                                                    <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                                        {level.is_completed ? 'Sector Secured' : 'Awaiting Mission Launch'}
                                                    </span>
                                                </div>

                                                {isLevelLocked && (
                                                    <div className="py-2 px-4 bg-red-500/10 border border-red-500/30 rounded-full flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Locked</span>
                                                        <span className="text-sm">🔒</span>
                                                    </div>
                                                )}

                                                <div className="w-full space-y-4 mt-2">
                                                    <button 
                                                        disabled={isLevelLocked || !isCenter}
                                                        onClick={() => openMissionModal(level, 'activity')}
                                                        className={`w-full py-5 rounded-2xl font-black text-[12px] transition-all active:scale-95 uppercase tracking-[0.2em] border-b-4 ${level.activity_passed ? 'bg-emerald-500/20 border-emerald-700 text-emerald-400' : 'bg-indigo-600 border-indigo-800 text-white shadow-lg'}`}
                                                    >
                                                        {level.activity_passed ? 'Review activity' : 'Activity'}
                                                    </button>

                                                    <button 
                                                        disabled={!isQuizUnlocked || isLevelLocked || !isCenter}
                                                        onClick={() => openMissionModal(level, 'quiz')}
                                                        className={`w-full py-5 rounded-2xl font-black text-[12px] transition-all active:scale-95 uppercase tracking-[0.2em] border-b-4 ${isQuizUnlocked ? 'bg-amber-500 border-amber-700 text-amber-950 shadow-lg' : 'bg-white/5 border-white/10 text-gray-700 cursor-not-allowed'}`}
                                                    >
                                                        {isQuizUnlocked ? 'Final Quiz' : 'Quiz Locked'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Level Indicator Dots */}
                <div className="flex gap-3 mt-12 mb-8">
                    {levels.map((_, i) => (
                        <button key={i} onClick={() => setCurrentIndex(i)} className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${i === currentIndex ? 'w-10 bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.6)]' : 'w-2 bg-white/20 hover:bg-white/40'}`} />
                    ))}
                </div>
            </div>

            {/* --- MISSION PREVIEW MODAL --- */}
            <AnimatePresence>
                {isModalOpen && selectedMission && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md" 
                            onClick={() => setIsModalOpen(false)}
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-[#0f172a] border-2 border-indigo-500/30 p-10 rounded-[3rem] shadow-[0_0_80px_rgba(79,70,229,0.2)] max-w-md w-full text-center"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                            
                            <p className="text-indigo-400 font-black tracking-[0.4em] uppercase text-[10px] mb-4">Mission Briefing</p>
                            <h2 className="text-3xl font-black text-white mb-6 uppercase italic leading-tight">{selectedMission.title}</h2>
                            
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Difficulty</p>
                                    <p className="text-sm font-black text-indigo-400 uppercase">{selectedMission.difficulty}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Passing Score</p>
                                    <p className="text-sm font-black text-emerald-400">{selectedMission.passingScore}%</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Questions</p>
                                    <p className="text-sm font-black text-white">{selectedMission.totalQuestions}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Attempts</p>
                                    <p className={`text-sm font-black ${selectedMission.mode === 'activity' ? 'text-blue-400' : 'text-amber-400'}`}>
                                        {selectedMission.attempts}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button onClick={confirmStart} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all active:scale-95 uppercase italic shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                                    Launch Mission
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="w-full py-4 text-white/40 hover:text-white font-black text-sm transition-all uppercase italic">
                                    Abort
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- COUNTDOWN OVERLAY --- */}
            <AnimatePresence>
                {isCountingDown && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020617]"
                    >
                        <motion.div
                            key={countdown}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1 }}
                            exit={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-8xl font-black italic text-indigo-500"
                        >
                            {countdown > 0 ? countdown : "GO!"}
                        </motion.div>
                        <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500/20 animate-pulse"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin-reverse { animation: spin 3s linear infinite reverse; }
            `}</style>
        </div>
    );
};

export default QuestLevels;