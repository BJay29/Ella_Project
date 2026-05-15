import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../../services/APIservice'; // Adjust the relative path depending on your folder layout

const InterventionView = () => {
    // Component core data states
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Intervention action overlay controls
    const [selectedIntervention, setSelectedIntervention] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    
    // State matching your exact required database request payload model schema
    const [taskForm, setTaskForm] = useState({
        task_title: '',
        task_instructions: '',
        task_due_at: ''
    });

    // Helper utility to clean localStorage tokens safely from string artifacts
    const getCleanToken = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') return null;
        return token.replace(/['"]+/g, '').trim();
    }, []);

    // Core GET loader logic - fetches pending at-risk records from backend service layer
    const loadPendingInterventions = useCallback(async () => {
        setLoading(true);
        try {
            const token = getCleanToken();
            // Calls endpoint: GET /api/instructor/interventions?status=pending
            const res = await authAPI.getInterventions(token, 'pending');
            if (res.ok) {
                const data = await res.json();
                setInterventions(data || []);
            }
        } catch (err) {
            console.error("Failed to load interventions:", err);
        } finally {
            setLoading(false);
        }
    }, [getCleanToken]);

    // Initial load handler hook
    useEffect(() => {
        loadPendingInterventions();
    }, [loadPendingInterventions]);

    // PATCH Action Handler 1: Instantly unlock exam retake capabilities for target record
    const handleAllowRetake = async (interventionId) => {
        if (!window.confirm("Are you sure you want to allow this student to retake the material assignment?")) return;
        try {
            const token = getCleanToken();
            // Calls endpoint: PATCH /api/instructor/interventions/:intervention_id/allow-retake
            const res = await authAPI.allowInterventionRetake(interventionId, token);
            if (res.ok) {
                alert("Retake privileges successfully unlocked for this student.");
                loadPendingInterventions(); // Dynamic status table UI synchronization
            } else {
                alert("Failed to unlock assignment retake permissions.");
            }
        } catch (err) {
            console.error("Error patching retake endpoint:", err);
        }
    };

    // PATCH Action Handler 2: Submit custom task payload form parameters safely to the cloud
    const handleAssignTaskSubmit = async (e) => {
        e.preventDefault();
        if (!selectedIntervention) return;

        try {
            const token = getCleanToken();
            // Wraps standard timestamp configurations cleanly into localized datestring formats
            const payload = {
                task_title: taskForm.task_title,
                task_instructions: taskForm.task_instructions,
                task_due_at: new Date(taskForm.task_due_at).toISOString()
            };

            // Calls endpoint: PATCH /api/instructor/interventions/:intervention_id/task
            const res = await authAPI.assignInterventionTask(selectedIntervention.id || selectedIntervention.intervention_id, payload, token);
            
            if (res.ok) {
                alert("Custom remediation task successfully assigned!");
                setIsTaskModalOpen(false); // Hide overlay view
                setTaskForm({ task_title: '', task_instructions: '', task_due_at: '' }); // Clear state fields
                loadPendingInterventions(); // Synchronize view states
            } else {
                alert("Failed to assign remediation task.");
            }
        } catch (err) {
            console.error("Error patching intervention task model data:", err);
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                        ⚠️ Pending Interventions
                    </h2>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">
                        Immediate remediation actions required for flagged student performance metrics
                    </p>
                </div>
            </div>

            {/* Content Display Decisions (Loading vs Empty vs Populated Table layout matrix) */}
            {loading ? (
                <div className="py-24 text-center text-xs font-black uppercase tracking-widest text-gray-400 animate-pulse">
                    Syncing system interventions...
                </div>
            ) : interventions.length === 0 ? (
                /* EMPTY STATE Layout View block */
                <div className="flex flex-col items-center justify-center mt-20">
                    <div className="text-7xl mb-4 transform hover:scale-110 transition-transform cursor-default">
                        ✅
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                        No pending interventions
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
                        All student index profiles meet minimum benchmark thresholds.
                    </p>
                </div>
            ) : (
                /* ACTIVE PERFORMANCE DATA LISTING MATRIX */
                <div className="grid grid-cols-1 gap-4">
                    {interventions.map((item) => (
                        <div 
                            key={item.id || item.intervention_id} 
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-red-200 hover:shadow-md transition-all"
                        >
                            {/* Left Data Column: Student Profile context layout identifiers */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600 text-xs font-black tracking-tighter uppercase">
                                    {(item.student_name || "S").substring(0, 2)}
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 uppercase text-sm leading-tight tracking-tight">
                                        {item.student_name || "At-Risk Student"}
                                    </h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                        Section Profile: <span className="text-gray-900 font-black">{item.section_code || item.section_name || 'General'}</span>
                                    </p>
                                    <p className="text-[10px] text-red-600 font-bold mt-1 italic max-w-xl">
                                        Trigger Reason: {item.reason || "Score falling below benchmark baseline rules parameters."}
                                    </p>
                                </div>
                            </div>

                            {/* Right Action Column: Management parameter options control array buttons */}
                            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-0 pt-4 md:pt-0">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5 tracking-wider">Metrics Status</p>
                                    <span className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 font-black text-[9px] uppercase tracking-wider rounded-md">
                                        At Risk
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Action Toggle Button 1: Triggers API Allow Retake Endpoint flow */}
                                    <button 
                                        onClick={() => handleAllowRetake(item.id || item.intervention_id)}
                                        className="bg-white border border-gray-900 text-gray-900 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
                                    >
                                        Allow Retake
                                    </button>
                                    {/* Action Toggle Button 2: Launches Task Assign Modal interface overlay context */}
                                    <button 
                                        onClick={() => { setSelectedIntervention(item); setIsTaskModalOpen(true); }}
                                        className="bg-[#16a34a] text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md"
                                    >
                                        Assign Task
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CUSTOM REMEDIAL ASSIGNMENT TASK PANEL MODAL (Matches requested payload body schema) */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100">
                        <div className="mb-6">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900">Assign Remedial Task</h3>
                            <p className="text-[10px] font-black text-[#16a34a] uppercase tracking-widest mt-1">
                                Target Remediation Student: {selectedIntervention?.student_name}
                            </p>
                        </div>
                        
                        <form onSubmit={handleAssignTaskSubmit} className="space-y-5">
                            {/* Task Title Field: Sets database parameters content model key map */}
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-wider mb-2 ml-1">Task Title</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={taskForm.task_title} 
                                    onChange={e => setTaskForm({...taskForm, task_title: e.target.value})} 
                                    placeholder="E.G. REVIEW LESSON NOTES" 
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold uppercase tracking-wide focus:ring-2 focus:ring-green-500 outline-none" 
                                />
                            </div>

                            {/* Instructions Area Field */}
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-wider mb-2 ml-1">Instructions Details</label>
                                <textarea 
                                    rows={3} 
                                    required 
                                    value={taskForm.task_instructions} 
                                    onChange={e => setTaskForm({...taskForm, task_instructions: e.target.value})} 
                                    placeholder="E.G. STUDY CHAPTER 3 AND SUBMIT A SHORT REFLECTION." 
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold uppercase tracking-wide focus:ring-2 focus:ring-green-500 outline-none resize-none" 
                                />
                            </div>

                            {/* Due Date Timestamp Field */}
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-wider mb-2 ml-1">Task Due Expiration Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    required 
                                    value={taskForm.task_due_at} 
                                    onChange={e => setTaskForm({...taskForm, task_due_at: e.target.value})} 
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-500" 
                                />
                            </div>

                            {/* Overlay Navigation/Action Controls button segment row grouping */}
                            <div className="flex gap-4 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => { setIsTaskModalOpen(false); setSelectedIntervention(null); }} 
                                    className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md"
                                >
                                    Publish Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterventionView;