import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../../services/APIservice';
import { ChevronLeft, Plus, Type, ArrowRight, Save, CheckCircle2, Trash2, ListChecks, AlertTriangle } from 'lucide-react';

// --- SUB-COMPONENT: CUSTOM ALERT MODAL ---
const AlertModal = ({ isOpen, onClose, message, title = "Quiz Limit Reached" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[35px] p-8 shadow-2xl border border-gray-100 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">{title}</h3>
        <p className="text-sm text-gray-500 font-medium mt-3 leading-relaxed">
          {message || "This level already has an existing quiz. You cannot create another one."}
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

const QuizCreator = ({ isOpen, onClose, questId, levelId, onSuccess }) => {
  const navigate = useNavigate();

  // --- STATES ---
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    passing_score: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); 
  const [newQuizId, setNewQuizId] = useState(null);

  // --- ADDED: QUESTION COUNTER STATES ---
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const MAX_QUESTIONS = 10;

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [answers, setAnswers] = useState([
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false }
  ]);

  // --- MODAL ERROR STATE ---
  const [errorModal, setErrorModal] = useState({ show: false, message: '', title: '' });

  // --- AUTO-LAYOUT LOGIC ---
  useEffect(() => {
    if (questionType === 'true_false') {
      setAnswers([
        { text: 'True', is_correct: false },
        { text: 'False', is_correct: false }
      ]);
    } else if (questionType === 'multiple_choice') {
      setAnswers([
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ]);
    } else if (questionType === 'identification' || questionType === 'fill_in_the_blanks') {
      setAnswers([{ text: '', is_correct: true }]);
    }
  }, [questionType]);

  if (!isOpen) return null;

  // --- STEP 1: CREATE QUIZ ---
  const handleSave = async () => {
    if (isSubmitting) return;
    
    if (!formData.title.trim() || !formData.passing_score) {
      setErrorModal({ show: true, title: "Missing Info", message: "Please fill up all fields." });
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const payload = {
        title: formData.title,
        difficulty: formData.difficulty.toLowerCase(),
        passing_score: parseInt(formData.passing_score, 10) 
      };

      const res = await authAPI.createQuiz(questId, levelId, payload, token);
      const data = await res.json();
      
      console.log("Full Backend Response:", data);

      if (res.ok || res.status === 201) {
        const quizId = data?.quiz?.quiz_id || data?.quiz_id || data?.id || data?.data?.id;
        
        if (!quizId) {
          console.error("ID extraction failed from response:", data);
          setErrorModal({ show: true, title: "Error", message: "Quiz created but ID extraction failed." });
          return;
        }

        setNewQuizId(quizId);
        setStep(2); 
      } else {
        setErrorModal({ 
          show: true, 
          title: "Quiz Limit Reached",
          message: data.message || 'This level already has a quiz.' 
        });
      }
    } catch (err) { 
      console.error("Create Quiz Error:", err);
      setErrorModal({ show: true, title: "Connection Error", message: "Connection Error. Please check your backend." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- STEP 2: ADD QUESTIONS ---
  const handleSaveQuestion = async (isNext) => {
    if (!questionText.trim()) {
      setErrorModal({ show: true, title: "Empty Question", message: "Please enter a question text." });
      return;
    }

    const hasCorrect = answers.some(a => a.is_correct && a.text.trim() !== "");
    if (!hasCorrect) {
      setErrorModal({ show: true, title: "No Correct Answer", message: "Please mark one correct answer before saving." });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const questionPayload = {
        question_text: questionText,
        question_type: questionType,
        answers: answers
          .filter(a => a.text.trim() !== "")
          .map((a, index) => ({
            answer_text: a.text,
            is_correct: a.is_correct,
            order_index: index + 1
          }))
      };

      const res = await authAPI.addQuizQuestion(questId, levelId, newQuizId, questionPayload, token);

      if (res.ok || res.status === 201) {
        if (isNext) {
<<<<<<< HEAD
          // --- CHECK MAX LIMIT ---
=======
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
          if (currentQuestionNumber >= MAX_QUESTIONS) {
            setErrorModal({
              show: true,
              title: "Limit Reached",
              message: "You have reached the maximum of 10 questions. Please click 'Finish & Save' to complete the quiz."
            });
            return;
          }

<<<<<<< HEAD
          // RESET PARA SA NEXT QUESTION
=======
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
          setQuestionText("");
          if (questionType === 'true_false') {
            setAnswers([{ text: 'True', is_correct: false }, { text: 'False', is_correct: false }]);
          } else if (questionType === 'identification' || questionType === 'fill_in_the_blanks') {
            setAnswers([{ text: '', is_correct: true }]);
          } else {
            setAnswers([
              { text: '', is_correct: false }, { text: '', is_correct: false },
              { text: '', is_correct: false }, { text: '', is_correct: false }
            ]);
          }
          
<<<<<<< HEAD
          // --- UPDATE COUNTER ---
=======
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
          setCurrentQuestionNumber(prev => prev + 1);
        } else {
          if (onSuccess) onSuccess(newQuizId);
          onClose();
          navigate(`/cm/dashboard/quest/${questId}`);
        }
      } else {
        const errData = await res.json();
        setErrorModal({ show: true, title: "Save Failed", message: errData.message || "Failed to save question." });
      }
    } catch (error) {
      console.error("Add Question Error:", error);
      setErrorModal({ show: true, title: "Error", message: "An unexpected error occurred while saving." });
    }
  };

  const toggleCorrectAnswer = (index) => {
    const updated = answers.map((ans, i) => ({
      ...ans,
      is_correct: i === index
    }));
    setAnswers(updated);
  };

  const updateAnswerText = (index, val) => {
    const updated = [...answers];
    updated[index].text = val;
    setAnswers(updated);
  };

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
        
        {/* STEP 1: INITIAL QUIZ INFO */}
        {step === 1 && (
          <div className="bg-white w-full max-w-md rounded-[32px] p-10 shadow-2xl animate-in zoom-in duration-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black uppercase italic text-gray-900 tracking-tighter">
                🚀 Create Quiz
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Step 1 of 2: Setup basic info</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quiz Title</label>
                <input 
<<<<<<< HEAD
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-indigo-500 outline-none transition-all"
=======
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 ring-indigo-500 outline-none transition-all"
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
                  placeholder="e.g. Grammar Mastery Test"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Difficulty</label>
                  <select 
<<<<<<< HEAD
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none cursor-pointer hover:bg-gray-100 transition-colors"
=======
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Passing Score</label>
                  <input 
                    type="number" 
<<<<<<< HEAD
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none"
=======
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none"
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
                    placeholder="7"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({...formData, passing_score: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase text-gray-400 border border-gray-100 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-gray-300"
                >
                  {isSubmitting ? 'Saving...' : 'Next: Add Questions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BUILDER INTERFACE */}
        {step === 2 && (
          <div className="bg-white w-full max-w-4xl rounded-[45px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-gray-100">
            
            {/* Header */}
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                  <ChevronLeft size={20}/>
                </button>
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-600">
                  Question {currentQuestionNumber} of {MAX_QUESTIONS}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <select 
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="bg-slate-900 text-[11px] font-black uppercase text-white px-6 py-3 rounded-2xl outline-none hover:bg-black transition-colors"
                >
<<<<<<< HEAD
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="identification">Identification</option>
                  <option value="fill_in_the_blanks">Fill in the Blanks</option>
=======
                  <option value="multiple_choice" className="bg-white text-gray-900">Multiple Choice</option>
                  <option value="true_false" className="bg-white text-gray-900">True / False</option>
                  <option value="identification" className="bg-white text-gray-900">Identification</option>
                  <option value="fill_in_the_blanks" className="bg-white text-gray-900">Fill in the Blanks</option>
>>>>>>> 2ca6c40983cd11eb31d2709ddb89b6a426ac70e1
                </select>
                <div className="text-right border-l pl-4 border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 uppercase italic">Add Question</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Target: {formData.title}</p>
                </div>
              </div>
            </div>

            {/* Builder Body */}
            <div className="p-10 md:p-14 overflow-y-auto space-y-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest ml-1">
                    <Type size={14}/> Question Text
                </div>
                <textarea 
                  className="w-full text-4xl font-black tracking-tighter text-gray-900 placeholder:text-slate-100 outline-none border-none resize-none min-h-[100px] leading-[1.1] italic border-b-2 border-rose-50 pb-4 focus:border-rose-400 transition-all"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={questionType === 'fill_in_the_blanks' ? "Use ___ for the gap..." : "Type the question here..."}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">
                  {['identification', 'fill_in_the_blanks'].includes(questionType) ? 'Correct Answer' : 'Choices (Check the circle for the correct one)'}
                </label>
                
                <div className={`grid gap-6 ${['identification', 'fill_in_the_blanks'].includes(questionType) ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {(!['identification', 'fill_in_the_blanks'].includes(questionType)) ? (
                    answers.map((ans, idx) => (
                      <div key={idx} className={`group flex items-center gap-4 p-4 border-2 rounded-[30px] transition-all
                        ${ans.is_correct ? 'border-green-400 bg-white shadow-xl shadow-green-100/30' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}>
                        <button 
                          type="button"
                          onClick={() => toggleCorrectAnswer(idx)}
                          className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all ${ans.is_correct ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-300 border border-gray-100 hover:border-green-300'}`}
                        >
                          <span className="font-black text-sm">{String.fromCharCode(65 + idx)}</span>
                        </button>
                        <input 
                          className="flex-1 bg-transparent p-2 font-bold text-lg text-gray-700 outline-none" 
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          value={ans.text}
                          readOnly={questionType === 'true_false'}
                          onChange={(e) => updateAnswerText(idx, e.target.value)}
                        />
                        {ans.is_correct && <CheckCircle2 size={22} className="text-green-500 mr-2" />}
                      </div>
                    ))
                  ) : (
                    <div className="space-y-4">
                      <input 
                        type="text"
                        placeholder="Type the exact correct answer here..."
                        className="w-full bg-slate-50 border-2 border-dashed border-rose-100 rounded-[28px] p-8 font-black text-2xl text-rose-600 outline-none text-center focus:border-rose-400 focus:bg-white transition-all"
                        value={answers[0].text}
                        onChange={(e) => updateAnswerText(0, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-8 bg-slate-50/50 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0 z-10">
              <button onClick={onClose} className="px-8 py-5 font-black uppercase text-[11px] tracking-widest text-gray-400 hover:text-gray-600 transition-colors">
                Discard
              </button>
              <button 
                onClick={() => handleSaveQuestion(false)}
                className="px-10 py-5 bg-gray-900 text-white rounded-[24px] font-black uppercase text-[11px] tracking-widest hover:bg-black transition-all active:scale-95"
              >
                Finish & Save
              </button>
              <button 
                onClick={() => handleSaveQuestion(true)}
                disabled={currentQuestionNumber >= MAX_QUESTIONS}
                className={`px-10 py-5 rounded-[24px] font-black uppercase text-[11px] tracking-widest shadow-2xl transition-all flex items-center gap-2 
                  ${currentQuestionNumber >= MAX_QUESTIONS ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95'}`}
              >
                Save & Add Next <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RENDER CUSTOM ALERT MODAL */}
      <AlertModal 
        isOpen={errorModal.show} 
        title={errorModal.title}
        message={errorModal.message} 
        onClose={() => setErrorModal({ show: false, message: '', title: '' })} 
      />
    </>
  );
};

export default QuizCreator;