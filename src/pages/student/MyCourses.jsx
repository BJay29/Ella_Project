import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../context/useNotification';

const API_BASE = import.meta.env?.VITE_API_URL || 'https://ellaquest-backend.onrender.com';
const getToken = () => sessionStorage.getItem('token') || localStorage.getItem('token');

const avatarLetter = (str = '') => {
  if (!str) return '?';
  const words = str.trim().split(/\s+/);
  return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : str[0].toUpperCase();
};

const normalise = (raw) => ({
  ss_id:        raw.ss_id        || raw.id        || raw.enrollment_id || Math.random(),
  section_id:   raw.section_id   || raw.id,
  course_id:    raw.course_id,
  course_name:  raw.course_name  || raw.title     || raw.course_title  || 'Course',
  section_name: raw.section_name || raw.name      || raw.section_title || 'Section',
  section_code: raw.section_code,
  instructor:   raw.instructor_name || raw.instructor || raw.teacher_name || raw.prof || '',
  school_year:  raw.school_year,
  semester:     raw.semester,
  schedule:     raw.schedule     || raw.time || '',
  capacity:     raw.capacity,
  enrolled:     raw.enrolled     || raw.student_count,
  status:       raw.status       || 'pending',
});

const StatusBadge = ({ status }) => {
  if (status === 'approved') return <span className="text-xs font-bold text-green-600 dark:text-green-400">✅ Enrolled</span>;
  if (status === 'pending')  return <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">⏳ Pending Approval</span>;
  if (status === 'rejected') return <span className="text-xs font-bold text-red-500">✕ Rejected</span>;
  return null;
};

