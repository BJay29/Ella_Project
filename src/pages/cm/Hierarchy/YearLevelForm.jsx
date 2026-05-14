import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';

/**
 * YearLevelForm Component
 * Purpose: Manages Curriculum Year Levels (e.g., 1st Year, 2nd Year)
 * Hierarchy: Department -> Program -> Year Level
 */
const YearLevelForm = ({ deptId, programId, onNext }) => {
    // --- STATE MANAGEMENT ---
    const [yearLevels, setYearLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [yearToDelete, setYearToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    
    // State for the input fields
    const [formData, setFormData] = useState({
        year_number: '', 
        year_name: '',   
        description: ''  
    });

    /**
     * Fetches year level data based on the provided Department and Program IDs.
     */
    const fetchYearLevels = async () => {
        // Prevent API call if parent IDs are missing to avoid 404/Param errors
        if (!deptId || !programId) {
            console.warn("Fetch blocked: Missing deptId or programId", { deptId, programId });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await authAPI.getYearLevels(deptId, programId, token);
            
            if (response.ok) {
                const data = await response.json();
                // Handle various backend response structures
                const levelsArray = Array.isArray(data) ? data : (data.year_levels || []);
                setYearLevels(levelsArray);
            } else {
                console.error("API Error: Backend returned non-OK status");
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Refetch when parent IDs change
    useEffect(() => {
        fetchYearLevels();
    }, [deptId, programId]);

    /**
     * Extracts the correct ID from the object based on common backend naming conventions.
     */
    const getYearId = (year) => year?.id ?? year?.year_level_id ?? year?._id;

    /**
     * Form Submission Logic for both Creating and Updating records.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (!formData.year_name.trim() || !formData.year_number) {
            setError("Both Year Name and Number are strictly required.");
            return;
        }

        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        
        const payload = {
            year_number: parseInt(formData.year_number),
            year_name: formData.year_name.trim(),
            description: formData.description.trim()
        };

        try {
            let response;
            if (editingId) {
                // UPDATE existing record
                response = await authAPI.updateYearLevel(deptId, programId, editingId, payload, token);
            } else {
                // CREATE new record
                response = await authAPI.createYearLevel(deptId, programId, payload, token);
            }

            if (response.ok) {
                closeModal();
                fetchYearLevels();
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.message || "Failed to save. Please check your network or inputs.");
            }
        } catch (err) {
            setError("Request failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Deletion Logic
     */
    const handleDelete = async () => {
        const id = getYearId(yearToDelete);
        if (!deptId || !programId || !id) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await authAPI.deleteYearLevel(deptId, programId, id, token);
            
            if (response.ok) {
                fetchYearLevels();
                setIsDeleteModalOpen(false);
                setYearToDelete(null);
            } else {
                const data = await response.json().catch(() => ({}));
                alert(data.message || "Deletion failed");
            }
        } catch (err) {
            console.error("Delete Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- UI HELPERS ---

    const openEditModal = (e, year) => {
        e.stopPropagation(); // Stop navigation to sections
        setEditingId(getYearId(year));
        setFormData({
            year_number: year.year_number,
            year_name: year.year_name,
            description: year.description || ''
        });
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ year_number: '', year_name: '', description: '' });
        setError('');
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 text-left">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Year Levels</h2>
                    <p className="text-sm text-slate-500 font-bold tracking-tight">Manage curriculum levels for this program</p>
                </div>
                <button
                    onClick={() => { setError(''); setIsModalOpen(true); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                >
                    + Add Year Level
                </button>
            </div>

            {/* List Section */}
            {loading && yearLevels.length === 0 ? (
                <div className="py-24 text-center font-black text-slate-400 uppercase tracking-widest animate-pulse text-lg">Synchronizing Data...</div>
            ) : yearLevels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 text-slate-900">📅</div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic">No Levels Found</h3>
                    <p className="text-slate-500 text-sm mt-1 font-bold">Start by adding a curriculum year level.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {yearLevels.map((year) => (
                        <div
                            key={getYearId(year)}
                            onClick={() => onNext(getYearId(year), year.year_name)}
                            className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer text-left"
                        >
                            {/* Card Actions */}
                            <div className="absolute top-6 right-8 flex gap-4 z-20">
                                <button onClick={(e) => openEditModal(e, year)} className="text-xs font-black uppercase text-slate-400 hover:text-amber-600 transition-colors">Edit</button>
                                <button onClick={(e) => { e.stopPropagation(); setYearToDelete(year); setIsDeleteModalOpen(true); }} className="text-xs font-black uppercase text-slate-400 hover:text-red-600 transition-colors">Delete</button>
                            </div>

                            {/* Large Year Identifier */}
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all font-black text-slate-900">
                                {year.year_number}
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors">
                                {year.year_name}
                            </h3>
                            
                            {year.description && (
                                <p className="text-xs text-slate-500 font-bold italic mt-2 line-clamp-2">{year.description}</p>
                            )}
                            
                            {/* Footer Link */}
                            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">View Sections</span>
                                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-900 font-black">→</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FORM MODAL (Add/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden animate-in zoom-in duration-200 shadow-2xl">
                        <div className="bg-indigo-600 p-6 text-white text-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">{editingId ? 'Modify Year' : 'Create Year'}</h3>
                            <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mt-1">Level Configuration</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            {error && <p className="text-red-600 text-xs font-black uppercase text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                            
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-900 ml-1">Year Number (e.g., 1)</label>
                                <input
                                    required type="number"
                                    className="w-full mt-1.5 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm font-black text-slate-900 transition-all outline-none"
                                    placeholder="Enter number..."
                                    value={formData.year_number}
                                    onChange={(e) => setFormData({...formData, year_number: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-900 ml-1">Year Name (e.g., First Year)</label>
                                <input
                                    required type="text"
                                    className="w-full mt-1.5 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm font-black text-slate-900 transition-all outline-none"
                                    placeholder="Enter descriptive name..."
                                    value={formData.year_name}
                                    onChange={(e) => setFormData({...formData, year_name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-900 ml-1">Description</label>
                                <textarea
                                    className="w-full mt-1.5 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm font-bold text-slate-900 resize-none outline-none"
                                    rows="3"
                                    placeholder="Enter additional details..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 py-4 bg-slate-100 text-slate-900 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                                    {loading ? 'Processing...' : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 text-center animate-in zoom-in duration-200 shadow-2xl">
                        <div className="text-3xl mb-4">⚠️</div>
                        <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2 text-slate-900">Confirm Deletion</h3>
                        <p className="text-slate-600 text-sm mb-6 font-bold">
                            Are you sure you want to remove <span className="text-red-600 font-black italic">"{yearToDelete?.year_name}"</span>? 
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-900 font-black rounded-2xl text-xs uppercase tracking-widest">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 bg-red-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-red-200">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YearLevelForm;