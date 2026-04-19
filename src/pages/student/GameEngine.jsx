import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/APIservice';

// ─────────────────────────────────────────────────────────────────────────────
// Calculating Screen
// ─────────────────────────────────────────────────────────────────────────────
const CalculatingScreen = () => (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white fixed inset-0 z-50">
        <div className="relative mb-10 text-center">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-none">
                Ella <span className="text-indigo-500">Quest</span>
            </h1>
            <div className="mt-4 h-1 bg-indigo-500/30 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full"
                    style={{ animation: 'loadbar 1.5s ease-in-out infinite' }} />
            </div>
        </div>
        <p className="font-black tracking-[0.4em] uppercase text-indigo-400 animate-pulse text-sm">
            Calculating Results...
        </p>
        <p className="text-white/30 text-xs font-bold mt-2 tracking-widest uppercase">
            Processing Mission Data
        </p>
        <style>{`
            @keyframes loadbar {
                0%   { width: 0%;   margin-left: 0%; }
                50%  { width: 70%;  margin-left: 15%; }
                100% { width: 0%;   margin-left: 100%; }
            }
        `}</style>
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
                        isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                    }`}>
                        {isPassed ? '✓ Mission Cleared' : '✕ Mission Failed'}
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <div className={`w-44 h-44 rounded-full border-[10px] flex flex-col items-center justify-center shadow-2xl ${
                        isPassed
                            ? 'border-emerald-500 shadow-emerald-500/20'
                            : 'border-rose-500 shadow-rose-500/20'
                    }`}>
                        <span className={`text-5xl font-black italic ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {score}%
                        </span>
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

                <div className={`rounded-2xl border p-4 mb-8 text-center ${
                    isPassed
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-rose-500/10 border-rose-500/20'
                }`}>
                    <p className={`text-sm font-bold ${isPassed ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {isPassed
                            ? mode === 'activity'
                                ? '🎉 Activity passed! The Quiz is now unlocked.'
                                : '🏆 Quest level complete!'
                            : `❌ You need ${summary.passing_score ?? 75}% to pass. Keep pushing!`}
                    </p>
                </div>

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

    const contentId  = content_id;
    const prefetched = location.state?.prefetched || null;
    const paramsValid = !!(content_id && mode);

    // ── Core state ────────────────────────────────────────────────────────────
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [totalQuestions,  setTotalQuestions]  = useState(0);
    const [selectedAnswer,  setSelectedAnswer]  = useState(null);
    const [answerText,      setAnswerText]      = useState('');
    const [loading,         setLoading]         = useState(!prefetched?.firstQuestion);
    const [isSubmitting,    setIsSubmitting]    = useState(false);
    const [errorMessage,    setErrorMessage]    = useState(null);

    // ── Feedback state ────────────────────────────────────────────────────────
    const [isFeedbackPhase,   setIsFeedbackPhase]   = useState(false);
    const [feedbackResult,    setFeedbackResult]    = useState(null);
    const [submittedAnswerId, setSubmittedAnswerId] = useState(null);

    const [isCalculating, setIsCalculating] = useState(false);
    const [quizSummary,   setQuizSummary]   = useState(null);

    // ── Timer state ───────────────────────────────────────────────────────────
    const [timeLeft,            setTimeLeft]            = useState(60);
    const [gameStarted,         setGameStarted]         = useState(!!prefetched?.firstQuestion);
    const [hasStartedCountdown, setHasStartedCountdown] = useState(false);
    const [startingCountdown,   setStartingCountdown]   = useState(3);

    const timerRef          = useRef(null);
    const hasFetchedInitial = useRef(false);
    const feedbackTimerRef  = useRef(null);
    const displayNumRef     = useRef(prefetched ? (prefetched.answeredCount ?? 0) + 1 : 1);
    const totalQuestRef     = useRef(prefetched?.totalQuestions ?? 0);

    const displayNum = displayNumRef.current;
    const totalNum   = totalQuestRef.current || totalQuestions;
    const isLastItem = totalNum > 0 && displayNum >= totalNum;

    // ── handleFinish ──────────────────────────────────────────────────────────
    const handleFinish = useCallback(async () => {
        if (timerRef.current)         clearInterval(timerRef.current);
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        setIsCalculating(true);
        try {
            const token = localStorage.getItem('token');
            const response = mode === 'activity'
                ? await authAPI.finishActivity(content_id, token)
                : await authAPI.finishQuiz(content_id, token);

            if (response.ok) {
                const result = await response.json();
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
            setErrorMessage(`Missing parameters: content_id=${content_id} mode=${mode}`);
            setLoading(false);
            return;
        }
        try {
            setErrorMessage(null);
            const token    = localStorage.getItem('token');
            const response = mode === 'activity'
                ? await authAPI.getNextActivityQuestion(content_id, token)
                : await authAPI.getNextQuizQuestion(content_id, token);

            if (response.status === 204) { await handleFinish(); return; }
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                setErrorMessage(`Error ${response.status}: ${errData.message || 'Failed to load question.'}`);
                setLoading(false);
                return;
            }

            const data         = await response.json();
            const questionData = data.question || data.data || data;

            const hasText = questionData && (
                questionData.question_text     ||
                questionData.activity_question  ||
                questionData.quiz_question      ||
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

                // Full reset for new question
                setSelectedAnswer(null);
                setSubmittedAnswerId(null);
                setAnswerText('');
                setIsFeedbackPhase(false);
                setFeedbackResult(null);
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
    }, [content_id, mode, handleFinish, paramsValid]);

    // ── Auto-advance after feedback ────────────────────────────────────────────
    useEffect(() => {
        if (!isFeedbackPhase) return;

        feedbackTimerRef.current = setTimeout(async () => {
            if (isLastItem) {
                await handleFinish();
            } else {
                displayNumRef.current = displayNumRef.current + 1;
                await fetchQuestion(true);
            }
        }, 1800);

        return () => {
            if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        };
    }, [isFeedbackPhase, isLastItem, handleFinish, fetchQuestion]);

    // ── isAnswerProvided helper ───────────────────────────────────────────────
    const isAnswerProvided = useCallback(() => {
        const isIdentification =
            currentQuestion?.question_type === 'identification' ||
            currentQuestion?.question_type === 'fill_in_the_blanks';
        return isIdentification ? answerText.trim().length > 0 : selectedAnswer !== null;
    }, [currentQuestion, answerText, selectedAnswer]);

    // ── handleSubmitAnswer ────────────────────────────────────────────────────
    const handleSubmitAnswer = useCallback(async (isTimeUp = false) => {
        if (isSubmitting || isFeedbackPhase || !currentQuestion) return;
        if (!isTimeUp && !isAnswerProvided()) return;

        if (timerRef.current) clearInterval(timerRef.current);

        const questionId =
            currentQuestion.id                          ||
            currentQuestion.activity_question_id        ||
            currentQuestion.quiz_question_id            ||
            currentQuestion.quest_activity_question_id  ||
            currentQuestion.quest_quiz_question_id;

        if (!questionId) {
            setErrorMessage('Question ID missing — cannot submit.');
            return;
        }

        try {
            setIsSubmitting(true);

            // Save the submitted answer id BEFORE the API call so the
            // feedback highlight can reference it immediately
            const submittedId = isTimeUp ? null : selectedAnswer;
            setSubmittedAnswerId(submittedId);

          const selectedChoice = getChoices().find(c => {
    const id =
        c.id ??
        c.quest_activity_answer_id ??
        c.quest_quiz_answer_id;
    return id === selectedAnswer;
});

const isTrueFalse =
    selectedChoice &&
    ['true', 'false'].includes(
        (selectedChoice.answer_text || selectedChoice.text || '').toLowerCase()
    );

const answerData = isTrueFalse
    ? {
        answer_id: null,
        answer_text: (selectedChoice.answer_text || selectedChoice.text).toLowerCase()
      }
    : {
        answer_id: submittedId,
        answer_text: isTimeUp ? '' : answerText,
      };
            const token    = localStorage.getItem('token');
            const response = mode === 'activity'
                ? await authAPI.submitActivityAnswer(content_id, questionId, answerData, token)
                : await authAPI.submitQuizAnswer(content_id, questionId, answerData, token);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Submission failed: ${response.status}`);
            }

            const result = await response.json();

            // Store the full server response for feedback rendering
            setFeedbackResult(result);
            setIsFeedbackPhase(true);

        } catch (err) {
            console.error('Submit error:', err);
            setTimeLeft(60);
            if (timerRef.current) clearInterval(timerRef.current);
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, isFeedbackPhase, currentQuestion, selectedAnswer, answerText, mode, content_id, isAnswerProvided]);

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

    // ── Main timer ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (gameStarted && currentQuestion && !loading && !quizSummary && !isCalculating && !isSubmitting && !isFeedbackPhase) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmitAnswer(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameStarted, currentQuestion, loading, quizSummary, isCalculating, isSubmitting, isFeedbackPhase, handleSubmitAnswer]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getQuestionText = () => {
        if (!currentQuestion) return '';
        return currentQuestion.question_text     ||
               currentQuestion.activity_question  ||
               currentQuestion.quiz_question      ||
               currentQuestion.question           || '';
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
                return [...choices].sort(a =>
                    (a.answer_text || a.text || '').toLowerCase() === 'true' ? -1 : 1
                );
            }
        }
        return choices;
    };

    const isIdentification =
        currentQuestion?.question_type === 'identification' ||
        currentQuestion?.question_type === 'fill_in_the_blanks';

    const answerProvided = isIdentification ? answerText.trim().length > 0 : selectedAnswer !== null;

    // ─────────────────────────────────────────────────────────────────────────
    // FIX 1: userWasCorrect — checks ALL possible field names the backend
    // might use to indicate correctness in the submit response.
    //
    // The old code only checked feedbackResult?.is_correct === true.
    // If the backend returns { correct: true } or { status: 'correct' }
    // or { result: 'correct' } instead, userWasCorrect was always false
    // making EVERY answer appear incorrect even when it was right.
    // ─────────────────────────────────────────────────────────────────────────
