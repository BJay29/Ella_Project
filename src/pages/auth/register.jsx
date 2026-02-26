import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://ellaquest-backend.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
          // Hindi na isinama ang confirmPassword sa payload
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful!");
        navigate('/login');
      } else {
        alert(data.message || "Registration Failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#D1EED1] flex flex-col items-center justify-center font-sans overflow-hidden p-2 relative text-gray-800">
      
      {/* Title Section */}
      <div className="static lg:absolute lg:left-[12%] lg:top-1/2 lg:-translate-y-1/2 mb-4 lg:mb-0">
        <h1 className="text-3xl md:text-5xl font-normal tracking-[0.1em] uppercase">
          Ella Quest
        </h1>
      </div>

      {/* REGISTRATION BOX */}
      <div className="w-full max-w-[400px] lg:absolute lg:right-[10%] lg:top-1/2 lg:-translate-y-1/2 bg-[#B8DBB8] border-[0.5px] border-black/30 rounded-xl p-6 shadow-md">
        <h2 className="text-center font-semibold text-[16px] tracking-widest mb-6 uppercase">
          Create Account
        </h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold ml-1 italic uppercase">First Name</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px]" required />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold ml-1 italic uppercase">Last Name</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px]" required />
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold ml-1 italic uppercase">Email Address</label>
            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px]" required />
          </div>

          {/* Password Field */}
          <div className="flex flex-col relative">
            <label className="text-[10px] font-bold ml-1 uppercase">Password</label>
            <div className="relative">
              <input 
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"} 
                className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px] pr-8" 
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40">
                <EyeIcon />
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col relative">
            <label className="text-[10px] font-bold ml-1 uppercase">Confirm Password</label>
            <div className="relative">
              <input 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                type={showConfirmPassword ? "text" : "password"} 
                className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-8 px-3 outline-none text-[11px] pr-8" 
                required
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40">
                <EyeIcon />
              </button>
            </div>
          </div>

          {/* Action Button */}
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
    </div>
  );
};

// Small Helper Components to keep the main code clean
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