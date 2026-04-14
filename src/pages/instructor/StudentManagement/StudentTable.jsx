import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../../services/APIservice';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[1, 2, 3, 4, 5].map(i => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse" />
      </td>
    ))}
  </tr>
);

const StatusBadge = ({ status }) => {
  const s = (status || 'active').toLowerCase();
  const styles = {
    active:   'bg-[#dcfce7] text-[#16a34a]',
    inactive: 'bg-gray-100 text-gray-500',
    pending:  'bg-amber-50 text-amber-600',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${styles[s] || styles.active}`}>
      {status || 'Active'}
    </span>
  );
};

const ProgressBar = ({ value = 0 }) => (
  <div className="flex items-center gap-3 min-w-[140px]">
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#22C55E] rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
    <span className="text-xs font-black text-gray-600 w-9 text-right">{value}%</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// StudentTable
// ─────────────────────────────────────────────────────────────────────────────
const StudentTable = ({ sectionId, sectionName, sectionCode, joinCode }) => {
  const [students,     setStudents]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({ name: '', email: '', student_id: '' });
  const [showAddForm,  setShowAddForm]  = useState(false);

  const displayCode = joinCode || sectionCode || '';

  // ── Fetch students ─────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    if (!sectionId) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res   = await authAPI.getStudentsBySection(sectionId, token);
      if (res.ok) {
        const data = await res.json();
        // Handle various response shapes
        const list = Array.isArray(data)
          ? data
          : (data.students || data.data || data.roster || []);
        setStudents(list);
      } else if (res.status === 404) {
        setStudents([]);
      } else {
        setError('Failed to load students.');
      }
    } catch (e) {
      setError('Network error loading students.');
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── Export CSV ─────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!students.length) return;
    const headers = ['Student ID', 'Full Name', 'Email', 'Status', 'Course Progress'];
    const rows = students.map(s => [
      s.student_id || s.id || '',
      `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.full_name || s.name || '',
      s.email || '',
      s.status || 'Active',
      `${s.course_progress || s.progress || 0}%`,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${sectionName || 'section'}-students.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Add Student ────────────────────────────────────────────────────────
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddingStudent(true);
    try {
      const token = localStorage.getItem('token');
      // This endpoint shape may differ — adjust to your API
      const res = await authAPI.addStudentToSection(sectionId, newStudentForm, token);
      if (res.ok) {
        setShowAddForm(false);
        setNewStudentForm({ name: '', email: '', student_id: '' });
        fetchStudents();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || 'Failed to add student.');
      }
    } catch {
      setError('Network error adding student.');
    } finally {
      setAddingStudent(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Section title + actions row */}
      <div className="px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => {/* handled by SectionDashboard's onBack */}}
            className="text-[10px] font-black text-[#22C55E] uppercase tracking-widest hover:underline mb-2 block"
            // Note: back navigation is in SectionDashboard
          >
            ← Back to Sections
          </button>
          <h3 className="text-2xl font-black uppercase italic tracking-tight text-gray-900">
            Section {sectionName}
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
            Student Roster &amp; Performance Monitoring
          </p>
          {displayCode && (
            <div className="mt-2 inline-flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-3 py-1.5">
              <span className="text-[9px] font-black text-[#16a34a] uppercase tracking-widest">Join Code:</span>
              <span className="text-sm font-black text-[#15803d] tracking-widest">{displayCode}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(displayCode)}
                className="text-[9px] font-black text-[#22C55E] hover:text-[#16a34a] uppercase tracking-widest ml-1 transition-colors"
                title="Copy code"
              >
                Copy
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!students.length}
            className="px-5 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(v => !v)}
            className="px-5 py-3 bg-[#22C55E] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#16a34a] transition-all active:scale-95 shadow-lg shadow-green-100"
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* Add student inline form */}
      {showAddForm && (
        <form
          onSubmit={handleAddStudent}
          className="mx-8 mb-4 p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl flex flex-wrap gap-3 items-end animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Student ID</label>
            <input
              required
              value={newStudentForm.student_id}
              onChange={e => setNewStudentForm(p => ({ ...p, student_id: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-[#22C55E]"
              placeholder="2021-0001"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Full Name</label>
            <input
              required
              value={newStudentForm.name}
              onChange={e => setNewStudentForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-[#22C55E]"
              placeholder="Juan Dela Cruz"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Email</label>
            <input
              type="email"
              required
              value={newStudentForm.email}
              onChange={e => setNewStudentForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-[#22C55E]"
              placeholder="student@univ.edu.ph"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={addingStudent}
              className="px-5 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">
              {addingStudent ? 'Adding…' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-white text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Error */}
      {error && (
        <div className="mx-8 mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 uppercase tracking-wide">
          ⚠ {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {['Student ID', 'Full Name', 'Status', 'Course Progress', 'Actions'].map(h => (
                <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  {/* Empty state */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-5xl opacity-20">👥</div>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-tight">
                      No Students Joined Yet
                    </p>
                    {displayCode && (
                      <p className="text-xs font-bold text-gray-400">
                        Share Section Code:{' '}
                        <span className="font-black text-[#22C55E] tracking-widest">{displayCode}</span>
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              students.map((s, i) => {
                const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim()
                  || s.full_name || s.name || '—';
                const progress = s.course_progress ?? s.progress ?? 0;
                return (
                  <tr key={s.student_id || s.id || i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-black text-gray-500">
                      {s.student_id || s.id || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{fullName}</p>
                      {s.email && (
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">{s.email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-6 py-4">
                      <ProgressBar value={progress} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        className="text-[10px] font-black text-gray-400 hover:text-gray-700 uppercase tracking-widest transition-colors"
                        onClick={() => {/* TODO: navigate to student profile */}}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      {!loading && students.length > 0 && (
        <div className="px-8 py-4 border-t border-gray-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {students.length} student{students.length !== 1 ? 's' : ''} in this section
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
