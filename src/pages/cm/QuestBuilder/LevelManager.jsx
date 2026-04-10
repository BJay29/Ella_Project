import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/APIservice';
// Import dependencies kung kailangan mo ng navigation sa future
// import ActivityCreator from './ActivityCreator'; 

const LevelManager = ({ questId }) => {
  // --- STATES FOR SETTINGS ---
  const [passingCriteria, setPassingCriteria] = useState(70);
  const [maxQuizAttempts, setMaxQuizAttempts] = useState(2);
  const [inputMode, setInputMode] = useState('standard');

  // --- STATES FOR LEVEL CONTENT ---
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null); // Para sa pag-click ng level card
  const [isAddingLevel, setIsAddingLevel] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing levels and settings on mount
  useEffect(() => {
    if (questId) {
      fetchLevels();
    }
    const savedSettings = localStorage.getItem('questDefaultSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setPassingCriteria(parsed.passingCriteria || 70);
      setMaxQuizAttempts(parsed.maxQuizAttempts || 2);
      setInputMode(parsed.inputMode || 'standard');
    }
  }, [questId]);

  const fetchLevels = async () => {
    if (!questId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Gamit ang authAPI para sa clean abstraction
      const res = await authAPI.getLevelsByQuest(questId, token);
      if (res.ok) {
        const data = await res.json();
        setLevels(data);
      }
    } catch (err) {
      console.error("Failed to fetch levels:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    const settings = { passingCriteria, maxQuizAttempts, inputMode };
    localStorage.setItem('questDefaultSettings', JSON.stringify(settings));
    alert("System defaults updated! These will apply to new missions.");
  };

  const handleAddLevel = async (e) => {
    e.preventDefault();
    if (!newLevelName.trim() || !questId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        level_name: newLevelName,
        level_number: levels.length + 1
      };

      // Create level via API
      const res = await authAPI.createLevel(questId, payload, token);

      if (res.ok) {
        setNewLevelName('');
        setIsAddingLevel(false);
        fetchLevels();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to create level");
      }
    } catch (err) {
      console.error("Error adding level:", err);
      alert("Error adding level");
    } finally {
      setLoading(false);
    }
  };

  // Function kapag pinili ang isang level card
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    // Dito pwede mong i-trigger ang view change para lumabas ang Activity/Quiz cards
    console.log("Selected Level:", level.level_name);
  };

  return (
    <div className="w-full animate-fadeIn space-y-8">

      {/* SECTION 1: QUEST SETTINGS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚙️</span>
          <h3 className="text-lg font-black uppercase tracking-tighter italic text-gray-800">Quest Default Settings</h3>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <span className="text-indigo-500 mt-0.5">🌐</span>
          <p className="text-indigo-900 text-xs font-bold leading-relaxed">
            SYSTEM DEFAULTS: These settings are applied automatically to all missions. 
            Instructors can override these values inside specific activities.
          </p>
        </div>

        <div className="grid gap-4">
          {/* 1. Passing Criteria */}
          <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black">1</div>
              <div>
                <h4 className="font-black text-gray-800 text-sm uppercase italic">Passing Criteria</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Min. score to unlock next level</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range" min="50" max="100" step="5"
                value={passingCriteria}
                onChange={(e) => setPassingCriteria(e.target.value)}
                className="w-24 h-1 bg-indigo-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-sm min-w-[60px] text-center">
                {passingCriteria}%
              </div>
            </div>
          </div>

          {/* 2. Max Quiz Attempts */}
          <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black">2</div>
              <div>
                <h4 className="font-black text-gray-800 text-sm uppercase italic">Max Quiz Attempts</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Triggers intervention after limit</p>
              </div>
            </div>
            <select
              value={maxQuizAttempts}
              onChange={(e) => setMaxQuizAttempts(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 font-black text-xs uppercase outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1">1 Attempt</option>
              <option value="2">2 Attempts</option>
              <option value="3">3 Attempts</option>
              <option value="5">5 Attempts</option>
            </select>
          </div>

          {/* 3. Input Mode */}
          <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black">3</div>
              <div>
                <h4 className="font-black text-gray-800 text-sm uppercase italic">Default Input Mode</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global response method</p>
              </div>
            </div>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setInputMode('standard')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${inputMode === 'standard' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
              >
                📝 Standard
              </button>
              <button
                onClick={() => setInputMode('speech')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${inputMode === 'speech' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
              >
                🎙️ Speech
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSaveSettings}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
          >
            💾 Save Global Defaults
          </button>
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* SECTION 2: LEVEL MANAGEMENT (Actual Mission Builder) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">MAPS</span>
            <h3 className="text-lg font-black uppercase tracking-tighter italic text-gray-800">Mission Levels</h3>
          </div>
          <button
            onClick={() => setIsAddingLevel(true)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-emerald-600 transition-all flex items-center gap-2"
          >
            ➕ Add New Level
          </button>
        </div>

        {/* Level List */}
        <div className="grid gap-3">
          {loading && levels.length === 0 ? (
            <div className="text-center py-12">
              <p className="animate-pulse font-black text-[10px] uppercase text-gray-400">Loading levels...</p>
            </div>
          ) : levels.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-black text-xs uppercase tracking-widest">No levels created for this quest yet.</p>
            </div>
          ) : (
            levels.map((level, index) => (
              <div 
                key={level.id || index} 
                onClick={() => handleLevelSelect(level)}
                className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-2xl flex flex-col items-center justify-center text-white group-hover:bg-indigo-600 transition-colors">
                    <span className="text-[8px] font-black uppercase leading-none opacity-50">Lvl</span>
                    <span className="text-lg font-black italic">{level.level_number}</span>
                  </div>
                  <div>
                    <h5 className="font-black text-gray-800 uppercase italic leading-tight group-hover:text-indigo-600 transition-colors">{level.level_name}</h5>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter">Manage Activities & Quizzes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); /* edit logic */ }}>✏️</button>
                  <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); /* delete logic */ }}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ADD LEVEL MODAL */}
      {isAddingLevel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-fadeIn">
            <h3 className="text-xl font-black italic uppercase text-gray-900 mb-2">Create Level {levels.length + 1}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Enter a name for this mission phase</p>

            <form onSubmit={handleAddLevel} className="space-y-4">
              <input
                autoFocus
                type="text"
                placeholder="Level Title (e.g. The Beginning)"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-indigo-500 transition-all"
                value={newLevelName}
                onChange={(e) => setNewLevelName(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingLevel(false)}
                  className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newLevelName}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Creating...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default LevelManager;