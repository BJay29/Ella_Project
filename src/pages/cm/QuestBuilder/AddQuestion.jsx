import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../../services/APIservice';
import { 
  ChevronLeft, Plus, Trash2, Save, Send, 
  Type, CheckCircle2, ListChecks, HelpCircle, AlertTriangle 
} from 'lucide-react';

// --- SUB-COMPONENT: CUSTOM ALERT MODAL ---
const AlertModal = ({ isOpen, onClose, message, title = "Notice" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[35px] p-8 shadow-2xl border border-gray-100 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">{title}</h3>
        <p className="text-sm text-gray-500 font-medium mt-3 leading-relaxed">
          {message}
        </p>
        <button 
          onClick={onClose}
          className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all active:scale-95"
        >
          Understood
        </button>
      </div>
    </div>
  );
};

const AddQuestion = () => {
  // Kunin ang IDs mula sa URL params
  const { questId, levelId, activityId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // --- ALERT STATE ---
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', title: '' });

  const showAlert = (message, title = "Attention") => {
    setAlertConfig({ show: true, message, title });
  };

  const [questionData, setQuestionData] = useState({
    question_text: '',
    question_type: 'multiple_choice', 
    answers: [
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false }
    ]
  });

  // --- DEBUGGING: Check if IDs exist on mount ---
  useEffect(() => {
    console.log("Current URL Params:", { questId, levelId, activityId });
    if (!activityId) {
        console.error("CRITICAL: activityId is missing from the URL!");
    }
  }, [questId, levelId, activityId]);

  // --- AUTOMATIC LAYOUT HANDLER ---
  useEffect(() => {
    if (questionData.question_type === 'true_false') {
      setQuestionData(prev => ({
        ...prev,
        answers: [
          { answer_text: 'True', is_correct: false },
          { answer_text: 'False', is_correct: false }
        ]
      }));
    } else if (questionData.question_type === 'identification') {
      setQuestionData(prev => ({
        ...prev,
        answers: [{ answer_text: '', is_correct: true }]
      }));
    } else if (questionData.question_type === 'multiple_choice') {
      if (questionData.answers.length < 2 || questionData.answers[0].answer_text === 'True') {
        setQuestionData(prev => ({
          ...prev,
          answers: [
            { answer_text: '', is_correct: false },
            { answer_text: '', is_correct: false },
            { answer_text: '', is_correct: false },
            { answer_text: '', is_correct: false }
          ]
        }));
      }
    }
  }, [questionData.question_type]);

  const addOption = () => {
    if (questionData.question_type === 'multiple_choice') {
      setQuestionData({
        ...questionData,
        answers: [...questionData.answers, { answer_text: '', is_correct: false }]
      });
    }
  };

  const setCorrectAnswer = (index) => {
    const updatedAnswers = questionData.answers.map((ans, i) => ({
      ...ans,
      is_correct: i === index
    }));
    setQuestionData({ ...questionData, answers: updatedAnswers });
  };

  const updateAnswerText = (index, val) => {
    const updated = [...questionData.answers];
    updated[index].answer_text = val;
    setQuestionData({ ...questionData, answers: updated });
  };

  const handleSave = async (shouldExit = false) => {
    // 1. Validation for UI
    if (!questionData.question_text.trim()) {
      return showAlert("Please enter a question", "Missing Info");
    }
    
    const hasCorrect = questionData.answers.some(a => a.is_correct && a.answer_text.trim() !== '');
    if (!hasCorrect) {
      return showAlert("Please provide a correct answer and mark it as correct.", "Validation Error");
    }

    // 2. Critical Validation for activityId (Para hindi mag-error sa APIService)
    if (!activityId) {
        return showAlert("Activity ID is missing. Please re-open the activity builder.", "System Error");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        question_text: questionData.question_text,
        question_type: questionData.question_type,
        answers: questionData.answers
          .filter(a => a.answer_text.trim() !== "") 
          .map((a, index) => ({
            answer_text: a.answer_text,
            is_correct: a.is_correct,
            order_index: index + 1
          }))
      };

      const res = await authAPI.addActivityQuestion(
        questId, 
        levelId, 
        activityId, 
        payload, 
        token
      );

      if (res.ok || res.status === 201) {
        if (shouldExit) {
          // DITO ANG REDIRECT: Papunta sa page kung nasaan ang mga ginawang activity content
          // Binabago nito ang view para makita ang listahan ng questions/activities
          navigate(`/cm/dashboard/quest/${questId}/level/${levelId}/activity/${activityId}`);
        } else {
          // Success Feedback at Reset Form para sa sunod na tanong
          setQuestionData({
            question_text: '',
            question_type: questionData.question_type,
            answers: questionData.question_type === 'multiple_choice' 
              ? [
                  { answer_text: '', is_correct: false }, 
                  { answer_text: '', is_correct: false },
                  { answer_text: '', is_correct: false },
                  { answer_text: '', is_correct: false }
                ]
              : questionData.question_type === 'true_false'
                ? [
                    { answer_text: 'True', is_correct: false },
                    { answer_text: 'False', is_correct: false }
                  ]
                : [{ answer_text: '', is_correct: true }]
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showAlert("Question saved successfully! You can add another one.", "Success");
        }
      } else {
        const errorData = await res.json();
        showAlert(errorData.message || 'Failed to save question', "Error");
      }
    } catch (err) {
      console.error("Save Error:", err);
      showAlert("Failed to save question. Please check your connection.", "Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto bg-white rounded-[45px] shadow-2xl shadow-indigo-100/30 border border-gray-100 overflow-hidden flex flex-col">
          
          {/* TOP BAR / HEADER */}
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-3 hover:bg-slate-50 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all active:scale-90"
              >
                <ChevronLeft size={22} />
              </button>
              <div>
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600">
                  activity builder
                </span>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-1 ml-1">Setup content for Activity</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                 <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Select Type</label>
                 <select 
                  className="bg-slate-900 text-white text-[11px] font-black uppercase px-6 py-4 rounded-[20px] outline-none shadow-xl hover:bg-black transition-all cursor-pointer"
                  value={questionData.question_type}
                  onChange={(e) => setQuestionData({...questionData, question_type: e.target.value})}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="identification">Identification</option>
                </select>
              </div>
              <div className="text-right border-l pl-4 border-gray-100 hidden md:block">
                  <h2 className="text-xl font-black text-gray-900 uppercase italic">Add Question</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Type: {questionData.question_type.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* MAIN BODY */}
          <div className="p-10 md:p-14 space-y-16">
            
            {/* QUESTION TEXT */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">
                 <Type size={14}/> Question Prompt
              </div>
              <textarea 
                className="w-full text-4xl md:text-5xl font-black tracking-tighter text-gray-900 placeholder:text-slate-100 outline-none border-none resize-none min-h-[120px] leading-[1.1] italic border-b-2 border-indigo-50 pb-6 focus:border-indigo-600 transition-all"
                placeholder="Type your question here..."
                value={questionData.question_text}
                onChange={(e) => setQuestionData({...questionData, question_text: e.target.value})}
              />
            </div>

            {/* ANSWERS SECTION */}
            <div className="space-y-6">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                  {questionData.question_type === 'identification' ? 'Expected Correct Answer' : 'Configure Choices (Mark the correct one)'}
                </label>
                <span className="text-[9px] font-bold text-indigo-400 uppercase bg-indigo-50 px-2 py-1 rounded-md">
                  {questionData.question_type === 'identification' ? 'Case Sensitive Check' : 'Click icon to set correct answer'}
                </span>
              </div>
              
              <div className={`grid gap-6 ${questionData.question_type === 'identification' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {questionData.answers.map((answer, index) => (
                  <div key={index} className={`group flex items-center gap-4 p-4 border-2 rounded-[30px] transition-all duration-300
                    ${answer.is_correct 
                      ? 'border-green-400 bg-white shadow-xl shadow-green-100/30' 
                      : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <button 
                      type="button"
                      onClick={() => setCorrectAnswer(index)}
                      className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all shadow-md active:scale-90
                        ${answer.is_correct 
                          ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                          : 'bg-white text-gray-300 border border-gray-100 group-hover:border-green-200'}`}
                    >
                      <span className="font-black text-sm">
                        {questionData.question_type === 'identification' ? <CheckCircle2 size={18}/> : String.fromCharCode(65 + index)}
                      </span>
                    </button>
                    
                    <div className="flex-1 relative pr-4">
                      <input 
                        type="text"
                        readOnly={questionData.question_type === 'true_false'}
                        className={`w-full bg-transparent p-2 font-bold text-lg text-gray-700 outline-none
                          ${questionData.question_type === 'true_false' ? 'cursor-default opacity-80' : ''}`}
                        placeholder={questionData.question_type === 'identification' ? "Type the correct answer..." : `Option ${String.fromCharCode(65 + index)}`}
                        value={answer.answer_text}
                        onChange={(e) => updateAnswerText(index, e.target.value)}
                      />
                      
                      {questionData.question_type === 'multiple_choice' && questionData.answers.length > 2 && (
                        <button 
                          type="button"
                          onClick={() => setQuestionData({...questionData, answers: questionData.answers.filter((_, i) => i !== index)})}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    {answer.is_correct && <CheckCircle2 size={22} className="text-green-500 mr-2 animate-in zoom-in" />}
                  </div>
                ))}
              </div>

              {/* ADD OPTION BUTTON */}
              {questionData.question_type === 'multiple_choice' && (
                <button 
                  type="button"
                  onClick={addOption}
                  className="w-full mt-4 flex items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-100 rounded-[30px] text-slate-300 font-black uppercase text-[11px] tracking-widest hover:border-indigo-200 hover:text-indigo-400 hover:bg-white transition-all group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  Add Choice
                </button>
              )}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-8 md:p-10 bg-slate-50/80 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                 {loading ? 'Processing Server...' : 'Ready to save'}
               </p>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto">
              {/* BUTTON 1: FINISH & EXIT (Mag-re-redirect sa listahan) */}
              <button 
                type="button"
                onClick={() => handleSave(true)}
                disabled={loading}
                className="flex-1 sm:flex-none px-10 py-5 bg-white border border-slate-200 rounded-[24px] font-black text-[11px] uppercase text-slate-500 hover:bg-white hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Save size={16}/> Finish & Exit
              </button>
              
              {/* BUTTON 2: SAVE & NEXT (Mag-re-reset lang para sa bagong question) */}
              <button 
                type="button"
                onClick={() => handleSave(false)}
                disabled={loading}
                className="flex-1 sm:flex-none px-12 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-[11px] uppercase shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? 'Saving...' : 'Save & Next Question'} <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM ALERT MODAL */}
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