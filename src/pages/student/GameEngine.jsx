import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/APIservice';
import GameEngineUI, { CalculatingScreen, ResultsScreen } from './GameEngineui';

// ─────────────────────────────────────────────────────────────────────────────
// Question type helpers
// ─────────────────────────────────────────────────────────────────────────────

// Choice-based: renders buttons, submits answer_id
const isChoiceType = (qt) =>
    qt === 'multiple_choice' ||
    qt === 'multiple choice' ||
    qt === 'mcq'             ||
    qt === 'true_false'      ||
    qt === 'true/false'      ||
    qt === 'boolean';

// Text-based: renders text input, submits answer_text
const isTextType = (qt) =>
    qt === 'identification'     ||
    qt === 'fill_in_the_blanks' ||
    qt === 'fill_in_blanks'     ||
    qt === 'fill_in_the_blank'  ||
    qt === 'essay';

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ ATTEMPT LIMIT — stored in sessionStorage per quiz content_id
// Activity = unlimited, Quiz = max 3 attempts
// ─────────────────────────────────────────────────────────────────────────────
const QUIZ_MAX_ATTEMPTS = 3;

const getAttemptCount = (contentId) => {
    try {
        return parseInt(sessionStorage.getItem(`quiz_attempts_${contentId}`) || '0', 10);
    } catch { return 0; }
};

const incrementAttemptCount = (contentId) => {
    try {
        const next = getAttemptCount(contentId) + 1;
        sessionStorage.setItem(`quiz_attempts_${contentId}`, String(next));
        return next;
    } catch { return 1; }
};

