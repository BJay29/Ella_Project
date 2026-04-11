import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../../services/APIservice';
import {
  ChevronLeft, Plus, Trash2, ListChecks,
  AlertTriangle, Layout, ChevronRight, CheckCircle2, X
} from 'lucide-react';
import QuestionForm from './QuestionForm';

// ─────────────────────────────────────────────────────────────────────────────
const AlertModal = ({ isOpen, onClose, message, title = 'Notice' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 text-center">
        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{message}</p>
        <button type="button" onClick={onClose}
          className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all active:scale-95">
          Understood
        </button>
      </div>
    </div>
  );
};

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

const mapApiQuestion = (q) => ({
  id:             q.id             || q.question_id  || null,
  question_text: q.question_text || '',
  question_type: q.question_type || 'multiple_choice',
  answers: (q.answers || []).map((a) => ({
    id:          a.id          || a.answer_id  || null,
    text:       a.answer_text || a.text      || '',
    is_correct: !!a.is_correct,
  })),
});

// ─────────────────────────────────────────────────────────────────────────────
const AddQuestion = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { questId, levelId, activityId, quizId } = useParams();

  const contentType  = quizId ? 'quiz' : 'activity';
  const finalContentId = quizId || activityId;

  const [loading,         setLoading]         = useState(false);
  const [alertConfig,     setAlertConfig]     = useState({ show: false, message: '', title: '' });
  const [totalQuestions, setTotalQuestions] = useState(1);
  const [currentStep,     setCurrentStep]     = useState(1);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [initialized,     setInitialized]     = useState(false);

  const skipEffectRef = useRef(false);

  const [questionData, setQuestionData] = useState({
    id:             null,
    question_text: '',
    question_type: 'multiple_choice',
    answers:       buildBlankAnswers('multiple_choice'),
  });

  const showAlert = (message, title = 'Attention') =>
    setAlertConfig({ show: true, message, title });

  const handleBackToWorkshop = () => {
    if (questId && levelId) {
      navigate(`/cm/dashboard/quest/${questId}/level/${levelId}`);
    } else if (questId) {
      navigate(`/cm/dashboard/quest/${questId}`);
    } else {
      navigate('/cm/dashboard');
    }
  };

  const fetchQuestions = useCallback(async (isInitialLoad = false) => {
    if (!questId || !levelId || !finalContentId) return;
    try {
      const token = localStorage.getItem('token');
      const res   = contentType === 'quiz'
        ? await authAPI.getQuizQuestions(questId, levelId, finalContentId, token)
        : await authAPI.getActivityQuestions(questId, levelId, finalContentId, token);

      if (res.ok) {
        const raw = await res.json();
        const arr = Array.isArray(raw) ? raw : (raw.questions || []);
        setSavedQuestions(arr);

        // Keep totalQuestions consistent with what the user set or the current length
        if (isInitialLoad) {
           setTotalQuestions(Math.max(1, arr.length > 0 ? arr.length : 1));
           setInitialized(true);
        }
      }
    } catch (err) {
      console.error('fetchQuestions error:', err);
    }
  }, [questId, levelId, finalContentId, contentType]);

  useEffect(() => { fetchQuestions(true); }, [fetchQuestions]);

  // FIX: Reset form logic when moving to a new step that doesn't exist yet
  useEffect(() => {
    if (!initialized) return;
    if (skipEffectRef.current) return;

    const existing = savedQuestions[currentStep - 1];
    if (existing) {
      setQuestionData(mapApiQuestion(existing));
    } else {
      // CLEAR FORM for new question slots
      setQuestionData({
        id:             null,
        question_text: '',
        question_type: 'multiple_choice',
        answers:       buildBlankAnswers('multiple_choice'),
      });
    }
  }, [currentStep, savedQuestions, initialized]);

  const goToStep = (step) => {
    if (step < 1) return;
    skipEffectRef.current = false;
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (shouldExit = false) => {
    const { id, question_text, question_type, answers } = questionData;

    if (!question_text.trim()) return showAlert('Please enter a question.', 'Missing Info');

    skipEffectRef.current = true;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const finalAnswers = question_type === 'essay' ? [] : answers
        .filter((a) => (a.text || '').trim() !== '')
        .map((a, i) => ({
          answer_text: a.text.trim(),
          is_correct: a.is_correct,
          order_index: i + 1,
        }));

      const payload = { question_text: question_text.trim(), question_type, answers: finalAnswers };

      let res;
      if (contentType === 'quiz') {
        res = id
          ? await authAPI.updateQuizQuestion(questId, levelId, finalContentId, id, payload, token)
          : await authAPI.addQuizQuestion(questId, levelId, finalContentId, payload, token);
      } else {
        res = id
          ? await authAPI.updateActivityQuestion(questId, levelId, finalContentId, id, payload, token)
          : await authAPI.addActivityQuestion(questId, levelId, finalContentId, payload, token);
      }

      if (res.ok || res.status === 201) {
        const savedResult = await res.json();
        await fetchQuestions(false);

        if (shouldExit) {
          handleBackToWorkshop(); 
          return;
        }

        if (id) {
          // EDIT MODE: Stay on the same question, just show alert
          showAlert('Question updated successfully!', 'Saved');
        } else {
          // ADD MODE: Move to next if within limit
          if (currentStep < totalQuestions) {
            setCurrentStep(currentStep + 1);
          } else {
            showAlert('Item limit reached. You can click Finish to exit.', 'Limit Reached');
          }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } else {
        const errData = await res.json().catch(() => ({}));
        showAlert(errData.message || 'Failed to save question.', 'Error');
      }
    } catch (err) {
      showAlert('Network error. Please try again.', 'Error');
    } finally {
      setLoading(false);
      skipEffectRef.current = false;
    }
  };

  const handleDelete = async (targetId = null) => {
    const idToDelete = targetId || questionData.id;
    if (!idToDelete) return showAlert("This question hasn't been saved yet.", 'Nothing to Delete');
    if (!window.confirm('Delete this question from database? This cannot be undone.')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = contentType === 'quiz'
        ? await authAPI.deleteQuizQuestion(questId, levelId, finalContentId, idToDelete, token)
        : await authAPI.deleteActivityQuestion(questId, levelId, finalContentId, idToDelete, token);
      
      if (res.ok) {
        await fetchQuestions(false);
        // Automatically reorder: go to previous question or stay at 1
        const nextStep = Math.max(1, currentStep - 1);
        goToStep(nextStep);
      } else { 
        showAlert('Failed to delete from database.', 'Error'); 
      }
    } catch { 
      showAlert('Network error.', 'Error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const isQuiz      = contentType === 'quiz';
  const accentColor = isQuiz ? 'rose' : 'amber';
  const typeLabel   = isQuiz ? 'Quiz' : 'Activity';
  const headerEmoji = isQuiz ? '🏆' : '📝';
  const headerBg    = isQuiz ? 'bg-rose-50' : 'bg-amber-50';

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between mb-6">
          <button onClick={handleBackToWorkshop}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all">
            <ChevronLeft size={18} /> Back to Workshop
          </button>
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
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
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {questionData.id ? 'Editing Saved Question' : `Adding Question ${currentStep}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-8 p-8 md:p-12 border-r border-slate-100">
              <QuestionForm
                questionText={questionData.question_text}
                setQuestionText={(val) => setQuestionData((prev) => ({ ...prev, question_text: val }))}
                questionType={questionData.question_type}
                setQuestionType={(val) => {
                  if (questionData.id) return;
                  setQuestionData((prev) => ({ ...prev, question_type: val, answers: buildBlankAnswers(val) }));
                }}
                answers={questionData.answers}
                setAnswers={(val) => setQuestionData((prev) => ({ ...prev, answers: val }))}
                onSaveNext={() => handleSave(false)}
                onFinish={() => handleSave(true)}
                onBack={() => goToStep(currentStep - 1)}
                isSubmitting={loading}
                currentStep={currentStep}
                totalQuestions={totalQuestions}
                setTotalQuestions={(val) => setTotalQuestions(Math.max(1, val))}
                isExistingQuestion={!!questionData.id}
                themeColor={accentColor}
              />
            </div>

            <div className="lg:col-span-4 p-8 bg-slate-50/50 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="font-black text-[11px] uppercase tracking-widest text-slate-700">Question Stack</span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-indigo-600">
                  {savedQuestions.length} Saved
                </span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {savedQuestions.map((q, idx) => {
                  const stepNum  = idx + 1;
                  const isActive = currentStep === stepNum;
                  return (
                    <div key={q.id || q.question_id || idx} className="relative group">
                      <button onClick={() => goToStep(stepNum)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                          isActive ? 'bg-white border-indigo-500 shadow-md' : 'bg-white border-transparent hover:border-slate-200'
                        }`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className={`text-[10px] font-black w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                          }`}>{stepNum}</span>
                          <span className="truncate text-xs font-bold text-slate-600">{q.question_text || 'Untitled'}</span>
                        </div>
                        <ChevronRight size={14} className={isActive ? 'text-indigo-500' : 'text-slate-300'} />
                      </button>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(q.id || q.question_id); }}
                        className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  );
                })}

                {savedQuestions.length < totalQuestions && (
                  <button
                    onClick={() => goToStep(savedQuestions.length + 1)}
                    className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest ${
                      currentStep > savedQuestions.length ? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Plus size={14} /> New Question
                  </button>
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
        onClose={() => setAlertConfig((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default AddQuestion;