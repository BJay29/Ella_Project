import React, { useState, useEffect } from 'react';
// Inayos ang path at case sensitivity
import { authAPI } from '../../../services/APIservice';

const CourseForm = ({ onNext }) => {
    // --- STATES ---
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    // Form State na tugma sa hininging design
    const [newCourse, setNewCourse] = useState({
        course_name: '',
        school_year: '2025-2026',
        semester: '1st Semester',
        course_code: '',
        description: ''
    });

    // --- API ACTIONS ---

    const fetchCourses = async () => {
        // Safety check para sa import error
        if (!authAPI || typeof authAPI.getMyCourses !== 'function') {
            console.error("authAPI.getMyCourses is not defined. Check your APIService.js exports.");
            setError("Internal Error: API Service mismatch (getMyCourses not found)");
            return;
        }

        setLoading(true);
        setError(''); // I-clear ang error bago mag-fetch
        try {
            const token = localStorage.getItem('token');
            const response = await authAPI.getMyCourses(token);
            
            if (response.ok) {
                const data = await response.json();
                console.log("Raw API Data Received:", data); // Debugging: Para makita ang ID key

                /**
                 * FIX: Ang API mo ay nagbabalik ng { courses: [...] } base sa console log.
                 * Sinisiguro natin dito na ang array ang mailalagay sa state.
                 */
                let coursesArray = [];
                if (Array.isArray(data)) {
                    coursesArray = data;
                } else if (data && data.courses && Array.isArray(data.courses)) {
                    coursesArray = data.courses;
                } else {
                    coursesArray = [];
                }
                
                setCourses(coursesArray);
            } else {
                const errData = await response.json().catch(() => ({}));
                setError(errData.message || "Failed to load subjects");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Connection error to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleAddCourse = async (e) => {
        e.preventDefault();
        
        // Validation bago mag-API call
        if(!newCourse.course_code || !newCourse.course_name) {
            setError("Course Title and Code are required");
            return;
        }
        
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            
            // Payload structure
            const payload = {
                course_name: newCourse.course_name,
                description: newCourse.description,
                course_code: newCourse.course_code,
                school_year: newCourse.school_year,
                semester: newCourse.semester
            };

            const response = editingId 
                ? await authAPI.updateCourse(editingId, payload, token)
                : await authAPI.createCourse(payload, token);

            if (response.ok) {
                // I-refresh ang listahan
                await fetchCourses(); 
                closeModal();
            } else {
                const data = await response.json().catch(() => ({}));
                if (response.status === 500) {
                    setError("Server Error (500): Check if DB columns match your payload.");
                } else {
                    setError(data.message || "Error saving subject");
                }
            }
        } catch (err) {
            console.error("Submit error:", err);
            setError("Server connection failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); 
        if(!id) {
            alert("Cannot delete: Missing ID");
            return;
        }

        if(window.confirm("Are you sure you want to delete this subject?")) {
            try {
                const token = localStorage.getItem('token');
                const response = await authAPI.deleteCourse(id, token);
                if (response.ok) {
                    fetchCourses();
                } else {
                    alert("Failed to delete from server.");
                }
            } catch (err) {
                console.error("Delete error:", err);
            }
        }
    };

    // --- UI LOGIC ---

    const openEditModal = (e, course) => {
        e.stopPropagation(); 
        /**
         * DETECTION FIX: Kinukuha ang tamang ID sa database record.
         * Base sa console image mo, 'id' o 'course_id' ang field name.
         */
        const cId = course.id || course.course_id || course._id;
        
        if (!cId) {
            console.error("Missing ID in object:", course);
            alert("Warning: Cannot edit. Course ID missing from data.");
            return;
        }

        setEditingId(cId);
        setNewCourse({ 
            course_name: course.course_name,
            school_year: course.school_year || '2025-2026',
            semester: course.semester || '1st Semester',
            course_code: course.course_code, 
            description: course.description || '' 
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setError('');
        setNewCourse({ 
            course_name: '', 
            school_year: '2025-2026', 
            semester: '1st Semester', 
            course_code: '', 
            description: '' 
        });
    };

    const filteredCourses = courses.filter(course => 
        course.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        course.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* --- HEADER & CONTROLS --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 text-left">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase italic">
                        Select Subject
                    </h2>
                    <p className="text-sm text-gray-400 font-medium tracking-tight">
                        Choose a course/subject to begin building activities
                    </p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input 
                            type="text" 
                            placeholder="Search subject..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all text-left"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-3 top-3 opacity-30 text-xs">🔍</span>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-indigo-100"
                    >
                        + Add Subject
                    </button>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            {loading && courses.length === 0 ? (
                <div className="py-24 text-center font-black uppercase text-gray-300 animate-pulse italic">
                    Loading Subjects...
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-100 rounded-[3rem]">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-3xl mb-4">
                        📚
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">No Subjects Found</h3>
                    <p className="text-gray-400 text-sm mt-1 max-w-[250px] text-center">
                        Wala pang nakalistang subject. Gamitin ang button sa taas para mag-add.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => {
                        /**
                         * FIX: Sinisiguro nito na makuha ang tamang ID key mula sa database record.
                         * Importante ito para sa onNext at para sa backend calls.
                         */
                        const currentCourseId = course.id || course.course_id || course._id;
                        
                        return (
                            <div 
                                key={currentCourseId || Math.random()}
                                onClick={() => {
                                    if (currentCourseId) {
                                        console.log("Navigating to course with ID:", currentCourseId);
                                        onNext(currentCourseId, course.course_name);
                                    } else {
                                        console.error("Course object without ID:", course);
                                        alert("Error: Course ID not found in database record. Check console.");
                                    }
                                }}
                                className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                                
                                <div className="absolute top-6 right-8 flex gap-4 z-20">
                                    <button 
                                        onClick={(e) => openEditModal(e, course)}
                                        className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-amber-500 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(e, currentCourseId)}
                                        className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>

                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                    📖
                                </div>

                                <div className="space-y-2 text-left">
                                    <h3 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors">
                                        {course.course_code}
                                    </h3>
                                    <p className="text-[11px] text-indigo-500 font-black uppercase tracking-widest">
                                        {course.course_name}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium italic line-clamp-2 mt-2">
                                        {course.description || "No description provided."}
                                    </p>
                                </div>

                                <div className="mt-10 pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <div className="flex flex-col text-left">
                                        <span className="text-gray-300 text-[9px] font-black uppercase tracking-widest">Active Sections</span>
                                        <span className="text-lg font-black text-gray-700">{course.sectionCount || 0}</span>
                                    </div>
                                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <span className="font-bold">→</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* --- ADD/EDIT SUBJECT MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 shadow-2xl">
                        <div className="p-8 pb-0">
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">
                                {editingId ? 'EDIT COURSE' : 'SETUP NEW COURSE'}
                            </h3>
                            {error && (
                                <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-widest bg-red-50 p-2 rounded-lg">
                                    {error}
                                </p>
                            )}
                        </div>
                        
                        <form onSubmit={handleAddCourse} className="p-8 space-y-6">
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Course Title *</label>
                                <input 
                                    required
                                    type="text"
                                    className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-left placeholder:text-slate-300"
                                    placeholder="e.g. Programming 2"
                                    value={newCourse.course_name}
                                    onChange={(e) => setNewCourse({...newCourse, course_name: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">School Year</label>
                                    <input 
                                        type="text"
                                        className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-left"
                                        value={newCourse.school_year}
                                        onChange={(e) => setNewCourse({...newCourse, school_year: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Semester</label>
                                    <select 
                                        className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-left appearance-none"
                                        value={newCourse.semester}
                                        onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                                    >
                                        <option value="1st Semester">1st Semester</option>
                                        <option value="2nd Semester">2nd Semester</option>
                                        <option value="Summer">Summer</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Course Code</label>
                                <input 
                                    required
                                    type="text"
                                    className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-left placeholder:text-slate-300"
                                    placeholder="e.g. CS101"
                                    value={newCourse.course_code}
                                    onChange={(e) => setNewCourse({...newCourse, course_code: e.target.value.toUpperCase()})}
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
                                <textarea 
                                    rows="3"
                                    className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-left placeholder:text-slate-300"
                                    placeholder="Course description..."
                                    value={newCourse.description}
                                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-5 bg-[#00b341] hover:bg-[#009e3a] text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseForm;