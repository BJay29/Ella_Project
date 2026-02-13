import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../../components/common/authinput'; 
import Footer from '../../components/layout/footer';      
import ellaLogo from '../../assets/image.png';

const InstructorLoginPage = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: '', // Pinalitan ang 'email' ng 'username' para mag-match sa input fields mo
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = loginData;

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    // Temporary Instructor Credentials (katulad ng logic sa Student Login)
    if (username === "instructor" && password === "123") {
      alert("Instructor Login Successful!");
      navigate("/instructor/dashboard"); 
    } 
    else if (username === "admin" && password === "123") {
      alert("Admin Login Successful!");
      navigate("/admin/dashboard"); 
    } 
    else {
      alert("Invalid instructor username or password.");
    }
  };

  return (
    <div className="h-screen w-screen bg-[#C1E1C1] flex flex-col items-center justify-center p-4 overflow-hidden font-sans relative">
      
      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        {/* Character Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 md:w-36 md:h-36 flex items-center justify-center mb-4">
            <img 
              src={ellaLogo} 
              alt="Instructor Character" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h2 className="text-xs md:text-sm font-bold tracking-[0.3em] text-gray-700 uppercase">
            Instructor Login
          </h2>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          
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

          <div className="flex flex-col items-center space-y-6 pt-2">
            <div className="flex justify-center w-full">
              <a href="#" className="text-[10px] italic text-[#3B82F6] font-semibold hover:underline">
                Forgot Password?
              </a>
            </div>

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

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        form { animation: fadeIn 0.6s ease-out; }
      `}} />
    </div>
  );
};

export default InstructorLoginPage;