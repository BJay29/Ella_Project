import React from 'react';

const SuccessModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#D1EED1] border-2 border-[#8da84a] rounded-3xl p-8 max-w-[320px] w-full flex flex-col items-center shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-[#A2BC56] rounded-full flex items-center justify-center mb-4 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>

        <h3 className="text-[#2d3a1a] font-black text-lg tracking-widest uppercase mb-2">Success!</h3>
        
        <p className="text-[#4a5d2e] text-[11px] font-bold text-center leading-tight uppercase mb-6 italic">
          {message}
        </p>

        <button 
          onClick={onClose}
          className="w-full bg-[#A2BC56] hover:bg-[#b5cc74] text-gray-800 border-2 border-[#8da84a] rounded-full py-2 font-black text-xs tracking-widest transition-all active:scale-95 shadow-md uppercase"
        >
          Proceed to Login
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;