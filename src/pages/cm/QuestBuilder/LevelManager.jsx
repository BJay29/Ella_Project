import React, { useState } from 'react';

const LevelManager = () => {
  // States para sa mga settings base sa screenshot
  const [passingCriteria, setPassingCriteria] = useState(70);
  const [maxQuizAttempts, setMaxQuizAttempts] = useState(2);
  const [inputMode, setInputMode] = useState('standard'); // 'standard' o 'speech'

  const handleSaveSettings = () => {
    // Dito ise-save ang settings sa backend o localStorage
    const settings = {
      passingCriteria,
      maxQuizAttempts,
      inputMode
    };
    
    localStorage.setItem('questDefaultSettings', JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  return (
    <div className="w-full animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">⚙️</span>
        <h3 className="text-lg font-bold text-gray-800">Quest Default Settings</h3>
      </div>

      {/* BLUE INSTRUCTION BOX */}
      <div className="bg-[#e0e7ff] border border-[#c7d2fe] rounded-xl p-3 mb-8 flex items-start gap-3">
        <span className="text-[#6366f1] mt-0.5 text-sm">🌐</span>
        <p className="text-[#4338ca] text-[13px] font-medium">
          These are the system defaults applied to all quests. Curriculum Manager can adjust per quest in the Quest Builder.
        </p>
      </div>

      {/* SETTINGS LIST */}
      <div className="space-y-4 mb-8">
        
        {/* 1. PASSING CRITERIA */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#4f46e5] rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm">Passing Criteria</h4>
              <p className="text-[11px] text-gray-400 font-medium tracking-tight">Minimum score required to pass any activity or quiz</p>
            </div>
          </div>
          <div className="bg-[#c7d2fe] px-8 py-2 rounded-xl border border-[#a5b4fc]">
             <span className="text-[#4338ca] font-black text-lg">{passingCriteria}%</span>
          </div>
        </div>

        {/* 2. MAX QUIZ ATTEMPTS */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#4f46e5] rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm">Max Quiz Attempts</h4>
              <p className="text-[11px] text-gray-400 font-medium tracking-tight">Maximum number of quiz attempts before triggering instructor intervention</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-[#fecaca] px-4 py-1.5 rounded-xl border border-[#fca5a5] text-center min-w-[120px]">
               <p className="text-[#991b1b] font-black text-lg leading-tight">{maxQuizAttempts}</p>
               <p className="text-[#b91c1c] text-[8px] font-bold uppercase">Quiz (Default) Triggers intervention</p>
            </div>
            <div className="bg-[#c7d2fe] px-4 py-1.5 rounded-xl border border-[#a5b4fc] text-center min-w-[120px] flex flex-col justify-center">
               <p className="text-[#4338ca] font-black text-lg leading-tight">∞</p>
               <p className="text-[#4338ca] text-[8px] font-bold uppercase">Activity (unlimited) No intervention</p>
            </div>
          </div>
        </div>

        {/* 3. INPUT MODE */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#4f46e5] rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm">Input Mode</h4>
              <p className="text-[11px] text-gray-400 font-medium tracking-tight">Choose how students submit answers for speaking quests</p>
            </div>
          </div>
          <div className="flex gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <button 
              onClick={() => setInputMode('standard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${inputMode === 'standard' ? 'bg-white shadow-sm border border-gray-200' : 'opacity-50'}`}
            >
              <span className="text-xs">📝</span>
              <div className="text-left">
                <p className="text-[9px] font-black text-gray-700 uppercase leading-none">Standard Input Mode</p>
                <p className="text-[8px] text-gray-400 font-medium">MCQ selection (default for all)</p>
              </div>
            </button>
            <button 
              onClick={() => setInputMode('speech')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${inputMode === 'speech' ? 'bg-white shadow-sm border border-gray-200' : 'opacity-50'}`}
            >
              <span className="text-xs">🎙️</span>
              <div className="text-left">
                <p className="text-[9px] font-black text-gray-700 uppercase leading-none">Speech-to-Text</p>
                <p className="text-[8px] text-gray-400 font-medium">For Speaking skill quests</p>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button 
          onClick={handleSaveSettings}
          className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>💾</span> Save Settings
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default LevelManager;