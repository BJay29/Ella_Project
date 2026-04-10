import React from 'react';
// Corrected imports based on your flat folder structure
import ActivityCreator from './ActivityCreator';
import QuizCreator from './QuizCreator';

const getDifficultyStyle = (diff) => {
  const d = (diff || '').toLowerCase();
  if (d === 'hard') return 'bg-rose-50 text-rose-600 border border-rose-100';
  if (d === 'medium') return 'bg-amber-50 text-amber-600 border border-amber-100';
  return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
};

const SelectionView = ({
  selectedQuest, selectedLevel, existingActivity, existingQuiz,
  loadingContent, currentQuestId, currentLevelId,
  activityModal, quizModal, setActivityModal, setQuizModal,
  onBack, onActivitySuccess, onQuizSuccess, onDeleteActivity, onDeleteQuiz
}) => {
  
  // Helper to safely get the activity object (in case it's still nested)
  const activityData = existingActivity?.activity || existingActivity;
  const quizData = existingQuiz?.quiz || existingQuiz;

  return (
    <div className="w-full font-sans min-h-screen bg-[#f8fafc]">

      {/* Top bar - Mas Malinis at Professional */}
      <div className="px-8 pt-6 pb-6 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm">
        <button onClick={onBack}
          className="flex items-center gap-2 text-indigo-600 font-black text-[11px] uppercase tracking-widest hover:translate-x-[-4px] transition-all">
          <span className="text-lg">←</span> Back to Levels
        </button>
        <div className="text-right">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-1">
            {selectedQuest?.quest_type} — Quest #{selectedQuest?.quest_number}
          </h2>
          <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em]">
            Current Level: {selectedLevel?.level_title || selectedLevel?.quest_level_title}
          </p>
        </div>
      </div>

      {/* Action Buttons Row - Floating style */}
      <div className="px-8 py-5 bg-white border-b border-gray-100 flex items-center gap-4">
        {activityData ? (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <span className="text-sm">✅</span>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Activity Ready</span>
          </div>
        ) : (
          <button
            onClick={() => setActivityModal({ open: true, mode: 'save-info' })}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-100"
          >
            <span>📝</span> Create Activity
          </button>
        )}

        <div className="w-px h-8 bg-gray-200" />

        {quizData ? (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <span className="text-sm">✅</span>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Quiz Ready</span>
          </div>
        ) : (
          <button
            onClick={() => setQuizModal({ open: true, mode: 'save-info' })}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-100"
          >
            <span>🏆</span> Create Quiz
          </button>
        )}
        
        <div className="ml-auto flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
           <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></div>
           <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
             Workshop Status: Active
           </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {loadingContent ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent shadow-md"></div>
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Content...</p>
          </div>
        ) : !activityData && !quizData ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">📋</div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic mb-3">Workspace is Empty</h3>
            <p className="text-sm text-slate-400 font-medium max-w-sm">Build your level by adding an interactive activity and a final evaluation quiz.</p>
          </div>
        ) : (
          /* PANTAY NA GRID - Ito ang hinahanap mong fix */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

            {/* ACTIVITY CARD (LEFT) */}
            <div className="group flex flex-col">
              {activityData ? (
                <div className="bg-white rounded-[32px] border-2 border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex-1 flex flex-col">
                  <div className="h-2 bg-amber-400 w-full" />
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">📝</div>
                        <div>
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Interactive Activity</p>
                          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-tight">{activityData.title}</h3>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setActivityModal({ open: true, mode: 'save-info' })}
                          className="p-2.5 bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all">
                          <span className="text-sm">✏️</span>
                        </button>
                        <button onClick={() => onDeleteActivity(activityData.activity_id || activityData.id)}
                          className="p-2.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                          <span className="text-sm">🗑️</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 mb-8">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getDifficultyStyle(activityData.difficulty)}`}>
                        {activityData.difficulty}
                      </span>
                      <span className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100 shadow-sm">
                        🎯 Target: {activityData.passing_score}
                      </span>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                      <button onClick={() => setActivityModal({ open: true, mode: 'add-questions' })}
                        className="py-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-amber-100 flex items-center justify-center gap-2">
                        <span className="text-base">+</span> Add Questions
                      </button>
                      <button onClick={() => setActivityModal({ open: true, mode: 'edit-questions' })}
                        className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2">
                        <span className="text-base"></span> Edit Questions
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty placeholder to keep alignment */
                <div className="bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center p-8 flex-1">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Activity Assigned</p>
                </div>
              )}
            </div>

            {/* QUIZ CARD (RIGHT) */}
            <div className="group flex flex-col">
              {quizData ? (
                <div className="bg-white rounded-[32px] border-2 border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex-1 flex flex-col">
                  <div className="h-2 bg-rose-400 w-full" />
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">🏆</div>
                        <div>
                          <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Final Evaluation</p>
                          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-tight">{quizData.title}</h3>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setQuizModal({ open: true, mode: 'save-info' })}
                          className="p-2.5 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all">
                          <span className="text-sm">✏️</span>
                        </button>
                        <button onClick={() => onDeleteQuiz(quizData.quiz_id || quizData.id)}
                          className="p-2.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                          <span className="text-sm">🗑️</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 mb-8">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getDifficultyStyle(quizData.difficulty)}`}>
                        {quizData.difficulty}
                      </span>
                      <span className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100 shadow-sm">
                        🎯 Target: {quizData.passing_score}
                      </span>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                      <button onClick={() => setQuizModal({ open: true, mode: 'add-questions' })}
                        className="py-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-rose-100 flex items-center justify-center gap-2">
                        <span className="text-base">+</span> Add Questions
                      </button>
                      <button onClick={() => setQuizModal({ open: true, mode: 'edit-questions' })}
                        className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2">
                        <span className="text-base"></span> Edit Questions
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty placeholder to keep alignment */
                <div className="bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center p-8 flex-1">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Quiz Assigned</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* MODAL RENDERING */}
      {activityModal.open && (
        <ActivityCreator
          key={`activity-${activityModal.mode}-${currentLevelId}`}
          isOpen={activityModal.open}
          onClose={() => setActivityModal({ open: false, mode: 'save-info' })}
          questId={currentQuestId}
          quest_level_id={currentLevelId}
          existingActivity={activityData}
          mode={activityModal.mode}
          onActivityCreated={onActivitySuccess}
          onSuccess={onActivitySuccess}
        />
      )}

      {quizModal.open && (
        <QuizCreator
          key={`quiz-${quizModal.mode}-${currentLevelId}`}
          isOpen={quizModal.open}
          onClose={() => setQuizModal({ open: false, mode: 'save-info' })}
          questId={currentQuestId}
          quest_level_id={currentLevelId}
          existingQuiz={quizData}
          mode={quizModal.mode}
          onSuccess={onQuizSuccess}
        />
      )}
    </div>
  );
};

export default SelectionView;