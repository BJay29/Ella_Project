import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * GoogleCallback Component
 * Tagasalo ng data galing sa Google Auth redirect.
 * Kinukuha ang token at user info mula sa URL (query parameters).
 */
const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Kunin ang lahat ng parameters mula sa URL bar
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    
    // Support for parehong camelCase at lowercase mula sa backend
    const firstName = params.get('firstName') || params.get('firstname');
    const lastName = params.get('lastName') || params.get('lastname');
    
    // I-normalize ang role
    const rawRole = params.get('role') || 'student';
    const role = rawRole.toLowerCase().trim();
    
    const isNewUser = params.get('isNewUser'); 

    if (token) {
      // --- REDIRECT LOGIC ---
      
      // CASE A: EXISTING ACCOUNT (Dito nagkakaroon ng error dati)
      if (String(isNewUser).toLowerCase() === 'false') {
        console.log("Existing account detected. Clearing storage and forcing redirect to login...");
        
        // STEP 1: Siguraduhing BURADO ang lahat ng traces ng login
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        sessionStorage.clear();

        // STEP 2: Force hard refresh patungong login page.
        // Nagdagdag tayo ng query parameter (?status=existing) para harangin ng PublicRoute sa App.jsx
        window.location.href = '/login?status=existing';
      } 
      
      // CASE B: NEW USER (Bago pa lang magre-register)
      else if (String(isNewUser).toLowerCase() === 'true') {
        // I-save ang pansamantalang token para sa registration process
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        
        navigate('/register', { 
          state: { 
            googleUser: { email, firstName, lastName } 
          },
          replace: true 
        });
      }
    } else {
      // Kung walang token, balik sa login
      console.error("Auth Error: No token received from server.");
      window.location.href = '/login';
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