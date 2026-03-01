import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorModal from "../../components/modals/errormodal"; 
import { authAPI } from '../../services/authservice';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

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

    setIsLoading(true);

    try {
      const response = await authAPI.register(formData);
      const data = await response.json();

      if (response.ok) {
        setModalMessage(data.message?.toUpperCase() || "USER REGISTERED SUCCESSFULLY!");
        setShowSuccessModal(true);
      } else {
        // Papasok dito kung "Email already exists" o ibang validation error mula sa server
        setModalMessage(data.message?.toUpperCase() || "REGISTRATION FAILED");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error:", error);
      // Ito ang lalabas kapag offline ang Render server
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
              <input name="firstName" value={formData.firstName} onChange={handleChange} type="text" style={inputStyle} className="w-full border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px]" required />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold ml-1 italic uppercase">Last Name</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} type="text" style={inputStyle} className="w-full border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px]" required />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold ml-1 italic uppercase">Email Address</label>
            <input name="email" value={formData.email} onChange={handleChange} type="email" style={inputStyle} className="w-full border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px]" required />
          </div>

          <div className="flex flex-col relative">
            <label className="text-[10px] font-bold ml-1 uppercase">Password</label>
            <div className="relative">
              <input name="password" value={formData.password} onChange={handleChange} type={showPassword ? "text" : "password"} style={inputStyle} className="w-full border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px] pr-8" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40"><EyeIcon /></button>
            </div>
          </div>

          <div className="flex flex-col relative">
            <label className="text-[10px] font-bold ml-1 uppercase">Confirm Password</label>
            <div className="relative">
              <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type={showConfirmPassword ? "text" : "password"} style={inputStyle} className="w-full border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px] pr-8" required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40"><EyeIcon /></button>
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

      <FooterText />

      <SuccessModal isOpen={showSuccessModal} message={modalMessage} onClose={() => navigate('/login')} />
      <ErrorModal isOpen={showErrorModal} message={modalMessage} onClose={() => setShowErrorModal(false)} />
    </div>
  );
};

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const FooterText = () => (
  <div className="absolute bottom-6 w-full text-center px-10 hidden md:block">
    <p className="text-[10px] text-gray-700 max-w-2xl mx-auto leading-tight italic">
      An interactive language center is a system that engages students through active learning tools and encourages consistent language practice.
    </p>
  </div>
);

export default Register;