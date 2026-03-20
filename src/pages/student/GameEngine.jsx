import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/APIservice';

const GameEngine = () => {
    // Kinukuha ang typeId (ito yung activityId o quizId) mula sa URL
    const { questId, levelId, typeId } = useParams(); 
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const mode = searchParams.get('mode'); 

    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null); // New state for debugging
    
    // State para sa final summary screen
    const [quizSummary, setQuizSummary] = useState(null);

    const handleFinish = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let response;

            if (mode === 'activity') {
                // Ipinapasa ang typeId bilang activityId
                response = await authAPI.studentFinishActivity(questId, levelId, typeId, token);
            } else {
                // Ipinapasa ang typeId bilang quizId
                response = await authAPI.studentFinishQuiz(questId, levelId, typeId, token);
            }

            if (response.ok) {
                const result = await response.json();
                // Sine-set ang summary para lumabas ang Result UI imbes na alert
                setQuizSummary(result);
            } else {
                // Kung may error sa finish, bumalik sa levels
                navigate(`/student/quest/${questId}/levels`);
            }
        } catch (error) {
            console.error("Error finishing:", error);
            navigate(`/student/quest/${questId}/levels`);
        } finally {
            setLoading(false);
        }
    }, [questId, levelId, typeId, mode, navigate]);

    const fetchQuestion = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const token = localStorage.getItem('token');
            
            // Debugging log para makita kung ano ang ipinapasa sa API
            console.log("Fetching Question Parameters:", { questId, levelId, typeId, mode });

            let response;

            if (mode === 'activity') {
                // Ipinapasa ang typeId bilang activityId base sa documentation Step 8
                response = await authAPI.studentGetNextActivityQuestion(questId, levelId, typeId, token);
            } else {
                // Ipinapasa ang typeId bilang quizId
                response = await authAPI.studentGetNextQuizQuestion(questId, levelId, typeId, token);
            }
            
            if (response.status === 404) {
                setErrorMessage(`Backend Error: 404 - Hindi mahanap ang activity/quiz questions. (ID: ${typeId})`);
                setLoading(false);
                return;
            }

            if (response.status === 204) {
                // No more questions
                handleFinish();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
                console.error("API Error Response:", errorData);
                setErrorMessage(`Backend Error: ${response.status} - ${errorData.error || "Pakicheck kung may questions na ang level na ito."}`);
                setLoading(false);
                return;
            }

            const data = await response.json();
            if (data && data.id) {
                setCurrentQuestion(data);
                setSelectedAnswer(null);
                setAnswerText('');
                setFeedback(null);
            } else {
                handleFinish();
            }
        } catch (error) {
            setErrorMessage("Hindi makakonekta sa server. Pakicheck ang internet o backend URL.");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [questId, levelId, typeId, mode, handleFinish]);

    useEffect(() => {
        if (questId && levelId && mode && typeId) {
            fetchQuestion();
        } else {
            console.warn("Missing URL parameters in GameEngine:", { questId, levelId, mode, typeId });
        }
    }, [questId, levelId, mode, typeId, fetchQuestion]);

    const handleSubmitAnswer = async () => {
        if ((!selectedAnswer && !answerText) || isSubmitting || feedback) return;

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            const payload = { answer_id: selectedAnswer, answer_text: answerText };

            let response;
            if (mode === 'activity') {
                response = await authAPI.studentSubmitActivityAnswer(questId, levelId, typeId, currentQuestion.id, payload, token);
            } else {
                response = await authAPI.studentSubmitQuizAnswer(questId, levelId, typeId, currentQuestion.id, payload, token);
            }

            const result = await response.json();
            setFeedback(result.is_correct ? 'correct' : 'wrong');
            
            setTimeout(() => {
                setIsSubmitting(false);
                fetchQuestion(); 
            }, 1200);

        } catch (error) {
            console.error("Error submitting:", error);
            setIsSubmitting(false);
        }
    };

    // --- RESULT SCREEN UI (Base sa screenshots) ---
    if (quizSummary) {
        const isPassed = quizSummary.passed || quizSummary.status === 'passed';
        const score = quizSummary.score || 0;

        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center border border-gray-100">
                    <div className="mb-6 flex justify-center">
                        <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center text-3xl font-black ${isPassed ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600'}`}>
                            {score}%
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-gray-800 mb-2">
                        {isPassed ? "🎉 Activity Passed!" : "❌ Not quite..."}
                    </h2>
                    <p className="text-gray-500 mb-6 font-bold">
                        {isPassed ? "Great job! The quiz for this level is now unlocked." : "You need at least 70% to unlock the quiz. Please review and retry."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <button 
                            onClick={() => navigate(`/student/quest/${questId}/levels`)}
                            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-black hover:bg-gray-300 transition-colors"
                        >
                            Back to Quests
                        </button>
                        <button 
                            onClick={() => isPassed ? navigate(`/student/quest/${questId}/levels`) : window.location.reload()}
                            className={`px-8 py-3 text-white rounded-xl font-black transition-transform active:scale-95 ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        >
                            {isPassed ? "Continue" : "Retry Activity"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Error View (Para sa 404 at 500 errors na nasa console mo)
    if (errorMessage) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-rose-500 max-w-md">
                    <h1 className="text-4xl mb-4">⚠️</h1>
                    <h2 className="text-xl font-black text-gray-800 mb-2">Ops! May Problema</h2>
                    <p className="text-gray-600 mb-6">{errorMessage}</p>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => fetchQuestion()}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold"
                        >
                            Subukan Muli (Retry)
                        </button>
                        <button 
                            onClick={() => navigate(`/student/quest/${questId}/levels`)}
                            className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl font-bold"
                        >
                            Bumalik sa Levels
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading && !currentQuestion) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium font-sans">Checking Mission Data...</p>
            </div>
        );
    }

    const progressPerc = currentQuestion ? (currentQuestion.question_number / currentQuestion.total_questions) * 100 : 0;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
            {/* Header */}
            <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
                <button onClick={() => navigate(`/student/quest/${questId}/levels`)} className="bg-white border border-gray-200 px-5 py-2.5 rounded-xl shadow-sm text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                    ← Quit Quest
                </button>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${mode === 'activity' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {mode}
                    </span>
                    <span className="text-gray-500 text-sm font-bold bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                        Mission {levelId}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-4xl mx-auto mb-10">
                <div className="flex justify-between items-end text-xs font-black text-gray-400 mb-2 tracking-widest">
                    <span>PROGRESS</span>
                    <span className="text-gray-600">{currentQuestion?.question_number || '0'} / {currentQuestion?.total_questions || '0'}</span>
                </div>
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full transition-all duration-700 ease-out ${mode === 'activity' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${progressPerc}%` }}></div>
                </div>
            </div>

            {/* Question Card */}
            <div className={`max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl border-2 transition-all p-8 md:p-12 mb-8 ${feedback === 'correct' ? 'border-emerald-500 bg-emerald-50' : feedback === 'wrong' ? 'border-rose-500 bg-rose-50' : 'border-transparent'}`}>
                <p className="text-indigo-500 text-xs font-black mb-4 uppercase tracking-widest">
                    {feedback ? (feedback === 'correct' ? '✅ Correct!' : '❌ Wrong!') : `Question ${currentQuestion?.question_number}`}
                </p>
                <h2 className="text-2xl md:text-4xl font-black text-gray-800 leading-tight">
                    {currentQuestion?.question_text}
                </h2>
                
                {/* Identification Input */}
                {currentQuestion?.question_type === 'identification' && (
                    <div className="mt-8">
                        <input 
                            type="text" 
                            value={answerText} 
                            onChange={(e) => setAnswerText(e.target.value)} 
                            placeholder="Type answer here..." 
                            className="w-full p-5 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 text-xl font-bold" 
                            disabled={!!feedback} 
                        />
                    </div>
                )}
            </div>

            {/* Choices for Multiple Choice */}
            {currentQuestion?.question_type !== 'identification' && (
                <div className="max-w-4xl mx-auto grid grid-cols-1 gap-4">
                    {currentQuestion?.choices?.map((choice, idx) => (
                        <button 
                            key={choice.id || idx} 
                            onClick={() => !feedback && setSelectedAnswer(choice.id)} 
                            className={`flex items-center p-6 rounded-2xl border-2 transition-all text-left ${selectedAnswer === choice.id ? 'border-indigo-600 bg-indigo-50' : 'border-white bg-white hover:border-gray-300'}`}
                        >
                            <span className="text-xl font-bold">{choice.text || choice.choice_text}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Footer Actions */}
            <div className="max-w-4xl mx-auto mt-12 flex justify-end">
                <button 
                    onClick={handleSubmitAnswer} 
                    disabled={(!selectedAnswer && !answerText) || !!feedback || isSubmitting} 
                    className="px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-transform disabled:opacity-50"
                >
                    {isSubmitting ? 'Checking...' : (feedback ? 'Next Question' : 'Submit Answer')}
                </button>
            </div>
        </div>
    );
};

export default GameEngine;