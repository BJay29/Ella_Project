import React from 'react';

const ListView = ({ quests, isLoading, onSelectQuest, onCreateQuest, onEditQuest, onDeleteQuest, onTogglePublish, onAssign }) => {
  return (
    <div className="w-full font-sans p-4 bg-gray-50 min-h-screen text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xl font-bold text-indigo-900 uppercase italic tracking-tighter">Quest Builder</h3>
          </div>
          <button onClick={onCreateQuest} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all active:scale-95">
            + Create New Quest
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : quests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-100 rounded-[3rem]">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-800">No Quests Yet</h3>
            <p className="text-gray-400 text-sm mt-1">Create your first quest using the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quests.map((quest) => (
              <div key={quest.quest_id || quest.id}
                onClick={() => onSelectQuest(quest)}
                className="group bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-[#DCFCE7] w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                    {quest.quest_type === 'Writing' ? '🐸' : quest.quest_type === 'Reading' ? '📖' : quest.quest_type === 'Listening' ? '🎧' : '🗣️'}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={(e) => onTogglePublish(e, quest.quest_id || quest.id)}
                      className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${quest.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {quest.is_published ? '● Published' : '○ Draft'}
                    </button>
                    <button onClick={(e) => onAssign(e, quest)}
                      className="text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-wider bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                      ➕ Assign
                    </button>
                  </div>
                </div>
                <h4 className="font-black text-gray-800 uppercase text-[15px] leading-tight mb-1">
                  {quest.quest_type} - Quest #{quest.quest_number}
                </h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">
                  {quest.quest_level} • PASSING SCORE: {quest.passing_score}
                </p>
                <div className="flex gap-3 pt-4 border-t border-gray-50">
                  <button onClick={(e) => onEditQuest(e, quest)} className="flex-1 bg-[#F3F4F6] hover:bg-gray-200 text-indigo-600 py-3 rounded-xl font-black text-[10px] uppercase transition-all">✏️ Edit</button>
                  <button onClick={(e) => onDeleteQuest(e, quest.quest_id || quest.id)} className="px-4 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;