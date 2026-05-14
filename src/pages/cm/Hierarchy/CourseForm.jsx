import React, { useState } from 'react';
import { authAPI } from '../../../services/APIservice';

/**
 * CourseForm Component
 * Handles the input for Course Name, Code, and Description.
 * Data is pushed to the API using the 4-tier academic hierarchy IDs.
 */
const CourseForm = ({ deptId, programId, yearLevelId, onSuccess }) => {
    // --- LOCAL STATE ---
    const [formData, setFormData] = useState({
        course_name: '',
        course_code: '',
        description: '' // Added description to state
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- FORM SUBMISSION ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validation: Ensure all fields are filled
        if (!formData.course_name || !formData.course_code || !formData.description) {
            setError("Please provide Course Name, Code, and Description.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Constructing the payload for the API
            const payload = {
                course_name: formData.course_name.trim(),
                course_code: formData.course_code.trim().toUpperCase(),
                description: formData.description.trim()
            };

            /**
             * API Call using the hierarchy path:
             * /departments/:deptId/programs/:programId/year-levels/:yearLevelId/courses
             */
            const res = await authAPI.createCourse(
                deptId, 
                programId, 
                yearLevelId, 
                payload, 
                token
            );

            if (res.ok) {
                // Trigger success callback to refresh the parent view
                onSuccess(); 
            } else {
                const errData = await res.json();
                setError(errData.message || "Failed to create course. Please check your data.");
            }
        } catch (err) {
            setError("Network error. Please check your server connection.");
            console.error("Course Submission Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-left">
            <div className="mb-8">
                <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900">
                    Subject Details
                </h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Enter the specific information for this new course
                </p>
            </div>

            {/* Error Message Display */}
            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    
                    {/* Course Name Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                            Course Name
                        </label>
                        <input 
                            type="text"
                            placeholder="e.g. Data Structures and Algorithms"
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none"
                            value={formData.course_name}
                            onChange={(e) => setFormData({...formData, course_name: e.target.value})}
                        />
                    </div>

                    {/* Course Code Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                            Course Code
                        </label>
                        <input 
                            type="text"
                            placeholder="e.g. CS-211"
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none uppercase"
                            value={formData.course_code}
                            onChange={(e) => setFormData({...formData, course_code: e.target.value})}
                        />
                    </div>

                    {/* Course Description Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                            Course Description
                        </label>
                        <textarea 
                            placeholder="Provide a brief overview of the subject..."
                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none h-32 resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? "Registering Course..." : "Assign Subject to Year Level →"}
                </button>
            </form>
        </div>
    );
};

export default CourseForm;