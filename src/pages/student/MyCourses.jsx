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
  course_name:   raw.course_name   || raw.title             || raw.course_title  || 'Untitled Course',
  section_name:  raw.section_name  || raw.name               || raw.section_title || 'Unassigned Section',
  section_code:  raw.section_code,
  program:       raw.program_name  || raw.program           || 'N/A',
  instructor:    raw.instructor_name || raw.instructor      || raw.teacher_name  || raw.prof || 'Instructor TBA',
  school_year:   raw.school_year,
  semester:      raw.semester,
  schedule:      raw.schedule      || raw.time             || '',
  status:        raw.status        || 'pending',
  total_quests:  raw.total_quests  || 0,
  classmate_count: raw.classmate_count || 0
});

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

// ─────────────────────────────────────────────────────────────────────────────
// GClass Material Type Config
// ─────────────────────────────────────────────────────────────────────────────
const getMaterialConfig = (fileType = '') => {
  const type = fileType.toLowerCase();
  if (type.includes('pdf') || type === 'pdf') return {
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
      </svg>
    ),
    bg: 'bg-red-600',
    label: 'PDF',
    accent: 'text-red-600',
    badgeBg: 'bg-red-50 text-red-700 border border-red-100',
  };
  if (type.includes('video')) return {
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
      </svg>
    ),
    bg: 'bg-blue-600',
    label: 'Video',
    accent: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border border-blue-100',
  };
  if (type.includes('audio')) return {
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    ),
    bg: 'bg-purple-600',
    label: 'Audio',
    accent: 'text-purple-600',
    badgeBg: 'bg-purple-50 text-purple-700 border border-purple-100',
  };
  if (type.includes('image')) return {
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      </svg>
    ),
    bg: 'bg-teal-600',
    label: 'Image',
    accent: 'text-teal-600',
    badgeBg: 'bg-teal-50 text-teal-700 border border-teal-100',
  };
  return {
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
      </svg>
    ),
    bg: 'bg-gray-500',
    label: 'File',
    accent: 'text-gray-500',
    badgeBg: 'bg-gray-50 text-gray-600 border border-gray-200',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Google Classroom-style Full-Screen Material Viewer Modal
// ─────────────────────────────────────────────────────────────────────────────
const MaterialViewerModal = ({ material, onClose }) => {
  if (!material) return null;

  const config = getMaterialConfig(material.file_type || material.type || '');
  const title = material.title || material.file_name || material.original_name || 'Material File';
  const fileUrl = material.file_url || material.url || '';
  const description = material.description || '';
  const fileType = (material.file_type || material.type || '').toLowerCase();
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  // ── Derive ext from URL as fallback ──
  const getExtFromUrl = (url = '') => url.split('.').pop()?.split('?')[0]?.toLowerCase() || '';
  const resolvedFileType = fileType || getExtFromUrl(fileUrl);

  useEffect(() => {
  const loadPdf = async () => {
    if (!fileUrl) return;

    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();

      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);

      setPdfBlobUrl(url);
    } catch (err) {
      console.error("PDF load error:", err);
    }
  };

  if (resolvedFileType.includes('pdf')) {
    loadPdf();
  }

  return () => {
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
  };
}, [fileUrl]);

  const handleDownload = async () => {
    if (!fileUrl) return;
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch {
      window.open(fileUrl, '_blank');
    }
  };

  const renderContent = () => {
    if (!fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
          <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm font-black uppercase tracking-widest text-gray-400">File not available</p>
          <p className="text-xs text-gray-400">No URL was returned from the server.</p>
        </div>
      );
    }

    // ── PDF: direct iframe embed, no Google Docs proxy ──
