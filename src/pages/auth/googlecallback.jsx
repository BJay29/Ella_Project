import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * GoogleCallback Component
 * Flow: 
 * 1. Gmail Verified via SSO
 * 2. If New User -> Save Token -> Go to Register Form (to set password)
 * 3. If Existing User -> Clear Token -> Go to Login Page
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
      // --- REDIRECT LOGIC ---

      // CASE A: NEW USER (Verified Gmail, but no account yet)
      // FIX: Dapat i-save muna ang token bago mag-navigate para hindi harangin ng App.jsx
      if (String(isNewUser).toLowerCase() === 'true') {
        console.log("Action: NEW USER. Saving session and going to Register Form.");
        
        // IMPORTANT: I-save ang token para "Verified" na ang browser session mo
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);

        // Pumunta sa register at ipasa ang Google data
        navigate('/register', { 
          state: { 
            googleUser: { email, firstName, lastName } 
          },
          replace: true 
        });
      } 
      
      // CASE B: EXISTING ACCOUNT
      // Balik sa login dahil may password na dapat silang gamitin
      else {
        console.log("Action: EXISTING USER. Redirecting back to Login.");
        
        localStorage.clear();
        sessionStorage.clear();

        // Pinanatili ang dashboardPath logic for reference
        const dashboardPath = role === 'curriculum_manager' ? '/cm/dashboard' : `/${role}/dashboard`;
        console.log(`Target was ${dashboardPath}, but forcing Login.`);

        window.location.replace('/login?status=existing&stop=true');
      }

    } else {
      console.error("AUTH ERROR: No token received.");
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
          <p className="text-[10px] text-gray-500 italic mt-1">Checking if you need to register or login.</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;