import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/APIservice';

const GameEngine = () => {
    // Kinukuha ang mga parameters mula sa URL
    const { questId, levelId, typeId } = useParams(); 
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const mode = searchParams.get('mode'); 

    // --- STATES ---
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [metadata, setMetadata] = useState({
        answered_count: 0,
        total_questions: 0,
        display_number: 1 // Gagamitin natin ito para sa 1/10 display
    });
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null); 
    const [quizSummary, setQuizSummary] = useState(null);
    
    // Timer State
    const [timeLeft, setTimeLeft] = useState(30);
    const timerRef = useRef(null);

    // Ref para maiwasan ang double fetching
    const hasFetchedInitial = useRef(false);

    // --- 1. HANDLE FINISH MISSION ---
    const handleFinish = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let response;

            if (mode === 'activity') {
                response = await authAPI.studentFinishActivity(questId, levelId, typeId, token);
            } else {
                response = await authAPI.studentFinishQuiz(questId, levelId, typeId, token);
            }

            if (response.ok) {
                const result = await response.json();
                setQuizSummary(result);
            } else {
                navigate(`/student/quest/${questId}/levels`);
            }
        } catch (error) {
            console.error("Error finishing:", error);
            navigate(`/student/quest/${questId}/levels`);
        } finally {
            setLoading(false);
        }
    }, [questId, levelId, typeId, mode, navigate]);

    // --- 2. FETCH QUESTION ---
    const fetchQuestion = useCallback(async (isNext = false) => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const token = localStorage.getItem('token');
            
            let response;
            if (mode === 'activity') {
                response = await authAPI.studentGetNextActivityQuestion(questId, levelId, typeId, token);
            } else {
                response = await authAPI.studentGetNextQuizQuestion(questId, levelId, typeId, token);
            }
            
            if (response.status === 204) {
                handleFinish();
                return;
            }

            if (!response.ok) {
                setErrorMessage(`Error: ${response.status} - Failed to load question.`);
                setLoading(false);
                return;
            }

            const data = await response.json();
            
            if (data.question) {
                setCurrentQuestion(data.question);
                
                // Update Metadata: 
                // Kung "isNext" (galing sa submission), i-increment natin ang display_number manually
                setMetadata(prev => ({
                    answered_count: data.answered_count,
                    total_questions: data.total_questions,
                    display_number: isNext ? prev.display_number + 1 : (data.answered_count + 1)
                }));

                setSelectedAnswer(null);
                setAnswerText('');
                setTimeLeft(30); 
            } else {
                handleFinish();
            }
        } catch (error) {
            setErrorMessage("Hindi makakonekta sa server.");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [questId, levelId, typeId, mode, handleFinish]);

    // --- 3. SUBMIT ANSWER ---
    const handleSubmitAnswer = useCallback(async (isTimeUp = false) => {
        if (isSubmitting || !currentQuestion) return;

        try {
            setIsSubmitting(true);
            clearInterval(timerRef.current); 

            const token = localStorage.getItem('token');
            const answerData = {
                answer_id: isTimeUp ? null : selectedAnswer,
                answer_text: isTimeUp ? "" : answerText
            };

            const payload = mode === 'activity' 
                ? { student_activity_answer: answerData } 
                : { student_quiz_answer: answerData };

            const qId = currentQuestion.id || 
                        currentQuestion.activity_question_id || 
                        currentQuestion.quiz_question_id ||
                        currentQuestion.quest_activity_question_id || 
                        currentQuestion.quest_quiz_question_id;

            let response;
            if (mode === 'activity') {
                response = await authAPI.studentSubmitActivityAnswer(questId, levelId, typeId, qId, payload, token);
            } else {
                response = await authAPI.studentSubmitQuizAnswer(questId, levelId, typeId, qId, payload, token);
            }

            if (!response.ok) throw new Error("Submission failed");

            // CHECKPOINT: Kung ito na yung huling display number, wag na mag-fetch, finish na agad.
            if (metadata.display_number >= metadata.total_questions) {
                handleFinish();
            } else {
                // Fetch next question and signal to increment display number
                fetchQuestion(true);
            }

        } catch (error) {
            console.error("Error submitting:", error);
            // Re-fetch current state if error happens to avoid getting stuck
            fetchQuestion(false);
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, currentQuestion, selectedAnswer, answerText, mode, questId, levelId, typeId, metadata, handleFinish, fetchQuestion]);

    // --- 4. TIMER LOGIC ---
    useEffect(() => {
        if (currentQuestion && !loading && !quizSummary) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmitAnswer(true); 
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [currentQuestion, loading, quizSummary, handleSubmitAnswer]);

    // Initial load
    useEffect(() => {
        if (!hasFetchedInitial.current && questId && levelId && mode && typeId) {
            fetchQuestion(false);
            hasFetchedInitial.current = true;
        }
    }, [questId, levelId, mode, typeId, fetchQuestion]);

    // UI Helpers
    const getQuestionText = () => {
        if (!currentQuestion) return "";
        return currentQuestion.question_text || currentQuestion.activity_question || currentQuestion.quiz_question || currentQuestion.question;
    };

    const getChoices = () => {
        if (!currentQuestion) return [];
        return currentQuestion.activity_answers || currentQuestion.quiz_answers || currentQuestion.answers || currentQuestion.choices || currentQuestion.quest_activity_answers || [];
    };

    // --- RENDER RESULT ---
    if (quizSummary) {
        const isPassed = quizSummary.passed || quizSummary.status === 'passed' || quizSummary.is_passed;
        return (
            <div className="min-h-screen bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 fixed inset-0 z-50">
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-lg w-full text-center border-4 border-white">
                    <div className="mb-6 flex justify-center">
                        <div className={`w-36 h-36 rounded-full border-[10px] flex items-center justify-center text-4xl font-black ${isPassed ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600'}`}>
                            {quizSummary.score || 0}%
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 mb-2">{isPassed ? "MISSION CLEARED!" : "MISSION FAILED"}</h2>
                    <button onClick={() => navigate(`/student/quest/${questId}/levels`)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black mt-4">CONTINUE</button>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-rose-500 text-center">
                    <h2 className="text-xl font-black mb-4">Error Encountered</h2>
                    <p className="mb-6">{errorMessage}</p>
                    <button onClick={() => fetchQuestion(false)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">Retry</button>
                </div>
            </div>
        );
    }

    if (loading && !currentQuestion) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p>SYNCING MISSION...</p>
            </div>
        );
    }

    // Display variables
    const displayNum = metadata.display_number;
    const totalNum = metadata.total_questions || 0;
    const progressPerc = totalNum > 0 ? (displayNum / totalNum) * 100 : 0;
    const isLastItem = displayNum >= totalNum;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            {/* Header */}
            <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
                <button onClick={() => navigate(-1)} className="bg-white px-5 py-2.5 rounded-xl shadow-sm text-sm font-bold text-gray-600 hover:bg-gray-100 border">
                    &larr; Quit
                </button>
                <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl font-black shadow-sm bg-white border-2 ${timeLeft <= 10 ? 'border-rose-500 text-rose-500 animate-pulse' : 'border-gray-100 text-gray-700'}`}>
                        {timeLeft}s
                    </div>
                </div>
            </div>

            {/* Accurate Progress Bar */}
            <div className="max-w-4xl mx-auto mb-10">
                <div className="flex justify-between items-end text-xs font-black text-gray-400 mb-2 tracking-widest uppercase">
                    <span>Task Progress</span>
                    <span className="text-gray-600">{displayNum} / {totalNum}</span>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full transition-all duration-700 ${mode === 'activity' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${progressPerc}%` }}></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl p-8 md:p-12 mb-8 border-2 border-gray-50">
                <p className="text-indigo-500 text-xs font-black mb-4 uppercase tracking-widest">Question #{displayNum}</p>
                <h2 className="text-2xl md:text-3xl font-black text-gray-800 leading-tight">
                    {getQuestionText()}
                </h2>
                
                {currentQuestion?.question_type === 'identification' && (
                    <div className="mt-8">
                        <input 
                            type="text" 
                            value={answerText} 
                            onChange={(e) => setAnswerText(e.target.value)} 
                            placeholder="Type your answer..." 
                            className="w-full p-5 rounded-2xl border-4 border-gray-100 outline-none focus:border-indigo-500 text-xl font-bold transition-colors" 
                            autoFocus
                        />
                    </div>
                )}
            </div>

            {/* Choices Grid */}
            {currentQuestion?.question_type !== 'identification' && (
                <div className="max-w-4xl mx-auto grid grid-cols-1 gap-4">
                    {getChoices().map((choice, idx) => {
                        const choiceId = choice.id || choice.quest_activity_answer_id || choice.quest_quiz_answer_id || idx; 
                        const isSelected = selectedAnswer === choiceId;
                        return (
                            <button 
                                key={idx} 
                                onClick={() => setSelectedAnswer(choiceId)} 
                                className={`flex items-center p-6 rounded-2xl border-2 transition-all text-left w-full ${isSelected ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'bg-white border-transparent hover:border-gray-200 shadow-sm'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 font-black ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className="text-xl font-bold text-gray-700">{choice.answer_text || choice.text}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Action Button */}
            <div className="max-w-4xl mx-auto mt-12 flex justify-end">
                <button 
                    onClick={() => handleSubmitAnswer(false)} 
                    disabled={isSubmitting || (currentQuestion?.question_type !== 'identification' && selectedAnswer === null) || (currentQuestion?.question_type === 'identification' && !answerText.trim())} 
                    className={`px-14 py-5 text-white rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all disabled:opacity-50 ${isLastItem ? 'bg-rose-600' : 'bg-indigo-600'}`}
                >
                    {isSubmitting ? 'Verifying...' : (isLastItem ? 'SUBMIT MISSION' : 'NEXT TASK →')}
                </button>
            </div>
        </div>
    );
};

export default GameEngine;