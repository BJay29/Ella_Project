import React from 'react';

const Leaderboard = () => {
  const myRank = 3;

  const rankings = [
    { rank: 1, name: 'Juan D.',      initials: 'JD', xp: 8540, coins: 0, color: 'bg-yellow-400' },
    { rank: 2, name: 'Anna L.',      initials: 'AL', xp: 7320, coins: 0, color: 'bg-pink-500'   },
    { rank: 3, name: 'Maria Santos', initials: 'MS', xp: 6890, coins: 0, color: 'bg-[#4CAF50]', isMe: true },
  ];

  const top1 = rankings[0];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">🏆 Leaderboard</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Top students ranked by XP points.</p>
      </div>

      {/* My Ranking Banner */}
      <div className="bg-[#d4edda] dark:bg-green-900/30 rounded-2xl p-4 mb-6 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-black text-sm">#{myRank}</div>
          <div>
            <p className="font-bold text-gray-800 dark:text-white text-sm">Your Ranking</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">🎉 You're in the top 3!</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold text-gray-600 dark:text-gray-300">
          <span>⭐ 0 XP</span>
          <span>🪙 0</span>
        </div>
      </div>

      {/* Top 1 Podium */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 mb-6 flex flex-col items-center transition-colors">
        <div className={`w-16 h-16 ${top1.color} rounded-full flex items-center justify-center text-white font-black text-lg mb-2`}>
          {top1.initials}
        </div>
        <p className="font-bold text-gray-800 dark:text-white text-base">{top1.name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{top1.xp} XP · #{top1.rank}</p>
        <div className="mt-3 w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-white font-black text-lg">1</div>
      </div>

      {/* All Rankings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="font-bold text-sm text-gray-700 dark:text-gray-200">All Rankings</p>
        </div>
        <div className="flex flex-col">
          {rankings.map((student) => (
            <div key={student.rank}
              className={`flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-700 last:border-none transition-colors
                ${student.isMe ? 'bg-[#f0f7eb] dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${student.color} rounded-full flex items-center justify-center text-white font-black text-sm`}>
                  {student.initials}
                </div>
                <div>
                  <p className={`font-bold text-sm ${student.isMe ? 'text-[#4CAF50]' : 'text-gray-800 dark:text-white'}`}>
                    {student.name} {student.isMe && '(You)'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{student.xp} XP · #{student.rank}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>⭐ {student.xp} XP</span>
                <span>🪙 {student.coins}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;