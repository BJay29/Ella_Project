import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';

const ProgramForm = ({ deptId, onNext }) => {
    const [programs, setPrograms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    
    // Updated State to match requested keys
    const [newProgram, setNewProgram] = useState({ 
        program_name: '', 
        program_code: '',
        description: ''
    });

    // 1. FETCH PROGRAMS FROM BACKEND
    const fetchPrograms = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Siguraduhin na may getPrograms method ka sa authAPI
            const response = await authAPI.getPrograms(deptId, token);
            if (response.ok) {
                const data = await response.json();
                setPrograms(data);
            }
        } catch (err) {
            console.error("Failed to fetch programs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (deptId) fetchPrograms();
    }, [deptId]);

    // 2. CREATE OR UPDATE LOGIC
    const handleAddProgram = async (e) => {
        e.preventDefault();
        if(!newProgram.program_name || !newProgram.program_code) return;

        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            let response;

            if (editingId) {
                // UPDATE API CALL
                response = await authAPI.updateProgram(editingId, newProgram, token);
            } else {
                // CREATE API CALL
                response = await authAPI.createProgram(deptId, newProgram, token);
            }

            if (response.ok) {
                fetchPrograms(); // Refresh list
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
        if(window.confirm("Are you sure you want to delete this program?")) {
            try {
                const token = localStorage.getItem('token');
                const response = await authAPI.deleteProgram(id, token);
                if (response.ok) fetchPrograms();
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    const openEditModal = (e, prog) => {
        e.stopPropagation(); 
        setEditingId(prog.id);
        setNewProgram({ 
            program_name: prog.program_name, 
            program_code: prog.program_code,
            description: prog.description || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setError('');
        setNewProgram({ program_name: '', program_code: '', description: '' });
    };

    const filteredPrograms = programs.filter(prog => 
        prog.program_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        prog.program_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 text-left">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase italic">
                        Select Program
                    </h2>
                    <p className="text-sm text-gray-400 font-medium tracking-tight">
                        Choose the degree program for this department
                    </p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input 
                            type="text" 
                            placeholder="Search program..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all text-left"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-3 top-3 opacity-30 text-xs">🔍</span>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 shadow-indigo-100"
                    >
                        + Add Program
                    </button>
                </div>
            </div>

            {/* --- CONTENT --- */}
            {loading && programs.length === 0 ? (
                <div className="py-24 text-center font-black text-gray-300 uppercase tracking-widest animate-pulse">Loading Programs...</div>
            ) : filteredPrograms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-100 rounded-[3rem]">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">📜</div>
                    <h3 className="text-xl font-bold text-gray-800">No Programs Found</h3>
                    <p className="text-gray-400 text-sm mt-1 max-w-[250px] text-center">
                        Magdagdag ng kurso para sa departamentong ito.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPrograms.map((prog) => (
                        <div 
                            key={prog.id}
                            onClick={() => onNext(prog.id, prog.program_name)}
                            className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden text-left"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-400" />
                            
                            <div className="absolute top-6 right-8 flex gap-4 z-20">
                                <button 
                                    onClick={(e) => openEditModal(e, prog)}
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-amber-500 transition-colors"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(e, prog.id)}
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>

                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                📑
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors">
                                    {prog.program_code}
                                </h3>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                    {prog.program_name}
                                </p>
                                {prog.description && (
                                    <p className="text-[10px] text-gray-300 line-clamp-2 italic font-medium">{prog.description}</p>
                                )}
                            </div>
                            <div className="mt-10 pt-6 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Select Program</span>
                                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <span className="font-bold">→</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODAL (ADD/EDIT) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-indigo-600 p-6 text-white text-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">
                                {editingId ? 'Edit Program' : 'Add Program'}
                            </h3>
                            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">Degree Information</p>
                        </div>
                        <form onSubmit={handleAddProgram} className="p-8 space-y-5">
                            {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}
                            
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Program Abbreviation (e.g. BSIT)</label>
                                <input 
                                    required
                                    type="text"
                                    className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-left"
                                    placeholder="Enter abbreviation..."
                                    value={newProgram.program_code}
                                    onChange={(e) => setNewProgram({...newProgram, program_code: e.target.value.toUpperCase()})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Program Name</label>
                                <input 
                                    required
                                    type="text"
                                    className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-left"
                                    placeholder="Enter full name..."
                                    value={newProgram.program_name}
                                    onChange={(e) => setNewProgram({...newProgram, program_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description (Optional)</label>
                                <textarea 
                                    className="w-full mt-1.5 p-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all text-left resize-none"
                                    placeholder="Brief description of the program..."
                                    rows="3"
                                    value={newProgram.description}
                                    onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
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
                                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : (editingId ? 'Update Program' : 'Save Program')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramForm;