import React, { useState } from 'react';
import DeptForm from './DeptForm';    
import ProgramForm from './ProgramForm'; 
import YearLevelForm from './YearLevelForm'; 
import SectionForm from './SectionForm'; 
import CourseForm from './CourseForm'; 
import QuestBuilder from '../QuestBuilder/QuestBuilder';

const HierarchyManager = () => {
    // --- MODE MANAGEMENT ---
    const [mode, setMode] = useState('VIEW'); 

    // --- STEP MANAGEMENT ---
    const [step, setStep] = useState('DEPT');
    
    // --- SELECTION STATE ---
    const [selection, setSelection] = useState({
        deptId: null,
        deptName: '',
        programId: null,
        programName: '',
        yearLevelId: null,
        yearLevelName: '',
        sectionId: null,
        sectionName: ''
    });

    /**
     * Resets the entire flow and selection state.
     */
    const resetFlow = (newMode = 'VIEW') => {
        setMode(newMode);
        setStep('DEPT');
        setSelection({
            deptId: null, deptName: '',
            programId: null, programName: '',
            yearLevelId: null, yearLevelName: '',
            sectionId: null, sectionName: ''
        });
    };

    /**
     * FIXED handleNext logic:
     * Sinisiguro nito na ang numeric ID ay mapupunta sa tamang ID field
     * at ang string Name ay mapupunta sa tamang Name field.
     */
    const handleNext = (nextStep, id, name = '') => {
        if (nextStep === 'PROGRAM') {
            setSelection(prev => ({ 
                ...prev, 
                deptId: id, 
                deptName: name,
                programId: null, programName: '',
                yearLevelId: null, yearLevelName: '',
                sectionId: null, sectionName: ''
            }));
            setStep('PROGRAM');
        } else if (nextStep === 'YEAR_LEVEL') {
            setSelection(prev => ({ 
                ...prev, 
                programId: id, 
                programName: name,
                yearLevelId: null, yearLevelName: '',
                sectionId: null, sectionName: ''
            }));
            setStep('YEAR_LEVEL');
        } else if (nextStep === 'SECTION') {
            // DITO ANG FIX: Siguraduhing 'id' (Integer) ang mapupunta sa yearLevelId
            setSelection(prev => ({ 
                ...prev, 
                yearLevelId: id, 
                yearLevelName: name, 
                sectionId: null, 
                sectionName: ''
            }));
            
            // Lipat sa tamang step base sa mode
            setStep(mode === 'CREATE_COURSE' ? 'COURSE_INPUT' : 'SECTION');

        } else if (nextStep === 'QUESTS') {
            setSelection(prev => ({ 
                ...prev, 
                sectionId: id, 
                sectionName: name 
            }));
            setStep('QUESTS');
        }
    };

    /**
     * handleBack logic
     */
    const handleBack = (targetStep) => {
        setStep(targetStep);
        setSelection(prev => {
            if (targetStep === 'DEPT') return { deptId: null, deptName: '', programId: null, programName: '', yearLevelId: null, yearLevelName: '', sectionId: null, sectionName: '' };
            if (targetStep === 'PROGRAM') return { ...prev, programId: null, programName: '', yearLevelId: null, yearLevelName: '', sectionId: null, sectionName: '' };
            if (targetStep === 'YEAR_LEVEL') return { ...prev, yearLevelId: null, yearLevelName: '', sectionId: null, sectionName: '' };
            if (targetStep === 'SECTION') return { ...prev, sectionId: null, sectionName: '' };
            return prev;
        });
    };

    // --- BREADCRUMBS NAVIGATION ---
    const renderBreadcrumbs = () => (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-2 no-scrollbar text-slate-900">
                <span className={`cursor-pointer ${step === 'DEPT' ? 'text-indigo-600' : 'text-slate-400'}`} onClick={() => handleBack('DEPT')}>Departments</span>
                {selection.deptId && <><span className="text-slate-300">/</span><span className={`cursor-pointer ${step === 'PROGRAM' ? 'text-indigo-600' : 'text-slate-400'}`} onClick={() => handleBack('PROGRAM')}>{selection.deptName}</span></>}
                {selection.programId && <><span className="text-slate-300">/</span><span className={`cursor-pointer ${step === 'YEAR_LEVEL' ? 'text-indigo-600' : 'text-slate-400'}`} onClick={() => handleBack('YEAR_LEVEL')}>{selection.programName}</span></>}
                {selection.yearLevelId && <><span className="text-slate-300">/</span><span className={`cursor-pointer ${step === 'SECTION' || step === 'COURSE_INPUT' ? 'text-indigo-600' : 'text-slate-400'}`}>{selection.yearLevelName}</span></>}
            </div>

            {step === 'DEPT' && (
                <button 
                    onClick={() => resetFlow(mode === 'VIEW' ? 'CREATE_COURSE' : 'VIEW')}
                    className={`text-[10px] font-black px-4 py-2 rounded-full border-2 transition-all ${mode === 'CREATE_COURSE' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}
                >
                </button>
            )}
        </div>
    );

    return (
        <div className="w-full">
            {renderBreadcrumbs()}

            <div className="transition-all duration-300">
                {/* STEP 1: DEPARTMENT */}
                {step === 'DEPT' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                     
                        <DeptForm onNext={(id, name) => handleNext('PROGRAM', id, name)} />
                    </div>
                )}

                {/* STEP 2: PROGRAM */}
                {step === 'PROGRAM' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-4">
                            <span className="text-lg">🏢</span>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Selected Department</p>
                                <p className="text-sm font-black text-indigo-950 uppercase italic">{selection.deptName}</p>
                            </div>
                        </div>
                        <ProgramForm deptId={selection.deptId} onNext={(id, name) => handleNext('YEAR_LEVEL', id, name)} />
                    </div>
                )}

                {/* STEP 3: YEAR LEVEL */}
                {step === 'YEAR_LEVEL' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-4">
                            <span className="text-lg">📅</span>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Selected Program</p>
                                <p className="text-sm font-black text-indigo-950 uppercase italic">{selection.programName}</p>
                            </div>
                        </div>
                        <YearLevelForm 
                            deptId={selection.deptId} 
                            programId={selection.programId} 
                            // Sinisiguradong 'SECTION' ang nextStep para ma-trigger ang logic sa handleNext
                            onNext={(id, name) => handleNext('SECTION', id, name)} 
                        />
                    </div>
                )}

                {/* STEP 4 (A): COURSE INPUT FORM */}
                {step === 'COURSE_INPUT' && mode === 'CREATE_COURSE' && (
                    <div className="animate-in zoom-in-95 duration-300">
                         <div className="bg-slate-900 text-white rounded-3xl p-6 mb-6 shadow-xl">
                            <h2 className="text-xl font-black italic uppercase">Create New Course</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                Mapping to: {selection.deptName} {`>`} {selection.programName} {`>`} {selection.yearLevelName}
                            </p>
                        </div>
                        <CourseForm 
                            deptId={selection.deptId}
                            programId={selection.programId}
                            yearLevelId={selection.yearLevelId}
                            onSuccess={() => resetFlow('VIEW')} 
                        />
                    </div>
                )}

                {/* STEP 4 (B): SECTION SELECTION */}
                {step === 'SECTION' && mode === 'VIEW' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-4">
                            <span className="text-lg">🎓</span>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Selected Year Level</p>
                                <p className="text-sm font-black text-indigo-950 uppercase italic">{selection.yearLevelName}</p>
                            </div>
                        </div>
                        <SectionForm 
                            deptId={selection.deptId}
                            programId={selection.programId}
                            yearLevelId={selection.yearLevelId} 
                            onNext={(id, name) => handleNext('QUESTS', id, name)} 
                        />
                    </div>
                )}

                {/* STEP 5: QUEST BUILDER */}
                {step === 'QUESTS' && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                         <div className="bg-slate-900 text-white rounded-[2rem] p-6 mb-6 flex justify-between items-center shadow-xl border border-slate-800">
                            <div>
                                <h2 className="text-xl font-black italic uppercase tracking-tighter">Quest Workshop</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    Target: {selection.deptName} • {selection.programName} • {selection.sectionName}
                                </p>
                            </div>
                            <button onClick={() => handleBack('SECTION')} className="text-[10px] font-bold uppercase bg-slate-800 hover:bg-rose-500 px-4 py-2 rounded-xl transition-all">
                                Change Path
                            </button>
                        </div>
                        <QuestBuilder 
                            deptId={selection.deptId}
                            programId={selection.programId}
                            yearLevelId={selection.yearLevelId}
                            sectionId={selection.sectionId} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HierarchyManager;