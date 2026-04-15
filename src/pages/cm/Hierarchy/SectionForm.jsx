import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';

// SectionForm receives courseId, deptId, programId — all needed for CRUD operations
const SectionForm = ({ courseId, deptId, programId, onNext }) => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [generatedCode, setGeneratedCode] = useState(null);

    const [formData, setFormData] = useState({
        section_name: '',
        school_year:  '2025-2026',
        semester:     '1st Semester'
    });

    // ── Helper to read section ID from any field name ─────────────────────
    const getSectionId = (section) => {
        return section?.section_id ?? section?.id ?? section?._id ?? null;
    };

    // ── Fetch sections (FIXED: Uses the 3 required IDs) ────────────────────
    const fetchSections = async () => {
        // Stop if any parent ID is missing
        if (!courseId || !deptId || !programId) {
            console.warn("Fetch blocked: Missing parent IDs", { courseId, deptId, programId });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Pinapasa ang courseId, deptId, at programId sa API call
            const response = await authAPI.getSections(courseId, deptId, programId, token);
            
            if (response.ok) {
                const result = await response.json();
                
                // Flexible mapping para sa iba't ibang backend response structures
                let finalData = [];
                if (Array.isArray(result)) {
                    finalData = result;
                } else if (result.sections) {
                    finalData = result.sections;
                } else if (result.data) {
                    finalData = Array.isArray(result.data) ? result.data : (result.data.sections || []);
                }
                
                setSections(finalData);
            } else {
                console.error("Fetch Error Status:", response.status);
                setSections([]);
            }
        } catch (err) {
            console.error("Fetch sections error:", err);
            setSections([]);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch tuwing nagbabago ang selection sa taas (Course/Dept/Program)
    useEffect(() => {
        fetchSections();
    }, [courseId, deptId, programId]);

    // ── Create / Update ───────────────────────────────────────────────────
    const handleSaveSection = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let response;

            if (editingId) {
                // ✅ Update: courseId, deptId, programId, sectionId, formData, token
                response = await authAPI.updateSection(
                    courseId, deptId, programId, editingId, formData, token
                );
            } else {
                // ✅ Create: courseId, deptId, programId, formData, token
                response = await authAPI.createSection(
                    courseId, deptId, programId, formData, token
                );
            }

            if (response.ok) {
                const result = await response.json();
                // Kunin ang generated code kung bagong gawa
                const newCode = result.section_code || result.data?.section_code;
                
                if (!editingId && newCode) {
                    setGeneratedCode(newCode);
                } else {
                    closeModal();
                }
                fetchSections(); // Refresh UI
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message || "Failed to save section.");
            }
        } catch (err) {
            console.error("Save section error:", err);
            alert("An error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (e, section) => {
        e.stopPropagation();
        setSectionToDelete(section);
        setIsDeleteModalOpen(true);
    };

    // ── Delete ────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!sectionToDelete) return;
        const sectionId = getSectionId(sectionToDelete);
        if (!sectionId) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // ✅ Delete: courseId, deptId, programId, sectionId, token
            const response = await authAPI.deleteSection(
                courseId, deptId, programId, sectionId, token
            );
            
            if (response.ok) {
                await fetchSections();
                setIsDeleteModalOpen(false);
                setSectionToDelete(null);
            } else {
                const data = await response.json().catch(() => ({}));
                alert(data.message || "Delete failed.");
            }
        } catch (err) {
            console.error("Delete section error:", err);
        } finally {
            setLoading(false);
        }
    };

    // ── UI helpers ────────────────────────────────────────────────────────
    const openEditModal = (e, section) => {
        e.stopPropagation();
        const id = getSectionId(section);
        setEditingId(id);
        setFormData({
            section_name: section.section_name || '',
            school_year:  section.school_year  || '2025-2026',
            semester:     section.semester     || '1st Semester'
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setGeneratedCode(null);
        setFormData({ section_name: '', school_year: '2025-2026', semester: '1st Semester' });
    };

    const filteredSections = sections.filter(sec =>
        sec.section_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sec.section_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* --- HEADER & CONTROLS --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase italic text-left">
                        Select Section
                    </h2>
                    <p className="text-sm text-gray-400 font-medium tracking-tight text-left">
                        Manage classes for this subject
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 text-left">
                        <input
                            type="text"
                            placeholder="Search section or code..."
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
                        + Add Section
                    </button>
                </div>
            </div>

            {/* --- CONTENT --- */}
            {loading && sections.length === 0 ? (
                <div className="py-24 text-center font-black text-gray-200 italic animate-pulse tracking-widest">
                    LOADING SECTIONS...
                </div>
            ) : filteredSections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-100 rounded-[3rem]">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-3xl mb-4">👥</div>
                    <h3 className="text-xl font-bold text-gray-800">No Sections Found</h3>
                    <p className="text-gray-400 text-sm mt-1">Add a section to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredSections.map((section) => {
                        const sectionId = getSectionId(section);
                        return (
                            <div
                                key={sectionId || section.section_name}
                                onClick={() => onNext(sectionId, section.section_name)}
                                className="group relative bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden text-center"
                            >
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button
                                        onClick={(e) => openEditModal(e, section)}
                                        className="text-[9px] font-black uppercase text-amber-500 bg-amber-50 px-2 py-1 rounded-lg hover:bg-amber-500 hover:text-white transition-all"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => confirmDelete(e, section)}
                                        className="text-[9px] font-black uppercase text-red-500 bg-red-50 px-2 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        Del
                                    </button>
                                </div>

                                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-xl mx-auto mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    🏫
                                </div>

                                <h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors">
                                    {section.section_name}
                                </h3>

                                <div className="mt-2 space-y-1">
                                    <p className="text-[10px] font-black text-indigo-500 bg-indigo-50 inline-block px-3 py-1 rounded-full uppercase tracking-tighter">
                                        Code: {section.section_code || '—'}
                                    </p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">
                                        {section.semester} | {section.school_year}
                                    </p>
                                </div>

                                <div className="absolute bottom-0 left-0 w-0 h-1 bg-indigo-600 group-hover:w-full transition-all duration-500" />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* --- ADD / EDIT MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left text-gray-800">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden animate-in zoom-in duration-200 shadow-2xl">
                        {!generatedCode ? (
                            <>
                                <div className="bg-indigo-600 p-6 text-white text-center">
                                    <h3 className="text-xl font-black uppercase tracking-tighter italic">
                                        {editingId ? 'Edit Section' : 'Create Section'}
                                    </h3>
                                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">
                                        Class Assignment
                                    </p>
                                </div>

                                <form onSubmit={handleSaveSection} className="p-8 space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            Section Name
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-left"
                                            placeholder="e.g., BSIT-1A"
                                            value={formData.section_name}
                                            onChange={(e) => setFormData({ ...formData, section_name: e.target.value.toUpperCase() })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                                Semester
                                            </label>
                                            <select
                                                className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                                value={formData.semester}
                                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                            >
                                                <option>1st Semester</option>
                                                <option>2nd Semester</option>
                                                <option>Summer</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                                School Year
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-left"
                                                placeholder="2025-2026"
                                                value={formData.school_year}
                                                onChange={(e) => setFormData({ ...formData, school_year: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {loading ? 'SAVING...' : (editingId ? 'Update Section' : 'Save Section')}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            /* ── SUCCESS: Generated Code View ── */
                            <div className="p-10 text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                                    ✅
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter">
                                    Section Created!
                                </h3>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">
                                    Share this code with your students:
                                </p>
                                <div className="mt-6 p-6 bg-indigo-50 rounded-[2rem] border-2 border-dashed border-indigo-200">
                                    <span className="text-4xl font-black text-indigo-600 tracking-widest">
                                        {generatedCode}
                                    </span>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="w-full mt-8 py-4 bg-gray-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                                >
                                    Got it, Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left text-gray-800">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-red-500 p-6 text-white text-center">
                            <div className="text-3xl mb-2">⚠️</div>
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">Delete Section?</h3>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                                Are you sure you want to delete{' '}
                                <span className="font-black text-gray-800">"{sectionToDelete?.section_name}"</span>?
                                Students will lose access to this section.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsDeleteModalOpen(false); setSectionToDelete(null); }}
                                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionForm;