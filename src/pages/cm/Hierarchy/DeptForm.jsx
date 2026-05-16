import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';

/**
 * DeptForm Component
 * The entry point of the Academic Structure.
 * Manages Departments and handles cascading deletion via backend integration.
 */
const DeptForm = ({ onNext }) => {
    // --- STATE MANAGEMENT ---
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    
    // Initial state for Department form
    const [newDept, setNewDept] = useState({
        department_name: '',
        department_code: '',
        department_description: '' 
    });

    // --- FETCH DATA ---
    /**
     * Fetches all departments from the database.
     * Ensure backend endpoint: GET /api/curriculum-manager/departments
     */
    const fetchDepts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await authAPI.getDepartments(token); 
            if (response.ok) {
                const data = await response.json();
                const deptsArray = Array.isArray(data) ? data : (data.departments || []);
                setDepartments(deptsArray);
            } else {    
                const errorData = await response.json().catch(() => ({}));
                console.error("Fetch failed:", errorData.message);
            }
        } catch (err) {
            console.error("Failed to fetch departments:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepts();
    }, []);

    /**
     * Extracts ID securely from department object regardless of backend naming conventions.
     */
    const getDeptId = (dept) => {
        if (!dept) return null;
        return dept.dept_id ?? dept.id ?? dept._id ?? dept.department_id ?? null;
    };

    // --- CREATE / UPDATE HANDLER ---
    const handleAddDept = async (e) => {
        e.preventDefault();
        
        if (!newDept.department_name.trim() || !newDept.department_code.trim()) {
            setError("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        setError('');

        const payload = {
            department_name: newDept.department_name.trim(),
            department_code: newDept.department_code.trim().toUpperCase(),
            department_description: newDept.department_description?.trim() || ""
        };

        try {
            const token = localStorage.getItem('token');
            let response;
            
            if (editingId) {
                response = await authAPI.updateDepartment(editingId, payload, token);
            } else {
                response = await authAPI.createDepartment(payload, token);
            }

            if (response.ok) {
                await fetchDepts();
                closeModal();
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.message || data.error || `Server Error (${response.status})`);
            }
        } catch (err) {
            setError("Connection error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- DELETE HANDLERS ---
    const confirmDelete = (e, dept) => {
        e.stopPropagation(); // Prevents triggers like navigating to Programs when clicking delete button
        setDeptToDelete(dept);
        setIsDeleteModalOpen(true);
    };

    /**
     * Executes deletion of the chosen department.
     * Backend trigger will handle ON DELETE CASCADE to automatically clear 
     * all nested Programs, Year Levels, Sections, and Courses linked to this department ID.
     */
    const handleDelete = async () => {
        const id = getDeptId(deptToDelete);
        if (!id) {
            alert("Error: Department ID could not be identified.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await authAPI.deleteDepartment(id, token);
            if (response.ok) {
                // Refresh list to accurately represent data post cascade deletion
                await fetchDepts();
                setIsDeleteModalOpen(false);
                setDeptToDelete(null);
            } else {
                const data = await response.json().catch(() => ({}));
                alert(data.message || "Delete process failed on the server.");
            }
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Network error occurred during cascade deletion.");
        } finally {
            setLoading(false);
        }
    };

    // --- MODAL CONTROLS ---
    const openEditModal = (e, dept) => {
        e.stopPropagation();
        const id = getDeptId(dept);
        setEditingId(id);
        setNewDept({
            department_name: dept.department_name,
            department_code: dept.department_code,
            department_description: dept.department_description || dept.description || '' 
        });
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setError('');
        setNewDept({ department_name: '', department_code: '', department_description: '' });
    };

    // --- SEARCH FILTER ---
    const filteredDepts = departments.filter(dept =>
        dept.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.department_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 text-left">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase italic">
                        Departments
                    </h2>
                    <p className="text-sm text-gray-400 font-medium tracking-tight">
                        Primary Academic Units
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Search department..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-3 top-3 opacity-30 text-xs">🔍</span>
                    </div>
                    <button
                        onClick={() => { setError(''); setIsModalOpen(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-indigo-100"
                    >
                        + Add Dept
                    </button>
                </div>
            </div>

            {/* List Section */}
            {loading && departments.length === 0 ? (
                <div className="py-24 text-center font-black text-gray-300 uppercase tracking-widest animate-pulse">Loading Departments...</div>
            ) : filteredDepts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-100 rounded-[3rem]">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">🏫</div>
                    <h3 className="text-xl font-bold text-gray-800">No Departments Found</h3>
                    <p className="text-gray-400 text-sm mt-1 max-w-[250px] text-center">
                        Add a department to start building the academic structure.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDepts.map((dept) => {
                        const deptId = getDeptId(dept);
                        return (
                            <div
                                key={deptId || dept.department_code}
                                onClick={() => deptId && onNext(deptId, dept.department_name)}
                                className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden text-left"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500" />
                                <div className="absolute top-6 right-8 flex gap-4 z-20">
                                    <button
                                        onClick={(e) => openEditModal(e, dept)}
                                        className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-amber-500 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => confirmDelete(e, dept)}
                                        className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                    🏢
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors">
                                        {dept.department_code}
                                    </h3>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                        {dept.department_name}
                                    </p>
                                </div>
                                <div className="mt-10 pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Select Department</span>
                                    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <span className="font-bold">→</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden animate-in zoom-in duration-200 shadow-2xl">
                        <div className="bg-indigo-600 p-6 text-white text-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">
                                {editingId ? 'Update Department' : 'Create Department'}
                            </h3>
                            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">Academic Unit Management</p>
                        </div>
                        <form onSubmit={handleAddDept} className="p-8 space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-100 p-3 rounded-xl">
                                    <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Abbreviation (e.g. CICS)</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
                                    placeholder="Enter abbreviation..."
                                    value={newDept.department_code}
                                    onChange={(e) => setNewDept({...newDept, department_code: e.target.value.toUpperCase()})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full College Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
                                    placeholder="Enter full name..."
                                    value={newDept.department_name}
                                    onChange={(e) => setNewDept({...newDept, department_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description (Optional)</label>
                                <textarea
                                    className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all resize-none placeholder:text-gray-400"
                                    placeholder="Tell something about this college..."
                                    rows="3"
                                    value={newDept.department_description}
                                    onChange={(e) => setNewDept({...newDept, department_description: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
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
                                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : (editingId ? 'Update' : 'Save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CASCADE DELETE MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 shadow-2xl">
                        <div className="bg-red-500 p-6 text-white text-center">
                            <div className="text-3xl mb-2">⚠️</div>
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">Confirm Full Deletion</h3>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                                Are you sure you want to delete <span className="font-black text-gray-800">"{deptToDelete?.department_code}"</span>? 
                                <br /><br />
                                <span className="text-red-500 font-bold uppercase text-[10px]">Warning:</span> This will permanently remove all <strong>Programs, Year Levels, Sections, and Courses</strong> under this department.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-red-100 transition-all active:scale-95"
                                >
                                    {loading ? 'Deleting...' : 'Yes, Delete All'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeptForm;