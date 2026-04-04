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
      // --- REDIRECT LOGIC ---

      // CASE A: NEW USER (True)
      // Gmail is verified via SSO pero wala pang account sa DB, kaya ididiretso sa Register Form para sa password.
      if (String(isNewUser).toLowerCase() === 'true') {
        console.log("Action: NEW USER. Gmail Verified. Redirecting to Register Page for password setup.");
        
        // I-save ang token at role para sa registration session
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);

        navigate('/register', { 
          state: { 
            googleUser: { email, firstName, lastName } 
          },
          replace: true 
        });
      } 
      
      // CASE B: EXISTING ACCOUNT (isNewUser === false)
      // Gmail is verified pero may account na, kaya babalik sa login para sa manual password entry.
      else {
        console.log("Action: EXISTING USER. Redirecting back to Login as requested.");
        
        // 1. Siguraduhing malinis ang storage para hindi mag-auto-login sa dashboard
        localStorage.clear();
        sessionStorage.clear();

        // 2. Navigation logic reference (pinanatili gaya ng hiling mo)
        const dashboardPath = role === 'curriculum_manager'
          ? '/cm/dashboard'
          : `/${role}/dashboard`;

        console.log(`User belongs to ${dashboardPath}, but forcing logout/redirect to Login.`);

        // 3. Hard redirect sa login page para putulin ang auto-redirect flow
        window.location.replace('/login?status=existing&stop=true');
      }

    } else {
      // Kung walang token na natanggap, balik sa login
      console.error("AUTH ERROR: No token received from server.");
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
          <p className="text-[10px] text-gray-500 italic mt-1">Checking account status, please wait.</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;