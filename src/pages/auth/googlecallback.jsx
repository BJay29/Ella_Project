import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * GoogleCallback Component
 * Flow: 
 * 1. Gmail Verified via SSO (Auth Server)
 * 2. If New User -> Save Token -> Go to Register Form (to set password)
 * 3. If Existing User -> Redirect to Login with "Account Exists" Info Modal signal
 */
const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("--- GOOGLE CALLBACK INITIATED ---");
    
    // 1. Extract parameters mula sa URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    const isNewUser = params.get('isNewUser'); 
    
    // Fallback para sa mga parameter names galing backend
    const firstName = params.get('firstName') || params.get('firstname');
    const lastName = params.get('lastName') || params.get('lastname');
    
    const rawRole = params.get('role') || 'student';
    const role = rawRole.toLowerCase().trim();

    console.log("Parsed SSO Data:", { hasToken: !!token, role, isNewUser, email });

    if (token) {
      const isNew = String(isNewUser).toLowerCase() === 'true';

      if (isNew) {
        // --- CASE A: NEW USER (Mula sa Signup Page) ---
        console.log("Action: NEW USER. Proceeding to Register Form.");
        
        // I-save ang token para sa registration step
        localStorage.setItem('token', token);
        // Tanggalin ang role muna para iwas auto-redirect ng PublicRoute sa App.js
        localStorage.removeItem('userRole'); 

        navigate('/register', { 
          state: { 
            googleUser: { email, firstName, lastName, role },
            isFromSSO: true 
          },
          replace: true 
        });
      } else {
        // --- CASE B: EXISTING ACCOUNT (FIXED FOR MODAL) ---
        // Ibig sabihin nag-Google Register siya pero may account na pala siya sa DB.
        console.log("Action: EXISTING USER detected. Redirecting to Login with Modal Signal.");
        
        // Siguraduhing malinis ang storage para hindi mag-auto login
        localStorage.clear();
        sessionStorage.clear();

        /**
         * DITO ANG SETTING NG MODAL:
         * I-redirect ang user pabalik sa login page na may URL parameter.
         * Ang parameter na '?info=account_exists' ay babasahin ng Login.jsx para i-trigger ang modal.
         */
        navigate('/login?info=account_exists', { replace: true });
      }

    } else {
      console.error("AUTH ERROR: No token received from Google SSO.");
      window.location.replace('/login');
    }
  }, [location, navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#C8E6C0]">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <div className="w-12 h-12 border-4 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-[11px] font-black tracking-widest text-gray-700 uppercase animate-pulse">
            Verifying Gmail...
          </h2>
          <p className="text-[10px] text-gray-500 italic mt-1">Checking records, please wait.</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;