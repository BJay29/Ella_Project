import React, { useState } from 'react';

const MyQuests = () => {
  const [activeFilter, setActiveFilter] = useState('All Quests');
  const [search, setSearch] = useState('');

  const filters = ['All Quests', 'Writing', 'Reading', 'Speaking', 'Listening'];

  const filterColors = {
    'All Quests': { active: 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900' },
    'Writing':    { active: 'bg-yellow-400 text-yellow-900' },
    'Reading':    { active: 'bg-blue-400 text-white'        },
    'Speaking':   { active: 'bg-purple-400 text-white'      },
    'Listening':  { active: 'bg-orange-400 text-white'      },
  };

  const typeBadgeColors = {
    'WRITING':   'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    'READING':   'bg-blue-100   dark:bg-blue-900/40   text-blue-700   dark:text-blue-300',
    'SPEAKING':  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    'LISTENING': 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  };

  const buttonColors = {
    'WRITING':   'bg-gray-800   hover:bg-gray-900   dark:bg-gray-600 dark:hover:bg-gray-500',
    'READING':   'bg-blue-500   hover:bg-blue-600',
    'SPEAKING':  'bg-blue-500   hover:bg-blue-600',
    'LISTENING': 'bg-yellow-400 hover:bg-yellow-500',
  };

  const questEmojis = { 'WRITING': '✏️', 'READING': '📖', 'SPEAKING': '🎤', 'LISTENING': '🎧' };

  const quests = [
    { quest_id: 1, quest_type: 'WRITING',   title: 'Grammar Foundations',    description: 'Master essential English grammar rules and build a strong language foundation.', current_level: 0, total_levels: 3, progress: 0,  xp: 300, status: 'start'    },
    { quest_id: 2, quest_type: 'READING',   title: 'Reading Comprehension',  description: 'Sharpen your ability to understand, analyze, and interpret written text.',        current_level: 2, total_levels: 3, progress: 67, xp: 300, status: 'continue' },
    { quest_id: 3, quest_type: 'SPEAKING',  title: 'Conversational Skills',  description: 'Build confidence in everyday English conversations.',                             current_level: 0, total_levels: 3, progress: 0,  xp: 300, status: 'start'    },
    { quest_id: 4, quest_type: 'LISTENING', title: 'Listening Fundamentals', description: 'Master essential English grammar rules and build a strong language foundation.', current_level: 0, total_levels: 3, progress: 0,  xp: 300, status: 'start'    },
  ];

  const filtered = quests.filter((q) => {
    const matchesFilter = activeFilter === 'All Quests' || q.quest_type === activeFilter.toUpperCase();
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">🎮 Quest Library</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Choose a quest to start learning. Each quest builds your English skills through activities and quizzes.</p>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 w-48">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            type="text" placeholder="Search Quest" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm text-gray-700 dark:text-gray-200 bg-transparent w-full placeholder-gray-400"
          />
        </div>
        {filters.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all
              ${activeFilter === f
                ? filterColors[f]?.active || 'bg-gray-800 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'}`}
          >
            {f === 'Writing' && '✏️ '}{f === 'Reading' && '📖 '}{f === 'Speaking' && '🎤 '}{f === 'Listening' && '🎧 '}{f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <span className="text-4xl mb-3">🔍</span>
          <p className="font-bold text-sm">No quests found</p>
          <p className="text-xs mt-1">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((quest) => {
            const badge  = typeBadgeColors[quest.quest_type] || 'bg-gray-100 text-gray-600';
            const btnCls = buttonColors[quest.quest_type]    || 'bg-gray-800 hover:bg-gray-900';
            const emoji  = questEmojis[quest.quest_type]     || '📝';
            return (
              <div key={quest.quest_id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl">{emoji}</div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${badge}`}>{quest.quest_type}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-base leading-tight">{quest.title}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-snug">{quest.description}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">Level {quest.current_level} of {quest.total_levels}</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{quest.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4CAF50] rounded-full transition-all duration-700" style={{ width: `${quest.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <span>⭐ {quest.xp} XP</span>
                    <span>📋 {quest.total_levels} levels</span>
                  </div>
                  <button className={`${btnCls} text-white text-xs font-bold px-5 py-2 rounded-full transition-colors`}>
                    {quest.status === 'continue' ? 'Continue' : 'Start'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyQuests;