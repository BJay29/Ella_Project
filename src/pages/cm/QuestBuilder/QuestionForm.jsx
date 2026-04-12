import React from 'react';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';

const buildBlankAnswers = (type) => {
  if (type === 'true_false') return [{ text: 'True', is_correct: false }, { text: 'False', is_correct: false }];
  if (type === 'essay') return [];
  if (type === 'identification' || type === 'fill_in_the_blanks') return [{ text: '', is_correct: true }];
  return [
    { text: '', is_correct: false }, { text: '', is_correct: false },
    { text: '', is_correct: false }, { text: '', is_correct: false },
  ];
};

// ─────────────────────────────────────────────────────────────────────────────
// QuestionForm — pure UI, zero API calls
//
// mode = 'add':
//   Buttons: [← Prev] [Save & Next →]  [✓ Save & Finish]
//   When isLastStep=true:  Save & Next is HIDDEN (not just disabled)
//   Only "Save & Finish" remains on the last question
//
// mode = 'edit':
//   Buttons: [← Back to Workspace]  [💾 Save Changes]
//   Save Changes = UPDATE only, never navigates away
// ─────────────────────────────────────────────────────────────────────────────
const QuestionForm = ({
  mode = 'add',
  questionText,
  setQuestionText,
  questionType,
  setQuestionType,     // null in edit mode — type is locked
  answers,
  setAnswers,
  // ADD mode props
  onSaveNext,
  onSaveFinish,
  onBack,
  isLastStep,          // true = at the last question slot → hide Save & Next
  currentStep,
  totalQuestions,
  setTotalQuestions,
  savedCount = 0,
  // EDIT mode props
  onSaveChanges,       // called on "Save Changes" — updates in place
  // Shared
  onBackToWorkspace,   // navigate(-1) back to SelectionView
  isSubmitting,
  themeColor = 'indigo',
}) => {
  const safeAnswers = answers || [];

  // ── Theme ──────────────────────────────────────────────────────────────
  const accentText =
    themeColor === 'rose'  ? 'text-rose-600'  :
    themeColor === 'amber' ? 'text-amber-600' :
    'text-indigo-600';

  const btnPrimary =
    themeColor === 'rose'  ? 'bg-rose-600  hover:bg-rose-700  shadow-rose-100'  :
    themeColor === 'amber' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' :
    'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100';

  const btnActivePill =
    themeColor === 'rose'  ? 'bg-rose-600  border-rose-600  text-white' :
    themeColor === 'amber' ? 'bg-amber-500 border-amber-500 text-white' :
    'bg-indigo-600 border-indigo-600 text-white';

  const focusBorder =
    themeColor === 'rose'  ? 'focus:border-rose-400'  :
    themeColor === 'amber' ? 'focus:border-amber-400' :
    'focus:border-indigo-400';

  const focusRing =
    themeColor === 'rose'  ? 'ring-rose-500/10'  :
    themeColor === 'amber' ? 'ring-amber-500/10' :
    'ring-indigo-500/10';

  // ── Validation (used to disable action buttons) ─────────────────────────
  const isInvalid =
    !questionText?.trim() ||
    (['multiple_choice', 'true_false'].includes(questionType) &&
      !safeAnswers.some(a => a.is_correct && a.text?.trim())) ||
    (['identification', 'fill_in_the_blanks'].includes(questionType) &&
      !safeAnswers[0]?.text?.trim());

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleAnswerChange = (index, value) =>
    setAnswers(safeAnswers.map((ans, i) => i === index ? { ...ans, text: value } : ans));

  const handleCorrectToggle = (index) =>
    setAnswers(safeAnswers.map((ans, i) => ({ ...ans, is_correct: i === index })));

  const handleTypeChange = (newType) => {
    if (!setQuestionType || mode === 'edit') return;
    setQuestionType(newType);
    setAnswers(buildBlankAnswers(newType));
  };

  const TYPE_OPTIONS = [
    { value: 'multiple_choice',    label: 'Multiple Choice' },
    { value: 'true_false',         label: 'True / False' },
    { value: 'identification',     label: 'Identification' },
    { value: 'fill_in_the_blanks', label: 'Fill in Blanks' },
    { value: 'essay',              label: 'Essay' },
  ];

  return (
    <div className="space-y-8">

      {/* ── ADD MODE: Progress + total items ── */}
      {mode === 'add' && (
        <div className="flex items-center justify-between bg-slate-50 p-5 rounded-[24px] border border-slate-100">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Total Items:
            </span>
            <input
              type="number"
              min={currentStep}
              max={100}
              value={totalQuestions}
              onChange={(e) => {
                const val = parseInt(e.target.value) || currentStep;
                setTotalQuestions(Math.max(currentStep, val));
              }}
              className={`w-16 p-2 bg-white border border-slate-200 rounded-xl text-center font-black ${accentText} focus:ring-2 outline-none shadow-sm`}
            />
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Progress</span>
            <span className={`text-sm font-black uppercase italic ${isLastStep ? 'text-rose-500' : accentText}`}>
              {currentStep} / {totalQuestions}
              {isLastStep && <span className="ml-1 text-[9px] font-bold opacity-70">(final)</span>}
            </span>
          </div>
        </div>
      )}

      {/* ── EDIT MODE: info banner ── */}
      {mode === 'edit' && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 p-4 rounded-[20px]">
          <span className="text-lg">✏️</span>
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
              Edit Mode — Question {currentStep} of {totalQuestions}
            </p>
            <p className="text-[11px] font-bold text-amber-500 mt-0.5">
              "Save Changes" updates this question only — no new question is created.
            </p>
          </div>
        </div>
      )}

      {/* ── Question Type Pills ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${accentText}`}>
            Question Type
          </label>
          {mode === 'edit' && (
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">🔒 Locked</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map(({ value, label }) => (
            <button key={value} type="button"
              onClick={() => handleTypeChange(value)}
              disabled={mode === 'edit'}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                questionType === value ? btnActivePill : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'
              } ${mode === 'edit' ? 'cursor-not-allowed opacity-60' : ''}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Question Text ── */}
      <div className="space-y-3">
        <label className={`block text-[11px] font-black uppercase tracking-[0.2em] ml-1 ${accentText}`}>
          Question
        </label>
        <textarea
          value={questionText || ''}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder={
            questionType === 'fill_in_the_blanks' ? 'Use ___ for the blank. e.g. The capital of France is ___.' :
            questionType === 'essay'               ? 'Enter the essay prompt or topic...' :
            'Enter your question here...'
          }
          className={`w-full p-6 bg-slate-50 border border-slate-100 rounded-[28px] text-lg font-bold text-slate-800 ${focusBorder} focus:bg-white focus:ring-4 ${focusRing} transition-all min-h-[140px] outline-none shadow-inner placeholder:text-slate-300 resize-none`}
        />
      </div>

      {/* ── Answers ── */}
      <div className="space-y-4">
        <label className="block text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">
          {questionType === 'essay' ? 'Essay Info'
            : ['identification', 'fill_in_the_blanks'].includes(questionType) ? 'Correct Answer'
            : 'Choices — click letter to mark correct'}
        </label>

        {questionType === 'essay' ? (
          <div className="p-10 border-4 border-dashed border-slate-100 rounded-[32px] text-center bg-slate-50/30">
            <div className="text-3xl mb-3">✍️</div>
            <p className="text-slate-400 font-bold text-sm">Students write a long-form text response.</p>
            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest mt-2">Manual grading required</p>
          </div>
        ) : ['identification', 'fill_in_the_blanks'].includes(questionType) ? (
          <input type="text" placeholder="Type the exact correct answer here..."
            value={safeAnswers[0]?.text || ''}
            onChange={(e) => setAnswers([{ text: e.target.value, is_correct: true }])}
            className="w-full p-6 bg-emerald-50 border-2 border-emerald-200 rounded-[28px] font-black text-xl text-emerald-700 outline-none text-center focus:border-emerald-400 focus:bg-white transition-all placeholder:text-emerald-200"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeAnswers.map((answer, index) => (
              <div key={index} className={`flex items-center p-2 rounded-[24px] border-2 transition-all ${
                answer.is_correct ? 'border-emerald-400 bg-emerald-50/60 shadow-md shadow-emerald-100' : 'border-slate-100 bg-white hover:border-indigo-200'
              }`}>
                <button type="button" onClick={() => handleCorrectToggle(index)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all shrink-0 ${
                    answer.is_correct ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500'
                  }`}>
                  {answer.is_correct ? <CheckCircle2 size={18} /> : String.fromCharCode(65 + index)}
                </button>
                <input type="text" value={answer.text || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={questionType === 'true_false' ? (index === 0 ? 'True' : 'False') : `Option ${String.fromCharCode(65 + index)}`}
                  readOnly={questionType === 'true_false'}
                  className="flex-1 px-4 py-3 bg-transparent font-bold text-slate-700 outline-none placeholder:text-slate-300 text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          FOOTER ACTIONS
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">

        {/* ── ADD MODE ── */}
        {mode === 'add' && (
          <>
            {/* Prev — only when past first step */}
            {currentStep > 1 && (
              <button type="button" onClick={onBack} disabled={isSubmitting}
                className="px-6 py-4 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-[20px] hover:bg-slate-200 active:scale-95 flex items-center justify-center gap-2 transition-all disabled:opacity-40">
                <ChevronLeft size={16} /> Prev
              </button>
            )}

            {/* Save & Add Next — HIDDEN (not just disabled) on the last step */}
            {!isLastStep && (
              <button type="button" onClick={onSaveNext}
                disabled={isSubmitting || isInvalid}
                className={`flex-[2] py-4 font-black text-xs uppercase tracking-widest rounded-[20px] shadow-xl transition-all active:scale-95 ${
                  isSubmitting || isInvalid
                    ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                    : `${btnPrimary} text-white`
                }`}>
                {isSubmitting ? 'Saving...' : 'Save & Next →'}
              </button>
            )}

            {/* Save & Finish — always visible; primary styling on last step */}
            <button type="button" onClick={onSaveFinish}
              disabled={isSubmitting || isInvalid}
              className={`py-4 font-black text-xs uppercase tracking-widest rounded-[20px] transition-all active:scale-95 disabled:opacity-50 ${
                isLastStep
                  ? `flex-[2] ${btnPrimary} text-white shadow-xl`
                  : 'flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600'
              }`}>
              {isSubmitting ? 'Saving...' : '✓ Save & Finish'}
            </button>
          </>
        )}

        {/* ── EDIT MODE ── */}
        {mode === 'edit' && (
          <>
            {/* Back to Workspace — does NOT save anything */}
            <button type="button" onClick={onBackToWorkspace} disabled={isSubmitting}
              className="flex-1 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-500 font-black text-xs uppercase tracking-widest rounded-[20px] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <ChevronLeft size={14} /> Back to Workspace
            </button>

            {/* Save Changes — updates in place ONLY, no navigation */}
            <button type="button" onClick={onSaveChanges}
              disabled={isSubmitting || isInvalid}
              className={`flex-[2] py-4 font-black text-xs uppercase tracking-widest rounded-[20px] shadow-xl transition-all active:scale-95 ${
                isSubmitting || isInvalid
                  ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                  : `${btnPrimary} text-white`
              }`}>
              {isSubmitting ? 'Saving...' : '💾 Save Changes'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionForm;
