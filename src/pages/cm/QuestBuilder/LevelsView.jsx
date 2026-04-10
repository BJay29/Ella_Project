import React from 'react';

const LevelsView = ({
  selectedQuest, levels, isLoading, isSubmitting,
  levelData, setLevelData, isEditingLevel,
  showLevelModal, setShowLevelModal,
  showDeleteLevelModal, setShowDeleteLevelModal,
  onBack, onSelectLevel, onCreateLevel, onEditLevel, onDeleteLevel,
  onLevelSubmit, onConfirmDeleteLevel
}) => {
  return (
    <div className="w-full font-sans p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all">
            ← Back to Quests
          </button>
          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
              {selectedQuest?.quest_type} - Quest #{selectedQuest?.quest_number}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Click a level to manage content</p>
          </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-6">
              <div>
                <h4 className="font-black text-slate-800 uppercase text-sm tracking-tight">Quest Levels</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Click a level to manage activities/quizzes</p>
              </div>
              <button onClick={onCreateLevel} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95">
                + Create Level
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
            ) : !levels || levels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-3xl mb-4">🌑</div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">No levels yet</h3>
                <p className="text-gray-400 text-sm">Add your first level using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Order</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Level Title</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {levels.map((lvl, index) => (
                      <tr key={lvl.quest_level_id || lvl.id || `lvl-${index}`}
                        onClick={() => onSelectLevel(lvl)}
                        className="group hover:bg-indigo-50/50 transition-all cursor-pointer">
                        <td className="py-5 pl-4">
                          <span className="bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs">
                            {lvl.level_order || (index + 1)}
                          </span>
                        </td>
                        <td className="py-5">
                          <p className="font-bold text-slate-800 group-hover:text-indigo-600 text-sm uppercase transition-colors">
                            {lvl.level_title || lvl.quest_level_title || `MISSION ${index + 1}`}
                          </p>
                        </td>
                        <td className="py-5 text-right pr-4">
                          <div className="flex justify-end items-center gap-3">
                            <button onClick={(e) => onEditLevel(e, lvl)} className="p-2 text-indigo-400 hover:text-indigo-600 transition-all text-sm">✏️</button>
                            <button onClick={(e) => onDeleteLevel(e, lvl)} className="p-2 text-red-300 hover:text-red-500 transition-all text-sm">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Level Create/Edit Modal */}
      {showLevelModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-10 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tighter italic">
              {isEditingLevel ? '✏️ Update Level' : '🚀 New Level'}
            </h3>
            <form onSubmit={onLevelSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Level Title</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  value={levelData.title} onChange={(e) => setLevelData({...levelData, title: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Order</label>
                <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  value={levelData.level_order} onChange={(e) => setLevelData({...levelData, level_order: e.target.value})} required />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowLevelModal(false)} className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl font-black text-gray-400 text-[11px] uppercase tracking-widest hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Level Delete Modal */}
      {showDeleteLevelModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[24px] p-8 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-5">Delete this Level?</h3>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteLevelModal(false)} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 text-xs hover:bg-gray-50">No</button>
              <button onClick={onConfirmDeleteLevel} disabled={isSubmitting} className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-red-600 disabled:opacity-50">
                {isSubmitting ? 'Deleting...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelsView;