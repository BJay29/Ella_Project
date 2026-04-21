import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/APIservice';
import GameEngineUI, { CalculatingScreen, ResultsScreen } from './GameEngineui';

// ─────────────────────────────────────────────────────────────────────────────
// Question type helpers
// ─────────────────────────────────────────────────────────────────────────────
const isChoiceType = (qt) =>
    qt === 'multiple_choice' ||
    qt === 'multiple choice' ||
    qt === 'mcq'             ||
    qt === 'true_false'      ||
    qt === 'true/false'      ||
    qt === 'boolean';

const isTextType = (qt) =>
    qt === 'identification'     ||
    qt === 'fill_in_the_blanks' ||
    qt === 'fill_in_blanks'     ||
    qt === 'fill_in_the_blank'  ||
    qt === 'essay';

// ─────────────────────────────────────────────────────────────────────────────
// Quiz attempt limit (client-side enforcement — 3 attempts max)
// ─────────────────────────────────────────────────────────────────────────────
const QUIZ_MAX_ATTEMPTS = 3;

const getAttemptCount = (content_id) => {
    try { return parseInt(sessionStorage.getItem(`quiz_attempts_${content_id}`) || '0', 10); }
    catch { return 0; }
};

const incrementAttemptCount = (content_id) => {
    try {
        const next = getAttemptCount(content_id) + 1;
        sessionStorage.setItem(`quiz_attempts_${content_id}`, String(next));
        return next;
    } catch { return 1; }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: extract attempt_id from any backend response shape
// The backend may nest it differently depending on the endpoint.
// ─────────────────────────────────────────────────────────────────────────────
const extractAttemptId = (data) => {
    if (!data) return null;
    return (
        data.attempt_id           ??
        data.activity_attempt_id  ??
        data.quiz_attempt_id      ??
        data.session_id           ??
        data.attempt?.id          ??
        data.attempt?.attempt_id  ??
        data.question?.attempt_id ??
        data.data?.attempt_id     ??
        null
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: detect if backend response means "all questions already answered"
// IMPORTANT: Only triggers on definitive completion signals.
// We no longer treat answered_count >= total_questions as completed here
// because on the FIRST question of a fresh session, answered_count=0 and
// total_questions=N which is valid — we should NOT finish.
// ─────────────────────────────────────────────────────────────────────────────
const isCompletedResponse = (status, data) => {
    if (status === 204) return true;
    if (!data) return false;
    if (data.completed === true) return true;
    // Only treat as completed if the message explicitly says so AND there is no question data
    const hasQuestionData = !!(
        data.question_text     ||
        data.activity_question ||
        data.quiz_question     ||
        data.question          ||
        data.question_content  ||
        (data.question && typeof data.question === 'object') ||
        (data.data    && typeof data.data    === 'object')
    );
    if (!hasQuestionData && typeof data.message === 'string' &&
        (data.message.toLowerCase().includes('all questions answered') ||
         data.message.toLowerCase().includes('already answered'))) return true;
    return false;
};

// ─────────────────────────────────────────────────────────────────────────────
// GameEngine — logic only
// ─────────────────────────────────────────────────────────────────────────────
const GameEngine = () => {
    const { questId, quest_level_id, content_id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate    = useNavigate();
    const location    = useLocation();
    const mode        = searchParams.get('mode');
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

    // ── Quiz attempt state ────────────────────────────────────────────────────
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
    const isSubmittingRef   = useRef(false);
    const displayNumRef     = useRef(1);
    const totalQuestRef     = useRef(prefetched?.totalQuestions ?? 0);

    // ── attempt_id ref — tracks the current session's attempt ID ─────────────
    // This is set from the backend response on every getNextQuestion call
    // and on retake, and is included in every submitAnswer payload.
    const attemptIdRef = useRef(null);

    // ── Derived values ────────────────────────────────────────────────────────
    const displayNum       = displayNumRef.current;
    const totalNum         = totalQuestRef.current || totalQuestions;
    const isLastItem       = totalNum > 0 && displayNum >= totalNum;
    const questionType     = currentQuestion?.question_type || '';
    const isIdentification = isTextType(questionType);

    // ── Check quiz attempt limit on mount ─────────────────────────────────────
    useEffect(() => {
        if (mode === 'quiz' && content_id) {
            const count = getAttemptCount(content_id);
            setAttemptCount(count);
            if (count >= QUIZ_MAX_ATTEMPTS) setAttemptBlocked(true);
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
        setLoading(true);

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
                setLoading(false);
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

            const data = await response.json();

            // ── Extract and store attempt_id from this response ───────────────
            // The backend returns the attempt_id on every getNextQuestion response.
            // We store it in a ref so it's available synchronously in handleSubmitAnswer.
            const newAttemptId = extractAttemptId(data);
            if (newAttemptId != null) {
                attemptIdRef.current = newAttemptId;
                console.debug('attempt_id captured:', newAttemptId);
            }

            if (isCompletedResponse(response.status, data)) {
                setLoading(false);
                isFetchingRef.current = false;
                await handleFinish();
                return;
            }

            // Extract question from various response shapes
            const questionData = data.question || data.data || data;

            const hasText = questionData && (
                questionData.question_text        ||
                questionData.activity_question    ||
                questionData.quiz_question        ||
                questionData.question             ||
                questionData.question_content     ||
                questionData.quest_question       ||
                questionData.item_text            ||
                questionData.title
            );

            if (hasText) {
                // Also try extracting attempt_id from the nested question object
                if (attemptIdRef.current == null) {
                    const nestedAttemptId = extractAttemptId(questionData);
                    if (nestedAttemptId != null) {
                        attemptIdRef.current = nestedAttemptId;
                        console.debug('attempt_id from question:', nestedAttemptId);
                    }
                }

                setCurrentQuestion(questionData);

                if (data.total_questions && data.total_questions > 0) {
                    totalQuestRef.current = data.total_questions;
                    setTotalQuestions(data.total_questions);
                }

                setSelectedAnswer(null);
                setSubmittedAnswerId(null);
                setAnswerText('');
                setIsFeedbackPhase(false);
                setFeedbackResult(null);
                if (timerRef.current) clearInterval(timerRef.current);
                setTimeLeft(60);

                if (!isNext) {
                    displayNumRef.current = 1;
                    setHasStartedCountdown(true);
                } else {
                    setGameStarted(true);
                }
            } else {
                setLoading(false);
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

    // ── Auto-advance after feedback ───────────────────────────────────────────
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
    }, [isFeedbackPhase, isLastItem, handleFinish, fetchQuestion]);

    // ── isAnswerProvided ──────────────────────────────────────────────────────
    const isAnswerProvided = useCallback(() => {
        if (isIdentification) return answerText.trim().length > 0;
        return selectedAnswer !== null;
    }, [isIdentification, answerText, selectedAnswer]);

    // ── handleSubmitAnswer ────────────────────────────────────────────────────
    const handleSubmitAnswer = useCallback(async (isTimeUp = false) => {
        if (isSubmittingRef.current) return;
        if (isFeedbackPhase || !currentQuestion) return;
        if (!isTimeUp && !isAnswerProvided()) return;

        isSubmittingRef.current = true;

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        const questionId =
            currentQuestion.id                         ||
            currentQuestion.activity_question_id       ||
            currentQuestion.quiz_question_id           ||
            currentQuestion.quest_activity_question_id ||
            currentQuestion.quest_quiz_question_id;

        if (!questionId) {
            setErrorMessage('Question ID missing — cannot submit.');
            isSubmittingRef.current = false;
            return;
        }

        setIsSubmitting(true);

        try {
            let answerData;
            let capturedSubmittedId = null;

            // ── Always include attempt_id from the ref ────────────────────────
            // attemptIdRef.current is set from every getNextQuestion response.
            // This links the answer to the correct DB session/attempt row.
            const currentAttemptId = attemptIdRef.current;

            if (isTimeUp) {
                answerData = {
                    answer_id:      null,
                    answer_text:    '',
                    quest_level_id: quest_level_id || null,
                    attempt_id:     currentAttemptId,
                };
            } else if (isIdentification) {
                answerData = {
                    answer_id:      null,
                    answer_text:    answerText.trim(),
                    quest_level_id: quest_level_id || null,
                    attempt_id:     currentAttemptId,
                };
            } else {
                capturedSubmittedId = selectedAnswer;
                answerData = {
                    answer_id:      selectedAnswer,
                    answer_text:    null,
                    quest_level_id: quest_level_id || null,
                    attempt_id:     currentAttemptId,
                };
            }

            setSubmittedAnswerId(capturedSubmittedId);

            const token    = localStorage.getItem('token');
            const response = mode === 'activity'
                ? await authAPI.submitActivityAnswer(content_id, questionId, answerData, token)
                : await authAPI.submitQuizAnswer(content_id, questionId, answerData, token);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg  = (errData.message || errData.error || '').toLowerCase();

                if (errMsg.includes('already answered') || errMsg.includes('already submitted')) {
                    console.warn('Answer already recorded — advancing.');
                    setFeedbackResult({ is_correct: false, already_answered: true });
                    setIsFeedbackPhase(true);
                    return;
                }
                throw new Error(errData.message || errData.error || `Submission failed: ${response.status}`);
            }

            const result = await response.json();
            setFeedbackResult(result);
            setIsFeedbackPhase(true);

        } catch (err) {
            console.error('Submit error:', err);
            setErrorMessage("Failed to submit answer. Please try again.");
        } finally {
            setIsSubmitting(false);
            isSubmittingRef.current = false;
        }
    }, [
        isFeedbackPhase, currentQuestion, selectedAnswer,
        answerText, mode, content_id, quest_level_id, isAnswerProvided, isIdentification,
    ]);

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (mode === 'quiz' && content_id) {
            incrementAttemptCount(content_id);
            setAttemptCount(getAttemptCount(content_id));
        }
        if (prefetched?.firstQuestion && !hasFetchedInitial.current) {
            hasFetchedInitial.current = true;
            setCurrentQuestion(prefetched.firstQuestion);
            totalQuestRef.current = prefetched.totalQuestions ?? 0;
            displayNumRef.current = 1;
            setTotalQuestions(prefetched.totalQuestions ?? 0);
            // Extract attempt_id from prefetched data too
            const prefetchedAttemptId = extractAttemptId(prefetched.firstQuestion);
            if (prefetchedAttemptId != null) attemptIdRef.current = prefetchedAttemptId;
            setLoading(false);
            return;
        }
        const initializeGame = async () => {
            if (hasFetchedInitial.current) return;
            hasFetchedInitial.current = true;
            await fetchQuestion(false);
        };
        if (!hasFetchedInitial.current) initializeGame();
    }, [mode, content_id, prefetched, fetchQuestion]);

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
        if (gameStarted && currentQuestion && !loading && !quizSummary && !isCalculating && !isSubmitting && !isFeedbackPhase) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                        handleSubmitAnswer(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [gameStarted, currentQuestion, loading, quizSummary, isCalculating, isSubmitting, isFeedbackPhase, handleSubmitAnswer]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getQuestionText = () => {
        if (!currentQuestion) return '';
        return (
            currentQuestion.question_text      ||
            currentQuestion.activity_question  ||
            currentQuestion.quiz_question      ||
            currentQuestion.question           ||
            currentQuestion.question_content   ||
            currentQuestion.quest_question     ||
            currentQuestion.item_text          ||
            currentQuestion.title              ||
            ''
        );
    };

    const getChoices = () => {
        if (!currentQuestion) return [];
        return (
            currentQuestion.activity_answers       ||
            currentQuestion.quiz_answers           ||
            currentQuestion.answers                ||
            currentQuestion.choices                ||
            currentQuestion.options                ||
            currentQuestion.quest_activity_answers ||
            currentQuestion.quest_quiz_answers     ||
            currentQuestion.answer_choices         ||
            currentQuestion.items                  ||
            []
        );
    };

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
    // Calls retakeActivity/retakeQuiz API, captures the new attempt_id from the
    // response, resets all state, then fetches Q1 with the new attempt_id active.
    const handleTryAgain = useCallback(async () => {
        if (mode === 'quiz') {
            const currentCount = getAttemptCount(content_id);
            if (currentCount >= QUIZ_MAX_ATTEMPTS) {
                setAttemptBlocked(true);
                return;
            }
        }

        if (timerRef.current)         { clearInterval(timerRef.current);  timerRef.current = null; }
        if (feedbackTimerRef.current) { clearTimeout(feedbackTimerRef.current); feedbackTimerRef.current = null; }

        setLoading(true);
        setErrorMessage(null);

        try {
            const token = localStorage.getItem('token');

            // ── Call retake API — this resets the backend session ─────────────
            // The response contains the new attempt_id for this fresh session.
            let retakeData = null;
            try {
                const retakeRes = mode === 'activity'
                    ? await authAPI.retakeActivity(content_id, token)
                    : await authAPI.retakeQuiz(content_id, token);

                if (retakeRes.ok) {
                    retakeData = await retakeRes.json().catch(() => null);
                    // ── Capture the new attempt_id from retake response ────────
                    const newAttemptId = extractAttemptId(retakeData);
                    if (newAttemptId != null) {
                        attemptIdRef.current = newAttemptId;
                        console.debug('New attempt_id from retake:', newAttemptId);
                    } else {
                        // Reset so fetchQuestion picks it up fresh on next call
                        attemptIdRef.current = null;
                    }
                } else {
                    console.warn('Retake API returned non-OK, proceeding with local reset');
                    attemptIdRef.current = null;
                }
            } catch (retakeErr) {
                console.warn('Retake API error (proceeding):', retakeErr);
                attemptIdRef.current = null;
            }

            // ── Full state reset ──────────────────────────────────────────────
            setQuizSummary(null);
            setCurrentQuestion(null);
            setSelectedAnswer(null);
            setSubmittedAnswerId(null);
            setAnswerText('');
            setIsFeedbackPhase(false);
            setFeedbackResult(null);
            setIsCalculating(false);
            setTimeLeft(60);
            setIsSubmitting(false);
            setTotalQuestions(0);

            hasFetchedInitial.current = false;
            isFetchingRef.current     = false;
            isFinishingRef.current    = false;
            isSubmittingRef.current   = false;
            displayNumRef.current     = 1;
            totalQuestRef.current     = 0;

            // ── Skip countdown on retake — game already started ───────────────
            setGameStarted(true);
            setHasStartedCountdown(false);
            setStartingCountdown(3);

            // ── Increment quiz attempt counter ────────────────────────────────
            if (mode === 'quiz' && content_id) {
                const newCount = incrementAttemptCount(content_id);
                setAttemptCount(newCount);
            }

            // ── Fetch first question — attempt_id already set in ref ──────────
            // Pass isNext=true so it calls setGameStarted(true) instead of
            // triggering the countdown, making Q1 appear immediately.
            await fetchQuestion(true);

        } catch (err) {
            console.error('Retake Error:', err);
            setErrorMessage("Failed to restart the mission.");
            setLoading(false);
        }
    }, [content_id, mode, fetchQuestion]);

    // ── Early render states ───────────────────────────────────────────────────
    if (attemptBlocked && mode === 'quiz') return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white text-center">
            <div className="bg-[#0f172a] p-10 rounded-3xl border border-amber-500/30 max-w-md w-full">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-xl font-black mb-3 uppercase italic text-amber-400">Attempt Limit Reached</h2>
                <p className="mb-2 text-white/60 font-medium text-sm leading-relaxed">
                    You have used all <span className="text-amber-400 font-black">{QUIZ_MAX_ATTEMPTS}</span> attempts for this quiz.
                </p>
                <button
                    onClick={() => navigate(`/student/quest/${questId}/levels`)}
                    className="w-full mt-6 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-wider transition-colors"
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
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white text-center">
            <div className="bg-[#0f172a] p-10 rounded-3xl border border-rose-500/30 max-w-md w-full">
                <div className="text-5xl mb-4">📡</div>
                <h2 className="text-xl font-black mb-3 uppercase italic text-rose-400">Communications Error</h2>
                <p className="mb-8 text-white/60 text-sm">{errorMessage}</p>
                <button
                    onClick={() => {
                        setErrorMessage(null);
                        hasFetchedInitial.current = false;
                        isFetchingRef.current     = false;
                        isSubmittingRef.current   = false;
                        fetchQuestion(false);
                    }}
                    className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-wider"
                >
                    Retry
                </button>
            </div>
        </div>
    );

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
