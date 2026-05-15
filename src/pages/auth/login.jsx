import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import ellaLogo from '../../assets/image.png';
import ErrorModal from "../../components/modals/errormodal";
import { authAPI } from '../../services/APIservice';

// Import React Icons
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'; 
import { FcGoogle } from 'react-icons/fc'; 

/**
 * LOGIN COMPONENT
 * Handles manual authentication for Instructors/Admins and 
 * provides an entry point for Student Google SSO and Registration.
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

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

  // --- SPEECH BUBBLE MESSAGES LOGIC ---
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedMessage, setDisplayedMessage] = useState("");
  const messages = [
    "HELLO!", 
    "WELCOME TO ELLA QUEST!", 
  ];

  // Typewriter effect logic for the Ella mascot speech bubble
  useEffect(() => {
    let currentText = messages[messageIndex];
    let charIndex = 0;
    setDisplayedMessage(""); 

    const typingInterval = setInterval(() => {
      setDisplayedMessage((prev) => {
        if (charIndex < currentText.length) {
          const nextChar = currentText.charAt(charIndex);
          charIndex++;
          return prev + nextChar;
        } else {
          clearInterval(typingInterval);
          return prev;
        }
      });
    }, 60); 

    return () => clearInterval(typingInterval);
  }, [messageIndex]);

  // Rotate through messages every 5 seconds
  useEffect(() => {
    const nextMessageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000); 
    return () => clearInterval(nextMessageInterval);
  }, []);

  // Listen for redirected error states (e.g., from SSO callback)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const infoType = params.get('info');

    if (infoType === 'account_exists') {
      setErrorMessage("THIS ACCOUNT ALREADY EXISTS ON YOUR DEVICE! PLEASE LOGIN.");
      setShowErrorModal(true);
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  // Wake up backend server on mount
  useEffect(() => {
    authAPI.ping();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  /**
   * HANDLE MANUAL LOGIN
   * Used by staff roles (Admin, Instructor, CM).
   */
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
        // --- CLEANUP BEFORE SAVING NEW SESSION ---
        localStorage.clear();
        sessionStorage.clear();

        const rawRole = data.role || data.user?.role || data.userRole || 'student';
        const normalizedRole = rawRole.toLowerCase().trim();

        // Save new authentication details
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', normalizedRole);
        localStorage.setItem('userEmail', email);
        
        // Dynamic redirection based on user privilege level
        if (normalizedRole === 'instructor') {
          navigate('/instructor/dashboard', { replace: true });
        } else if (normalizedRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (normalizedRole === 'curriculum_manager' || normalizedRole === 'cm') { 
          navigate('/cm/dashboard', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
      } else {
        setErrorMessage(data.message?.toUpperCase() || "INVALID EMAIL OR PASSWORD!");
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage("SERVER ERROR: CANNOT CONNECT TO BACKEND");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * HANDLE GOOGLE SSO LOGIN
   * Sets intent to 'login' so the GoogleCallback component knows
   * to treat the returning user as a login attempt, not a registration.
   */
  const handleGoogleLogin = () => {
    try {
      // Clear existing session to prevent token mixing
      localStorage.clear();
      
      // Set the intent for the callback logic
      sessionStorage.setItem('sso_intent', 'login');
      
      // Trigger redirect to Backend's Google Auth route
      authAPI.initiateGoogleLogin();
    } catch (error) {
      console.error("SSO Error:", error);
      setErrorMessage("FAILED TO INITIATE GOOGLE LOGIN");
      setShowErrorModal(true);
    }
  };

  // Browser Autofill Styling overrides
  const autofillFix = {
    WebkitBoxShadow: "0 0 0px 1000px #7a9e50 inset",
    WebkitTextFillColor: "#ffffff",
  };

  return (
    <div className="h-screen w-screen bg-[#C8E6C0] flex flex-col items-center justify-center font-sans relative overflow-hidden p-4">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7a9e50]/10 rounded-full blur-3xl"></div>

      {/* Mascot & Brand Section */}
      <div className="relative mb-6 flex flex-col items-center z-10">
        {/* Animated Speech Bubble */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-5 py-2 rounded-2xl shadow-xl border-2 border-[#7a9e50] animate-bounce-subtle z-20 min-w-[120px] flex justify-center items-center">
          <p className="text-[10px] font-black text-[#7a9e50] tracking-widest whitespace-nowrap uppercase italic min-h-[14px]">
            {displayedMessage}
            <span className="animate-pulse ml-0.5">|</span>
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-[#7a9e50] rotate-45"></div>
        </div>

        {/* Mascot Avatar Container */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/60 blur-xl rounded-full scale-110"></div>
          <div className="w-32 h-32 md:w-36 md:h-36 bg-white rounded-full border-4 border-[#7a9e50] shadow-2xl overflow-hidden flex items-center justify-center relative z-10 animate-float">
            <img
              src={ellaLogo}
              alt="Ella Mascot"
              className="w-[140%] h-[140%] object-cover object-top mt-8" 
            />
          </div>
        </div>

        <h1 className="mt-3 text-lg md:text-xl font-black tracking-[0.2em] text-[#5a7a35] drop-shadow-sm uppercase italic">
          ELLA QUEST
        </h1>
      </div>

      {/* Login Interface */}
      <div className="w-full max-w-[320px] flex flex-col relative z-10">
        <div className="w-full text-left mb-2 pl-2">
          <h2 className="text-[11px] font-black tracking-[0.3em] text-gray-700 uppercase inline-block relative">
            Login
            <span className="absolute -bottom-1 left-0 w-6 h-[2px] bg-[#7a9e50] rounded-full"></span>
          </h2>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-2.5">
          {/* Email Input Field */}
          <div className="flex items-center bg-[#7a9e50] rounded-full overflow-hidden border border-[#5a7a35] shadow-md focus-within:ring-2 focus-within:ring-white/50">
            <div className="pl-4 pr-2 py-2.5 flex items-center justify-center">
              <HiOutlineMail className="w-4 h-4 text-white opacity-90" />
            </div>
            <input
              name="email"
              type="email"
              value={loginData.email}
              onChange={handleChange}
              placeholder="EMAIL"
              style={autofillFix}
              className="flex-1 bg-[#7a9e50] px-2 py-2.5 text-white placeholder-white/60 font-bold text-[11px] tracking-widest outline-none"
              required
            />
          </div>

          {/* Password Input Field */}
          <div className="flex items-center bg-[#7a9e50] rounded-full overflow-hidden border border-[#5a7a35] shadow-md focus-within:ring-2 focus-within:ring-white/50 relative">
            <div className="pl-4 pr-2 py-2.5 flex items-center justify-center">
              <HiOutlineLockClosed className="w-4 h-4 text-white opacity-90" />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={loginData.password}
              onChange={handleChange}
              placeholder="PASSWORD"
              style={autofillFix}
              className="flex-1 bg-[#7a9e50] px-2 py-2.5 text-white placeholder-white/60 font-bold text-[11px] tracking-widest outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pr-4 text-white/70 hover:text-white transition-colors"
              tabIndex="-1"
            >
              {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
            </button>
          </div>

          {/* Recovery Link */}
          <div className="flex justify-end mr-2">
            <Link to="/forgot-password" title="Recover account access" className="text-[9px] italic text-[#3B82F6] font-bold hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#8aab45] hover:bg-[#9abb55] text-white border border-[#6a8a30] rounded-full py-2.5 font-black text-[11px] tracking-[0.2em] uppercase shadow-lg transition-all active:scale-95 mt-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isLoading ? '...' : 'LOGIN'}
          </button>

          {/* Visual Divider */}
          <div className="flex items-center my-1 w-full px-4">
            <div className="flex-grow border-t border-black/10"></div>
            <span className="px-3 text-[8px] text-gray-500 font-black opacity-60 uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-black/10"></div>
          </div>

          {/* Social Auth (SSO) Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center w-full bg-white hover:bg-gray-50 text-gray-600 border-2 border-gray-100 rounded-full p-0.5 shadow-md transition-all active:scale-95 overflow-hidden"
          >
            <div className="bg-white p-2 rounded-full">
              <FcGoogle className="w-4 h-4" /> 
            </div>
            <span className="flex-1 pr-8 text-[11px] font-medium font-sans text-gray-700 tracking-normal text-center">
              Continue with Google
            </span>
          </button>

          {/* NAVIGATION TO NEW REGISTRATION FLOW */}
          <div className="text-center mt-3">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              Don't have an account?{' '}
              <Link 
                to="/signup-method" 
                className="text-[#3B82F6] hover:text-[#2563EB] transition-colors underline decoration-1 underline-offset-2 font-black"
              >
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Footer Tagline */}
      <p className="absolute bottom-4 text-center text-[8px] text-gray-500 px-10 max-w-sm leading-tight font-bold opacity-50 uppercase tracking-tighter">
        An interactive language center engaging students through active learning tools and encouraging consistent practice.
      </p>

      {/* Error/Info Modal Component */}
      <ErrorModal isOpen={showErrorModal} message={errorMessage} onClose={() => setShowErrorModal(false)} />

      {/* UI Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
        html, body { 
          overflow: hidden; 
          height: 100%; 
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default Login;