import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../context/useNotification';
import { authAPI } from '../../services/APIservice';

const getToken = () => sessionStorage.getItem('token') || localStorage.getItem('token');

const avatarLetter = (str = '') => {
  if (!str) return '?';
  const words = str.trim().split(/\s+/);
  return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : str[0].toUpperCase();
};

const normalise = (raw) => ({
  ss_id:         raw.ss_id         || raw.id              || raw.enrollment_id || Math.random(),
  section_id:    raw.section_id    || raw.id,
  course_id:     raw.course_id,
  course_name:   raw.course_name   || raw.title           || raw.course_title  || 'Untitled Course',
  section_name:  raw.section_name  || raw.name            || raw.section_title || 'Unassigned Section',
  section_code:  raw.section_code,
  instructor:    raw.instructor_name || raw.instructor    || raw.teacher_name  || raw.prof || 'Instructor TBA',
  school_year:   raw.school_year,
  semester:      raw.semester,
  schedule:      raw.schedule      || raw.time            || '',
  capacity:      raw.capacity,
  enrolled:      raw.enrolled      || raw.student_count,
  status:        raw.status        || 'pending',
});

// ── STATUS BADGE COMPONENT ──────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  if (s === 'approved' || s === 'active') {
    return (
      <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span className="text-[11px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Enrolled</span>
      </div>
    );
  }
  if (s === 'pending') {
    return (
      <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pending Approval</span>
      </div>
    );
  }
  if (s === 'rejected') {
    return (
      <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
        <span className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Rejected</span>
      </div>
    );
  }
  return null;
};

