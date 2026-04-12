import React from 'react';
import { 
  Save as SaveIcon, 
  Trash2 as TrashIcon, 
  X as CloseIcon, 
  CheckCircle2 as CheckCircleIcon 
} from 'lucide-react';

const EditQuestionForm = ({
  questionText,
  setQuestionText,
  questionType,
  answers,
  setAnswers,
  onUpdate,
  onDelete,
  onCancel, // Babalik sa Add Mode (New Slot)
  isSubmitting,
}) => {
  const safeAnswers = answers || [];

  // Helper function para sa pag-update ng correct answer
  const handleToggleCorrect = (index) => {
    const updated = safeAnswers.map((a, idx) => ({
      ...a,
      is_correct: idx === index
    }));
    setAnswers(updated);
  };

  // Helper para i-render ang tamang input UI base sa questionType
  const renderAnswerInputs = () => {
    // 1. ESSAY MODE
    if (questionType === 'essay') {
      return (
        <div className="p-10 border-4 border-dashed border-slate-100 rounded-[32px] text-center bg-slate-50/30">
          <div className="text-3xl mb-3">✍️</div>
          <p className="text-slate-400 font-bold text-sm italic">
            Essay Mode: Students write a long-form text response.
          </p>
          <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest mt-2">Manual grading required</p>
        </div>
      );
    }

    // 2. IDENTIFICATION / FILL IN THE BLANKS
    if (questionType === 'identification' || questionType === 'fill_in_the_blanks') {
      return (
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase text-emerald-600 ml-2 tracking-widest">Correct Answer</label>
          <input 
            type="text"
            value={safeAnswers[0]?.text || ''} 
            onChange={(e) => setAnswers([{ text: e.target.value, is_correct: true }])} 
            className="w-full p-6 bg-emerald-50 border-2 border-emerald-200 rounded-[28px] font-black text-xl text-emerald-700 outline-none text-center focus:border-emerald-400 focus:bg-white transition-all shadow-inner placeholder:text-emerald-200"
            placeholder="Type the exact correct answer here..."
          />
        </div>
      );
    }

    // 3. MULTIPLE CHOICE / TRUE OR FALSE (GRID)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safeAnswers.map((ans, i) => (
          <div 
            key={i} 
            className={`flex items-center p-2 rounded-[24px] border-2 transition-all duration-300 ${
              ans.is_correct 
              ? 'border-emerald-400 bg-emerald-50/60 shadow-md shadow-emerald-100' 
              : 'border-slate-100 bg-white hover:border-amber-200'
            }`}
          >
            <button 
              type="button"
              onClick={() => handleToggleCorrect(i)} 
              className={`w-12 h-12 rounded-2xl font-black shrink-0 transition-all flex items-center justify-center ${
                ans.is_correct 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-500'
              }`}
            >
              {ans.is_correct ? <CheckCircleIcon size={18} /> : String.fromCharCode(65 + i)}
            </button>
            
            <input 
              type="text"
              value={ans.text} 
              disabled={questionType === 'true_false'} // Naka-lock kapag True/False
              onChange={(e) => setAnswers(safeAnswers.map((a, idx) => idx === i ? { ...a, text: e.target.value } : a))} 
              className="flex-1 px-4 py-3 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm"
              placeholder={`Option ${String.fromCharCode(65 + i)}...`}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* ─────────────────────────────────────────────────────────────
          HEADER - AMBER THEME (EDIT MODE INDICATOR)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-amber-50 p-5 rounded-[24px] border border-amber-100 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
            <SaveIcon size={18} />
          </div>
          <div>
            <h2 className="text-amber-700 font-black text-[10px] uppercase tracking-[0.2em] block">Status</h2>
            <span className="text-sm font-black uppercase italic text-amber-600 tracking-tight">Editing Existing Question</span>
          </div>
        </div>
        <button 
          onClick={onCancel} 
          className="p-2 hover:bg-amber-100 rounded-full text-amber-600 transition-all"
          title="Cancel editing"
        >
          <CloseIcon size={20} />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          QUESTION INPUT
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase text-amber-600 ml-1 tracking-[0.2em]">Question Statement</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="What is the updated question?"
          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[28px] text-lg font-bold text-slate-800 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all min-h-[140px] outline-none shadow-inner resize-none"
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ANSWERS / CHOICES SECTION
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">
            Type: <span className="text-amber-600 font-black ml-1">{questionType?.replace(/_/g, ' ')}</span>
          </label>
          <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <CheckCircleIcon size={10} /> Choices Area
          </span>
        </div>

        {renderAnswerInputs()}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FOOTER ACTIONS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onDelete}
          className="px-6 py-4 bg-rose-50 text-rose-500 font-black rounded-[20px] uppercase text-xs tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <TrashIcon size={16} /> Delete
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-4 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-[20px] hover:bg-slate-200 active:scale-95 transition-all"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onUpdate}
          disabled={isSubmitting || !questionText.trim()}
          className="flex-1 py-4 bg-amber-500 text-white font-black rounded-[20px] uppercase text-xs tracking-widest shadow-xl shadow-amber-100 flex items-center justify-center gap-2 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <SaveIcon size={16} />
          )}
          {isSubmitting ? 'Updating...' : 'Update Changes'}
        </button>
      </div>
    </div>
  );
};

export default EditQuestion;