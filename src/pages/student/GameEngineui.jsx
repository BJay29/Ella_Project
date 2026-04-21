import React, { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Calculating Screen — Ella Quest logo + loading bar only
// ─────────────────────────────────────────────────────────────────────────────
export const CalculatingScreen = () => (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white fixed inset-0 z-50">
        <div className="relative text-center px-8 w-full max-w-xs">
            <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                Ella <span className="text-indigo-500">Quest</span>
            </h1>
            <div className="mt-4 h-[3px] bg-indigo-500/30 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ animation: 'loadbar 1.5s ease-in-out infinite' }}
                />
            </div>
            <p className="mt-5 font-black tracking-[0.3em] uppercase text-indigo-400/70 text-[10px] animate-pulse">
                Calculating Results...
            </p>
        </div>
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
// StatCard — animated count-up for each result value
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, delay = 0 }) => {
    const [displayed, setDisplayed] = useState(0);

    useEffect(() => {
        const target = Number(value) || 0;
        if (target === 0) { setDisplayed(0); return; }
        let current  = 0;
        const duration  = 800;
        const framerate = 16;
        const increment = target / (duration / framerate);
        const timeout = setTimeout(() => {
            const iv = setInterval(() => {
                current += increment;
                if (current >= target) {
                    setDisplayed(target);
                    clearInterval(iv);
                } else {
                    setDisplayed(Math.floor(current));
                }
            }, framerate);
            return () => clearInterval(iv);
        }, delay);
        return () => clearTimeout(timeout);
    }, [value, delay]);

    return (
        <div
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
            style={{ animation: `fadeSlideUp 0.45s ease both`, animationDelay: `${delay}ms` }}
        >
            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{displayed}</p>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Results Screen
//
// Reads summary data with maximum field-name coverage to handle all
// possible backend response shapes, including attempt-based responses.
// ─────────────────────────────────────────────────────────────────────────────
export const ResultsScreen = ({
    summary,
    mode,
    questId,
    attemptCount   = 0,
    maxAttempts    = null,
    onTryAgain,
    onBack,
    navigate,
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(t);
    }, []);

    // ── Pass / Fail detection ─────────────────────────────────────────────────
    // Covers every field name the backend might use, including attempt-based ones.
    const isPassed =
        summary.passed           === true     ||
        summary.is_passed        === true     ||
        summary.status           === 'passed' ||
        summary.result           === 'passed' ||
        summary.attempt_status   === 'passed' ||
        summary.attempt_result   === 'passed' ||
        (summary.score != null &&
         summary.passing_score != null &&
         Number(summary.score) >= Number(summary.passing_score)) ||
        (summary.percentage != null &&
         summary.passing_score != null &&
         Number(summary.percentage) >= Number(summary.passing_score));

    // ── Extract stats — covers ALL possible backend field names ───────────────
    // The backend may return attempt-based nested objects or flat fields.
    const attemptData = summary.attempt || summary.result_data || summary.attempt_data || {};

    const correct = Number(
        summary.correct_count         ??
        summary.correct               ??
        summary.correct_answers       ??
        summary.total_correct         ??
        attemptData.correct_count     ??
        attemptData.correct           ??
        0
    );
    const wrong = Number(
        summary.wrong_count           ??
        summary.incorrect             ??
        summary.wrong                 ??
        summary.wrong_answers         ??
        summary.total_wrong           ??
        summary.incorrect_count       ??
        attemptData.wrong_count       ??
        attemptData.incorrect         ??
        0
    );
    const total = Number(
        summary.total_questions       ??
        summary.total                 ??
        summary.item_count            ??
        summary.question_count        ??
        attemptData.total_questions   ??
        attemptData.total             ??
        (correct + wrong)             ??
        0
    );
    const points = Number(
        summary.points_earned         ??
        summary.points                ??
        summary.score_points          ??
        summary.earned_points         ??
        summary.total_points          ??
        attemptData.points_earned     ??
        attemptData.points            ??
        0
    );
    const coins = Number(
        summary.coins_earned          ??
        summary.coins                 ??
        summary.coin                  ??
        summary.earned_coins          ??
        summary.total_coins           ??
        attemptData.coins_earned      ??
        attemptData.coins             ??
        0
    );

    // ── Passing score for message ─────────────────────────────────────────────
    const passingScore =
        summary.passing_score         ??
        summary.pass_score            ??
        summary.minimum_score         ??
        attemptData.passing_score     ??
        75;

    const attemptsUsed      = mode === 'quiz' ? attemptCount : null;
    const attemptsRemaining = maxAttempts != null ? Math.max(0, maxAttempts - attemptsUsed) : null;
    const canRetry          = maxAttempts == null || attemptsRemaining > 0;

    // ── Debug: log summary so dev can see what fields the backend actually sends
    // Remove this in production if desired.
    useEffect(() => {
        console.debug('[ResultsScreen] summary received:', summary);
        console.debug('[ResultsScreen] parsed →', { isPassed, correct, wrong, total, points, coins });
    }, [summary]);

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 fixed inset-0 z-50 overflow-y-auto">
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />
            <div className={`absolute top-0 left-0 w-full h-1 ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {visible && (
                <div className={`absolute top-[12%] left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] opacity-15 pointer-events-none ${
                    isPassed ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
            )}

            <div
                className="relative w-full max-w-lg py-8"
                style={{ animation: visible ? 'fadeSlideUp 0.4s ease both' : 'none' }}
            >
                {/* ── Ella Quest logo ── */}
                <div className="text-center mb-5">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                        Ella <span className="text-indigo-500">Quest</span>
                    </h1>
                </div>

                {/* ── Pass / Fail badge ── */}
                <div
                    className="flex justify-center mb-6"
                    style={{ animation: 'fadeSlideUp 0.4s ease 0.1s both' }}
                >
                    <div className={`px-6 py-2 rounded-full border-2 text-[10px] font-black uppercase tracking-[0.3em] ${
                        isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                    }`}>
                        {isPassed ? '✓ Mission Cleared' : '✕ Mission Failed'}
                    </div>
                </div>

                {/* ── Score ring — fraction "correct / total" ── */}
                <div
                    className="flex justify-center mb-8"
                    style={{ animation: 'scaleIn 0.5s ease 0.2s both' }}
                >
                    <div className={`w-44 h-44 rounded-full border-[10px] flex flex-col items-center justify-center shadow-2xl ${
                        isPassed
                            ? 'border-emerald-500 shadow-emerald-500/25'
                            : 'border-rose-500 shadow-rose-500/25'
                    }`}>
                        {total > 0 ? (
                            <>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-4xl font-black italic leading-none ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {correct}
                                    </span>
                                    <span className="text-white/30 text-2xl font-black italic leading-none">/</span>
                                    <span className="text-white/50 text-2xl font-black italic leading-none">{total}</span>
                                </div>
                                <span className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-2">Score</span>
                            </>
                        ) : (
                            // Fallback when total is 0 — show just correct count
                            <>
                                <span className={`text-4xl font-black italic ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {correct}
                                </span>
                                <span className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-2">Correct</span>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Animated stats — 4 columns ── */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    <StatCard label="Correct" value={correct} color="text-emerald-400" delay={300} />
                    <StatCard label="Wrong"   value={wrong}   color="text-rose-400"    delay={400} />
                    <StatCard label="Points"  value={points}  color="text-indigo-400"  delay={500} />
                    <StatCard label="Coins"   value={coins}   color="text-amber-400"   delay={600} />
                </div>

                {/* ── Quiz attempt dots ── */}
                {mode === 'quiz' && maxAttempts != null && (
                    <div
                        className="flex items-center justify-center gap-2 mb-6"
                        style={{ animation: 'fadeSlideUp 0.4s ease 0.55s both' }}
                    >
                        {Array.from({ length: maxAttempts }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full border-2 transition-all ${
                                    i < attemptsUsed
                                        ? 'bg-rose-500 border-rose-400'
                                        : 'bg-white/10 border-white/20'
                                }`}
                            />
                        ))}
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">
                            {attemptsRemaining > 0
                                ? `${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} left`
                                : 'No attempts left'}
                        </span>
                    </div>
                )}

                {/* ── Pass / Fail message ── */}
                <div
                    className={`rounded-2xl border p-4 mb-8 text-center ${
                        isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/20'
                            : 'bg-rose-500/10 border-rose-500/20'
                    }`}
                    style={{ animation: 'fadeSlideUp 0.4s ease 0.65s both' }}
                >
                    <p className={`text-sm font-bold ${isPassed ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {isPassed
                            ? mode === 'activity'
                                ? '🎉 Activity passed! The Quiz is now unlocked.'
                                : '🏆 Quest level complete!'
                            : `❌ You need ${passingScore}% to pass. Keep pushing!`}
                    </p>
                </div>

                {/* ── Action buttons ── */}
                <div
                    className="space-y-3"
                    style={{ animation: 'fadeSlideUp 0.4s ease 0.75s both' }}
                >
                    {isPassed ? (
                        <>
                            <button
                                onClick={onBack}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 shadow-lg border-b-4 border-indigo-800"
                            >
                                {mode === 'activity' ? '← Back to Levels' : 'Return to Base'}
                            </button>
                            {canRetry && (
                                <button
                                    onClick={onTryAgain}
                                    className="w-full py-4 text-white/40 hover:text-white font-black text-xs uppercase tracking-widest transition-colors text-center"
                                >
                                    🔄 Retake {mode === 'activity' ? 'Activity' : 'Quiz'}
                                    {mode === 'quiz' && attemptsRemaining != null && (
                                        <span className="ml-2 text-amber-400">
                                            ({attemptsRemaining} left)
                                        </span>
                                    )}
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            {canRetry ? (
                                <button
                                    onClick={onTryAgain}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 shadow-lg border-b-4 border-indigo-800"
                                >
                                    🔄 Try Again
                                    {mode === 'quiz' && attemptsRemaining != null && (
                                        <span className="ml-2 opacity-70 text-xs">
                                            ({attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} left)
                                        </span>
                                    )}
                                </button>
                            ) : (
                                <div className="w-full py-5 bg-white/5 border border-white/10 text-white/30 rounded-2xl font-black uppercase tracking-[0.2em] text-sm text-center">
                                    🔒 No Attempts Remaining
                                </div>
                            )}
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

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.7); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Game UI
// ─────────────────────────────────────────────────────────────────────────────
const GameEngineui = ({
    navigate,
    mode,
    questId,
    currentQuestion,
    getQuestionText,
    getChoices,
    isIdentification,
    displayNum,
    totalNum,
    isLastItem,
    selectedAnswer,
    setSelectedAnswer,
    answerText,
    setAnswerText,
    answerProvided,
    isSubmitting,
    handleSubmitAnswer,
    timeLeft,
    isFeedbackPhase,
    userWasCorrect,
    correctAnswerText,
    serverCorrectId,
    submittedAnswerId,
    feedbackResult,
}) => {
    const choices = getChoices();

    const gridClass = choices.length >= 2 && choices.length <= 4
        ? 'grid grid-cols-2 gap-3'
        : 'grid grid-cols-1 gap-3';

    const resolvedQuestionText = getQuestionText();

    return (
        <div className="min-h-screen bg-[#020617] relative font-sans text-white flex flex-col">

            {/* ── Background ── */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/8 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-purple-600/8 rounded-full blur-[140px]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }}
                />
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

            {/* ── Timer progress bar ── */}
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
                            Correct answer:{' '}
                            <span className="text-emerald-400 font-black">{correctAnswerText}</span>
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
                    {resolvedQuestionText ? (
                        <h2 className="text-2xl md:text-[2rem] font-black leading-snug uppercase tracking-tight text-white">
                            {resolvedQuestionText}
                        </h2>
                    ) : (
                        <p className="text-white/20 text-sm italic font-medium">
                            Loading question...
                        </p>
                    )}
                </div>

                {/* ── Choices / Input ── */}
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
                                    e.key === 'Enter' &&
                                    answerProvided &&
                                    !isSubmitting &&
                                    !isFeedbackPhase &&
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
                        <div className={gridClass}>
                            {choices.map((choice, idx) => {
                                const choiceId =
                                    choice.activity_answer_id       != null ? choice.activity_answer_id :
                                    choice.quest_activity_answer_id != null ? choice.quest_activity_answer_id :
                                    choice.quiz_answer_id           != null ? choice.quiz_answer_id :
                                    choice.quest_quiz_answer_id     != null ? choice.quest_quiz_answer_id :
                                    choice.answer_id                != null ? choice.answer_id :
                                    choice.id                       != null ? choice.id :
                                    null;

                                const letter       = String.fromCharCode(65 + idx);
                                const wasSubmitted = submittedAnswerId != null &&
                                    String(submittedAnswerId) === String(choiceId);
                                const isSelected   = selectedAnswer != null &&
                                    String(selectedAnswer) === String(choiceId);

                                const isThisChoiceCorrect =
                                    (wasSubmitted && userWasCorrect) ||
                                    (serverCorrectId != null && choiceId != null &&
                                        String(choiceId) === String(serverCorrectId)) ||
                                    (choice.is_correct === true);

                                let btnClass;
                                if (isFeedbackPhase) {
                                    if (isThisChoiceCorrect)
                                        btnClass = 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]';
                                    else if (wasSubmitted)
                                        btnClass = 'bg-rose-500/80 border-rose-400 text-white';
                                    else
                                        btnClass = 'bg-white/[0.03] border-white/5 text-white/20 opacity-40';
                                } else {
                                    btnClass = isSelected
                                        ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)]'
                                        : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.10] text-white/80';
                                }

                                let badgeClass;
                                if (isFeedbackPhase) {
                                    if (isThisChoiceCorrect) badgeClass = 'bg-white/30 text-white';
                                    else if (wasSubmitted)   badgeClass = 'bg-white/20 text-white';
                                    else                     badgeClass = 'bg-white/5 text-white/25';
                                } else {
                                    badgeClass = isSelected
                                        ? 'bg-white text-indigo-600'
                                        : 'bg-white/10 text-white/40 group-hover:bg-white/20';
                                }

                                const badgeIcon =
                                    isFeedbackPhase && isThisChoiceCorrect                  ? '✓' :
                                    isFeedbackPhase && wasSubmitted && !isThisChoiceCorrect ? '✕' :
                                    letter;

                                const choiceText =
                                    choice.answer_text  ||
                                    choice.text         ||
                                    choice.choice_text  ||
                                    choice.option_text  ||
                                    choice.value        ||
                                    '';

                                return (
                                    <button
                                        key={`choice-${idx}`}
                                        onClick={() => {
                                            if (!isSubmitting && !isFeedbackPhase && choiceId != null) {
                                                setSelectedAnswer(choiceId);
                                            }
                                        }}
                                        disabled={isSubmitting || isFeedbackPhase || choiceId == null}
                                        className={`group relative flex flex-col items-center justify-center gap-3 px-4 py-6 rounded-3xl border-2 text-center transition-all duration-200 disabled:pointer-events-none min-h-[110px] ${btnClass}`}
                                    >
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${badgeClass}`}>
                                            {badgeIcon}
                                        </div>
                                        <span className="font-bold text-sm leading-snug uppercase tracking-tight w-full">
                                            {choiceText}
                                        </span>
                                        {isFeedbackPhase && isThisChoiceCorrect && (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/80 bg-white/15 px-2 py-0.5 rounded-full">
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
                        {isSubmitting ? 'ANALYZING...' : isLastItem ? 'FINISH' : 'SUBMIT'}
                    </button>
                )}

                {isFeedbackPhase && (
                    <div className={`flex-1 max-w-sm py-5 rounded-2xl font-black text-base uppercase italic text-center border-b-4 ${
                        userWasCorrect
                            ? 'bg-emerald-500/20 border-emerald-700 text-emerald-400'
                            : 'bg-rose-500/20 border-rose-700 text-rose-400'
                    }`}>
                        <span className="animate-pulse">
                            {userWasCorrect ? 'Next Question' : 'Next Question'}
                        </span>
                    </div>
                )}
            </div>

            <div className="absolute top-0 left-0 w-[35%] h-[35%] bg-indigo-500/8 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[25%] h-[25%] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
};

export default GameEngineui;
