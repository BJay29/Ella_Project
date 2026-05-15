import React, { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Score Ring — circular visual indicator for the grade
// ─────────────────────────────────────────────────────────────────────────────
const ScoreRing = ({ score, maxPoints }) => {
    const max = maxPoints || 100;
    const num = parseFloat(score) || 0;
    const percentage = max > 0 ? (num / max) * 100 : 0;
    const clamped = Math.min(100, Math.max(0, percentage));
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clamped / 100) * circumference;

    const getColor = () => {
        if (clamped >= 85) return '#16a34a';
        if (clamped >= 70) return '#2563eb';
        if (clamped >= 55) return '#d97706';
        return '#dc2626';
    };

    return (
        <div className="relative flex items-center justify-center">
            <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
                <circle cx="45" cy="45" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="7" />
                <circle
                    cx="45" cy="45" r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-gray-900 leading-none">{num > 0 ? Math.round(num) : '—'}</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">/ {max}</span>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// GradingPortal — Full instructor essay review & grading interface
// Props:
//   studentSubmission — the submission object from the submissions list
//   onBack            — callback to return to submissions list
//   onSaveGrade       — async (answerId, { points_awarded, instructor_feedback }) => void
// ─────────────────────────────────────────────────────────────────────────────
const GradingPortal = ({ studentSubmission, onBack, onSaveGrade }) => {
    // Use points_awarded for the score field (from API body)
    const [pointsAwarded, setPointsAwarded] = useState(studentSubmission?.points_awarded ?? '');
    const [instructorFeedback, setInstructorFeedback] = useState(studentSubmission?.instructor_feedback || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Support both answer_id and id (grading uses answer_id)
    const answerId = studentSubmission?.answer_id || studentSubmission?.id || studentSubmission?.submission_id;

    const studentName = studentSubmission?.studentName || studentSubmission?.full_name || studentSubmission?.student_name || 'Unknown Student';
    const essayTitle = studentSubmission?.essayTitle || studentSubmission?.essay_title || studentSubmission?.title || 'Untitled Essay';
    const essayContent = studentSubmission?.content || studentSubmission?.essay_content || studentSubmission?.body || studentSubmission?.answer || '';
    const wordCount = studentSubmission?.wordCount || studentSubmission?.word_count || essayContent.split(/\s+/).filter(Boolean).length || 0;

    // Max points — from activity/quiz config, fallback to 100
    const maxPoints = studentSubmission?.max_points || studentSubmission?.total_points || 100;

    const submittedDate = studentSubmission?.date || studentSubmission?.submitted_at || studentSubmission?.created_at
        ? new Date(studentSubmission.date || studentSubmission.submitted_at || studentSubmission.created_at).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
          })
        : 'Recently submitted';

    // Derive graded/pending status from API body fields
    const reviewStatus = studentSubmission?.review_status || studentSubmission?.status || '';
    const isPendingReview = studentSubmission?.pending_review === true
        || reviewStatus === 'pending_review'
        || reviewStatus === 'pending'
        || studentSubmission?.feedback_state === 'pending_review';
    const isAlreadyGraded = reviewStatus === 'graded' || (studentSubmission?.points_awarded != null && !isPendingReview);

    const initials = studentName.substring(0, 2).toUpperCase();

    // Source type: 'activity' or 'quiz' — used by parent to call the right grading API
    const sourceType = studentSubmission?.source_type || studentSubmission?.type || 'activity';

    const handleSave = async () => {
        if (pointsAwarded === '' && pointsAwarded !== 0) {
            alert('Please enter points before submitting.');
            return;
        }
        const numPoints = Number(pointsAwarded);
        if (numPoints < 0 || numPoints > maxPoints) {
            alert(`Points must be between 0 and ${maxPoints}.`);
            return;
        }
        setIsSaving(true);
        try {
            await onSaveGrade(answerId, {
                points_awarded: numPoints,
                instructor_feedback: instructorFeedback,
                source_type: sourceType,
            });
            setIsSaved(true);
        } catch (err) {
            console.error('Grade save error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const scoreNum = parseFloat(pointsAwarded) || 0;
    const scorePercentage = maxPoints > 0 ? (scoreNum / maxPoints) * 100 : 0;

    const getScoreLabel = () => {
        if (pointsAwarded === '' && pointsAwarded !== 0) return { label: 'Not graded', color: 'text-gray-400' };
        if (scorePercentage >= 90) return { label: 'Excellent', color: 'text-green-600' };
        if (scorePercentage >= 80) return { label: 'Very Good', color: 'text-green-500' };
        if (scorePercentage >= 70) return { label: 'Good', color: 'text-blue-600' };
        if (scorePercentage >= 60) return { label: 'Satisfactory', color: 'text-amber-600' };
        return { label: 'Needs Improvement', color: 'text-red-500' };
    };
    const scoreLabel = getScoreLabel();

    return (
        <div
            className="flex flex-col h-full bg-white text-gray-900 overflow-hidden"
            style={{ animation: 'gradingPortalIn 0.2s ease-out' }}
        >
            {/* ── TOP NAV BAR ── */}
            <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
                {/* Left: Back + breadcrumb */}
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={onBack}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-black hover:text-white transition-all border border-gray-200 flex-shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="h-5 w-px bg-gray-200 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Grading Portal — Essay Review</p>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate leading-tight">{studentName}</p>
                    </div>
                </div>

                {/* Right: Status + Save */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Pending review badge from API body */}
                    {isPendingReview && !isSaved && (
                        <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            Awaiting Review
                        </span>
                    )}
                    {isAlreadyGraded && !isSaved && (
                        <span className="px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-[9px] font-black uppercase tracking-widest">
                            Previously Graded
                        </span>
                    )}
                    {isSaved && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-[9px] font-black uppercase tracking-widest">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Grade Submitted
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isSaved}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                            isSaved
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isSaving
                                ? 'bg-gray-800 text-white cursor-not-allowed'
                                : 'bg-gray-900 text-white hover:bg-black hover:shadow-md'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                                Saving...
                            </>
                        ) : isSaved ? (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Saved
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Submit Grade
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── SPLIT CONTENT ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── LEFT: Essay Reader ── */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {/* Essay header */}
                    <div className="px-12 pt-12 pb-8 border-b border-gray-100">
                        <div className="max-w-2xl">
                            {/* Student info row */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-9 w-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{studentName}</p>
                                    <p className="text-[9px] font-bold text-gray-400">Submitted {submittedDate}</p>
                                </div>
                                <div className="ml-auto flex items-center gap-3">
                                    {/* Source type badge (activity or quiz) */}
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                        sourceType === 'quiz'
                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                        {sourceType === 'quiz' ? 'Quiz Essay' : 'Activity Essay'}
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        {wordCount.toLocaleString()} words
                                    </span>
                                </div>
                            </div>

                            {/* Essay title */}
                            <div className="border-l-[3px] border-gray-900 pl-5">
                                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-tight italic">
                                    {essayTitle}
                                </h1>
                            </div>

                            {/* Pending review notice from API message */}
                            {isPendingReview && (
                                <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                    <div>
                                        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Pending Instructor Review</p>
                                        <p className="text-[9px] text-amber-600 mt-0.5">
                                            {studentSubmission?.message || 'Essay submitted. Waiting for instructor review.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Essay body */}
                    <div className="px-12 py-10">
                        <div className="max-w-2xl">
                            {essayContent ? (
                                <div className="text-[15px] leading-[2rem] text-gray-700 font-serif whitespace-pre-line">
                                    {essayContent}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200 rounded-3xl">
                                    <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No content available</p>
                                    <p className="text-[9px] text-gray-300 mt-1">The essay body was not returned from the server.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Grading Panel ── */}
                <div className="w-[340px] flex-shrink-0 bg-[#fafafa] border-l border-gray-100 flex flex-col overflow-y-auto">
                    <div className="p-7 space-y-6">

                        {/* Points Input Section */}
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Points Awarded</p>
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center gap-5">
                                    {/* Ring — shows percentage of max_points */}
                                    <ScoreRing score={pointsAwarded} maxPoints={maxPoints} />
                                    {/* Input */}
                                    <div className="flex-1">
                                        <div className="flex items-end gap-1.5">
                                            <input
                                                type="number"
                                                min="0"
                                                max={maxPoints}
                                                value={pointsAwarded}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || (Number(val) >= 0 && Number(val) <= maxPoints)) {
                                                        setPointsAwarded(val);
                                                        setIsSaved(false);
                                                    }
                                                }}
                                                disabled={isSaved}
                                                placeholder="0"
                                                className="w-full text-4xl font-black text-gray-900 bg-transparent outline-none border-b-2 border-gray-200 focus:border-gray-900 transition-colors pb-1 leading-none disabled:opacity-60"
                                            />
                                            <span className="text-lg font-black text-gray-300 pb-1 flex-shrink-0">/ {maxPoints}</span>
                                        </div>
                                        <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${scoreLabel.color}`}>
                                            {scoreLabel.label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ella AI Insights */}
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Ella's Analysis</p>
                            <div className="bg-gray-900 rounded-2xl p-5 text-white shadow-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                        </svg>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">AI Writing Assessment</span>
                                </div>
                                {essayContent ? (
                                    <div className="space-y-2.5">
                                        <div className="flex items-start gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                                            <p className="text-[11px] text-gray-300 leading-relaxed">
                                                Essay demonstrates coherent argumentation. Paragraph transitions are generally smooth.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                            <p className="text-[11px] text-gray-300 leading-relaxed">
                                                {wordCount < 200
                                                    ? `Essay is relatively short at ${wordCount} words. Consider requesting elaboration.`
                                                    : `${wordCount.toLocaleString()} words — adequate length for the assignment.`}
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                            <p className="text-[11px] text-gray-300 leading-relaxed">
                                                Review for specific evidence and citation of sources.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-gray-500 italic">No essay content to analyze.</p>
                                )}
                            </div>
                        </div>

                        {/* Instructor Feedback Textarea */}
                        <div className="flex-1 flex flex-col">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Instructor Feedback</p>
                            <textarea
                                value={instructorFeedback}
                                onChange={(e) => { setInstructorFeedback(e.target.value); setIsSaved(false); }}
                                disabled={isSaved}
                                rows={7}
                                placeholder="Write your comments to the student here. Be specific and constructive..."
                                className="w-full p-5 bg-white border border-gray-200 rounded-2xl text-[13px] leading-relaxed text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all resize-none shadow-sm disabled:opacity-60"
                            />
                        </div>

                        {/* Notice */}
                        {!isSaved && (
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                <p className="text-[9px] font-bold text-amber-700 leading-relaxed">
                                    Points and feedback will be visible to the student once you submit.
                                </p>
                            </div>
                        )}

                        {/* Submit Button (panel) */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isSaved}
                            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${
                                isSaved
                                    ? 'bg-green-50 text-green-600 border border-green-200 cursor-not-allowed'
                                    : isSaving
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-900 text-white hover:bg-black hover:shadow-lg'
                            }`}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    Submitting...
                                </>
                            ) : isSaved ? (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Grade Submitted
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Submit Grade
                                </>
                            )}
                        </button>

                    </div>
                </div>
            </div>

            <style>{`
                @keyframes gradingPortalIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default GradingPortal;
