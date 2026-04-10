import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../../services/APIservice';
import { 
  ChevronLeft, Plus, Trash2, Save, Send, 
  Type, CheckCircle2, ListChecks, HelpCircle, AlertTriangle, FileText,
  Settings2, Layout, Info
} from 'lucide-react';
import QuestionForm from './QuestionForm';

const AlertModal = ({ isOpen, onClose, message, title = "Notice" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          {message}
        </p>
        <button 
          type="button" 
          onClick={onClose}
          className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all active:scale-95"
        >
          Understood
        </button>
      </div>
    </div>
  );
};

const AddQuestion = () => {
  const { questId, levelId, activityId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', title: '' });

  // --- NEW STATES FOR DYNAMIC LIMIT ---
  const [totalQuestions, setTotalQuestions] = useState(10); // Default is 10, but user can change it
  const [currentStep, setCurrentStep] = useState(1);
  // -------------------------------------

  const showAlert = (message, title = "Attention") => {
    setAlertConfig({ show: true, message, title });
  };

  const [questionData, setQuestionData] = useState({
    question_text: '',
    question_type: 'multiple_choice', 
    answers: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ]
  });

  useEffect(() => {
    if (questionData.question_type === 'true_false') {
      setQuestionData(prev => ({
        ...prev,
        answers: [
          { text: 'True', is_correct: false },
          { text: 'False', is_correct: false }
        ]
      }));
    } else if (['identification', 'fill_in_the_blanks'].includes(questionData.question_type)) {
      setQuestionData(prev => ({
        ...prev,
        answers: [{ text: '', is_correct: true }]
      }));
    } else if (questionData.question_type === 'essay') {
      setQuestionData(prev => ({
        ...prev,
        answers: [] 
      }));
    } else if (questionData.question_type === 'multiple_choice') {
      setQuestionData(prev => ({
        ...prev,
        answers: [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ]
      }));
    }
  }, [questionData.question_type]);

  const handleSave = async (shouldExit = false) => {
    if (!questionData.question_text.trim()) {
      return showAlert("Please enter a question", "Missing Info");
    }
    
    if (questionData.question_type !== 'essay') {
      const validAnswers = questionData.answers.filter(a => a.text.trim() !== "");
      if (validAnswers.length === 0) {
        return showAlert("Please provide at least one answer.", "Validation Error");
      }
      const hasCorrect = validAnswers.some(a => a.is_correct);
      if (!hasCorrect) {
        return showAlert("Please mark one answer as the correct one.", "Validation Error");
      }
    }

    if (!activityId) {
      return showAlert("Activity ID is missing. Please re-open the activity builder.", "System Error");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const finalAnswers = questionData.answers
        .filter(a => a.text.trim() !== "") 
        .map((a, index) => ({
          answer_text: a.text.trim(),
          is_correct: a.is_correct,
          order_index: index + 1
        }));

      const payload = {
        question_text: questionData.question_text.trim(),
        question_type: questionData.question_type,
        answers: finalAnswers
      };

      const res = await authAPI.addActivityQuestion(questId, levelId, activityId, payload, token);

      if (res.ok || res.status === 201) {
        if (shouldExit) {
          navigate(`/cm/dashboard/quest/${questId}`);
        } else {
          // --- LOGIC PARA SA NEXT STEP ---
          if (currentStep < totalQuestions) {
            setCurrentStep(prev => prev + 1);
          }
          
          setQuestionData(prev => ({
            ...prev,
            question_text: '',
            answers: prev.question_type === 'multiple_choice' ? [
              { text: '', is_correct: false }, { text: '', is_correct: false },
              { text: '', is_correct: false }, { text: '', is_correct: false }
            ] : prev.question_type === 'true_false' ? [
              { text: 'True', is_correct: false }, { text: 'False', is_correct: false }
            ] : prev.question_type === 'essay' ? [] : [{ text: '', is_correct: true }]
          }));
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showAlert("Question saved successfully!", "Success");
        }
      } else {
        const errorData = await res.json();
        showAlert(errorData.message || 'Failed to save question', "Error");
      }
    } catch (err) {
      showAlert("Failed to save question. Please check your connection.", "Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-900">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium text-sm"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Workshop
          </button>

          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Layout size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">Question Designer</h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configure your activity content</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <label className="pl-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode:</label>
                <select 
                  className="bg-white text-slate-700 text-sm font-bold px-5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer shadow-sm"
                  value={questionData.question_type}
                  onChange={(e) => setQuestionData({...questionData, question_type: e.target.value})}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="identification">Identification</option>
                  <option value="fill_in_the_blanks">Fill in the Blanks</option>
                  <option value="essay">Essay Type</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 p-8 md:p-12 border-r border-slate-100">
                <QuestionForm 
                    questionText={questionData.question_text}
                    setQuestionText={(val) => setQuestionData({...questionData, question_text: val})}
                    questionType={questionData.question_type}
                    answers={questionData.answers}
                    setAnswers={(val) => setQuestionData({...questionData, answers: val})}
                    onSaveNext={() => handleSave(false)}
                    onFinish={() => handleSave(true)}
                    isSubmitting={loading}
                    // IPINASA NATIN ANG MGA BAGONG PROPS DITO
                    currentStep={currentStep}
                    totalQuestions={totalQuestions}
                    setTotalQuestions={setTotalQuestions}
                />
              </div>

              <div className="lg:col-span-4 p-8 bg-slate-50/50">
                <div className="sticky top-8 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-slate-800">
                      <Settings2 size={18} className="text-indigo-500" />
                      <span className="font-black text-[11px] uppercase tracking-widest">Designer Guidelines</span>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm space-y-5">
                      <div className="flex gap-4">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <Info size={14} className="text-indigo-500" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          For <strong className="text-slate-900">Fill in the Blanks</strong>, use underscores (___) where you want the blank to appear.
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Mark exactly one correct answer for auto-graded questions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-[24px] bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                    <h4 className="font-black text-[10px] uppercase tracking-widest opacity-70 mb-2">Sync Status</h4>
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                      <span className="text-sm font-bold">
                        {loading ? 'Uploading Data...' : 'Ready to Save'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertModal 
        isOpen={alertConfig.show} 
        title={alertConfig.title}
        message={alertConfig.message} 
        onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
      />
    </>
  );
};

export default AddQuestion;