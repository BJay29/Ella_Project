import React from 'react';

const QuestionForm = ({ 
  questionText, 
  setQuestionText, 
  questionType, 
  answers, 
  setAnswers, 
  onSaveNext, 
  onFinish, 
  isSubmitting,
  // Props mula sa parent
  currentStep,
  totalQuestions,
  setTotalQuestions
}) => {
  // Safe check: if answers is undefined for some reason, don't crash
  const safeAnswers = answers || [];

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...safeAnswers];
    if (updatedAnswers[index]) {
      updatedAnswers[index].text = value;
      setAnswers(updatedAnswers);
    }
  };

  const handleCorrectToggle = (index) => {
    const updatedAnswers = safeAnswers.map((ans, i) => ({
      ...ans,
      is_correct: i === index
    }));
    setAnswers(updatedAnswers);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION - Inayos para hindi duplicate ang question counter */}
      <div className="flex items-center justify-between bg-slate-50 p-6 rounded-[30px] border border-slate-100 mb-4">
        <div className="flex items-center gap-6">
          {/* Settings Section lamang ang nandito dahil ang Main Counter ay nasa Parent na */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Set Total Items:</span>
            <input 
              type="number"
              min={currentStep || 1}
              value={totalQuestions || 1}
              onChange={(e) => setTotalQuestions(Math.max(currentStep || 1, parseInt(e.target.value) || 1))}
              className="w-16 p-2 bg-white border border-slate-200 rounded-xl text-center font-black text-indigo-600 focus:ring-2 ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
        
        <div className="text-right pr-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-tight"></span>
          <span className="text-xs font-black text-indigo-600 uppercase tracking-tight italic"></span>
        </div>
      </div>

      {/* Question Input */}
      <div className="space-y-3">
        <label className="block text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">
          Question Description
        </label>
        <textarea
          value={questionText || ''}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question here..."
          className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[35px] text-xl font-bold text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all min-h-[160px] outline-none shadow-inner placeholder:text-slate-300"
        />
      </div>

      {/* Dynamic Answers Area */}
      <div className="space-y-4">
        <label className="block text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">
          {questionType === 'essay' ? 'Evaluation Notes' : 'Choices (Select the correct answer)'}
        </label>

        {questionType === 'essay' ? (
          <div className="p-10 border-4 border-dashed border-slate-100 rounded-[40px] text-center bg-slate-50/30">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Students will provide a long-form text response.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {safeAnswers.map((answer, index) => (
              <div 
                key={index} 
                className={`relative group flex items-center p-2 rounded-[28px] border-2 transition-all duration-300 ${
                  answer.is_correct ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-100' : 'border-slate-100 bg-white hover:border-indigo-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleCorrectToggle(index)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${
                    answer.is_correct 
                    ? 'bg-emerald-500 text-white rotate-0 shadow-md' 
                    : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 -rotate-12'
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </button>

                <input
                  type="text"
                  value={answer.text || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={questionType === 'true_false' ? answer.text : `Type option ${String.fromCharCode(65 + index)}...`}
                  readOnly={questionType === 'true_false'}
                  className="flex-1 px-4 py-3 bg-transparent font-bold text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions inside Form */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="button"
          onClick={onFinish}
          disabled={isSubmitting}
          className="flex-1 py-5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-500 font-black text-xs uppercase tracking-widest rounded-[25px] transition-all active:scale-95"
        >
          Finish & Exit
        </button>
        <button
          type="button"
          onClick={onSaveNext}
          disabled={isSubmitting || (currentStep >= totalQuestions)}
          className={`flex-[2] py-5 font-black text-xs uppercase tracking-widest rounded-[25px] shadow-xl transition-all active:scale-95 
            ${currentStep >= totalQuestions 
              ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:bg-indigo-800'}`}
        >
          {isSubmitting ? 'Saving...' : currentStep >= totalQuestions ? 'Limit Reached' : 'Save & Add Next'}
        </button>
      </div>
    </div>
  );
};

export default QuestionForm;