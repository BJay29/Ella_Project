import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ------------------ STATE ------------------
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [manageMode, setManageMode] = useState(false);
  
  // 1. ADDED STATE FOR LOGOUT MODAL
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ------------------ FUNCTIONS ------------------
  // 2. MODIFIED LOGOUT LOGIC
  const handleLogoutClick = () => {
    setShowLogoutModal(true); // Open confirmation first
  };

  const confirmLogout = () => {
    navigate("/login");
  };

  const closeAll = () => {
    setActiveTab("dashboard");
    setSelectedUser(null);
    setSelectedMaterial(null);
    setManageMode(false);
  };

  // ------------------ STYLES ------------------
  const boardStyle =
    "relative w-[901px] h-[644px] bg-[#D9D9D9] rounded-[16px] shadow-xl p-12 border-2 border-black";

  const boxStyle =
    "flex items-center justify-center font-semibold cursor-pointer rounded-[14px] border-2 border-black text-white";

  const sidebarBtn =
    "w-64 py-3 rounded-full text-white font-medium shadow-md transition";

  const insideBtn =
    "px-8 py-3 rounded-full text-white font-semibold shadow border border-black/40";

  return (
    <div className="h-screen w-full bg-[#1E1E1E] flex items-center justify-center font-sans">
      <div className="w-full h-full bg-[#EAEAEA] flex shadow-2xl">

        {/* ------------------ SIDEBAR ------------------ */}
        <div className="w-[320px] bg-[#B8D0B8] flex flex-col justify-between items-center py-10 px-6">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-[#A2BC56] flex items-center justify-center text-sm font-semibold border-2 border-black/10">
              PROFILE
            </div>
            <div className="mt-4 bg-[#6F8F5B] text-white text-xs px-6 py-1 rounded-full">
              ADMIN USERNAME
            </div>

            <div className="mt-16 flex flex-col gap-6 w-full items-center">
              <button
                onClick={() => {
                  setActiveTab("users");
                  setManageMode(false);
                }}
                className={`${sidebarBtn} ${activeTab === "users" ? "bg-[#A2BC56]" : "bg-[#6F8F5B]"}`}
              >
                Edit User Details
              </button>

              <button
                onClick={() => {
                  setActiveTab("materials");
                  setManageMode(false);
                }}
                className={`${sidebarBtn} ${activeTab === "materials" ? "bg-[#A2BC56]" : "bg-[#6F8F5B]"}`}
              >
                Manage Materials
              </button>

              <button
                onClick={closeAll}
                className={`${sidebarBtn} ${activeTab === "dashboard" ? "bg-[#A2BC56]" : "bg-[#6F8F5B]"}`}
              >
                Return to Dashboard
              </button>
            </div>
          </div>

          {/* Logout Button - Trigger Modal */}
          <button
            onClick={handleLogoutClick}
            className="w-40 py-3 rounded-full bg-[#6F8F5B] hover:bg-red-600 text-white font-medium transition-all shadow-md uppercase text-xs tracking-widest border border-black/10"
          >
            Logout
          </button>
        </div>

        {/* ------------------ RIGHT CONTENT ------------------ */}
        <div className="flex-1 flex items-center justify-center p-12">
          {activeTab === "users" && (
            <div className={boardStyle}>
              <div className="absolute top-6 left-8">
                <div className="bg-[#6F8F5B] text-white px-6 py-2 rounded-full text-sm font-semibold shadow border-2 border-black">
                  {manageMode ? "Manage Account" : "User Details"}
                </div>
              </div>

              <div className="mt-24 grid grid-cols-2 gap-y-12 gap-x-24 justify-items-center">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedUser(i)}
                    className={`${boxStyle} ${selectedUser === i ? "bg-[#9EBC59]" : "bg-[#7A9A65]"}`}
                    style={{ width: 305, height: 45 }}
                  >
                    USER #{i}
                  </div>
                ))}
              </div>

              {!manageMode ? (
                <div className="absolute bottom-10 right-12">
                  <button onClick={() => setManageMode(true)} className={`${insideBtn} bg-[#1FA32E]`}>
                    Manage Account
                  </button>
                </div>
              ) : (
                <div className="absolute bottom-10 right-12 flex gap-6">
                  <button className={`${insideBtn} bg-[#1FA32E]`}>Create</button>
                  <button className={`${insideBtn} bg-[#A2BC56] text-black`}>Read</button>
                  <button className={`${insideBtn} bg-[#1E4E8C]`}>Update</button>
                  <button className={`${insideBtn} bg-[#E10600]`}>Delete</button>
                </div>
              )}
            </div>
          )}

          {activeTab === "materials" && (
            <div className={boardStyle}>
              <div className="absolute top-6 left-8">
                <div className="bg-[#6F8F5B] text-white px-6 py-2 rounded-full text-sm font-semibold shadow border-2 border-black">
                  Materials List
                </div>
              </div>
              <div className="mt-24 grid grid-cols-2 gap-y-12 gap-x-24 justify-items-center">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedMaterial(i)}
                    className={`${boxStyle} ${selectedMaterial === i ? "bg-[#9EBC59]" : "bg-[#7A9A65]"}`}
                    style={{ width: 305, height: 45 }}
                  >
                    MATERIAL #{i}
                  </div>
                ))}
              </div>
              <div className="absolute bottom-10 right-12">
                <button className={`${insideBtn} bg-[#1FA32E]`}>Review Uploaded Content</button>
              </div>
            </div>
          )}

          {activeTab === "dashboard" && <div className={boardStyle}></div>}
        </div>
      </div>

      {/* 3. LOGOUT CONFIRMATION MODAL (Consistent with Student Dashboard) */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#C1E1C1] p-8 rounded-[30px] border-2 border-black/10 shadow-2xl max-w-sm w-full text-center animate-fadeInModal">
            <h2 className="text-xl md:text-2xl font-bold mb-8 text-gray-800">
              Are you sure you want to Logout!?
            </h2>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={confirmLogout}
                className="bg-[#6F8F5B] text-white px-8 py-2 rounded-full font-bold hover:bg-[#5a754a] transition-all border border-black/10 shadow-md"
              >
                Yes
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="bg-[#A4C46B] text-white px-8 py-2 rounded-full font-bold hover:bg-[#8da85a] transition-all border border-black/10 shadow-md"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInModal { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeInModal { animation: fadeInModal 0.2s ease-out; }
      `}} />
    </div>
  );
};

export default AdminDashboard;