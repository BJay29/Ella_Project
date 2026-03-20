import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../../services/APIservice';
import { 
  ChevronLeft, Plus, Layout, 
  ArrowRight, CheckCircle2, FileText, HelpCircle
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
      
      // Ginagamit ang existing getActivities API para makuha ang questions
      const res = await authAPI.getActivities(questId, levelId, token);
      
      if (res.ok) {
        const data = await res.json();
        // Hinahanap ang tamang activity base sa ID mula sa URL
        const currentActivity = data.find(act => act.activity_id === parseInt(activityId));
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
      <div className="max-w-5xl mx-auto bg-white rounded-[45px] shadow-2xl shadow-indigo-100/30 border border-gray-100 overflow-hidden flex flex-col">
        
        {/* HEADER SECTION - Tugma sa Add Question UI */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/cm/dashboard/quest/${questId}`)} 
              className="p-3 hover:bg-slate-50 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all active:scale-90"
            >
              <ChevronLeft size={22} />
            </button>
            <div>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600">
                content manager
              </span>
              <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter mt-1">
                Activity Summary
              </h2>
            </div>
          </div>

          <button 
            onClick={() => navigate(`/cm/dashboard/quest/${questId}/level/${levelId}/activity/${activityId}/add-question`)}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-[22px] font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            <Plus size={16} /> Add More Questions
          </button>
        </div>

        {/* MAIN BODY */}
        <div className="p-10 md:p-14">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Fetching Activity Content...</p>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-10">
              {/* STATUS BANNER */}
              <div className="bg-green-50/50 border-2 border-green-100 rounded-[35px] p-8 flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm border border-green-50">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900 uppercase italic tracking-tighter">Activity is Live</h4>
                  <p className="text-sm text-gray-500 font-medium italic">
                    This activity already has <span className="text-green-600 font-black">{questions.length}</span> questions saved in the database.
                  </p>
                </div>
              </div>

              {/* QUESTION LIST */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em] ml-2">
                  <HelpCircle size={14}/> Question List
                </div>
                <div className="grid gap-4">
                  {questions.map((q, idx) => (
                    <div key={idx} className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[30px] hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-[18px] flex items-center justify-center text-gray-400 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg leading-tight mb-1">{q.question_text}</p>
                          <div className="flex gap-2">
                             <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                               {q.question_type.replace('_', ' ')}
                             </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* EMPTY STATE - Kapag wala pang questions */
            <div className="py-24 text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="w-28 h-28 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <FileText size={56} />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">No Content Found</h3>
                <p className="text-sm text-gray-400 font-medium mt-3 leading-relaxed">
                  This activity is currently empty. Start by adding your first question to make it playable for students.
                </p>
              </div>
              <button 
                onClick={() => navigate(`/cm/dashboard/quest/${questId}/level/${levelId}/activity/${activityId}/add-question`)}
                className="inline-flex items-center gap-4 px-12 py-6 bg-indigo-600 text-white rounded-[26px] font-black text-[11px] uppercase shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
              >
                Create First Question <Plus size={18} />
              </button>
            </div>
          )}
        </div>

        {/* FOOTER INFO */}
        <div className="p-10 bg-slate-50/80 border-t border-gray-100 flex flex-wrap justify-center items-center gap-12">
           <div className="flex items-center gap-3">
             <Layout size={16} className="text-indigo-300"/>
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Activity Ref</span>
                <span className="text-[11px] font-bold text-gray-500">ID: {activityId}</span>
             </div>
           </div>
           <div className="w-px h-8 bg-gray-200 hidden md:block" />
           <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1 italic text-center">Managed by Content Team</span>
              <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-100" />)}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;