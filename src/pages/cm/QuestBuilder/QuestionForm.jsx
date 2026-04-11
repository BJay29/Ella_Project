import React from 'react';
import { ChevronLeft, CheckCircle2, Lock } from 'lucide-react';

const buildBlankAnswers = (type) => {
  if (type === 'true_false') return [{ text: 'True', is_correct: false }, { text: 'False', is_correct: false }];
  if (type === 'essay') return [];
  if (type === 'identification' || type === 'fill_in_the_blanks') return [{ text: '', is_correct: true }];
  // Default to 4 empty slots for multiple choice
  return [
    { text: '', is_correct: false }, { text: '', is_correct: false },
    { text: '', is_correct: false }, { text: '', is_correct: false },
  ];
};

const QuestionForm = ({
  questionText,
  setQuestionText,
  questionType,
  setQuestionType,   // optional – if provided, user can change type (only for new questions)
  answers,
  setAnswers,
  onSaveNext,        // save & advance to next — hidden when at last step
  onFinish,          // save & exit — always visible; promoted at last step
  onBack,            // go to previous question — shown when currentStep > 1
  isSubmitting,
  currentStep,
  totalQuestions,
  setTotalQuestions,
  isExistingQuestion,
  themeColor = 'indigo',
}) => {
  const safeAnswers = answers || [];
  const isLastStep  = currentStep >= totalQuestions;

  // ── Theme helpers ────────────────────────────────────────────────────────
  const accentText =
    themeColor === 'rose'  ? 'text-rose-600'  :
    themeColor === 'amber' ? 'text-amber-600' :
    'text-indigo-600';

  const btnPrimary =
    themeColor === 'rose'  ? 'bg-rose-600  hover:bg-rose-700  shadow-rose-100'  :
    themeColor === 'amber' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' :
    'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100';

  const btnActive =
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

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAnswerChange = (index, value) =>
    setAnswers(safeAnswers.map((ans, i) => i === index ? { ...ans, text: value } : ans));

  const handleCorrectToggle = (index) =>
    setAnswers(safeAnswers.map((ans, i) => ({ ...ans, is_correct: i === index })));

  const handleTypeChange = (newType) => {
    if (!setQuestionType || isExistingQuestion) return;
    setQuestionType(newType);
    
    // Automatically reset and provide blank inputs based on the selected type
    setAnswers(buildBlankAnswers(newType));
  };

  const TYPE_OPTIONS = [
    { value: 'multiple_choice',   label: 'Multiple Choice' },
    { value: 'true_false',         label: 'True / False' },
    { value: 'identification',    label: 'Identification' },
    { value: 'fill_in_the_blanks',label: 'Fill in Blanks' },
    { value: 'essay',             label: 'Essay' },
  ];

  // Logic to prevent submission if validation fails
  const isInvalid = !questionText?.trim() || 
    (questionType !== 'essay' && safeAnswers.every(a => !a.is_correct)) ||
    (questionType !== 'essay' && safeAnswers.some(a => a.is_correct && !a.text?.trim()));

  return (
    <div className="space-y-8">

      {/* ── Progress / Total Items ── */}
      <div className="flex items-center justify-between bg-slate-50 p-5 rounded-[24px] border border-slate-100">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
            Total Items:
          </span>
          <input
            type="number"
            min={1}
            max={100}
            value={totalQuestions}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setTotalQuestions(Math.max(1, val));
            }}
            className={`w-16 p-2 bg-white border border-slate-200 rounded-xl text-center font-black ${accentText} focus:ring-2 outline-none shadow-sm transition-all`}
          />
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Progress</span>
          <span className={`text-sm font-black uppercase italic ${isLastStep ? 'text-rose-500' : accentText}`}>
            {currentStep} / {totalQuestions}
            {isLastStep && <span className="ml-1 text-[9px] normal-case font-bold opacity-70">(final)</span>}
          </span>
        </div>
      </div>

      {/* ── Question Type Pills ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${accentText}`}>
            Question Type
          </label>
          {isExistingQuestion && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <Lock size={10} /> Locked
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleTypeChange(value)}
              disabled={isExistingQuestion}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                questionType === value
                  ? btnActive
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'
              } ${isExistingQuestion ? 'cursor-not-allowed opacity-60' : ''}`}
            >
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
          {questionType === 'essay'
            ? 'Essay Info'
            : questionType === 'identification' || questionType === 'fill_in_the_blanks'
            ? 'Correct Answer'
            : 'Choices — click letter to mark correct'}
        </label>

        {questionType === 'essay' ? (
          <div className="p-10 border-4 border-dashed border-slate-100 rounded-[32px] text-center bg-slate-50/30">
            <div className="text-3xl mb-3">✍️</div>
            <p className="text-slate-400 font-bold text-sm">Students write a long-form text response.</p>
            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest mt-2">Manual grading required</p>
          </div>

        ) : questionType === 'identification' || questionType === 'fill_in_the_blanks' ? (
          <input
            type="text"
            placeholder="Type the exact correct answer here..."
            value={safeAnswers[0]?.text || ''}
            onChange={(e) => setAnswers([{ text: e.target.value, is_correct: true }])}
            className="w-full p-6 bg-emerald-50 border-2 border-emerald-200 rounded-[28px] font-black text-xl text-emerald-700 outline-none text-center focus:border-emerald-400 focus:bg-white transition-all placeholder:text-emerald-200"
          />

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeAnswers.map((answer, index) => (
              <div
                key={index}
                className={`flex items-center p-2 rounded-[24px] border-2 transition-all duration-200 ${
                  answer.is_correct
                    ? 'border-emerald-400 bg-emerald-50/60 shadow-md shadow-emerald-100'
                    : 'border-slate-100 bg-white hover:border-indigo-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleCorrectToggle(index)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all shrink-0 ${
                    answer.is_correct
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500'
                  }`}
                >
                  {answer.is_correct ? <CheckCircle2 size={18} /> : String.fromCharCode(65 + index)}
                </button>
                <input
                  type="text"
                  value={answer.text || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={
                    questionType === 'true_false'
                      ? (index === 0 ? 'True' : 'False')
                      : `Option ${String.fromCharCode(65 + index)}`
                  }
                  readOnly={questionType === 'true_false'}
                  className="flex-1 px-4 py-3 bg-transparent font-bold text-slate-700 outline-none placeholder:text-slate-300 text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer actions ── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">

        {/* Prev — always shown when step > 1 */}
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-6 py-4 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-[20px] hover:bg-slate-200 active:scale-95 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          >
            <span className="flex items-center gap-2"><ChevronLeft size={16} /> Prev</span>
          </button>
        )}

        {/* Finish & Exit — becomes primary at last step */}
        <button
          type="button"
          onClick={onFinish}
          disabled={isSubmitting || isInvalid}
          className={`flex-1 py-4 font-black text-xs uppercase tracking-widest rounded-[20px] active:scale-95 disabled:opacity-50 transition-all ${
            isLastStep
              ? `${btnPrimary} text-white shadow-xl`
              : 'bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-500'
          }`}
        >
          {isSubmitting ? 'Saving...' : isLastStep ? '✓ Save & Finish' : 'Finish & Exit'}
        </button>

        {/* Save & Add Next — hidden at last step */}
        {!isLastStep && (
          <button
            type="button"
            onClick={onSaveNext}
            disabled={isSubmitting || isInvalid}
            className={`flex-[2] py-4 font-black text-xs uppercase tracking-widest rounded-[20px] shadow-xl transition-all active:scale-95 ${
              isSubmitting || isInvalid
                ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                : `${btnPrimary} text-white`
            }`}
          >
            {isSubmitting ? 'Saving...' :
              isExistingQuestion ? 'Update & Next →' : 'Save & Add Next →'}
          </button>
        )}

        {/* Lock badge at last step */}
        {isLastStep && !isSubmitting && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-[20px] text-amber-600 shrink-0">
            <Lock size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Final Item</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionForm;