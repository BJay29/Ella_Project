import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ErrorModal from "../../components/modals/errormodal"; // Import the modal

/**
 * GoogleCallback Component
 * Flow: 
 * 1. Gmail Verified via SSO (Auth Server)
 * 2. If New User -> Save Token -> Go to Register Form (to set password)
 * 3. If Existing User -> 
 * - If intent was 'register': Show Modal -> On Close -> Redirect to Login
 * - If intent was 'login': Direct to Dashboard
 */
const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ref to prevent double execution in React Strict Mode
  const initialized = useRef(false);

  // State para sa modal control sa loob ng callback page
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Prevent double execution
    if (initialized.current) return;
    initialized.current = true;

    console.log("--- GOOGLE CALLBACK INITIATED ---");
    
    // 1. Extract parameters mula sa URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    const isNewUser = params.get('isNewUser'); 
    
    // Fallback para sa mga parameter names galing backend
    const firstName = params.get('firstName') || params.get('firstname') || '';
    const lastName = params.get('lastName') || params.get('lastname') || '';
    
    // Kunin ang role
    const rawRole = params.get('role');
    const role = rawRole ? rawRole.toLowerCase().trim() : 'student';

    // Kunin ang intent (login or register)
    const intent = sessionStorage.getItem('sso_intent') || 'login';

    console.log("Parsed SSO Data:", { hasToken: !!token, role, isNewUser, email, intent });

    if (token) {
      const isNew = String(isNewUser).toLowerCase() === 'true';

      if (isNew) {
        // --- CASE A: NEW USER ---
        console.log("Action: NEW USER. Proceeding to Register Form.");
        
        localStorage.setItem('token', token);
        localStorage.removeItem('userRole'); 
        sessionStorage.removeItem('sso_intent'); 

        navigate('/register', { 
          state: { 
            googleUser: { email, firstName, lastName, role },
            isFromSSO: true 
          },
          replace: true 
        });
      } else {
        // --- CASE B: EXISTING ACCOUNT ---
        
        if (intent === 'register') {
          /**
           * SCENARIO: Sinubukang mag-register pero may account na.
           * FIX: Ipakita ang modal at WAG mag-navigate hangga't hindi naki-click ang Close.
           */
          console.log("Action: EXISTING USER during registration. Triggering Modal.");
          
          // IMPORTANT: Clear storage AGAD bago pa mag-render ang kahit ano
          localStorage.clear();
          sessionStorage.clear();

          setErrorMsg("THIS ACCOUNT IS ALREADY REGISTERED. PLEASE LOGIN TO YOUR ACCOUNT.");
          setShowError(true);
          
          // Gamit ang return para itigil ang script execution dito.
          return; 
        } 
        else {
          /**
           * SCENARIO: Normal Login.
           * ACTION: Dashboard agad base sa role.
           */
          console.log("Action: EXISTING USER login. Directing to Dashboard.");
          
          localStorage.setItem('token', token);
          localStorage.setItem('userRole', role);
          sessionStorage.removeItem('sso_intent');

          // Determine Dashboard Path
          let dashboardPath = `/${role}/dashboard`;
          if (role === 'curriculum_manager' || role === 'cm') {
            dashboardPath = '/cm/dashboard';
          } else if (role === 'instructor') {
            dashboardPath = '/instructor/dashboard';
          } else if (role === 'admin') {
            dashboardPath = '/admin/dashboard';
          }
            
          navigate(dashboardPath, { replace: true });
        }
      }

    } else {
      console.error("AUTH ERROR: No token received from Google SSO.");
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  // Handler para sa pag-close ng modal - Dito na mangyayari ang redirect sa Login
  const handleModalClose = () => {
    setShowError(false);
    // Linisin ulit para sigurado bago lumipat
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#C8E6C0]">
      {/* Loading Spinner - Mananatili ito habang hindi pa naki-click ang Close sa modal */}
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-[11px] font-black tracking-widest text-gray-700 uppercase animate-pulse">
            {showError ? "Action Required" : "Verifying Gmail..."}
          </h2>
          <p className="text-[10px] text-gray-500 italic mt-1 font-bold">
            {showError ? "Account already exists." : "Checking records, please wait."}
          </p>
        </div>
      </div>

      {/* Error Modal */}
      <ErrorModal 
        isOpen={showError} 
        title="Account Exists"
        message={errorMsg} 
        onClose={handleModalClose} 
      />
    </div>
  );
};

export default GoogleCallback;