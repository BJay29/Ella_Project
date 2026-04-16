import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../context/useNotification';
import { authAPI } from '../../services/APIservice';

const getToken = () => sessionStorage.getItem('token') || localStorage.getItem('token');

const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
};

const normalise = (raw) => ({
  ss_id:         raw.ss_id         || raw.id               || raw.enrollment_id || Math.random(),
  section_id:    raw.section_id    || raw.id,
  course_id:     raw.course_id,
  course_name:   raw.course_name   || raw.title            || raw.course_title  || 'Untitled Course',
  section_name:  raw.section_name  || raw.name             || raw.section_title || 'Unassigned Section',
  section_code:  raw.section_code,
  program:       raw.program_name  || raw.program          || 'N/A',
  instructor:    raw.instructor_name || raw.instructor     || raw.teacher_name  || raw.prof || 'Instructor TBA',
  school_year:   raw.school_year,
  semester:      raw.semester,
  schedule:      raw.schedule      || raw.time             || '',
  status:        raw.status        || 'pending',
});

// ── STATUS BADGE COMPONENT ──
const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  if (s === 'approved' || s === 'active') {
    return (
      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/30">
        <span className="w-1 h-1 bg-green-300 rounded-full"></span>
        <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Enrolled</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 bg-amber-500/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-500/30">
      <span className="text-[9px] font-bold text-amber-200 uppercase tracking-tighter">Pending</span>
    </div>
  );
};

