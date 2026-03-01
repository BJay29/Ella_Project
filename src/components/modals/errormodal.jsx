import React from 'react';
import ellaThinking from '../../assets/image.png';

const ErrorModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="relative w-full max-w-[420px]">
        
        {/* CHARACTER CONTAINER */}
        <div className="absolute -right-10 -top-24 w-40 md:w-48 z-[1001] pointer-events-none">
          <img 
            src={ellaThinking} 
            alt="Ella Thinking" 
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>

        {/* MODAL BOX */}
        <div className="bg-white rounded-[40px] p-10 shadow-2xl flex flex-col items-center relative border border-gray-100 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <h2 className="text-[#D22B2B] text-xl font-black tracking-widest uppercase mb-2">
              Login Error
            </h2>
            {/* DITO LALABAS YUNG "INVALID EMAIL OR PASSWORD" */}
            <p className="text-[#1A2E35] text-xl md:text-2xl font-semibold leading-tight uppercase">
              {message || "SOMETHING WENT WRONG"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-[#D22B2B] hover:bg-[#b02424] text-white font-bold py-3 px-12 rounded-xl text-xl transition-all active:scale-95 shadow-lg uppercase tracking-widest"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;