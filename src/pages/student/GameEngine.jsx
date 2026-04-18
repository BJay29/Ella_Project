import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/APIservice';

// ─────────────────────────────────────────────────────────────────────────────
// Calculating Screen
// ─────────────────────────────────────────────────────────────────────────────
const CalculatingScreen = () => (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white fixed inset-0 z-50">
        <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin" />
            <div className="absolute inset-0 w-24 h-24 rounded-full border-r-4 border-l-4 border-purple-500/40 animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">⚡</div>
        </div>
        <p className="font-black tracking-[0.4em] uppercase text-indigo-400 animate-pulse text-sm">Calculating Results...</p>
        <p className="text-white/30 text-xs font-bold mt-2 tracking-widest uppercase">Processing Mission Data</p>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Results Screen
// ─────────────────────────────────────────────────────────────────────────────
const ResultsScreen = ({ summary, mode, questId, onTryAgain, onBack, navigate }) => {
    const isPassed = summary.passed || summary.status === 'passed' || summary.is_passed;
    const score    = summary.score         ?? 0;
    const correct  = summary.correct_count ?? summary.correct   ?? 0;
    const wrong    = summary.wrong_count   ?? summary.incorrect ?? summary.wrong ?? 0;
    const points   = summary.points_earned ?? 0;

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 fixed inset-0 z-50">
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            <div className={`absolute top-0 left-0 w-full h-1 ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} />

            <div className="relative w-full max-w-lg">
                <div className="flex justify-center mb-6">
                    <div className={`px-6 py-2 rounded-full border-2 text-[10px] font-black uppercase tracking-[0.3em] ${
                        isPassed ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                    }`}>
                        {isPassed ? '✓ Mission Cleared' : '✕ Mission Failed'}
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <div className={`w-44 h-44 rounded-full border-[10px] flex flex-col items-center justify-center shadow-2xl ${
                        isPassed ? 'border-emerald-500 shadow-emerald-500/20' : 'border-rose-500 shadow-rose-500/20'
                    }`}>
                        <span className={`text-5xl font-black italic ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>{score}%</span>
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Score</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Correct</p>
                        <p className="text-3xl font-black text-emerald-400">{correct}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Wrong</p>
                        <p className="text-3xl font-black text-rose-400">{wrong}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Points</p>
                        <p className="text-3xl font-black text-indigo-400">{points}</p>
                    </div>
                </div>

                <div className={`rounded-2xl border p-4 mb-8 text-center ${isPassed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                    <p className={`text-sm font-bold ${isPassed ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {isPassed
                            ? mode === 'activity' ? '🎉 Activity passed! The Quiz is now unlocked.' : '🏆 Quest level complete!'
                            : `❌ You need ${summary.passing_score ?? 75}% to pass. Keep pushing!`}
                    </p>
                </div>

                <div className="space-y-3">
                    {isPassed ? (
                        <>
                            {mode === 'activity' && (
                                <button onClick={() => navigate(`/student/quest/${questId}/levels`)}
                                    className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 shadow-lg shadow-amber-500/20 border-b-4 border-amber-700">
                                    Proceed to Quiz →
                                </button>
                            )}
                            <button onClick={onBack}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 shadow-lg border-b-4 border-indigo-800">
                                {mode === 'activity' ? 'Back to Levels' : 'Return to Base'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={onTryAgain}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 shadow-lg border-b-4 border-indigo-800">
                                🔄 Try Again
                            </button>
                            <button onClick={onBack}
                                className="w-full py-3 text-white/40 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">
                                Exit
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// GameEngine
// ─────────────────────────────────────────────────────────────────────────────
const GameEngine = () => {
    const { questId, quest_level_id, content_id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate  = useNavigate();
    const location  = useLocation();
    const mode      = searchParams.get('mode'); // 'activity' | 'quiz'

    // ✅ New Flat API Logic: content_id is used directly as the identifier
    const contentId = content_id; 

    const prefetched  = location.state?.prefetched || null;
    const paramsValid = !!(content_id && mode);

    // ── Core state ────────────────────────────────────────────────────────────
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [totalQuestions,  setTotalQuestions]  = useState(0);
    const [selectedAnswer,  setSelectedAnswer]  = useState(null);
    const [answerText,      setAnswerText]      = useState('');
    const [loading,         setLoading]         = useState(!prefetched?.firstQuestion);
    const [isSubmitting,    setIsSubmitting]    = useState(false);
    const [errorMessage,    setErrorMessage]    = useState(null);

    const [isCalculating, setIsCalculating] = useState(false);
    const [quizSummary,   setQuizSummary]   = useState(null);

    const [timeLeft,            setTimeLeft]            = useState(60);
    const [gameStarted,         setGameStarted]         = useState(!!prefetched?.firstQuestion);
    const [hasStartedCountdown, setHasStartedCountdown] = useState(false);
    const [startingCountdown,   setStartingCountdown]   = useState(3);

    const timerRef          = useRef(null);
    const hasFetchedInitial = useRef(false);
    const displayNumRef     = useRef(prefetched ? (prefetched.answeredCount ?? 0) + 1 : 1);
    const totalQuestRef     = useRef(prefetched?.totalQuestions ?? 0);

    const displayNum = displayNumRef.current;
    const totalNum   = totalQuestRef.current || totalQuestions;
    const isLastItem = totalNum > 0 && displayNum >= totalNum;

    // ── handleFinish ──────────────────────────────────────────────────────────
    const handleFinish = useCallback(async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsCalculating(true);
        try {
            const token = localStorage.getItem('token');
            let response;
            if (mode === 'activity') {
                response = await authAPI.finishActivity(contentId, token);
            } else {
                response = await authAPI.finishQuiz(contentId, token);
            }
            
            if (response.ok) {
                const result = await response.json();
                // Pinapahaba ng konti ang "Calculating" para sa effect
                await new Promise(r => setTimeout(r, 1400));
                setQuizSummary(result);
            } else {
                navigate(`/student/quest/${questId}/levels`);
            }
        } catch (err) {
            console.error('Finish error:', err);
            navigate(`/student/quest/${questId}/levels`);
        } finally {
            setIsCalculating(false);
        }
    }, [contentId, mode, questId, navigate]);

    // ── fetchQuestion ─────────────────────────────────────────────────────────
    const fetchQuestion = useCallback(async (isNext = false) => {
        if (!paramsValid) {
            setErrorMessage(`Missing parameters: content_id=${contentId} mode=${mode}`);
            setLoading(false);
            return;
        }
        try {
            setErrorMessage(null);
            const token = localStorage.getItem('token');
            let response;
            
            if (mode === 'activity') {
                response = await authAPI.getNextActivityQuestion(contentId, token);
            } else {
                response = await authAPI.getNextQuizQuestion(contentId, token);
            }

            if (response.status === 204) { await handleFinish(); return; }
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                setErrorMessage(`Error ${response.status}: ${errData.message || 'Failed to load question.'}`);
                setLoading(false);
                return;
            }

            const data         = await response.json();
            const questionData = data.question || data.data || data;

            // Check if we actually got a question
            const hasText = questionData && (
                questionData.question_text      ||
                questionData.activity_question ||
                questionData.quiz_question     ||
                questionData.question
            );

            if (hasText) {
                setCurrentQuestion(questionData);

                if (data.total_questions && data.total_questions > 0) {
                    totalQuestRef.current = data.total_questions;
                    setTotalQuestions(data.total_questions);
                }

                if (!isNext && data.answered_count != null) {
                    displayNumRef.current = data.answered_count + 1;
                }

                setSelectedAnswer(null);
                setAnswerText('');
                if (timerRef.current) clearInterval(timerRef.current);
                setTimeLeft(60);

                if (!isNext) {
                    setHasStartedCountdown(true);
                } else {
                    setGameStarted(true);
                }
            } else {
                handleFinish();
            }
        } catch (err) {
            setErrorMessage('Cannot connect to mission control server.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [contentId, mode, handleFinish, paramsValid]);

    // ── handleSubmitAnswer ────────────────────────────────────────────────────
    const handleSubmitAnswer = useCallback(async (isTimeUp = false) => {
        if (isSubmitting || !currentQuestion) return;
        if (timerRef.current) clearInterval(timerRef.current);

        const questionId =
            currentQuestion.id                         ||
            currentQuestion.activity_question_id       ||
            currentQuestion.quiz_question_id           ||
            currentQuestion.quest_activity_question_id ||
            currentQuestion.quest_quiz_question_id;

        if (!questionId) {
            setErrorMessage('Question ID missing — cannot submit.');
            return;
        }

        const nextDisplayNum  = displayNumRef.current + 1;
        const currentIsLast   = totalQuestRef.current > 0 && displayNumRef.current >= totalQuestRef.current;

        try {
            setIsSubmitting(true);
            const token      = localStorage.getItem('token');
            const answerData = {
                answer_id:   isTimeUp ? null : selectedAnswer,
                answer_text: isTimeUp ? ''   : answerText,
            };

            let response;
            if (mode === 'activity') {
                response = await authAPI.submitActivityAnswer(contentId, questionId, answerData, token);
            } else {
                response = await authAPI.submitQuizAnswer(contentId, questionId, answerData, token);
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Submission failed: ${response.status}`);
            }

            if (currentIsLast) {
                await handleFinish();
            } else {
                displayNumRef.current = nextDisplayNum;
                await fetchQuestion(true);
            }
        } catch (err) {
            console.error('Submit error:', err);
            // Resume timer or handle error
            setTimeLeft(60);
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, currentQuestion, selectedAnswer, answerText, mode, contentId, handleFinish, fetchQuestion]);

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (prefetched?.firstQuestion && !hasFetchedInitial.current) {
            hasFetchedInitial.current = true;
            setCurrentQuestion(prefetched.firstQuestion);
            totalQuestRef.current = prefetched.totalQuestions ?? 0;
            displayNumRef.current = (prefetched.answeredCount ?? 0) + 1;
            setTotalQuestions(prefetched.totalQuestions ?? 0);
            setLoading(false);
            return;
        }

        const initializeGame = async () => {
            if (hasFetchedInitial.current) return;
            hasFetchedInitial.current = true;
            fetchQuestion(false);
        };

        if (!hasFetchedInitial.current) initializeGame();
    }, [fetchQuestion, prefetched]);

    // ── Countdown ─────────────────────────────────────────────────────────────
    useEffect(() => {
        let iv;
        if (hasStartedCountdown && !gameStarted && !quizSummary) {
            iv = setInterval(() => {
                setStartingCountdown(prev => {
                    if (prev <= 1) { clearInterval(iv); setGameStarted(true); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(iv);
    }, [hasStartedCountdown, gameStarted, quizSummary]);

    // ── Timer ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (gameStarted && currentQuestion && !loading && !quizSummary && !isCalculating && !isSubmitting) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) { clearInterval(timerRef.current); handleSubmitAnswer(true); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameStarted, currentQuestion, loading, quizSummary, isCalculating, isSubmitting, handleSubmitAnswer]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getQuestionText = () => {
        if (!currentQuestion) return '';
        return currentQuestion.question_text    ||
               currentQuestion.activity_question ||
               currentQuestion.quiz_question     ||
               currentQuestion.question          || '';
    };

    const getChoices = () => {
        if (!currentQuestion) return [];
        let choices =
            currentQuestion.activity_answers       ||
            currentQuestion.quiz_answers           ||
            currentQuestion.answers                ||
            currentQuestion.choices                ||
            currentQuestion.quest_activity_answers ||
            currentQuestion.quest_quiz_answers     || [];

        if (choices.length === 2) {
            const texts = choices.map(c => (c.answer_text || c.text || '').toLowerCase());
            if (texts.includes('true') && texts.includes('false')) {
                return [...choices].sort(a => (a.answer_text || a.text || '').toLowerCase() === 'true' ? -1 : 1);
            }
        }
        return choices;
    };

    const isIdentification =
        currentQuestion?.question_type === 'identification' ||
        currentQuestion?.question_type === 'fill_in_the_blanks';

    const isAnswerProvided = isIdentification ? answerText.trim().length > 0 : selectedAnswer !== null;
    const submitLabel = isSubmitting ? 'ANALYZING...' : isLastItem ? 'FINISH MISSION ✓' : 'SUBMIT ANSWER';

    // ── Render states ─────────────────────────────────────────────────────────
    if (isCalculating) return <CalculatingScreen />;

    if (quizSummary) return (
        <ResultsScreen summary={quizSummary} mode={mode} questId={questId}
            onTryAgain={() => window.location.reload()}
            onBack={() => navigate(`/student/quest/${questId}/levels`)}
            navigate={navigate} />
    );

    if (loading && !currentQuestion && !errorMessage) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-black text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-6" />
            <p className="tracking-widest uppercase italic">Establishing Secure Uplink...</p>
        </div>
    );

    if (hasStartedCountdown && !gameStarted && !errorMessage) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center fixed inset-0 z-[100]">
            <div className="text-center">
                <p className="text-indigo-400 font-black tracking-[0.5em] mb-6 uppercase animate-pulse italic text-sm">Get Ready</p>
                <h1 className="text-[10rem] font-black text-white drop-shadow-[0_0_40px_rgba(99,102,241,0.6)] italic leading-none">
                    {startingCountdown > 0 ? startingCountdown : 'GO!'}
                </h1>
            </div>
        </div>
    );

    if (errorMessage) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
            <div className="bg-[#0f172a] p-10 rounded-3xl shadow-2xl border border-rose-500/30 text-center max-w-md w-full">
                <div className="text-5xl mb-4">📡</div>
                <h2 className="text-xl font-black mb-3 uppercase italic text-rose-400">Communications Error</h2>
                <p className="mb-8 text-white/60 font-medium text-sm leading-relaxed">{errorMessage}</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => { setErrorMessage(null); fetchQuestion(false); }}
                        className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-wider transition-colors">
                        Retry
                    </button>
                    <button onClick={() => navigate(`/student/quest/${questId}/levels`)}
                        className="w-full px-8 py-3 text-white/30 hover:text-white rounded-xl font-black uppercase tracking-wider transition-colors text-sm">
                        Back to Levels
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] relative font-sans text-white flex flex-col">
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/8 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-purple-600/8 rounded-full blur-[140px]" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />
            </div>

            {/* Top bar */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-2 shrink-0">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-5 py-3 rounded-2xl">
                    <div className="flex flex-col leading-none">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">Question</span>
                        <span className="text-xl font-black italic">
                            {displayNum}<span className="text-white/25 text-sm font-bold"> / {totalNum || '?'}</span>
                        </span>
                    </div>
                </div>

                <span className="hidden md:block text-[10px] font-black tracking-[0.3em] text-white/20 uppercase italic">
                    {mode === 'activity' ? 'Activity Mission' : 'Quiz Challenge'}
                </span>

                <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 font-black text-lg italic transition-all duration-700 ${
                    timeLeft <= 10
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse scale-110 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                        : timeLeft <= 20
                            ? 'bg-amber-500/15 border-amber-500/60 text-amber-400 scale-105'
                            : 'bg-white/5 border-white/10 text-white/30 scale-100'
                }`}>
                    {timeLeft}
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative z-10 w-full h-1 bg-white/5 shrink-0">
                <div className={`h-full transition-all duration-1000 ease-linear ${
                    timeLeft <= 10 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                    : timeLeft <= 20 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                }`} style={{ width: `${(timeLeft / 60) * 100}%` }} />
            </div>

            {/* Main content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-5 pt-8 pb-36 max-w-4xl mx-auto w-full gap-6">
                <div className="w-full bg-white/[0.06] backdrop-blur-md rounded-[2rem] px-8 py-10 text-center shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                    <p className="text-indigo-400/70 font-black uppercase tracking-[0.35em] text-[9px] mb-5 italic">— Current Objective —</p>
                    <h2 className="text-2xl md:text-[2rem] font-black leading-snug uppercase tracking-tight text-white">
                        {getQuestionText()}
                    </h2>
                </div>

                <div className="w-full mt-10">
                    {isIdentification ? (
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest italic">Type your answer below</p>
                            <input type="text" value={answerText} onChange={e => setAnswerText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && isAnswerProvided && !isSubmitting && handleSubmitAnswer(false)}
                                placeholder="TYPE YOUR RESPONSE..."
                                className="w-full max-w-2xl bg-white/5 border-2 border-indigo-500/30 focus:border-indigo-400 p-6 rounded-[1.5rem] outline-none text-2xl font-black text-center transition-all placeholder:text-white/15 uppercase italic shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                                autoFocus />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 mt-6">
                            {getChoices().map((choice, idx) => {
                                const choiceId   = choice.id || choice.quest_activity_answer_id || choice.quest_quiz_answer_id || idx;
                                const isSelected = selectedAnswer === choiceId;
                                const letter     = String.fromCharCode(65 + idx);
                                return (
                                    <button key={choiceId}
                                        onClick={() => !isSubmitting && setSelectedAnswer(choiceId)}
                                        disabled={isSubmitting}
                                        className={`group relative flex items-center gap-4 px-8 py-7 rounded-3xl text-lg text-left transition-all duration-200 disabled:pointer-events-none ${
                                            isSelected
                                                ? 'bg-indigo-600/90 shadow-[0_6px_24px_rgba(99,102,241,0.35)] translate-y-[-2px]'
                                                : 'bg-white/[0.05] hover:bg-white/[0.09] shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:translate-y-[-1px]'
                                        }`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${
                                            isSelected ? 'bg-white text-indigo-600' : 'bg-white/10 text-white/50 group-hover:bg-white/20'
                                        }`}>
                                            {letter}
                                        </div>
                                        <span className={`font-bold text-base leading-snug uppercase tracking-tight ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                            {choice.answer_text || choice.text}
                                        </span>
                                        {isSelected && (
                                            <div className="ml-auto shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-black">✓</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom controls */}
            <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-5 pt-4 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent flex items-center justify-between gap-4">
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-rose-500/20 text-white/30 hover:text-rose-400 px-5 py-4 rounded-2xl font-black transition-all border border-white/10 hover:border-rose-500/30 active:scale-95 uppercase italic text-sm whitespace-nowrap">
                    <span className="text-lg leading-none">×</span> Back
                </button>
                <button onClick={() => handleSubmitAnswer(false)} disabled={isSubmitting || !isAnswerProvided}
                    className={`flex-1 max-w-sm py-5 rounded-2xl font-black text-base uppercase italic transition-all active:translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none ${
                        isLastItem
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_8px_24px_rgba(16,185,129,0.4)] border-b-4 border-emerald-700'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] border-b-4 border-indigo-900'
                    }`}>
                    {submitLabel}
                </button>
            </div>
        </div>
    );
};

export default GameEngine;