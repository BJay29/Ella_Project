import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * GoogleCallback Component
 * Flow: 
 * 1. Gmail Verified via SSO (Auth Server)
 * 2. If New User -> Save Token -> Go to Register Form (to set password)
 * 3. If Existing User -> Clear Token -> Go to Login Page
 */
const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("--- GOOGLE CALLBACK INITIATED ---");
    
    // 1. Extract parameters from the URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    const isNewUser = params.get('isNewUser'); 
    
    // Handling possible variations of parameter names from backend
    const firstName = params.get('firstName') || params.get('firstname');
    const lastName = params.get('lastName') || params.get('lastname');
    
    const rawRole = params.get('role') || 'student';
    const role = rawRole.toLowerCase().trim();

    console.log("Parsed SSO Data:", { hasToken: !!token, role, isNewUser, email });

    if (token) {
      // --- REDIRECT LOGIC ---

      // CASE A: NEW USER (Gmail verified, but needs to set a password)
      // Save the token immediately so the App/ProtectedRoute recognizes the session
      if (String(isNewUser).toLowerCase() === 'true') {
        console.log("Action: NEW USER. Saving session and redirecting to Register Form.");
        
        // Save to localStorage for persistence
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);

        // Redirect to /register and pass the Google data via state
        // Added 'isFromSSO' as an extra flag for Register.jsx
        navigate('/register', { 
          state: { 
            googleUser: { email, firstName, lastName },
            isFromSSO: true 
          },
          replace: true 
        });
      } 
      
      // CASE B: EXISTING ACCOUNT
      // User already has a password, so we force them to the manual Login page.
      else {
        console.log("Action: EXISTING USER. Clearing temporary session and forcing Login.");
        
        // Wipe storage to prevent auto-login to dashboard
        localStorage.clear();
        sessionStorage.clear();

        // Dashboard path logic kept for logging/reference purposes
        const dashboardPath = role === 'curriculum_manager' 
          ? '/cm/dashboard' 
          : `/${role}/dashboard`;
          
        console.log(`Target dashboard would have been ${dashboardPath}. Redirecting to /login.`);

        // window.location.replace is used to break any React navigation loops
        window.location.replace('/login?status=existing&stop=true');
      }

    } else {
      // Handle cases where Google Auth fails or returns no token
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
          <p className="text-[10px] text-gray-500 italic mt-1">Checking account records, please wait.</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;