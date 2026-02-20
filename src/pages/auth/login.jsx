import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../../components/common/authinput'; 
import Footer from '../../components/layout/footer';      
import ellaLogo from '../../assets/image.png';
import ErrorModal from "../../components/modals/errormodal"; // In-import ang modal

const Login = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  
  // STATE PARA SA ERROR MODAL
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = loginData;

    // KUNG WALANG INPUT
    if (!username || !password) {
      setShowErrorModal(true);
      return;
    }

    // LOGIN LOGIC
    if (username === "student" && password === "123") {
      navigate("/dashboard"); 
    } 
    else if (username === "admin" && password === "123") {
      navigate("/admin/dashboard"); 
    } 
    else {
      // KUNG MALI ANG CREDENTIALS, LABAS ANG MODAL
      setShowErrorModal(true);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#C1E1C1] flex flex-col items-center justify-center p-4 overflow-hidden font-sans relative">
      
      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        {/* Character Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 md:w-36 md:h-36 flex items-center justify-center mb-4">
            <img 
              src={ellaLogo} 
              alt="Ella Character" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h2 className="text-xs md:text-sm font-bold tracking-[0.3em] text-gray-700 uppercase">
            User Login
          </h2>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="w-full">
          <div className="space-y-4">
            {/* USERNAME INPUT */}
            <AuthInput 
              name="username" 
              value={loginData.username}
              onChange={handleChange}
              placeholder="USERNAME"
              icon="person"
              className="!bg-[#8DA674] shadow-inner border border-black/10 rounded-full"
            />

            {/* PASSWORD INPUT */}
            <div className="relative">
              <AuthInput 
                name="password"
                value={loginData.password}
                onChange={handleChange}
                placeholder="PASSWORD"
                icon="lock"
                isPassword={true}
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
                className="!bg-[#8DA674] shadow-inner border border-black/10 rounded-full"
              />
              
              {/* FORGOT PASSWORD */}
              <div className="flex justify-end w-full px-4 mt-2">
                <a href="#" className="text-[10px] italic text-[#3B82F6] font-semibold hover:underline">
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6 pt-8">
            {/* LOGIN BUTTON */}
            <button 
              type="submit"
              className="w-56 md:w-64 bg-[#A2BC56] text-gray-800 border-2 border-[#8da84a] rounded-full py-3 font-black text-xs md:text-sm tracking-[0.3em] hover:bg-[#b5cc74] transition-all active:scale-95 shadow-lg uppercase"
            >
              Login
            </button>
            
            <div className="text-center">
              <p className="text-[10px] md:text-xs text-[#3B82F6] font-medium">
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

      {/* --- ERROR MODAL COMPONENT --- */}
      <ErrorModal 
        isOpen={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        form { animation: fadeIn 0.6s ease-out; }
      `}} />
    </div>
  );
};

export default Login;