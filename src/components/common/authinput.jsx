import React from 'react';

const AuthInput = ({ label, type = "text", placeholder, value, onChange, name, icon, isPassword, showPassword, togglePassword, className }) => {
  return (
    <div className="flex flex-col w-full">
      {label && <label className="text-[9px] font-bold ml-1 uppercase mb-1 text-gray-700">{label}</label>}
      
      <div className={`flex items-center rounded-full overflow-hidden h-10 shadow-sm w-full ${className}`}>
        
        {/* SVG Icon Section */}
        {icon && (
          <div className="w-10 md:w-12 flex items-center justify-center border-r border-black/10 h-full">
            <span className="text-black/70">
                {icon === 'person' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                )}
                {icon === 'lock' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                )}
            </span>
          </div>
        )}
        
        <input 
          type={isPassword ? (showPassword ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 px-4 bg-transparent text-black text-[10px] md:text-[11px] font-bold tracking-[0.2em] outline-none placeholder:text-black/40 w-full"
          required
        />

        {/* Eye Icon Button */}
        {isPassword && (
          <button 
            type="button"
            onClick={togglePassword}
            className="pr-4 text-black/60 hover:text-black cursor-pointer select-none focus:outline-none"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthInput;