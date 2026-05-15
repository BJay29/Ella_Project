import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ErrorModal from "../../components/modals/errormodal";

/**
 * GoogleCallback Component
 * Handles the redirection after Google SSO.
 * Added Logic: Prevents existing users from "re-registering" and redirects them to login.
 */
const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialized = useRef(false);

  // Modal states for error handling
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    console.log("--- GOOGLE CALLBACK INITIATED ---");
    
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    const isNewUser = params.get('isNewUser') === 'true'; // Backend should ideally provide this
    
    const rawRole = params.get('role');
    const role = rawRole ? rawRole.toLowerCase().trim() : 'student';

    // Retrieve the intent set in SignupMethod or Login
    const intent = sessionStorage.getItem('sso_intent');

    console.log("Parsed SSO Data:", { hasToken: !!token, role, email, intent, isNewUser });

    if (token) {
      /**
       * REGISTRATION ATTEMPT LOGIC
       * If user clicked "Register Here" but the account already exists.
       * We check 'isNewUser' from backend. If backend doesn't provide it, 
       * we assume if they have a role assigned, they might already be registered.
       */
      if (intent === 'register' && !isNewUser) {
        console.warn("Registration Blocked: User already exists.");
        
        // Clear everything to ensure no ghost sessions
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to login with a specific error message
        navigate('/login?info=account_exists', { replace: true });
        return;
      }

      // --- PROCEED WITH AUTHENTICATION ---
      console.log("Authentication successful. Saving credentials...");

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);

      // Successfully logged in or registered, remove intent
      sessionStorage.removeItem('sso_intent');

      // Determine Dashboard Path
      let dashboardPath = `/${role}/dashboard`;

      if (role === 'curriculum_manager' || role === 'cm') {
        dashboardPath = '/cm/dashboard';
      } else if (role === 'instructor') {
        dashboardPath = '/instructor/dashboard';
      } else if (role === 'admin') {
        dashboardPath = '/admin/dashboard';
      } else if (role === 'student') {
        dashboardPath = '/student/dashboard';
      }

      console.log(`Action: Redirecting to ${role} dashboard.`);
      navigate(dashboardPath, { replace: true });

    } else {
      // --- ERROR HANDLING ---
      console.error("AUTH ERROR: No token received from Google SSO.");
      setErrorMsg("AUTHENTICATION FAILED. PLEASE TRY LOGGING IN AGAIN.");
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
        <div className="w-12 h-12 border-4 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-[11px] font-black tracking-widest text-gray-700 uppercase animate-pulse">
            {showError ? "Authentication Error" : "Synchronizing Access..."}
          </h2>
          <p className="text-[10px] text-gray-500 italic mt-1 font-bold">
            {showError ? "Something went wrong." : "Preparing your workspace, please wait."}
          </p>
        </div>
      </div>

      <ErrorModal 
        isOpen={showError} 
        title="Auth Failed"
        message={errorMsg} 
        onClose={handleModalClose} 
      />
    </div>
  );
};

export default GoogleCallback;