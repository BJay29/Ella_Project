import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  // State para sa show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#D1EED1] flex flex-col items-center justify-center font-sans overflow-hidden p-2 relative text-gray-800">
      
      {/* ELLA QUEST - Side Title */}
      <div className="static lg:absolute lg:left-[12%] lg:top-1/2 lg:-translate-y-1/2 mb-4 lg:mb-0">
        <h1 className="text-3xl md:text-5xl font-normal tracking-[0.1em] uppercase">
          Ella Quest
        </h1>
      </div>

      {/* REGISTRATION BOX */}
      <div className="w-full max-w-[420px] lg:absolute lg:right-[8%] lg:top-1/2 lg:-translate-y-1/2 bg-[#B8DBB8] border-[0.5px] border-black/30 rounded-xl p-4 shadow-md">
        <h2 className="text-center font-semibold text-[14px] tracking-widest mb-3 uppercase">
          Create Account
        </h2>
        
        <form className="space-y-2">
          {/* Personal Information Section */}
          <div className="space-y-2">
            <div className="inline-block border-[0.5px] border-black rounded-full px-3 py-0 text-[9px] font-bold uppercase bg-[#D1EED1]/60">
              Personal Information:
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-[9px] font-bold ml-1 italic">First Name:</label>
                <input type="text" className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-6 px-3 outline-none text-[10px]" />
              </div>
              <div className="flex flex-col">
                <label className="text-[9px] font-bold ml-1 italic">Last Name:</label>
                <input type="text" className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-6 px-3 outline-none text-[10px]" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <label className="text-[9px] font-bold ml-1 italic">Birthday:</label>
                <input type="text" placeholder="mm/dd/yyyy" className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-6 px-2 outline-none text-[9px] text-center" />
              </div>
              <div className="flex flex-col items-center">
                <label className="text-[9px] font-bold italic">Age:</label>
                <input type="text" className="w-10 bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-6 outline-none text-[10px] text-center" />
              </div>
              <div className="flex flex-col">
                <label className="text-[9px] font-bold ml-1 italic">Gender:</label>
                <input type="text" className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-6 px-2 outline-none text-[10px]" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <label className="text-[9px] font-bold ml-1 italic">Student ID:</label>
                <input type="text" className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-6 px-2 outline-none text-[10px]" />
              </div>
              <div className="flex flex-col">
                <label className="text-[9px] font-bold ml-1 italic">Program:</label>
                <input type="text" className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-6 px-2 outline-none text-[10px]" />
              </div>
              <div className="flex flex-col items-center">
                <label className="text-[9px] font-bold italic">Year:</label>
                <input type="text" className="w-10 bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-6 outline-none text-[10px] text-center" />
              </div>
            </div>

            <div className="flex flex-col items-center w-full">
              <div className="w-3/4">
                <label className="text-[9px] font-bold ml-1 italic">Email Address:</label>
                <input type="email" className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-6 px-3 outline-none text-[10px]" />
              </div>
            </div>
          </div>

          <hr className="border-black/20 my-1" />

          {/* Account Information Section */}
          <div className="space-y-2">
            <div className="inline-block border-[0.5px] border-black rounded-full px-3 py-0 text-[9px] font-bold uppercase bg-[#D1EED1]/60">
              Account Information:
            </div>

            <div className="flex flex-col items-center gap-2 mt-1">
               <div className="w-3/4 flex flex-col">
                  <label className="text-[9px] font-bold ml-1 uppercase">User Name:</label>
                  <input type="text" className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-6 px-3 outline-none text-[10px]" />
               </div>
               
               {/* Create Password */}
               <div className="w-3/4 flex flex-col relative">
                  <label className="text-[9px] font-bold ml-1 uppercase">Create Password:</label>
                  <div className="relative w-full">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-6 px-3 outline-none text-[10px] pr-8" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                    >
                      {/* SVG Eye Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                  </div>
               </div>
               
               {/* Confirm Password */}
               <div className="w-3/4 flex flex-col relative">
                  <label className="text-[9px] font-bold ml-1 uppercase">Confirm Password:</label>
                  <div className="relative w-full">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      className="w-full bg-[#D9D9D9] border-[0.5px] border-black rounded-xl h-6 px-3 outline-none text-[10px] pr-8" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                  </div>
               </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center pt-2">
            <button type="submit" className="px-12 py-1 bg-[#D9D9D9] border-[1px] border-black rounded-lg text-[10px] font-bold hover:bg-white transition-all shadow-sm uppercase active:scale-95">
              Create Account
            </button>
            <p className="text-[9px] text-blue-600 mt-2 font-bold uppercase">
              Already have an Account? <Link to="/login" className="hover:underline ml-1">Log in</Link>
            </p>
          </div>
        </form>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-4 w-full text-center px-10 hidden md:block">
        <p className="text-[9px] text-gray-700 max-w-2xl mx-auto leading-tight italic">
          An interactive language center is a system that engages students through active learning tools and encourages consistent language practice.
        </p>
      </div>
    </div>
  );
};

export default Register;