const userWasCorrect = (() => {
    const val =
        feedbackResult?.is_correct ??
        feedbackResult?.correct ??
        feedbackResult?.is_right ??
        feedbackResult?.status ??
        feedbackResult?.result ??
        feedbackResult?.answer_status;

    if (val === true || val === 1 || val === '1') return true;
    if (typeof val === 'string') {
        return val.toLowerCase() === 'correct' || val.toLowerCase() === 'true';
    }

    return false;
})();

    // Optional: if server returns the correct answer id, highlight it too
    const serverCorrectId = feedbackResult
        ? (feedbackResult.correct_answer_id ||
           feedbackResult.correct_id        ||
           feedbackResult.answer_id         ||
           null)
        : null;

    const correctAnswerText = feedbackResult
        ? (feedbackResult.correct_answer_text ||
           feedbackResult.correct_answer      ||
           feedbackResult.correct_text        ||
           null)
        : null;

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
                <p className="text-indigo-400 font-black tracking-[0.5em] mb-6 uppercase animate-pulse italic text-sm">
                    Get Ready
                </p>
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
                    <button
                        onClick={() => { setErrorMessage(null); fetchQuestion(false); }}
                        className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-wider transition-colors"
                    >
                        Retry
                    </button>
                    <button
                        onClick={() => navigate(`/student/quest/${questId}/levels`)}
                        className="w-full px-8 py-3 text-white/30 hover:text-white rounded-xl font-black uppercase tracking-wider transition-colors text-sm"
                    >
                        Back to Levels
                    </button>
                </div>
            </div>
        </div>
    );

    // ── MAIN GAME UI ──────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#020617] relative font-sans text-white flex flex-col">
            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/8 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-purple-600/8 rounded-full blur-[140px]" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />
            </div>

            {/* ── Top bar ── */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-2 shrink-0">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-5 py-3 rounded-2xl">
                    <div className="flex flex-col leading-none">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">
                            Question
                        </span>
                        <span className="text-xl font-black italic">
                            {displayNum}
                            <span className="text-white/25 text-sm font-bold"> / {totalNum || '?'}</span>
                        </span>
                    </div>
                </div>

                <span className="hidden md:block text-[10px] font-black tracking-[0.3em] text-white/20 uppercase italic">
                    {mode === 'activity' ? 'Activity Mission' : 'Quiz Challenge'}
                </span>

                {/* Timer / Feedback indicator */}
                <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 font-black text-lg italic transition-all duration-500 ${
                    isFeedbackPhase
                        ? userWasCorrect
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-110'
                            : 'bg-rose-500/20 border-rose-500 text-rose-400 scale-110'
                        : timeLeft <= 10
                            ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse scale-110 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                            : timeLeft <= 20
                                ? 'bg-amber-500/15 border-amber-500/60 text-amber-400 scale-105'
                                : 'bg-white/5 border-white/10 text-white/30 scale-100'
                }`}>
                    {isFeedbackPhase ? (userWasCorrect ? '✓' : '✕') : timeLeft}
                </div>
            </div>

            {/* ── Progress bar ── */}
            <div className="relative z-10 w-full h-1.5 bg-white/5 shrink-0">
                <div
                    className={`h-full transition-all duration-1000 ease-linear ${
                        isFeedbackPhase
                            ? userWasCorrect
                                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                                : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                            : timeLeft <= 10
                                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                                : timeLeft <= 20
                                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                    : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                    }`}
                    style={{ width: `${isFeedbackPhase ? 100 : (timeLeft / 60) * 100}%` }}
                />
            </div>

            {/* ── Feedback banner ── */}
            {isFeedbackPhase && (
                <div className={`relative z-10 mx-5 mt-4 px-6 py-4 rounded-2xl border text-center transition-all animate-in slide-in-from-top-2 duration-300 ${
                    userWasCorrect
                        ? 'bg-emerald-500/15 border-emerald-500/40'
                        : 'bg-rose-500/15 border-rose-500/40'
                }`}>
                    <p className={`font-black uppercase tracking-widest text-sm ${
                        userWasCorrect ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                        {userWasCorrect ? '✓ Correct!' : '✕ Incorrect'}
                    </p>
                    {!userWasCorrect && correctAnswerText && (
                        <p className="text-white/60 text-xs font-bold mt-1 uppercase tracking-wide">
                            Correct answer: <span className="text-emerald-400 font-black">{correctAnswerText}</span>
                        </p>
                    )}
                    <p className="text-white/30 text-[10px] font-bold mt-1 uppercase tracking-widest animate-pulse">
                        {isLastItem ? 'Finishing mission...' : 'Next question coming...'}
                    </p>
                </div>
            )}

            {/* ── Main content ── */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-5 pt-6 pb-36 max-w-4xl mx-auto w-full gap-6">

                {/* Question card */}
                <div className="w-full bg-white/[0.06] backdrop-blur-md rounded-[2rem] px-8 py-10 text-center shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                    <p className="text-indigo-400/70 font-black uppercase tracking-[0.35em] text-[9px] mb-5 italic">
                        — Current Objective —
                    </p>
                    <h2 className="text-2xl md:text-[2rem] font-black leading-snug uppercase tracking-tight text-white">
                        {getQuestionText()}
                    </h2>
                </div>

                {/* Choices / Input */}
                <div className="w-full">
                    {isIdentification ? (
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest italic">
                                {isFeedbackPhase ? 'Your answer' : 'Type your answer below'}
                            </p>
                            <input
                                type="text"
                                value={answerText}
                                onChange={e => !isFeedbackPhase && setAnswerText(e.target.value)}
                                onKeyDown={e =>
                                    e.key === 'Enter' && answerProvided && !isSubmitting && !isFeedbackPhase &&
                                    handleSubmitAnswer(false)
                                }
                                disabled={isFeedbackPhase || isSubmitting}
                                placeholder="TYPE YOUR RESPONSE..."
                                className={`w-full max-w-2xl border-2 p-6 rounded-[1.5rem] outline-none text-2xl font-black text-center transition-all uppercase italic shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${
                                    isFeedbackPhase
                                        ? userWasCorrect
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                            : 'bg-rose-500/20 border-rose-500 text-rose-400'
                                        : 'bg-white/5 border-indigo-500/30 focus:border-indigo-400 text-white placeholder:text-white/15'
                                }`}
                                autoFocus
                            />
                            {isFeedbackPhase && !userWasCorrect && correctAnswerText && (
                                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-5 py-3 rounded-2xl">
                                    <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">Correct:</span>
                                    <span className="text-emerald-400 font-black text-base uppercase italic">{correctAnswerText}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {getChoices().map((choice, idx) => {
                                // ─────────────────────────────────────────────────
                                // FIX 2: choiceId uses null-check (not falsy check).
                                //
                                // The old code used:
                                //   choice.id || choice.quest_activity_answer_id || idx
                                //
                                // If choice.id = 0 (valid DB id but falsy in JS),
                                // it fell through to idx, so the wrong id was sent
                                // to the API → server couldn't match it → is_correct: false.
                                //
                                // Now we use != null which correctly accepts id=0.
                                // ─────────────────────────────────────────────────
                                const choiceId =
                                    choice.id != null                      ? choice.id :
                                    choice.quest_activity_answer_id != null ? choice.quest_activity_answer_id :
                                    choice.quest_quiz_answer_id != null     ? choice.quest_quiz_answer_id :
                                    idx; // final fallback — always a valid value

                                const letter = String.fromCharCode(65 + idx);

                                // Was this the choice the user submitted?
                                const wasSubmitted = submittedAnswerId === choiceId;

                                // Is this choice the correct one?
                                // Priority 1: user submitted this AND server confirmed correct
                                // Priority 2: server returned correct_answer_id matching this choice
                                // Priority 3: choice.is_correct field (if backend sends it)
                                const isThisChoiceCorrect =
                                    (wasSubmitted && userWasCorrect) ||
                                    (serverCorrectId != null && String(choiceId) === String(serverCorrectId)) ||
                                    (choice.is_correct === true);

                                // ── Button style ──────────────────────────────────
                                let btnClass;
                                if (isFeedbackPhase) {
                                    if (isThisChoiceCorrect) {
                                        btnClass = 'bg-emerald-500 text-white shadow-[0_0_24px_rgba(16,185,129,0.5)] scale-[1.01]';
                                    } else if (wasSubmitted && !isThisChoiceCorrect) {
                                        btnClass = 'bg-rose-500/80 text-white';
                                    } else {
                                        btnClass = 'bg-white/[0.03] text-white/25 opacity-50';
                                    }
                                } else {
                                    const isSelected = selectedAnswer === choiceId;
                                    if (isSelected) {
                                        btnClass = 'bg-indigo-600/90 text-white shadow-[0_6px_24px_rgba(99,102,241,0.35)] translate-y-[-2px]';
                                    } else {
                                        btnClass = 'bg-white/[0.05] hover:bg-white/[0.09] text-white/80 hover:translate-y-[-1px]';
                                    }
                                }

                                // ── Letter badge style ────────────────────────────
                                let badgeClass;
                                if (isFeedbackPhase) {
                                    if (isThisChoiceCorrect)       badgeClass = 'bg-white/30 text-white';
                                    else if (wasSubmitted)         badgeClass = 'bg-white/20 text-white';
                                    else                           badgeClass = 'bg-white/5 text-white/30';
                                } else {
                                    const isSelected = selectedAnswer === choiceId;
                                    badgeClass = isSelected
                                        ? 'bg-white text-indigo-600'
                                        : 'bg-white/10 text-white/50 group-hover:bg-white/20';
                                }

                                const badgeIcon = isFeedbackPhase && isThisChoiceCorrect
                                    ? '✓'
                                    : isFeedbackPhase && wasSubmitted && !isThisChoiceCorrect
                                        ? '✕'
                                        : letter;

                                return (
                                    <button
                                        key={`choice-${idx}`}
                                        onClick={() => {
                                            if (!isSubmitting && !isFeedbackPhase) {
                                                setSelectedAnswer(choiceId);
                                            }
                                        }}
                                        disabled={isSubmitting || isFeedbackPhase}
                                        className={`group relative flex items-center gap-4 px-8 py-7 rounded-3xl text-lg text-left transition-all duration-200 disabled:pointer-events-none ${btnClass}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${badgeClass}`}>
                                            {badgeIcon}
                                        </div>

                                        <span className="font-bold text-base leading-snug uppercase tracking-tight flex-1">
                                            {choice.answer_text || choice.text}
                                        </span>

                                        {isFeedbackPhase && isThisChoiceCorrect && (
                                            <span className="ml-auto shrink-0 text-[10px] font-black uppercase tracking-widest text-white/80 bg-white/15 px-3 py-1 rounded-full">
                                                Correct
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom controls ── */}
            <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-5 pt-4 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent flex items-center justify-between gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-rose-500/20 text-white/30 hover:text-rose-400 px-5 py-4 rounded-2xl font-black transition-all border border-white/10 hover:border-rose-500/30 active:scale-95 uppercase italic text-sm whitespace-nowrap"
                >
                    <span className="text-lg leading-none">×</span> Back
                </button>

                {/* Submit button — hidden during feedback */}
                {!isFeedbackPhase && (
                    <button
                        onClick={() => handleSubmitAnswer(false)}
                        disabled={isSubmitting || !answerProvided}
                        className={`flex-1 max-w-sm py-5 rounded-2xl font-black text-base uppercase italic transition-all active:translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none ${
                            isLastItem
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_8px_24px_rgba(16,185,129,0.4)] border-b-4 border-emerald-700'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] border-b-4 border-indigo-900'
                        }`}
                    >
                        {isSubmitting ? 'ANALYZING...' : isLastItem ? 'FINISH MISSION ✓' : 'SUBMIT ANSWER'}
                    </button>
                )}

                {/* Feedback phase indicator */}
                {isFeedbackPhase && (
                    <div className={`flex-1 max-w-sm py-5 rounded-2xl font-black text-base uppercase italic text-center border-b-4 ${
                        userWasCorrect
                            ? 'bg-emerald-500/20 border-emerald-700 text-emerald-400'
                            : 'bg-rose-500/20 border-rose-700 text-rose-400'
                    }`}>
                        <span className="animate-pulse">
                            {userWasCorrect ? '✓ Moving on...' : '✕ Next question...'}
                        </span>
                    </div>
                )}
            </div>

            {/* Corner glows */}
            <div className="absolute top-0 left-0 w-[35%] h-[35%] bg-indigo-500/8 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[25%] h-[25%] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
};

export default GameEngine;
