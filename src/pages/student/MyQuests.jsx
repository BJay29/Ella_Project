import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Inayos ang import path base sa services
import { authAPI } from '../../services/APIservice';

const MyQuests = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Quests');
  const [search, setSearch] = useState('');
  
  // State para sa live data mula sa bagong API
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = ['All Quests', 'Writing', 'Reading', 'Speaking', 'Listening'];

  const filterColors = {
    'All Quests': { active: 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900' },
    'Writing':    { active: 'bg-yellow-400 text-yellow-900' },
    'Reading':    { active: 'bg-blue-400 text-white'         },
    'Speaking':   { active: 'bg-purple-400 text-white'       },
    'Listening':  { active: 'bg-orange-400 text-white'       },
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

  // --- FETCH LIVE DATA MULA SA BAGONG API: getMyQuests ---
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await authAPI.getMyQuests(token);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json(); 
        
        // Sinisiguro na array ang makuha para sa mapping
        setQuests(Array.isArray(data) ? data : (data.quests || []));
      } catch (error) {
        console.error("Error fetching quests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuests();
  }, []);

  // Filter logic gamit ang live data
  const filtered = quests.filter((q) => {
    const qType = q.quest_type || "";
    const qTitle = q.title || q.quest_title || "";
    
    const matchesFilter = activeFilter === 'All Quests' || qType.toUpperCase() === activeFilter.toUpperCase();
    const matchesSearch = qTitle.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // PINANATILI AT INAYOS: handleStartQuest na may getQuestDetails validation
  const handleStartQuest = async (questId) => {
    if (!questId) {
      console.error("Quest ID is missing!");
      alert("Quest ID not found.");
      return;
    }

    try {
        const token = localStorage.getItem('token');
        console.log("Verifying Quest ID:", questId);
        
        // 1. I-verify ang Quest Details
        const resDetail = await authAPI.getQuestDetails(questId, token);
        
        if(resDetail.ok) {
            // 2. Pagkatapos ng verification, dumeretso sa levels navigation
            console.log("Verification successful, navigating...");
            navigate(`/student/quest/${questId}/levels`);
        } else {
            // Kung ang server ay nagbalik ng error (halimbawa: Draft status o 404)
            console.error("Quest verification failed with status:", resDetail.status);
            alert("This quest is no longer available or not yet published.");
        }
    } catch (error) {
        console.error("Error verifying quest:", error);
        // Fallback: Kung nag-crash ang API detail check pero may valid ID tayo, 
        // ituloy pa rin ang navigate para hindi ma-stuck ang user.
        navigate(`/student/quest/${questId}/levels`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-sm font-medium tracking-wide">Fetching Your Quests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">🎮 My Assigned Quests</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Quests assigned to your section from the Curriculum Manager.</p>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 w-48 shadow-sm">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            type="text" placeholder="Search Quest" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm text-gray-700 dark:text-gray-200 bg-transparent w-full placeholder-gray-400"
          />
        </div>
        {filters.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm
              ${activeFilter === f
                ? filterColors[f]?.active || 'bg-gray-800 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'}`}
          >
            {f === 'Writing' && '✏️ '}{f === 'Reading' && '📖 '}{f === 'Speaking' && '🎤 '}{f === 'Listening' && '🎧 '}{f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
          <span className="text-4xl mb-3">📭</span>
          <p className="font-bold text-sm">No quests found</p>
          <p className="text-xs mt-1">Wait for your instructor or manager to assign new quests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((quest, index) => {
            // Kinukuha ang ID sa iba't ibang posibleng format ng backend
            const qId = quest.quest_id || quest.id || quest._id;
            
            const badge  = typeBadgeColors[quest.quest_type?.toUpperCase()] || 'bg-gray-100 text-gray-600';
            const btnCls = buttonColors[quest.quest_type?.toUpperCase()]    || 'bg-gray-800 hover:bg-gray-900';
            const emoji  = questEmojis[quest.quest_type?.toUpperCase()]      || '📝';
            
            const progressValue = quest.progress_percentage || 0;
            const statusLabel = progressValue > 0 ? 'Continue' : 'Start';

            return (
              <div key={qId || index} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl">{emoji}</div>
                    <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Active Quest</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${badge}`}>
                    {quest.quest_type}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-base leading-tight">
                    {quest.title || quest.quest_title}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-snug line-clamp-2">
                    {quest.description || quest.quest_description || 'Embark on this mission to improve your skills.'}
                  </p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                      Overall Progress
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{progressValue}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#4CAF50] rounded-full transition-all duration-700" 
                      style={{ width: `${progressValue}%` }} 
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <span>⭐ {quest.xp_reward || 0} XP</span>
                    <span>📊 {quest.total_levels || 0} levels</span>
                  </div>
                  <button 
                    onClick={() => handleStartQuest(qId)}
                    className={`${btnCls} text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all active:scale-95 shadow-md`}
                  >
                    {statusLabel}
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