const EnrollmentCard = ({ enroll }) => {
  const avatarBg = enroll.status === 'approved' ? 'bg-[#4CAF50]' : enroll.status === 'rejected' ? 'bg-red-400' : 'bg-yellow-400';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-4 transition-colors">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📘</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{enroll.course_name}</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {enroll.instructor ? `Prof. ${enroll.instructor}` : 'Instructor TBA'}
              </p>
              {(enroll.school_year || enroll.semester) && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {[enroll.school_year, enroll.semester].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
          {enroll.semester && (
            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              {enroll.semester}
            </span>
          )}
        </div>

        <div className="mt-5">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Your Section</p>
          <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/30">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm ${avatarBg}`}>
                {avatarLetter(enroll.section_name)}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800 dark:text-white">{enroll.section_name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                  {enroll.section_code && <span className="font-bold tracking-widest text-[#4CAF50]">{enroll.section_code}</span>}
                  {enroll.schedule && <span>· 🕐 {enroll.schedule}</span>}
                  {enroll.enrolled != null && enroll.capacity != null && <span>· 👥 {enroll.enrolled}/{enroll.capacity}</span>}
                </div>
              </div>
            </div>
            <StatusBadge status={enroll.status} />
          </div>

          {enroll.status === 'pending' && (
            <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">⏳</span>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium leading-snug">
                Your request is pending. You'll be notified once the instructor approves it.
              </p>
            </div>
          )}
          {enroll.status === 'rejected' && (
            <div className="mt-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-red-400 mt-0.5">✕</span>
              <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-snug">
                Your request was rejected. Contact your instructor for more information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const JoinModal = ({ sectionCode, setSectionCode, joinStatus, setJoinStatus, joinMessage, setJoinMessage, onJoin, onClose }) => (
  <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transition-colors">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-base font-bold text-gray-800 dark:text-white">🎯 Join a Course / Section</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold leading-none">×</button>
      </div>
      <div className="px-6 py-5">
        <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Enter Section Code</label>
        <input
          type="text"
          value={sectionCode}
          onChange={(e) => { setSectionCode(e.target.value); setJoinStatus('idle'); setJoinMessage(''); }}
          onKeyDown={(e) => e.key === 'Enter' && onJoin()}
          className="w-full py-3 px-4 rounded-lg outline-none border-2 border-gray-200 dark:border-gray-600 focus:border-[#4CAF50] transition-colors text-gray-800 dark:text-white font-bold tracking-widest text-base uppercase bg-gray-50 dark:bg-gray-700"
          placeholder="e.g. A3F9B2" maxLength={6}
          disabled={joinStatus === 'loading' || joinStatus === 'success'} autoFocus
        />
        <p className="text-[11px] text-gray-400 mt-1 mb-3">Ask your instructor for the 6-character section code.</p>
        {joinStatus === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg px-4 py-2.5 mb-3 flex items-center gap-2">
            ❌ {joinMessage}
          </div>
        )}
        {joinStatus === 'success' && (
          <div className="space-y-2 mb-3">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 text-xs font-semibold rounded-lg px-4 py-2.5 flex items-center gap-2">
              ✅ {joinMessage}
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg px-4 py-3 flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">⏳</span>
              <div>
                <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300">Request Pending</p>
                <p className="text-[11px] text-yellow-600 dark:text-yellow-400 leading-snug">You'll be enrolled once your instructor approves the request.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3 px-6 pb-5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
        {joinStatus !== 'success' ? (
          <button onClick={onJoin} disabled={joinStatus === 'loading'}
            className="flex-1 py-2.5 rounded-lg bg-[#4CAF50] text-white font-bold text-sm hover:bg-[#43A047] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {joinStatus === 'loading' ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" /> Joining…</> : 'Join'}
          </button>
        ) : (
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-[#4CAF50] text-white font-bold text-sm hover:bg-[#43A047] transition-colors">Done</button>
        )}
      </div>
    </div>
  </div>
);

const MyCourses = () => {
  const { addJoinNotification, notificationsEnabled } = useNotification();
  const [enrollments, setEnrollments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [sectionCode, setSectionCode] = useState('');
  const [joinStatus,  setJoinStatus]  = useState('idle');
  const [joinMessage, setJoinMessage] = useState('');

  const fetchEnrollments = useCallback(async () => {
    const token = getToken();
    if (!token) { setError('Not logged in.'); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/student/student/my-section`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 404 || res.status === 204) { setEnrollments([]); return; }
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      let raw;
      if (Array.isArray(data))       raw = data;
      else if (data.sections)        raw = data.sections;
      else if (data.enrollments)     raw = data.enrollments;
      else if (data.section)         raw = [data.section];
      else if (data && typeof data === 'object') raw = [data];
      else raw = [];
      setEnrollments(raw.map(normalise));
    } catch (err) {
      setError(err.message || 'Connection error.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  const handleJoin = async () => {
    const code = sectionCode.trim().toUpperCase();
    const token = getToken();
    if (!code)  { setJoinStatus('error'); setJoinMessage('Please enter a section code.'); return; }
    if (!token) { setJoinStatus('error'); setJoinMessage('You are not logged in.'); return; }
    setJoinStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/student/student/join-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ section_code: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setJoinStatus('success');
        setJoinMessage(data.message || 'Request sent! Waiting for instructor approval.');
        setSectionCode('');
        fetchEnrollments();
        if (notificationsEnabled) addJoinNotification(code, data.section_name || code, data.course_name || '');
      } else {
        setJoinStatus('error');
        setJoinMessage(data.message || data.detail || `Could not join section (${res.status}).`);
      }
    } catch { setJoinStatus('error'); setJoinMessage('Network error.'); }
  };

  const closeModal = () => { setShowModal(false); setJoinStatus('idle'); setJoinMessage(''); setSectionCode(''); };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">📚 My Courses</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your enrolled courses and sections for this semester.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#4CAF50] text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-[#43A047] transition-colors shadow-sm">
          + Join Course / Section
        </button>
      </div>

      {loading && <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-[#4CAF50] border-t-transparent rounded-full" /></div>}

      {!loading && error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-semibold rounded-2xl px-6 py-4 mb-6 flex items-center gap-2">
          ❌ {error} <button onClick={fetchEnrollments} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {!loading && !error && enrollments.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-16 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
          <span className="text-5xl mb-4">🏫</span>
          <p className="font-bold text-base">No courses yet</p>
          <p className="text-sm mt-1">Join a course using a section code from your instructor.</p>
          <button onClick={() => setShowModal(true)} className="mt-5 bg-[#4CAF50] text-white text-sm font-bold px-6 py-2 rounded-full hover:bg-[#43A047] transition-colors">
            + Join Course / Section
          </button>
        </div>
      )}

      {!loading && !error && enrollments.map((enroll, idx) => <EnrollmentCard key={enroll.ss_id ?? idx} enroll={enroll} />)}

      {!loading && enrollments.length > 0 && (
        <div className="flex justify-center mt-2 mb-4">
          <button onClick={fetchEnrollments} className="text-sm font-bold text-[#4CAF50] hover:underline flex items-center gap-1">🔄 Refresh Status</button>
        </div>
      )}

      {showModal && <JoinModal sectionCode={sectionCode} setSectionCode={setSectionCode} joinStatus={joinStatus} setJoinStatus={setJoinStatus} joinMessage={joinMessage} setJoinMessage={setJoinMessage} onJoin={handleJoin} onClose={closeModal} />}
    </div>
  );
};

export default MyCourses;