import React from 'react';

const DeleteModal = ({ isOpen, isSubmitting, title = "Delete?", onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[24px] p-8 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 text-xs hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} disabled={isSubmitting} className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-red-600 disabled:opacity-50">
            {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;