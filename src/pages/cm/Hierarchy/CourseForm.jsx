import React, { useState } from 'react';
import { authAPI } from '../../../services/APIservice';
// Import Toast for modern notifications
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * CourseForm Component
 * Manages the creation and deletion of courses within a specific academic hierarchy.
 * Displays the generated course join code upon successful creation.
 */
const CourseForm = ({ deptId, programId, yearLevelId, sectionId, onSuccess }) => {
    // --- LOCAL STATE ---
    const [formData, setFormData] = useState({
        course_name: '',
        course_code: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedCode, setGeneratedCode] = useState(null);
    
    // States added for managing course deletion
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [courseIdToDelete, setCourseIdToDelete] = useState(null);
    const [courseCodeToDelete, setCourseCodeToDelete] = useState('');

    // --- FORM SUBMISSION (CREATE) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation: Ensure all form fields are filled
        if (!formData.course_name || !formData.course_code || !formData.description) {
            setError("Please provide Course Name, Code, and Description.");
            return;
        }

        // Validation: Ensure the full hierarchy is selected from the parent
        if (!deptId || !programId || !yearLevelId || !sectionId) {
            setError("Hierarchy incomplete. Please ensure Dept, Program, Year, and Section are selected.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            const courseData = {
                course_name: formData.course_name.trim(),
                course_code: formData.course_code.trim().toUpperCase(),
                description: formData.description.trim(),
                section_id: parseInt(sectionId) 
            };

            const res = await authAPI.createCourse(
                parseInt(deptId), 
                parseInt(programId), 
                parseInt(yearLevelId), 
                parseInt(sectionId),
                courseData, 
                token
            );

            if (res.ok) {
                const result = await res.json();
                // Extract course_join_code from the backend payload structure
                const joinCode = result.course_join_code || result.data?.course_join_code;

                // Clear local form state
                setFormData({ course_name: '', course_code: '', description: '' });
                
                // Trigger Top-Right Toast Notification
                toast.success("Course successfully created and assigned!", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                });

                // Display the join code if returned by the backend server
                if (joinCode) {
                    setGeneratedCode(joinCode);
                }

                // Trigger parent refresh callback
                if (onSuccess) onSuccess(); 
            } else {
                const errData = await res.json();
                
                // Handle API error messages
                if (typeof errData === 'string' && errData.includes("<!DOCTYPE")) {
                    setError("Endpoint Error: The API route structure was not recognized.");
                } else {
                    setError(errData.message || "Failed to create course.");
                }
            }
        } catch (err) {
            setError("Connection failed. Please check your backend server.");
            console.error("Submission Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- DELETION HANDLERS ---
    /**
     * Prepares the component state for deleting a course and displays the modal.
     * Call this function from your course list mapping if rendering courses inside this view.
     */
    const confirmDeleteCourse = (id, code) => {
        setCourseIdToDelete(id);
        setCourseCodeToDelete(code);
        setIsDeleteModalOpen(true);
    };

    /**
     * Executes the API call to permanently delete a course entry.
     */
    const handleDelete = async () => {
        if (!courseIdToDelete) return;

        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            
            // Ensure your authAPI service contains deleteCourse mapping to DELETE /api/...
            const res = await authAPI.deleteCourse(
                parseInt(deptId),
                parseInt(programId),
                parseInt(yearLevelId),
                parseInt(sectionId),
                parseInt(courseIdToDelete),
                token
            );

            if (res.ok) {
                toast.error(`Course ${courseCodeToDelete} successfully deleted.`, {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                });
                
                // Reset deletion state variables
                setIsDeleteModalOpen(false);
                setCourseIdToDelete(null);
                setCourseCodeToDelete('');
                
                // Refresh data structures on the parent layer
                if (onSuccess) onSuccess();
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.message || "Server refused the deletion request.");
                setIsDeleteModalOpen(false);
            }
        } catch (err) {
            setError("Network error occurred during course removal.");
            console.error("Delete Error:", err);
            setIsDeleteModalOpen(false);
        } finally {
            setLoading(false);
        }
    };

    // --- UI STATE RESET ---
    const handleCloseSuccessScreen = () => {
        setGeneratedCode(null);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-left relative">
            {/* Toast Container to render the notifications */}
            <ToastContainer />

            {!generatedCode ? (
                <>
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

                    {/* Error Feedback */}
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

                            {/* Catalog Code */}
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

                            {/* Description */}
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

                        {/* Submit Action */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? "Syncing with Server..." : "Create Course Entry →"}
                        </button>
                    </form>
                </>
            ) : (
                /* Generated Course Join Code Success Screen Overlay View */
                <div className="p-4 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">
                        ✅
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                        Course Created!
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
                        Share this join code with your students for enrollment:
                    </p>
                    
                    <div className="mt-6 p-6 bg-indigo-50 rounded-[2rem] border-2 border-dashed border-indigo-200 shadow-sm">
                        <span className="text-4xl font-black text-indigo-600 tracking-widest block select-all">
                            {generatedCode}
                        </span>
                    </div>

                    <button
                        onClick={handleCloseSuccessScreen}
                        className="w-full mt-8 py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-[0.99]"
                    >
                        Got it, Close
                    </button>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL OVERLAY */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
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
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 transition-all active:scale-95"
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
};

export default CourseForm;