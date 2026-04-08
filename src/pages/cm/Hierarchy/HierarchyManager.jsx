import React, { useState } from 'react';
import CourseForm from './CourseForm'; 
import DeptForm from './DeptForm';     
import ProgramForm from './ProgramForm'; 
import SectionForm from './SectionForm'; 
import QuestBuilder from '../QuestBuilder/QuestBuilder';

const HierarchyManager = () => {
    // --- STEP MANAGEMENT ---
    // Nagsasabi kung anong level ng hierarchy ang kasalukuyang ipinapakita
    const [step, setStep] = useState('COURSE');
    
    // --- SELECTION STATE ---
    // Dito sine-save ang mga IDs at Names para sa API calls at Breadcrumbs UI
    const [selection, setSelection] = useState({
        courseId: null,
        courseName: '',
        deptId: null,
        deptName: '',
        programId: null,
        programName: '',
        sectionId: null,
        sectionName: ''
    });

    /**
     * handleNext logic:
     * Tumatanggap ng target level (susunod na screen), ID ng piniling item,
     * at pangalan para sa UI breadcrumbs display.
     */
    const handleNext = (level, id, name = '') => {
        if (level === 'DEPT') {
            setSelection(prev => ({ ...prev, courseId: id, courseName: name }));
            setStep('DEPT');
        } else if (level === 'PROGRAM') {
            setSelection(prev => ({ ...prev, deptId: id, deptName: name }));
            setStep('PROGRAM');
        } else if (level === 'SECTION') {
            setSelection(prev => ({ ...prev, programId: id, programName: name }));
            setStep('SECTION');
        } else if (level === 'QUESTS') {
            setSelection(prev => ({ ...prev, sectionId: id, sectionName: name }));
            setStep('QUESTS');
        }
    };

    /**
     * handleBack logic:
     * Pinapayagan ang user na bumalik sa mga previous levels gamit ang breadcrumbs.
     */
    const handleBack = (targetStep) => {
        setStep(targetStep);
        // Optional: Linisin ang selection data pababa kapag bumabalik?
        // Halimbawa: kung babalik sa COURSE, i-reset lahat.
        if (targetStep === 'COURSE') {
            setSelection({
                courseId: null, courseName: '',
                deptId: null, deptName: '',
                programId: null, programName: '',
                sectionId: null, sectionName: ''
            });
        }
    };

    // --- BREADCRUMBS NAVIGATION ---
    const renderBreadcrumbs = () => (
        <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-2">
            <span 
                className={`cursor-pointer transition-colors ${step === 'COURSE' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => handleBack('COURSE')}
            >
                Courses (Subjects)
            </span>
            
            {selection.courseId && (
                <>
                    <span className="text-gray-300">/</span>
                    <span 
                        className={`cursor-pointer transition-colors ${step === 'DEPT' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => handleBack('DEPT')}
                    >
                        {selection.courseName || 'Department'}
                    </span>
                </>
            )}

            {selection.deptId && (
                <>
                    <span className="text-gray-300">/</span>
                    <span 
                        className={`cursor-pointer transition-colors ${step === 'PROGRAM' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => handleBack('PROGRAM')}
                    >
                        {selection.deptName || 'Program'}
                    </span>
                </>
            )}

            {selection.programId && (
                <>
                    <span className="text-gray-300">/</span>
                    <span 
                        className={`cursor-pointer transition-colors ${step === 'SECTION' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => handleBack('SECTION')}
                    >
                        {selection.programName || 'Section'}
                    </span>
                </>
            )}

            {step === 'QUESTS' && (
                <>
                    <span className="text-gray-300">/</span>
                    <span className="text-indigo-600 italic font-black">{selection.sectionName} Builder</span>
                </>
            )}
        </div>
    );

    return (
        <div className="w-full min-h-screen">
            {/* Breadcrumbs UI */}
            {renderBreadcrumbs()}

            {/* Dynamic Rendering Area */}
            <div className="transition-all duration-300">
                
                {/* STEP 1: SUBJECT SELECTION */}
                {step === 'COURSE' && (
                    <CourseForm onNext={(id, name) => handleNext('DEPT', id, name)} />
                )}

                {/* STEP 2: DEPARTMENT SELECTION (Requires courseId) */}
                {step === 'DEPT' && (
                    <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-2">
                            <span className="text-lg">📖</span>
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Active Course</p>
                                <p className="text-sm font-black text-indigo-900 uppercase italic leading-tight">{selection.courseName}</p>
                            </div>
                        </div>
                        <DeptForm 
                            courseId={selection.courseId} 
                            onNext={(id, name) => handleNext('PROGRAM', id, name)} 
                        />
                    </div>
                )}

                {/* STEP 3: PROGRAM SELECTION (Requires deptId) */}
                {step === 'PROGRAM' && (
                    <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-2">
                            <span className="text-lg">🏢</span>
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Selected Department</p>
                                <p className="text-sm font-black text-indigo-900 uppercase italic leading-tight">{selection.deptName}</p>
                            </div>
                        </div>
                        <ProgramForm 
                            deptId={selection.deptId} 
                            onNext={(id, name) => handleNext('SECTION', id, name)} 
                        />
                    </div>
                )}

                {/* STEP 4: SECTION SELECTION (Requires programId) */}
                {step === 'SECTION' && (
                    <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-2">
                            <span className="text-lg">🎓</span>
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Target Program</p>
                                <p className="text-sm font-black text-indigo-900 uppercase italic leading-tight">{selection.programName}</p>
                            </div>
                        </div>
                        <SectionForm 
                            programId={selection.programId} 
                            onNext={(id, name) => handleNext('QUESTS', id, name)} 
                        />
                    </div>
                )}

                {/* FINAL STEP: QUEST BUILDER (Requires sectionId) */}
                {step === 'QUESTS' && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-slate-900 text-white rounded-[2rem] p-6 mb-6 flex justify-between items-center">
                            <div className="text-left">
                                <h2 className="text-xl font-black italic uppercase tracking-tighter">Quest Workshop</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Building for: {selection.courseName} — {selection.sectionName}</p>
                            </div>
                            <button 
                                onClick={() => handleBack('SECTION')}
                                className="text-[10px] font-bold uppercase tracking-widest bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-all"
                            >
                                ← Change Section
                            </button>
                        </div>
                        <QuestBuilder sectionId={selection.sectionId} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HierarchyManager;