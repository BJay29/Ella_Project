import React, { useState, useEffect, useRef } from 'react';
import { authAPI } from '../../../services/APIservice';
import { AlertTriangle, X, ChevronLeft } from 'lucide-react';

const AlertModal = ({ isOpen, onClose, message, title = 'Notice' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[35px] p-8 shadow-2xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">{title}</h3>
        <p className="text-sm text-gray-500 font-medium mt-3 leading-relaxed">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all active:scale-95"
        >
          Understood
        </button>
      </div>
    </div>
  );
};

const capitalize = (s = '') =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : 'Easy';

// ── QuizCreator: saves quiz title / difficulty / passing_score only.
const QuizCreator = ({
  isOpen,
  onClose,
  questId,
  quest_level_id,
  existingQuiz,
  mode = 'save-info',
  onSuccess,
}) => {
  const [formData, setFormData]         = useState({ title: '', difficulty: 'Easy', passing_score: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal]     = useState({ show: false, message: '', title: '' });

  const quizIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const qId =
      existingQuiz?.quiz_id ||
      existingQuiz?.id      ||
      existingQuiz?._id     || null;

    quizIdRef.current = qId;

    setFormData({
      title:         existingQuiz?.title         || '',
      difficulty:    capitalize(existingQuiz?.difficulty),
      passing_score: existingQuiz?.passing_score != null
        ? String(existingQuiz.passing_score)
        : '',
    });
  }, [isOpen, existingQuiz]);

  const handleSave = async () => {
    if (isSubmitting) return;

    if (!formData.title.trim()) {
      setErrorModal({ show: true, title: 'Missing Info', message: 'Please enter a quiz title.' });
      return;
    }

    const scoreVal = parseInt(formData.passing_score, 10);
    if (isNaN(scoreVal)) {
      setErrorModal({ show: true, title: 'Missing Info', message: 'Please enter a valid passing score.' });
      return;
    }

    if (!quest_level_id) {
      setErrorModal({
        show: true, title: 'Configuration Error',
        message: 'Level ID is missing. Please close and try again.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token   = localStorage.getItem('token');
      const payload = {
        title:         formData.title.trim(),
        difficulty:    formData.difficulty.toLowerCase(),
        passing_score: scoreVal,
      };

      let res;
      if (quizIdRef.current) {
        res = await authAPI.updateQuiz(questId, quest_level_id, quizIdRef.current, payload, token);
      } else {
        res = await authAPI.createQuiz(questId, quest_level_id, payload, token);
      }

      if (res.ok || res.status === 201 || res.status === 200) {
        const responseData = await res.json().catch(() => ({}));
        
        if (onSuccess) onSuccess(responseData);
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorModal({ show: true, title: 'Error', message: data.message || 'Could not save quiz.' });
      }
    } catch (err) {
      console.error('QuizCreator save error:', err);
      setErrorModal({ show: true, title: 'Connection Error', message: 'Failed to connect to server.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = !!quizIdRef.current;

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
        <div className="bg-white w-full max-w-lg rounded-[40px] p-12 shadow-2xl relative animate-in fade-in zoom-in duration-300 border border-slate-100">
          <button
            onClick={onClose}
            className="absolute right-10 top-10 text-slate-300 hover:text-rose-500 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="text-center mb-10">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-2xl font-black uppercase text-slate-900 tracking-tighter leading-none">
              {isEditing ? 'Edit Quiz' : 'Create Quiz'}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
              Setup Basic Info
            </p>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Quiz Title
              </label>
              <input
                className="w-full bg-slate-50 border border-slate-100 rounded-[22px] px-6 py-5 text-sm font-bold text-slate-900 focus:ring-4 ring-rose-500/10 focus:border-rose-400 outline-none transition-all placeholder:text-slate-300"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Grammar Mastery Test"
              />
            </div>

            {/* Difficulty + Passing Score */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Difficulty
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-50 border border-slate-100 rounded-[22px] px-6 py-5 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer focus:border-rose-400 transition-all"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronLeft size={14} className="-rotate-90" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Passing Score
                </label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border border-slate-100 rounded-[22px] px-6 py-5 text-sm font-bold text-slate-900 outline-none focus:border-rose-400 transition-all placeholder:text-slate-300"
                  value={formData.passing_score}
                  onChange={(e) => setFormData({ ...formData, passing_score: e.target.value })}
                  placeholder="7"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-white border-2 border-slate-100 text-slate-400 py-5 rounded-[22px] font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="w-full bg-rose-500 text-white py-5 rounded-[22px] font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-60"
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={errorModal.show}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ show: false, message: '', title: '' })}
      />
    </>
  );
};

export default QuizCreator;