// ── ENROLLMENT CARD COMPONENT ────────────────────────────────────────────────
const EnrollmentCard = ({ enroll, onClick }) => {
  const s = enroll.status?.toLowerCase();
  const isPending = s === 'pending';
  const isApproved = s === 'approved' || s === 'active';
  const avatarBg = isApproved ? 'bg-[#4CAF50]' : s === 'rejected' ? 'bg-red-500' : 'bg-amber-500';

  return (
    <div 
      onClick={() => isApproved && onClick(enroll.section_id)}
      className={`bg-white dark:bg-gray-800 rounded-2xl border ${isPending ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/10' : 'border-gray-100 dark:border-gray-700'} shadow-sm overflow-hidden mb-4 transition-all ${isApproved ? 'hover:shadow-md hover:scale-[1.01] cursor-pointer' : ''}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${isPending ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'} rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors`}>
              <span className="text-2xl">{isPending ? '⌛' : '📘'}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">{enroll.course_name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{enroll.instructor}</p>
            </div>
          </div>
          <StatusBadge status={enroll.status} />
        </div>
        <div className="mt-5">
          <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-xs ${avatarBg} shadow-sm`}>
                {avatarLetter(enroll.section_name)}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800 dark:text-white">{enroll.section_name}</p>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                  <span className="text-[#4CAF50] font-bold tracking-widest uppercase">{enroll.section_code}</span>
                  {enroll.schedule && <span>• 🕐 {enroll.schedule}</span>}
                </div>
              </div>
            </div>
            {isApproved && <span className="text-[10px] font-black text-gray-300 uppercase">View Details →</span>}
          </div>
          {isPending && (
            <div className="mt-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-xl px-4 py-3 flex items-start gap-3 text-amber-800 dark:text-amber-300">
               <p className="text-xs font-medium leading-relaxed">⌛ Awaiting instructor verification. Access will be granted once approved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── JOIN MODAL COMPONENT ─────────────────────────────────────────────────────
const JoinModal = ({ sectionCode, setSectionCode, joinStatus, setJoinStatus, joinMessage, setJoinMessage, onJoin, onClose }) => (
  <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 dark:border-gray-700">
        <h2 className="text-lg font-black text-gray-800 dark:text-white">Join Section</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">&times;</button>
      </div>
      <div className="px-6 py-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">Enter the section code provided by your instructor.</p>
        <input
          type="text"
          value={sectionCode}
          onChange={(e) => { setSectionCode(e.target.value); setJoinStatus('idle'); setJoinMessage(''); }}
          className="w-full py-4 px-4 rounded-2xl outline-none border-2 border-gray-100 dark:border-gray-700 focus:border-[#4CAF50] text-gray-800 dark:text-white font-black tracking-widest text-center text-xl uppercase bg-gray-50 dark:bg-gray-900/50"
          placeholder="CODE-HERE"
          maxLength={10}
        />
        {joinStatus === 'error' && <p className="text-xs text-red-500 font-bold mt-4">⚠️ {joinMessage}</p>}
        {joinStatus === 'success' && <p className="text-xs text-green-500 font-bold mt-4">✅ Request sent! Refreshing...</p>}
      </div>
      <div className="px-6 pb-6">
        <button
          onClick={onJoin}
          disabled={joinStatus === 'loading' || !sectionCode.trim()}
          className="w-full py-4 rounded-2xl bg-[#4CAF50] text-white font-bold text-sm hover:bg-[#43A047] active:scale-95 transition-all shadow-lg shadow-green-200 dark:shadow-none"
        >
          {joinStatus === 'loading' ? 'Processing...' : 'Send Join Request'}
        </button>
      </div>
    </div>
  </div>
);

// ── MAIN MYCOURSES COMPONENT ─────────────────────────────────────────────────
const MyCourses = () => {
  const { addJoinNotification, notificationsEnabled } = useNotification();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [sectionCode, setSectionCode] = useState('');
  const [joinStatus, setJoinStatus] = useState('idle');
  const [joinMessage, setJoinMessage] = useState('');

  // States para sa Section Details View
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [sectionDetails, setSectionDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  /**
   * FETCH ALL ENROLLMENTS (Dashboard View)
   */
  const fetchEnrollments = useCallback(async () => {
    const token = getToken();
    if (!token) { setError('Session expired.'); setLoading(false); return; }
    
    setLoading(true);
    try {
      // GINAMIT ANG: getMySection
      const res = await authAPI.getMySection(token);
      if (res.status === 404 || res.status === 204) { setEnrollments([]); return; }
      if (!res.ok) throw new Error('Could not fetch courses.');

      const data = await res.json();
      const raw = Array.isArray(data) ? data : (data.data || data.sections || data.enrollments || []);
      setEnrollments(raw.map(normalise));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * FETCH SECTION DETAILS (Classmates View)
   */
  const handleViewDetails = async (sectionId) => {
    const token = getToken();
    setLoadingDetails(true);
    setSelectedSectionId(sectionId);
    try {

      const res = await authAPI.getMySectionById(sectionId, token);
      if (!res.ok) throw new Error('Failed to load section details.');
      const data = await res.json();
      setSectionDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleJoin = async () => {
    const code = sectionCode.trim().toUpperCase();
    const token = getToken();
    setJoinStatus('loading');
    try {
      const res = await authAPI.joinSection(token, { section_code: code });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setJoinStatus('success');
        await fetchEnrollments(); 
        setTimeout(() => {
          setShowModal(false);
          setJoinStatus('idle');
          setSectionCode('');
        }, 1500);
        if (notificationsEnabled) {
          addJoinNotification(code, data.section_name || code, data.course_name || '');
        }
      } else {
        setJoinStatus('error');
        setJoinMessage(data.message || data.error || 'Invalid section code.');
      }
    } catch {
      setJoinStatus('error');
      setJoinMessage('Connection error.');
    }
  };

  // --- RENDER VIEW: SECTION DETAILS (CLASSMATES) ---
  if (selectedSectionId && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button 
          onClick={() => { setSelectedSectionId(null); setSectionDetails(null); }}
          className="mb-8 flex items-center gap-2 text-xs font-black text-gray-400 hover:text-gray-800 uppercase tracking-widest transition-colors"
        >
          ← Back to My Courses
        </button>

        {loadingDetails ? (
          <div className="text-center py-20 font-bold text-gray-400">Loading Class Details...</div>
        ) : (
          <>
            {/* Profile Highlight */}
            <div className="bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-[2.5rem] p-8 text-white shadow-xl mb-12">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-3xl font-black backdrop-blur-md border border-white/30">
                    {sectionDetails?.user?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black leading-tight">{sectionDetails?.user?.name || 'Explorer'}</h2>
                    <p className="text-white/80 font-medium">Currently enrolled in {sectionDetails?.section?.section_name}</p>
                  </div>
               </div>
            </div>

            {/* Classmates Grid */}
            <div className="mb-6">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Classmates ({sectionDetails?.students?.length || 0})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {sectionDetails?.students?.map((student, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 text-center shadow-sm">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-2xl mx-auto mb-3 flex items-center justify-center text-sm font-black text-gray-400">
                      {student.name?.[0]}
                    </div>
                    <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{student.name}</p>
                    <p className="text-[9px] font-black text-[#4CAF50] uppercase mt-1 tracking-tighter">Student</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- RENDER VIEW: DASHBOARD (MAIN LIST) ---
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">My Courses</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Manage your academic journey and sections.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#4CAF50] text-white text-sm font-bold px-6 py-3 rounded-2xl hover:bg-[#43A047] transition-all shadow-lg"
        >
          + Join New Section
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
          <div className="animate-spin w-10 h-10 border-4 border-[#4CAF50] border-t-transparent rounded-full" />
          <p className="text-sm font-bold">Syncing your courses...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 p-6 rounded-3xl text-center mb-8">
          <p className="text-red-600 font-bold text-sm">❌ {error}</p>
          <button onClick={fetchEnrollments} className="text-xs bg-red-100 px-4 py-2 rounded-full mt-2 font-black uppercase">Try Again</button>
        </div>
      )}

      {!loading && !error && enrollments.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700 p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-6 text-5xl">🏫</div>
          <h3 className="font-black text-xl text-gray-800 dark:text-white mb-2">No active enrollments</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mb-8 font-medium">It looks like you haven't joined any sections yet.</p>
        </div>
      )}

      <div className="grid gap-2">
        {!loading && !error && enrollments.map((enroll, idx) => (
          <EnrollmentCard key={enroll.ss_id ?? idx} enroll={enroll} onClick={handleViewDetails} />
        ))}
      </div>

      {!loading && enrollments.length > 0 && (
        <button onClick={fetchEnrollments} className="mt-8 mx-auto flex items-center gap-2 text-[11px] font-black text-gray-400 hover:text-[#4CAF50] transition-colors uppercase tracking-[0.2em]">
          <span>🔄</span> Sync Data
        </button>
      )}

      {showModal && (
        <JoinModal
          sectionCode={sectionCode}
          setSectionCode={setSectionCode}
          joinStatus={joinStatus}
          setJoinStatus={setJoinStatus}
          joinMessage={joinMessage}
          setJoinMessage={setJoinMessage}
          onJoin={handleJoin}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default MyCourses;