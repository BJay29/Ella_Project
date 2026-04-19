import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Calculating Screen
// ─────────────────────────────────────────────────────────────────────────────
export const CalculatingScreen = () => (
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
export const ResultsScreen = ({ summary, mode, questId, onTryAgain, onBack, navigate }) => {
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
                {/* Status badge */}
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

                {/* Pass / Fail message */}
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
// Main Game UI
// Receives all state and handlers as props from GameEngine.jsx
// ─────────────────────────────────────────────────────────────────────────────
const GameEngineUI = ({
    // Navigation
    navigate,
    mode,
    questId,
    // Question data
    currentQuestion,
    getQuestionText,
    getChoices,
    isIdentification,
    // Progress
    displayNum,
    totalNum,
    isLastItem,
    // Answer state
    selectedAnswer,
    setSelectedAnswer,
    answerText,
    setAnswerText,
    answerProvided,
    // Submission
    isSubmitting,
    handleSubmitAnswer,
    // Timer
    timeLeft,
    // Feedback
    isFeedbackPhase,
    userWasCorrect,
    correctAnswerText,
    serverCorrectId,
    submittedAnswerId,
    feedbackResult,
}) => {
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
                        // ── Text input: identification, fill_in_blanks, essay ──
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
                        // ── Choice buttons: multiple_choice, true_false ──
                        <div className="grid grid-cols-1 gap-4">
                            {getChoices().map((choice, idx) => {

                                // ✅ FIX: Resolve the real DB answer ID from the choice object.
                                // Priority order (per backend):
                                //   activity mode → activity_answer_id (Image 3 confirmation)
                                //   quiz mode     → quiz_answer_id (same pattern)
                                //   fallback      → generic id field
                                // NEVER fall back to idx (array index) — that's what caused
                                // answer_id: 0 / answer_id: 1 in the payload screenshots.
                                const choiceId =
                                    choice.activity_answer_id          != null ? choice.activity_answer_id :
                                    choice.quest_activity_answer_id    != null ? choice.quest_activity_answer_id :
                                    choice.quiz_answer_id              != null ? choice.quiz_answer_id :
                                    choice.quest_quiz_answer_id        != null ? choice.quest_quiz_answer_id :
                                    choice.answer_id                   != null ? choice.answer_id :
                                    choice.id                          != null ? choice.id :
                                    null; // ← null, NOT idx, so we can detect missing IDs

                                const letter       = String.fromCharCode(65 + idx);
                                const wasSubmitted = submittedAnswerId != null &&
                                    String(submittedAnswerId) === String(choiceId);

                                // A choice lights up green if:
                                //   - player picked it AND server says correct, OR
                                //   - server returned this choice's id as the correct one, OR
                                //   - backend marked it is_correct=true on the choice object
                                const isThisChoiceCorrect =
                                    (wasSubmitted && userWasCorrect) ||
                                    (serverCorrectId != null && choiceId != null &&
                                        String(choiceId) === String(serverCorrectId)) ||
                                    (choice.is_correct === true);

                                // ── Button style ──────────────────────────────
                                let btnClass;
                                if (isFeedbackPhase) {
                                    if (isThisChoiceCorrect) btnClass = 'bg-emerald-500 text-white shadow-[0_0_24px_rgba(16,185,129,0.5)] scale-[1.01]';
                                    else if (wasSubmitted)   btnClass = 'bg-rose-500/80 text-white';
                                    else                     btnClass = 'bg-white/[0.03] text-white/25 opacity-50';
                                } else {
                                    const isSelected = selectedAnswer != null &&
                                        String(selectedAnswer) === String(choiceId);
                                    btnClass = isSelected
                                        ? 'bg-indigo-600/90 text-white shadow-[0_6px_24px_rgba(99,102,241,0.35)] translate-y-[-2px]'
                                        : 'bg-white/[0.05] hover:bg-white/[0.09] text-white/80 hover:translate-y-[-1px]';
                                }

                                // ── Badge style ───────────────────────────────
                                let badgeClass;
                                if (isFeedbackPhase) {
                                    if (isThisChoiceCorrect) badgeClass = 'bg-white/30 text-white';
                                    else if (wasSubmitted)   badgeClass = 'bg-white/20 text-white';
                                    else                     badgeClass = 'bg-white/5 text-white/30';
                                } else {
                                    const isSelected = selectedAnswer != null &&
                                        String(selectedAnswer) === String(choiceId);
                                    badgeClass = isSelected
                                        ? 'bg-white text-indigo-600'
                                        : 'bg-white/10 text-white/50 group-hover:bg-white/20';
                                }

                                const badgeIcon =
                                    isFeedbackPhase && isThisChoiceCorrect             ? '✓' :
                                    isFeedbackPhase && wasSubmitted && !isThisChoiceCorrect ? '✕' :
                                    letter;

                                return (
                                    <button
                                        key={`choice-${idx}`}
                                        onClick={() => {
                                            if (!isSubmitting && !isFeedbackPhase && choiceId != null) {
                                                // ✅ FIX: store the actual DB answer ID, NOT idx.
                                                // This is what gets sent as answer_id to the backend.
                                                // For activity: choice.activity_answer_id
                                                // For quiz:     choice.quiz_answer_id
                                                setSelectedAnswer(choiceId);
                                            }
                                        }}
                                        disabled={isSubmitting || isFeedbackPhase || choiceId == null}
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

export default GameEngineUI;
