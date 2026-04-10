import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../../services/APIservice';
import { 
  Save, 
  Trash2, 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle2, 
  Trophy, 
  Type, 
  Settings2,
  Loader2,
  Layout
} from 'lucide-react';

const ContentEditor = ({ questId, levelId, activityId, onBack }) => {
  // --- STATES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activityData, setActivityData] = useState({
    title: '',
    difficulty: 'easy',
    passing_score: 0
  });
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // --- FETCH ACTIVITY & QUESTIONS ---
  const fetchActivityDetails = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch activity metadata
      const res = await authAPI.getActivityById(questId, levelId, activityId, token);
      if (res.ok) {
        const data = await res.json();
        setActivityData({
          title: data.title,
          difficulty: data.difficulty,
          passing_score: data.passing_score
        });
        // Assuming questions are returned or need separate fetch
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error("Error fetching activity:", err);
      setMessage({ type: 'error', text: 'Failed to load activity details.' });
    } finally {
      setLoading(false);
    }
  }, [questId, levelId, activityId]);

  useEffect(() => {
    if (activityId) fetchActivityDetails();
  }, [activityId, fetchActivityDetails]);

  // --- HANDLERS ---
  const handleUpdateActivity = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.updateActivity(questId, levelId, activityId, activityData, token);
      if (res.ok) {
        setMessage({ type: 'success', text: 'Activity updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await authAPI.deleteActivityQuestion(questId, levelId, activityId, qId, token);
      if (res.ok) {
        setQuestions(questions.filter(q => q.id !== qId));
      }
    } catch (err) {
      alert("Failed to delete question.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Loading Content...</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fadeIn space-y-6">
      
      {/* HEADER ACTIONS - More Compact & Professional */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-xs uppercase tracking-wider"
        >
          <ChevronLeft size={16} /> Back to Levels
        </button>
        
        <button 
          onClick={handleUpdateActivity}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:bg-slate-300"
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          Save Changes
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="text-xs font-bold uppercase tracking-tight">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMN 1: SETTINGS (Sticky for easier access) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6 sticky top-6">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-3">
              <Settings2 size={18} className="text-indigo-600" />
              <h3 className="font-bold text-sm uppercase tracking-tight text-slate-800">Activity Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700"
                  value={activityData.title}
                  onChange={(e) => setActivityData({...activityData, title: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Difficulty</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold outline-none cursor-pointer focus:border-indigo-500"
                  value={activityData.difficulty}
                  onChange={(e) => setActivityData({...activityData, difficulty: e.target.value})}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1 text-slate-400">
                  <Trophy size={12}/> Passing Score
                </label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold outline-none focus:border-indigo-500"
                  value={activityData.passing_score}
                  onChange={(e) => setActivityData({...activityData, passing_score: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2 & 3: QUESTION LIST */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-2">
              <Layout size={18} className="text-slate-400" />
              <h3 className="font-bold text-sm uppercase tracking-tight text-slate-800">
                Question Bank <span className="ml-2 bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">{questions.length}</span>
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {questions.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-16 text-center">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No questions linked to this activity</p>
              </div>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id || idx} className="group bg-white border border-slate-200 p-5 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm leading-tight mb-2 italic pr-4">"{q.question_text}"</p>
                      <div className="flex gap-2">
                        <span className="text-[9px] font-bold uppercase px-2 py-1 bg-slate-100 text-slate-500 rounded border border-slate-200 tracking-tight">
                          {q.question_type?.replace('_', ' ')}
                        </span>
                        <span className="text-[9px] font-bold uppercase px-2 py-1 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 tracking-tight">
                          {q.answers?.length || 0} Answers
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default ContentEditor;