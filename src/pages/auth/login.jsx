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

    // Temporary hardcoded authentication
    if (email === "student" && password === "123") {
      navigate("/dashboard"); // Student dashboard
    } 
    else if (email === "admin" && password === "123") {
      navigate("/admin/dashboard"); // Admin dashboard
    } 
    else {
      alert("Invalid email or password.");
    }
  };

  return (
    <div className="h-screen w-screen bg-white flex flex-col items-center justify-center p-4 overflow-hidden font-sans relative">
      
      {/* Logo Section */}
      <div className="w-full max-w-[380px] flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center mb-1">
            <img 
              src={ellaLogo} 
              alt="Character" 
              className="w-full h-full object-contain" 
            />
          </div>
          <p className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-gray-800 uppercase pt-1">
            Student Login
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          
          <AuthInput 
            name="email"
            value={loginData.email}
            onChange={handleChange}
            placeholder="EMAIL"
            icon="person" 
          />

          <AuthInput 
            name="password"
            value={loginData.password}
            onChange={handleChange}
            placeholder="PASSWORD"
            isPassword={true}
            showPassword={showPassword}
            togglePassword={() => setShowPassword(!showPassword)}
            icon="lock"
          />

          {/* Links and Buttons */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex justify-center w-full -mt-2">
              <a href="#" className="text-[8px] md:text-[9px] italic text-[#3B82F6] font-semibold hover:underline">
                Forgot Password?
              </a>
            </div>

            <button 
              type="submit"
              className="w-40 md:w-48 bg-[#D9D9D9] border-[0.5px] border-black rounded-full h-9 font-bold text-[10px] md:text-[11px] tracking-[0.3em] hover:bg-gray-300 transition-all active:scale-[0.98] shadow-sm uppercase"
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
