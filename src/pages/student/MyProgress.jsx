import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../services/APIservice';
import { Award, Target, TrendingUp } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Color palette for the accuracy donut chart slices
// Assigned by index since the API does not return colors
// ─────────────────────────────────────────────────────────────────────────────
const CHART_COLORS = ['#4CAF50', '#2196F3', '#E91E63', '#FF9800'];

// Skill emoji map — used to decorate each skill row
const SKILL_EMOJI = {
    writing:   '✍️',
    reading:   '📖',
    speaking:  '🎤',
    listening: '🎧',
};

const MyProgress = () => {
    const [progressData, setProgressData] = useState(null);
    const [isLoading, setIsLoading]       = useState(true);
    const [error, setError]               = useState(null);

    /**
     * FETCH PROGRESS DATA
     * Calls getStudentProgress and stores the raw API response.
     * The API returns a top-level object (not nested under "data"),
     * so we store the full response directly.
     *
     * Expected shape:
     * {
     *   message, summary, stat_cards, skill_progress,
     *   accuracy_by_skill, recent_results
     * }
     */
    const fetchProgress = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) { setError("Authentication token not found"); return; }

            const res = await authAPI.getStudentProgress(token);

            if (res.ok) {
                const json = await res.json();
                // The API returns the payload at the top level — store it directly
                setProgressData(json);
            } else {
                setError("Failed to fetch progress from server");
            }
        } catch (err) {
            console.error("Progress Load Error:", err);
            setError("Connection to server failed");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchProgress(); }, [fetchProgress]);

    /**
     * PROGRESS BAR COLOR
     * Returns a color based on completion percentage
     */
    const getProgressColor = (percent) => {
        if (percent >= 80) return '#4CAF50';
        if (percent >= 50) return '#FF9800';
        return '#E91E63';
    };

    /**
     * CONIC GRADIENT BUILDER
     * Builds the CSS conic-gradient string for the donut chart
     * using accuracy_by_skill from the API response.
     * Skips skills where accuracy_percent is 0 to avoid empty arcs.
     */
    const buildConic = () => {
        const accuracyBySkill = progressData?.accuracy_by_skill || [];

        // Only include skills that have a non-zero accuracy
        const active = accuracyBySkill.filter(d => (d.accuracy_percent || 0) > 0);
        if (active.length === 0) return '#f3f4f6';

        const total = active.reduce((s, d) => s + d.accuracy_percent, 0);
        let cumulative = 0;

        const parts = active.map((d, idx) => {
            const start = (cumulative / total) * 360;
            cumulative += d.accuracy_percent;
            const end = (cumulative / total) * 360;
            return `${CHART_COLORS[idx % CHART_COLORS.length]} ${start}deg ${end}deg`;
        });

        return `conic-gradient(${parts.join(', ')})`;
    };

    // ── Loading state ──
    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-20 text-center">
                <div className="animate-spin w-10 h-10 border-4 border-black border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Syncing your progress...</p>
            </div>
        );
    }

    // ── Error state ──
    if (error) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-20 text-center">
                <p className="text-red-500 font-bold mb-2">Oops!</p>
                <p className="text-sm text-gray-500">{error}</p>
                <button onClick={fetchProgress} className="mt-4 text-[10px] font-black uppercase underline">Try Again</button>
            </div>
        );
    }

    // ── Map API fields to local variables ──
    // stat_cards  → array of { key, label, value, suffix? }
    // skill_progress → array of { skill, completion_percent, accuracy_percent,
    //                              completed_levels, total_levels, status }
    // accuracy_by_skill → array of { skill, accuracy_percent, avg_score }
    // recent_results    → array of result objects
    const statCards      = progressData?.stat_cards      || [];
    const skillProgress  = progressData?.skill_progress  || [];
    const accuracyBySkill = progressData?.accuracy_by_skill || [];
    const recentResults  = progressData?.recent_results  || [];

    // Calculate the average accuracy for the donut chart center label
    const activeAccuracies = accuracyBySkill.filter(d => (d.accuracy_percent || 0) > 0);
    const avgAccuracy = activeAccuracies.length > 0
        ? Math.round(activeAccuracies.reduce((a, b) => a + b.accuracy_percent, 0) / activeAccuracies.length)
        : 0;

    return (
        <div className="max-w-5xl mx-auto px-6 py-8 animate-in fade-in duration-500">

            {/* Page Header */}
            <div className="mb-10">
                <h2 className="text-3xl font-black text-black uppercase italic tracking-tighter flex items-center gap-3">
                    <TrendingUp size={28} />
                    My Progress
                </h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">
                    Real-time performance tracking and skill analytics
                </p>
            </div>

            {/* ── Stat Cards Grid ──
                Maps directly from API stat_cards array.
                Each card has: label, value, suffix (optional) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                {statCards.map((stat, idx) => (
                    <div
                        key={stat.key || idx}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-center shadow-sm hover:shadow-md transition-all"
                    >
                        <p className="text-2xl font-black text-gray-800 dark:text-white">
                            {/* API uses "suffix" field for units like "%" */}
                            {stat.value ?? 0}{stat.suffix || ''}
                        </p>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* ── Skill Progress Section ──
                    Maps from skill_progress array.
                    Uses: skill (name), completion_percent, completed_levels,
                          total_levels, status */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
                    <h3 className="font-black text-black dark:text-white text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Target size={16} />
                        Level Proficiency
                    </h3>
                    <div className="flex flex-col gap-6">
                        {skillProgress.length > 0 ? skillProgress.map((skill, idx) => {
                            // Resolve the emoji for this skill name (case-insensitive)
                            const emoji = SKILL_EMOJI[skill.skill?.toLowerCase()] || '📚';
                            const percent = skill.completion_percent ?? 0;
                            return (
                                <div key={idx} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <span className="text-sm font-black text-gray-800 dark:text-gray-200">
                                                {emoji} {skill.skill}
                                            </span>
                                            {/* "status" field from API: "In progress", "Not assigned", etc. */}
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                {skill.status || 'Not started'}
                                            </p>
                                        </div>
                                        {/* Show completed_levels / total_levels from API */}
                                        <span className="text-[10px] text-gray-400 font-black uppercase">
                                            {skill.completed_levels ?? 0}/{skill.total_levels ?? 0} Levels
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-50 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: getProgressColor(percent)
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center py-6">
                                No skill data available
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Accuracy Donut Chart ──
                    Maps from accuracy_by_skill array.
                    Uses: skill (label), accuracy_percent */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center">
                    <h3 className="font-black text-black dark:text-white text-xs uppercase tracking-widest mb-8 flex items-center justify-center gap-2">
                        <Award size={16} />
                        Accuracy by Skill
                    </h3>

                    <div className="flex justify-center mb-8">
                        <div className="relative w-48 h-48">
                            {/* Donut chart background built from accuracy_by_skill */}
                            <div
                                className="w-full h-full rounded-full transition-all duration-700"
                                style={{ background: buildConic() }}
                            />
                            {/* Inner white hole showing the average accuracy */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center shadow-inner">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Avg</p>
                                    <p className="text-xl font-black text-black dark:text-white">{avgAccuracy}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Legend — one item per skill */}
                    <div className="grid grid-cols-2 gap-4">
                        {accuracyBySkill.map((d, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl"
                            >
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                />
                                <div className="text-left">
                                    {/* "skill" field from API maps to the label */}
                                    <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">
                                        {d.skill}
                                    </p>
                                    <p className="text-[11px] font-black text-gray-800 dark:text-gray-200">
                                        {d.accuracy_percent ?? 0}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* ── Recent Results Section ──
                Maps from recent_results array.
                Only shown if the API returns at least one result. */}
            {recentResults.length > 0 && (
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-50 dark:border-gray-700">
                        <h3 className="font-black text-black dark:text-white text-xs uppercase tracking-widest">
                            Recent Results
                        </h3>
                    </div>
                    <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-700">
                        {recentResults.map((result, idx) => (
                            <div key={result.result_id || idx} className="flex items-center justify-between px-8 py-4">
                                <div>
                                    {/* quest_type is the skill name; may be null for old records */}
                                    <p className="text-[11px] font-black text-gray-800 dark:text-white uppercase tracking-tight">
                                        {result.quest_type || 'Quiz'} — Level {result.level_number ?? '—'}
                                    </p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">
                                        {/* Format the submitted_at ISO date to a readable string */}
                                        {result.submitted_at
                                            ? new Date(result.submitted_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                              })
                                            : '—'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Score badge — green if passed, red if not */}
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                        result.is_passed
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-red-50 text-red-600 border-red-200'
                                    }`}>
                                        {result.raw_score ?? 0}/{result.total_items ?? 0} · {result.percentage ?? 0}%
                                    </span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">
                                        +{result.points_earned ?? 0} pts
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default MyProgress;
