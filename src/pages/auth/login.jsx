import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import ellaLogo from '../../assets/image.png'; 

const Login = () => {

  const navigate = useNavigate();

  const handleLogin = () => {
     navigate('/dashboard'); 
  };
  return (
    <div className="h-screen w-screen bg-white flex flex-col items-center justify-center p-4 overflow-hidden font-sans relative">
      
      {/* Container */}
      <div className="w-full max-w-[380px] flex flex-col items-center">
        

        <div className="flex flex-col items-center mb-4">
          <div className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center mb-1">
            <img 
              src={ellaLogo} 
              alt="Character" 
              className="w-full h-full object-contain" 
            />
          </div>
          <p className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-gray-800 uppercase pt-1">Student Login</p>
        </div>

        {/* Form Container */}
        <div className="w-full space-y-3">
          
          <div className="flex items-center bg-[#D9D9D9] border-[0.5px] border-black rounded-full overflow-hidden h-9 shadow-sm">
            <div className="w-10 md:w-12 flex items-center justify-center border-r-[0.5px] border-black/30 h-full">
              <span className="material-icons text-base md:text-lg text-black">person</span>
            </div>
            <input 
              type="text" 
              placeholder="USERNAME" 
              className="flex-1 px-4 bg-transparent text-[9px] md:text-[10px] font-bold tracking-[0.2em] outline-none placeholder:text-gray-500 w-full"
            />
          </div>

          <div className="flex items-center bg-[#D9D9D9] border-[0.5px] border-black rounded-full overflow-hidden h-9 shadow-sm">
            <div className="w-10 md:w-12 flex items-center justify-center border-r-[0.5px] border-black/30 h-full">
              <span className="material-icons text-base md:text-lg text-black">lock</span>
            </div>
            <input 
              type="password" 
              placeholder="PASSWORD" 
              className="flex-1 px-4 bg-transparent text-[9px] md:text-[10px] font-bold tracking-[0.2em] outline-none placeholder:text-gray-500 w-full"
            />
            <span className="material-icons text-sm md:text-base pr-4 text-gray-600 cursor-pointer">visibility</span>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-center w-full -mt-1">
            <a href="#" className="text-[8px] md:text-[9px] italic text-[#3B82F6] font-semibold hover:underline">
              Forgot Password?
            </a>
          </div>

          {/* Login Button Section */}
          <div className="flex flex-col items-center">
           <button 
           onClick={handleLogin}
            className="w-40 md:w-48 bg-[#D9D9D9] border-[0.5px] border-black rounded-full h-8.5 font-bold text-[10px] md:text-[11px] tracking-[0.3em] 
            mt-4 hover:bg-gray-300 transition-all active:scale-[0.98] shadow-sm uppercase"
          >
           Login
           </button>
            
            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <p className="text-[9px] md:text-[10px] text-[#3B82F6] font-medium">
                Don't have an account? <Link to="/register" className="font-bold cursor-pointer hover:underline ml-1">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-4 text-center px-4 w-full">
        <p className="text-[8px] md:text-[9px] text-gray-400 leading-tight max-w-[500px] mx-auto">
          An interactive language center is a system that engages students through active learning tools and encourages consistent language practice.
        </p>
      </div>

    </div>
  );
};

export default Login;