import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ErrorModal from "../../components/modals/errormodal"; 
import { authAPI } from '../../services/APIservice';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

// --- SUCCESS MODAL COMPONENT ---
const SuccessModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#D1EED1] border-2 border-[#8da84a] rounded-3xl p-8 max-w-[340px] w-full flex flex-col items-center shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-[#A2BC56] rounded-full flex items-center justify-center mb-4 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-[#2d3a1a] font-black text-xl tracking-widest uppercase mb-2">Success!</h3>
        <p className="text-[#4a5d2e] text-[12px] font-bold text-center leading-tight uppercase mb-6 italic px-2">{message}</p>
        <button 
          onClick={onClose}
          className="w-full bg-[#A2BC56] hover:bg-[#b5cc74] text-gray-800 border-2 border-[#8da84a] rounded-full py-2 font-black text-xs tracking-widest transition-all active:scale-95 shadow-md uppercase"
        >
          Proceed to Login
        </button>
      </div>
    </div>
  );
};

// --- MAIN REGISTER COMPONENT ---
const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Get sso_token from URL (if present)
  const params = new URLSearchParams(location.search);
  const ssoToken = params.get('sso_token');

  // 2. Get data from location.state (from GoogleCallback redirect)
  const googleData = location.state?.googleUser;
  
  // 3. Get token from localStorage (as saved by GoogleCallback)
  const storedToken = localStorage.getItem('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [formData, setFormData] = useState({
    firstName: googleData?.firstName || "",
    lastName: googleData?.lastName || "",
    email: googleData?.email || location.state?.verifiedEmail || "",
    password: '',
    confirmPassword: ''
  });

  // Pre-fill logic and security check
  useEffect(() => {
    // If coming via sso_token in URL (Manual or legacy flow)
    if (ssoToken) {
      try {
        const base64Payload = ssoToken.split('.')[1];
        const decoded = JSON.parse(atob(base64Payload));
        setFormData(prev => ({
          ...prev,
          firstName: decoded.first_name || decoded.firstName || '',
          lastName: decoded.last_name || decoded.lastName || '',
          email: decoded.email || ''
        }));
      } catch (err) {
        console.error('Failed to decode SSO token:', err);
      }
    } 
    // If no data is present at all, send them back to signup to start over
    else if (!googleData && !location.state?.verifiedEmail) {
      console.warn("No verified data found. Redirecting to signup.");
      navigate('/signup', { replace: true });
    }
  }, [ssoToken, googleData, location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setModalMessage("PASSWORDS DO NOT MATCH!");
      setShowErrorModal(true);
      return;
    }

    if (formData.password.length < 6) {
      setModalMessage("PASSWORD MUST BE AT LEAST 6 CHARACTERS!");
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      let response, data;
      const activeToken = ssoToken || storedToken;

      // Check if we are using an SSO flow (Google)
      if (activeToken && (googleData || ssoToken)) {
        console.log("Registering via SSO flow...");
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/register-sso`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sso_token: activeToken, 
            password: formData.password 
          })
        });
        data = await response.json();
      } else {
        // Manual registration flow
        response = await authAPI.register(formData);
        data = await response.json();
      }

      if (response.ok) {
        // Clear temp token after successful registration
        localStorage.removeItem('token');
        setModalMessage("ACCOUNT CREATED SUCCESSFULLY! YOU CAN NOW LOG IN.");
        setShowSuccessModal(true);
      } else {
        const serverMsg = data.message?.toUpperCase() || "";
        if (response.status === 409 || serverMsg.includes("EXISTS") || serverMsg.includes("ALREADY")) {
          setModalMessage("EMAIL ALREADY REGISTERED. PLEASE LOG IN INSTEAD.");
        } else {
          setModalMessage(serverMsg || "REGISTRATION FAILED. PLEASE TRY AGAIN.");
        }
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      setModalMessage("COULD NOT CONNECT TO SERVER. PLEASE TRY AGAIN LATER.");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    WebkitBoxShadow: "0 0 0px 1000px #A5C9A5 inset",
    WebkitTextFillColor: "#1f2937",
    backgroundColor: "transparent"
  };

  return (
    <div className="h-screen w-screen bg-[#D1EED1] flex flex-col items-center justify-center font-sans overflow-hidden p-2 relative text-gray-800">
      
      <div className="static lg:absolute lg:left-[12%] lg:top-1/2 lg:-translate-y-1/2 mb-4 lg:mb-0">
        <h1 className="text-3xl md:text-5xl font-normal tracking-[0.1em] uppercase">Ella Quest</h1>
      </div>

      <div className="w-full max-w-[400px] lg:absolute lg:right-[10%] lg:top-1/2 lg:-translate-y-1/2 bg-[#B8DBB8] border-[0.5px] border-black/30 rounded-xl p-6 shadow-md">
        <h2 className="text-center font-semibold text-[16px] tracking-widest mb-6 uppercase">Create Account</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold ml-1 italic uppercase">First Name</label>
              <input 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                type="text" 
                style={inputStyle} 
                className="w-full border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px]" 
                readOnly={!!googleData || !!ssoToken}
                required 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold ml-1 italic uppercase">Last Name</label>
              <input 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                type="text" 
                style={inputStyle} 
                className="w-full border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px]" 
                readOnly={!!googleData || !!ssoToken}
                required 
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold ml-1 italic uppercase text-gray-600">Email Address (Verified)</label>
            <input 
              name="email" 
              value={formData.email} 
              readOnly 
              type="email" 
              style={{...inputStyle, WebkitTextFillColor: "#4b5563"}} 
              className="w-full border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px] bg-black/5 cursor-not-allowed font-bold" 
              required 
            />
          </div>

          {/* Password */}
          <div className="flex flex-col relative">
            <label className="text-[10px] font-bold ml-1 uppercase">Password</label>
            <div className="relative">
              <input 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                type={showPassword ? "text" : "password"} 
                style={inputStyle} 
                className="w-full border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px] pr-8" 
                required 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black">
                {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col relative">
            <label className="text-[10px] font-bold ml-1 uppercase">Confirm Password</label>
            <div className="relative">
              <input 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                type={showConfirmPassword ? "text" : "password"} 
                style={inputStyle} 
                className="w-full border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px] pr-8" 
                required 
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black">
                {showConfirmPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-2 bg-[#D9D9D9] border-[1px] border-black rounded-lg text-[12px] font-bold hover:bg-white transition-all shadow-sm uppercase active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
            <p className="text-[10px] text-blue-600 mt-4 font-bold uppercase">
              Already have an Account? <Link to="/login" className="hover:underline ml-1">Log in</Link>
            </p>
          </div>
        </form>
      </div>

      <div className="absolute bottom-6 w-full text-center px-10 hidden md:block">
        <p className="text-[10px] text-gray-700 max-w-2xl mx-auto leading-tight italic">
          An interactive language center is a system that engages students through active learning tools and encourages consistent language practice.
        </p>
      </div>

      <SuccessModal isOpen={showSuccessModal} message={modalMessage} onClose={() => navigate('/login')} />
      <ErrorModal isOpen={showErrorModal} message={modalMessage} onClose={() => setShowErrorModal(false)} />
    </div>
  );
};

export default Register;