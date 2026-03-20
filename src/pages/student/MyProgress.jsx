import React from 'react';

const MyProgress = () => {
  const stats = [
    { label: 'Quests Done',     value: 6    },
    { label: 'Quizzes Passed',  value: 7    },
    { label: 'Activities Done', value: 6    },
    { label: 'Avg Score',       value: '7%' },
    { label: 'Total Coins',     value: 6    },
    { label: 'Badges',          value: 7    },
  ];

  const skillProgress = [
    { label: 'Writing',   emoji: '✏️', status: 'Not started', current: 0, total: 3, percent: 0 },
    { label: 'Reading',   emoji: '📖', status: 'Not started', current: 0, total: 3, percent: 0 },
    { label: 'Speaking',  emoji: '🎤', status: 'Not started', current: 0, total: 3, percent: 0 },
    { label: 'Listening', emoji: '🎧', status: 'Not started', current: 0, total: 3, percent: 0 },
  ];

  const accuracyData = [
    { label: 'Writing',   percent: 60, color: '#4CAF50' },
    { label: 'Reading',   percent: 78, color: '#2196F3' },
    { label: 'Speaking',  percent: 45, color: '#E91E63' },
    { label: 'Listening', percent: 66, color: '#FF9800' },
  ];

  const buildConic = () => {
    const total = accuracyData.reduce((s, d) => s + d.percent, 0);
    let cumulative = 0;
    const parts = accuracyData.map((d) => {
      const start = (cumulative / total) * 360;
      cumulative += d.percent;
      const end = (cumulative / total) * 360;
      return `${d.color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">📈 My Progress</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Track your learning journey across all quests and skills.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-center shadow-sm transition-colors">
            <p className="text-3xl font-black text-gray-800 dark:text-white">{stat.value}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors">
          <h3 className="font-bold text-gray-800 dark:text-white text-base mb-5">Skill Progress</h3>
          <div className="flex flex-col gap-5">
            {skillProgress.map((skill) => (
              <div key={skill.label}>
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{skill.emoji} {skill.label}</span>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{skill.status}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{skill.current}/{skill.total} levels</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4CAF50] rounded-full transition-all duration-700" style={{ width: `${skill.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accuracy by Skill */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors">
          <h3 className="font-bold text-gray-800 dark:text-white text-base mb-5">Accuracy by Skill</h3>
          <div className="flex justify-center mb-6">
            <div className="relative w-44 h-44">
              <div className="w-full h-full rounded-full" style={{ background: buildConic() }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full transition-colors" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {accuracyData.map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{d.label} {d.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProgress;