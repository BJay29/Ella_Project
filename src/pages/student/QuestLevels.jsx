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
                const response = await authAPI.studentOpenQuest(questId, token);
                
                if (!response.ok) throw new Error(`Error: ${response.status}`);

                const data = await response.json();
                
                // DEBUG: Dito natin masisiguro kung nasaan ang title at IDs
                console.log("DEBUG: Full API Response Structure:", data);

                setQuestData(data);
                
                // Kinukuha ang levels array
                const extractedLevels = data.levels || [];
                setLevels(extractedLevels);
                
            } catch (error) {
                console.error("Error fetching quest levels:", error);
            } finally {
                setLoading(false);
            }
        };

        if (questId) fetchQuestProgress();
    }, [questId]);

    // UPDATE: Ngayon ay tumatanggap na rin ito ng specificId (activityId o quizId)
    const handlePlay = (levelId, mode, specificId) => {
        if (!specificId) {
            console.error(`Missing ${mode} ID for this level`);
            alert(`Error: No ${mode} found for this level.`);
            return;
        }

        // Papunta ito sa GameEngine component base sa route sa App.jsx
        // Idinagdag ang specificId sa URL para magamit ng API sa GameEngine
        navigate(`/student/quest/${questId}/level/${levelId}/${mode}/${specificId}/play?mode=${mode}`);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white italic">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                <p>Loading Adventure...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans">
            {/* Header Section */}
            <div className="max-w-4xl mx-auto mb-10">
                <button 
                    onClick={() => navigate('/student/dashboard', { state: { activeTab: 'My Quests' } })}
                    className="text-indigo-400 hover:text-indigo-300 mb-4 flex items-center gap-2 font-bold text-sm"
                >
                    ← Back to Library
                </button>
                <div className="flex flex-col gap-1">
                    <span className="text-indigo-500 font-black tracking-[0.2em] text-xs uppercase">Adventure Mode</span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                        {/* Ipinapakita ang Quest Title (e.g., Reading) */}
                        {questData?.quest?.quest_title || questData?.quest?.quest_type || questData?.quest_title || 'Quest Missions'}
                    </h1>
                    <p className="text-gray-400 mt-2">Complete the initial training activity to unlock the Final Quiz.</p>
                </div>
            </div>

            {/* Levels List */}
            <div className="max-w-4xl mx-auto space-y-6">
                {levels.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/50 rounded-[2rem] border-2 border-dashed border-gray-800">
                        <p className="text-gray-500 font-bold">No missions found.</p>
                    </div>
                ) : (
                    levels.map((level, index) => {
                        // Logic para sa status ng buttons
                        const isQuizUnlocked = level.activity_completed || level.is_activity_finished || level.level_status === 'activity_done';
                        const isLevelLocked = level.is_locked; 

                        // Kunin ang mga kailangang IDs mula sa level data
                        const currentLevelId = level.id || level.quest_level_id;
                        const activityId = level.activity?.id || level.activity_id; 
                        const quizId = level.quiz?.id || level.quiz_id;

                        // FALLBACK TITLES: Pinaka-importante para lumabas ang "SPELLING"
                        const displayTitle = 
                            level.level_title || 
                            level.title || 
                            level.level_details?.level_title || 
                            questData?.quest?.level_title || 
                            `Mission ${level.level_number || index + 1}`;

                        return (
                            <div key={currentLevelId || index} className={`p-8 rounded-[2rem] border-2 transition-all ${isLevelLocked ? 'border-gray-800 opacity-60' : 'border-indigo-500/10 bg-gray-800/50 shadow-xl'}`}>
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                                    
                                    {/* Mission Icon & Title */}
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-[1.2rem] flex items-center justify-center font-black text-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20">
                                            {level.level_number || index + 1}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-2xl font-black tracking-tight uppercase">
                                                {/* DITO LALABAS ANG "SPELLING" */}
                                                {displayTitle}
                                            </h3>
                                            <div className="flex gap-2">
                                                <span className={`text-[10px] font-black px-2 py-1 rounded border ${isQuizUnlocked ? 'border-emerald-500/30 text-emerald-400' : 'border-gray-700 text-gray-500'}`}>
                                                    ACTIVITY {isQuizUnlocked ? 'COMPLETED' : 'IN PROGRESS'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                        <div className="flex flex-col gap-2 items-center">
                                            <button 
                                                onClick={() => handlePlay(currentLevelId, 'activity', activityId)}
                                                className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-black text-sm transition-all active:scale-95 w-full lg:w-auto"
                                            >
                                                {isQuizUnlocked ? 'REPLAY ACTIVITY' : 'START ACTIVITY'}
                                            </button>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                Questions: {level.activity_questions_count || 0}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-2 items-center">
                                            <button 
                                                disabled={!isQuizUnlocked}
                                                onClick={() => handlePlay(currentLevelId, 'quiz', quizId)}
                                                className={`px-8 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 w-full lg:w-auto ${isQuizUnlocked ? 'bg-amber-500 text-amber-950 hover:bg-amber-400' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                                            >
                                                {isQuizUnlocked ? 'START QUIZ' : ' QUIZ LOCKED'}
                                            </button>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                Questions: {level.quiz_questions_count || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-8 flex items-center gap-4">
                                    <div className="h-2 flex-1 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                                        <div 
                                            className="h-full bg-indigo-500 transition-all duration-1000" 
                                            style={{ width: level.is_completed ? '100%' : (isQuizUnlocked ? '50%' : '10%') }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-500">
                                        {level.is_completed ? 'STAGE COMPLETED' : `STAGE ${level.level_number || 1}`}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default QuestLevels;