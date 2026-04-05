import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import ellaLogo from '../../assets/image.png';
import ErrorModal from "../../components/modals/errormodal";
import { authAPI } from '../../services/APIservice';

// Import React Icons
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'; 
import { FcGoogle } from 'react-icons/fc'; 

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
  const messages = [
    "HELLO!", 
    "WELCOME TO ELLA QUEST!", 
    "READY TO LEARN?", 
    "HAVE A GREAT DAY!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, []);

  // --- EFFECT PARA SA SSO ERROR MESSAGES ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const infoType = params.get('info');

    if (infoType === 'account_exists') {
      setErrorMessage("THIS ACCOUNT ALREADY EXISTS ON YOUR DEVICE! PLEASE LOGIN.");
      setShowErrorModal(true);
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    authAPI.ping();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

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
        const rawRole = data.role || data.user?.role || data.userRole || 'student';
        const normalizedRole = rawRole.toLowerCase().trim();

        localStorage.clear();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', normalizedRole);
        
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

  const handleGoogleLogin = () => {
    try {
      sessionStorage.setItem('sso_intent', 'login');
      authAPI.initiateGoogleLogin();
    } catch (error) {
      setErrorMessage("FAILED TO INITIATE GOOGLE LOGIN");
      setShowErrorModal(true);
    }
  };

  const autofillFix = {
    WebkitBoxShadow: "0 0 0px 1000px #7a9e50 inset",
    WebkitTextFillColor: "#ffffff",
  };

  return (
    <div className="h-screen w-screen bg-[#C8E6C0] flex flex-col items-center justify-center font-sans relative overflow-hidden p-4">
      
      {/* Background Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7a9e50]/10 rounded-full blur-3xl"></div>

      {/* --- LOGO AND SPEECH BUBBLE SECTION --- */}
      <div className="relative mb-10 flex flex-col items-center z-10">
        
        {/* SPEECH BUBBLE (The Cloud) */}
        <div className="absolute -top-12 -right-20 md:-right-24 bg-white px-5 py-2 rounded-2xl shadow-xl border-2 border-[#7a9e50] animate-bounce-subtle z-20">
          <p className="text-[10px] font-black text-[#7a9e50] tracking-widest whitespace-nowrap uppercase italic">
            {messages[messageIndex]}
          </p>
          {/* Bubble Tail */}
          <div className="absolute -bottom-2 left-3 w-4 h-4 bg-white border-r-2 border-b-2 border-[#7a9e50] rotate-45"></div>
        </div>

        {/* Character Logo - Pinalaki kunti */}
        <div className="relative group">
          <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full scale-110"></div>
          <img
            src={ellaLogo}
            alt="Ella Character"
            className="w-36 h-36 md:w-40 md:h-40 object-contain drop-shadow-2xl relative z-10 animate-float"
          />
        </div>

        {/* TEXT LOGO: ELLA QUEST */}
        <h1 className="mt-3 text-2xl md:text-3xl font-black tracking-[0.3em] text-[#5a7a35] drop-shadow-sm uppercase italic">
          ELLA QUEST
        </h1>
      </div>

      {/* --- FORM SECTION --- */}
      <div className="w-full max-w-[340px] flex flex-col relative z-10">
        
        {/* LOGIN TEXT - Inilipat sa Left at nasa itaas ng Fields */}
        <div className="w-full text-left mb-2 pl-2">
          <h2 className="text-[13px] font-black tracking-[0.4em] text-gray-700 uppercase inline-block relative">
            Login
            <span className="absolute -bottom-1 left-0 w-8 h-[3px] bg-[#7a9e50] rounded-full"></span>
          </h2>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
          
          {/* Email Input */}
          <div className="flex items-center bg-[#7a9e50] rounded-full overflow-hidden border border-[#5a7a35] shadow-md group transition-all focus-within:ring-2 focus-within:ring-white/50">
            <div className="pl-4 pr-2 py-3 flex items-center justify-center">
              <HiOutlineMail className="w-5 h-5 text-white opacity-90" />
            </div>
            <input
              name="email"
              type="email"
              value={loginData.email}
              onChange={handleChange}
              placeholder="EMAIL"
              style={autofillFix}
              className="flex-1 bg-[#7a9e50] px-2 py-3 text-white placeholder-white/60 font-bold text-[12px] tracking-widest outline-none"
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center bg-[#7a9e50] rounded-full overflow-hidden border border-[#5a7a35] shadow-md group transition-all focus-within:ring-2 focus-within:ring-white/50 relative">
            <div className="pl-4 pr-2 py-3 flex items-center justify-center">
              <HiOutlineLockClosed className="w-5 h-5 text-white opacity-90" />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={loginData.password}
              onChange={handleChange}
              placeholder="PASSWORD"
              style={autofillFix}
              className="flex-1 bg-[#7a9e50] px-2 py-3 text-white placeholder-white/60 font-bold text-[12px] tracking-widest outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pr-4 text-white/70 hover:text-white transition-all flex items-center justify-center outline-none"
              tabIndex="-1"
            >
              {showPassword ? (
                <HiOutlineEyeOff className="w-5 h-5" />
              ) : (
                <HiOutlineEye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end -mt-1 mr-2">
            <Link to="/forgot-password" text-size="small" className="text-[10px] italic text-[#3B82F6] font-bold hover:text-blue-500 transition-colors">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <div className="flex justify-center mt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#8aab45] hover:bg-[#9abb55] text-white border border-[#6a8a30] rounded-full py-3 font-black text-[12px] tracking-[0.3em] uppercase shadow-lg transition-all active:scale-95
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[#7a9e50]/40'}`} 
            >
              {isLoading ? '...' : 'LOGIN'}
            </button>
          </div>

          {/* Separator */}
          <div className="flex items-center my-2 w-full px-4">
            <div className="flex-grow border-t border-black/10"></div>
            <span className="px-3 text-[9px] text-gray-500 font-black whitespace-nowrap uppercase tracking-widest opacity-60">
              OR CONTINUE WITH
            </span>
            <div className="flex-grow border-t border-black/10"></div>
          </div>

          {/* Google SSO Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-100 rounded-full py-2.5 shadow-md transition-all active:scale-95"
            >
              <FcGoogle className="w-5 h-5" /> 
              <span className="text-[11px] font-black tracking-widest">GOOGLE</span>
            </button>
          </div>

          {/* Registration Redirect */}
          <div className="text-center mt-3">
            <p className="text-[10px] text-gray-600 font-bold tracking-tight">
              Don't have an Account?{' '}
              <Link 
                to="/signup" 
                className="text-[#3B82F6] font-black hover:underline cursor-pointer decoration-2"
              >
                Register Here
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Footer text */}
      <p className="absolute bottom-6 text-center text-[9px] text-gray-500 px-10 max-w-lg leading-relaxed font-bold opacity-60 uppercase tracking-tighter">
        An interactive language center engaging students through active learning tools and encouraging consistent language practice.
      </p>

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />

      {/* Required Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.03); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;