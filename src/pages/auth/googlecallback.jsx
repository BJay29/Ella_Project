import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * GoogleCallback Component
 * This is the "Landing Page" after Google is done authenticating the user.
 * It reads the token and user info from the URL parameters.
 */
const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Get the data from the URL (e.g., ?token=xyz&email=user@ncf.edu.ph)
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    const firstName = params.get('firstName');
    const lastName = params.get('lastName');
    const role = params.get('role')?.toLowerCase() || 'student';
    const isNewUser = params.get('isNewUser'); 

    if (token) {
      // 2. Save the session to LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);

      // 3. Logic: New user goes to Register, Old user goes to Dashboard
      if (isNewUser === 'true') {
        navigate('/register', { 
          state: { 
            googleUser: { email, firstName, lastName } 
          } 
        });
      } else {
        // Redirect to the correct dashboard based on role
        const dashboardPath = role === 'curriculum_manager' ? '/cm/dashboard' : `/${role}/dashboard`;
        navigate(dashboardPath, { replace: true });
      }
    } else {
      // If something went wrong (no token), send them back to login
      console.error("Auth Error: No token received from server.");
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#C8E6C0]">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Animation */}
        <div className="w-12 h-12 border-4 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-[11px] font-black tracking-widest text-gray-700 uppercase animate-pulse">
          Syncing Account...
        </h2>
      </div>
    </div>
  );
};

export default GoogleCallback;