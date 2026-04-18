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
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            <div className={`absolute top-0 left-0 w-full h-1 ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} />

            <div className="relative w-full max-w-lg">
                <div className="flex justify-center mb-6">
                    <div className={`px-6 py-2 rounded-full border-2 text-[10px] font-black uppercase tracking-[0.3em] ${
                        isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                    }`}>
                        {isPassed ? '✓ Mission Cleared' : '✕ Mission Failed'}
                    </div>
                </div>

                {/* Score ring */}
                <div className="flex justify-center mb-8">
                    <div className={`w-44 h-44 rounded-full border-[10px] flex flex-col items-center justify-center shadow-2xl ${
                        isPassed ? 'border-emerald-500 shadow-emerald-500/20' : 'border-rose-500 shadow-rose-500/20'
                    }`}>
                        <span className={`text-5xl font-black italic ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {score}%
                        </span>
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Score</span>
                    </div>
                </div>

                {/* Stats */}
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

                {/* Message */}
                <div className={`rounded-2xl border p-4 mb-8 text-center ${
                    isPassed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
                }`}>
                    <p className={`text-sm font-bold ${isPassed ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {isPassed
                            ? mode === 'activity'
                                ? '🎉 Activity passed! The Quiz is now unlocked.'
                                : '🏆 Quest level complete!'
                            : `❌ You need ${summary.passing_score ?? 75}% to pass. Keep pushing!`}
                    </p>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    {isPassed ? (
                        <>
                            {mode === 'activity' && (
                                <button
                                    onClick={() => navigate(`/student/quest/${questId}/levels`)}
                                    className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 shadow-lg shadow-amber-500/20 border-b-4 border-amber-700"
                                >
                                    Proceed to Quiz →
                                </button>
                            )}
                            <button
                                onClick={onBack}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 shadow-lg border-b-4 border-indigo-800"
                            >
                                {mode === 'activity' ? 'Back to Levels' : 'Return to Base'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onTryAgain}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 shadow-lg border-b-4 border-indigo-800"
                            >
                                🔄 Try Again
                            </button>
                            <button
                                onClick={onBack}
                                className="w-full py-3 text-white/40 hover:text-white font-black text-xs uppercase tracking-widest transition-colors"
                            >
                                Back to Levels
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
//
// Route must be: /student/quest/:questId/level/:quest_level_id/play/:contentId?mode=activity|quiz
// useParams() reads exactly: questId, quest_level_id, contentId
// mode from ?mode= query param determines whether contentId is an activityId or quizId
// ─────────────────────────────────────────────────────────────────────────────
const GameEngine = () => {
    // ✅ FIXED: param names match the route exactly
    const { questId, quest_level_id, content_id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate  = useNavigate();
    const location  = useLocation();
    const mode      = searchParams.get('mode'); // 'activity' | 'quiz'

    // ✅ FIXED: derive activityId / quizId from contentId based on mode
    // This ensures both are never undefined simultaneously
    const activityId = mode === 'activity' ? content_id : undefined;
    const quizId     = mode === 'quiz'     ? content_id : undefined;

    const prefetched = location.state?.prefetched || null;

    // ── Core state ──────────────────────────────────────────────────────────
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [metadata, setMetadata] = useState({
        answered_count:  0,
        total_questions: 0,
        display_number:  1,
    });
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerText,     setAnswerText]     = useState('');
    const [loading,        setLoading]        = useState(!prefetched?.firstQuestion);
    const [isSubmitting,   setIsSubmitting]   = useState(false);
    const [errorMessage,   setErrorMessage]   = useState(null);

    // ── Results state ────────────────────────────────────────────────────────
    const [isCalculating, setIsCalculating] = useState(false);
    const [quizSummary,   setQuizSummary]   = useState(null);

    // ── Timer state ──────────────────────────────────────────────────────────
    const [timeLeft,            setTimeLeft]            = useState(60);
    const [gameStarted,         setGameStarted]         = useState(!!prefetched?.firstQuestion);
    const [hasStartedCountdown, setHasStartedCountdown] = useState(false);
    const [startingCountdown,   setStartingCountdown]   = useState(3);
    const timerRef          = useRef(null);
    const hasFetchedInitial = useRef(false);

    // ── Derived ──────────────────────────────────────────────────────────────
    const displayNum = metadata.display_number;
    const totalNum   = metadata.total_questions || 0;
    const isLastItem = totalNum > 0 && displayNum >= totalNum;

    // ── Guard: validate params before any API call ────────────────────────
    // This prevents undefined from ever reaching the API URLs
    const paramsValid = !!(questId && quest_level_id && content_id && mode);

    // ── handleFinish ─────────────────────────────────────────────────────────
    const handleFinish = useCallback(async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsCalculating(true);
        try {
            const token = localStorage.getItem('token');
            let response;
            // ✅ FIXED: use activityId / quizId derived from contentId above
            if (mode === 'activity') {
                response = await authAPI.finishActivity(questId, quest_level_id, activityId, token);
            } else {
                response = await authAPI.finishQuiz(questId, quest_level_id, quizId, token);
            }

            if (response.ok) {
                const result = await response.json();
                await new Promise(r => setTimeout(r, 1200));
                setQuizSummary(result);
            } else {
                const err = await response.json().catch(() => ({}));
                console.error('Finish failed:', err);
                navigate(`/student/quest/${questId}/levels`);
            }
        } catch (err) {
            console.error('Finish error:', err);
            navigate(`/student/quest/${questId}/levels`);
        } finally {
            setIsCalculating(false);
        }
    }, [questId, quest_level_id, activityId, quizId, mode, navigate]);

    // ── fetchQuestion ─────────────────────────────────────────────────────────
    const fetchQuestion = useCallback(async (isNext = false) => {
        if (!paramsValid) {
            setErrorMessage('Missing required parameters. Please go back and try again.');
            setLoading(false);
            return;
        }
        try {
            setErrorMessage(null);
            const token = localStorage.getItem('token');
            let response;

            // ✅ FIXED: strict separation — activity vs quiz API calls
            if (mode === 'activity') {
                response = await authAPI.getNextActivityQuestion(questId, quest_level_id, activityId, token);
            } else {
                response = await authAPI.getNextQuizQuestion(questId, quest_level_id, quizId, token);
            }

            if (response.status === 204) { handleFinish(); return; }
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                setErrorMessage(`Error ${response.status}: ${errData.message || 'Failed to load question.'}`);
                return;
            }

            const data         = await response.json();
            const questionData = data.question || data.data || data;

            if (questionData && (questionData.question_text || questionData.activity_question || questionData.quiz_question)) {
                setCurrentQuestion(questionData);
                setMetadata(prev => ({
                    answered_count:  data.answered_count  ?? prev.answered_count,
                    total_questions: data.total_questions  || prev.total_questions,
                    display_number:  isNext
                        ? prev.display_number + 1
                        : (data.answered_count != null ? data.answered_count + 1 : 1),
                }));
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
    }, [questId, quest_level_id, activityId, quizId, mode, handleFinish, paramsValid]);

    // ── handleSubmitAnswer ────────────────────────────────────────────────────
    const handleSubmitAnswer = useCallback(async (isTimeUp = false) => {
        if (isSubmitting || !currentQuestion) return;
        if (!paramsValid) {
            setErrorMessage('Missing parameters — cannot submit.');
            return;
        }

        try {
            setIsSubmitting(true);
            if (timerRef.current) clearInterval(timerRef.current);

            const token = localStorage.getItem('token');
            const answerData = {
                answer_id:   isTimeUp ? null : selectedAnswer,
                answer_text: isTimeUp ? ''   : answerText,
            };

            // ✅ FIXED: extract questionId with all possible field names
            const questionId =
                currentQuestion.id                         ||
                currentQuestion.activity_question_id       ||
                currentQuestion.quiz_question_id           ||
                currentQuestion.quest_activity_question_id ||
                currentQuestion.quest_quiz_question_id;

            if (!questionId) {
                console.error('Missing question ID in:', currentQuestion);
                setErrorMessage('Question ID missing — cannot submit answer.');
                return;
            }

            let response;
            // ✅ FIXED: strict separation — activity vs quiz submit
            if (mode === 'activity') {
                response = await authAPI.submitActivityAnswer(questId, quest_level_id, activityId, questionId, answerData, token);
            } else {
                response = await authAPI.submitQuizAnswer(questId, quest_level_id, quizId, questionId, answerData, token);
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Submission failed');
            }

            // ✅ FIXED: check isLastItem using current metadata snapshot
            if (isLastItem) {
                await handleFinish();
            } else {
                await fetchQuestion(true);
            }
        } catch (err) {
            console.error('Submit error:', err);
            fetchQuestion(false);
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, currentQuestion, selectedAnswer, answerText, mode, questId, quest_level_id, activityId, quizId, isLastItem, handleFinish, fetchQuestion, paramsValid]);

    // ── Init ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        // ✅ Use prefetched data if available — zero loading delay
        if (prefetched?.firstQuestion && !hasFetchedInitial.current) {
            hasFetchedInitial.current = true;
            setCurrentQuestion(prefetched.firstQuestion);
            setMetadata({
                answered_count:  prefetched.answeredCount  ?? 0,
                total_questions: prefetched.totalQuestions ?? 0,
                display_number:  (prefetched.answeredCount ?? 0) + 1,
            });
            setLoading(false);
            // gameStarted already true from useState initializer
            return;
        }

        // Fallback: fetch from API
        const initializeGame = async () => {
            if (hasFetchedInitial.current) return;
            hasFetchedInitial.current = true;

            if (!paramsValid) {
                setErrorMessage(`Invalid parameters: questId=${questId} quest_level_id=${quest_level_id} content_id=${content_id} mode=${mode}`);
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                // ✅ FIXED: strict separation for total count fetch
                if (mode === 'activity') {
                    const r = await authAPI.getActivityQuestions(questId, quest_level_id, activityId, token);
                    if (r.ok) {
                        const d = await r.json();
                        setMetadata(p => ({ ...p, total_questions: Array.isArray(d) ? d.length : (d.total || 0) }));
                    }
                } else {
                    const r = await authAPI.getQuizQuestions(questId, quest_level_id, quizId, token);
                    if (r.ok) {
                        const d = await r.json();
                        setMetadata(p => ({ ...p, total_questions: Array.isArray(d) ? d.length : (d.total || 0) }));
                    }
                }
                fetchQuestion(false);
            } catch (err) {
                console.error('Init error:', err);
                setErrorMessage('Failed to initialize game session.');
                setLoading(false);
            }
        };

        if (!hasFetchedInitial.current) initializeGame();
    }, [questId, quest_level_id, activityId, quizId, mode, fetchQuestion, prefetched, paramsValid, content_id]);

    // ── Fallback countdown (no prefetch path only) ────────────────────────
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

    // ── Main timer ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (gameStarted && currentQuestion && !loading && !quizSummary && !isCalculating) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) { clearInterval(timerRef.current); handleSubmitAnswer(true); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameStarted, currentQuestion, loading, quizSummary, isCalculating, handleSubmitAnswer]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getQuestionText = () => {
        if (!currentQuestion) return '';
        return currentQuestion.question_text   ||
               currentQuestion.activity_question ||
               currentQuestion.quiz_question    ||
               currentQuestion.question         || '';
    };

    const getChoices = () => {
        if (!currentQuestion) return [];
        let choices =
            currentQuestion.activity_answers      ||
            currentQuestion.quiz_answers          ||
            currentQuestion.answers               ||
            currentQuestion.choices               ||
            currentQuestion.quest_activity_answers ||
            currentQuestion.quest_quiz_answers    || [];

        // Sort True/False: True first
        if (choices.length === 2) {
            const texts = choices.map(c => (c.answer_text || c.text || '').toLowerCase());
            if (texts.includes('true') && texts.includes('false')) {
                return [...choices].sort(a => (a.answer_text || a.text || '').toLowerCase() === 'true' ? -1 : 1);
            }
        }
        return choices;
    };

    const isAnswerProvided = currentQuestion?.question_type === 'identification'
        ? answerText.trim().length > 0
        : selectedAnswer !== null;

    const submitLabel = isSubmitting ? 'ANALYZING...' : isLastItem ? 'FINISH ✓' : 'SUBMIT ANSWER';

    // ── Render states ─────────────────────────────────────────────────────────
    if (isCalculating) return <CalculatingScreen />;

    if (quizSummary) return (
        <ResultsScreen
            summary={quizSummary}
            mode={mode}
            questId={questId}
            onTryAgain={() => window.location.reload()}
            onBack={() => navigate(`/student/quest/${questId}/levels`)}
            navigate={navigate}
        />
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
                <p className="text-indigo-400 font-black tracking-[0.5em] mb-4 uppercase animate-pulse italic">Get Ready</p>
                <h1 className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.5)] italic">
                    {startingCountdown > 0 ? startingCountdown : 'GO!'}
                </h1>
            </div>
        </div>
    );

    if (errorMessage) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
            <div className="bg-gray-800/80 p-8 rounded-3xl shadow-xl border-4 border-rose-500 text-center max-w-md">
                <h2 className="text-xl font-black mb-4 uppercase italic">Communications Error</h2>
                <p className="mb-6 opacity-80 font-medium">{errorMessage}</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => fetchQuestion(false)} className="px-8 py-3 bg-white text-gray-900 rounded-xl font-black uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-colors">
                        Retry
                    </button>
                    <button onClick={() => navigate(`/student/quest/${questId}/levels`)} className="px-8 py-3 bg-transparent text-white/40 hover:text-white rounded-xl font-black uppercase tracking-wider transition-colors">
                        Back to Levels
                    </button>
                </div>
            </div>
        </div>
    );

    // ── Main Game UI ──────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#020617] relative overflow-hidden font-sans text-white">
            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            </div>

            {/* Top bar */}
            <div className="relative z-10 w-full flex justify-between items-center px-6 pt-6 pb-3">
                <div className="bg-[#0f172a] border-2 border-indigo-500/30 px-5 py-3 rounded-2xl shadow-xl min-w-[120px] flex flex-col items-center">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Progress</p>
                    <div className="text-xl font-black italic">
                        {displayNum} <span className="text-white/30 text-sm">/ {totalNum}</span>
                    </div>
                </div>

                <h1 className="hidden md:block text-base font-black tracking-[0.2em] text-white/30 uppercase italic">
                    {mode === 'activity' ? 'Activity Mission' : 'Quiz Challenge'}
                </h1>

                {/* Timer — only visible at ≤15s */}
                <div className={`transition-all duration-500 flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 font-black text-2xl italic shadow-xl ${
                    timeLeft <= 15
                        ? 'opacity-100 scale-100 bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse shadow-rose-500/30'
                        : 'opacity-0 scale-75 pointer-events-none border-transparent'
                }`}>
                    {timeLeft}
                </div>
            </div>

            {/* Progress line */}
            <div className="relative z-10 w-full h-1.5 bg-white/5">
                <div
                    className={`h-full transition-all duration-1000 ease-linear ${
                        timeLeft <= 15
                            ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                            : 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                    }`}
                    style={{ width: `${(timeLeft / 60) * 100}%` }}
                />
            </div>

            {/* Main content */}
            <div className="relative z-10 max-w-5xl mx-auto mt-8 px-6 pb-36 flex flex-col gap-6">
                {/* Question */}
                <div className="bg-[#0f172a]/90 border-2 border-indigo-500/40 p-10 rounded-[2.5rem] text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-sm">
                    <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-4 italic">— Current Objective —</p>
                    <h2 className="text-2xl md:text-4xl font-black leading-tight uppercase tracking-tight italic text-white">
                        {getQuestionText()}
                    </h2>
                </div>

                {/* Choices / Input */}
                <div className="bg-[#0f172a]/80 border-2 border-indigo-500/20 p-8 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                    {currentQuestion?.question_type === 'identification' ? (
                        <div className="max-w-2xl mx-auto">
                            <input
                                type="text"
                                value={answerText}
                                onChange={e => setAnswerText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && isAnswerProvided && !isSubmitting && handleSubmitAnswer(false)}
                                placeholder="TYPE YOUR RESPONSE..."
                                className="w-full bg-[#1e293b] border-4 border-indigo-500/40 p-6 rounded-[2rem] outline-none focus:border-indigo-400 text-2xl font-black text-center transition-all placeholder:text-white/10 uppercase italic"
                                autoFocus
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {getChoices().map((choice, idx) => {
                                const choiceId   = choice.id || choice.quest_activity_answer_id || choice.quest_quiz_answer_id || idx;
                                const isSelected = selectedAnswer === choiceId;
                                return (
                                    <button
                                        key={choiceId}
                                        onClick={() => setSelectedAnswer(choiceId)}
                                        disabled={isSubmitting}
                                        className={`group relative flex items-center p-5 rounded-2xl border-b-[6px] border-x-2 border-t-2 transition-all duration-150 text-left disabled:pointer-events-none ${
                                            isSelected
                                                ? 'bg-indigo-600 border-indigo-400 translate-y-1 shadow-none'
                                                : 'bg-[#1e293b] border-indigo-500/25 hover:bg-[#243147] hover:border-indigo-500/50 shadow-[0_6px_0_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-5 font-black text-base shrink-0 transition-colors ${
                                            isSelected ? 'bg-white text-indigo-600' : 'bg-white/10 text-white/40 group-hover:bg-white/20'
                                        }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="text-base font-bold leading-tight uppercase italic">
                                            {choice.answer_text || choice.text}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom controls */}
            <div className="fixed bottom-0 left-0 right-0 z-20 px-6 pb-6 pt-4 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent flex justify-between items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-6 py-4 rounded-2xl font-black transition-all border-2 border-rose-500/20 active:scale-95 uppercase italic text-sm"
                >
                    <span className="text-xl leading-none">×</span> Back
                </button>

                <button
                    onClick={() => handleSubmitAnswer(false)}
                    disabled={isSubmitting || !isAnswerProvided}
                    className={`flex-1 max-w-xs py-5 rounded-2xl font-black text-base uppercase italic border-b-4 border-x-2 border-t-2 transition-all active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:pointer-events-none ${
                        isLastItem
                            ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-700 text-white shadow-[0_6px_0_0_rgba(0,0,0,0.4)]'
                            : 'bg-indigo-500 hover:bg-indigo-400 border-indigo-800 text-white shadow-[0_6px_0_0_rgba(0,0,0,0.4)]'
                    }`}
                >
                    {submitLabel}
                </button>
            </div>

            {/* Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
};

export default GameEngine;