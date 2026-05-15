import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../services/APIservice'; // Ensure the path to your APIservice is correct
import { Trash2, ExternalLink, Plus, Award, Target, TrendingUp } from 'lucide-react';

const MyProgress = () => {
    // --- States ---
    const [progressData, setProgressData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * FETCH PROGRESS DATA
     * Calls the new API endpoint and updates the component state
     */
    const fetchProgress = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError("No authentication token found");
                return;
            }

            const res = await authAPI.getStudentProgress(token);
            
            if (res.ok) {
                const json = await res.json();
                // Standardizing the data access (handling both {data: [...]} and [...])
                const actualData = json.data || json;
                setProgressData(actualData);
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

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    /**
     * DYNAMIC COLOR CALCULATOR
     * Returns a color based on percentage for the progress bars
     */
    const getProgressColor = (percent) => {
        if (percent >= 80) return '#4CAF50'; // Green
        if (percent >= 50) return '#FF9800'; // Orange
        return '#E91E63'; // Pink/Red
    };

    /**
     * CONIC GRADIENT GENERATOR
     * Creates the background for the accuracy circle chart
     */
    const buildConic = () => {
        if (!progressData?.accuracy_data) return 'gray';
        
        const data = progressData.accuracy_data;
        const total = data.reduce((s, d) => s + (d.percent || 0), 0);
        let cumulative = 0;
        
        if (total === 0) return '#f3f4f6';

        const parts = data.map((d, idx) => {
            const start = (cumulative / total) * 360;
            cumulative += (d.percent || 0);
            const end = (cumulative / total) * 360;
            // Uses a default color array if API doesn't provide colors
            const colors = ['#4CAF50', '#2196F3', '#E91E63', '#FF9800'];
            return `${d.color || colors[idx % 4]} ${start}deg ${end}deg`;
        });
        return `conic-gradient(${parts.join(', ')})`;
    };

    // --- Loading State UI ---
    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-20 text-center">
                <div className="animate-spin w-10 h-10 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Syncing your progress...</p>
            </div>
        );
    }

    // --- Error State UI ---
    if (error) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-20 text-center">
                <p className="text-red-500 font-bold mb-2">Oops!</p>
                <p className="text-sm text-gray-500">{error}</p>
                <button onClick={fetchProgress} className="mt-4 text-[10px] font-black uppercase underline">Try Again</button>
            </div>
        );
    }

    // If API returns null/empty, use empty defaults
    const stats = progressData?.stats || [];
    const skillProgress = progressData?.skill_progress || [];
    const accuracyData = progressData?.accuracy_data || [];

    return (
        <div className="max-w-5xl mx-auto px-6 py-8 animate-in fade-in duration-500">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-black uppercase italic tracking-tighter flex items-center gap-3">
                    <TrendingUp size={28} />
                    My Progress
                </h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">
                    Real-time performance tracking and skill analytics
                </p>
            </div>

            {/* Stats Grid - Automatically maps from API response */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-center shadow-sm hover:shadow-md transition-all">
                        <p className="text-2xl font-black text-gray-800 dark:text-white">
                            {stat.value || 0}{stat.unit || ''}
                        </p>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Skill Progress Section */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
                    <h3 className="font-black text-black dark:text-white text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Target size={16} />
                        Level Proficiency
                    </h3>
                    <div className="flex flex-col gap-6">
                        {skillProgress.map((skill, idx) => (
                            <div key={idx} className="group">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <span className="text-sm font-black text-gray-800 dark:text-gray-200">
                                            {skill.emoji} {skill.label}
                                        </span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{skill.status || 'Ongoing'}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-black uppercase">
                                        {skill.current}/{skill.total} Levels
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-50 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-1000 ease-out" 
                                        style={{ 
                                            width: `${skill.percent || 0}%`, 
                                            backgroundColor: getProgressColor(skill.percent)
                                        }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Accuracy/Chart Section */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center">
                    <h3 className="font-black text-black dark:text-white text-xs uppercase tracking-widest mb-8 flex items-center justify-center gap-2">
                        <Award size={16} />
                        Accuracy by Category
                    </h3>
                    
                    <div className="flex justify-center mb-8">
                        <div className="relative w-48 h-48">
                            {/* Donut Chart Background */}
                            <div className="w-full h-full rounded-full transition-all duration-700" style={{ background: buildConic() }} />
                            {/* Inner White Circle (The "Donut" hole) */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center shadow-inner">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Total</p>
                                    <p className="text-xl font-black text-black dark:text-white">
                                        {accuracyData.length > 0 ? Math.round(accuracyData.reduce((a, b) => a + b.percent, 0) / accuracyData.length) : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-4">
                        {accuracyData.map((d, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color || '#000' }} />
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">{d.label}</p>
                                    <p className="text-[11px] font-black text-gray-800 dark:text-gray-200">{d.percent}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MyProgress;