if (resolvedFileType.includes('pdf') || resolvedFileType === 'pdf') {
  return pdfBlobUrl ? (
    <iframe
      src={pdfBlobUrl}
      className="w-full h-full border-0"
      title={title}
    />
  ) : (
    <div className="flex items-center justify-center h-full">
      <span className="text-sm text-gray-400">Loading PDF...</span>
    </div>
  );
}
    // ── VIDEO: object-contain, native controls ──
    if (resolvedFileType.includes('video') || ['mp4','webm','mov','avi','mkv'].includes(resolvedFileType)) {
      return (
        <div className="flex items-center justify-center h-full bg-black">
          <video
            src={fileUrl}
            controls
            autoPlay={false}
            className="w-full h-full object-contain"
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    // ── AUDIO: centered player with icon ──
    if (resolvedFileType.includes('audio') || ['mp3','wav','ogg','flac','aac'].includes(resolvedFileType)) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-10 bg-gray-50 dark:bg-gray-900/30 px-8">
          <div className={`w-32 h-32 ${config.bg} rounded-3xl flex items-center justify-center text-white shadow-2xl`}>
            <svg viewBox="0 0 24 24" className="w-14 h-14" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-base font-black text-gray-800 dark:text-white uppercase tracking-tight">{title}</p>
            {description && <p className="text-xs text-gray-400 mt-1 italic">{description}</p>}
          </div>
          <audio src={fileUrl} controls className="w-full max-w-md rounded-2xl shadow-sm">
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    // ── IMAGE: inline display, object-contain, no new tab ──
    if (
      resolvedFileType.includes('image') ||
      ['jpg','jpeg','png','gif','webp','svg','bmp','tiff'].includes(resolvedFileType)
    ) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-gray-50 dark:bg-gray-900/30 p-6 overflow-auto">
          <img
            src={fileUrl}
            alt={title}
            className="max-w-full max-h-full object-contain rounded-xl shadow-lg select-none"
            draggable={false}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
            }}
          />
          {/* Fallback if image fails to load */}
          <div className="hidden flex-col items-center justify-center gap-4 text-gray-400">
            <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-sm font-black uppercase tracking-widest">Image failed to load</p>
            <button
              onClick={() => window.open(fileUrl, '_blank')}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      );
    }

    // ── GENERIC: no preview, download prompt ──
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 bg-gray-50 dark:bg-gray-900/30 px-8">
        <div className={`w-28 h-28 ${config.bg} rounded-3xl flex items-center justify-center text-white shadow-2xl`}>
          <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-base font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight">Preview Not Available</p>
          <p className="text-sm text-gray-400 mt-2 max-w-xs">This file type cannot be previewed in the browser. Use the Download button to open it.</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-8 py-3 bg-[#4CAF50] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#43A047] transition-all shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download File
        </button>
      </div>
    );
  };

  return (
    <>
      {/* ── Full-screen fixed overlay ── */}
      <div className="fixed inset-0 z-[300] flex flex-col bg-white dark:bg-gray-900" style={{ animation: 'gclassViewerIn 0.2s ease-out' }}>

        {/* ── Top Navigation Bar ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Left: Close + File Info */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Close button */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all font-black text-[10px] uppercase tracking-widest flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

            {/* File type badge + title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={`${config.bg} w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                <div className="scale-[0.65]">{config.icon}</div>
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate leading-tight">
                  {title}
                </h2>
                {description && (
                  <p className="text-[10px] text-gray-400 italic truncate mt-0.5">{description}</p>
                )}
              </div>
              <span className={`hidden sm:inline-flex flex-shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${config.badgeBg}`}>
                {config.label}
              </span>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Open Tab
              </a>
            )}
            {fileUrl && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#4CAF50] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#43A047] transition-all shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </button>
            )}
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>

      <style>{`
        @keyframes gclassViewerIn {
          from { opacity: 0; transform: scale(0.99) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GClassroom-style Material Row (Student View) — clickable
// ─────────────────────────────────────────────────────────────────────────────
const GClassMaterialRow = ({ file, onView }) => {
  const config = getMaterialConfig(file.file_type || file.type || '');
  const title = file.title || file.original_name || file.file_name || 'Material File';
  const description = file.description || '';
  const date = file.created_at
    ? new Date(file.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently posted';

  return (
    <div
      onClick={() => onView(file)}
      className="group flex items-stretch bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 cursor-pointer"
    >
      <div className={`${config.bg} w-14 flex-shrink-0 flex flex-col items-center justify-center text-white gap-1 py-4`}>
        {config.icon}
        <span className="text-[7px] font-black uppercase tracking-wider opacity-90">{config.label}</span>
      </div>
      <div className="flex-1 px-5 py-4 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-tight truncate leading-tight group-hover:text-[#4CAF50] transition-colors">
              {title}
            </h4>
            {description && (
              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 italic">{description}</p>
            )}
          </div>
          <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap flex-shrink-0">{date}</span>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${config.accent}`}>
            {config.label}
          </span>
          {file.file_size && (
            <span className="text-[9px] font-bold text-gray-400">{file.file_size}</span>
          )}
          <span className="ml-auto text-[9px] font-black text-[#4CAF50] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            View
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

// ── ENROLLMENT CARD COMPONENT ──
const EnrollmentCard = ({ enroll, onClick, onUnenroll }) => {
  const isApproved = enroll.status?.toLowerCase() === 'approved' || enroll.status?.toLowerCase() === 'active';
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

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
    <div className={`group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-xl flex flex-col h-[240px] relative ${isApproved ? 'cursor-default' : 'opacity-80'}`}>
      <div
        onClick={() => isApproved && onClick(enroll.section_id)}
        className="h-28 bg-[#4CAF50] p-5 text-white relative rounded-t-2xl overflow-hidden cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-10 -mb-10 blur-xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div className="max-w-[75%]">
            <h3 className="text-lg font-black leading-tight truncate drop-shadow-sm">{enroll.course_name}</h3>
            <p className="text-xs font-bold text-white/90 truncate mt-0.5">{enroll.section_name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={enroll.status} />
          </div>
        </div>
        <p className="text-[11px] font-bold text-white/80 mt-2 z-10 relative flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          {enroll.instructor}
        </p>
      </div>

      <div className="absolute top-4 right-4 z-30" ref={optionsRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        {showOptions && (
          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-[60] py-1 animate-in fade-in zoom-in duration-150 origin-top-right">
            <button
              onClick={(e) => { e.stopPropagation(); setShowOptions(false); onUnenroll(enroll.section_id); }}
              className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Unenroll
            </button>
          </div>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col justify-between bg-white dark:bg-gray-800 rounded-b-2xl">
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

const JoinModal = ({
  sectionCode,
  setSectionCode,
  joinStatus,
  setJoinStatus,
  joinMessage,
  setJoinMessage,
  onJoin,
  onClose
}) => {

  const handleInputChange = (e) => {
    if (typeof setSectionCode === 'function') {
      setSectionCode(e.target.value);
    }

    if (typeof setJoinStatus === 'function') {
      setJoinStatus('idle');
    }

    if (typeof setJoinMessage === 'function') {
      setJoinMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 dark:border-gray-700">
          <h2 className="text-lg font-black text-gray-800 dark:text-white">
            Join Section
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Enter the section code provided by your instructor.
          </p>

          <input
            type="text"
            value={sectionCode || ''}
            onChange={handleInputChange}
            className="w-full py-4 px-4 rounded-2xl outline-none border-2 border-gray-100 dark:border-gray-700 focus:border-[#4CAF50] text-gray-800 dark:text-white font-black tracking-widest text-center text-xl uppercase bg-gray-50 dark:bg-gray-900/50"
            placeholder="CODE"
            maxLength={10}
          />

          {joinStatus === 'error' && (
            <p className="text-xs text-red-500 font-bold mt-4">
              ⚠️ {joinMessage}
            </p>
          )}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onJoin}
            disabled={joinStatus === 'loading' || !sectionCode?.trim()}
            className="w-full py-4 rounded-2xl bg-[#4CAF50] text-white font-bold hover:bg-[#43A047] active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            {joinStatus === 'loading'
              ? 'Processing...'
              : 'Send Join Request'}
          </button>
        </div>

      </div>
    </div>
  );
};
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
  const [materials, setMaterials] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showPeopleModal, setShowPeopleModal] = useState(false);

  const [successToast, setSuccessToast] = useState({ show: false, message: '' });

  // ── Material Viewer State ──
  const [viewerMaterial, setViewerMaterial] = useState(null);
  const [isFetchingMaterial, setIsFetchingMaterial] = useState(false);

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

  const fetchMaterials = async (sectionId) => {
    const token = getToken();
    try {
      const res = await authAPI.getSectionMaterials(sectionId, token);
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.materials || data || []);
      }
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  const handleUnenroll = async (sectionId) => {
    const token = getToken();
    try {
      const res = await authAPI.unenrollSection(sectionId, token);
      if (res.ok) {
        setSuccessToast({ show: true, message: 'Successfully unenrolled from section.' });
        setTimeout(() => setSuccessToast({ show: false, message: '' }), 3000);
        fetchEnrollments();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to unenroll.");
      }
    } catch (err) {
      console.error("Unenroll error:", err);
    }
  };

  const handleViewDetails = async (sectionId) => {
    const token = getToken();
    setLoadingDetails(true);
    setSelectedSectionId(sectionId);
    try {
      const res = await authAPI.getMySectionById(sectionId, token);
      if (!res.ok) throw new Error('Failed to load section details.');
      const data = await res.json();
      setSectionDetails(data);
      fetchMaterials(sectionId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // ── Open material viewer — fetch specific material if no URL yet ──
  const handleViewMaterial = async (file) => {
    if (file.file_url || file.url) {
      setViewerMaterial(file);
      return;
    }
    const materialId = file.id || file.material_id;
    if (!selectedSectionId || !materialId) {
      setViewerMaterial(file);
      return;
    }
    setIsFetchingMaterial(true);
    try {
      const token = getToken();
      const res = await authAPI.getSpecificMaterial(selectedSectionId, materialId, token);
      if (res.ok) {
        const data = await res.json();
        setViewerMaterial({ ...file, ...data });
      } else {
        setViewerMaterial(file);
      }
    } catch (err) {
      console.error("Error fetching specific material:", err);
      setViewerMaterial(file);
    } finally {
      setIsFetchingMaterial(false);
    }
  };

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

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

  // ── SECTION DETAIL VIEW ──
  if (selectedSectionId && !loading) {
    const classmatesList = sectionDetails?.classmates || sectionDetails?.students || [];

    return (
      <div className="w-full h-screen flex flex-col bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Top Nav */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-8 h-16 items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-30">
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
          <button
            onClick={() => setShowPeopleModal(true)}
            className="flex items-center gap-2 bg-[#4CAF50]/10 text-[#4CAF50] px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-[#4CAF50] hover:text-white transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            People ({classmatesList.length})
          </button>
        </div>

        {/* ── Scrollable content — scrollbar hidden ── */}
        <div className="flex-grow overflow-y-auto bg-gray-50 dark:bg-gray-900/50 no-scrollbar">
          <div className="max-w-7xl mx-auto px-8 py-10">
            {loadingDetails ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="animate-spin w-10 h-10 border-4 border-[#4CAF50] border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Course Banner */}
                <div className="lg:col-span-4 bg-[#4CAF50] rounded-2xl p-8 text-white relative h-52 flex flex-col justify-end shadow-lg overflow-hidden border-4 border-white dark:border-gray-800">
                  <div className="absolute top-0 left-1/4 w-full h-full bg-gradient-to-br from-white/5 to-transparent skew-x-12"></div>
                  <h1 className="text-4xl font-black z-10 drop-shadow-md tracking-tight">
                    {sectionDetails?.section?.course_name || sectionDetails?.course_name}
                  </h1>
                  <p className="text-xl z-10 font-bold opacity-90">{sectionDetails?.section?.section_name || sectionDetails?.section_name}</p>
                  <div className="mt-4 flex gap-3 z-10">
                    <span className="text-[10px] bg-white/20 px-3 py-1.5 rounded-lg border border-white/30 uppercase font-black tracking-widest">
                      {sectionDetails?.section?.program_name || sectionDetails?.section?.program || sectionDetails?.program || 'N/A'}
                    </span>
                    <span className="text-[10px] bg-black/20 px-3 py-1.5 rounded-lg border border-white/10 font-black tracking-widest uppercase">
                      CODE: {sectionDetails?.section?.section_code || sectionDetails?.section_code}
                    </span>
                  </div>
                  <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-1 lg:order-2 space-y-6">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Student Profile</h4>
                    <div className="flex items-center gap-4">
                      {currentUser?.profile_pic ? (
                        <img src={currentUser.profile_pic} alt="Profile" className="w-14 h-14 rounded-xl object-cover border-2 border-[#4CAF50] shadow-sm" />
                      ) : (
                        <div className="w-14 h-14 bg-[#4CAF50] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm uppercase">
                          {currentUser?.full_name?.[0] || currentUser?.first_name?.[0] || 'S'}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-base font-black truncate text-gray-800 dark:text-white leading-tight">
                          {currentUser?.full_name || (currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name}` : 'Student Name')}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold truncate mt-1 uppercase tracking-wider">Enrolled Student</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Course Info</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400">Materials</span>
                        <span className="text-xs font-black text-gray-700 dark:text-white">{materials.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400">Classmates</span>
                        <span className="text-xs font-black text-gray-700 dark:text-white">{classmatesList.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 lg:order-1 space-y-8">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                      <div>
                        <h3 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">Classwork</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {materials.length} material{materials.length !== 1 ? 's' : ''} · Click to view or download
                        </p>
                      </div>
                      <div className="p-2.5 bg-[#4CAF50]/10 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>

                    {materials.length > 0 ? (
                      <div className="px-8 py-6 space-y-3">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">All Materials</span>
                          <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
                        </div>
                        {materials.map((file, idx) => (
                          <GClassMaterialRow key={file.id || idx} file={file} onView={handleViewMaterial} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">No Materials Yet</h4>
                        <p className="text-xs font-medium text-gray-400 mt-2 max-w-[250px]">Your instructor hasn't uploaded any study materials for this section yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading overlay while fetching material */}
        {isFetchingMaterial && (
          <div className="fixed inset-0 z-[290] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl px-8 py-6 flex items-center gap-4 shadow-2xl">
              <svg className="w-5 h-5 animate-spin text-[#4CAF50]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="text-[11px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest">Opening file...</span>
            </div>
          </div>
        )}

        {/* GClass-style Full-Screen Material Viewer */}
        {viewerMaterial && (
          <MaterialViewerModal material={viewerMaterial} onClose={() => setViewerMaterial(null)} />
        )}

        {/* People Slide-Over */}
        {showPeopleModal && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowPeopleModal(false)}></div>
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 h-full shadow-2xl animate-in slide-in-from-right duration-500 p-8 overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">People</h3>
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
                    <span className="text-sm font-black text-gray-700 dark:text-gray-200">{sectionDetails?.section?.instructor_name || sectionDetails?.instructor || 'Instructor'}</span>
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
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-bold group-hover:text-[#4CAF50] transition-colors">{displayName || 'Unknown Student'}</span>
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

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes gclassViewerIn {
            from { opacity: 0; transform: scale(0.99) translateY(6px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // ── MAIN COURSES GRID VIEW ──
  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-gray-900 px-8 py-12 relative">
      {successToast.show && (
        <div className="fixed top-8 right-8 z-[200] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-b-4 border-emerald-700">
            <div className="bg-white/20 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-black text-xs uppercase tracking-widest">{successToast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-16">
          <div>
            <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">My Courses</h2>
            <p className="text-gray-500 dark:text-gray-400 font-bold mt-2 uppercase text-[11px] tracking-[0.25em]">Your academic achievements and active sections</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#4CAF50] text-white text-xs font-black px-10 py-5 rounded-2xl hover:bg-[#43A047] active:scale-95 transition-all shadow-[0_10px_25px_rgba(76,175,80,0.4)] uppercase tracking-widest"
          >
            + Join New Section
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-gray-300">
            <div className="animate-spin w-14 h-14 border-4 border-[#4CAF50] border-t-transparent rounded-full shadow-sm" />
            <p className="text-[10px] font-black uppercase tracking-widest mt-2">Syncing Enrollment Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {enrollments.map((enroll, idx) => (
              <EnrollmentCard key={enroll.ss_id ?? idx} enroll={enroll} onClick={handleViewDetails} onUnenroll={handleUnenroll} />
            ))}
            {enrollments.length === 0 && !error && (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-3xl p-24 text-center border-2 border-dashed border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="text-6xl mb-6 opacity-20">📖</div>
                <p className="text-gray-400 font-black uppercase text-sm tracking-widest">No active enrollments found.</p>
              </div>
            )}
          </div>
        )}
      </div>

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

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default MyCourses;
