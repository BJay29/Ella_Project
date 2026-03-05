import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../../components/common/authinput';
import ellaLogo from '../../assets/image.png';
import ErrorModal from "../../components/modals/errormodal";
import { authAPI } from '../../services/authservice';

const Login = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      console.log("Backend Response:", data);

      if (response.ok) {
        const rawRole = data.role || data.user?.role || data.userRole || 'student';
        const normalizedRole = rawRole.toLowerCase().trim();

        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', normalizedRole);

        console.log("Login Success! Role saved as:", normalizedRole);

        if (normalizedRole === 'instructor') {
          navigate('/instructor/dashboard', { replace: true });
        } else if (normalizedRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
      } else {
        setErrorMessage(data.message?.toUpperCase() || "INVALID EMAIL OR PASSWORD!");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("SERVER ERROR: CANNOT CONNECT TO BACKEND");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const autofillFix = {
    WebkitBoxShadow: "0 0 0px 1000px #7a9e50 inset",
    WebkitTextFillColor: "#ffffff",
  };

  return (
    <div className="h-screen w-screen bg-[#C8E6C0] flex flex-col items-center justify-center font-sans relative overflow-hidden">

      {/* Center Card */}
      <div className="w-full max-w-[420px] flex flex-col items-center px-6">

        {/* Avatar */}
        <div className="mb-3">
          <img
            src={ellaLogo}
            alt="Ella Character"
            className="w-44 h-44 object-contain drop-shadow-md"
          />
        </div>

        {/* Title */}
        <h2 className="text-sm font-bold tracking-[0.25em] text-gray-700 uppercase mb-5">
          User Login
        </h2>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">

          {/* Email Input */}
          <div className="flex items-center bg-[#7a9e50] rounded-full overflow-hidden border border-[#5a7a35] shadow-inner">
            <div className="px-4 py-3 flex items-center justify-center border-r border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <input
              name="email"
              type="email"
              value={loginData.email}
              onChange={handleChange}
              placeholder="USERNAME"
              style={autofillFix}
              className="flex-1 bg-[#7a9e50] px-4 py-3 text-white placeholder-white/70 font-bold text-sm tracking-widest outline-none"
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center bg-[#7a9e50] rounded-full overflow-hidden border border-[#5a7a35] shadow-inner">
            <div className="px-4 py-3 flex items-center justify-center border-r border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6A5 5 0 007 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3.1-9H8.9V6a3.1 3.1 0 016.2 0v2z"/>
              </svg>
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={loginData.password}
              onChange={handleChange}
              placeholder="PASSWORD"
              style={autofillFix}
              className="flex-1 bg-[#7a9e50] px-4 py-3 text-white placeholder-white/70 font-bold text-sm tracking-widest outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-4 py-3 text-white/80 hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end -mt-1">
            <a href="#" className="text-[11px] italic text-[#3B82F6] font-semibold hover:underline">
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <div className="flex justify-center mt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-52 bg-[#8aab45] hover:bg-[#9abb55] text-white border border-[#6a8a30] rounded-full py-3 font-black text-sm tracking-[0.3em] uppercase shadow-md transition-all active:scale-95
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : 'LOGIN'}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-1">
            <p className="text-[11px] text-[#3B82F6] font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Footer text — visible on page like Figma */}
      <p className="absolute bottom-6 text-center text-[11px] text-gray-600 px-10 max-w-2xl leading-snug">
        An interactive language center is a system that engages students through active learning tools and encourages consistent language practice.
      </p>

      <ErrorModal
        isOpen={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        form { animation: fadeIn 0.5s ease-out; }
      `}} />
    </div>
  );
};

export default Login;