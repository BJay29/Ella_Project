import React, { useState } from 'react';
// I-import natin ang selectors mula sa SelectionFlow folder mo
import DeptSelector from './SelectionFlow/DeptSelector';
import ProgramSelector from './SelectionFlow/ProgramSelector';
import CourseSelector from './SelectionFlow/CourseSelector';
import SectionSelector from './SelectionFlow/SectionSelector';
// I-import ang SectionDashboard para sa "Manage Students" view
import SectionDashboard from './StudentManagement/SectionDashboard';

const Management = () => {
    // view: 'list' (dashboard), 'adding' (selection flow), o 'focus' (specific section dashboard)
    const [view, setView] = useState('list'); 
    const [step, setStep] = useState(1);
    
    // Dito mase-save ang lahat ng multiple sections na pipiliin ni instructor
    const [mySections, setMySections] = useState([]);

    // State para sa section na kasalukuyang mine-manage
    const [activeSection, setActiveSection] = useState(null);
    
    // Temporary state para itago ang pinipili sa bawat step
    const [temp, setTemp] = useState({
        dept: null,
        program: null,
        subject: null
    });

    // Function na tatawagin kapag natapos ang Step 4 (Section Selection)
    const handleFinish = (section) => {
        const newEntry = {
            id: Date.now(),
            dept: temp.dept.name,
            program: temp.program.name,
            subject: temp.subject.name,
            section: section.name,
            // Ito yung hierarchy string
            fullPath: `${temp.subject.name}-${temp.dept.name}-${temp.program.name}-${section.name}`
        };

        setMySections([...mySections, newEntry]);
        setView('list'); // Balik sa main dashboard
        setStep(1);      // Reset steps para sa susunod na pag-add
    };

    return (
        <div className="w-full">
            {/* --- VIEW 1: MY COURSES DASHBOARD --- */}
            {view === 'list' && (
                <div className="animate-in fade-in duration-700">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-[14px] font-black italic uppercase text-gray-800 tracking-tight leading-none">
                                My Courses
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">
                                Select a course to view sections
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => setView('adding')}
                            className="bg-[#22C55E] hover:bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-100 active:scale-95"
                        >
                            + Create New Course
                        </button>
                    </div>

                    {/* GRID NG MGA HANDLED SECTIONS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mySections.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#22C55E]"></div>
                                
                                <p className="text-[9px] font-black text-[#22C55E] uppercase tracking-widest mb-1">
                                    {item.dept} • {item.program}
                                </p>
                                
                                <h3 className="text-xl font-black text-gray-800 uppercase italic leading-none tracking-tighter">
                                    {item.subject}
                                </h3>
                                
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Section:</span>
                                    <span className="text-[11px] font-black text-gray-800 uppercase italic bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                        {item.section}
                                    </span>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        setActiveSection(item);
                                        setView('focus');
                                    }}
                                    className="w-full mt-6 py-4 bg-slate-900 group-hover:bg-[#22C55E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Manage Students
                                </button>
                            </div>
                        ))}

                        {mySections.length === 0 && (
                            <div className="col-span-full py-32 border-2 border-dashed border-gray-100 rounded-[3rem] text-center flex flex-col items-center justify-center bg-white/30">
                                <div className="text-4xl mb-4 opacity-20">📚</div>
                                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest italic">
                                    No handled sections yet. Add your first course.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- VIEW 2: SELECTION FLOW WRAPPER --- */}
            {view === 'adding' && (
                <div className="max-w-5xl mx-auto py-10 px-8 bg-white rounded-[3rem] shadow-sm border border-gray-50 animate-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-center mb-10">
                        <button 
                            onClick={() => {setView('list'); setStep(1);}} 
                            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                        >
                            ← Cancel and Back
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-300 uppercase">Step {step} of 4</span>
                        </div>
                    </div>
                    
                    <div className="min-h-[300px]">
                        {step === 1 && (
                            <DeptSelector 
                                onNext={(d) => { setTemp({...temp, dept: d}); setStep(2); }} 
                            />
                        )}
                        {step === 2 && (
                            <ProgramSelector 
                                deptId={temp.dept?.id} 
                                onNext={(p) => { setTemp({...temp, program: p}); setStep(3); }} 
                            />
                        )}
                        {step === 3 && (
                            <CourseSelector 
                                programId={temp.program?.id} 
                                onNext={(s) => { setTemp({...temp, subject: s}); setStep(4); }} 
                            />
                        )}
                        {step === 4 && (
                            <SectionSelector 
                                onNext={handleFinish} 
                            />
                        )}
                    </div>

                    <div className="mt-12 flex justify-center gap-3">
                        {[1, 2, 3, 4].map((s) => (
                            <div 
                                key={s} 
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                    step === s ? 'w-10 bg-[#22C55E]' : 'w-3 bg-gray-100'
                                }`} 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* --- VIEW 3: FOCUS MODE (Section Dashboard) --- */}
            {view === 'focus' && activeSection && (
                <SectionDashboard 
                    sectionData={activeSection} 
                    onBack={() => {
                        setView('list');
                        setActiveSection(null);
                    }} 
                />
            )}
        </div>
    );
};

export default Management;