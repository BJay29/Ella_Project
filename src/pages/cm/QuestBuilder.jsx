import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { authAPI } from '../../services/APIservice'; 
import ActivityCreator from './QuestBuilder/ActivityCreator'; 
import QuizCreator from './QuestBuilder/QuizCreator'; 

const QuestBuilder = () => {
  const navigate = useNavigate(); 
  const [quests, setQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Views: 'list', 'manage-levels', 'selection-view'
  const [view, setView] = useState('list'); 
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestId, setCurrentQuestId] = useState(null);

  // Levels State
  const [levels, setLevels] = useState([]); 
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showDeleteLevelModal, setShowDeleteLevelModal] = useState(false); 
  const [isEditingLevel, setIsEditingLevel] = useState(false); 
  const [currentLevelId, setCurrentLevelId] = useState(null); 
  
  // MODAL STATES FOR ACTIVITY & QUIZ
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false); 

  const [levelData, setLevelData] = useState({
    title: '',         
    level_order: 1     
  });

  const [questData, setQuestData] = useState({
    quest_type: '', 
    quest_level: '', 
    quest_number: '',
    passing_score: 7, 
    is_unlocked_by_default: false
  });

  // --- FETCH QUESTS ---
  const fetchQuests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.getQuests(token);
      const data = res.data ? res.data : (res.json ? await res.json() : res);

      if (Array.isArray(data)) {
        setQuests(data);
      } else if (data.quests || data.data) {
        setQuests(data.quests || data.data || []);
      } else {
        setQuests([]);
      }
    } catch (error) {
      console.error("Error fetching quests:", error);
      setQuests([]); 
    } finally {
      setIsLoading(false);
    }
  };

  // --- FETCH LEVELS ---
  const fetchLevels = async (questId) => {
    if (!questId) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.getLevelsByQuest(questId, token);
      const data = res.data ? res.data : (res.json ? await res.json() : res);

      if (data && data.quest_levels && Array.isArray(data.quest_levels)) {
        setLevels(data.quest_levels);
      } else if (Array.isArray(data)) {
        setLevels(data);
      } else if (data.levels && Array.isArray(data.levels)) {
        setLevels(data.levels);
      } else {
        setLevels([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setLevels([]);
    } finally {
      setIsLoading(false);
    }
  };
 
  useEffect(() => {
    fetchQuests();
  }, []);

  // --- NAVIGATION ---
  const goToManageLevels = (quest) => {
    const qId = quest.quest_id || quest.id;
    setSelectedQuest(quest);
    setCurrentQuestId(qId);
    setLevels([]); 
    fetchLevels(qId);
    setView('manage-levels');
  };

  const goBackToList = () => {
    setView('list');
    setSelectedQuest(null);
    setLevels([]);
    fetchQuests(); 
  };

  const goToSelection = (level) => {
    setSelectedLevel(level);
    setCurrentLevelId(level.quest_level_id || level.id);
    setView('selection-view');
  };

  const goBackToLevels = () => {
    setView('manage-levels');
    setSelectedLevel(null);
    if (currentQuestId) fetchLevels(currentQuestId);
  };

  // --- QUEST ACTIONS ---
  const openCreateModal = () => {
    setIsEditing(false);
    setQuestData({ quest_type: '', quest_level: '', quest_number: '', passing_score: 7, is_unlocked_by_default: false });
    setShowModal(true);
  };

  const openEditModal = (e, quest) => {
    e.stopPropagation();
    setIsEditing(true);
    setCurrentQuestId(quest.quest_id || quest.id);
    setQuestData({
      quest_type: quest.quest_type,
      quest_level: quest.quest_level, 
      quest_number: quest.quest_number,
      passing_score: quest.passing_score,
      is_unlocked_by_default: quest.is_unlocked_by_default
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const payload = { 
      ...questData, 
      quest_number: parseInt(questData.quest_number), 
      passing_score: parseInt(questData.passing_score) 
    };

    try {
      let res = isEditing ? await authAPI.updateQuest(currentQuestId, payload, token) : await authAPI.createQuest(payload, token);
      if (res.ok || res.status === 200 || res.status === 201) {
        setShowModal(false);
        await fetchQuests();
      }
    } catch (error) {
      alert("Action failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LEVEL ACTIONS ---
  const openLevelCreateModal = () => {
    setIsEditingLevel(false);
    setLevelData({ title: '', level_order: (levels.length + 1) });
    setShowLevelModal(true);
  };

  const openLevelEditModal = (e, level) => {
    e.stopPropagation(); 
    setIsEditingLevel(true);
    setCurrentLevelId(level.quest_level_id || level.id);
    setLevelData({
      title: level.level_title || level.quest_level_title || '',
      level_order: level.level_number || level.level_order || 1
    });
    setShowLevelModal(true);
  };
  
  const openLevelDeleteModal = (e, level) => {
    e.stopPropagation(); 
    setCurrentLevelId(level.quest_level_id || level.id);
    setShowDeleteLevelModal(true);
  };

  const handleLevelSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const payload = {
      level_title: levelData.title,
      level_order: parseInt(levelData.level_order),
      level_number: parseInt(levelData.level_order) 
    };

    try {
      let res = isEditingLevel ? await authAPI.updateLevel(currentQuestId, currentLevelId, payload, token) : await authAPI.createLevel(currentQuestId, payload, token);
      if (res.ok || res.status === 201 || res.status === 200) {
        setShowLevelModal(false);
        await fetchLevels(currentQuestId); 
      } else {
        alert("Failed to save level details.");
      }
    } catch (error) {
      console.error("Level Submit Error:", error);
      alert("Connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteLevel = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.deleteLevel(currentQuestId, currentLevelId, token);
      if (res && (res.ok || res.status === 200 || res.status === 204)) {
        setShowDeleteLevelModal(false);
        await fetchLevels(currentQuestId);
      } else {
        alert("Could not delete level."); 
        setShowDeleteLevelModal(false);
      }
    } catch (error) {
      console.error("Delete Error:", error);
      setShowDeleteLevelModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModalHandler = (e, questId) => {
    e.stopPropagation();
    setCurrentQuestId(questId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.deleteQuest(currentQuestId, token);
      if (res.ok || res.status === 200) {
        setShowDeleteModal(false);
        await fetchQuests();
      }
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const handleTogglePublish = async (e, questId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.toggleQuestPublish(questId, token);
      if (res.ok || res.status === 200) fetchQuests();
    } catch (error) { console.error(error); }
  };

  // SUCCESS CALLBACK PARA SA ACTIVITY O QUIZ
  const handleSuccessCallback = (newId) => {
    console.log("Content successfully created with ID:", newId);
    fetchLevels(currentQuestId); 
    setShowActivityModal(false);
    setShowQuizModal(false);
  };

  // --- RENDER SELECTION VIEW ---
  if (view === 'selection-view') {
    return (
      <div className="w-full font-sans p-6 bg-gray-50 min-h-screen flex flex-col items-center justify-center relative">
        <button 
          onClick={goBackToLevels} 
          className="absolute top-10 left-10 flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all"
        >
          ← Back to Levels
        </button>
        
        <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic mb-2">
                {selectedQuest?.quest_type} - Quest #{selectedQuest?.quest_number}
            </h2>
            <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest">
                Level: {selectedLevel?.level_title || selectedLevel?.quest_level_title}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* ACTIVITY CARD */}
            <div onClick={() => setShowActivityModal(true)} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group text-center">
                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform">📝</div>
                <h3 className="text-xl font-black text-slate-800 uppercase mb-2">Activity</h3>
                <p className="text-gray-400 text-sm mb-6 uppercase font-bold tracking-tight">Create lessons and interactive tasks</p>
                <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">Manage Activities →</span>
            </div>

            {/* QUIZ CARD */}
            <div onClick={() => setShowQuizModal(true)} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group text-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform">🏆</div>
                <h3 className="text-xl font-black text-slate-800 uppercase mb-2">Quiz</h3>
                <p className="text-gray-400 text-sm mb-6 uppercase font-bold tracking-tight">Set up questions and assessments</p>
                <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">Manage Quizzes →</span>
            </div>
        </div>

        <ActivityCreator 
          isOpen={showActivityModal} 
          onClose={() => setShowActivityModal(false)} 
          questId={currentQuestId} 
          levelId={currentLevelId} 
          onActivityCreated={handleSuccessCallback} 
        />
        <QuizCreator 
          isOpen={showQuizModal} 
          onClose={() => setShowQuizModal(false)} 
          questId={currentQuestId} 
          levelId={currentLevelId} 
          onSuccess={handleSuccessCallback} 
        />
      </div>
    );
  }

  // --- LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="w-full font-sans p-4 bg-gray-50 min-h-screen text-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <h3 className="text-xl font-bold text-indigo-900 uppercase italic tracking-tighter">Quest Builder</h3>
            </div>
            <button onClick={openCreateModal} className="bg-[#6366F1] hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all active:scale-95">+ Create New Quest</button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quests.map((quest) => (
                <div key={quest.quest_id || quest.id} onClick={() => goToManageLevels(quest)} className="group bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-[#DCFCE7] w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                      {quest.quest_type === 'Writing' ? '🐸' : quest.quest_type === 'Reading' ? '📖' : '🎧'}
                    </div>
                    <button onClick={(e) => handleTogglePublish(e, quest.quest_id || quest.id)} className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${quest.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {quest.is_published ? '● Published' : '○ Draft'}
                    </button>
                  </div>
                  <h4 className="font-black text-gray-800 uppercase text-[15px] leading-tight mb-1">{quest.quest_type} - Quest #{quest.quest_number}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{quest.quest_level} • PASSING SCORE: {quest.passing_score}</p>
                  <div className="flex gap-3 pt-4 border-t border-gray-50">
                    <button onClick={(e) => openEditModal(e, quest)} className="flex-1 bg-[#F3F4F6] hover:bg-gray-200 text-indigo-600 py-3 rounded-xl font-black text-[10px] uppercase transition-all">✏️ Edit Quest</button>
                    <button onClick={(e) => openDeleteModalHandler(e, quest.quest_id || quest.id)} className="px-4 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-8 border border-gray-100 animate-in fade-in zoom-in duration-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? '✏️ Edit Quest' : '+ Create New Quest'}</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Macro Skill</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium outline-none" value={questData.quest_type} onChange={(e) => setQuestData({...questData, quest_type: e.target.value})} required>
                    <option value="" disabled>Select Skill</option><option value="Reading">Reading</option><option value="Writing">Writing</option><option value="Listening">Listening</option><option value="Speaking">Speaking</option>
                  </select>
                </div>
                <div className="space-y-1.5"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Difficulty</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium outline-none" value={questData.quest_level} onChange={(e) => setQuestData({...questData, quest_level: e.target.value})} required>
                    <option value="" disabled>Select Level</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Quest No.</label><input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm" value={questData.quest_number} onChange={(e) => setQuestData({...questData, quest_number: e.target.value})} required /></div>
                  <div className="space-y-1.5"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Passing Score</label><input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm" value={questData.passing_score} onChange={(e) => setQuestData({...questData, passing_score: e.target.value})} required /></div>
                </div>
                <div className="flex justify-between items-center pt-6 gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3.5 border border-gray-200 rounded-xl font-bold text-gray-500 text-xs">Cancel</button>
                  <button type="submit" className="flex-1 bg-[#10B981] text-white px-6 py-3.5 rounded-xl font-bold text-xs shadow-lg">Save Quest</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-[24px] p-8 text-center animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Delete this entire Quest?</h3>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 text-xs transition-all hover:bg-gray-50">Cancel</button>
                <button onClick={confirmDelete} disabled={isSubmitting} className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-red-600 transition-all">
                  {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- MANAGE LEVELS VIEW ---
  return (
    <div className="w-full font-sans p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <button onClick={goBackToList} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all">← Back to Quests</button>
            <div className="text-right">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{selectedQuest?.quest_type} - Quest #{selectedQuest?.quest_number}</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select a level to manage content</p>
            </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-8">
                <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-6">
                    <div>
                      <h4 className="font-black text-slate-800 uppercase text-sm tracking-tight">Quest Missions</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Click a title to manage activities/quizzes</p>
                    </div>
                    <button onClick={openLevelCreateModal} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95">+ Create Level</button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
                ) : !levels || levels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center text-3xl mb-4">🌑</div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">No levels added</h3>
                        <p className="text-gray-400 text-sm max-w-xs">Start building your quest by adding your first level using the button above.</p>
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
                                    <tr 
                                      key={lvl.quest_level_id || lvl.id || index} 
                                      onClick={() => goToSelection(lvl)}
                                      className="group hover:bg-indigo-50/50 transition-all cursor-pointer"
                                    >
                                        <td className="py-5 pl-4"><span className="bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs">{lvl.level_order || (index + 1)}</span></td>
                                        <td className="py-5">
                                            <p className="font-bold text-slate-800 group-hover:text-indigo-600 text-sm uppercase transition-colors">{lvl.level_title || `MISSION ${index + 1}`}</p>
                                        </td>
                                        <td className="py-5 text-right pr-4">
                                            <div className="flex justify-end items-center gap-3">
                                                <button onClick={(e) => openLevelEditModal(e, lvl)} className="p-2 text-indigo-400 hover:text-indigo-600 transition-all text-sm">✏️</button>
                                                <button onClick={(e) => openLevelDeleteModal(e, lvl)} className="p-2 text-red-300 hover:text-red-500 transition-all text-sm">🗑️</button>
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

        {showLevelModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-10 animate-in fade-in zoom-in duration-200">
              <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">
                {isEditingLevel ? '✏️ Update Mission' : '🚀 New Mission'}
              </h3>
              <form onSubmit={handleLevelSubmit} className="space-y-6">
                <div className="space-y-1.5"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Level Title</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold outline-none" value={levelData.title} onChange={(e) => setLevelData({...levelData, title: e.target.value})} required />
                </div>
                <div className="space-y-1.5"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Order / Number</label>
                    <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold outline-none" value={levelData.level_order} onChange={(e) => setLevelData({...levelData, level_order: e.target.value})} required />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowLevelModal(false)} className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl font-black text-gray-400 text-[11px] uppercase tracking-widest transition-all hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteLevelModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-[24px] p-8 text-center animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Delete this Level?</h3>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteLevelModal(false)} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 text-xs hover:bg-gray-50 transition-all">No</button>
                <button onClick={confirmDeleteLevel} className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-red-600 transition-all">Yes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestBuilder;