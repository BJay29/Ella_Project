import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';

const AssignQuestModal = ({ isOpen, onClose, quest }) => {
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [sections, setSections] = useState([]);

    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [selectedSectionIds, setSelectedSectionIds] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);

    const [deptError, setDeptError] = useState('');
    const [programError, setProgramError] = useState('');
    const [sectionError, setSectionError] = useState('');

    // All hooks must come before any early return
    useEffect(() => {
        if (isOpen) {
            resetAll();
            fetchDepartments();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedDeptId) {
            setSelectedProgramId('');
            setPrograms([]);
            setSections([]);
            setSelectedSectionIds([]);
            setProgramError('');
            setSectionError('');
            fetchProgramsByDept(selectedDeptId);
        }
    }, [selectedDeptId]);

    useEffect(() => {
        if (selectedProgramId) {
            setSections([]);
            setSelectedSectionIds([]);
            setSectionError('');
            fetchSectionsByProgram(selectedProgramId);
        }
    }, [selectedProgramId]);

    const resetAll = () => {
        setSelectedDeptId('');
        setSelectedProgramId('');
        setSelectedSectionIds([]);
        setDepartments([]);
        setPrograms([]);
        setSections([]);
        setDeptError('');
        setProgramError('');
        setSectionError('');
    };

    const fetchDepartments = async () => {
        setLoadingDepartments(true);
        setDeptError('');
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getDepartmentsForAssign(token);
            if (res.ok) {
                const rawData = await res.json();
                // FIXED: API returns { departments: [...] } with fields dept_id, department_name
                const arr = Array.isArray(rawData)
                    ? rawData
                    : (rawData.departments || rawData.data || []);
                setDepartments(arr.map(d => ({
                    id: d.dept_id || d.department_id || d.id,
                    name: d.department_name || d.dept_name || d.name || 'Unknown'
                })));
            } else {
                const errData = await res.json().catch(() => ({}));
                setDeptError(errData.message || `Error loading departments (${res.status})`);
            }
        } catch (err) {
            setDeptError('Connection error loading departments.');
            console.error('fetchDepartments error:', err);
        } finally {
            setLoadingDepartments(false);
        }
    };

    const fetchProgramsByDept = async (deptId) => {
        setLoadingPrograms(true);
        setProgramError('');
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getProgramsByDept(deptId, token);
            if (res.ok) {
                const rawData = await res.json();
                const arr = Array.isArray(rawData)
                    ? rawData
                    : (rawData.programs || rawData.data || []);
                setPrograms(arr.map(p => ({
                    id: p.program_id || p.id,
                    name: p.program_name || p.name || 'Unknown'
                })));
            } else {
                const errData = await res.json().catch(() => ({}));
                setProgramError(errData.message || `Error loading programs (${res.status})`);
            }
        } catch (err) {
            setProgramError('Connection error loading programs.');
            console.error('fetchProgramsByDept error:', err);
        } finally {
            setLoadingPrograms(false);
        }
    };

    const fetchSectionsByProgram = async (programId) => {
        setLoadingSections(true);
        setSectionError('');
        try {
            const token = localStorage.getItem('token');
            const res = await authAPI.getSectionsByProgramId(programId, token);
            if (res.ok) {
                const rawData = await res.json();
                const arr = Array.isArray(rawData)
                    ? rawData
                    : (rawData.sections || rawData.data || []);
                setSections(arr);
            } else {
                const errData = await res.json().catch(() => ({}));
                setSectionError(errData.message || `Error loading sections (${res.status})`);
            }
        } catch (err) {
            setSectionError('Connection error loading sections.');
            console.error('fetchSectionsByProgram error:', err);
        } finally {
            setLoadingSections(false);
        }
    };

    const toggleSection = (sectionId) => {
        setSelectedSectionIds(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const selectAll = () => {
        if (selectedSectionIds.length === sections.length && sections.length > 0) {
            setSelectedSectionIds([]);
        } else {
            setSelectedSectionIds(sections.map(s => s.section_id || s.id));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDeptId) return alert('Please select a department.');
        if (!selectedProgramId) return alert('Please select a program.');
        if (selectedSectionIds.length === 0) return alert('Please select at least one section.');

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const questId = quest?.quest_id || quest?.id;
            if (!questId) throw new Error('Quest ID is missing.');

            const res = await authAPI.assignQuestToSections(questId, selectedSectionIds, token);
            const data = await res.json().catch(() => ({}));

            if (res.ok || res.status === 200 || res.status === 201) {
                alert(data.message || `Quest assigned to ${selectedSectionIds.length} section(s)!`);
                onClose();
            } else {
                alert(data.message || 'Failed to assign quest.');
            }
        } catch (err) {
            console.error('assignQuestToSections error:', err);
            alert('An error occurred while assigning the quest.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // IMPORTANT: Early return MUST be after all hooks
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200 overflow-hidden">

                {/* Header */}
                <div className="bg-indigo-600 p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">Assign Quest</h3>
                            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mt-1">
                                {quest?.quest_type || 'General'} - Quest #{quest?.quest_number || quest?.id}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-white/50 hover:text-white font-bold text-xl transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Step 1: Department */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                            Step 1: Select Department
                        </label>
                        {deptError ? (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-500 font-bold text-center">
                                ⚠️ {deptError}
                            </div>
                        ) : (
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                value={selectedDeptId}
                                onChange={(e) => setSelectedDeptId(e.target.value)}
                                disabled={loadingDepartments}
                                required
                            >
                                <option value="" disabled>
                                    {loadingDepartments ? 'Loading departments...' : 'Choose a department...'}
                                </option>
                                {/* FIXED: was key={dept_id} — typo causing the crash */}
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Step 2: Program */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                            Step 2: Select Program
                        </label>
                        {programError ? (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-500 font-bold text-center">
                                ⚠️ {programError}
                            </div>
                        ) : (
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                value={selectedProgramId}
                                onChange={(e) => setSelectedProgramId(e.target.value)}
                                disabled={!selectedDeptId || loadingPrograms}
                                required
                            >
                                <option value="" disabled>
                                    {loadingPrograms
                                        ? 'Loading programs...'
                                        : !selectedDeptId
                                        ? 'Select department first'
                                        : 'Choose a program...'}
                                </option>
                                {programs.map(prog => (
                                    <option key={prog.id} value={prog.id}>{prog.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Step 3: Sections */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Step 3: Select Sections
                            </label>
                            {selectedProgramId && sections.length > 0 && !loadingSections && (
                                <button
                                    type="button"
                                    onClick={selectAll}
                                    className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors"
                                >
                                    {selectedSectionIds.length === sections.length ? 'Deselect All' : 'Select All'}
                                </button>
                            )}
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl max-h-44 overflow-y-auto">
                            {!selectedProgramId ? (
                                <p className="text-center text-gray-400 text-xs font-bold uppercase py-6 italic">
                                    Select a program first
                                </p>
                            ) : loadingSections ? (
                                <p className="text-center text-indigo-500 text-xs font-bold uppercase py-6 animate-pulse">
                                    Loading sections...
                                </p>
                            ) : sectionError ? (
                                <p className="text-center text-red-400 text-xs font-bold uppercase py-6">
                                    ⚠️ {sectionError}
                                </p>
                            ) : sections.length === 0 ? (
                                <p className="text-center text-gray-400 text-xs font-bold uppercase py-6">
                                    No sections found in this program
                                </p>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {sections.map(sec => {
                                        const secId = sec.section_id || sec.id;
                                        const isChecked = selectedSectionIds.includes(secId);
                                        return (
                                            <div
                                                key={secId}
                                                onClick={() => toggleSection(secId)}
                                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors select-none ${
                                                    isChecked ? 'bg-indigo-50' : 'hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                                    isChecked
                                                        ? 'bg-indigo-600 border-indigo-600'
                                                        : 'border-gray-300 bg-white'
                                                }`}>
                                                    {isChecked && (
                                                        <span className="text-white text-[8px] font-black leading-none">✓</span>
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-gray-800">
                                                        {sec.section_name || sec.name}
                                                    </p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">
                                                        {sec.school_year || ''}{sec.semester ? ` • ${sec.semester}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {selectedSectionIds.length > 0 && (
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-2">
                                ✓ {selectedSectionIds.length} section(s) selected
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-black text-gray-500 text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || selectedSectionIds.length === 0}
                            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                            {isSubmitting ? 'Assigning...' : 'Assign Quest'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignQuestModal;
