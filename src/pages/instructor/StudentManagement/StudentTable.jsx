import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authAPI } from '../../../services/APIservice';
import GradingPortal from './GradingPortal';

const readStoredSection = () => {
    try {
        const stored = localStorage.getItem('selectedSection');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const getCleanToken = () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') return null;
    return token.replace(/['"]+/g, '').trim();
};

const toArray = (payload, keys = []) => {
    if (Array.isArray(payload)) return payload;

    for (const key of keys) {
        if (Array.isArray(payload?.[key])) return payload[key];
    }

    for (const key of keys) {
        if (payload?.[key] && typeof payload[key] === 'object') return [payload[key]];
    }

    return [];
};

const getStudentName = (student = {}) => {
    const fullName = student.full_name || student.student_name;
    if (fullName) return fullName;
    return `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown Student';
};

const getStudentKey = (student = {}, index) => {
    return student.ss_id || student.student_section_id || student.student_id || student.id || student.email || index;
};

const mergeStudents = (pendingStudents, mainStudents) => {
    const seen = new Set();
    const merged = [];

    [...pendingStudents, ...mainStudents].forEach((student, index) => {
        const key = getStudentKey(student, index);
        if (seen.has(key)) return;
        seen.add(key);
        merged.push(student);
    });

    return merged;
};

const getMaterialConfig = (fileType = '') => {
    const type = String(fileType).toLowerCase();

    if (type.includes('pdf') || type === 'pdf') {
        return {
            label: 'PDF',
            shortLabel: 'PDF',
            bg: 'bg-red-600',
            accent: 'bg-red-50 text-red-700 border-red-100',
            badgeBg: 'bg-red-50 text-red-700 border border-red-100'
        };
    }

    if (type.includes('video')) {
        return {
            label: 'Video',
            shortLabel: 'VID',
            bg: 'bg-blue-600',
            accent: 'bg-blue-50 text-blue-700 border-blue-100',
            badgeBg: 'bg-blue-50 text-blue-700 border border-blue-100'
        };
    }

    if (type.includes('audio')) {
        return {
            label: 'Audio',
            shortLabel: 'AUD',
            bg: 'bg-purple-600',
            accent: 'bg-purple-50 text-purple-700 border-purple-100',
            badgeBg: 'bg-purple-50 text-purple-700 border border-purple-100'
        };
    }

    if (type.includes('image')) {
        return {
            label: 'Image',
            shortLabel: 'IMG',
            bg: 'bg-teal-600',
            accent: 'bg-teal-50 text-teal-700 border-teal-100',
            badgeBg: 'bg-teal-50 text-teal-700 border border-teal-100'
        };
    }

    return {
        label: 'File',
        shortLabel: 'FILE',
        bg: 'bg-gray-600',
        accent: 'bg-gray-50 text-gray-700 border-gray-200',
        badgeBg: 'bg-gray-50 text-gray-700 border border-gray-200'
    };
};

const getExtFromUrl = (url = '') => {
    return String(url).split('.').pop()?.split('?')[0]?.toLowerCase() || '';
};

const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-100">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <td key={i} className="px-6 py-6">
                <div className="h-3 bg-gray-200 rounded shadow-sm" />
            </td>
        ))}
    </tr>
);

const StatusBadge = ({ status }) => {
    const s = String(status || 'active').toLowerCase();
    const isAtRisk = s === 'at risk' || s === 'at-risk';
    const isPending = s === 'pending';

    return (
        <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                isAtRisk
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : isPending
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-green-50 text-green-700 border-green-200'
            }`}
        >
            {status || 'Active'}
        </span>
    );
};

const FileIcon = ({ config }) => (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-[8px] font-black">
        {config.shortLabel}
    </div>
);

const MaterialViewerModal = ({ material, onClose }) => {
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

    const config = getMaterialConfig(material?.file_type || material?.type || '');
    const title = material?.file_name || material?.title || 'Untitled Material';
    const fileUrl = material?.file_url || material?.url || '';
    const description = material?.description || '';
    const fileType = String(material?.file_type || material?.type || '').toLowerCase();
    const resolvedFileType = fileType || getExtFromUrl(fileUrl);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

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

        setPdfBlobUrl(null);

        if (resolvedFileType.includes('pdf') || resolvedFileType === 'pdf') {
            loadPdf();
        }

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fileUrl, resolvedFileType]);

    if (!material) return null;

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
                <div className="flex h-full flex-col items-center justify-center gap-4 text-gray-400">
                    <p className="text-sm font-black uppercase tracking-widest">File not available</p>
                    <p className="text-xs">No URL was returned from the server.</p>
                </div>
            );
        }

        if (resolvedFileType.includes('pdf') || resolvedFileType === 'pdf') {
            return pdfBlobUrl ? (
                <iframe src={pdfBlobUrl} className="h-full w-full border-0" title={title} />
            ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-100 border-t-red-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-gray-400">Loading PDF...</span>
                </div>
            );
        }

        if (resolvedFileType.includes('video') || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(resolvedFileType)) {
            return (
                <div className="flex h-full items-center justify-center bg-black">
                    <video src={fileUrl} controls className="h-full w-full object-contain">
                        Your browser does not support video playback.
                    </video>
                </div>
            );
        }

        if (resolvedFileType.includes('audio') || ['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(resolvedFileType)) {
            return (
                <div className="flex h-full flex-col items-center justify-center gap-10 bg-gray-50 px-8">
                    <div className={`flex h-32 w-32 items-center justify-center rounded-3xl ${config.bg} text-white shadow-2xl`}>
                        <FileIcon config={config} />
                    </div>
                    <div className="text-center">
                        <p className="text-base font-black uppercase tracking-tight text-gray-800">{title}</p>
                        {description && <p className="mt-1 text-xs italic text-gray-400">{description}</p>}
                    </div>
                    <audio src={fileUrl} controls className="w-full max-w-md rounded-2xl shadow-sm">
                        Your browser does not support audio playback.
                    </audio>
                </div>
            );
        }

        if (
            resolvedFileType.includes('image') ||
            ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(resolvedFileType)
        ) {
            return (
                <div className="flex h-full w-full items-center justify-center overflow-auto bg-gray-50 p-6">
                    <img
                        src={fileUrl}
                        alt={title}
                        className="max-h-full max-w-full select-none rounded-xl object-contain shadow-lg"
                        draggable={false}
                    />
                </div>
            );
        }

        return (
            <div className="flex h-full flex-col items-center justify-center gap-6 bg-gray-50 px-8">
                <div className={`flex h-28 w-28 items-center justify-center rounded-3xl ${config.bg} text-white shadow-2xl`}>
                    <FileIcon config={config} />
                </div>
                <div className="text-center">
                    <p className="text-base font-black uppercase tracking-tight text-gray-700">Preview Not Available</p>
                    <p className="mt-2 max-w-xs text-sm text-gray-400">This file type cannot be previewed in the browser.</p>
                </div>
                <button
                    onClick={handleDownload}
                    className="rounded-2xl bg-[#16a34a] px-8 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-green-700"
                >
                    Download File
                </button>
            </div>
        );
    };

    return (
        <>
            <div className="fixed inset-0 z-[300] flex flex-col bg-white" style={{ animation: 'gclassViewerIn 0.2s ease-out' }}>
                <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
                    <div className="flex min-w-0 items-center gap-4">
                        <button
                            onClick={onClose}
                            className="flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
                        >
                            Close
                        </button>

                        <div className="h-6 w-px flex-shrink-0 bg-gray-200" />

                        <div className="flex min-w-0 items-center gap-3">
                            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${config.bg} text-white`}>
                                <FileIcon config={config} />
                            </div>
                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-black uppercase leading-tight tracking-tight text-gray-900">{title}</h2>
                                {description && <p className="mt-0.5 truncate text-[10px] italic text-gray-400">{description}</p>}
                            </div>
                            <span className={`hidden flex-shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest sm:inline-flex ${config.badgeBg}`}>
                                {config.label}
                            </span>
                        </div>
                    </div>

                    <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                        {fileUrl && (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden rounded-xl bg-gray-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-700 transition-all hover:bg-gray-200 sm:flex"
                            >
                                Open Tab
                            </a>
                        )}
                        {fileUrl && (
                            <button
                                onClick={handleDownload}
                                className="rounded-xl bg-[#16a34a] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-green-700"
                            >
                                Download
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">{renderContent()}</div>
            </div>

            <style>{`
                @keyframes gclassViewerIn {
                    from { opacity: 0; transform: scale(0.99) translateY(6px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
};

const MaterialCard = ({ material, onDelete, onView }) => {
    const config = getMaterialConfig(material.file_type || material.type || '');
    const title = material.file_name || material.title || 'Untitled Material';
    const description = material.description || '';
    const date = material.created_at
        ? new Date(material.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recently posted';

    return (
        <div
            className="group flex cursor-pointer items-stretch overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-md"
            onClick={() => onView(material)}
        >
            <div className={`flex w-16 flex-shrink-0 flex-col items-center justify-center gap-1 py-4 text-white ${config.bg}`}>
                <FileIcon config={config} />
                <span className="text-[8px] font-black uppercase tracking-wider opacity-90">{config.label}</span>
            </div>

            <div className="min-w-0 flex-1 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-[13px] font-black uppercase leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-[#16a34a]">
                            {title}
                        </h4>
                        {description && <p className="mt-1 line-clamp-1 text-[11px] italic text-gray-500">{description}</p>}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                        <span className="whitespace-nowrap text-[9px] font-bold text-gray-400">{date}</span>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(material);
                                }}
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                title="Delete"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${config.accent}`}>
                        {config.label}
                    </span>
                    {material.file_size && <span className="text-[9px] font-bold text-gray-400">{material.file_size}</span>}
                    <span className="ml-auto flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#16a34a] opacity-0 transition-opacity group-hover:opacity-100">
                        View
                    </span>
                </div>
            </div>
        </div>
    );
};

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
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                isDragging
                    ? 'scale-[1.01] border-[#16a34a] bg-green-50'
                    : selectedFile
                    ? 'border-[#16a34a] bg-green-50/40'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            }`}
        >
            <input ref={inputRef} type="file" className="hidden" onChange={onFileSelect} />
            {selectedFile ? (
                <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-[#16a34a]">OK</div>
                    <div>
                        <p className="max-w-[200px] truncate text-[11px] font-black uppercase tracking-tight text-gray-900">{selectedFile.name}</p>
                        <p className="mt-0.5 text-[9px] font-bold text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB - Click to change</p>
                    </div>
                </>
            ) : (
                <div>
                    <p className="text-[11px] font-black uppercase tracking-tight text-gray-600">
                        Drop file here or <span className="text-[#16a34a]">browse</span>
                    </p>
                    <p className="mt-0.5 text-[9px] font-bold text-gray-400">PDF, video, audio, and images supported</p>
                </div>
            )}
        </div>
    );
};

const SubmissionStatusBadge = ({ status, pendingReview, feedbackState }) => {
    const normalizedStatus = String(status || '').toLowerCase();
    const isPendingReview =
        pendingReview === true ||
        feedbackState === 'pending_review' ||
        normalizedStatus === 'pending_review' ||
        normalizedStatus === 'pending';
    const isGraded = normalizedStatus === 'graded' || normalizedStatus === 'checked';

    return (
        <span
            className={`flex-shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                isGraded
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : isPendingReview
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-gray-200 bg-gray-100 text-gray-500'
            }`}
        >
            {isGraded ? 'Graded' : isPendingReview ? 'For Review' : status || 'Submitted'}
        </span>
    );
};

const EssaySubmissionCard = ({ submission, onReview }) => {
    const isGraded = ['graded', 'checked'].includes(String(submission.status || '').toLowerCase());
    const studentName = submission.studentName || submission.full_name || submission.student_name || 'Unknown Student';
    const essayTitle = submission.essayTitle || submission.essay_title || submission.title || submission.question_text || 'Untitled Essay';
    const submittedDate = submission.date || submission.submitted_at || submission.created_at;
    const displayDate = submittedDate
        ? new Date(submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recently submitted';
    const wordCount = submission.wordCount || submission.word_count || 0;
    const pointsAwarded = submission.points_awarded;
    const maxPoints = submission.max_points || submission.total_points || submission.points || 100;
    const sourceType = submission.source_type || submission.type || 'activity';
    const initials = studentName.substring(0, 2).toUpperCase();

    return (
        <div
            className="group flex cursor-pointer items-stretch overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-md"
            onClick={() => onReview(submission)}
        >
            <div className={`w-1.5 flex-shrink-0 ${isGraded ? 'bg-green-500' : 'bg-amber-400'}`} />
            <div className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-black text-white">
                    {initials}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="mb-0.5 text-[11px] font-black uppercase tracking-widest text-gray-400">{studentName}</p>
                            <h4 className="truncate text-[13px] font-black uppercase leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-[#16a34a]">
                                {essayTitle}
                            </h4>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                            <span
                                className={`rounded-lg border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${
                                    sourceType === 'quiz'
                                        ? 'border-purple-100 bg-purple-50 text-purple-600'
                                        : 'border-blue-100 bg-blue-50 text-blue-600'
                                }`}
                            >
                                {sourceType === 'quiz' ? 'Quiz' : 'Activity'}
                            </span>
                            <SubmissionStatusBadge
                                status={submission.status}
                                pendingReview={submission.pending_review}
                                feedbackState={submission.feedback_state}
                            />
                        </div>
                    </div>

                    <div className="mt-2 flex items-center gap-4">
                        <span className="text-[9px] font-bold text-gray-400">{displayDate}</span>
                        {wordCount > 0 && <span className="text-[9px] font-bold text-gray-400">{wordCount.toLocaleString()} words</span>}
                        {isGraded && pointsAwarded != null ? (
                            <span className="ml-auto text-[9px] font-black text-green-600">{pointsAwarded}/{maxPoints} pts</span>
                        ) : (
                            <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-[#16a34a] opacity-0 transition-opacity group-hover:opacity-100">
                                Review
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentTable = ({
    sectionId,
    sectionName,
    sectionCode,
    courseJoinCode,
    deptAbbr,
    programAbbr,
    onBack
}) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('students');

    const [materials, setMaterials] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [viewerMaterial, setViewerMaterial] = useState(null);
    const [isFetchingMaterial, setIsFetchingMaterial] = useState(false);

    const [submissions, setSubmissions] = useState([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [activeSubmission, setActiveSubmission] = useState(null);

    const [uploadForm, setUploadForm] = useState({
        title: '',
        fileType: 'pdf',
        description: '',
        file: null
    });

    const activeSection = readStoredSection();
    const activeSectionId = sectionId || activeSection?.section_id || activeSection?.id;
    const displayCourseJoinCode =
        courseJoinCode ||
        activeSection?.course_join_code ||
        activeSection?.courseJoinCode ||
        activeSection?.join_code ||
        activeSection?.course?.course_join_code ||
        sectionCode ||
        '';

    const fetchMaterials = useCallback(async () => {
        const selected = readStoredSection();
        const sId = sectionId || selected?.section_id || selected?.id;
        if (!sId) return;

        try {
            const res = await authAPI.getMaterials(sId, getCleanToken());
            if (res?.ok) {
                const data = await res.json();
                setMaterials(toArray(data, ['materials', 'data', 'files']));
            }
        } catch (err) {
            console.warn('Materials fetch failed:', err);
        }
    }, [sectionId]);

    const fetchData = useCallback(async () => {
        const selected = readStoredSection();
        const sId = sectionId || selected?.section_id || selected?.id;

        if (!sId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = getCleanToken();

            const studentsRes = await authAPI.getSectionStudents(sId, token);
            let mainStudents = [];

            if (studentsRes?.ok) {
                const data = await studentsRes.json();
                mainStudents = toArray(data, ['students', 'student']).map((student) => ({
                    ...student,
                    status: student.status || 'active'
                }));
            }

            const pendingRes = await authAPI.getPendingStudents(sId, token);
            let pendingStudents = [];

            if (pendingRes?.ok) {
                const data = await pendingRes.json();
                pendingStudents = toArray(data, ['pending_students', 'students', 'pendingStudents', 'student']).map((student) => ({
                    ...student,
                    status: 'pending'
                }));
            }

            setStudents(mergeStudents(pendingStudents, mainStudents));
        } catch (err) {
            console.error('Student fetch error:', err);
            setError('Failed to sync student data.');
        } finally {
            setLoading(false);
        }

        await fetchMaterials();
    }, [sectionId, fetchMaterials]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchSubmissions = useCallback(async () => {
        const selected = readStoredSection();
        const sId = sectionId || selected?.section_id || selected?.id;
        if (!sId) return;

        setSubmissionsLoading(true);

        try {
            const token = getCleanToken();
            const [activityRes, quizRes] = await Promise.allSettled([
                authAPI.getPendingActivityEssays(sId, token),
                authAPI.getPendingQuizEssays(sId, token)
            ]);

            let activityEssays = [];
            let quizEssays = [];

            if (activityRes.status === 'fulfilled' && activityRes.value?.ok) {
                const data = await activityRes.value.json();
                activityEssays = toArray(data, ['essays', 'submissions', 'answers', 'data']).map((item) => ({
                    ...item,
                    source_type: 'activity',
                    pending_review: item.pending_review ?? (item.review_status === 'pending' || item.status === 'pending'),
                    feedback_state: item.feedback_state || item.review_status || 'pending_review'
                }));
            }

            if (quizRes.status === 'fulfilled' && quizRes.value?.ok) {
                const data = await quizRes.value.json();
                quizEssays = toArray(data, ['essays', 'submissions', 'answers', 'data']).map((item) => ({
                    ...item,
                    source_type: 'quiz',
                    pending_review: item.pending_review ?? (item.review_status === 'pending' || item.status === 'pending'),
                    feedback_state: item.feedback_state || item.review_status || 'pending_review'
                }));
            }

            setSubmissions([...activityEssays, ...quizEssays]);
        } catch (err) {
            console.warn('Essay submissions fetch failed:', err);
        } finally {
            setSubmissionsLoading(false);
        }
    }, [sectionId]);

    useEffect(() => {
        if (activeTab === 'gradingPortal') fetchSubmissions();
    }, [activeTab, fetchSubmissions]);

    const handleSaveGrade = useCallback(async (answerId, { points_awarded, instructor_feedback, source_type }) => {
        if (!answerId) return;

        const gradeData = {
            points_awarded: Number(points_awarded),
            instructor_feedback: instructor_feedback || ''
        };

        try {
            const token = getCleanToken();
            const res = source_type === 'quiz'
                ? await authAPI.gradeQuizEssay(answerId, gradeData, token)
                : await authAPI.gradeActivityEssay(answerId, gradeData, token);

            if (res?.ok) {
                setSubmissions((prev) =>
                    prev.map((sub) =>
                        sub.answer_id === answerId || sub.id === answerId || sub.submission_id === answerId
                            ? {
                                ...sub,
                                points_awarded: gradeData.points_awarded,
                                instructor_feedback: gradeData.instructor_feedback,
                                status: 'graded',
                                review_status: 'graded',
                                pending_review: false,
                                feedback_state: 'reviewed'
                            }
                            : sub
                    )
                );
                setActiveSubmission(null);
                return;
            }

            const errData = await res?.json().catch(() => ({}));
            alert(`Grade submission failed: ${errData?.message || 'Please try again.'}`);
        } catch (err) {
            console.error('Save grade error:', err);
            alert('An error occurred while submitting the grade.');
        }
    }, []);

    const handleViewMaterial = async (material) => {
        const selected = readStoredSection();
        const sId = sectionId || selected?.section_id || selected?.id;
        const materialId = material.id || material.material_id;

        if (material.file_url || material.url || !sId || !materialId) {
            setViewerMaterial(material);
            return;
        }

        setIsFetchingMaterial(true);

        try {
            const res = await authAPI.getSpecificMaterial(sId, materialId, getCleanToken());
            if (res?.ok) {
                const data = await res.json();
                setViewerMaterial({ ...material, ...data });
            } else {
                setViewerMaterial(material);
            }
        } catch (err) {
            console.error('Error fetching material:', err);
            setViewerMaterial(material);
        } finally {
            setIsFetchingMaterial(false);
        }
    };

    const handleDeleteMaterial = async (material) => {
        if (!authAPI.deleteMaterial) {
            alert('Delete material API is not configured yet.');
            return;
        }

        const selected = readStoredSection();
        const sId = sectionId || selected?.section_id || selected?.id;
        const materialId = material.id || material.material_id;

        if (!sId || !materialId) return;
        if (!window.confirm('Delete this material?')) return;

        try {
            const res = await authAPI.deleteMaterial(sId, materialId, getCleanToken());
            if (res?.ok) {
                setMaterials((prev) => prev.filter((item) => (item.id || item.material_id) !== materialId));
            } else {
                alert('Failed to delete material.');
            }
        } catch (err) {
            console.error('Delete material error:', err);
            alert('An error occurred while deleting material.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUploadForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const mime = file.type;
        let autoType = 'pdf';

        if (mime.startsWith('video/')) autoType = 'video';
        else if (mime.startsWith('audio/')) autoType = 'audio';
        else if (mime.startsWith('image/')) autoType = 'image';

        setUploadForm((prev) => ({ ...prev, file, fileType: autoType }));
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        if (!uploadForm.file || !uploadForm.title) {
            alert('Please provide a title and select a file.');
            return;
        }

        const selected = readStoredSection();
        const sId = sectionId || selected?.section_id || selected?.id;

        if (!sId) {
            alert('Missing section ID.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const progressInterval = setInterval(() => {
            setUploadProgress((p) => (p < 85 ? p + Math.random() * 15 : p));
        }, 300);

        const formData = new FormData();
        formData.append('material', uploadForm.file);
        formData.append('title', uploadForm.title);
        formData.append('type', uploadForm.fileType);
        formData.append('description', uploadForm.description);

        try {
            const res = await authAPI.uploadMaterial(sId, formData, getCleanToken());
            clearInterval(progressInterval);
            setUploadProgress(100);

            if (res?.ok) {
                setTimeout(() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({ title: '', fileType: 'pdf', description: '', file: null });
                    setUploadProgress(0);
                    fetchMaterials();
                }, 600);
            } else {
                const errorData = await res?.json().catch(() => ({}));
                alert(`Upload failed: ${errorData.message || 'Error occurred.'}`);
                setUploadProgress(0);
            }
        } catch (err) {
            clearInterval(progressInterval);
            console.error('Upload error:', err);
            alert('An error occurred during upload.');
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAction = async (requestId, action) => {
        const selected = readStoredSection();
        const sId = selected?.section_id || selected?.id || sectionId;
        if (!sId || !requestId) return;

        try {
            const res = action === 'approve'
                ? await authAPI.approveStudent(sId, requestId, getCleanToken())
                : await authAPI.rejectStudent(sId, requestId, getCleanToken());

            if (res?.ok) {
                await fetchData();
            } else {
                alert('Action failed. Please try again.');
            }
        } catch (err) {
            console.error('Handle action error:', err);
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const fullName = getStudentName(student).toLowerCase();
            const email = String(student.email || '').toLowerCase();
            const id = String(student.student_id || student.id || '').toLowerCase();
            const search = searchTerm.toLowerCase();
            return fullName.includes(search) || email.includes(search) || id.includes(search);
        });
    }, [students, searchTerm]);

    const closeUploadModal = () => {
        if (isUploading) return;
        setIsUploadModalOpen(false);
        setUploadForm({ title: '', fileType: 'pdf', description: '', file: null });
        setUploadProgress(0);
    };

    const fileTypes = [
        { value: 'pdf', label: 'Document (PDF)', icon: 'PDF' },
        { value: 'video', label: 'Video Content', icon: 'VID' },
        { value: 'audio', label: 'Audio / Podcast', icon: 'AUD' },
        { value: 'image', label: 'Image / Graphic', icon: 'IMG' }
    ];

    const gradedCount = submissions.filter((s) => ['graded', 'checked'].includes(String(s.status || '').toLowerCase())).length;
    const pendingCount = submissions.length - gradedCount;

    if (activeSubmission) {
        return (
            <GradingPortal
                studentSubmission={activeSubmission}
                onBack={() => setActiveSubmission(null)}
                onSaveGrade={handleSaveGrade}
            />
        );
    }

    return (
        <div className="relative flex h-full flex-col overflow-hidden bg-white text-gray-900">
            <div className="border-b border-gray-50 bg-white px-10 pb-4 pt-10">
                <div className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onBack}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-gray-900 transition-all hover:bg-black hover:text-white"
                        >
                            Back
                        </button>

                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#16a34a]">
                                    {deptAbbr || 'Academic'} Management - {programAbbr || 'Course'}
                                </span>
                            </div>
                            <h2 className="text-3xl font-black uppercase leading-none tracking-tighter text-gray-900">
                                {sectionName || 'Section Details'}
                            </h2>
                            {displayCourseJoinCode && (
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Course Join Code</span>
                                    <span className="select-all rounded-lg border border-gray-200 bg-gray-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-widest text-gray-700">
                                        {displayCourseJoinCode}
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
                    <button
                        onClick={() => setActiveTab('gradingPortal')}
                        className={`flex items-center gap-2 pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'gradingPortal' ? 'border-b-4 border-[#16a34a] text-gray-900' : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        Grading Portal
                        {pendingCount > 0 && activeTab !== 'gradingPortal' && (
                            <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-400 px-1 text-[8px] font-black text-white">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50/30 px-10 py-6">
                {activeTab === 'students' ? (
                    <div className="relative w-full max-w-2xl">
                        <input
                            type="text"
                            placeholder="SEARCH BY NAME, ID, OR EMAIL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl border border-gray-200 bg-white px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-900 shadow-sm outline-none transition-all focus:border-[#16a34a] focus:ring-4 focus:ring-green-50"
                        />
                    </div>
                ) : activeTab === 'materials' ? (
                    <div className="flex w-full items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Course Materials</p>
                            <p className="mt-0.5 text-[9px] font-bold text-gray-400">
                                {materials.length} resource{materials.length !== 1 ? 's' : ''} posted
                            </p>
                        </div>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="rounded-xl bg-[#16a34a] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-green-700"
                        >
                            Add Material
                        </button>
                    </div>
                ) : (
                    <div className="flex w-full items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Essay Submissions</p>
                            <p className="mt-0.5 text-[9px] font-bold text-gray-400">
                                {gradedCount} graded - {pendingCount} for review - {submissions.length} total
                            </p>
                        </div>
                        <span
                            className={`rounded-xl border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${
                                pendingCount > 0
                                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                                    : 'border-green-200 bg-green-50 text-green-700'
                            }`}
                        >
                            {pendingCount > 0 ? `${pendingCount} Pending Review` : 'All Graded'}
                        </span>
                    </div>
                )}
            </div>

            <div className="no-scrollbar flex-1 overflow-auto px-10 py-2">
                {error && (
                    <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                        {error}
                    </div>
                )}

                {activeTab === 'students' ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">
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
                                filteredStudents.map((student, index) => {
                                    const isPending = String(student.status || '').toLowerCase() === 'pending';
                                    const name = getStudentName(student);

                                    return (
                                        <tr key={getStudentKey(student, index)} className="group transition-all hover:bg-gray-50">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-[10px] font-black text-white">
                                                        {name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-black uppercase italic tracking-tight text-gray-900 group-hover:text-[#16a34a]">
                                                        {name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-[11px] font-bold text-gray-800">{student.email}</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                                                        <div className="h-full bg-[#16a34a]" style={{ width: `${student.progress || 0}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-900">{student.progress || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <StatusBadge status={student.status} />
                                            </td>
                                            <td className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-700">
                                                {student.last_active || 'Never'}
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                {isPending ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleAction(student.ss_id || student.id, 'approve')}
                                                            className="rounded-xl bg-[#16a34a] px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white transition-all hover:bg-green-700"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(student.ss_id || student.id, 'deny')}
                                                            className="rounded-xl border border-red-500 bg-white px-4 py-2 text-[9px] font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-500 hover:text-white"
                                                        >
                                                            Deny
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="rounded-xl border border-gray-900 bg-white px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-gray-900 transition-all hover:bg-black hover:text-white">
                                                        View Details
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center text-gray-900">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No students found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : activeTab === 'materials' ? (
                    <div className="mx-auto max-w-3xl space-y-3 py-6">
                        {materials.length > 0 ? (
                            <>
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="h-px flex-1 bg-gray-200" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">All Materials</span>
                                    <div className="h-px flex-1 bg-gray-200" />
                                </div>
                                {materials.map((material, index) => (
                                    <MaterialCard
                                        key={material.id || material.material_id || index}
                                        material={material}
                                        onView={handleViewMaterial}
                                        onDelete={handleDeleteMaterial}
                                    />
                                ))}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-gray-200 py-40">
                                <p className="mb-1 text-[11px] font-black uppercase tracking-[0.3em] text-gray-700">No Materials Yet</p>
                                <p className="mb-5 text-[10px] text-gray-400">Upload your first course resource to get started.</p>
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="rounded-xl bg-[#16a34a] px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-white transition-all hover:bg-green-700"
                                >
                                    Add First Material
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mx-auto max-w-3xl space-y-3 py-6">
                        {submissionsLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex animate-pulse items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5">
                                        <div className="h-11 w-11 flex-shrink-0 rounded-full bg-gray-200" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-2.5 w-1/4 rounded bg-gray-200" />
                                            <div className="h-3 w-2/3 rounded bg-gray-200" />
                                            <div className="h-2 w-1/3 rounded bg-gray-200" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : submissions.length > 0 ? (
                            <>
                                <div className="mb-6 grid grid-cols-3 gap-3">
                                    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
                                        <p className="text-2xl font-black text-gray-900">{submissions.length}</p>
                                        <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Total</p>
                                    </div>
                                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center">
                                        <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
                                        <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-amber-500">For Review</p>
                                    </div>
                                    <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-center">
                                        <p className="text-2xl font-black text-green-700">{gradedCount}</p>
                                        <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-green-500">Graded</p>
                                    </div>
                                </div>

                                <div className="mb-4 flex items-center gap-4">
                                    <div className="h-px flex-1 bg-gray-200" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">All Submissions</span>
                                    <div className="h-px flex-1 bg-gray-200" />
                                </div>

                                {[...submissions]
                                    .sort((a, b) => {
                                        const aGraded = ['graded', 'checked'].includes(String(a.status || '').toLowerCase());
                                        const bGraded = ['graded', 'checked'].includes(String(b.status || '').toLowerCase());
                                        return Number(aGraded) - Number(bGraded);
                                    })
                                    .map((submission, index) => (
                                        <EssaySubmissionCard
                                            key={submission.answer_id || submission.id || submission.submission_id || index}
                                            submission={submission}
                                            onReview={setActiveSubmission}
                                        />
                                    ))}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-gray-200 py-40">
                                <p className="mb-1 text-[11px] font-black uppercase tracking-[0.3em] text-gray-700">No Submissions Yet</p>
                                <p className="text-[10px] text-gray-400">Student essay submissions will appear here once received.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isFetchingMaterial && (
                <div className="fixed inset-0 z-[290] flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="flex items-center gap-4 rounded-2xl bg-white px-8 py-6 shadow-2xl">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-100 border-t-[#16a34a]" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-gray-700">Opening file...</span>
                    </div>
                </div>
            )}

            {viewerMaterial && (
                <MaterialViewerModal
                    material={viewerMaterial}
                    onClose={() => setViewerMaterial(null)}
                />
            )}

            {isUploadModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={closeUploadModal} />
                    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl" style={{ animation: 'modalIn 0.2s ease-out' }}>
                        {isUploading && (
                            <div className="absolute left-0 right-0 top-0 z-10 h-0.5 overflow-hidden bg-gray-100">
                                <div className="h-full bg-[#16a34a] transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                            </div>
                        )}

                        <div className="flex items-start justify-between px-7 pb-5 pt-7">
                            <div>
                                <h3 className="text-xl font-black uppercase leading-none tracking-tight text-gray-900">Add Material</h3>
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                    {sectionName || 'Course'} - Materials Library
                                </p>
                            </div>
                            <button
                                onClick={closeUploadModal}
                                disabled={isUploading}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                            >
                                X
                            </button>
                        </div>

                        <div className="mx-7 h-px bg-gray-100" />

                        <form onSubmit={handleUploadSubmit} className="space-y-5 px-7 py-6">
                            <div>
                                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={uploadForm.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Module 1: Introduction to the Course"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:font-normal placeholder:text-gray-300 focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500">Type</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                        <span className="text-[10px] font-black text-gray-400">
                                            {fileTypes.find((ft) => ft.value === uploadForm.fileType)?.icon}
                                        </span>
                                    </div>
                                    <select
                                        name="fileType"
                                        value={uploadForm.fileType}
                                        onChange={handleInputChange}
                                        className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-14 pr-10 text-sm font-semibold text-gray-900 outline-none transition-all focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30"
                                    >
                                        {fileTypes.map((ft) => (
                                            <option key={ft.value} value={ft.value}>{ft.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    File <span className="text-red-500">*</span>
                                </label>
                                <FileDropZone onFileSelect={handleFileSelect} selectedFile={uploadForm.file} />
                            </div>

                            <div>
                                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    Description <span className="font-bold normal-case tracking-normal text-gray-300">(optional)</span>
                                </label>
                                <textarea
                                    name="description"
                                    rows={2}
                                    value={uploadForm.description}
                                    onChange={handleInputChange}
                                    placeholder="Brief note about this material..."
                                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:font-normal placeholder:text-gray-300 focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30"
                                />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={closeUploadModal}
                                    disabled={isUploading}
                                    className="flex-1 rounded-xl bg-gray-100 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-40"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                        isUploading
                                            ? 'cursor-not-allowed bg-[#16a34a]/70 text-white'
                                            : 'bg-[#16a34a] text-white shadow-sm hover:bg-green-700 hover:shadow-md'
                                    }`}
                                >
                                    {isUploading ? `Uploading ${Math.round(uploadProgress)}%` : 'Publish Material'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.97) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes gclassViewerIn {
                    from { opacity: 0; transform: scale(0.99) translateY(6px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default StudentTable;
