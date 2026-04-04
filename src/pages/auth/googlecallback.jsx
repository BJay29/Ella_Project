import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * GoogleCallback Component
 * Flow: 
 * 1. Gmail Verified via SSO (Auth Server)
 * 2. If New User -> Save Token -> Go to Register Form (to set password)
 * 3. If Existing User -> 
 * - If intent was 'register': Redirect to Login with "Account Exists" Modal signal
 * - If intent was 'login': Direct to Dashboard
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

    // Kunin ang intent (login or register) na sinet natin sa Login.jsx o Signup.jsx
    const intent = sessionStorage.getItem('sso_intent') || 'login';

    console.log("Parsed SSO Data:", { hasToken: !!token, role, isNewUser, email, intent });

    if (token) {
      const isNew = String(isNewUser).toLowerCase() === 'true';

      if (isNew) {
        // --- CASE A: NEW USER (Mula sa Signup Page) ---
        console.log("Action: NEW USER. Proceeding to Register Form.");
        
        localStorage.setItem('token', token);
        localStorage.removeItem('userRole'); 
        sessionStorage.removeItem('sso_intent'); // Clean up

        navigate('/register', { 
          state: { 
            googleUser: { email, firstName, lastName, role },
            isFromSSO: true 
          },
          replace: true 
        });
      } else {
        // --- CASE B: EXISTING ACCOUNT (FIXED LOGIC) ---
        
        if (intent === 'register') {
          /**
           * SCENARIO: Nag-click ng "Continue with Google" sa Signup/Register page pero may account na.
           * ACTION: Ibalik sa Login Page at magpasa ng 'info=account_exists' para lumabas ang Modal.
           */
          console.log("Action: EXISTING USER during registration. Redirecting to Login with Modal Signal.");
          
          localStorage.clear();
          sessionStorage.clear();

          // Ang URL parameter na ito ang babasahin ng Login.jsx para ipakita ang ErrorModal
          navigate('/login?info=account_exists', { replace: true });
        } 
        else {
          /**
           * SCENARIO: Normal Login gamit ang Google mula sa Login page.
           * ACTION: Direct to Dashboard agad (No modal stops).
           */
          console.log("Action: EXISTING USER login. Directing to Dashboard.");
          
          localStorage.setItem('token', token);
          localStorage.setItem('userRole', role);
          sessionStorage.removeItem('sso_intent'); // Clean up

          const dashboardPath = role === 'curriculum_manager' 
            ? '/cm/dashboard' 
            : `/${role}/dashboard`;
            
          navigate(dashboardPath, { replace: true });
        }
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