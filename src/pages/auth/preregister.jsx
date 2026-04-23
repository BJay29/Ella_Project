import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Inalis ang import ng ellaLogo dito
import ErrorModal from "../../components/modals/errormodal";
import { authAPI } from '../../services/APIservice';

// Import Icons
import { FcGoogle } from 'react-icons/fc';
import { HiArrowLeft } from 'react-icons/hi';

const SignupMethod = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal States
  const [showError, setShowError] = useState(false);
  const [msg, setMsg] = useState('');

  /**
   * HANDLE GOOGLE REGISTRATION
   * Nililinis muna ang storage bago mag-redirect sa Google
   * para iwas "loop" or auto-redirect errors.
   */
  const handleGoogleRegister = () => {
    setIsLoading(true);
    
    try {
      // 1. NUCLEAR CLEANUP: Linisin ang lumang basura sa storage
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');   
      sessionStorage.clear();

      // 2. IMPORTANT FIX: I-set ang intent PAGKATAPOS ng clear.
      // Ito ang magsasabi sa GoogleCallback na "REGISTER" ang mode natin.
      sessionStorage.setItem('sso_intent', 'register');

      console.log("Redirecting to Google SSO with intent: register...");
      
      // 3. Initiate Google Login
      authAPI.initiateGoogleLogin();
    } catch (error) {
      console.error("Google Auth Error:", error);
      setIsLoading(false);
      setMsg("COULD NOT CONNECT TO GOOGLE AUTH. PLEASE TRY AGAIN.");
      setShowError(true);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#C8E6C0] flex flex-col items-center justify-center font-sans relative overflow-hidden">
      
      {/* Main Card Container */}
      <div className="w-full max-w-[340px] bg-[#B8DBB8] rounded-[40px] p-10 flex flex-col items-center shadow-lg border border-black/10 animate-slideUp">
        
        {/* Branding Logo - Inalis ang Ella Character Image dito */}
        <div className="mb-6 mt-4">
          <div className="w-16 h-1 bg-gray-700/20 rounded-full mb-4 mx-auto"></div>
        </div>

        <h2 className="text-[12px] font-black tracking-[0.25em] text-gray-700 uppercase mb-2 text-center">
          Quick Registration
        </h2>
        
        <p className="text-[10px] text-gray-600 font-bold text-center mb-8 leading-tight px-4 uppercase">
          Verify your identity automatically using your Google account.
        </p>

        {/* Primary Action: Google SSO Button */}
        <div className="w-full flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className={`flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full py-3 shadow-md transition-all active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="text-[11px] font-bold animate-pulse italic">CONNECTING...</span>
            ) : (
              <>
                <FcGoogle className="w-5 h-5" /> 
                <span className="text-[11px] font-black tracking-wider uppercase">Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center border-t border-black/5 pt-4 w-full">
          <Link 
            to="/login" 
            className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 uppercase hover:underline"
          >
            <HiArrowLeft className="w-3 h-3" />
            Back to Login
          </Link>
        </div>
      </div>

      {/* Error Modal */}
      <ErrorModal 
        isOpen={showError} 
        message={msg} 
        onClose={() => setShowError(false)} 
      />

      {/* Animation Styles */}
      <style>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default SignupMethod;