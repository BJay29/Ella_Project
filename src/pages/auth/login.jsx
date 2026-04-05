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
      <div className="relative mb-6 flex flex-col items-center z-10">
        
        {/* SPEECH BUBBLE */}
        <div className="absolute top-0 -right-24 bg-white px-4 py-1.5 rounded-2xl shadow-xl border-2 border-[#7a9e50] animate-bounce-subtle z-20">
          <p className="text-[9px] font-black text-[#7a9e50] tracking-widest whitespace-nowrap uppercase italic">
            {messages[messageIndex]}
          </p>
          <div className="absolute -bottom-2 left-3 w-3 h-3 bg-white border-r-2 border-b-2 border-[#7a9e50] rotate-45"></div>
        </div>

        {/* Ella Face in Circle */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/60 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform"></div>
          <div className="w-32 h-32 md:w-36 md:h-36 bg-white rounded-full border-4 border-[#7a9e50] shadow-2xl overflow-hidden flex items-center justify-center relative z-10 animate-float">
            <img
              src={ellaLogo}
              alt="Ella Face"
              className="w-[140%] h-[140%] object-cover object-top mt-8" 
            />
          </div>
        </div>

        {/* TEXT LOGO: Small and Compact */}
        <h1 className="mt-3 text-lg md:text-xl font-black tracking-[0.2em] text-[#5a7a35] drop-shadow-sm uppercase italic">
          ELLA QUEST
        </h1>
      </div>

      {/* --- FORM SECTION --- */}
      <div className="w-full max-w-[320px] flex flex-col relative z-10">
        
        <div className="w-full text-left mb-2 pl-2">
          <h2 className="text-[11px] font-black tracking-[0.3em] text-gray-700 uppercase inline-block relative">
            Login
            <span className="absolute -bottom-1 left-0 w-6 h-[2px] bg-[#7a9e50] rounded-full"></span>
          </h2>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-2.5">
          
          {/* Email Input */}
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

          {/* Password Input */}
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
              className="pr-4 text-white/70 hover:text-white"
              tabIndex="-1"
            >
              {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end mr-2">
            <Link to="/forgot-password" className="text-[9px] italic text-[#3B82F6] font-bold hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#8aab45] hover:bg-[#9abb55] text-white border border-[#6a8a30] rounded-full py-2.5 font-black text-[11px] tracking-[0.2em] uppercase shadow-lg transition-all active:scale-95 mt-1 ${isLoading ? 'opacity-50' : ''}`}
          >
            {isLoading ? '...' : 'LOGIN'}
          </button>

          {/* Separator: Smaller Gap */}
          <div className="flex items-center my-1 w-full px-4">
            <div className="flex-grow border-t border-black/10"></div>
            <span className="px-3 text-[8px] text-gray-500 font-black opacity-60 uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-black/10"></div>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-100 rounded-full py-2 shadow-md transition-all active:scale-95"
          >
            <FcGoogle className="w-4 h-4" /> 
            <span className="text-[10px] font-black tracking-widest">GOOGLE</span>
          </button>

          {/* Registration Redirect */}
          <div className="text-center mt-2">
            <p className="text-[9px] text-gray-600 font-bold">
              Don't have an Account?{' '}
              <Link to="/signup" className="text-[#3B82F6] font-black hover:underline">
                Register Here
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Footer text */}
      <p className="absolute bottom-4 text-center text-[8px] text-gray-500 px-10 max-w-sm leading-tight font-bold opacity-50 uppercase tracking-tighter">
        An interactive language center engaging students through active learning tools and encouraging consistent practice.
      </p>

      <ErrorModal isOpen={showErrorModal} message={errorMessage} onClose={() => setShowErrorModal(false)} />

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
        html, body { overflow: hidden; height: 100%; }
      `}</style>
    </div>
  );
};

export default Login;