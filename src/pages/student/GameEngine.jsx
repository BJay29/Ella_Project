import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/APIservice';

const GameEngine = () => {
    const { questId, quest_level_id, activityId, quizId } = useParams(); 
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const mode = searchParams.get('mode');

    // --- STATES ---
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [metadata, setMetadata] = useState({
        answered_count: 0,
        total_questions: 0,
        display_number: 1 
    });
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null); 
    const [quizSummary, setQuizSummary] = useState(null);
    
    // Timer States
    const [timeLeft, setTimeLeft] = useState(60); 
    const [startingCountdown, setStartingCountdown] = useState(3); 
    const [gameStarted, setGameStarted] = useState(false); 
    const [hasStartedCountdown, setHasStartedCountdown] = useState(false);
    const timerRef = useRef(null);
    const hasFetchedInitial = useRef(false);

    // --- HANDLE FINISH MISSION ---
    const handleFinish = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let response;

            // Siguraduhin na ang tamang ID ang ipinapasa base sa mode
            if (mode === 'activity') {
                response = await authAPI.finishActivity(questId, quest_level_id, activityId, token);
            } else {
                response = await authAPI.finishQuiz(questId, quest_level_id, quizId, token);
            }

            if (response.ok) {
                const result = await response.json();
                setQuizSummary(result);
            } else {
                navigate(`/student/quest/${questId}/levels`);
            }
        } catch (error) {
            console.error("Error finishing mission:", error);
            navigate(`/student/quest/${questId}/levels`);
        } finally {
            setLoading(false);
        }
    }, [questId, quest_level_id, activityId, quizId, mode, navigate]);

    // --- FETCH QUESTION ---
    const fetchQuestion = useCallback(async (isNext = false) => {
        try {
            setLoading(true);
            setErrorMessage(null);
            setGameStarted(false); 
            setHasStartedCountdown(false); 
            setStartingCountdown(3); 

            const token = localStorage.getItem('token');
            let response;

            // Fetching base on mode
            if (mode === 'activity') {
                response = await authAPI.getNextActivityQuestion(questId, quest_level_id, activityId, token);
            } else {
                response = await authAPI.getNextQuizQuestion(questId, quest_level_id, quizId, token);
            }
            
            // 204 No Content means tapos na ang questions
            if (response.status === 204) {
                handleFinish();
                return;
            }

            if (!response.ok) {
                setErrorMessage(`Error: ${response.status} - Failed to load task.`);
                return;
            }

            const data = await response.json();
            // Data extraction logic para sa iba't ibang backend responses
            const questionData = data.question || data.data || data;

            if (questionData) {
                setCurrentQuestion(questionData);
                setMetadata(prev => ({
                    answered_count: data.answered_count ?? prev.answered_count,
                    total_questions: data.total_questions || prev.total_questions,
                    display_number: isNext ? prev.display_number + 1 : (data.answered_count + 1 || 1)
                }));

                setSelectedAnswer(null);
                setAnswerText('');
                setTimeLeft(60); // Reset timer for new question
            } else {
                handleFinish();
            }
        } catch (error) {
            setErrorMessage("Hindi makakonekta sa mission control server.");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [questId, quest_level_id, activityId, quizId, mode, handleFinish]);

    // --- SUBMIT ANSWER ---
    const handleSubmitAnswer = useCallback(async (isTimeUp = false) => {
        if (isSubmitting || !currentQuestion) return;

        try {
            setIsSubmitting(true);
            if (timerRef.current) clearInterval(timerRef.current); 

            const token = localStorage.getItem('token');
            const answerData = {
                answer_id: isTimeUp ? null : selectedAnswer,
                answer_text: isTimeUp ? "" : answerText
            };

            // Dynamic ID check para sa question
            const qId = currentQuestion.id || 
                        currentQuestion.activity_question_id || 
                        currentQuestion.quiz_question_id ||
                        currentQuestion.quest_activity_question_id || 
                        currentQuestion.quest_quiz_question_id;

            let response;
            if (mode === 'activity') {
                response = await authAPI.submitActivityAnswer(questId, quest_level_id, activityId, qId, answerData, token);
            } else {
                response = await authAPI.submitQuizAnswer(questId, quest_level_id, quizId, qId, answerData, token);
            }

            if (!response.ok) throw new Error("Submission failed");

            // Check progress
            if (metadata.display_number >= metadata.total_questions) {
                handleFinish();
            } else {
                fetchQuestion(true);
            }

        } catch (error) {
            console.error("Error submitting answer:", error);
            // Sa error, i-retry fetch para hindi ma-stuck
            fetchQuestion(false);
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, currentQuestion, selectedAnswer, answerText, mode, questId, quest_level_id, activityId, quizId, metadata, handleFinish, fetchQuestion]);

    // --- INITIAL LOAD LOGIC ---
    useEffect(() => {
        const initializeGame = async () => {
            if (hasFetchedInitial.current) return;
            hasFetchedInitial.current = true;

            try {
                const token = localStorage.getItem('token');
                // Kunin ang kabuuang bilang ng questions para sa progress bar
                if (mode === 'activity') {
                    const qResp = await authAPI.getActivityQuestions(questId, quest_level_id, activityId, token);
                    if (qResp.ok) {
                        const qData = await qResp.json();
                        setMetadata(prev => ({ ...prev, total_questions: qData.length || 0 }));
                    }
                } else {
                    const qResp = await authAPI.getQuizQuestions(questId, quest_level_id, quizId, token);
                    if (qResp.ok) {
                        const qData = await qResp.json();
                        setMetadata(prev => ({ ...prev, total_questions: qData.length || 0 }));
                    }
                }
                fetchQuestion(false);
            } catch (err) {
                console.error("Initialization error:", err);
                setErrorMessage("Failed to initialize session.");
            }
        };

        if (questId && quest_level_id && mode && (activityId || quizId) && !hasFetchedInitial.current) {
            initializeGame();
        }
    }, [questId, quest_level_id, activityId, quizId, mode, fetchQuestion]);

    // --- TIMER & COUNTDOWN LOGIC ---
    useEffect(() => {
        if (!loading && currentQuestion && !hasStartedCountdown && !quizSummary) {
            setHasStartedCountdown(true);
        }
    }, [loading, currentQuestion, hasStartedCountdown, quizSummary]);

    useEffect(() => {
        let countdownInterval;
        if (hasStartedCountdown && !gameStarted && !quizSummary) {
            countdownInterval = setInterval(() => {
                setStartingCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        setGameStarted(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(countdownInterval);
    }, [hasStartedCountdown, gameStarted, quizSummary]);

    useEffect(() => {
        if (gameStarted && currentQuestion && !loading && !quizSummary) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmitAnswer(true); // Auto-submit when time is up
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameStarted, currentQuestion, loading, quizSummary, handleSubmitAnswer]);

    // --- UI HELPERS ---
    const getQuestionText = () => {
        if (!currentQuestion) return "";
        return currentQuestion.question_text || currentQuestion.activity_question || currentQuestion.quiz_question || currentQuestion.question;
    };

    const getChoices = () => {
        if (!currentQuestion) return [];
        return currentQuestion.activity_answers || 
               currentQuestion.quiz_answers || 
               currentQuestion.answers || 
               currentQuestion.choices || 
               currentQuestion.quest_activity_answers || 
               currentQuestion.quest_quiz_answers || [];
    };

    // --- RENDER SCREENS ---

    // 1. Initial Loading Screen
    if (loading && !currentQuestion) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center font-black text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-6"></div>
                <p className="tracking-widest uppercase italic">Establishing Secure Uplink...</p>
            </div>
        );
    }

    // 2. Countdown Screen
    if (hasStartedCountdown && !gameStarted && !quizSummary) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center z-[100] fixed inset-0">
                <div className="text-center">
                    <p className="text-indigo-400 font-black tracking-[0.5em] mb-4 uppercase animate-pulse italic">Get Ready, Student</p>
                    <h1 className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.5)] italic">
                        {startingCountdown > 0 ? startingCountdown : "GO!"}
                    </h1>
                </div>
            </div>
        );
    }

    // 3. Mission Summary Screen
    if (quizSummary) {
        const isPassed = quizSummary.passed || quizSummary.status === 'passed' || quizSummary.is_passed;
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 fixed inset-0 z-50">
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-lg w-full text-center border-b-8 border-gray-200">
                    <div className="mb-6 flex justify-center">
                        <div className={`w-36 h-36 rounded-full border-[10px] flex items-center justify-center text-4xl font-black ${isPassed ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600'}`}>
                            {quizSummary.score || 0}%
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 mb-2 uppercase italic">{isPassed ? "MISSION CLEARED!" : "MISSION FAILED"}</h2>
                    <p className="text-gray-500 mb-6 font-bold">Points Earned: {quizSummary.points_earned || 0}</p>
                    <button onClick={() => navigate(`/student/quest/${questId}/levels`)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black mt-4 shadow-lg transition-all active:translate-y-1 uppercase tracking-widest">RETURN TO BASE</button>
                </div>
            </div>
        );
    }

    // 4. Error Screen
    if (errorMessage) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-white">
                <div className="bg-gray-800 p-8 rounded-3xl shadow-xl border-4 border-rose-500 text-center max-w-md">
                    <h2 className="text-xl font-black mb-4 uppercase italic">Communications Error</h2>
                    <p className="mb-6 opacity-80 font-medium">{errorMessage}</p>
                    <button onClick={() => fetchQuestion(false)} className="px-8 py-3 bg-white text-gray-900 rounded-xl font-black uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-colors">Re-establish Connection</button>
                </div>
            </div>
        );
    }

    // 5. Main Game UI
    const displayNum = metadata.display_number;
    const totalNum = metadata.total_questions || 0;
    const isLastItem = displayNum >= totalNum;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] p-6 relative overflow-hidden font-sans text-white">
            {/* Header / Stats */}
            <div className="max-w-7xl mx-auto flex justify-between items-start pt-4 relative z-10">
                <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 p-4 rounded-2xl shadow-xl min-w-[120px]">
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-1 tracking-tighter">Progress Tracker</p>
                    <div className="text-2xl font-black italic">
                        {displayNum} <span className="text-white/40 text-sm">/ {totalNum}</span>
                    </div>
                </div>

                <div className="text-center mt-2 hidden md:block">
                    <h1 className="text-xl font-black tracking-[0.2em] text-white/50 uppercase italic">Active Objective</h1>
                    <div className="h-1.5 w-24 bg-indigo-500 mx-auto mt-2 rounded-full shadow-[0_0_10px_#6366f1]"></div>
                </div>

                <div className={`backdrop-blur-md border-4 p-4 rounded-2xl shadow-xl transition-all duration-300 w-24 text-center ${timeLeft <= 15 ? 'bg-rose-500/20 border-rose-500 animate-pulse' : 'bg-white/10 border-white/20'}`}>
                    <p className="text-[10px] font-black uppercase mb-1">Time</p>
                    <div className={`text-2xl font-black italic ${timeLeft <= 15 ? 'text-rose-500' : 'text-white'}`}>
                        {timeLeft}s
                    </div>
                </div>
            </div>

            {/* Question Area */}
            <div className="max-w-4xl mx-auto mt-16 text-center relative z-10">
                <div className="mb-12">
                    <h2 className="text-3xl md:text-5xl font-black leading-tight drop-shadow-lg uppercase tracking-tight italic">
                        {getQuestionText()}
                    </h2>
                </div>

                {/* Answer Options */}
                <div className="mt-12">
                    {currentQuestion?.question_type === 'identification' ? (
                        <div className="max-w-2xl mx-auto">
                            <input 
                                type="text" 
                                value={answerText} 
                                onChange={(e) => setAnswerText(e.target.value)} 
                                placeholder="TYPE YOUR RESPONSE..." 
                                className="w-full bg-white/5 border-4 border-white/10 p-6 rounded-[2rem] outline-none focus:border-indigo-500 text-2xl font-black text-center transition-all shadow-2xl placeholder:text-white/10 uppercase italic" 
                                autoFocus
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {getChoices().map((choice, idx) => {
                                const choiceId = choice.id || choice.quest_activity_answer_id || choice.quest_quiz_answer_id || idx; 
                                const isSelected = selectedAnswer === choiceId;
                                return (
                                    <button 
                                        key={idx} 
                                        onClick={() => setSelectedAnswer(choiceId)} 
                                        className={`group relative flex items-center p-6 rounded-3xl border-4 transition-all duration-200 text-left overflow-hidden ${
                                            isSelected 
                                            ? 'bg-indigo-600 border-indigo-400 translate-y-[-4px] shadow-[0_8px_0_0_#4338ca]' 
                                            : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10 shadow-xl'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-6 font-black text-xl shrink-0 transition-colors ${
                                            isSelected ? 'bg-white text-indigo-600' : 'bg-white/10 text-white/50 group-hover:bg-white/20'
                                        }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="text-xl font-bold leading-tight uppercase">{choice.answer_text || choice.text}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
                <button 
                    onClick={() => navigate(-1)} 
                    className="pointer-events-auto group flex items-center gap-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-8 py-4 rounded-2xl font-black transition-all border-2 border-rose-500/20 active:scale-95 shadow-lg uppercase italic"
                >
                    <span className="text-2xl font-normal">×</span> Abort Mission
                </button>

                <button 
                    onClick={() => handleSubmitAnswer(false)} 
                    disabled={isSubmitting || (currentQuestion?.question_type !== 'identification' && selectedAnswer === null) || (currentQuestion?.question_type === 'identification' && !answerText.trim())} 
                    className={`pointer-events-auto px-12 py-5 rounded-3xl font-black text-xl shadow-[0_8px_0_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-2 transition-all disabled:opacity-40 disabled:pointer-events-none uppercase italic ${
                        isLastItem ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/50' : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-900/50'
                    }`}
                >
                    {isSubmitting ? 'ANALYZING...' : (isLastItem ? 'COMPLETE MISSION ✓' : 'NEXT TASK →')}
                </button>
            </div>
                    
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        </div>
    );
};

export default GameEngine;