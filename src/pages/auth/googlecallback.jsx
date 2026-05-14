import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ErrorModal from "../../components/modals/errormodal";

/**
 * GoogleCallback Component
 * Final Flow: 
 * 1. Receive SSO Token and User Data from Backend
 * 2. Save credentials to LocalStorage immediately
 * 3. Redirect directly to the appropriate Dashboard based on Role
 * Note: Registration is now handled silently by the Backend (Just-in-Time Provisioning)
 */
const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ref to prevent double execution in React Strict Mode
  const initialized = useRef(false);

  // Modal states for error handling
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Prevent double execution
    if (initialized.current) return;
    initialized.current = true;

    console.log("--- GOOGLE CALLBACK INITIATED ---");
    
    // 1. Extract parameters from URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    
    // Role extraction and normalization
    const rawRole = params.get('role');
    const role = rawRole ? rawRole.toLowerCase().trim() : 'student';

    console.log("Parsed SSO Data:", { hasToken: !!token, role, email });

    if (token) {
      // --- DIRECT ENTRY LOGIC ---
      // We no longer check if 'isNewUser' is true because registration is automatic.
      console.log("Authentication successful. Saving credentials...");

      // Store Authentication Data
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);

      // Clear temporary session intent if any exists
      sessionStorage.removeItem('sso_intent');

      // Determine Dashboard Path based on User Role
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
      
      // Redirect to the main application
      navigate(dashboardPath, { replace: true });

    } else {
      // --- ERROR HANDLING ---
      console.error("AUTH ERROR: No token received from Google SSO.");
      setErrorMsg("AUTHENTICATION FAILED. PLEASE TRY LOGGING IN AGAIN.");
      setShowError(true);
    }
  }, [location, navigate]);

  // Handler for closing the error modal
  const handleModalClose = () => {
    setShowError(false);
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#C8E6C0]">
      {/* Loading Spinner and Status UI */}
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

      {/* Error Modal Component */}
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