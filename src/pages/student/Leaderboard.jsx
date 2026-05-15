import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../services/APIservice';
import { Trophy, Star, Coins } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard Component
//
// Expected API response shape from GET /student/leaderboard:
// {
//   rankings: [
//     {
//       rank:    number,
//       name:    string,
//       xp:      number,   (or points / total_points)
//       coins:   number,
//       isMe:    boolean   (true for the current user's row)
//     },
//     ...
//   ],
//   my_rank: {             (optional — the current user's specific entry)
//     rank:  number,
//     name:  string,
//     xp:    number,
//     coins: number
//   }
// }
//
// NOTE: If the backend returns a flat array instead of { rankings, my_rank },
// the component handles that too (see fetchLeaderboard below).
// ─────────────────────────────────────────────────────────────────────────────
const Leaderboard = () => {
    const [rankings, setRankings] = useState([]);
    const [myStats, setMyStats]   = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError]         = useState(null);

    /**
     * FETCH LEADERBOARD DATA
     * Handles three possible API response shapes:
     *   1. { rankings: [], my_rank: {} }   ← preferred shape
     *   2. { data: { rankings: [], my_rank: {} } }  ← nested under "data"
     *   3. []  ← flat array of student objects
     */
    const fetchLeaderboard = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) { setError("Authentication token not found"); return; }

            const res = await authAPI.getStudentLeaderboard(token);

            if (res.ok) {
                const json = await res.json();

                // Unwrap one level of nesting if the API wraps under "data"
                const payload = json.data || json;

                if (Array.isArray(payload)) {
                    // Shape 3: flat array
                    setRankings(payload);
                    const me = payload.find(s => s.isMe === true);
                    if (me) setMyStats(me);
                } else {
                    // Shape 1 or 2: object with rankings and optional my_rank
                    const list = payload.rankings || payload.leaderboard || [];
                    setRankings(list);

                    // my_rank may not exist if current user is not in the top list
                    const myRank = payload.my_rank || payload.my_stats || null;
                    if (myRank) {
                        setMyStats(myRank);
                    } else {
                        // Fall back to finding the current user inside the rankings list
                        const me = list.find(s => s.isMe === true);
                        if (me) setMyStats(me);
                    }
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

    useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

    /**
     * Resolves the XP/points value from a student object.
     * The API may return this as xp, points, or total_points.
     */
    const getXP = (student) =>
        student?.xp ?? student?.points ?? student?.total_points ?? 0;

    /**
     * Generates two-character initials from a full name string
     */
    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // ── Loading state ──
    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                <div className="animate-bounce mb-4 text-4xl">🏆</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Rankings...</p>
            </div>
        );
    }

    // ── Error state ──
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

            {/* Page Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3 italic uppercase tracking-tighter">
                    <Trophy className="text-yellow-500" size={32} />
                    Leaderboard
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Top students ranked by XP points
                </p>
            </div>

            {/* ── My Personal Ranking Banner ──
                Shown only when the API returns a my_rank object or
                the current user is identified via isMe in the rankings list. */}
            {myStats && (
                <div className="bg-[#f0f9ff] dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-3xl p-5 mb-8 flex items-center justify-between transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg rotate-3">
                            #{myStats.rank}
                        </div>
                        <div>
                            <p className="font-black text-gray-800 dark:text-white text-xs uppercase tracking-tight">
                                Your Ranking
                            </p>
                            <p className="text-[11px] text-blue-600 font-bold uppercase">
                                {myStats.rank <= 3
                                    ? "🔥 You're dominating the top!"
                                    : "Keep going, you're doing great!"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs font-black text-gray-700 dark:text-gray-300">
                        {/* Use getXP() to handle xp / points / total_points field variations */}
                        <span className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500" /> {getXP(myStats)} XP
                        </span>
                        <span className="flex items-center gap-1">
                            <Coins size={14} className="text-orange-400" /> {myStats.coins || 0}
                        </span>
                    </div>
                </div>
            )}

            {/* ── Top #1 Podium Display ──
                Shown only when there is at least one ranking entry */}
            {top1 && (
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm p-10 mb-8 flex flex-col items-center relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 italic font-black text-8xl">#1</div>
                    <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-white font-black text-2xl mb-4 shadow-xl border-4 border-white dark:border-gray-800">
                        {getInitials(top1.name)}
                    </div>
                    <p className="font-black text-gray-800 dark:text-white text-lg uppercase tracking-tight">
                        {top1.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                        {getXP(top1)} XP Points · Ranked #1
                    </p>
                    <div className="mt-4 px-6 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                        Champion
                    </div>
                </div>
            )}

            {/* ── Full Rankings List ── */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
                <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
                    <p className="font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">All Rankings</p>
                </div>
                <div className="flex flex-col">
                    {rankings.length > 0 ? (
                        rankings.map((student, index) => (
                            <div
                                key={student.rank || index}
                                className={`flex items-center justify-between px-6 py-5 border-b border-gray-50 dark:border-gray-700 last:border-none transition-all
                                    ${student.isMe
                                        ? 'bg-green-50/50 dark:bg-green-900/10'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar circle — gold for 1st, silver for 2nd, bronze for 3rd */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs
                                        ${index === 0 ? 'bg-yellow-400'
                                        : index === 1 ? 'bg-gray-300'
                                        : index === 2 ? 'bg-orange-400'
                                        : 'bg-gray-800'}`}
                                    >
                                        {getInitials(student.name)}
                                    </div>
                                    <div>
                                        <p className={`font-black text-sm uppercase tracking-tight ${
                                            student.isMe ? 'text-green-600' : 'text-gray-800 dark:text-white'
                                        }`}>
                                            {student.name} {student.isMe && '(You)'}
                                        </p>
                                        {/* Use rank field from API; fall back to list index + 1 */}
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                                            Rank #{student.rank || index + 1}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-[11px] font-black text-gray-500 dark:text-gray-400">
                                    {/* Use getXP() helper to handle field name variations */}
                                    <span className="flex items-center gap-1 uppercase">
                                        <Star size={12} /> {getXP(student)} <span className="hidden sm:inline">XP</span>
                                    </span>
                                    <span className="flex items-center gap-1 uppercase">
                                        <Coins size={12} /> {student.coins || 0}
                                    </span>
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
