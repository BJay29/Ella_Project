import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';
import { Type, ArrowRight, CheckCircle2, AlertTriangle, X } from 'lucide-react';
// IMPORT THE NEW COMPONENT
import QuestionForm from './QuestionForm';

const AlertModal = ({ isOpen, onClose, message, title = "Notice" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-sm:max-w-xs max-w-sm rounded-[35px] p-8 shadow-2xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">{title}</h3>
        <p className="text-sm text-gray-500 font-medium mt-3 leading-relaxed">{message}</p>
        <button type="button" onClick={onClose}
          className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all active:scale-95">
          Understood
        </button>
      </div>
    </div>
  );
};

const ActivityCreator = ({ isOpen, onClose, questId, quest_level_id, existingActivity, mode = 'save-info', onActivityCreated, onSuccess }) => {
  const [formData, setFormData] = useState({ title: '', difficulty: 'Easy', passing_score: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityId, setActivityId] = useState(null);
  
  // --- UPDATED STATES FOR UNLIMITED/DYNAMIC QUESTIONS ---
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10); // User can change this in QuestionForm
  // ------------------------------------------------------
  
  // States for Question Data (to be passed to QuestionForm)
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [answers, setAnswers] = useState([
    { text: '', is_correct: false }, { text: '', is_correct: false },
    { text: '', is_correct: false }, { text: '', is_correct: false }
  ]);
  const [errorModal, setErrorModal] = useState({ show: false, message: '', title: '' });

  const [currentStep, setCurrentStep] = useState('form');

  useEffect(() => {
    if (!isOpen) return;
    
    const actId = existingActivity?.activity_id || existingActivity?.id || existingActivity?._id;
    
    if (mode === 'save-info') {
      setCurrentStep('form');
      if (existingActivity) {
        setActivityId(actId);
        setFormData({
          title: existingActivity?.title || '',
          difficulty: existingActivity?.difficulty || 'Easy',
          passing_score: existingActivity?.passing_score || ''
        });
      } else {
        setActivityId(null);
        setFormData({ title: '', difficulty: 'Easy', passing_score: '' });
      }
      setCurrentQuestionNumber(1);
      resetQuestion();
    } 
    else if (mode === 'edit-questions' || mode === 'add-questions') {
      setCurrentStep('questions');
      setActivityId(actId);
      if (existingActivity) {
        setFormData({
          title: existingActivity?.title || '',
          difficulty: existingActivity?.difficulty || 'Easy',
          passing_score: existingActivity?.passing_score || ''
        });
      }
      setCurrentQuestionNumber(1);
      resetQuestion();
    }
  }, [isOpen, mode, existingActivity]);

  useEffect(() => {
    if (questionType === 'true_false') {
      setAnswers([{ text: 'True', is_correct: false }, { text: 'False', is_correct: false }]);
    } else if (questionType === 'multiple_choice') {
      setAnswers([{ text: '', is_correct: false }, { text: '', is_correct: false },
        { text: '', is_correct: false }, { text: '', is_correct: false }]);
    } else if (questionType === 'identification' || questionType === 'fill_in_the_blanks') {
      setAnswers([{ text: '', is_correct: true }]); 
    }
  }, [questionType]);

  const resetQuestion = () => {
    setQuestionText("");
    if (questionType === 'multiple_choice') {
        setAnswers([
            { text: '', is_correct: false }, { text: '', is_correct: false },
            { text: '', is_correct: false }, { text: '', is_correct: false }
        ]);
    } else if (questionType === 'true_false') {
        setAnswers([{ text: 'True', is_correct: false }, { text: 'False', is_correct: false }]);
    } else {
        setAnswers([{ text: '', is_correct: true }]);
    }
  };

  const handleSaveInfo = async () => {
    if (isSubmitting) return;
    if (!formData.title.trim() || !formData.passing_score) {
      setErrorModal({ show: true, title: "Missing Info", message: "Please fill up all fields." });
      return;
    }

    if (!quest_level_id) {
        setErrorModal({ show: true, title: "Configuration Error", message: "Level ID is missing. Please close and try again." });
        return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const payload = {
        title: formData.title.trim(),
        difficulty: formData.difficulty.toLowerCase(),
        passing_score: parseInt(formData.passing_score, 10)
      };
      
      let res;
      if (activityId) {
        res = await authAPI.updateActivity(questId, quest_level_id, activityId, payload, token);
      } else {
        res = await authAPI.createActivity(questId, quest_level_id, payload, token);
      }
      
      const data = await res.json();
      
      if (res.ok || res.status === 201 || res.status === 200) {
        const newId = data.activity_id || data.id || activityId;
        if (newId) setActivityId(newId);

        if (onActivityCreated) await onActivityCreated();
        if (onSuccess) await onSuccess(); 
        
        setCurrentStep('questions'); 
      } else {
        setErrorModal({ show: true, title: "Error", message: data.message || 'Action failed.' });
      }
    } catch (err) {
      console.error("Save Info Error:", err);
      setErrorModal({ show: true, title: "Connection Error", message: "Failed to connect to server." });
    } finally { setIsSubmitting(false); }
  };

  const handleSaveQuestion = async (isNext) => {
    if (!questionText.trim()) {
      setErrorModal({ show: true, title: "Empty Question", message: "Please enter a question." }); return;
    }

    const hasCorrect = answers.some(a => a.is_correct && a.text.trim() !== "");
    if (!hasCorrect && (questionType === 'multiple_choice' || questionType === 'true_false')) {
      setErrorModal({ show: true, title: "Validation Error", message: "Please mark one correct answer." }); return;
    }

    if (['identification', 'fill_in_the_blanks'].includes(questionType) && !answers[0].text.trim()) {
      setErrorModal({ show: true, title: "Validation Error", message: "Please provide the correct answer text." }); return;
    }
    
    if (!activityId) {
      setErrorModal({ show: true, title: "Error", message: "Activity ID missing. Try refreshing the workspace." }); return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const processedAnswers = answers
        .filter(a => a.text.trim() !== "")
        .map((a, index) => ({
          answer_text: a.text.trim(),
          is_correct: (questionType === 'identification' || questionType === 'fill_in_the_blanks') ? true : a.is_correct,
          order_index: index + 1
        }));

      const questionPayload = {
        question_text: questionText.trim(),
        question_type: questionType,
        answers: processedAnswers
      };

      const res = await authAPI.addActivityQuestion(questId, quest_level_id, activityId, questionPayload, token);
      
      if (res.ok || res.status === 201) {
        if (onActivityCreated) await onActivityCreated();
        if (onSuccess) await onSuccess();

        if (isNext) {
          // --- FIXED LOGIC: CHECK AGAINST DYNAMIC totalQuestions FROM STATE ---
          if (currentQuestionNumber >= totalQuestions) {
            setErrorModal({ show: true, title: "Limit Reached", message: `Max ${totalQuestions} questions reached as set.` }); return;
          }
          resetQuestion();
          setCurrentQuestionNumber(prev => prev + 1);
        } else {
          onClose();
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorModal({ show: true, title: "Save Failed", message: errData.message || "Failed to save question." });
      }
    } catch (error) {
      console.error("Save Question Error:", error);
      setErrorModal({ show: true, title: "Error", message: "Error saving question." });
    } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">

        {/* ── STEP 1: Save Info Form ── */}
        {currentStep === 'form' && (
          <div className="bg-white w-full max-w-md rounded-[45px] p-10 shadow-2xl animate-in zoom-in duration-200 relative">
            <button onClick={onClose} className="absolute right-8 top-8 text-slate-300 hover:text-rose-500 transition-colors">
              <X size={24}/>
            </button>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black uppercase italic text-gray-900 tracking-tighter">
                {activityId ? '📝 Edit Activity' : '🚀 Create Activity'}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Setup basic info</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Activity Title</label>
                <input
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm font-bold focus:ring-2 ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. Vocabulary Practice"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Difficulty</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm font-bold outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Passing Score</label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 ring-indigo-500 transition-all"
                    placeholder="7"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({...formData, passing_score: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose}
                  className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase text-gray-400 border border-gray-100 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveInfo} disabled={isSubmitting}
                  className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-gray-300">
                  {isSubmitting ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Question Creator (USING QuestionForm) ── */}
        {currentStep === 'questions' && (
          <div className="bg-white w-full max-w-5xl rounded-[45px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300 border border-gray-100">
            {/* Header */}
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button type="button" onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                  <X size={20}/>
                </button>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-600">
                    Question {currentQuestionNumber} of {totalQuestions}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}
                  className="bg-slate-900 text-[11px] font-black uppercase text-white px-6 py-3 rounded-2xl outline-none hover:bg-black transition-colors cursor-pointer">
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="identification">Identification</option>
                  <option value="fill_in_the_blanks">Fill in the Blanks</option>
                </select>
                <div className="text-right border-l pl-4 border-gray-100">
                  <h2 className="text-xl font-black text-gray-900 uppercase italic leading-none">
                    {mode === 'edit-questions' ? 'Edit Questions' : 'Add Question'}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{formData.title}</p>
                </div>
              </div>
            </div>

            {/* Body - Integrated with QuestionForm */}
            <div className="p-10 md:p-14 overflow-y-auto bg-white">
                <QuestionForm 
                  questionText={questionText}
                  setQuestionText={setQuestionText}
                  questionType={questionType}
                  answers={answers}
                  setAnswers={setAnswers}
                  onSaveNext={() => handleSaveQuestion(true)}
                  onFinish={() => handleSaveQuestion(false)}
                  isSubmitting={isSubmitting}
                  // PASSED DYNAMIC STATES
                  currentStep={currentQuestionNumber}
                  totalQuestions={totalQuestions}
                  setTotalQuestions={setTotalQuestions}
                />
            </div>
          </div>
        )}
      </div>

      <AlertModal 
        isOpen={errorModal.show} 
        title={errorModal.title} 
        message={errorModal.message}
        onClose={() => setErrorModal({ show: false, message: '', title: '' })} 
      />
    </>
  );
};

export default ActivityCreator;