import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  program:       raw.program_name  || raw.program           || 'N/A',
  instructor:    raw.instructor_name || raw.instructor     || raw.teacher_name  || raw.prof || 'Instructor TBA',
  school_year:   raw.school_year,
  semester:      raw.semester,
  schedule:      raw.schedule      || raw.time             || '',
  status:        raw.status        || 'pending',
  // Placeholders for future API data
  total_quests:  raw.total_quests  || 0,
  classmate_count: raw.classmate_count || 0
});

// ── STATUS BADGE COMPONENT (Smaller Text) ──
const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  if (s === 'approved' || s === 'active') {
    return (
      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/30">
        <span className="w-1 h-1 bg-green-300 rounded-full animate-pulse"></span>
        <span className="text-[8px] font-black text-white uppercase tracking-tighter">Enrolled</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 bg-amber-500/20 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-amber-500/30">
      <span className="text-[8px] font-black text-amber-200 uppercase tracking-tighter">Pending</span>
    </div>
  );
};

// ── ENROLLMENT CARD COMPONENT ──
const EnrollmentCard = ({ enroll, onClick }) => {
  const isApproved = enroll.status?.toLowerCase() === 'approved' || enroll.status?.toLowerCase() === 'active';
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

  // Close submodal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      className={`group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:shadow-xl flex flex-col h-[240px] relative ${isApproved ? 'cursor-default' : 'opacity-80'}`}
    >
      {/* Header Banner with White Effects Design */}
      <div 
        onClick={() => isApproved && onClick(enroll.section_id)}
        className="h-28 bg-[#4CAF50] p-5 text-white relative overflow-hidden cursor-pointer"
      >
        {/* White Glow/Design Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-10 -mb-10 blur-xl"></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="max-w-[75%]">
            <h3 className="text-lg font-black leading-tight truncate drop-shadow-sm">
              {enroll.course_name}
            </h3>
            <p className="text-xs font-bold text-white/90 truncate mt-0.5">{enroll.section_name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={enroll.status} />
            
            {/* 3 Dots Button */}
            <div className="relative" ref={optionsRef}>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {/* Unenroll Submodal */}
              {showOptions && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-150">
                  <button className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Unenroll
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-[11px] font-bold text-white/80 mt-2 z-10 relative flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          {enroll.instructor}
        </p>
      </div>

      {/* Body: Stats and Info */}
      <div className="p-5 flex-grow flex flex-col justify-between bg-white dark:bg-gray-800">
        <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Program</span>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200">{enroll.program}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Section Code</span>
              <span className="text-[11px] font-black text-[#4CAF50] bg-[#4CAF50]/10 px-2 py-0.5 rounded">{enroll.section_code}</span>
            </div>
        </div>

        {/* Dynamic Stats Indicators */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
          <div className="flex items-center gap-1.5" title="Quests">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xs font-black text-gray-600 dark:text-gray-400">{enroll.total_quests}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Classmates">
            <div className="p-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-xs font-black text-gray-600 dark:text-gray-400">{enroll.classmate_count}</span>
          </div>
        </div>
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
    const classmatesList = sectionDetails?.classmates || sectionDetails?.students || [];

    return (
      <div className="max-w-5xl mx-auto relative overflow-hidden h-screen flex flex-col bg-white dark:bg-gray-900">
        {/* Navigation Header - Reordered */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 h-14 items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-30">
          {/* Close Button on the Left */}
          <button 
            onClick={() => setSelectedSectionId(null)} 
            className="group flex items-center gap-2 text-gray-400 hover:text-red-500 transition-all font-black text-xs uppercase"
          >
            <div className="p-1.5 group-hover:bg-red-50 dark:group-hover:bg-red-950 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            Exit Section
          </button>

          {/* People Button on the Right */}
          <button 
            onClick={() => setShowPeopleModal(true)}
            className="flex items-center gap-2 bg-[#4CAF50]/10 text-[#4CAF50] px-4 py-1.5 rounded-xl text-xs font-black uppercase hover:bg-[#4CAF50] hover:text-white transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Classmates ({classmatesList.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="px-6 py-8 flex-grow overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
          {loadingDetails ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="animate-spin w-10 h-10 border-4 border-[#4CAF50] border-t-transparent rounded-full" />
              <p className="font-black text-gray-400 text-sm uppercase"></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Header Banner */}
              <div className="lg:col-span-4 bg-[#4CAF50] rounded-2xl p-8 text-white relative h-48 flex flex-col justify-end shadow-lg overflow-hidden border-4 border-white dark:border-gray-800 shadow-[0_0_20px_rgba(76,175,80,0.2)]">
                  {/* Subtle White Effects */}
                  <div className="absolute top-0 left-1/4 w-full h-full bg-gradient-to-br from-white/5 to-transparent skew-x-12"></div>
                  
                  <h1 className="text-3xl font-black z-10 drop-shadow-md tracking-tight">
                    {sectionDetails?.section?.course_name || sectionDetails?.course_name}
                  </h1>
                  <p className="text-lg z-10 font-bold opacity-90">{sectionDetails?.section?.section_name || sectionDetails?.section_name}</p>
                  
                  <div className="mt-3 flex gap-3 z-10">
                    <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-lg border border-white/30 uppercase font-black tracking-widest">
                        {sectionDetails?.section?.program_name || sectionDetails?.section?.program || sectionDetails?.program || 'N/A'}
                    </span>
                    <span className="text-[10px] bg-black/20 px-2.5 py-1 rounded-lg border border-white/10 font-black tracking-widest uppercase">
                        CODE: {sectionDetails?.section?.section_code || sectionDetails?.section_code}
                    </span>
                  </div>
                  <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
              </div>

              {/* Sidebar Profile */}
              <div className="lg:col-span-1 lg:order-2 space-y-4">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Player Profile</h4>
                      <div className="flex items-center gap-3">
                          {currentUser?.profile_pic ? (
                            <img 
                              src={currentUser.profile_pic} 
                              alt="Profile" 
                              className="w-12 h-12 rounded-xl object-cover border-2 border-[#4CAF50] shadow-sm" 
                            />
                          ) : (
                            <div className="w-12 h-12 bg-[#4CAF50] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                               {currentUser?.full_name?.[0] || currentUser?.first_name?.[0] || 'S'}
                            </div>
                          )}
                          <div className="overflow-hidden">
                              <p className="text-sm font-black truncate text-gray-800 dark:text-white leading-tight">
                                {currentUser?.full_name || (currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name}` : 'Student Name')}
                              </p>
                              <p className="text-[10px] text-gray-400 font-bold truncate mt-0.5">
                                ENROLLED STUDENT
                              </p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Main Feed Placeholder */}
              <div className="lg:col-span-3 lg:order-1">
                  <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl p-20 flex flex-col items-center justify-center text-center shadow-inner">
                      <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">🏔️</div>
                      <h3 className="text-xl font-black text-gray-700 dark:text-gray-300">Section Hub</h3>
                      <p className="text-sm font-medium text-gray-400 max-w-xs mt-2">
                        Welcome to your class space. Check your classmates or wait for announcements from your instructor.
                      </p>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* PEOPLE MODAL (Right-side Drawer) */}
        {showPeopleModal && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowPeopleModal(false)}></div>
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 h-full shadow-2xl animate-in slide-in-from-right duration-500 p-8 overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">People</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1"></p>
                </div>
                <button onClick={() => setShowPeopleModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="mb-10">
                <h4 className="text-[#4CAF50] font-black border-b-2 border-[#4CAF50]/20 pb-2 mb-6 uppercase text-[10px] tracking-[0.2em]">Instructor</h4>
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-sm font-black text-[#4CAF50] border-2 border-[#4CAF50]/20 shadow-sm uppercase">
                    {sectionDetails?.section?.instructor_name?.[0] || sectionDetails?.instructor?.[0] || 'T'}
                  </div>
                  <div>
                    <span className="text-sm font-black text-gray-700 dark:text-gray-200">
                      {sectionDetails?.section?.instructor_name || sectionDetails?.instructor || 'Instructor'}
                    </span>
                    <p className="text-[10px] font-bold text-[#4CAF50] uppercase tracking-wider">Faculty</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-gray-400 font-black border-b-2 border-gray-100 dark:border-gray-700 pb-2 mb-6 uppercase text-[10px] tracking-[0.2em]">Classmates</h4>
                <div className="space-y-4">
                  {classmatesList.map((student, idx) => {
                    const displayName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim();
                    return (
                      <div key={idx} className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all group">
                        <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-100 dark:border-gray-700 uppercase shadow-sm group-hover:border-[#4CAF50]/30 transition-all">
                          {displayName?.[0] || '?'}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-bold group-hover:text-[#4CAF50] transition-colors">
                          {displayName || 'Unknown Student'}
                        </span>
                      </div>
                    );
                  })}
                  {classmatesList.length === 0 && (
                    <div className="py-10 text-center">
                      <p className="text-xs text-gray-400 font-black italic">No classmates recorded in this quest yet.</p>
                    </div>
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
    <div className="max-w-6xl mx-auto px-6 py-10 bg-gray-50/50 dark:bg-transparent min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">My Courses</h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-[0.2em]">Your academic achievements and sections</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-[#4CAF50] text-white text-xs font-black px-8 py-4 rounded-2xl hover:bg-[#43A047] active:scale-95 transition-all shadow-[0_10px_20px_rgba(76,175,80,0.3)] uppercase tracking-widest"
        >
          + Join New Section
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-300">
          <div className="animate-spin w-12 h-12 border-4 border-[#4CAF50] border-t-transparent rounded-full shadow-sm" />
          <p className="text-[10px] font-black uppercase tracking-widest">Syncing Enrollment Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments.map((enroll, idx) => (
            <EnrollmentCard key={enroll.ss_id ?? idx} enroll={enroll} onClick={handleViewDetails} />
          ))}
          {enrollments.length === 0 && !error && (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-3xl p-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-700 shadow-sm">
               <div className="text-5xl mb-4 opacity-20">📖</div>
               <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No active enrollments found.</p>
            </div>
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