import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../../components/common/authinput'; 
import Footer from '../../components/layout/footer';      
import ellaLogo from '../../assets/image.png';

const Login = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { email, password } = loginData;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    if (email === "student" && password === "123") {
      navigate("/dashboard"); 
    } 
    else if (email === "admin" && password === "123") {
      navigate("/admin/dashboard"); 
    } 
    else {
      alert("Invalid email or password.");
    }
  };

  return (
    <div className="h-screen w-screen bg-[#C1E1C1] flex flex-col items-center justify-center p-4 overflow-hidden font-sans relative">
      
    
      <div className="w-full max-w-[350px] flex flex-col items-center">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center mb-4 transition-transform hover:scale-105">
            <img 
              src={ellaLogo} 
              alt="Ella Character" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h2 className="text-[9px] md:text-[10px] font-bold tracking-[0.4em] text-gray-700 uppercase">
            User Login
          </h2>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="w-full space-y-3">
          
          {/* USERNAME INPUT - Slimmer version */}
          <div className="bg-[#7A9A65] rounded-full flex items-center p-[2px] shadow-md border border-black/10">
             {/* Maliit na white circle (h-9 w-9) */}
             <div className="bg-white rounded-full w-9 h-9 flex items-center justify-center ml-1 shadow-sm shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
             </div>
             {/* Manipis na separator */}
             <div className="h-6 w-[1px] bg-black/30 mx-3"></div>
             <AuthInput 
                name="email"
                value={loginData.email}
                onChange={handleChange}
                placeholder="USERNAME"
                className="bg-transparent text-black placeholder-black/50 border-none w-full py-2 focus:outline-none text-[11px] tracking-widest font-bold"
             />
          </div>

          {/* PASSWORD INPUT - Slimmer version */}
          <div className="bg-[#7A9A65] rounded-full flex items-center p-[2px] shadow-md border border-black/10 relative">
             <div className="bg-white rounded-full w-9 h-9 flex items-center justify-center ml-1 shadow-sm shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
             </div>
             <div className="h-6 w-[1px] bg-black/30 mx-3"></div>
             <AuthInput 
                name="password"
                value={loginData.password}
                onChange={handleChange}
                placeholder="PASSWORD"
                isPassword={!showPassword}
                className="bg-transparent text-black placeholder-black/50 border-none w-full py-2 focus:outline-none text-[11px] tracking-widest font-bold"
             />
             <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 text-black/70 hover:scale-110 transition-transform"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
             </button>
          </div>

          <div className="flex flex-col items-center space-y-5 pt-4">
            <div className="flex justify-center w-full">
              <a href="#" className="text-[9px] italic text-[#3B82F6] font-semibold hover:underline tracking-tight">
                Forgot Password?
              </a>
            </div>

            <button 
              type="submit"
              className="w-48 md:w-52 bg-[#A2BC56] text-gray-800 border-2 border-black/5 rounded-full py-2.5 font-black text-[11px] tracking-[0.3em]
               hover:bg-[#b5cc74] transition-all active:scale-95 shadow-lg uppercase"
            >
              Login
            </button>
            
            <div className="text-center">
              <p className="text-[9px] md:text-[10px] text-[#3B82F6] font-medium">
                Don't have an account? 
                <Link to="/register" className="font-bold cursor-pointer hover:underline ml-1">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default Login;