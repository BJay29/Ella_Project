import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';

// Corrected Imports based on your flat folder structure
import AssignQuestModal from './AssignQuestModal';
import SelectionView from './SelectionView';
import LevelsView from './LevelsView';
import ListView from './ListView';
import QuestModal from './QuestModal';
import DeleteModal from './DeleteModal';
import ActivityCreator from './ActivityCreator';
import QuizCreator from './QuizCreator';

const QuestBuilder = () => {
  const [quests, setQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState('list');
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestId, setCurrentQuestId] = useState(null);
  const [levels, setLevels] = useState([]);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showDeleteLevelModal, setShowDeleteLevelModal] = useState(false);
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [currentLevelId, setCurrentLevelId] = useState(null);

  // States for Modals
  const [activityModal, setActivityModal] = useState({ open: false, mode: 'save-info' });
  const [quizModal, setQuizModal] = useState({ open: false, mode: 'save-info' });
  
  // Custom Delete States
  const [deleteContentModal, setDeleteContentModal] = useState({ open: false, type: '', id: null });

  const [existingActivity, setExistingActivity] = useState(null);
  const [existingQuiz, setExistingQuiz] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [levelData, setLevelData] = useState({ title: '', level_order: 1 });
  const [questData, setQuestData] = useState({
    quest_type: '', quest_level: '', quest_number: '', passing_score: 7, is_unlocked_by_default: false
  });

  const fetchQuests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { setQuests([]); return; }
      const res = await authAPI.getQuests(token);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setQuests(data);
        else setQuests(data.quests || data.data || []);
      } else { setQuests([]); }
    } catch (error) { console.error("fetchQuests error:", error); setQuests([]); }
    finally { setIsLoading(false); }
  };

  const fetchLevels = async (questId) => {
    if (!questId) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.getLevelsByQuest(questId, token);
      if (res.ok) {
        const data = await res.json();
        if (data?.quest_levels) setLevels(data.quest_levels);
        else if (Array.isArray(data)) setLevels(data);
        else setLevels(data.levels || []);
      } else { setLevels([]); }
    } catch (error) { console.error("fetchLevels error:", error); setLevels([]); }
    finally { setIsLoading(false); }
  };

  const fetchActivityOnly = async (questId, quest_level_id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.getActivities(questId, quest_level_id, token);
      if (res.ok) {
        const d = await res.json();
        console.log("Activity fetch response:", d);
        
        if (d && d.activity) {
          setExistingActivity(d.activity);
        } else if (d && typeof d === 'object' && (d.activity_id || d.id)) {
          setExistingActivity(d);
        } else {
          const arr = Array.isArray(d) ? d : (d.activities || []);
          setExistingActivity(arr.length > 0 ? arr[0] : null);
        }
      } else { 
        setExistingActivity(null); 
      }
    } catch (err) { 
      console.error("fetchActivityOnly error:", err); 
      setExistingActivity(null); 
    }
  };

  const fetchQuizOnly = async (questId, quest_level_id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.getQuizzes(questId, quest_level_id, token);
      if (res.ok) {
        const d = await res.json();
        console.log("Quiz fetch response:", d);

        if (d && d.quiz) {
          setExistingQuiz(d.quiz);
        } else if (d && typeof d === 'object' && (d.quiz_id || d.id)) {
          setExistingQuiz(d);
        } else {
          const arr = Array.isArray(d) ? d : (d.quizzes || []);
          setExistingQuiz(arr.length > 0 ? arr[0] : null);
        }
      } else { 
        setExistingQuiz(null); 
      }
    } catch (err) { 
      console.warn("fetchQuizOnly info:", err); 
      setExistingQuiz(null); 
    }
  };

  const fetchLevelContent = async (questId, quest_level_id) => {
    if (!questId || !quest_level_id) { console.error("fetchLevelContent: missing IDs"); return; }
    setLoadingContent(true);
    try {
      await fetchActivityOnly(questId, quest_level_id);
      await fetchQuizOnly(questId, quest_level_id);
    } catch (err) { 
      console.error("fetchLevelContent error:", err); 
    } finally { 
      setLoadingContent(false); 
    }
  };

  useEffect(() => { fetchQuests(); }, []);

  const goToManageLevels = (quest) => {
    const qId = quest.quest_id || quest.id;
    setSelectedQuest(quest); setCurrentQuestId(qId); setLevels([]);
    fetchLevels(qId); setView('manage-levels');
  };

  const goBackToList = () => {
    setView('list'); setSelectedQuest(null); setCurrentQuestId(null); setLevels([]); fetchQuests();
  };

  const goToSelection = (level) => {
    setSelectedLevel(level);
    const lvlId = level.quest_level_id || level.id;
    setCurrentLevelId(lvlId);
    setExistingActivity(null); setExistingQuiz(null);
    const qId = currentQuestId || selectedQuest?.quest_id || selectedQuest?.id;
    if (qId && lvlId) { fetchLevelContent(qId, lvlId); setView('selection-view'); }
    else alert("Error: Missing Quest or Level ID.");
  };

  const goBackToLevels = () => {
    setView('manage-levels'); setSelectedLevel(null);
    setExistingActivity(null); setExistingQuiz(null);
    if (currentQuestId) fetchLevels(currentQuestId);
  };

  const handleActivitySuccess = async () => {
    await fetchLevelContent(currentQuestId, currentLevelId);
    setActivityModal({ open: false, mode: 'save-info' });
  };

  const handleQuizSuccess = async () => {
    await fetchLevelContent(currentQuestId, currentLevelId);
    setQuizModal({ open: false, mode: 'save-info' });
  };

  // ─── UPDATED DELETE LOGIC ───
  const handleDeleteActivity = (activityId) => {
    setDeleteContentModal({ open: true, type: 'activity', id: activityId });
  };

  const handleDeleteQuiz = (quizId) => {
    setDeleteContentModal({ open: true, type: 'quiz', id: quizId });
  };

  const confirmDeleteContent = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      let res;
      if (deleteContentModal.type === 'activity') {
        res = await authAPI.deleteActivity(currentQuestId, currentLevelId, deleteContentModal.id, token);
        if (res.ok) setExistingActivity(null);
      } else {
        res = await authAPI.deleteQuiz(currentQuestId, currentLevelId, deleteContentModal.id, token);
        if (res.ok) setExistingQuiz(null);
      }
      setDeleteContentModal({ open: false, type: '', id: null });
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setQuestData({ quest_type: '', quest_level: '', quest_number: '', passing_score: 7, is_unlocked_by_default: false });
    setShowModal(true);
  };

  const openEditModal = (e, quest) => {
    e.stopPropagation(); setIsEditing(true);
    setCurrentQuestId(quest.quest_id || quest.id);
    setQuestData({ 
      quest_type: quest.quest_type || '', 
      quest_level: quest.quest_level || '', 
      quest_number: quest.quest_number || '', 
      passing_score: quest.passing_score || 7, 
      is_unlocked_by_default: quest.is_unlocked_by_default || false 
    });
    setShowModal(true);
  };

  const openAssignModal = (e, quest) => { e.stopPropagation(); setSelectedQuest(quest); setShowAssignModal(true); };

  const handleQuestSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const payload = { ...questData, quest_number: parseInt(questData.quest_number), passing_score: parseInt(questData.passing_score) };
    try {
      const res = isEditing ? await authAPI.updateQuest(currentQuestId, payload, token) : await authAPI.createQuest(payload, token);
      if (res.ok) { setShowModal(false); await fetchQuests(); }
    } catch (error) { alert("Action failed."); }
    finally { setIsSubmitting(false); }
  };

  const openLevelCreateModal = () => { setIsEditingLevel(false); setLevelData({ title: '', level_order: levels.length + 1 }); setShowLevelModal(true); };
  const openLevelEditModal = (e, level) => {
    e.stopPropagation(); setIsEditingLevel(true);
    setCurrentLevelId(level.quest_level_id || level.id);
    setLevelData({ title: level.level_title || level.quest_level_title || '', level_order: level.level_number || level.level_order || 1 });
    setShowLevelModal(true);
  };
  const openLevelDeleteModal = (e, level) => { e.stopPropagation(); setCurrentLevelId(level.quest_level_id || level.id); setShowDeleteLevelModal(true); };

  const handleLevelSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const payload = { level_title: levelData.title, level_order: parseInt(levelData.level_order), level_number: parseInt(levelData.level_order) };
    try {
      const res = isEditingLevel ? await authAPI.updateLevel(currentQuestId, currentLevelId, payload, token) : await authAPI.createLevel(currentQuestId, payload, token);
      if (res.ok) { setShowLevelModal(false); await fetchLevels(currentQuestId); }
      else alert("Failed to save level.");
    } catch (error) { alert("Connection error."); }
    finally { setIsSubmitting(false); }
  };

  const confirmDeleteLevel = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.deleteLevel(currentQuestId, currentLevelId, token);
      if (res?.ok) { setShowDeleteLevelModal(false); await fetchLevels(currentQuestId); }
      else { alert("Could not delete level."); setShowDeleteLevelModal(false); }
    } catch (error) { setShowDeleteLevelModal(false); }
    finally { setIsSubmitting(false); }
  };

  const openDeleteQuestModal = (e, questId) => { e.stopPropagation(); setCurrentQuestId(questId); setShowDeleteModal(true); };
  const confirmDeleteQuest = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.deleteQuest(currentQuestId, token);
      if (res.ok) { setShowDeleteModal(false); await fetchQuests(); }
    } catch (error) { console.error(error); }
    finally { setIsSubmitting(false); }
  };

  const handleTogglePublish = async (e, questId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.toggleQuestPublish(questId, token);
      if (res.ok) fetchQuests();
    } catch (error) { console.error(error); }
  };

  if (view === 'selection-view') {
    return (
      <>
        <SelectionView
          selectedQuest={selectedQuest}
          selectedLevel={selectedLevel}
          existingActivity={existingActivity}
          existingQuiz={existingQuiz}
          loadingContent={loadingContent}
          currentQuestId={currentQuestId}
          currentLevelId={currentLevelId}
          activityModal={activityModal}
          quizModal={quizModal}
          setActivityModal={setActivityModal}
          setQuizModal={setQuizModal}
          onBack={goBackToLevels}
          onActivitySuccess={handleActivitySuccess}
          onQuizSuccess={handleQuizSuccess}
          onDeleteActivity={handleDeleteActivity}
          onDeleteQuiz={handleDeleteQuiz}
        />

        {activityModal.open && (
          <ActivityCreator
            isOpen={activityModal.open}
            mode={activityModal.mode}
            questId={currentQuestId}
            quest_level_id={currentLevelId}
            existingActivity={existingActivity}
            onClose={() => setActivityModal({ ...activityModal, open: false })}
            onSuccess={handleActivitySuccess}
            onActivityCreated={handleActivitySuccess}
          />
        )}

        {quizModal.open && (
          <QuizCreator
            isOpen={quizModal.open}
            mode={quizModal.mode}
            questId={currentQuestId}
            quest_level_id={currentLevelId}
            existingQuiz={existingQuiz}
            onClose={() => setQuizModal({ ...quizModal, open: false })}
            onSuccess={handleQuizSuccess}
          />
        )}

        {/* Delete Confirmation for Activity/Quiz */}
        <DeleteModal
          isOpen={deleteContentModal.open}
          isSubmitting={isSubmitting}
          title={`Delete this ${deleteContentModal.type}?`}
          onClose={() => setDeleteContentModal({ open: false, type: '', id: null })}
          onConfirm={confirmDeleteContent}
        />
      </>
    );
  }

  if (view === 'manage-levels') {
    return (
      <LevelsView
        selectedQuest={selectedQuest}
        levels={levels}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        levelData={levelData}
        setLevelData={setLevelData}
        isEditingLevel={isEditingLevel}
        showLevelModal={showLevelModal}
        setShowLevelModal={setShowLevelModal}
        showDeleteLevelModal={showDeleteLevelModal}
        setShowDeleteLevelModal={setShowDeleteLevelModal}
        onBack={goBackToList}
        onSelectLevel={goToSelection}
        onCreateLevel={openLevelCreateModal}
        onEditLevel={openLevelEditModal}
        onDeleteLevel={openLevelDeleteModal}
        onLevelSubmit={handleLevelSubmit}
        onConfirmDeleteLevel={confirmDeleteLevel}
      />
    );
  }

  return (
    <>
      <ListView
        quests={quests}
        isLoading={isLoading}
        onSelectQuest={goToManageLevels}
        onCreateQuest={openCreateModal}
        onEditQuest={openEditModal}
        onDeleteQuest={openDeleteQuestModal}
        onTogglePublish={handleTogglePublish}
        onAssign={openAssignModal}
      />

      <QuestModal
        isOpen={showModal}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        questData={questData}
        setQuestData={setQuestData}
        onClose={() => setShowModal(false)}
        onSubmit={handleQuestSubmit}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        isSubmitting={isSubmitting}
        title="Delete this Quest?"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteQuest}
      />

      {showAssignModal && (
        <AssignQuestModal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} quest={selectedQuest} />
      )}
    </>
  );
};

export default QuestBuilder;