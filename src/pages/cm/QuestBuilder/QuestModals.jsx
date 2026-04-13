import React from 'react';

const QuestModal = ({ isOpen, isEditing, isSubmitting, questData, setQuestData, onClose, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-8 border border-gray-100 animate-in fade-in zoom-in duration-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? '✏️ Edit Quest' : '+ Create New Quest'}</h3>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Macro Skill</label>
            <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              value={questData.quest_type} onChange={(e) => setQuestData({...questData, quest_type: e.target.value})} required>
              <option value="" disabled>Select Skill</option>
              <option value="Reading">Reading</option>
              <option value="Writing">Writing</option>
              <option value="Listening">Listening</option>
              <option value="Speaking">Speaking</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Difficulty</label>
            <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              value={questData.quest_level} onChange={(e) => setQuestData({...questData, quest_level: e.target.value})} required>
              <option value="" disabled>Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Quest No.</label>
              <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={questData.quest_number} onChange={(e) => setQuestData({...questData, quest_number: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Passing Score</label>
              <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={questData.passing_score} onChange={(e) => setQuestData({...questData, passing_score: e.target.value})} required />
            </div>
          </div>
          <div className="flex justify-between items-center pt-6 gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 border border-gray-200 rounded-xl font-bold text-gray-500 text-xs">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold text-xs shadow-lg disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestModal;