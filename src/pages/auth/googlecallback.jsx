import React, { useEffect, useState } from 'react';
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

  // State para sa modal control sa loob ng callback page
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      // Mas safe na conversion ng string to boolean
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
        // --- CASE B: EXISTING ACCOUNT ---
        
        if (intent === 'register') {
          /**
           * SCENARIO: Nag-register pero may account na.
           * ACTION: Ipakita ang modal dito mismo sa screen na ito.
           */
          console.log("Action: EXISTING USER during registration. Showing Modal.");
          
          setErrorMsg("THIS ACCOUNT IS ALREADY EXIST TO YOUR DEVICE PLEASE LOGIN");
          setShowError(true);
          
          // Linisin ang data para hindi siya "authenticated" habang nakatitig sa modal
          localStorage.clear();
          sessionStorage.clear();
        } 
        else {
          /**
           * SCENARIO: Normal Login.
           * ACTION: Dashboard agad.
           */
          console.log("Action: EXISTING USER login. Directing to Dashboard.");
          
          localStorage.setItem('token', token);
          localStorage.setItem('userRole', role);
          sessionStorage.removeItem('sso_intent'); // Clean up

          // Determine Dashboard Path
          let dashboardPath = `/${role}/dashboard`;
          if (role === 'curriculum_manager' || role === 'cm') {
            dashboardPath = '/cm/dashboard';
          }
            
          navigate(dashboardPath, { replace: true });
        }
      }

    } else {
      // Kung walang token, ibig sabihin failed ang login sa Google or cancelled
      console.error("AUTH ERROR: No token received from Google SSO.");
      navigate('/login', { replace: true });
    }
  }, [location, navigate]); // Tanging location at navigate ang dependency

  // Handler para sa pag-close ng modal
  const handleModalClose = () => {
    setShowError(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#C8E6C0]">
      {/* Loading Spinner - mawawala ito kapag lumabas ang modal */}
      {!showError ? (
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h2 className="text-[11px] font-black tracking-widest text-gray-700 uppercase animate-pulse">
              Verifying Gmail...
            </h2>
            <p className="text-[10px] text-gray-500 italic mt-1 font-bold">
              Checking records, please wait.
            </p>
          </div>
        </div>
      ) : (
        /* Kapag showError is true, wala tayong ipapakita sa main div 
           dahil ang ErrorModal ay fixed/absolute overlay naman. 
        */
        null
      )}

      {/* Error Modal na lalabas muna bago mag-redirect */}
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