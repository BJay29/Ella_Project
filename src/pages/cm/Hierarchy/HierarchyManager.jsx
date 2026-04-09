import React, { useState } from 'react';
import CourseForm from './CourseForm'; 
import DeptForm from './DeptForm';     
import ProgramForm from './ProgramForm'; 
import SectionForm from './SectionForm'; 
import QuestBuilder from '../QuestBuilder/QuestBuilder';

const HierarchyManager = () => {
    // --- STEP MANAGEMENT ---
    const [step, setStep] = useState('COURSE');
    
    // --- SELECTION STATE ---
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
     * Tumatanggap ng target level, ID, at name.
     * Dito natin sinisiguro na naitatabi ang IDs mula sa previous steps.
     */
    const handleNext = (level, id, name = '') => {
        if (level === 'DEPT') {
            setSelection(prev => ({ 
                ...prev, 
                courseId: id, 
                courseName: name,
                // Reset lower levels
                deptId: null, deptName: '',
                programId: null, programName: '',
                sectionId: null, sectionName: ''
            }));
            setStep('DEPT');
        } else if (level === 'PROGRAM') {
            setSelection(prev => ({ 
                ...prev, 
                deptId: id, 
                deptName: name,
                // Reset lower levels
                programId: null, programName: '',
                sectionId: null, sectionName: ''
            }));
            setStep('PROGRAM');
        } else if (level === 'SECTION') {
            setSelection(prev => ({ 
                ...prev, 
                programId: id, 
                programName: name,
                // Reset lower levels
                sectionId: null, sectionName: ''
            }));
            setStep('SECTION');
        } else if (level === 'QUESTS') {
            setSelection(prev => ({ 
                ...prev, 
                sectionId: id, 
                sectionName: name 
            }));
            setStep('QUESTS');
        }
    };

    /**
     * handleBack logic:
     */
    const handleBack = (targetStep) => {
        setStep(targetStep);
        
        setSelection(prev => {
            if (targetStep === 'COURSE') {
                return {
                    courseId: null, courseName: '',
                    deptId: null, deptName: '',
                    programId: null, programName: '',
                    sectionId: null, sectionName: ''
                };
            }
            if (targetStep === 'DEPT') {
                return {
                    ...prev,
                    deptId: null, deptName: '',
                    programId: null, programName: '',
                    sectionId: null, sectionName: ''
                };
            }
            if (targetStep === 'PROGRAM') {
                return {
                    ...prev,
                    programId: null, programName: '',
                    sectionId: null, sectionName: ''
                };
            }
            if (targetStep === 'SECTION') {
                return {
                    ...prev,
                    sectionId: null, sectionName: ''
                };
            }
            return prev;
        });
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
            {renderBreadcrumbs()}

            <div className="transition-all duration-300">
                
                {/* STEP 1: SUBJECT SELECTION */}
                {step === 'COURSE' && (
                    <CourseForm onNext={(id, name) => handleNext('DEPT', id, name)} />
                )}

                {/* STEP 2: DEPARTMENT SELECTION */}
                {step === 'DEPT' && (
                    <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-2 text-left">
                            <span className="text-lg">📖</span>
                            <div>
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

                {/* STEP 3: PROGRAM SELECTION */}
                {step === 'PROGRAM' && (
                    <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-2 text-left">
                            <span className="text-lg">🏢</span>
                            <div>
                                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Selected Department</p>
                                <p className="text-sm font-black text-indigo-900 uppercase italic leading-tight">{selection.deptName}</p>
                            </div>
                        </div>
                        <ProgramForm 
                            courseId={selection.courseId}
                            deptId={selection.deptId} 
                            onNext={(id, name) => handleNext('SECTION', id, name)} 
                        />
                    </div>
                )}

                {/* STEP 4: SECTION SELECTION */}
                {step === 'SECTION' && (
                    <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-2 text-left">
                            <span className="text-lg">🎓</span>
                            <div>
                                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Target Program</p>
                                <p className="text-sm font-black text-indigo-900 uppercase italic leading-tight">{selection.programName}</p>
                            </div>
                        </div>
                        <SectionForm 
                            courseId={selection.courseId}   
                            deptId={selection.deptId}       
                            programId={selection.programId} 
                            onNext={(id, name) => handleNext('QUESTS', id, name)} 
                        />
                    </div>
                )}

                {/* FINAL STEP: QUEST BUILDER */}
                {step === 'QUESTS' && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-slate-900 text-white rounded-[2rem] p-6 mb-6 flex justify-between items-center text-left">
                            <div>
                                <h2 className="text-xl font-black italic uppercase tracking-tighter">Quest Workshop</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    Building for: {selection.courseName} — {selection.sectionName}
                                </p>
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