import React from 'react';

const AuthInput = ({ label, type = "text", placeholder, value, onChange, name, icon, isPassword, showPassword, togglePassword }) => {
  return (
    <div className="flex flex-col w-full">
      {label && <label className="text-[9px] font-bold ml-1 uppercase mb-1">{label}</label>}
      
      <div className="flex items-center bg-[#D9D9D9] border-[0.5px] border-black rounded-full overflow-hidden h-9 shadow-sm w-full">
        {/* Heto yung icon part sa gilid */}
        {icon && (
          <div className="w-10 md:w-12 flex items-center justify-center border-r-[0.5px] border-black/30 h-full">
            <span className="material-icons text-base md:text-lg text-black">{icon}</span>
          </div>
        )}
        
        <input 
          type={isPassword ? (showPassword ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 px-4 bg-transparent text-[9px] md:text-[10px] font-bold tracking-[0.2em] outline-none placeholder:text-gray-500 w-full"
          required
        />

        {isPassword && (
          <span 
            onClick={togglePassword}
            className="material-icons text-sm md:text-base pr-4 text-gray-600 cursor-pointer select-none"
          >
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        )}
      </div>
    </div>
  );
};

export default AuthInput;