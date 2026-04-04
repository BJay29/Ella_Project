import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * GoogleCallback Component (FIXED)
 * Flow: 
 * 1. Gmail Verified via SSO.
 * 2. If New User -> Go to Register Form.
 * 3. If Existing User -> Direct to Dashboard (NO MODAL).
 */
const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("--- GOOGLE CALLBACK INITIATED ---");
    
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    const isNewUser = params.get('isNewUser'); 
    
    const firstName = params.get('firstName') || params.get('firstname');
    const lastName = params.get('lastName') || params.get('lastname');
    
    const rawRole = params.get('role') || 'student';
    const role = rawRole.toLowerCase().trim();

    if (token) {
      const isNew = String(isNewUser).toLowerCase() === 'true';

      if (isNew) {
        // --- CASE A: NEW USER (Galing sa Register/Signup) ---
        localStorage.setItem('token', token);
        localStorage.removeItem('userRole'); 

        navigate('/register', { 
          state: { googleUser: { email, firstName, lastName, role }, isFromSSO: true },
          replace: true 
        });
      } else {
        // --- CASE B: EXISTING USER (DIRECT LOGIN) ---
        // Dito natin aayusin. Imbes na itapon sa /login?info=account_exists,
        // i-save na natin ang token at role at dumeretso sa Dashboard.
        
        console.log("Action: EXISTING USER. Directing to Dashboard.");
        
        // 1. I-save ang session data
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);

        // 2. Tukuyin ang dashboard path
        const dashboardPath = role === 'curriculum_manager' 
          ? '/cm/dashboard' 
          : `/${role}/dashboard`;
          
        // 3. Navigate agad. Walang message modal na lalabas.
        navigate(dashboardPath, { replace: true });
      }

    } else {
      console.error("AUTH ERROR: No token received from Google SSO.");
      window.location.replace('/login');
    }
  }, [location, navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#C8E6C0]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-[11px] font-black tracking-widest text-gray-700 uppercase animate-pulse">
            Verifying Gmail...
          </h2>
          <p className="text-[10px] text-gray-500 italic mt-1">Directing you to your dashboard, please wait.</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;