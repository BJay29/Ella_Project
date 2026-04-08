import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';

const DeptForm = ({ courseId, onNext }) => {
    // State para sa listahan mula sa backend
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    
    // Updated State to match backend keys
    const [newDept, setNewDept] = useState({
        department_name: '',
        department_code: '',
        description: ''
    });

    // 1. FETCH DEPARTMENTS FROM BACKEND
    const fetchDepts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await authAPI.getDepartments(courseId, token);
            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (err) {
            console.error("Failed to fetch departments:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) fetchDepts();
    }, [courseId]);

    // 2. CREATE OR UPDATE LOGIC
    const handleAddDept = async (e) => {
        e.preventDefault();
        if(!newDept.department_name || !newDept.department_code) return;

        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            let response;

            if (editingId) {
                // UPDATE API CALL
                response = await authAPI.updateDepartment(editingId, newDept, token);
            } else {
                // CREATE API CALL
                response = await authAPI.createDepartment(courseId, newDept, token);
            }

            if (response.ok) {
                fetchDepts(); // Refresh list
                closeModal();
            } else {
                const data = await response.json();
                setError(data.message || "Operation failed");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    // 3. DELETE LOGIC
    const handleDelete = async (e, id) => {
        e.stopPropagation(); 
        if(window.confirm("Are you sure you want to delete this department?")) {
            try {
                const token = localStorage.getItem('token');
                const response = await authAPI.deleteDepartment(id, token);
                if (response.ok) fetchDepts();
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    const openEditModal = (e, dept) => {
        e.stopPropagation(); 
        setEditingId(dept.id);
        setNewDept({ 
            department_name: dept.department_name, 
            department_code: dept.department_code,
            description: dept.description || '' 
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setError('');
        setNewDept({ department_name: '', department_code: '', description: '' });
    };

    const filteredDepts = departments.filter(dept => 
        dept.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        dept.department_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* --- HEADER & CONTROLS --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase italic text-left">
                        Departments
                    </h2>
                    <p className="text-sm text-gray-400 font-medium tracking-tight text-left">
                        Select a college department for this subject
                    </p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input 
                            type="text" 
                            placeholder="Search department..."
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
                        + Add Dept
                    </button>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            {loading && departments.length === 0 ? (
                <div className="py-24 text-center font-black text-gray-300 uppercase tracking-widest animate-pulse">Loading Departments...</div>
            ) : filteredDepts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-100 rounded-[3rem]">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">
                        🏫
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">No Departments Found</h3>
                    <p className="text-gray-400 text-sm mt-1 max-w-[250px] text-center">
                        Magsimula sa pag-add ng bagong departamento gamit ang button sa taas.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDepts.map((dept) => (
                        <div 
                            key={dept.id}
                            onClick={() => onNext(dept.id, dept.department_name)}
                            className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-full h-2 bg-indigo-500`} />
                            
                            {/* --- QUICK ACTIONS --- */}
                            <div className="absolute top-6 right-8 flex gap-4 z-20">
                                <button 
                                    onClick={(e) => openEditModal(e, dept)}
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-amber-500 transition-colors"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(e, dept.id)}
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>

                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                🏢
                            </div>

                            <div className="space-y-2 text-left">
                                <h3 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors">
                                    {dept.department_code}
                                </h3>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                    {dept.department_name}
                                </p>
                                {dept.description && (
                                    <p className="text-[10px] text-gray-300 line-clamp-2 italic font-medium">{dept.description}</p>
                                )}
                            </div>

                            <div className="mt-10 pt-6 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                    Select Department
                                </span>
                                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <span className="font-bold">→</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- ADD/EDIT DEPARTMENT MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-indigo-600 p-6 text-white text-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">
                                {editingId ? 'Edit Department' : 'Create Department'}
                            </h3>
                            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">University Structure</p>
                        </div>
                        
                        <form onSubmit={handleAddDept} className="p-8 space-y-5">
                            {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}
                            
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Abbreviation (e.g. CICS)</label>
                                <input 
                                    required
                                    type="text"
                                    className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-left"
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
                                    className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-left"
                                    placeholder="Enter full name..."
                                    value={newDept.department_name}
                                    onChange={(e) => setNewDept({...newDept, department_name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description (Optional)</label>
                                <textarea 
                                    className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all text-left resize-none"
                                    placeholder="Tell something about this college..."
                                    rows="3"
                                    value={newDept.description}
                                    onChange={(e) => setNewDept({...newDept, description: e.target.value})}
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
                                    {loading ? 'Processing...' : (editingId ? 'Update Department' : 'Save Department')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeptForm;