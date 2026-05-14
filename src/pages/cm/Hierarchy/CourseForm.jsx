import React, { useState } from 'react';
import { authAPI } from '../../../services/APIservice';
// 1. Import Toast for modern notifications
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * CourseForm Component
 * Manages the creation of courses within a specific academic hierarchy.
 * Replaced window.alert with Top-Right Toast notifications.
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

    // --- FORM SUBMISSION ---
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
                // Clear local form state
                setFormData({ course_name: '', course_code: '', description: '' });
                
                // 2. Trigger Top-Right Toast Notification
                toast.success("Course successfully created and assigned!", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                });

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

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-left">
            {/* 3. Toast Container to render the notifications */}
            <ToastContainer />

            <div className="mb-8">
                <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900">
                    Create New Course
                </h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Assign a syllabus entry to the selected academic section
                </p>
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
        </div>
    );
};

export default CourseForm;