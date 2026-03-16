import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ellaLogo from '../../assets/image.png';
import ErrorModal from "../../components/modals/errormodal";
import { authAPI } from '../../services/authservice';

const VerifyEmail = () => {
  const navigate = useNavigate();
  
  // States
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal States
  const [showError, setShowError] = useState(false);
  const [msg, setMsg] = useState('');

  const handleAction = async (e) => {
    e.preventDefault();
    
    // --- PHASE 1: SENDING CODE ---
    if (!isCodeSent) {
      if (!email) {
        setMsg("PLEASE ENTER YOUR EMAIL ADDRESS");
        setShowError(true);
        return;
      }
      setIsLoading(true);
      try {
        const response = await authAPI.sendVerificationCode(email);
        if (response.ok) {
          setIsCodeSent(true);
        } else {
          const data = await response.json().catch(() => ({}));
          setMsg(data.message?.toUpperCase() || "FAILED TO SEND CODE");
          setShowError(true);
        }
      } catch (error) {
        setMsg("SERVER ERROR. PLEASE TRY AGAIN.");
        setShowError(true);
      } finally {
        setIsLoading(false);
      }
    } 
    
    // --- PHASE 2: "VERIFYING" (REDIRECT TO REGISTER) ---
    else {
      if (!code || code.length < 6) {
        setMsg("PLEASE ENTER THE 6-DIGIT CODE");
        setShowError(true);
        return;
      }

      // Dahil ang backend niyo ay sa /register chinicheck ang code,
      // hindi na tayo tatawag ng verifyCode API dito.
      // Didiretso na tayo sa Register page at ipapasa ang code doon.
      setIsLoading(true);
      
      // Simulate konting delay para sa UX
      setTimeout(() => {
        setIsLoading(false);
        navigate('/register', { 
          state: { 
            verifiedEmail: email,
            verifiedCode: code 
          } 
        });
      }, 500);
    }
  };

  const inputStyle = {
    WebkitBoxShadow: "0 0 0px 1000px #7a9e50 inset",
    WebkitTextFillColor: "#ffffff",
  };

  return (
    <div className="h-screen w-screen bg-[#C8E6C0] flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-[380px] flex flex-col items-center px-8 py-10 bg-[#B8DBB8] rounded-3xl shadow-lg border border-black/10">
        
        <img src={ellaLogo} className="w-36 h-36 mb-4 drop-shadow-sm" alt="Ella Logo" />
        
        <h2 className="font-black text-gray-700 uppercase tracking-[0.2em] mb-6 text-[12px] text-center">
          {isCodeSent ? "Enter Verification Code" : "Email Verification"}
        </h2>
        
        <form className="w-full flex flex-col items-center space-y-4" onSubmit={handleAction}>
          
          {/* EMAIL INPUT */}
          <div className="w-full flex items-center bg-[#7a9e50] rounded-full overflow-hidden border border-black/10 shadow-inner shadow-black/20">
            <div className="px-4 py-2.5 flex items-center justify-center border-r border-white/20 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS" 
              value={email} 
              readOnly={isCodeSent}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              className={`flex-1 bg-transparent p-2.5 px-4 text-white placeholder-white/70 font-bold outline-none text-[11px] tracking-widest ${isCodeSent ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* CODE INPUT - LALABAS LANG PAGKASEND NG CODE */}
          {isCodeSent && (
            <div className="w-full animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-full flex items-center bg-[#7a9e50] rounded-full overflow-hidden border border-black/10 shadow-inner shadow-black/20">
                <div className="px-4 py-2.5 flex items-center justify-center border-r border-white/20 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  maxLength="6"
                  placeholder="000000" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={inputStyle}
                  className="flex-1 bg-transparent p-2.5 px-4 text-white text-center font-black outline-none tracking-[0.5em] text-lg"
                  autoFocus
                />
              </div>
              <button 
                type="button"
                onClick={() => { setIsCodeSent(false); setCode(''); }}
                className="text-[9px] text-blue-700 font-bold mt-1.5 ml-4 uppercase hover:underline block"
              >
                Change Email?
              </button>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full max-w-[220px] bg-[#8aab45] hover:bg-[#9abb55] text-white py-2 rounded-full font-black shadow-md uppercase text-[11px] tracking-widest transition-all active:scale-95 mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? "Wait..." : isCodeSent ? "Proceed to Register" : "Send Code"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-black/5 pt-4 w-full">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 underline ml-1 hover:text-blue-800 transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>

      <ErrorModal isOpen={showError} message={msg} onClose={() => setShowError(false)} />
    </div>
  );
};

export default VerifyEmail;