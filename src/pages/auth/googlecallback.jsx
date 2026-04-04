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
    
    // 1. Kunin ang lahat ng parameters mula sa URL bar
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    const isNewUser = params.get('isNewUser'); 
    
    // Support for both camelCase and lowercase mula sa backend
    const firstName = params.get('firstName') || params.get('firstname');
    const lastName = params.get('lastName') || params.get('lastname');
    
    // I-normalize ang role (gawing lowercase at tanggalin ang spaces)
    const rawRole = params.get('role') || 'student';
    const role = rawRole.toLowerCase().trim();

    console.log("Parsed Data:", { hasToken: !!token, role, isNewUser });

    if (token) {
      // I-save na agad ang session parameters
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);

      // --- REDIRECT LOGIC ---

      // CASE A: NEW USER (True)
      // Pupunta muna sa /register para sa extra details
      if (String(isNewUser).toLowerCase() === 'true') {
        console.log("Action: NEW USER. Redirecting to Register Page.");
        navigate('/register', { 
          state: { 
            googleUser: { email, firstName, lastName } 
          },
          replace: true 
        });
      } 
      
      // CASE B: EXISTING ACCOUNT (isNewUser === false)
      // Dito mo ipapalit yung bagong code: Direkta na sa Dashboard
      else {
        console.log("Action: EXISTING USER. Redirecting directly to Dashboard.");
        
        // I-determine ang tamang path base sa role
        const dashboardPath = role === 'curriculum_manager'
          ? '/cm/dashboard'
          : `/${role}/dashboard`;

        navigate(dashboardPath, { replace: true });
      }

    } else {
      // Kung walang token na natanggap, error ito
      console.error("AUTH ERROR: No token received from server.");
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#C8E6C0]">
      <div className="flex flex-col items-center gap-4">
        {/* Mas mabilis na Spinner para hindi mukhang stuck */}
        <div className="w-12 h-12 border-4 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-[11px] font-black tracking-widest text-gray-700 uppercase animate-pulse">
          Syncing Account...
        </h2>
        <p className="text-[10px] text-gray-500 italic">Verifying credentials, please wait.</p>
      </div>
    </div>
  );
};

export default GoogleCallback;