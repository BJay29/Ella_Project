import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activePage, setActivePage }) => {
  const navigate = useNavigate();

  return (
    <aside className="w-[300px] h-screen bg-[#D3D3D3] flex flex-col p-8 border-r border-black/10 shrink-0">
      <h1 className="text-4xl font-bold text-gray-800 mb-10">Ella Quest</h1>

      {/* NAV LINKS */}
      <nav className="flex flex-col gap-4">
        {['Home', 'Analytics', 'Skin Shop'].map((page) => (
          <button 
            key={page}
            onClick={() => setActivePage(page)}
            className={`py-3 px-8 rounded-full border border-black text-white font-semibold shadow-md 
              ${activePage === page ? 'bg-[#2E7D32]' : 'bg-[#388E3C]'}`}
          >
            {page}
          </button>
        ))}
      </nav>

      {/* CHARACTER - This pushes the logout down */}
      <div className="flex-1 flex items-center justify-center">
        <img 
          src="/src/assets/image.png" 
          alt="Ella" 
          className="w-48 h-auto object-contain"
        />
      </div>

      {/* LOGOUT BUTTON - Explicitly at the bottom */}
     <div className="mt-auto pt-4 flex justify-center w-full pb-2">
            <button 
              onClick={handleLogout}
              className="bg-[#8DA674] hover:bg-red-600 text-white font-bold py-1.5 px-8 rounded-full border border-black 
              shadow-sm transition-all text-[5px] md:text-[8px] uppercase tracking-wider"
            >
              Logout
            </button>
        </div>
    </aside>
  );
};

export default Sidebar;