import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { authAPI } from '../../../services/APIservice';
// Import Toast components for clean, modern user feedback notifications
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * CourseForm Component
 * Manages the creation and explicit deletion processes of courses within an academic hierarchy.
 * Automatically handles and prints generated registration codes within an emerald deployment card.
 */
const CourseForm = forwardRef(({ deptId, programId, yearLevelId, sectionId, onSuccess }, ref) => {
    // --- LOCAL FORM FIELDS STATE ---
    const [formData, setFormData] = useState({
        course_name: '',
        course_code: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedCode, setGeneratedCode] = useState(null);
    
    // --- OVERLAY/MODAL CONTROL STATE ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [courseIdToDelete, setCourseIdToDelete] = useState(null);
    const [courseCodeToDelete, setCourseCodeToDelete] = useState('');

    /**
     * Expose confirmDeleteCourse to parent layers using refs.
     * This prevents authorization routing crashes if mapped externally.
     */
    useImperativeHandle(ref, () => ({
        triggerExternalDelete(id, code) {
            confirmDeleteCourse(id, code);
        }
    }));

    // --- FORM SUBMISSION HANDLER (CREATE) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setGeneratedCode(null); // Clear previous results before starting network call

        // Validate local input completion
        if (!formData.course_name || !formData.course_code || !formData.description) {
            setError("Please provide Course Name, Code, and Description.");
            return;
        }

        // Validate parameter hierarchy exists to block invalid/NaN API requests
        if (!deptId || !programId || !yearLevelId || !sectionId) {
            setError("Hierarchy context missing. Verify Dept, Program, Year, and Section choices.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            const courseData = {
                course_name: formData.course_name.trim(),
                course_code: formData.course_code.trim().toUpperCase(),
                description: formData.description.trim(),
                section_id: parseInt(sectionId, 10) 
            };

            // Safeguard parsing values using fallback primitives to prevent token authorization drops
            const res = await authAPI.createCourse(
                parseInt(deptId || 0, 10), 
                parseInt(programId || 0, 10), 
                parseInt(yearLevelId || 0, 10), 
                parseInt(sectionId || 0, 10),
                courseData, 
                token
            );

            if (res.ok) {
                const result = await res.json();
                // Read join properties from flexible nested backend JSON trees
                const joinCode = result.course_join_code || result.join_code || result.data?.course_join_code || result.data?.join_code;

                // Clear input tracking states
                setFormData({ course_name: '', course_code: '', description: '' });
                
                toast.success("Course successfully created and assigned!", {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });

                if (joinCode) {
                    setGeneratedCode(joinCode);
                } else {
                    setGeneratedCode("SUCCESS_NO_CODE");
                }

                // Call parent data refresh hook
                if (onSuccess) onSuccess(); 
            } else {
                const errData = await res.json().catch(() => ({}));
                
                if (typeof errData === 'string' && errData.includes("<!DOCTYPE")) {
                    setError("Endpoint Error: The API route structure was not recognized.");
                } else {
                    setError(errData.message || "Failed to create course.");
                }
            }
        } catch (err) {
            setError("Connection failed. Please check your backend server configuration.");
            console.error("Submission Failure Context:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- DELETION INTERACTION FLOWS ---
    const confirmDeleteCourse = (id, code) => {
        setCourseIdToDelete(id);
        setCourseCodeToDelete(code);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteExecution = async () => {
        if (!courseIdToDelete) return;

        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            
            // Safe fallback logic embedded to preserve absolute parameter paths on server routing paths
            const res = await authAPI.deleteCourse(
                parseInt(deptId || 0, 10),
                parseInt(programId || 0, 10),
                parseInt(yearLevelId || 0, 10),
                parseInt(sectionId || 0, 10),
                parseInt(courseIdToDelete, 10),
                token
            );

            if (res.ok) {
                toast.error(`Course ${courseCodeToDelete || ''} successfully removed.`, {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
                
                // Clear transient contextual state flags cleanly
                setIsDeleteModalOpen(false);
                setCourseIdToDelete(null);
                setCourseCodeToDelete('');
                
                if (onSuccess) onSuccess();
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.message || "Server refused the deletion request.");
                setIsDeleteModalOpen(false);
            }
        } catch (err) {
            setError("Network error occurred during course removal.");
            console.error("Deletion Routing Fault:", err);
            setIsDeleteModalOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-left relative">
            <ToastContainer />

            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900">
                        Create New Course
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                        Assign a syllabus entry to the selected academic section
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    
                    {/* Course Title */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                            Course Title
                        </label>
                        <input 
                            type="text"
                            placeholder="e.g. Data Structures and Algorithms"
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none"
                            value={formData.course_name}
                            onChange={(e) => setFormData({...formData, course_name: e.target.value})}
                        />
                    </div>

                    {/* Course Code */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                            Course Code
                        </label>
                        <input 
                            type="text"
                            placeholder="e.g. CS-201"
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none uppercase"
                            value={formData.course_code}
                            onChange={(e) => setFormData({...formData, course_code: e.target.value})}
                        />
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                            Description
                        </label>
                        <textarea 
                            placeholder="Detail the course syllabus and learning objectives..."
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none h-32 resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? "Syncing with Server..." : "Create Course Entry →"}
                </button>
            </form>

            {/* DEPLOYMENT METRICS INFOCARD */}
            {generatedCode && (
                <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-[2rem] p-6 relative overflow-hidden">
                        <div className="absolute right-4 bottom-2 text-6xl opacity-10 select-none pointer-events-none">
                            ✨
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                ✓
                            </div>
                            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                                Deployment Success Card
                            </h4>
                        </div>

                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide leading-relaxed">
                            Course successfully initialized. Share this auto-generated code with students for immediate enrollment:
                        </p>

                        <div className="mt-4 p-4 bg-white rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
                            <span className="text-2xl font-black text-indigo-600 tracking-widest uppercase select-all font-mono">
                                {generatedCode === "SUCCESS_NO_CODE" ? "DEPLOYED" : generatedCode}
                            </span>
                            <button 
                                onClick={() => {
                                    if (generatedCode !== "SUCCESS_NO_CODE") {
                                        navigator.clipboard.writeText(generatedCode);
                                        toast.info("Code copied to clipboard!", { position: "top-right", autoClose: 1500 });
                                    }
                                }}
                                className="text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all bg-slate-50 hover:bg-indigo-50 px-3 py-2 rounded-lg"
                            >
                                {generatedCode === "SUCCESS_NO_CODE" ? "Active" : "Copy Code"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL OVERLAY PORTAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 shadow-2xl">
                        <div className="bg-rose-500 p-6 text-white text-center">
                            <div className="text-3xl mb-2">🗑️</div>
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">Delete Course</h3>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                                Are you sure you want to delete course <span className="font-black text-gray-800">"{courseCodeToDelete}"</span>?
                                <br /><br />
                                <span className="text-rose-500 font-bold uppercase text-[10px]">Warning:</span> This action is permanent and will drop all students enrolled via this course code.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsDeleteModalOpen(false); setCourseIdToDelete(null); }}
                                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteExecution}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 transition-all active:scale-95 disabled:bg-slate-300"
                                >
                                    {loading ? 'Deleting...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

// Set descriptive display name for dev tools troubleshooting reference
CourseForm.displayName = 'CourseForm';

export default CourseForm;