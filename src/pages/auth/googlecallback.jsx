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
    
    // Support for both camelCase and lowercase from backend
    const firstName = params.get('firstName') || params.get('firstname');
    const lastName = params.get('lastName') || params.get('lastname');
    
    // I-normalize ang role (gawing lowercase at tanggalin ang spaces)
    const rawRole = params.get('role') || 'student';
    const role = rawRole.toLowerCase().trim();
    
    const isNewUser = params.get('isNewUser'); 

    if (token) {
      // 2. I-save ang session details sa LocalStorage para sa ProtectedRoutes
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);

      // 3. REDIRECT LOGIC
      // Kung bagong user, ipasa ang details sa Register page para sa auto-fill
      if (String(isNewUser).toLowerCase() === 'true') {
        navigate('/register', { 
          state: { 
            googleUser: { email, firstName, lastName } 
          },
          replace: true 
        });
      } else {
        // Kung existing user, idiretso sa tamang dashboard
        let dashboardPath = '/login';

        // Role-based Path Mapping
        if (role === 'curriculum_manager' || role === 'cm') {
          dashboardPath = '/cm/dashboard';
        } else if (role === 'admin') {
          dashboardPath = '/admin/dashboard';
        } else if (role === 'instructor') {
          dashboardPath = '/instructor/dashboard';
        } else if (role === 'student') {
          dashboardPath = '/student/dashboard';
        } else {
          // Kung hindi kilala ang role, balik sa login
          console.warn("Unknown role received:", role);
          dashboardPath = '/login';
        }

        navigate(dashboardPath, { replace: true });
      }
    } else {
      // Kung walang token na natanggap, error ito (balik sa login)
      console.error("Auth Error: No token received from server.");
      navigate('/login', { replace: true });
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