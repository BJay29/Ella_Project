import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../services/APIservice'; // Ensure this path is correct
import { Trophy, Star, Coins } from 'lucide-react';

const Leaderboard = () => {
    // --- States ---
    const [rankings, setRankings] = useState([]);
    const [myStats, setMyStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * FETCH LEADERBOARD DATA
     * Fetches the top students and the current user's specific rank
     */
    const fetchLeaderboard = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication token not found");
                return;
            }

            const res = await authAPI.getStudentLeaderboard(token);
            
            if (res.ok) {
                const json = await res.json();
                const data = json.data || json;

                // Expecting backend to return { rankings: [], my_rank: {} }
                // or just an array of students
                if (Array.isArray(data)) {
                    setRankings(data);
                    // Find 'me' in the array if backend doesn't provide a separate object
                    const me = data.find(s => s.isMe === true);
                    if (me) setMyStats(me);
                } else {
                    setRankings(data.rankings || []);
                    setMyStats(data.my_rank || null);
                }
            } else {
                setError("Failed to load leaderboard data");
            }
        } catch (err) {
            console.error("Leaderboard Error:", err);
            setError("Connection to server failed");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    // Helper to get initials for the avatar
    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                <div className="animate-bounce mb-4 text-4xl">🏆</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Rankings...</p>
            </div>
        );
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                <p className="text-red-500 font-bold text-sm mb-4">{error}</p>
                <button onClick={fetchLeaderboard} className="text-[10px] font-black uppercase underline">Retry</button>
            </div>
        );
    }

    const top1 = rankings[0];

    return (
        <div className="max-w-3xl mx-auto px-6 py-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3 italic uppercase tracking-tighter">
                    <Trophy className="text-yellow-500" size={32} /> 
                    Leaderboard
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Top students ranked by XP points</p>
            </div>

            {/* My Personal Ranking Banner */}
            {myStats && (
                <div className="bg-[#f0f9ff] dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-3xl p-5 mb-8 flex items-center justify-between transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg rotate-3">
                            #{myStats.rank}
                        </div>
                        <div>
                            <p className="font-black text-gray-800 dark:text-white text-xs uppercase tracking-tight">Your Ranking</p>
                            <p className="text-[11px] text-blue-600 font-bold uppercase">
                                {myStats.rank <= 3 ? "🔥 You're dominating the top!" : "Keep going, you're doing great!"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs font-black text-gray-700 dark:text-gray-300">
                        <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500" /> {myStats.xp} XP</span>
                        <span className="flex items-center gap-1"><Coins size={14} className="text-orange-400" /> {myStats.coins || 0}</span>
                    </div>
                </div>
            )}

            {/* Top 1 Podium Display */}
            {top1 && (
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm p-10 mb-8 flex flex-col items-center relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 italic font-black text-8-xl">#1</div>
                    <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-white font-black text-2xl mb-4 shadow-xl border-4 border-white dark:border-gray-800">
                        {getInitials(top1.name)}
                    </div>
                    <p className="font-black text-gray-800 dark:text-white text-lg uppercase tracking-tight">{top1.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{top1.xp} XP Points · Ranked #1</p>
                    <div className="mt-4 px-6 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                        Champion
                    </div>
                </div>
            )}

            {/* All Rankings List */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
                <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
                    <p className="font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">All Rankings</p>
                </div>
                <div className="flex flex-col">
                    {rankings.length > 0 ? (
                        rankings.map((student, index) => (
                            <div key={index}
                                className={`flex items-center justify-between px-6 py-5 border-b border-gray-50 dark:border-gray-700 last:border-none transition-all
                                ${student.isMe ? 'bg-green-50/50 dark:bg-green-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs
                                        ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : index === 2 ? 'bg-orange-400' : 'bg-gray-800'}
                                    `}>
                                        {getInitials(student.name)}
                                    </div>
                                    <div>
                                        <p className={`font-black text-sm uppercase tracking-tight ${student.isMe ? 'text-green-600' : 'text-gray-800 dark:text-white'}`}>
                                            {student.name} {student.isMe && '(You)'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Rank #{student.rank || index + 1}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-[11px] font-black text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1 uppercase"><Star size={12} /> {student.xp} <span className="hidden sm:inline">XP</span></span>
                                    <span className="flex items-center gap-1 uppercase"><Coins size={12} /> {student.coins || 0}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            No students ranked yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;