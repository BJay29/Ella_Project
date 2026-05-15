import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ErrorModal from "../../components/modals/errormodal";

/**
 * GoogleCallback Component
 * * This component handles the redirection from Google SSO.
 * It extracts the JWT token, user role, and email from the URL parameters 
 * and saves them to localStorage for authentication.
 */
const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialized = useRef(false);

  // Modal states for error handling
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (initialized.current) return;
    initialized.current = true;

    console.log("--- GOOGLE CALLBACK INITIATED ---");
    
    // Parse the URL search parameters (e.g., ?token=...&email=...)
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    const isNewUser = params.get('isNewUser') === 'true';
    const rawRole = params.get('role');
    
    // Default to 'student' if no role is provided
    const role = rawRole ? rawRole.toLowerCase().trim() : 'student';

    // Retrieve the auth intent (login vs register) set in previous screens
    const intent = sessionStorage.getItem('sso_intent');

    // DEBUG: Check if data exists in URL
    console.log("Payload from Backend:", { 
        hasToken: !!token, 
        role, 
        email, 
        intent, 
        isNewUser,
        fullURL: window.location.href 
    });

    if (token) {
      /**
       * REGISTRATION LOGIC
       * If the student intended to register but the backend says the user is not new,
       * we prevent duplicate registration and redirect to login.
       */
      if (intent === 'register' && !isNewUser) {
        console.warn("Registration Blocked: User already exists in the system.");
        
        // Clear sessions to prevent partial auth states
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to login with information parameter
        navigate('/login?info=account_exists', { replace: true });
        return;
      }

      // --- AUTHENTICATION SUCCESS ---
      console.log("Authentication successful. Persisting credentials to LocalStorage.");

      // CRITICAL: Save the token for API calls
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);

      // Remove temporary intent
      sessionStorage.removeItem('sso_intent');

      // Determine the correct dashboard based on user role
      let dashboardPath = '/student/dashboard'; // Default

      if (role === 'curriculum_manager' || role === 'cm') {
        dashboardPath = '/cm/dashboard';
      } else if (role === 'instructor') {
        dashboardPath = '/instructor/dashboard';
      } else if (role === 'admin') {
        dashboardPath = '/admin/dashboard';
      } else if (role === 'student') {
        dashboardPath = '/student/dashboard';
      }

      console.log(`Action: Authorized. Redirecting to ${role} workspace...`);
      
      // Delay slightly to ensure localStorage is written before navigation
      setTimeout(() => {
          navigate(dashboardPath, { replace: true });
      }, 100);

    } else {
      /**
       * ERROR: No Token Found
       * If the backend redirected here without a token, the student cannot join sections.
       */
      console.error("AUTH ERROR: No JWT token received from Backend SSO handler.");
      setErrorMsg("AUTHENTICATION FAILED: NO SESSION TOKEN RECEIVED. PLEASE CONTACT SUPPORT OR TRY MANUAL LOGIN.");
      setShowError(true);
    }
  }, [location, navigate]);

  const handleModalClose = () => {
    setShowError(false);
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#C8E6C0]">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
        {/* Loading Spinner */}
        <div className="w-12 h-12 border-4 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
        
        <div className="text-center">
          <h2 className="text-[11px] font-black tracking-widest text-gray-700 uppercase animate-pulse">
            {showError ? "Authentication Error" : "Synchronizing Access..."}
          </h2>
          <p className="text-[10px] text-gray-500 italic mt-1 font-bold">
            {showError ? "Please check your network connection." : "Preparing your workspace, please wait."}
          </p>
        </div>
      </div>

      {/* Reusable Error Modal */}
      <ErrorModal 
        isOpen={showError} 
        title="Authentication Failed"
        message={errorMsg} 
        onClose={handleModalClose} 
      />
    </div>
  );
};

export default GoogleCallback;