// ── ENROLLMENT CARD COMPONENT ──
const EnrollmentCard = ({ enroll, onClick }) => {
  const isApproved = enroll.status?.toLowerCase() === 'approved' || enroll.status?.toLowerCase() === 'active';

  return (
    <div 
      onClick={() => isApproved && onClick(enroll.section_id)}
      className={`group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:shadow-md flex flex-col h-[220px] relative ${isApproved ? 'cursor-pointer' : 'opacity-80'}`}
    >
      <div className="h-24 bg-[#4CAF50] p-4 text-white relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
          <div className="max-w-[80%]">
            <h3 className="text-lg font-bold leading-tight truncate group-hover:underline">
              {enroll.course_name}
            </h3>
            <p className="text-xs font-medium truncate">{enroll.section_name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={enroll.status} />
          </div>
        </div>
        <p className="text-[11px] text-white/80 mt-1 z-10 relative">{enroll.instructor}</p>
        <div className="absolute -right-4 -bottom-8 w-24 h-24 bg-white/10 rounded-full"></div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="mt-2 space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Program: <span className="text-gray-700 dark:text-gray-200">{enroll.program}</span>
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Code: <span className="text-[#4CAF50]">{enroll.section_code}</span>
            </p>
        </div>
      </div>

      <div className="p-2 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-1">
        <button 
          title="Classmates"
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const JoinModal = ({ sectionCode, setSectionCode, joinStatus, setJoinStatus, joinMessage, setJoinMessage, onJoin, onClose }) => (
  <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 dark:border-gray-700">
        <h2 className="text-lg font-black text-gray-800 dark:text-white">Join Section</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      </div>
      <div className="px-6 py-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter the section code provided by your instructor.</p>
        <input
          type="text"
          value={sectionCode}
          onChange={(e) => { setSectionCode(e.target.value); setJoinStatus('idle'); setJoinMessage(''); }}
          className="w-full py-4 px-4 rounded-2xl outline-none border-2 border-gray-100 dark:border-gray-700 focus:border-[#4CAF50] text-gray-800 dark:text-white font-black tracking-widest text-center text-xl uppercase bg-gray-50 dark:bg-gray-900/50"
          placeholder="CODE"
          maxLength={10}
        />
        {joinStatus === 'error' && <p className="text-xs text-red-500 font-bold mt-4">⚠️ {joinMessage}</p>}
      </div>
      <div className="px-6 pb-6">
        <button
          onClick={onJoin}
          disabled={joinStatus === 'loading' || !sectionCode.trim()}
          className="w-full py-4 rounded-2xl bg-[#4CAF50] text-white font-bold hover:bg-[#43A047] active:scale-95 transition-all shadow-lg"
        >
          {joinStatus === 'loading' ? 'Processing...' : 'Send Join Request'}
        </button>
      </div>
    </div>
  </div>
);

const MyCourses = () => {
  const { addJoinNotification, notificationsEnabled } = useNotification();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [sectionCode, setSectionCode] = useState('');
  const [joinStatus, setJoinStatus] = useState('idle');
  const [joinMessage, setJoinMessage] = useState('');

  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [sectionDetails, setSectionDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showPeopleModal, setShowPeopleModal] = useState(false);

  const currentUser = getUserFromToken();

  const fetchEnrollments = useCallback(async () => {
    const token = getToken();
    if (!token) { setError('Session expired.'); setLoading(false); return; }
    setLoading(true);
    try {
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

  // --- RENDER VIEW: SECTION DETAILS ---
  if (selectedSectionId && !loading) {
    return (
      <div className="max-w-5xl mx-auto relative overflow-hidden h-screen flex flex-col">
        {/* Navigation Header */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 h-14 items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-30">
          <div className="flex gap-8 h-full">
            <button className="text-sm font-medium text-gray-500 hover:text-gray-800 px-1 h-full flex items-center transition-colors">
              My Quest
            </button>
            <button 
              onClick={() => setShowPeopleModal(true)}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 px-1 h-full flex items-center transition-colors"
            >
              People
            </button>
          </div>
          <button onClick={() => setSelectedSectionId(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="px-6 py-8 flex-grow overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
          {loadingDetails ? (
            <div className="text-center py-20 font-bold text-gray-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Header Banner */}
              <div className="lg:col-span-4 bg-[#4CAF50] rounded-xl p-8 text-white relative h-48 flex flex-col justify-end shadow-sm overflow-hidden">
                  <h1 className="text-3xl font-bold z-10">{sectionDetails?.section?.course_name}</h1>
                  <p className="text-lg z-10 opacity-90">{sectionDetails?.section?.section_name}</p>
                  <div className="mt-2 flex gap-3 z-10">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded border border-white/30 uppercase font-bold tracking-wider">
                       {sectionDetails?.section?.program_name || sectionDetails?.section?.program || 'N/A'}
                    </span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded border border-white/30 font-bold tracking-wider">
                       CODE: {sectionDetails?.section?.section_code}
                    </span>
                  </div>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              </div>

              {/* Sidebar: Student Profile Card */}
              <div className="lg:col-span-1 lg:order-2 space-y-4">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-3">Your Account</h4>
                      <div className="flex items-center gap-3">
                          {currentUser?.profile_pic ? (
                            <img 
                              src={currentUser.profile_pic} 
                              alt="Profile" 
                              className="w-10 h-10 rounded-full object-cover border-2 border-[#4CAF50]" 
                            />
                          ) : (
                            <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-bold">
                               {currentUser?.full_name?.[0] || 'S'}
                            </div>
                          )}
                          <div className="overflow-hidden">
                              <p className="text-sm font-bold truncate text-gray-800 dark:text-white">
                                {currentUser?.full_name || 'Student Name'}
                              </p>
                              <p className="text-[10px] text-gray-500 truncate italic">
                                {currentUser?.email || 'Email not found'}
                              </p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Main Feed: Quests Content */}
              <div className="lg:col-span-3 lg:order-1">
                  <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-16 flex flex-col items-center justify-center text-center">
                      <div className="text-4xl mb-4 opacity-30">📜</div>
                      <h3 className="text-lg font-bold text-gray-400">Assigned Quests</h3>
                      <p className="text-sm text-gray-400 max-w-xs mt-1">Once your instructor assigns a quest to this section, they will appear here.</p>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE DRAWER / MODAL FOR PEOPLE */}
        {showPeopleModal && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPeopleModal(false)}></div>
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 h-full shadow-2xl animate-slide-in-right p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">People</h3>
                <button onClick={() => setShowPeopleModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="mb-8">
                <h4 className="text-[#4CAF50] font-bold border-b border-[#4CAF50] pb-2 mb-4 uppercase text-xs tracking-widest">Instructor</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                    {sectionDetails?.section?.instructor_name?.[0] || 'T'}
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {sectionDetails?.section?.instructor_name || sectionDetails?.instructor || 'Instructor'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[#4CAF50] font-bold border-b border-[#4CAF50] pb-2 mb-4 uppercase text-xs tracking-widest">Classmates</h4>
                <div className="space-y-4">
                  {sectionDetails?.students?.map((student, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-1 group">
                      <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-100">
                        {student.name?.[0]}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300 font-medium group-hover:text-[#4CAF50] transition-colors">
                        {student.name}
                      </span>
                    </div>
                  ))}
                  {(!sectionDetails?.students || sectionDetails.students.length === 0) && (
                    <p className="text-xs text-gray-400 italic py-4">No classmates found yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">My Courses</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Manage your academic journey and sections.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#4CAF50] text-white text-sm font-bold px-6 py-3 rounded-2xl hover:bg-[#43A047] transition-all shadow-lg">
          + Join New Section
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
          <div className="animate-spin w-10 h-10 border-4 border-[#4CAF50] border-t-transparent rounded-full" />
          <p className="text-sm font-bold">Syncing your courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enroll, idx) => (
            <EnrollmentCard key={enroll.ss_id ?? idx} enroll={enroll} onClick={handleViewDetails} />
          ))}
          {enrollments.length === 0 && !error && (
            <div className="col-span-full text-center py-20 text-gray-400">No active enrollments found.</div>
          )}
        </div>
      )}

      {showModal && (
        <JoinModal
          sectionCode={sectionCode}
          setSectionCode={setSectionCode}
          joinStatus={joinStatus}
          setJoinStatus={setJoinStatus}
          onJoin={handleJoin}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default MyCourses;