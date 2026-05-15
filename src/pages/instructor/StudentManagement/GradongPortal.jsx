import React, { useState } from 'react';
import { ChevronLeft, Save, CheckCircle, AlertCircle } from 'lucide-react';

const GradingPortal = ({ studentSubmission, onBack, onSaveGrade }) => {
    // State para sa grading
    const [score, setScore] = useState(studentSubmission?.score || '');
    const [feedback, setFeedback] = useState(studentSubmission?.feedback || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await onSaveGrade(studentSubmission.id, { score, feedback });
        setIsSaving(false);
    };

    return (
        <div className="flex flex-col h-screen bg-white font-sans text-gray-900">
            {/* --- TOP NAVIGATION BAR --- */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-[11px] font-black uppercase tracking-tighter text-gray-400">Reviewing Submission</h2>
                        <h1 className="text-sm font-black uppercase tracking-tight">
                            {studentSubmission?.studentName || "Student Name"}
                        </h1>
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400 transition-all shadow-lg shadow-gray-200"
                >
                    {isSaving ? "Saving..." : <><Save size={14} /> Save Grade</>}
                </button>
            </div>

            {/* --- MAIN CONTENT (SPLIT VIEW) --- */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* LEFT SIDE: THE ESSAY (Reader View) */}
                <div className="w-full lg:w-2/3 overflow-y-auto px-12 py-16 bg-white border-r border-gray-50">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8 border-l-4 border-black pl-6 py-2">
                            <h3 className="text-2xl font-black leading-tight italic uppercase">
                                {studentSubmission?.essayTitle || "Untitled Essay"}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 font-bold">
                                Submitted on {studentSubmission?.date || "May 15, 2026"} • {studentSubmission?.wordCount || "0"} words
                            </p>
                        </div>

                        {/* Essay Content */}
                        <div className="prose prose-slate max-w-none">
                            <p className="text-lg leading-[2.2rem] text-gray-700 font-serif whitespace-pre-line">
                                {studentSubmission?.content || "No content available."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: GRADING & FEEDBACK PANEL */}
                <div className="hidden lg:flex w-1/3 bg-[#fcfcfc] flex-col p-8 overflow-y-auto border-l border-gray-100">
                    
                    {/* SCORE SECTION */}
                    <div className="mb-8">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4">Final Grade</label>
                        <div className="flex items-end gap-3 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <input 
                                type="number" 
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                className="w-full text-5xl font-black outline-none border-b-4 border-gray-50 focus:border-black transition-all"
                                placeholder="0"
                            />
                            <span className="text-2xl font-black text-gray-300 pb-2">/100</span>
                        </div>
                    </div>

                    {/* AI ASSISTANCE (ELLA INSIGHTS) */}
                    <div className="mb-8 bg-black rounded-[2rem] p-6 text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle size={14} className="text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Ella's Analysis</span>
                        </div>
                        <p className="text-[12px] leading-relaxed font-medium italic text-gray-300">
                            "The student displays a deep understanding of the core concepts, but the transition between the second and third paragraphs could be smoother. Grammar is 95% accurate."
                        </p>
                    </div>

                    {/* FEEDBACK SECTION */}
                    <div className="flex-1 flex flex-col min-h-[300px]">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4">Instructor Feedback</label>
                        <textarea 
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full flex-1 p-6 rounded-[2rem] border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 resize-none text-sm leading-relaxed"
                            placeholder="Write your comments to the student here..."
                        />
                    </div>

                    {/* WARNING / STATUS */}
                    <div className="mt-6 flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-2xl">
                        <AlertCircle size={16} />
                        <p className="text-[10px] font-bold">Grade will be visible to the student once saved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradingPortal;