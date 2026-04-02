import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ellaLogo from '../../assets/image.png';
import ErrorModal from "../../components/modals/errormodal";
import { authAPI } from '../../services/APIservice';

// Import React Icons
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'; 
import { FcGoogle } from 'react-icons/fc'; 

const Login = () => {
  const navigate = useNavigate();

  // State for form inputs
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ping server on mount para magising ang Render (optional)
  useEffect(() => {
    authAPI.ping();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  // --- STANDARD EMAIL/PASSWORD LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginData;

    if (!email || !password) {
      setErrorMessage("PLEASE FILL IN ALL FIELDS");
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const data = await response.json();

      if (response.ok) {
        // 1. Kunin ang role mula sa iba't ibang posibleng key sa backend
        const rawRole = data.role || data.user?.role || data.userRole || 'student';
        const normalizedRole = rawRole.toLowerCase().trim();

        localStorage.clear();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', normalizedRole);
        
        console.log("LOGIN SUCCESSFUL!");
        console.log("Token Saved:", data.token ? "YES" : "NO");
        console.log("User Role:", normalizedRole);

        // 3. REDIRECT LOGIC
        if (normalizedRole === 'instructor') {
          navigate('/instructor/dashboard', { replace: true });
        } else if (normalizedRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (normalizedRole === 'curriculum_manager') { 
          navigate('/cm/dashboard', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
      } else {
        // Ipakita ang error message mula sa backend
        setErrorMessage(data.message?.toUpperCase() || "INVALID EMAIL OR PASSWORD!");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("SERVER ERROR: CANNOT CONNECT TO BACKEND");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // --- GOOGLE LOGIN LOGIC ---
  const handleGoogleLogin = () => {
    try {
      authAPI.initiateGoogleLogin();
    } catch (error) {
      console.error("Google Redirect Error:", error);
      setErrorMessage("FAILED TO INITIATE GOOGLE LOGIN");
      setShowErrorModal(true);
    }
  };

  const autofillFix = {
    WebkitBoxShadow: "0 0 0px 1000px #7a9e50 inset",
    WebkitTextFillColor: "#ffffff",
  };

  return (
    <div className="h-screen w-screen bg-[#C8E6C0] flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <div className="w-full max-w-[350px] flex flex-col items-center px-4">
        
        {/* Logo Section */}
        <div className="mb-2">
          <img
            src={ellaLogo}
            alt="Ella Character"
            className="w-32 h-32 object-contain drop-shadow-md"
          />
        </div>

        <h2 className="text-[10px] font-bold tracking-[0.3em] text-gray-700 uppercase mb-4">
          User Login
        </h2>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-2.5">
          
          {/* Email Input */}
          <div className="flex items-center bg-[#7a9e50] rounded-full overflow-hidden border border-[#5a7a35] shadow-inner">
            <div className="pl-4 pr-2 py-2 flex items-center justify-center">
              <HiOutlineMail className="w-4 h-4 text-white" />
            </div>
            <input
              name="email"
              type="email"
              value={loginData.email}
              onChange={handleChange}
              placeholder="EMAIL"
              style={autofillFix}
              className="flex-1 bg-[#7a9e50] px-2 py-2 text-white placeholder-white/70 font-bold text-[11px] tracking-widest outline-none"
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center bg-[#7a9e50] rounded-full overflow-hidden border border-[#5a7a35] shadow-inner relative">
            <div className="pl-4 pr-2 py-2 flex items-center justify-center">
              <HiOutlineLockClosed className="w-4 h-4 text-white" />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={loginData.password}
              onChange={handleChange}
              placeholder="PASSWORD"
              style={autofillFix}
              className="flex-1 bg-[#7a9e50] px-2 py-2 text-white placeholder-white/70 font-bold text-[11px] tracking-widest outline-none"
              className="flex-1 bg-[#7a9e50] px-4 py-3 text-white placeholder-white/70 font-bold text-sm tracking-widest outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pr-4 text-white/80 hover:text-white transition-all flex items-center justify-center"
              tabIndex="-1"
            >
              {showPassword ? (
                <HiOutlineEyeOff className="w-4 h-4 transition-transform active:scale-90" />
              ) : (
                <HiOutlineEye className="w-4 h-4 transition-transform active:scale-90" />
              )}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end -mt-1 mr-2">
            <Link to="/forgot-password" size="small" className="text-[9px] italic text-[#3B82F6] font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <div className="flex justify-center mt-1">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-40 bg-[#8aab45] hover:bg-[#9abb55] text-white border border-[#6a8a30] rounded-full py-2 font-black text-[11px] tracking-[0.2em] uppercase shadow-sm transition-all active:scale-95
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
            >
              {isLoading ? '...' : 'LOGIN'}
            </button>
          </div>

          {/* Separator */}
          <div className="flex items-center my-1 w-full px-4">
            <div className="flex-grow border-t border-black/10"></div>
            <span className="px-2 text-[8px] text-gray-500 font-bold whitespace-nowrap uppercase tracking-tighter">
              Or continue with
            </span>
            <div className="flex-grow border-t border-black/10"></div>
          </div>

          {/* Google SSO Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 w-36 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-full py-1.5 shadow-sm transition-all active:scale-95"
            >
              <FcGoogle className="w-4 h-4" /> 
              <span className="text-[11px] font-bold">Google</span>
            </button>
          </div>

          {/* Registration Redirect - IN-UPDATE ANG PATH AT CLASS */}
          <div className="text-center mt-1">
            <p className="text-[9px] text-[#3B82F6] font-medium">
              Don't have an Account?{' '}
              <Link 
                to="/signup" 
                className="relative z-50 font-bold hover:underline cursor-pointer"
              >
                Register Here
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Footer text */}
      <p className="absolute bottom-4 text-center text-[9px] text-gray-600 px-8 max-w-lg leading-tight font-medium opacity-80">
        An interactive language center is a system that engages students through active learning tools and encourages consistent language practice.
      </p>

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default Login;