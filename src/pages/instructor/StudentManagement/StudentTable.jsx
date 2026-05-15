import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { authAPI } from '../../../services/APIservice';
import EssayReview from './GradongPortal';

// ─────────────────────────────────────────────────────────────────────────────
// UI Components & Helpers
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-100">
        {[1, 2, 3, 4, 5, 6].map(i => (
            <td key={i} className="px-6 py-6"><div className="h-3 bg-gray-200 rounded shadow-sm" /></td>
        ))}
    </tr>
);

const StatusBadge = ({ status }) => {
    const s = (status || 'active').toLowerCase();
    const isAtRisk = s === 'at risk' || s === 'at-risk';
    const isPending = s === 'pending';
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
            isAtRisk ? 'bg-red-50 text-red-700 border-red-200' :
            isPending ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
            'bg-green-50 text-green-700 border-green-200'
        }`}>
            {status || 'Active'}
        </span>
    );
};

const [currentView, setCurrentView] = useState('list');

// ─────────────────────────────────────────────────────────────────────────────
// Material Type Config (GClass-style colored banners)
// ─────────────────────────────────────────────────────────────────────────────
const getMaterialConfig = (fileType = '') => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf') || type === 'pdf') return {
        icon: (
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
            </svg>
        ),
        bg: 'bg-red-600',
        label: 'PDF',
        accent: 'bg-red-50 text-red-700 border-red-100',
        badgeBg: 'bg-red-50 text-red-700 border border-red-100',
        previewable: true,
    };
    if (type.includes('video')) return {
        icon: (
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
        ),
        bg: 'bg-blue-600',
        label: 'Video',
        accent: 'bg-blue-50 text-blue-700 border-blue-100',
        badgeBg: 'bg-blue-50 text-blue-700 border border-blue-100',
        previewable: true,
    };
    if (type.includes('audio')) return {
        icon: (
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
        ),
        bg: 'bg-purple-600',
        label: 'Audio',
        accent: 'bg-purple-50 text-purple-700 border-purple-100',
        badgeBg: 'bg-purple-50 text-purple-700 border border-purple-100',
        previewable: true,
    };
    if (type.includes('image')) return {
        icon: (
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
        ),
        bg: 'bg-teal-600',
        label: 'Image',
        accent: 'bg-teal-50 text-teal-700 border-teal-100',
        badgeBg: 'bg-teal-50 text-teal-700 border border-teal-100',
        previewable: true,
    };
    return {
        icon: (
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
        ),
        bg: 'bg-gray-600',
        label: 'File',
        accent: 'bg-gray-50 text-gray-700 border-gray-200',
        badgeBg: 'bg-gray-50 text-gray-700 border border-gray-200',
        previewable: false,
    };
};


// ─────────────────────────────────────────────────────────────────────────────
// Google Classroom-style Full-Screen Material Viewer Modal
// — Same design & logic as MyCourses.jsx MaterialViewerModal
// ─────────────────────────────────────────────────────────────────────────────
const MaterialViewerModal = ({ material, onClose }) => {
    if (!material) return null;

    const config = getMaterialConfig(material.file_type || material.type || '');
    const title = material.file_name || material.title || 'Untitled Material';
    const fileUrl = material.file_url || material.url || '';
    const description = material.description || '';
    const fileType = (material.file_type || material.type || '').toLowerCase();
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

    // Derive file extension from URL as fallback
    const getExtFromUrl = (url = '') => url.split('.').pop()?.split('?')[0]?.toLowerCase() || '';
    const resolvedFileType = fileType || getExtFromUrl(fileUrl);

    // Escape key closes the viewer
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    // Fetch PDF as blob to avoid CORS / mixed-content issues
    useEffect(() => {
        let objectUrl = null;

        const loadPdf = async () => {
            if (!fileUrl) return;
            try {
                const res = await fetch(fileUrl);
                const blob = await res.blob();
                const pdfBlob = new Blob([blob], { type: 'application/pdf' });
                objectUrl = URL.createObjectURL(pdfBlob);
                setPdfBlobUrl(objectUrl);
            } catch (err) {
                console.error('PDF blob load error:', err);
            }
        };

        if (resolvedFileType.includes('pdf') || resolvedFileType === 'pdf') {
            loadPdf();
        }

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fileUrl, resolvedFileType]);

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

        // PDF: blob iframe — no new tab, no toolbar
        if (resolvedFileType.includes('pdf') || resolvedFileType === 'pdf') {
            return pdfBlobUrl ? (
                <iframe
                    src={pdfBlobUrl}
                    className="w-full h-full border-0"
                    title={title}
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <svg className="w-8 h-8 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <span className="text-sm text-gray-400 font-black uppercase tracking-widest">Loading PDF...</span>
                </div>
            );
        }

        // VIDEO: object-contain, native controls
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

        

        // AUDIO: centered player with icon
        if (resolvedFileType.includes('audio') || ['mp3','wav','ogg','flac','aac'].includes(resolvedFileType)) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-10 bg-gray-50 px-8">
                    <div className={`w-32 h-32 ${config.bg} rounded-3xl flex items-center justify-center text-white shadow-2xl`}>
                        <svg viewBox="0 0 24 24" className="w-14 h-14" fill="currentColor">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-base font-black text-gray-800 uppercase tracking-tight">{title}</p>
                        {description && <p className="text-xs text-gray-400 mt-1 italic">{description}</p>}
                    </div>
                    <audio src={fileUrl} controls className="w-full max-w-md rounded-2xl shadow-sm">
                        Your browser does not support audio playback.
                    </audio>
                </div>
            );
        }

        // IMAGE: inline display, object-contain, no new tab
        if (
            resolvedFileType.includes('image') ||
            ['jpg','jpeg','png','gif','webp','svg','bmp','tiff'].includes(resolvedFileType)
        ) {
            return (
                <div className="flex items-center justify-center h-full w-full bg-gray-50 p-6 overflow-auto">
                    <img
                        src={fileUrl}
                        alt={title}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-lg select-none"
                        draggable={false}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
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

        // GENERIC: no preview available, show download prompt
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6 bg-gray-50 px-8">
                <div className={`w-28 h-28 ${config.bg} rounded-3xl flex items-center justify-center text-white shadow-2xl`}>
                    <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                    </svg>
                </div>
                <div className="text-center">
                    <p className="text-base font-black text-gray-700 uppercase tracking-tight">Preview Not Available</p>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs">This file type cannot be previewed in the browser. Use the Download button to open it.</p>
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-8 py-3 bg-[#16a34a] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg"
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
            {/* Full-screen fixed overlay */}
            <div
                className="fixed inset-0 z-[300] flex flex-col bg-white"
                style={{ animation: 'gclassViewerIn 0.2s ease-out' }}
            >
                {/* Top Navigation Bar */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">

                    {/* Left: Close button + File Info */}
                    <div className="flex items-center gap-4 min-w-0">
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all font-black text-[10px] uppercase tracking-widest flex-shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Close
                        </button>

                        {/* Divider */}
                        <div className="h-6 w-px bg-gray-200 flex-shrink-0" />

                        {/* File type badge + title */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`${config.bg} w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                                <div className="scale-[0.65]">{config.icon}</div>
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight truncate leading-tight">
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
                                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
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
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#16a34a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-sm"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                Download
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
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
// GClassroom-style Material Card (Instructor View) — clickable
// ─────────────────────────────────────────────────────────────────────────────
const MaterialCard = ({ material, onDelete, onView }) => {
    const config = getMaterialConfig(material.file_type || material.type || '');
    const title = material.file_name || material.title || 'Untitled Material';
    const description = material.description || '';
    const date = material.created_at
        ? new Date(material.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recently posted';

    return (
        <div
            className="group flex items-stretch bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
            onClick={() => onView(material)}
        >
            {/* Left color banner */}
            <div className={`${config.bg} w-16 flex-shrink-0 flex flex-col items-center justify-center text-white gap-1 py-4`}>
                {config.icon}
                <span className="text-[8px] font-black uppercase tracking-wider opacity-90">{config.label}</span>
            </div>

            {/* Content */}
            <div className="flex-1 px-5 py-4 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h4 className="text-[13px] font-black text-gray-900 uppercase tracking-tight truncate leading-tight group-hover:text-[#16a34a] transition-colors">
                            {title}
                        </h4>
                        {description && (
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 italic">{description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">{date}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(material); }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${config.accent}`}>
                        {config.label}
                    </span>
                    {material.file_size && (
                        <span className="text-[9px] font-bold text-gray-400">{material.file_size}</span>
                    )}
                    <span className="ml-auto text-[9px] font-black text-[#16a34a] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        View →
                    </span>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// File Drop Zone
// ─────────────────────────────────────────────────────────────────────────────
const FileDropZone = ({ onFileSelect, selectedFile }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFileSelect({ target: { files: [file] } });
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-6 flex flex-col items-center justify-center gap-3 text-center
                ${isDragging ? 'border-[#16a34a] bg-green-50 scale-[1.01]' : selectedFile ? 'border-[#16a34a] bg-green-50/40' : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'}`}
        >
            <input ref={inputRef} type="file" className="hidden" onChange={onFileSelect} />
            {selectedFile ? (
                <>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#16a34a]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight truncate max-w-[200px]">{selectedFile.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB · Click to change</p>
                    </div>
                </>
            ) : (
                <>
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Drop file here or <span className="text-[#16a34a]">browse</span></p>
                        <p className="text-[9px] font-bold text-gray-400 mt-0.5">PDF, Video, Audio, Images supported</p>
                    </div>
                </>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component: StudentTable
// ─────────────────────────────────────────────────────────────────────────────
const StudentTable = ({ sectionId, sectionName, sectionCode, deptAbbr, programAbbr, onBack }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [error, setError] = useState('');

    const [activeTab, setActiveTab] = useState('students');
    const [materials, setMaterials] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Material Viewer State
    const [viewerMaterial, setViewerMaterial] = useState(null);
    const [isFetchingMaterial, setIsFetchingMaterial] = useState(false);

    // Form State for Upload Modal
    const [uploadForm, setUploadForm] = useState({
        title: '',
        fileType: 'pdf',
        description: '',
        file: null
    });

    const fileInputRef = useRef(null);

    const getCleanToken = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') return null;
        return token.replace(/['"]+/g, '').trim();
    }, []);

    /**
     * UPDATED FETCHDATA
     * Ngayon, kinukuha natin ang listahan gamit ang getPendingStudents 
     * at sinasama natin sa existing student list para makita ni Instructor.
     */
    const fetchData = useCallback(async () => {
        const storedSection = localStorage.getItem('selectedSection');
        const activeSection = storedSection ? JSON.parse(storedSection) : null;
        const sId = sectionId || activeSection?.section_id || activeSection?.id;

        if (!sId) { setLoading(false); return; }

        setLoading(true);
        try {
            const token = getCleanToken();

            // 1. Fetch Students (Main List)
            const studentsRes = await authAPI.getSectionStudents(sId, token);
           let mainStudents = [];

if (studentsRes.ok) {
    const sData = await studentsRes.json();

    console.log("MAIN STUDENTS RESPONSE:", sData);

    if (Array.isArray(sData)) {
        mainStudents = sData;
    } 
    else if (Array.isArray(sData.students)) {
        mainStudents = sData.students;
    } 
    else if (sData.student) {
        mainStudents = [sData.student];
    } 
    else if (sData.students && typeof sData.students === 'object') {
        mainStudents = [sData.students];
    }
}

            // 2. Fetch Pending Students (New API)
          // 2. Fetch Pending Students (New API)
const pendingRes = await authAPI.getPendingStudents(sId, token);

let pendingStudents = [];

if (pendingRes.ok) {
    const pData = await pendingRes.json();

    console.log("PENDING RESPONSE:", pData);

    // Handle different API response structures safely
    let pendingArray = [];

    if (Array.isArray(pData)) {
        pendingArray = pData;
    } 
    else if (Array.isArray(pData.students)) {
        pendingArray = pData.students;
    } 
    else if (pData.student) {
        pendingArray = [pData.student];
    } 
    else if (pData.students && typeof pData.students === 'object') {
        pendingArray = [pData.students];
    }

    pendingStudents = pendingArray.map(s => ({
        ...s,
        status: 'pending'
    }));
}

            // Pagsamahin ang dalawa (Pending sa taas kung gusto mo, o depende sa sort)
            setStudents([...pendingStudents, ...mainStudents]);

        } catch (err) {
            console.error("Fetch Error:", err);
            setError('Failed to sync data.');
        } finally {
            setLoading(false);
        }

        // Fetch materials separately (using the new getMaterials endpoint)
        try {
            const token = getCleanToken();
            const sId2 = sectionId || (() => {
                const s = localStorage.getItem('selectedSection');
                const a = s ? JSON.parse(s) : null;
                return a?.section_id || a?.id;
            })();
            if (!sId2) return;
            const materialsRes = await authAPI.getMaterials(sId2, token);
            if (materialsRes && materialsRes.ok) {
                const mData = await materialsRes.json();
                setMaterials(mData.materials || mData || []);
            }
        } catch (err) {
            console.warn('Materials fetch failed (non-critical):', err);
        }
    }, [sectionId, getCleanToken]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Open material viewer — uses the new getSpecificMaterial API
    const handleViewMaterial = async (material) => {
        const storedSection = localStorage.getItem('selectedSection');
        const activeSection = storedSection ? JSON.parse(storedSection) : null;
        const sId = sectionId || activeSection?.section_id || activeSection?.id;
        const materialId = material.id || material.material_id;

        if (material.file_url || material.url) {
            setViewerMaterial(material);
            return;
        }

        if (!sId || !materialId) {
            setViewerMaterial(material);
            return;
        }

        setIsFetchingMaterial(true);
        try {
            const token = getCleanToken();
            const res = await authAPI.getSpecificMaterial(sId, materialId, token);
            if (res.ok) {
                const data = await res.json();
                setViewerMaterial({ ...material, ...data });
            } else {
                setViewerMaterial(material);
            }
        } catch (err) {
            console.error("Error fetching specific material:", err);
            setViewerMaterial(material);
        } finally {
            setIsFetchingMaterial(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUploadForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const mime = file.type;
        let autoType = 'pdf';
        if (mime.startsWith('video/')) autoType = 'video';
        else if (mime.startsWith('audio/')) autoType = 'audio';
        else if (mime.startsWith('image/')) autoType = 'image';
        setUploadForm(prev => ({ ...prev, file, fileType: autoType }));
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadForm.file || !uploadForm.title) {
            alert("Please provide a title and select a file.");
            return;
        }

        const storedSection = localStorage.getItem('selectedSection');
        const activeSection = storedSection ? JSON.parse(storedSection) : null;
        const sId = sectionId || activeSection?.section_id || activeSection?.id;

        setIsUploading(true);
        setUploadProgress(0);

        const progressInterval = setInterval(() => {
            setUploadProgress(p => p < 85 ? p + Math.random() * 15 : p);
        }, 300);

        const formData = new FormData();
        formData.append('material', uploadForm.file);
        formData.append('title', uploadForm.title);
        formData.append('type', uploadForm.fileType);
        formData.append('description', uploadForm.description);

        try {
            const token = getCleanToken();
            // Using updated uploadMaterial
            const res = await authAPI.uploadMaterial(sId, formData, token);
            clearInterval(progressInterval);
            setUploadProgress(100);

            if (res.ok) {
                setTimeout(() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({ title: '', fileType: 'pdf', description: '', file: null });
                    setUploadProgress(0);
                    fetchData();
                }, 600);
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Upload failed: ${errorData.message || "Error occurred."}`);
                setUploadProgress(0);
            }
        } catch (err) {
            clearInterval(progressInterval);
            console.error("Upload Error:", err);
            alert("An error occurred during upload.");
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    /**
     * UPDATED HANDLEACTION
     * Gumagamit na ng approveStudent at rejectStudent APIs
     */
    const handleAction = async (requestId, action) => {
        const storedSection = localStorage.getItem('selectedSection');
        const activeSection = storedSection ? JSON.parse(storedSection) : null;
        const sId = activeSection?.section_id || activeSection?.id || sectionId;
        if (!sId || !requestId) return;

        try {
            const token = getCleanToken();
            let res;
            
            if (action === 'approve') {
                res = await authAPI.approveStudent(sId, requestId, token);
            } else {
                res = await authAPI.rejectStudent(sId, requestId, token);
            }

            if (res.ok) {
                // Refresh list para mawala ang pending at lumipat sa active (o mawala pag reject)
                await fetchData();
            } else {
                alert("Action failed. Please try again.");
            }
        } catch (err) {
            console.error("HandleAction Error:", err);
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const fullName = (s.full_name || `${s.first_name || ''} ${s.last_name || ''}` || '').toLowerCase();
            const email = (s.email || '').toLowerCase();
            const sIdStr = (s.student_id || s.id || '').toString().toLowerCase();
            const search = searchTerm.toLowerCase();
            return fullName.includes(search) || email.includes(search) || sIdStr.includes(search);
        });
    }, [students, searchTerm]);

    const closeUploadModal = () => {
        if (isUploading) return;
        setIsUploadModalOpen(false);
        setUploadForm({ title: '', fileType: 'pdf', description: '', file: null });
        setUploadProgress(0);
    };

    const FILE_TYPES = [
        { value: 'pdf', label: 'Document (PDF)', icon: '📕' },
        { value: 'video', label: 'Video Content', icon: '🎥' },
        { value: 'audio', label: 'Audio / Podcast', icon: '🎙️' },
        { value: 'image', label: 'Image / Graphic', icon: '🖼️' },
    ];

    return (
        <div className="flex flex-col h-full bg-white relative overflow-hidden text-gray-900">

            {/* HEADER AREA */}
            <div className="px-10 pt-10 pb-4 bg-white border-b border-gray-50">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onBack}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-900 hover:text-white hover:bg-black transition-all border border-gray-200"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-[#16a34a] uppercase tracking-[0.2em]">
                                    {deptAbbr || "Academic"} Management — {programAbbr || "Course"}
                                </span>
                            </div>
                            <h2 className="text-3xl font-black uppercase text-gray-900 tracking-tighter leading-none">
                                {sectionName || "Section Details"}
                            </h2>
                            {sectionCode && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Section Code</span>
                                    <span className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-black text-gray-700 tracking-widest uppercase select-all">
                                        {sectionCode}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'students' ? 'border-b-4 border-[#16a34a] text-gray-900' : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        Student List
                    </button>
                    <button
                        onClick={() => setActiveTab('materials')}
                        className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'materials' ? 'border-b-4 border-[#16a34a] text-gray-900' : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        Materials Library
                    </button>
                </div>
            </div>

            {/* SEARCH & ACTION BAR */}
            <div className="px-10 py-6 flex justify-between items-center bg-gray-50/30">
                {activeTab === 'students' ? (
                    <div className="relative group max-w-2xl w-full">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-900 group-focus-within:text-[#16a34a] transition-colors" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="SEARCH BY NAME, ID, OR EMAIL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-8 py-5 bg-white border border-gray-200 rounded-2xl text-[11px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-green-50 focus:border-[#16a34a] transition-all outline-none text-gray-900 shadow-sm"
                        />
                    </div>
                ) : (
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Course Materials</p>
                            <p className="text-[9px] font-bold text-gray-400 mt-0.5">{materials.length} resource{materials.length !== 1 ? 's' : ''} posted · Click any material to view</p>
                        </div>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="px-5 py-3 bg-[#16a34a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Material
                        </button>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-auto px-10 py-2 no-scrollbar">
                {activeTab === 'students' ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] border-b border-gray-200">
                                <th className="px-6 py-5">Student Name</th>
                                <th className="px-6 py-5">Gbox Account</th>
                                <th className="px-6 py-5">Progress</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Last Active</th>
                                <th className="px-6 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => {
                                    const isPending = (student.status || '').toLowerCase() === 'pending';
                                    return (
                                        <tr key={student.ss_id || student.id} className="group hover:bg-gray-50 transition-all">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-[10px] font-black">
                                                        {(student.full_name || 'U').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-black text-gray-900 uppercase italic tracking-tight group-hover:text-[#16a34a]">
                                                        {student.full_name || `${student.first_name} ${student.last_name}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6"><span className="text-[11px] font-bold text-gray-800">{student.email}</span></td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#16a34a]" style={{ width: `${student.progress || 0}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-900">{student.progress || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6"><StatusBadge status={student.status} /></td>
                                            <td className="px-6 py-6 text-[10px] font-black text-gray-700 uppercase tracking-widest">{student.last_active || 'Never'}</td>
                                            <td className="px-6 py-6 text-right">
                                                {isPending ? (
                                                    <div className="flex gap-2 justify-end">
                                                        <button 
                                                            onClick={() => handleAction(student.ss_id || student.id, 'approve')}
                                                            className="px-4 py-2 bg-[#16a34a] text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(student.ss_id || student.id, 'deny')}
                                                            className="px-4 py-2 bg-white border border-red-500 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            Deny
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="px-5 py-2.5 bg-white border border-gray-900 text-gray-900 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black hover:text-white transition-all">View Details</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center text-gray-900">
                                        <div className="text-6xl mb-4">🔍</div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No students found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    /* GOOGLE CLASSROOM-STYLE MATERIALS LIST */
                    <div className="max-w-3xl mx-auto py-6 space-y-3">
                        {materials.length > 0 ? (
                            <>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-px flex-1 bg-gray-200" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">All Materials</span>
                                    <div className="h-px flex-1 bg-gray-200" />
                                </div>
                                {materials.map((m, idx) => (
                                    <MaterialCard
                                        key={m.id || idx}
                                        material={m}
                                        onView={handleViewMaterial}
                                        onDelete={() => {/* handle delete */}}
                                    />
                                ))}
                            </>
                        ) : (
                            <div className="py-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[3rem]">
                                <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                    </svg>
                                </div>
                                <p className="text-[11px] font-black text-gray-700 uppercase tracking-[0.3em] mb-1">No Materials Yet</p>
                                <p className="text-[10px] text-gray-400 mb-5">Upload your first course resource to get started.</p>
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="px-5 py-2.5 bg-[#16a34a] text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all"
                                >
                                    Add First Material
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* LOADING OVERLAY */}
            {isFetchingMaterial && (
                <div className="fixed inset-0 z-[290] flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl px-8 py-6 flex items-center gap-4 shadow-2xl">
                        <svg className="w-5 h-5 animate-spin text-[#16a34a]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Opening file...</span>
                    </div>
                </div>
            )}

            {/* Material Viewer */}
            {viewerMaterial && (
                <MaterialViewerModal
                    material={viewerMaterial}
                    onClose={() => setViewerMaterial(null)}
                />
            )}

            {/* MODAL: UPLOAD MATERIAL */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={closeUploadModal}
                    />
                    <div
                        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
                        style={{ animation: 'modalIn 0.2s ease-out' }}
                    >
                        {isUploading && (
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-100 z-10 overflow-hidden">
                                <div
                                    className="h-full bg-[#16a34a] transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}

                        <div className="px-7 pt-7 pb-5 flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 leading-none">
                                    Add Material
                                </h3>
                                <p className="text-[10px] font-semibold text-gray-400 mt-1.5 tracking-widest uppercase">
                                    {sectionName || 'Course'} · Materials Library
                                </p>
                            </div>
                            <button
                                onClick={closeUploadModal}
                                disabled={isUploading}
                                className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all disabled:opacity-40"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="h-px bg-gray-100 mx-7" />

                        <form onSubmit={handleUploadSubmit} className="px-7 py-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={uploadForm.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Module 1: Introduction to the Course"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                    Type
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                        <span className="text-base">
                                            {FILE_TYPES.find(ft => ft.value === uploadForm.fileType)?.icon}
                                        </span>
                                    </div>
                                    <select
                                        name="fileType"
                                        value={uploadForm.fileType}
                                        onChange={handleInputChange}
                                        className="w-full appearance-none pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a] transition-all cursor-pointer"
                                    >
                                        {FILE_TYPES.map(ft => (
                                            <option key={ft.value} value={ft.value}>{ft.label}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                    File <span className="text-red-500">*</span>
                                </label>
                                <FileDropZone onFileSelect={handleFileSelect} selectedFile={uploadForm.file} />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                    Description{' '}
                                    <span className="text-gray-300 font-bold normal-case tracking-normal">(optional)</span>
                                </label>
                                <textarea
                                    name="description"
                                    rows={2}
                                    value={uploadForm.description}
                                    onChange={handleInputChange}
                                    placeholder="Brief note about this material..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a] transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={closeUploadModal}
                                    disabled={isUploading}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all disabled:opacity-40"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                        ${isUploading
                                            ? 'bg-[#16a34a]/70 text-white cursor-not-allowed'
                                            : 'bg-[#16a34a] text-white hover:bg-green-700 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    {isUploading ? (
                                        <>
                                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                            Uploading {Math.round(uploadProgress)}%
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            Publish Material
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            return (
  <div className="container">
      {/* Ang existing navigation buttons mo */}
      <div className="flex gap-4">
          <button onClick={() => setCurrentView('list')}>Student List</button>
          <button onClick={() => setCurrentView('essays')}>Essay Submissions</button>
      </div>

      {/* Dito papasok ang logic */}
      {currentView === 'list' ? (
          // DITO MO ILALAGAY YUNG BUONG 1000 LINES NG TABLE MO
          <div className="your-existing-table-logic">
             {/* ... current code mo ... */}
          </div>
      ) : currentView === 'essays' ? (
          // DITO PAPASOK YUNG BAGONG COMPONENT
          <EssayReview sectionId={selectedSectionId} />
      ) : (
          <MaterialsLibrary />
      )}
  </div>
);

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.97) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes gclassViewerIn {
                    from { opacity: 0; transform: scale(0.99) translateY(6px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default StudentTable;