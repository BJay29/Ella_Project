import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../../components/common/authinput';
import Footer from '../../components/layout/footer';
import ellaLogo from '../../assets/image.png';
import { authAPI } from '../../services/authservice';

const Login = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverWaking, setServerWaking] = useState(true); // Render cold-start state
  const [errorMsg, setErrorMsg] = useState('');

  // Ping the server on mount to wake it up (Render free tier fix)
  useEffect(() => {
    const wakeServer = async () => {
      setServerWaking(true);
      await authAPI.ping();
      setServerWaking(false);
    };
    wakeServer();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg(''); // Clear error on typing
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { email, password } = loginData;

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      let data = {};
      const contentType = response.headers.get('content-type');

      // Safely parse JSON — avoid crash if server returns HTML error page
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response from server:', text);
        setErrorMsg('Server error. Please try again in a moment.');
        setLoading(false);
        return;
      }

      // Debug log (remove in production)
      console.log('Login response status:', response.status);
      console.log('Login response data:', data);

      if (response.ok) {
        // Save token and user info
        localStorage.setItem('token', data.token || data.access_token || '');
        localStorage.setItem(
          'userRole',
          data.role ? data.role.toLowerCase().trim() : ''
        );
        localStorage.setItem(
          'userName',
          data.name || data.first_name || ''
        );

        const role = data.role ? data.role.toLowerCase().trim() : '';

        if (role === 'student') {
          navigate('/dashboard');
        } else if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'instructor') {
          navigate('/instructor/dashboard');
        } else {
          setErrorMsg('Unknown role. Please contact your administrator.');
        }
      } else {
        // Show the exact message from the server
        const serverMessage =
          data.message ||
          data.error ||
          data.detail ||
          'Invalid email or password. Please try again.';
        setErrorMsg(serverMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMsg(
        'Cannot connect to the server. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
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
            Login
          </p>
        </div>

        {/* Server waking notice */}
        {serverWaking && (
          <div className="w-full mb-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
            <p className="text-[9px] md:text-[10px] text-blue-500 font-semibold animate-pulse">
              ⏳ Connecting to server, please wait...
            </p>
          </div>
        )}

        {/* Inline error message */}
        {errorMsg && (
          <div className="w-full mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">
            <p className="text-[9px] md:text-[10px] text-red-500 font-semibold">
              ⚠️ {errorMsg}
            </p>
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleLogin} className="w-full space-y-4">

          <AuthInput
            name="email"
            type="email"
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
              <a
                href="#"
                className="text-[8px] md:text-[9px] italic text-[#3B82F6] font-semibold hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading || serverWaking}
              className="w-40 md:w-48 bg-[#D9D9D9] border-[0.5px] border-black rounded-full h-9 font-bold text-[10px] md:text-[11px] tracking-[0.3em] hover:bg-gray-300 transition-all active:scale-[0.98] shadow-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Logging in...'
                : serverWaking
                ? 'Connecting...'
                : 'Login'}
            </button>

            <div className="text-center">
              <p className="text-[9px] md:text-[10px] text-[#3B82F6] font-medium">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-bold cursor-pointer hover:underline ml-1"
                >
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