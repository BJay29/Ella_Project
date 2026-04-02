import React, { useState } from 'react';

const MyBadges = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Earned', 'Locked'];

  // Mock badges — replace with API later
  const badges = [
    { badge_id: 1,  name: 'First Steps',       emoji: '👣', description: 'Complete your first activity.',         earned: true  },
    { badge_id: 2,  name: 'Quick Learner',      emoji: '⚡', description: 'Pass 3 quizzes in a row.',              earned: true  },
    { badge_id: 3,  name: 'Sharp Shooter',      emoji: '🎯', description: 'Score 100% on any quiz.',               earned: true  },
    { badge_id: 4,  name: 'On a Roll',          emoji: '🔥', description: 'Maintain a 3-day streak.',              earned: true  },
    { badge_id: 5,  name: 'Leaderboard Star',   emoji: '⭐', description: 'Reach top 3 on the leaderboard.',       earned: true  },
    { badge_id: 6,  name: 'Reading Master',     emoji: '📖', description: 'Complete all Reading quests.',          earned: false },
    { badge_id: 7,  name: 'Grammar Guru',       emoji: '✏️', description: 'Complete all Writing quests.',          earned: false },
    { badge_id: 8,  name: 'Great Listener',     emoji: '🎧', description: 'Complete all Listening quests.',        earned: false },
    { badge_id: 9,  name: 'Speaker Pro',        emoji: '🎤', description: 'Complete all Speaking quests.',         earned: false },
    { badge_id: 10, name: 'Perfect Score',      emoji: '💯', description: 'Score 100% on 5 quizzes.',              earned: false },
    { badge_id: 11, name: 'Coin Collector',     emoji: '🪙', description: 'Earn 1000 coins.',                      earned: false },
    { badge_id: 12, name: 'Quest Champion',     emoji: '🏆', description: 'Complete all quests in the library.',   earned: false },
  ];

  const filtered = badges.filter((b) => {
    if (activeFilter === 'Earned') return b.earned;
    if (activeFilter === 'Locked') return !b.earned;
    return true;
  });

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🏅 My Badges
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Collect badges by completing quests, quizzes, and achieving milestones.
        </p>
      </div>

      {/* Summary Banner */}
      <div className="bg-[#d4edda] rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center text-white text-2xl">
            🏅
          </div>
          <div>
            <p className="font-bold text-gray-800">{earnedCount} Badges Earned</p>
            <p className="text-xs text-gray-500">{badges.length - earnedCount} more to unlock</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[#4CAF50]">{Math.round((earnedCount / badges.length) * 100)}%</p>
          <p className="text-xs text-gray-400">Collection complete</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all
              ${activeFilter === f
                ? 'bg-[#4CAF50] text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((badge) => (
          <div
            key={badge.badge_id}
            className={`bg-white rounded-2xl border p-4 flex flex-col items-center text-center transition-all
              ${badge.earned
                ? 'border-[#a8d08d] shadow-sm hover:shadow-md'
                : 'border-gray-100 opacity-50 grayscale'}`}
          >
            {/* Badge Icon */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-3
              ${badge.earned ? 'bg-[#f0f7eb]' : 'bg-gray-100'}`}>
              {badge.earned ? badge.emoji : '🔒'}
            </div>

            <p className={`font-bold text-sm leading-tight mb-1 ${badge.earned ? 'text-gray-800' : 'text-gray-400'}`}>
              {badge.name}
            </p>
            <p className="text-[11px] text-gray-400 leading-snug">{badge.description}</p>

            {badge.earned && (
              <span className="mt-2 text-[10px] font-bold text-[#4CAF50] bg-[#f0f7eb] px-2 py-0.5 rounded-full">
                ✅ Earned
              </span>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default MyBadges;