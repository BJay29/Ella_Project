import React from 'react';
// Inalis ang import ng ellaThinking dito

const ErrorModal = ({ isOpen, onClose, message, title }) => {
  if (!isOpen) return null;

  // I-check kung ang message ay tungkol sa existing account
  const isInfo = message?.includes("ALREADY REGISTERED") || message?.includes("EXISTS") || title?.includes("Account");
  
  // SUGGESTED MESSAGES & TITLES
  const displayTitle = title || (isInfo ? "WELCOME BACK!" : "LOGIN ERROR");
  const displayMessage = isInfo 
    ? "This email is already linked to an account. Please log in to continue." 
    : (message || "SOMETHING WENT WRONG");
    
  const buttonText = isInfo ? "LOG IN NOW" : "TRY AGAIN";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 font-sans">
      
      {/* MAIN CONTAINER FOR MODAL */}
      <div className="relative animate-in fade-in zoom-in duration-300">
        
        {/* CHARACTER IMAGE SECTION - TINANGGAL NA DITO */}

        {/* MODAL BOX */}
        <div className="bg-white rounded-[40px] p-10 pt-12 shadow-2xl flex flex-col items-center relative z-10 border border-gray-100 max-w-[340px] w-full mx-auto">
          
          <div className="text-center mb-8 w-full">
            {/* Dynamic Title Color */}
            <h2 className={`${isInfo ? 'text-blue-600' : 'text-[#D22B2B]'} text-lg font-black tracking-[0.2em] uppercase mb-3 px-2`}>
              {displayTitle}
            </h2>
            
            {/* Main Message */}
            <p className="text-[#1A2E35] text-[11px] font-bold leading-tight uppercase px-1 italic">
              {displayMessage}
            </p>
          </div>

          {/* Dynamic Button Color */}
          <button
            onClick={onClose}
            className={`${isInfo ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#D22B2B] hover:bg-[#b02424]'} text-white font-black py-2.5 px-10 rounded-full text-[11px] transition-all active:scale-95 shadow-md uppercase tracking-widest w-full`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;