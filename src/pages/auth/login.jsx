import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ellaLogo from '../../assets/image.png';
import ErrorModal from "../../components/modals/errormodal";
import { authAPI } from '../../services/APIservice';

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

  // Gisingin ang Render server pag-load ng Login page
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
        // 1. Kunin ang role mula sa iba't ibang posibleng key sa backend
        const rawRole = data.role || data.user?.role || data.userRole || 'student';
        const normalizedRole = rawRole.toLowerCase().trim();

        localStorage.clear();

    
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', normalizedRole);
        
        console.log("LOGIN SUCCESSFUL!");
        console.log("Token Saved:", data.token ? "YES" : "NO");
        console.log("User Role:", normalizedRole);

        // 3. REDIRECT LOGIC
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
        // Ipakita ang error message mula sa backend
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

  // Fix para sa yellow background ng chrome autofill
  const autofillFix = {
    WebkitBoxShadow: "0 0 0px 1000px #7a9e50 inset",
    WebkitTextFillColor: "#ffffff",
  };

  return (
    <div className="h-screen w-screen bg-[#C8E6C0] flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <div className="w-full max-w-[420px] flex flex-col items-center px-6">
        <div className="mb-3">
          <img
            src={ellaLogo}
            alt="Ella Character"
            className="w-44 h-44 object-contain drop-shadow-md"
          />
        </div>

        <h2 className="text-sm font-bold tracking-[0.25em] text-gray-700 uppercase mb-5">
          User Login
        </h2>

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
              placeholder="EMAIL"
              style={autofillFix}
              className="flex-1 bg-[#7a9e50] px-4 py-3 text-white placeholder-white/70 font-bold text-sm tracking-widest outline-none"
              required
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
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-4 py-3 text-white/80 hover:text-white transition-colors text-[10px] font-black"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          <div className="flex justify-end -mt-1">
            <Link to="/forgot-password" title="Feature coming soon" className="text-[11px] italic text-[#3B82F6] font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>

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

          <div className="text-center mt-1">
            <p className="text-[11px] text-[#3B82F6] font-medium">
              Dont have an Account?{' '}
              <Link to="/verify-email" className="font-bold hover:underline">
                Register Here
              </Link>
            </p>
          </div>
        </form>
      </div>

      <p className="absolute bottom-6 text-center text-[11px] text-gray-600 px-10 max-w-2xl leading-snug font-medium">
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