// ─────────────────────────────────────────────────────────────────────────────
// GameEngine — logic only
// Renders GameEngineUI and passes all state/handlers as props.
//
// Route: /student/quest/:questId/level/:quest_level_id/play/:content_id?mode=activity|quiz
// ─────────────────────────────────────────────────────────────────────────────
const GameEngine = () => {
    const { questId, quest_level_id, content_id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate    = useNavigate();
    const location    = useLocation();
    const mode        = searchParams.get('mode'); // 'activity' | 'quiz'
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

    // ── Feedback state ────────────────────────────────────────────────────────
    const [isFeedbackPhase,   setIsFeedbackPhase]   = useState(false);
    const [feedbackResult,    setFeedbackResult]    = useState(null);
    const [submittedAnswerId, setSubmittedAnswerId] = useState(null);

    // ── Results state ─────────────────────────────────────────────────────────
    const [isCalculating, setIsCalculating] = useState(false);
    const [quizSummary,   setQuizSummary]   = useState(null);

    // ── Attempt gate (quiz only) ──────────────────────────────────────────────
    // attemptBlocked = true when quiz has hit the 3-attempt limit
    const [attemptBlocked, setAttemptBlocked] = useState(false);
    const [attemptCount,   setAttemptCount]   = useState(0);

    // ── Timer state ───────────────────────────────────────────────────────────
    const [timeLeft,            setTimeLeft]            = useState(60);
    const [gameStarted,         setGameStarted]         = useState(!!prefetched?.firstQuestion);
    const [hasStartedCountdown, setHasStartedCountdown] = useState(false);
    const [startingCountdown,   setStartingCountdown]   = useState(3);

    // ── Refs ──────────────────────────────────────────────────────────────────
    const timerRef          = useRef(null);
    const feedbackTimerRef  = useRef(null);
    const hasFetchedInitial = useRef(false);
    const isFetchingRef     = useRef(false);
    const isFinishingRef    = useRef(false);
    // Always start display from 1 — never trust answered_count from backend
    // on a re-attempt because the old session may still have stale count.
    const displayNumRef  = useRef(1);
    const totalQuestRef  = useRef(prefetched?.totalQuestions ?? 0);

    // ── Derived values ────────────────────────────────────────────────────────
    const displayNum       = displayNumRef.current;
    const totalNum         = totalQuestRef.current || totalQuestions;
    const isLastItem       = totalNum > 0 && displayNum >= totalNum;
    const questionType     = currentQuestion?.question_type || '';
    const isIdentification = isTextType(questionType);

    // ── On mount: check quiz attempt gate ────────────────────────────────────
    useEffect(() => {
        if (mode === 'quiz' && content_id) {
            const count = getAttemptCount(content_id);
            setAttemptCount(count);
            if (count >= QUIZ_MAX_ATTEMPTS) {
                setAttemptBlocked(true);
            }
        }
    }, [mode, content_id]);

    // ── handleFinish ──────────────────────────────────────────────────────────
    const handleFinish = useCallback(async () => {
        if (isFinishingRef.current) return;
        isFinishingRef.current = true;

        if (timerRef.current)         clearInterval(timerRef.current);
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        setIsCalculating(true);
        try {
            const token    = localStorage.getItem('token');
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
            isFinishingRef.current = false;
        }
    }, [content_id, mode, questId, navigate]);

    // ── fetchQuestion ─────────────────────────────────────────────────────────
    const fetchQuestion = useCallback(async (isNext = false) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        if (!paramsValid) {
            setErrorMessage(`Missing parameters: content_id=${content_id} mode=${mode}`);
            setLoading(false);
            isFetchingRef.current = false;
            return;
        }
        try {
            setErrorMessage(null);
            const token    = localStorage.getItem('token');
            const response = mode === 'activity'
                ? await authAPI.getNextActivityQuestion(content_id, token)
                : await authAPI.getNextQuizQuestion(content_id, token);

            if (response.status === 204) {
                isFetchingRef.current = false;
                await handleFinish();
                return;
            }
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                setErrorMessage(`Error ${response.status}: ${errData.message || 'Failed to load question.'}`);
                setLoading(false);
                isFetchingRef.current = false;
                return;
            }

            const data         = await response.json();
            const questionData = data.question || data.data || data;

            const hasText = questionData && (
                questionData.question_text    ||
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

                // Always start at 1 for the first question of any attempt.
                // Do NOT use data.answered_count — it may be stale from a
                // previous session and would cause "Question 6/5" on re-attempts.
                if (!isNext) {
                    displayNumRef.current = 1;
                }

                // Full state reset for the new question
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
                isFetchingRef.current = false;
                await handleFinish();
                return;
            }
        } catch (err) {
            setErrorMessage('Cannot connect to mission control server.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [content_id, mode, handleFinish, paramsValid]);

    // ── Auto-advance after feedback (1.8s) ────────────────────────────────────
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
        return () => { if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFeedbackPhase, isLastItem]);

    // ── isAnswerProvided ──────────────────────────────────────────────────────
    const isAnswerProvided = useCallback(() => {
        if (isIdentification) return answerText.trim().length > 0;
        return selectedAnswer !== null;
    }, [isIdentification, answerText, selectedAnswer]);

    // ── handleSubmitAnswer ────────────────────────────────────────────────────
    const handleSubmitAnswer = useCallback(async (isTimeUp = false) => {
        if (isSubmitting || isFeedbackPhase || !currentQuestion) return;
        if (!isTimeUp && !isAnswerProvided()) return;

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

        try {
            setIsSubmitting(true);

            let answerData;
            let capturedSubmittedId = null;

            if (isTimeUp) {
                answerData = {
                    answer_id:      null,
                    answer_text:    '',
                    quest_level_id: quest_level_id || null,
                };
            } else if (isIdentification) {
                answerData = {
                    answer_id:      null,
                    answer_text:    answerText.trim(),
                    quest_level_id: quest_level_id || null,
                };
            } else {
                capturedSubmittedId = selectedAnswer;
                answerData = {
                    answer_id:      selectedAnswer,
                    answer_text:    null,
                    quest_level_id: quest_level_id || null,
                };
            }

            // Set BEFORE API call so feedback highlight is always accurate
            setSubmittedAnswerId(capturedSubmittedId);

            const token    = localStorage.getItem('token');
            const response = mode === 'activity'
                ? await authAPI.submitActivityAnswer(content_id, questionId, answerData, token)
                : await authAPI.submitQuizAnswer(content_id, questionId, answerData, token);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Submission failed: ${response.status}`);
            }

            const result = await response.json();
            setFeedbackResult(result);
            setIsFeedbackPhase(true);

        } catch (err) {
            console.error('Submit error:', err);
            // Do NOT reset timer on error — question stays frozen
        } finally {
            setIsSubmitting(false);
        }
    }, [
        isSubmitting, isFeedbackPhase, currentQuestion, selectedAnswer,
        answerText, mode, content_id, quest_level_id, isAnswerProvided, isIdentification,
    ]);

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        // Record this attempt when the game starts
        if (mode === 'quiz' && content_id) {
            incrementAttemptCount(content_id);
            setAttemptCount(getAttemptCount(content_id));
        }

        if (prefetched?.firstQuestion && !hasFetchedInitial.current) {
            hasFetchedInitial.current = true;
            setCurrentQuestion(prefetched.firstQuestion);
            totalQuestRef.current = prefetched.totalQuestions ?? 0;
            displayNumRef.current = 1; // Always start at 1
            setTotalQuestions(prefetched.totalQuestions ?? 0);
            setLoading(false);
            return;
        }
        const initializeGame = async () => {
            if (hasFetchedInitial.current) return;
            hasFetchedInitial.current = true;
            await fetchQuestion(false);
        };
        if (!hasFetchedInitial.current) initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    // ── Main game timer ───────────────────────────────────────────────────────
    useEffect(() => {
        if (
            gameStarted && currentQuestion && !loading &&
            !quizSummary && !isCalculating && !isSubmitting && !isFeedbackPhase
        ) {
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
        return currentQuestion.question_text    ||
               currentQuestion.activity_question ||
               currentQuestion.quiz_question     ||
               currentQuestion.question          || '';
    };

    const getChoices = () => {
        if (!currentQuestion) return [];
        const choices =
            currentQuestion.activity_answers       ||
            currentQuestion.quiz_answers           ||
            currentQuestion.answers                ||
            currentQuestion.choices                ||
            currentQuestion.quest_activity_answers ||
            currentQuestion.quest_quiz_answers     || [];

        // Sort True/False: True always first
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

    // ── Feedback derived values ───────────────────────────────────────────────
    const userWasCorrect =
        feedbackResult?.is_correct    === true      ||
        feedbackResult?.correct       === true      ||
        feedbackResult?.is_right      === true      ||
        feedbackResult?.status        === 'correct' ||
        feedbackResult?.result        === 'correct' ||
        feedbackResult?.answer_status === 'correct';

    const serverCorrectId = feedbackResult
        ? (feedbackResult.correct_answer_id || feedbackResult.correct_id || feedbackResult.answer_id || null)
        : null;

    const correctAnswerText = feedbackResult
        ? (feedbackResult.correct_answer_text || feedbackResult.correct_answer || feedbackResult.correct_text || null)
        : null;

    const answerProvided = isIdentification
        ? answerText.trim().length > 0
        : selectedAnswer !== null;

    // ── handleTryAgain ────────────────────────────────────────────────────────
    // For ACTIVITY — unlimited retakes.
    //   1. Close the current backend session via finishActivity.
    //   2. Fully reset all local state (display counter, refs, answers).
    //   3. Re-fetch the first question — no page reload needed, which means
    //      the session starts fresh from Q1 without any stale answered_count.
    //
    // For QUIZ — max 3 attempts (tracked in sessionStorage).
    //   If under limit: same reset flow as activity.
    //   If at limit: block with attemptBlocked UI instead of resetting.
    const handleTryAgain = useCallback(async () => {
        // ── Quiz attempt gate ─────────────────────────────────────────────
        if (mode === 'quiz') {
            const currentCount = getAttemptCount(content_id);
            if (currentCount >= QUIZ_MAX_ATTEMPTS) {
                setAttemptBlocked(true);
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            // Close the current session gracefully (ignore if already closed)
            if (mode === 'activity') {
                await authAPI.finishActivity(content_id, token).catch(() => {});
            } else {
                await authAPI.finishQuiz(content_id, token).catch(() => {});
            }
        } catch (_) { /* ignore */ }

        // ── Full state reset ──────────────────────────────────────────────
        // Reset EVERY piece of state so Q1 starts with a clean slate.
        // This is what prevents "Question 6/5" on re-attempts.
        setQuizSummary(null);
        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setSubmittedAnswerId(null);
        setAnswerText('');
        setIsFeedbackPhase(false);
        setFeedbackResult(null);
        setIsCalculating(false);
        setErrorMessage(null);
        setTimeLeft(60);
        setGameStarted(false);
        setHasStartedCountdown(false);
        setStartingCountdown(3);
        setTotalQuestions(0);
        setIsSubmitting(false);

        // Reset all refs
        hasFetchedInitial.current = false;
        isFetchingRef.current     = false;
        isFinishingRef.current    = false;
        displayNumRef.current     = 1;     // ← KEY: reset to 1 so counter starts over
        totalQuestRef.current     = 0;

        // Clear any running timers
        if (timerRef.current)         clearInterval(timerRef.current);
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);

        // Record attempt for quiz
        if (mode === 'quiz' && content_id) {
            const newCount = incrementAttemptCount(content_id);
            setAttemptCount(newCount);
            if (newCount >= QUIZ_MAX_ATTEMPTS) {
                // This was the last allowed attempt — they just used it
                // (they played; result screen will block further retries)
            }
        }

        // Set loading state and fetch fresh Q1
        setLoading(true);
        await fetchQuestion(false);

    }, [content_id, mode, fetchQuestion]);

    // ── Early render states ───────────────────────────────────────────────────

    // Quiz attempt blocked screen
    if (attemptBlocked && mode === 'quiz') return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
            <div className="bg-[#0f172a] p-10 rounded-3xl shadow-2xl border border-amber-500/30 text-center max-w-md w-full">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-xl font-black mb-3 uppercase italic text-amber-400">Attempt Limit Reached</h2>
                <p className="mb-2 text-white/60 font-medium text-sm leading-relaxed">
                    You have used all <span className="text-amber-400 font-black">{QUIZ_MAX_ATTEMPTS}</span> attempts for this quiz.
                </p>
                <p className="mb-8 text-white/40 text-xs font-bold uppercase tracking-widest">
                    Attempts used: {attemptCount} / {QUIZ_MAX_ATTEMPTS}
                </p>
                <button
                    onClick={() => navigate(`/student/quest/${questId}/levels`)}
                    className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-wider transition-colors"
                >
                    Back to Levels
                </button>
            </div>
        </div>
    );

    if (isCalculating) return <CalculatingScreen />;

    if (quizSummary) return (
        <ResultsScreen
            summary={quizSummary}
            mode={mode}
            questId={questId}
            attemptCount={attemptCount}
            maxAttempts={mode === 'quiz' ? QUIZ_MAX_ATTEMPTS : null}
            onTryAgain={handleTryAgain}
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
                        onClick={() => {
                            setErrorMessage(null);
                            hasFetchedInitial.current = false;
                            isFetchingRef.current     = false;
                            fetchQuestion(false);
                        }}
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

    // ── Render main game UI ───────────────────────────────────────────────────
    return (
        <GameEngineUI
            navigate={navigate}
            mode={mode}
            questId={questId}
            currentQuestion={currentQuestion}
            getQuestionText={getQuestionText}
            getChoices={getChoices}
            isIdentification={isIdentification}
            displayNum={displayNum}
            totalNum={totalNum}
            isLastItem={isLastItem}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            answerText={answerText}
            setAnswerText={setAnswerText}
            answerProvided={answerProvided}
            isSubmitting={isSubmitting}
            handleSubmitAnswer={handleSubmitAnswer}
            timeLeft={timeLeft}
            isFeedbackPhase={isFeedbackPhase}
            userWasCorrect={userWasCorrect}
            correctAnswerText={correctAnswerText}
            serverCorrectId={serverCorrectId}
            submittedAnswerId={submittedAnswerId}
            feedbackResult={feedbackResult}
        />
    );
};

export default GameEngine;
