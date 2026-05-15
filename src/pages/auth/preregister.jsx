import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ErrorModal from "../../components/modals/errormodal";
import { authAPI } from '../../services/APIservice';

// Icon Imports
import { FcGoogle } from 'react-icons/fc';
import { HiArrowLeft } from 'react-icons/hi';

/**
 * SIGNUP METHOD COMPONENT
 * This page serves as the gateway for new users to verify their identity
 * via Google SSO before proceeding to the registration details.
 */
const SignupMethod = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // UI Feedback States
  const [showError, setShowError] = useState(false);
  const [msg, setMsg] = useState('');

  /**
   * HANDLE GOOGLE REGISTRATION
   * Prepares the session for a new user registration via Google OAuth.
   */
  const handleGoogleRegister = () => {
    setIsLoading(true);
    
    try {
      // 1. CLEAR PERSISTENCE: Wipe existing session data to prevent account mix-ups
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');   
      sessionStorage.clear();

      // 2. SET SSO INTENT: Flag this session as a 'register' attempt
      // This is crucial for the Callback handler to know whether to Login or Signup
      sessionStorage.setItem('sso_intent', 'register');

      console.log("System: Initiating registration flow via Google SSO...");
      
      // 3. OAUTH REDIRECT: Trigger the Google Login process
      authAPI.initiateGoogleLogin();
    } catch (error) {
      console.error("Critical Auth Error:", error);
      setIsLoading(false);
      setMsg("CONNECTION TO GOOGLE SERVICES FAILED. PLEASE CHECK YOUR INTERNET AND TRY AGAIN.");
      setShowError(true);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#C8E6C0] flex flex-col items-center justify-center font-sans relative overflow-hidden">
      
      {/* Background Aesthetic: Decorative Blur Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-white/30 rounded-full blur-[100px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-green-200/40 rounded-full blur-[80px] z-0 pointer-events-none"></div>
      
      {/* Main Container Card */}
      <div className="w-full max-w-[360px] bg-[#B8DBB8] rounded-[50px] p-10 flex flex-col items-center shadow-2xl border border-white/20 animate-slideUp relative z-10">
        
        {/* Subtle Card Accent */}
        <div className="mb-8 w-full">
          <div className="w-12 h-1.5 bg-gray-800/10 rounded-full mx-auto"></div>
        </div>

        {/* Header Section */}
        <h2 className="text-[13px] font-black tracking-[0.3em] text-gray-800 uppercase mb-3 text-center italic">
          Identity Verification
        </h2>
        
        <p className="text-[10px] text-gray-700 font-bold text-center mb-10 leading-relaxed px-2 uppercase tracking-wide">
          To ensure security, please verify your school or personal gmail account using Google SSO.
        </p>

        {/* Action Button: Google SSO */}
        <div className="w-full group">
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className={`flex items-center justify-center gap-4 w-full bg-white hover:bg-gray-50 text-gray-800 border-b-4 border-gray-200 rounded-[20px] py-4 shadow-lg transition-all duration-300 active:border-b-0 active:translate-y-1 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[11px] font-black tracking-widest italic animate-pulse">VERIFYING...</span>
              </div>
            ) : (
              <>
                <FcGoogle className="w-6 h-6 group-hover:scale-110 transition-transform" /> 
                <span className="text-[11px] font-black tracking-[0.15em] uppercase">Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="mt-10 pt-6 border-t border-black/5 w-full flex justify-center">
          <Link 
            to="/login" 
            className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase hover:text-blue-600 transition-colors group"
          >
            <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>
        </div>
      </div>

      {/* Error Feedback Component */}
      <ErrorModal 
        isOpen={showError} 
        message={msg} 
        onClose={() => setShowError(false)} 
      />

      {/* Embedded Animation Definitions */}
      <style>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(30px) scale(0.95); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default SignupMethod;