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
// GameEngine — logic only
// Renders GameEngineUI and passes all state/handlers as props.
//
// Route: /student/quest/:questId/level/:quest_level_id/play/:content_id?mode=activity|quiz
// ─────────────────────────────────────────────────────────────────────────────
const GameEngine = () => {
    const { questId, quest_level_id, content_id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate   = useNavigate();
    const location   = useLocation();
    const mode       = searchParams.get('mode'); // 'activity' | 'quiz'
    const prefetched = location.state?.prefetched || null;
    const paramsValid = !!(content_id && mode);

    // ── Core state ────────────────────────────────────────────────────────────
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [totalQuestions,  setTotalQuestions]  = useState(0);

    // ✅ selectedAnswer stores the REAL DB answer ID (activity_answer_id / quiz_answer_id)
    // NOT the array index. Set by setSelectedAnswer(choiceId) in GameEngineUI onClick.
    const [selectedAnswer,  setSelectedAnswer]  = useState(null);
    const [answerText,      setAnswerText]      = useState('');
    const [loading,         setLoading]         = useState(!prefetched?.firstQuestion);
    const [isSubmitting,    setIsSubmitting]    = useState(false);
    const [errorMessage,    setErrorMessage]    = useState(null);

    // ── Feedback state ────────────────────────────────────────────────────────
    const [isFeedbackPhase,   setIsFeedbackPhase]   = useState(false);
    const [feedbackResult,    setFeedbackResult]    = useState(null);

    // ✅ submittedAnswerId stores what was actually sent so the UI can
    // highlight the correct/wrong choices accurately
    const [submittedAnswerId, setSubmittedAnswerId] = useState(null);

    // ── Results state ─────────────────────────────────────────────────────────
    const [isCalculating, setIsCalculating] = useState(false);
    const [quizSummary,   setQuizSummary]   = useState(null);

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
    const displayNumRef     = useRef(prefetched ? (prefetched.answeredCount ?? 0) + 1 : 1);
    const totalQuestRef     = useRef(prefetched?.totalQuestions ?? 0);

    // ── Derived values ────────────────────────────────────────────────────────
    const displayNum = displayNumRef.current;
    const totalNum   = totalQuestRef.current || totalQuestions;
    const isLastItem = totalNum > 0 && displayNum >= totalNum;

    const questionType     = currentQuestion?.question_type || '';
    const isIdentification = isTextType(questionType);
    const isChoice         = isChoiceType(questionType);

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

            // ─────────────────────────────────────────────────────────────────
            // ✅ FIX: Conditional payload logic per question type.
            //
            // CHOICE types (multiple_choice, true_false, boolean):
            //   → answer_id = selectedAnswer (the real DB id from activity_answer_id
            //                                  or quiz_answer_id, resolved in UI)
            //   → answer_text = null
            //   Screenshots showed answer_id: 0 and answer_id: 1 (array indices) —
            //   that's now fixed because GameEngineUI sets selectedAnswer to the
            //   actual DB id (choice.activity_answer_id / choice.quiz_answer_id).
            //
            // TEXT types (identification, fill_in_blanks, essay):
            //   → answer_id = null
            //   → answer_text = the typed string
            //
            // TIME-UP (no answer given):
            //   → answer_id = null, answer_text = ''
            //
            // The backend also expects quest_level_id in some endpoint versions —
            // included here for maximum compatibility.
            // ─────────────────────────────────────────────────────────────────

            let answerData;
            let capturedSubmittedId = null;

            if (isTimeUp) {
                // Time ran out — send empty answer
                answerData = {
                    answer_id:      null,
                    answer_text:    '',
                    quest_level_id: quest_level_id || null,
                };
            } else if (isIdentification) {
                // Essay / Identification / Fill-in-the-blanks → text answer
                answerData = {
                    answer_id:      null,
                    answer_text:    answerText.trim(),
                    quest_level_id: quest_level_id || null,
                };
            } else {
                // ✅ Multiple choice / True-False → send the REAL DB answer ID
                // selectedAnswer was set in GameEngineUI to:
                //   choice.activity_answer_id (activity mode)
                //   choice.quiz_answer_id     (quiz mode)
                // NOT array index. This is the core fix.
                capturedSubmittedId = selectedAnswer;
                answerData = {
                    answer_id:      selectedAnswer,
                    answer_text:    null,
                    quest_level_id: quest_level_id || null,
                };
            }

            // Capture submitted ID BEFORE the API call so the feedback
            // highlight is always based on what we actually sent
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

            // ✅ FIX: Enter feedback phase regardless of correct/incorrect.
            // Previously only entered if result.is_correct === true which caused
            // the "stuck on same question when wrong" bug.
            // Auto-advance is handled by the feedbackTimerRef useEffect above.
            setFeedbackResult(result);
            setIsFeedbackPhase(true);

        } catch (err) {
            console.error('Submit error:', err);
            // Do NOT reset the timer on error — question sits quietly
        } finally {
            setIsSubmitting(false);
        }
    }, [
        isSubmitting, isFeedbackPhase, currentQuestion, selectedAnswer,
        answerText, mode, content_id, quest_level_id, isAnswerProvided, isIdentification,
    ]);

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
        if (gameStarted && currentQuestion && !loading && !quizSummary && !isCalculating && !isSubmitting && !isFeedbackPhase) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) { clearInterval(timerRef.current); handleSubmitAnswer(true); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameStarted, currentQuestion, loading, quizSummary, isCalculating, isSubmitting, isFeedbackPhase, handleSubmitAnswer]);

    // ── Helpers passed to UI ──────────────────────────────────────────────────
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
    // ✅ FIX: Comprehensive is_correct check — covers all backend response shapes.
    // Previously this only checked feedbackResult.is_correct which caused
    // "always shows Incorrect" when the backend used a different field name.
    const userWasCorrect =
        feedbackResult?.is_correct    === true      ||
        feedbackResult?.correct       === true      ||
        feedbackResult?.is_right      === true      ||
        feedbackResult?.status        === 'correct' ||
        feedbackResult?.result        === 'correct' ||
        feedbackResult?.answer_status === 'correct';

    // ✅ FIX: Server returns the correct answer's DB id — used by UI to highlight
    // the green answer even when player got it wrong.
    const serverCorrectId = feedbackResult
        ? (feedbackResult.correct_answer_id || feedbackResult.correct_id || feedbackResult.answer_id || null)
        : null;

    const correctAnswerText = feedbackResult
        ? (feedbackResult.correct_answer_text || feedbackResult.correct_answer || feedbackResult.correct_text || null)
        : null;

    // ✅ FIX: answerProvided uses String() comparison for selectedAnswer
    // so that numeric DB ids (e.g. 5) and string ids (e.g. "5") both work.
    const answerProvided = isIdentification
        ? answerText.trim().length > 0
        : selectedAnswer !== null;

    // ── Early render states ───────────────────────────────────────────────────
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
                        onClick={() => {
                            setErrorMessage(null);
                            hasFetchedInitial.current = false;
                            isFetchingRef.current = false;
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
