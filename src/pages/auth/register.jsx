import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
 
    <div className="h-screen w-screen bg-white flex flex-col items-center justify-center p-2 font-sans overflow-hidden relative">
      
      {/* "ELLA QUEST" Title */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:block">
        <h1 className="text-3xl font-bold tracking-widest text-gray-800">ELLA QUEST</h1>
      </div>

      {/* Main Registration Box*/}
      <div className="w-full max-w-[420px] bg-[#D9D9D9] border-[0.5px] border-black rounded-xl p-4 shadow-sm mb-3">
        <h2 className="text-center font-bold text-sm tracking-widest mb-3 uppercase">Create Account</h2>
        
        <form className="space-y-2">
          {/* Personal Information Section */}
          <div className="space-y-1.5">
            <div className="inline-block border-[0.5px] border-black rounded-full px-2 py-0 text-[8px] font-bold uppercase">
              Personal Information:
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0">
                <label className="text-[8px] font-bold ml-2">First Name:</label>
                <input type="text" className="w-full bg-white border-[0.5px] border-black rounded-full h-6 px-3 outline-none text-[9px]" />
              </div>
              <div className="space-y-0">
                <label className="text-[8px] font-bold ml-2">Last Name:</label>
                <input type="text" className="w-full bg-white border-[0.5px] border-black rounded-full h-6 px-3 outline-none text-[9px]" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-0">
                <label className="text-[8px] font-bold ml-2">Birthday:</label>
                <input type="text" placeholder="mm/dd/yyyy" className="w-full bg-white border-[0.5px] border-black rounded-full h-6 px-3 outline-none text-[9px]" />
              </div>
              <div className="space-y-0">
                <label className="text-[8px] font-bold ml-2">Age:</label>
                <input type="text" className="w-full bg-white border-[0.5px] border-black rounded-full h-6 px-3 outline-none text-[9px]" />
              </div>
              <div className="space-y-0">
                <label className="text-[8px] font-bold ml-2">Gender:</label>
                <input type="text" className="w-full bg-white border-[0.5px] border-black rounded-full h-6 px-3 outline-none text-[9px]" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-0">
                <label className="text-[8px] font-bold ml-2">ID:</label>
                <input type="text" className="w-full bg-white border-[0.5px] border-black rounded-full h-6 px-3 outline-none text-[9px]" />
              </div>
              <div className="space-y-0">
                <label className="text-[8px] font-bold ml-2">Program:</label>
                <input type="text" className="w-full bg-white border-[0.5px] border-black rounded-full h-6 px-3 outline-none text-[9px]" />
              </div>
              <div className="space-y-0">
                <label className="text-[8px] font-bold ml-2">Year:</label>
                <input type="text" className="w-full bg-white border-[0.5px] border-black rounded-full h-6 px-3 outline-none text-[9px]" />
              </div>
            </div>

            <div className="space-y-0">
              <label className="text-[8px] font-bold ml-2">Email:</label>
              <input type="email" className="w-full bg-white border-[0.5px] border-black rounded-full h-6 px-3 outline-none text-[9px]" />
            </div>
          </div>

          <div className="w-full h-[0.5px] bg-black/20 my-1"></div>

          {/* Account Information Section */}
          <div className="space-y-1.5">
            <div className="inline-block border-[0.5px] border-black rounded-full px-2 py-0 text-[8px] font-bold uppercase">
              Account Information:
            </div>

            <div className="space-y-1">
               <div className="flex items-center">
                  <label className="text-[8px] font-bold w-20 text-right mr-3">User Name:</label>
                  <input type="text" className="flex-1 bg-white border-[0.5px] border-black rounded-full h-6 px-3 outline-none text-[9px]" />
               </div>
               <div className="flex items-center">
                  <label className="text-[8px] font-bold w-20 text-right mr-3">Password:</label>
                  <div className="flex-1 relative">
                    <input type="password"  className="w-full bg-white border-[0.5px] border-black rounded-full h-6 px-3 outline-none text-[9px]" />
                    <span className="material-icons text-[12px] absolute right-3 top-1 text-black/60 cursor-pointer">visibility</span>
                  </div>
               </div>
               <div className="flex items-center">
                  <label className="text-[8px] font-bold w-20 text-right mr-3">Confirm:</label>
                  <div className="flex-1 relative">
                    <input type="password" className="w-full bg-white border-[0.5px] border-black rounded-full h-6 px-3 outline-none text-[9px]" />
                    <span className="material-icons text-[12px] absolute right-3 top-1 text-black/60 cursor-pointer">visibility</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center pt-1">
            <button type="button" className="px-5 py-1 bg-white border-[0.5px] border-black rounded-md text-[9px] font-bold hover:bg-gray-100 transition-all active:scale-95 shadow-sm uppercase">
              Create Account
            </button>
            <p className="text-[8px] text-[#3B82F6] mt-2 font-medium">
              Already have an Account? <Link to="/login" className="font-bold hover:underline ml-1">Log In</Link>
            </p>
          </div>
        </form>
      </div>

      {/* Footer Text  */}
      <div className="text-center px-6 mt-1">
        <p className="text-[8px] text-gray-500 leading-tight max-w-[500px] mx-auto">
          An interactive language center is a system that engages students through active learning tools and encourages consistent language practice.
        </p>
      </div>
    </div>
  );
};

export default Register;