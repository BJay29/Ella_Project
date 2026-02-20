import React from 'react';
import ellaThinking from '../../assets/image.png'; // Siguraduhin na tama ang path papunta sa assets mo

const ErrorModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="relative w-full max-w-[420px]">
        
        {/* CHARACTER CONTAINER */}
        <div className="absolute -right-16 -top-24 w-48 z-[1001] pointer-events-none">
          <img 
            src={ellaThinking} // Gamitin ang in-import na variable
            alt="Ella Thinking" 
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>

        {/* MODAL BOX */}
        <div className="bg-white rounded-[40px] p-10 shadow-2xl flex flex-col items-center relative border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-[#1A2E35] text-2xl md:text-3xl font-semibold leading-tight">
              Hmm, that doesn't look<br />right. Check your info.
            </h2>
          </div>

          <button
            onClick={onClose}
            className="bg-[#D22B2B] hover:bg-[#b02424] text-white font-bold py-3 px-12 rounded-xl text-xl transition-all active:scale-95 shadow-lg"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;