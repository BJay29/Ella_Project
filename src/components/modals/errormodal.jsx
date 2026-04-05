import React from 'react';
import ellaThinking from '../../assets/image.png';

const ErrorModal = ({ isOpen, onClose, message, title }) => {
  if (!isOpen) return null;

  // I-check kung ang message ay tungkol sa existing account
  const isInfo = message?.includes("ALREADY REGISTERED") || message?.includes("EXISTS") || title?.includes("Account");
  
  // SUGGESTED MESSAGES & TITLES
  const displayTitle = title || (isInfo ? "WELCOME BACK!" : "LOGIN ERROR");
  const displayMessage = isInfo 
    ? "THIS EMAIL IS ALREADY LINKED TO AN ACCOUNT. PLEASE LOG IN TO CONTINUE YOUR JOURNEY!" 
    : (message || "SOMETHING WENT WRONG");
    
  const buttonText = isInfo ? "LOG IN NOW" : "TRY AGAIN";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="relative w-full max-w-[400px]">
        
        {/* CHARACTER CONTAINER - CENTERED & OVERLAPPING */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-20 w-32 md:w-36 z-[1001] pointer-events-none drop-shadow-xl animate-bounce-slow">
          <img 
            src={ellaThinking} 
            alt="Ella Thinking" 
            className="w-full h-auto object-contain"
          />
        </div>

        {/* MODAL BOX */}
        <div className="bg-white rounded-[40px] p-8 pt-16 shadow-2xl flex flex-col items-center relative border border-gray-100 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            {/* Dynamic Title Color */}
            <h2 className={`${isInfo ? 'text-blue-600' : 'text-[#D22B2B]'} text-lg font-black tracking-[0.2em] uppercase mb-3`}>
              {displayTitle}
            </h2>
            
            {/* Main Message - Mas malinis na spacing */}
            <p className="text-[#1A2E35] text-sm md:text-base font-bold leading-tight uppercase px-4 italic">
              {displayMessage}
            </p>
          </div>

          {/* Dynamic Button Color */}
          <button
            onClick={onClose}
            className={`${isInfo ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#D22B2B] hover:bg-[#b02424]'} text-white font-black py-3 px-10 rounded-2xl text-xs transition-all active:scale-95 shadow-lg uppercase tracking-widest`}
          >
            {buttonText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ErrorModal;