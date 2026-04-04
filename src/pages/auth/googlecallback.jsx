import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * GoogleCallback Component
 * Tagasalo ng data galing sa Google Auth redirect.
 */
const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("--- GOOGLE CALLBACK INITIATED ---");
    console.log("Current URL Search Params:", location.search);

    // 1. Kunin ang lahat ng parameters mula sa URL bar
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    
    // Support for both camelCase and lowercase from backend
    const firstName = params.get('firstName') || params.get('firstname');
    const lastName = params.get('lastName') || params.get('lastname');
    
    // I-normalize ang role (gawing lowercase at tanggalin ang spaces)
    const rawRole = params.get('role') || 'student';
    const role = rawRole.toLowerCase().trim();
    
    const isNewUser = params.get('isNewUser'); 

    console.log("Parsed Data:", { 
      hasToken: !!token, 
      email, 
      role, 
      isNewUser,
      firstName,
      lastName 
    });

    if (token) {
      console.log("Token detected. Processing redirect logic...");
      
      // --- REDIRECT LOGIC ---
      
      // CASE A: EXISTING ACCOUNT (isNewUser === false)
      if (String(isNewUser).toLowerCase() === 'false') {
        console.log("Action: EXISTING ACCOUNT. Clearing storage and redirecting to Login.");
        
        // 1. BURAHIN LAHAT AGAD
        localStorage.clear();
        sessionStorage.clear();
        console.log("Storage cleared.");

        // 2. HARD REDIRECT (Hindi navigate)
        console.log("Redirecting to: /login?status=existing&stop=true");
        window.location.replace('/login?status=existing&stop=true');
        return; 
      } 
      
      // CASE B: NEW USER (True)
      else if (String(isNewUser).toLowerCase() === 'true') {
        console.log("Action: NEW USER. Saving session and redirecting to Register.");
        
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        console.log("Session saved to localStorage.");
        
        navigate('/register', { 
          state: { 
            googleUser: { email, firstName, lastName } 
          },
          replace: true 
        });
      } else {
        console.warn("Unexpected 'isNewUser' value:", isNewUser);
      }
    } else {
      // Kung walang token na natanggap, error ito
      console.error("AUTH ERROR: No token received from server. Check backend redirect URL.");
      window.location.replace('/login');
    }
  }, [location, navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#C8E6C0]">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <div className="w-12 h-12 border-4 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-[11px] font-black tracking-widest text-gray-700 uppercase animate-pulse">
          Syncing Account...
        </h2>
        <p className="text-[10px] text-gray-500 italic">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
};

export default GoogleCallback;