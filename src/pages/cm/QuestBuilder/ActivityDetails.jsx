import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../../services/APIservice';
import { 
  ChevronLeft, Plus, Layout, 
  ArrowRight, CheckCircle2, FileText, BookOpen, Settings
} from 'lucide-react';

const ActivityDetails = () => {
  const { questId, levelId, activityId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchActivityContent();
  }, [activityId]);

  const fetchActivityContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Kumukuha lang ng Activities
      const res = await authAPI.getActivities(questId, levelId, token);
      
      if (res.ok) {
        const data = await res.json();
        // Filter: Hanapin ang specific activity gamit ang ID mula sa URL
        const currentActivity = data.find(act => act.activity_id === parseInt(activityId));
        
        // I-set lang ang questions kung ang nahanap ay talagang isang activity
        setQuestions(currentActivity?.questions || []);
      }
    } catch (err) {
      console.error("Error fetching activity details:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-[45px] shadow-2xl shadow-blue-100/30 border border-gray-100 overflow-hidden flex flex-col">
        
        {/* HEADER - Focused on Activity Only */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-3 hover:bg-slate-50 rounded-2xl text-gray-400 hover:text-blue-600 transition-all active:scale-90"
            >
              <ChevronLeft size={22} />
            </button>
            <div>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600">
                Activity Manager
              </span>
              <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter mt-1">
                Activity Content
              </h2>
            </div>
          </div>

          <button 
            onClick={() => navigate(`/cm/dashboard/quest/${questId}/level/${levelId}/activity/${activityId}/add-question`)}
            className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-[22px] font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200"
          >
            <Plus size={16} /> Add Activity Question
          </button>
        </div>

        {/* MAIN BODY */}
        <div className="p-10 md:p-14">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Loading Activity Items...</p>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-10">
              {/* STATUS */}
              <div className="bg-blue-50/50 border-2 border-blue-100 rounded-[35px] p-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
                  <BookOpen size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900 uppercase italic tracking-tighter">Learning Mode Active</h4>
                  <p className="text-sm text-gray-500 font-medium">
                    This activity contains <span className="text-blue-600 font-black">{questions.length}</span> interactive questions.
                  </p>
                </div>
              </div>

              {/* LIST OF ACTIVITY QUESTIONS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] ml-2">
                  <Settings size={14}/> Activity Question Set
                </div>
                <div className="grid gap-4">
                  {questions.map((q, idx) => (
                    <div key={idx} className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[30px] hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-[18px] flex items-center justify-center text-gray-400 font-black text-sm group-hover:bg-blue-600 group-hover:text-white">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg leading-tight mb-1">{q.question_text}</p>
                          <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                             {q.question_type || 'ACTIVITY_TASK'}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* EMPTY STATE - Activity Style */
            <div className="py-24 text-center space-y-8">
              <div className="w-28 h-28 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <FileText size={56} />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Activity is Empty</h3>
                <p className="text-sm text-gray-400 font-medium mt-3">
                  No learning materials or questions found for this specific activity.
                </p>
              </div>
              <button 
                onClick={() => navigate(`/cm/dashboard/quest/${questId}/level/${levelId}/activity/${activityId}/add-question`)}
                className="inline-flex items-center gap-4 px-12 py-6 bg-blue-600 text-white rounded-[26px] font-black text-[11px] uppercase shadow-2xl hover:bg-blue-700 transition-all"
              >
                Add Activity Content <Plus size={18} />
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-10 bg-slate-50/80 border-t border-gray-100 flex justify-center items-center gap-12">
           <div className="flex items-center gap-3">
             <Layout size={16} className="text-blue-300"/>
             <span className="text-[11px] font-bold text-gray-500 uppercase">Activity Ref: {activityId}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;