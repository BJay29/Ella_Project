import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../../services/APIservice';
import {
  ChevronLeft, Plus, ListChecks,
  AlertTriangle, ChevronRight, X, CheckCircle2, Edit3
} from 'lucide-react';
import QuestionForm from './QuestionForm';

// ─────────────────────────────────────────────────────────────────────────────
// Alert Modal
// ─────────────────────────────────────────────────────────────────────────────
const AlertModal = ({ isOpen, onClose, message, title = 'Notice', variant = 'warning' }) => {
  if (!isOpen) return null;
  const iconBg   = variant === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500';
  const btnClass = variant === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800';
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${iconBg}`}>
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{message}</p>
        <button type="button" onClick={onClose}
          className={`w-full mt-6 text-white py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${btnClass}`}>
          {variant === 'success' ? 'Great!' : 'Understood'}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────────────────────
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isDeleting, questionText }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl border border-slate-200 text-center">
        <div className="text-4xl mb-4">🗑️</div>
        <h3 className="text-lg font-black text-slate-900">Delete this question?</h3>
        {questionText && (
          <p className="text-sm text-slate-500 mt-2 bg-slate-50 rounded-xl p-3 font-medium italic line-clamp-2">
            "{questionText}"
          </p>
        )}
        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          This will permanently remove the question and automatically renumber the remaining ones.
        </p>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} disabled={isDeleting}
            className="flex-1 py-3 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isDeleting}
            className="flex-1 py-3 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-60">
            {isDeleting ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Success Toast
// ─────────────────────────────────────────────────────────────────────────────
const SuccessToast = ({ visible, message }) => (
  <div className={`fixed top-6 right-6 z-[300] transition-all duration-500 ${
    visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
  }`}>
    <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
      <CheckCircle2 size={20} />
      <p className="font-black text-sm uppercase tracking-widest">{message}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const buildBlankAnswers = (type) => {
  if (type === 'true_false')  return [{ text: 'True', is_correct: false }, { text: 'False', is_correct: false }];
  if (type === 'essay')       return [];
  if (type === 'identification' || type === 'fill_in_the_blanks') return [{ text: '', is_correct: true }];
  return [
    { text: '', is_correct: false }, { text: '', is_correct: false },
    { text: '', is_correct: false }, { text: '', is_correct: false },
  ];
};

const buildBlankForm = () => ({
  id:            null,
  question_text: '',
  question_type: 'multiple_choice',
  answers:       buildBlankAnswers('multiple_choice'),
});

// Maps API response shape → local form shape
// Handles both q.id and q.question_id field names from the backend
const mapApiQuestion = (q) => {
  if (!q) return null;
  return {
    // ✅ This line is CRITICAL. It maps the server's ID to the frontend 'id'
    id: q.id || q.activity_question_id || q.question_id || null,
    question_text: q.question_text || '',
    question_type: q.question_type || 'multiple_choice',
    answers: (q.answers || []).map(a => ({
      id: a.id || a.answer_id || null,
      text: a.answer_text || '',
      is_correct: !!a.is_correct
    }))
  };
};
// ─────────────────────────────────────────────────────────────────────────────
// AddQuestion Page
//
// Routes:
//   /cm/dashboard/quest/:questId/level/:levelId/activity/:activityId/add-question?mode=add
//   /cm/dashboard/quest/:questId/level/:levelId/quiz/:quizId/add-question?mode=edit
//
// KEY: `levelId` from useParams() IS the quest_level_id for all API calls.
// ─────────────────────────────────────────────────────────────────────────────
const AddQuestion = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // ✅ levelId === quest_level_id — used directly in every API call below
const { questId, levelId: quest_level_id, activityId, quizId } = useParams();
  
const contentType    = quizId ? 'quiz' : 'activity';
  const finalContentId = quizId || activityId;

  const searchParams = new URLSearchParams(location.search);
  const initialMode  = searchParams.get('mode') === 'edit' ? 'edit' : 'add';

  // ── State ─────────────────────────────────────────────────────────────────
  const [pageMode,     setPageMode]     = useState(initialMode);
  const [loading,      setLoading]      = useState(false);
  const [alertConfig,  setAlertConfig]  = useState({ show: false, message: '', title: '', variant: 'warning' });
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [deleteModal,  setDeleteModal]  = useState({ open: false, questionId: null, idx: null, questionText: '' });
  const [isDeleting,   setIsDeleting]   = useState(false);

  // ADD mode
  const [totalQuestions, setTotalQuestions] = useState(1);
  const [addStep,        setAddStep]        = useState(1);

  // EDIT mode
  const [editSelectedIdx, setEditSelectedIdx] = useState(0);

  // Shared
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [initialized,    setInitialized]    = useState(false);
  const [questionData,   setQuestionData]   = useState(buildBlankForm());

  const skipEffectRef = useRef(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showAlert = (message, title = 'Attention', variant = 'warning') =>
    setAlertConfig({ show: true, message, title, variant });

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // ✅ navigate(-1) always returns to the page we came from (SelectionView/workshop)
  const goBackToWorkspace = () => navigate(-1);

  // ─────────────────────────────────────────────────────────────────────────
  // fetchQuestions — returns the fresh array directly so callers can use it
  // without depending on stale React state
  // ─────────────────────────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async (isInit = false) => {
    if (!questId || !quest_level_id || !finalContentId) return [];
    try {
      const token = localStorage.getItem('token');

      // ✅ FIXED: use `levelId` (= quest_level_id), not any other variable
      const res = contentType === 'quiz'
        ? await authAPI.getQuizQuestions(questId, quest_level_id, finalContentId, token)
        : await authAPI.getActivityQuestions(questId, quest_level_id, finalContentId, token);

      if (res.ok) {
        const raw = await res.json();
        const arr = Array.isArray(raw) ? raw : (raw.questions || []);
        setSavedQuestions(arr);

        if (isInit) {
          setInitialized(true);
          if (initialMode === 'add') {
            const nextSlot = arr.length + 1;
            setAddStep(nextSlot);
            setTotalQuestions(Math.max(nextSlot, 1));
          } else {
            // Edit mode: auto-load first question
            if (arr.length > 0) {
              setQuestionData(mapApiQuestion(arr[0]));
              setEditSelectedIdx(0);
            }
          }
        }
        return arr;
      }
    } catch (err) {
      console.error('fetchQuestions error:', err);
    }
    if (isInit) setInitialized(true);
    return [];
  }, [questId, quest_level_id, finalContentId, contentType, initialMode]);

  useEffect(() => { fetchQuestions(true); }, [fetchQuestions]);

  // Load question when addStep changes (ADD mode only)
  useEffect(() => {
    if (!initialized || pageMode !== 'add' || skipEffectRef.current) return;
    const existing = savedQuestions[addStep - 1];
    setQuestionData(existing ? mapApiQuestion(existing) : buildBlankForm());
  }, [addStep, savedQuestions, initialized, pageMode]);

  // ─────────────────────────────────────────────────────────────────────────
  // Build payload
  // ─────────────────────────────────────────────────────────────────────────
  const buildPayload = (qd) => {
    const { question_text, question_type, answers } = qd;
    const needsText    = ['identification', 'fill_in_the_blanks'].includes(question_type);
    const finalAnswers = question_type === 'essay' ? [] : answers
      .filter(a => (a.text || '').trim() !== '')
      .map((a, i) => ({
        answer_text: a.text.trim(),
        is_correct:  needsText ? true : a.is_correct,
        order_index: i + 1,
      }));
    return { question_text: question_text.trim(), question_type, answers: finalAnswers };
  };

  // Validate form — shows alert and returns false if invalid
  const validate = (qd) => {
    const { question_text, question_type, answers } = qd;
    if (!question_text?.trim()) {
      showAlert('Please enter a question.', 'Missing Info'); return false;
    }
    if (['multiple_choice', 'true_false'].includes(question_type) &&
        !answers.some(a => a.is_correct && a.text?.trim())) {
      showAlert('Please mark at least one correct answer.', 'Validation Error'); return false;
    }
    if (['identification', 'fill_in_the_blanks'].includes(question_type) &&
        !answers[0]?.text?.trim()) {
      showAlert('Please provide the correct answer.', 'Validation Error'); return false;
    }
    return true;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ FIXED callSaveApi — was using undefined `quest_level_id`.
  //    Now uses `levelId` from useParams() which IS the quest_level_id.
  //    qd.id present → UPDATE (PUT), absent → CREATE (POST)
  // ─────────────────────────────────────────────────────────────────────────
  const callSaveApi = async (qd) => {
    const token   = localStorage.getItem('token');
    const payload = buildPayload(qd);
    const { id }  = qd;

    if (contentType === 'quiz') {
      return id
        ? authAPI.updateQuizQuestion(questId, quest_level_id, finalContentId, id, payload, token)
        : authAPI.addQuizQuestion(questId, quest_level_id, finalContentId, payload, token);
    } else {
      return id
        ? authAPI.updateActivityQuestion(questId, quest_level_id, finalContentId, id, payload, token)
        : authAPI.addActivityQuestion(questId, quest_level_id, finalContentId, payload, token);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ FIXED callDeleteApi — was using undefined `quest_level_id`.
  //    Now uses `levelId` from useParams().
  // ─────────────────────────────────────────────────────────────────────────
  const callDeleteApi = async (questionId) => {
    const token = localStorage.getItem('token');
    return contentType === 'quiz'
      ? authAPI.deleteQuizQuestion(questId, quest_level_id, finalContentId, questionId, token)
      : authAPI.deleteActivityQuestion(questId, quest_level_id, finalContentId, questionId, token);
  };

  // ═══════════════════════════════════════════════════════════════
  // ADD MODE HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleSaveNext = async () => {
    if (!validate(questionData)) return;
    if (addStep >= totalQuestions) {
      showAlert(`You've reached the limit (${totalQuestions}). Increase "Total Items" first.`, 'Limit Reached');
      return;
    }
    skipEffectRef.current = true;
    setLoading(true);
    try {
      const res = await callSaveApi(questionData);
      if (res.ok || res.status === 201) {
        await fetchQuestions(false);
        setQuestionData(buildBlankForm());
        setAddStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const e = await res.json().catch(() => ({}));
        showAlert(e.message || 'Failed to save question.', 'Error');
      }
    } catch (err) {
      console.error('handleSaveNext error:', err);
      showAlert('Network error. Please try again.', 'Error');
    } finally {
      setLoading(false);
      skipEffectRef.current = false;
    }
  };

  const handleSaveFinish = async () => {
    if (!validate(questionData)) return;
    setLoading(true);
    try {
      const res = await callSaveApi(questionData);
      if (res.ok || res.status === 201) {
        // ✅ navigate(-1) returns to workshop/SelectionView (not main dashboard)
        goBackToWorkspace();
      } else {
        const e = await res.json().catch(() => ({}));
        showAlert(e.message || 'Failed to save.', 'Error');
      }
    } catch (err) {
      console.error('handleSaveFinish error:', err);
      showAlert('Network error. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (addStep <= 1) return;
    skipEffectRef.current = false;
    setAddStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ═══════════════════════════════════════════════════════════════
  // EDIT MODE HANDLERS
  // ═══════════════════════════════════════════════════════════════

  // Select a question from the sidebar — loads it into the editor
 const handleSelectQuestion = (idx) => {
  const selected = savedQuestions[idx];
  const mapped = mapApiQuestion(selected);
  
  console.log("Mapped ID to be loaded:", mapped.id); // Dapat HINDI ito null sa console

  setEditSelectedIdx(idx);
  setQuestionData(mapped); 
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

  // ✅ Save Changes — updates in-place ONLY, never creates a new question,
  // never navigates away. Shows toast on success.
const handleSaveChanges = async () => {
  // 1. Prevents double execution and sets loading states
  if (loading) return;
  
  skipEffectRef.current = true;
  setLoading(true);

  try {
    // 2. ID Validation: Check if we actually have an ID to update
    const currentId = questionData.id || questionData.activity_question_id;
    
    if (!currentId) {
      showAlert('Select a Question First (No valid ID found).', 'Error');
      setLoading(false);
      return;
    }

    // 3. Call the API
    // Ensure questId, levelId, and activityId are available in your scope
    const res = await callSaveApi(questionData);

    if (res.ok || res.status === 200 || res.status === 201) {
      // 4. Refresh Sidebar Data
      // fetchQuestions(false) is called to get the latest data from the DB
      const freshArr = await fetchQuestions(false); 
      
      if (freshArr && freshArr.length > 0) {
        // Find the correct index to keep the user on the same question
        const safeIdx = Math.min(editSelectedIdx, freshArr.length - 1);
        setEditSelectedIdx(safeIdx);
        
        // 5. Update the form with the fresh mapped data from the server
        const mapped = mapApiQuestion(freshArr[safeIdx]);
        setQuestionData(mapped);
        
        // Also update the main savedQuestions list to reflect changes in the sidebar
        setSavedQuestions(freshArr.map(q => mapApiQuestion(q)));
      }

      showToast('✅ Question updated successfully!');
    } else {
      const e = await res.json().catch(() => ({}));
      showAlert(e.message || 'Failed to update question.', 'Error');
    }
  } catch (err) {
    console.error('handleSaveChanges error:', err);
    // This catches the 404 errors seen in your logs
    showAlert('Network error or Resource Not Found (404). Please try again.', 'Error');
  } finally {
    setLoading(false);
    skipEffectRef.current = false;
  }
};

  // Open the delete confirmation modal
  const openDeleteModal = (e, qId, idx, qText) => {
    e.stopPropagation();
    // ✅ FIXED: qId comes from q.id || q.question_id in the sidebar map
    // If qId is falsy here, the question genuinely has no DB record
    if (!qId) {
      showAlert("This question hasn't been saved to the database yet.", 'Nothing to Delete');
      return;
    }
    setDeleteModal({ open: true, questionId: qId, idx, questionText: qText || '' });
  };

  // ✅ FIXED confirmDelete — uses callDeleteApi which correctly uses `levelId`
  const confirmDelete = async () => {
    const { questionId, idx } = deleteModal;

    setIsDeleting(true);
    try {
      const res = await callDeleteApi(questionId);

      if (res.ok) {
        // Fetch fresh list — sidebar auto-renumbers based on array index
        const freshArr = await fetchQuestions(false);

        if (!freshArr || freshArr.length === 0) {
          // All questions deleted — clear the form
          setEditSelectedIdx(0);
          setQuestionData(buildBlankForm());
        } else {
          // Land on the question that now occupies the same slot (or the last one)
          const newIdx = Math.min(idx, freshArr.length - 1);
          setEditSelectedIdx(newIdx);
          setQuestionData(mapApiQuestion(freshArr[newIdx]));
        }
        showToast('🗑️ Question deleted and renumbered.');
      } else {
        const e = await res.json().catch(() => ({}));
        showAlert(e.message || 'Failed to delete question.', 'Error');
      }
    } catch (err) {
      console.error('confirmDelete error:', err);
      showAlert('Network error. Please try again.', 'Error');
    } finally {
      setIsDeleting(false);
      setDeleteModal({ open: false, questionId: null, idx: null, questionText: '' });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  const isQuiz        = contentType === 'quiz';
  const accentColor   = isQuiz ? 'rose' : 'amber';
  const typeLabel     = isQuiz ? 'Quiz' : 'Activity';
  const headerBg      = isQuiz ? 'bg-rose-50' : 'bg-amber-50';
  const headerEmoji   = isQuiz ? '🏆' : '📝';
  const isAddLastStep = addStep >= totalQuestions;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10">
      <SuccessToast visible={toastVisible} message={toastMessage} />

      <div className="max-w-6xl mx-auto">

        {/* Top Nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={goBackToWorkspace}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all">
            <ChevronLeft size={18} /> Back to Workspace
          </button>

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => {
                setPageMode('add');
                setQuestionData(buildBlankForm());
                skipEffectRef.current = false;
              }}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                pageMode === 'add'
                  ? (isQuiz ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white')
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              ➕ Add
            </button>
            <button
              onClick={() => {
                setPageMode('edit');
                skipEffectRef.current = true;
                if (savedQuestions.length > 0) {
                  setEditSelectedIdx(0);
                  setQuestionData(mapApiQuestion(savedQuestions[0]));
                }
              }}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                pageMode === 'edit'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              ✏️ Edit
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${headerBg} rounded-[22px] flex items-center justify-center text-2xl`}>
                {headerEmoji}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {typeLabel} Question Designer
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${pageMode === 'add' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {pageMode === 'add'
                      ? `Add Mode — Question ${addStep} of ${totalQuestions}`
                      : `Edit Mode — ${savedQuestions.length} question${savedQuestions.length !== 1 ? 's' : ''} saved`}
                  </p>
                </div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
              pageMode === 'add'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              {pageMode === 'add' ? '➕ Add Mode' : '✏️ Edit Mode'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* ── Left: Form ── */}
            <div className="lg:col-span-8 p-8 md:p-12 border-r border-slate-100">

              {/* ADD MODE */}
              {pageMode === 'add' && (
                <QuestionForm
                  mode="add"
                  questionText={questionData.question_text}
                  setQuestionText={(val) => setQuestionData(prev => ({ ...prev, question_text: val }))}
                  questionType={questionData.question_type}
                  setQuestionType={(val) => setQuestionData(prev => ({
                    ...prev, question_type: val, answers: buildBlankAnswers(val),
                  }))}
                  answers={questionData.answers}
                  setAnswers={(val) => setQuestionData(prev => ({ ...prev, answers: val }))}
                  onSaveNext={handleSaveNext}
                  onSaveFinish={handleSaveFinish}
                  onBack={handlePrev}
                  onBackToWorkspace={goBackToWorkspace}
                  isSubmitting={loading}
                  currentStep={addStep}
                  totalQuestions={totalQuestions}
                  setTotalQuestions={(val) => setTotalQuestions(Math.max(addStep, val))}
                  isLastStep={isAddLastStep}
                  savedCount={savedQuestions.length}
                  themeColor={accentColor}
                />
              )}

              {/* EDIT MODE */}
              {pageMode === 'edit' && (
                savedQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-xl font-black text-slate-700 uppercase tracking-tighter mb-2">No Questions Yet</h3>
                    <p className="text-sm text-slate-400 mb-6">Switch to Add Mode to create questions first.</p>
                    <button
                      onClick={() => { setPageMode('add'); setQuestionData(buildBlankForm()); }}
                      className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white ${
                        isQuiz ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'
                      } transition-all active:scale-95`}>
                      ➕ Go to Add Mode
                    </button>
                  </div>
                ) : (
                  <QuestionForm
                    mode="edit"
                    questionText={questionData.question_text}
                    setQuestionText={(val) => setQuestionData(prev => ({ ...prev, question_text: val }))}
                    questionType={questionData.question_type}
                    setQuestionType={null}  // locked in edit mode
                    answers={questionData.answers}
                    setAnswers={(val) => setQuestionData(prev => ({ ...prev, answers: val }))}
                    onSaveChanges={handleSaveChanges}
                    onBackToWorkspace={goBackToWorkspace}
                    isSubmitting={loading}
                    currentStep={editSelectedIdx + 1}
                    totalQuestions={savedQuestions.length}
                    setTotalQuestions={() => {}}  // no-op in edit mode
                    themeColor={accentColor}
                  />
                )
              )}
            </div>

            {/* ── Right: Sidebar ── */}
            <div className="lg:col-span-4 p-8 bg-slate-50/50 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ListChecks size={18} className="text-indigo-500" />
                  <span className="font-black text-[11px] uppercase tracking-widest text-slate-700">Question Stack</span>
                </div>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-indigo-600">
                  {savedQuestions.length} Saved
                </span>
              </div>

   {/* ADD MODE sidebar */}
{pageMode === 'add' && (
  <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1">
    {/* 1. List of Already Saved Questions */}
    {savedQuestions.map((q, idx) => {
      const stepNum  = idx + 1;
      const isActive = addStep === stepNum;
      
      // ✅ Fail-safe key: gamit ang ID kung meron, index kung wala
      const qKey = q.id || q.question_id || `saved-${idx}`;

      return (
        <button
          key={qKey}
          type="button"
          onClick={() => { 
            skipEffectRef.current = false; 
            setAddStep(stepNum); 
          }}
          className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
            isActive 
              ? 'bg-white border-indigo-500 shadow-md' 
              : 'bg-white border-transparent hover:border-slate-200'
          }`}
        >
          <span className={`text-[10px] font-black w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}>{stepNum}</span>
          
          <span className="truncate text-xs font-bold text-slate-600 flex-1">
            {q.question_text || 'Saved Question'}
          </span>
          
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
        </button>
      );
    })}

    {/* 2. Currently editing slot (The 'New' question entry) */}
    {addStep > savedQuestions.length && (
      <div className={`w-full p-4 rounded-2xl border-2 border-dashed flex items-center gap-3 ${
        isQuiz ? 'border-rose-300 bg-rose-50/50' : 'border-amber-300 bg-amber-50/50'
      }`}>
        <span className={`text-[10px] font-black w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white ${
          isQuiz ? 'bg-rose-500' : 'bg-amber-500'
        }`}>{addStep}</span>
        
        <span className={`text-xs font-black uppercase tracking-widest ${isQuiz ? 'text-rose-500' : 'text-amber-500'}`}>
          Editing now…
        </span>
      </div>
    )}

    {/* 3. Future empty slots (Remaining placeholders) */}
    {Array.from({ length: Math.max(0, totalQuestions - Math.max(savedQuestions.length, addStep)) }).map((_, i) => {
      const nextNum = Math.max(savedQuestions.length, addStep) + 1 + i;
      return (
        <div 
          key={`empty-${nextNum}`}
          className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-100 flex items-center gap-3 opacity-40"
        >
          <span className="text-[10px] font-black w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-400">
            {nextNum}
          </span>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Empty Slot</span>
        </div>
      );
    })}
  </div>
)}
{/* EDIT MODE sidebar */}
{pageMode === 'edit' && (
  <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
    {savedQuestions.length === 0 ? (
      <div className="text-center py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          No questions found
        </p>
      </div>
    ) : (
      savedQuestions.map((q, idx) => {
        const stepNum = idx + 1;
        const isActive = editSelectedIdx === idx;

        /** * ✅ FAIL-SAFE ID CHECK:
         * Kasama na dito ang 'activity_question_id' para match sa database at sa mapping function.
         */
        const qId = q.id || q.activity_question_id || q.question_id || q._id;

        return (
          <div key={qId || `edit-item-${idx}`} className="relative group">
            <button
              type="button"
              onClick={() => handleSelectQuestion(idx)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                isActive
                  ? 'bg-white border-indigo-500 shadow-lg scale-[1.02] z-10 relative'
                  : 'bg-white border-transparent hover:border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {/* Step Number Indicator */}
                <span className={`text-[10px] font-black w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {stepNum}
                </span>

                <div className="overflow-hidden">
                  <p className={`truncate text-xs font-bold transition-colors ${
                    isActive ? 'text-indigo-900' : 'text-slate-700'
                  }`}>
                    {q.question_text || 'Untitled Question'}
                  </p>
                  <p className="text-[9px] font-bold text-slate-300 uppercase mt-0.5 tracking-tighter">
                    {(q.question_type || 'multiple_choice').replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              {/* Active Indicators */}
              <div className="flex items-center gap-1 shrink-0">
                {isActive && (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse mr-1" />
                    <ChevronRight size={14} className="text-indigo-500" />
                  </>
                )}
              </div>
            </button>

            {/* ✅ DELETE BUTTON: 
                Ipinapasa ang qId (para sa API) at idx (para sa UI state) 
            */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Iwasan ang pag-trigger ng handleSelectQuestion
                openDeleteModal(e, qId, idx, q.question_text);
              }}
              disabled={loading || isDeleting}
              className="absolute -right-2 -top-2 w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10 disabled:opacity-30 border-2 border-white"
              title="Delete this question"
            >
              <X size={13} strokeWidth={3} />
            </button>
          </div>
        );
      })
    )}
  </div>
)}

              {/* Guide */}
              <div className="mt-6 p-5 bg-slate-900 rounded-[24px] text-white space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Guide</p>
                {pageMode === 'add' ? (
                  <p className="text-xs font-bold leading-relaxed opacity-80">
                    Set Total Items → fill the form →{' '}
                    <strong className="text-white opacity-100">Save & Next</strong> to continue.<br />
                    Click <strong className="text-white opacity-100">Save & Finish</strong> on the last question to return to workspace.
                  </p>
                ) : (
                  <p className="text-xs font-bold leading-relaxed opacity-80">
                    Click a question to load it.<br />
                    <strong className="text-white opacity-100">Save Changes</strong> updates only that question — nothing else moves.<br />
                    Hover a question → click <strong className="text-white opacity-100">×</strong> to delete and renumber.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertConfig.show}
        title={alertConfig.title}
        message={alertConfig.message}
        variant={alertConfig.variant}
        onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        questionText={deleteModal.questionText}
        onClose={() => setDeleteModal({ open: false, questionId: null, idx: null, questionText: '' })}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AddQuestion;
