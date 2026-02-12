import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ------------------ STATE ------------------
  const [activeTab, setActiveTab] = useState("dashboard"); // current view
  const [selectedUser, setSelectedUser] = useState(null); // user clicked
  const [selectedMaterial, setSelectedMaterial] = useState(null); // material clicked
  const [manageMode, setManageMode] = useState(false); // shows CRUD buttons

  // ------------------ FUNCTIONS ------------------
  const handleLogout = () => {
    navigate("/login");
  };

  // Resets everything and returns to dashboard view
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

  // Sidebar buttons: NO border (as requested)
  const sidebarBtn =
    "w-64 py-3 rounded-full text-white font-medium shadow-md transition";

  // Inside buttons: slightly light border
  const insideBtn =
    "px-8 py-3 rounded-full text-white font-semibold shadow border border-black/40";

  return (
    <div className="h-screen w-full bg-[#1E1E1E] flex items-center justify-center font-sans">
      <div className="w-full h-full bg-[#EAEAEA] flex shadow-2xl">

        {/* ------------------ SIDEBAR ------------------ */}
        <div className="w-[320px] bg-[#B8D0B8] flex flex-col justify-between items-center py-10 px-6">

          <div className="flex flex-col items-center">
            {/* Profile Circle */}
            <div className="w-32 h-32 rounded-full bg-[#A2BC56] flex items-center justify-center text-sm font-semibold">
              PROFILE
            </div>

            {/* Username Badge */}
            <div className="mt-4 bg-[#6F8F5B] text-white text-xs px-6 py-1 rounded-full">
              ADMIN USERNAME
            </div>

            {/* Sidebar Buttons */}
            <div className="mt-16 flex flex-col gap-6 w-full items-center">

              {/* Edit User Details */}
              <button
                onClick={() => {
                  setActiveTab("users");
                  setManageMode(false);
                }}
                className={`${sidebarBtn} ${
                  activeTab === "users" ? "bg-[#A2BC56]" : "bg-[#6F8F5B]"
                }`}
              >
                Edit User Details
              </button>

              {/* Manage Materials */}
              <button
                onClick={() => {
                  setActiveTab("materials");
                  setManageMode(false);
                }}
                className={`${sidebarBtn} ${
                  activeTab === "materials" ? "bg-[#A2BC56]" : "bg-[#6F8F5B]"
                }`}
              >
                Manage Materials
              </button>

              {/* Return to Dashboard */}
              <button
                onClick={closeAll}
                className={`${sidebarBtn} ${
                  activeTab === "dashboard" ? "bg-[#A2BC56]" : "bg-[#6F8F5B]"
                }`}
              >
                Return to Dashboard
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-40 py-3 rounded-full bg-[#6F8F5B] text-white font-medium hover:bg-red-500 transition"
          >
            Logout
          </button>
        </div>

        {/* ------------------ RIGHT CONTENT ------------------ */}
        <div className="flex-1 flex items-center justify-center p-12">

          {/* ------------------ USERS UI ------------------ */}
          {activeTab === "users" && (
            <div className={boardStyle}>

              {/* Top Left Label */}
              <div className="absolute top-6 left-8">
                <div className="bg-[#6F8F5B] text-white px-6 py-2 rounded-full text-sm font-semibold shadow border-2 border-black">
                  {manageMode ? "Manage Account" : "User Details"}
                </div>
              </div>

              {/* User Grid */}
              <div className="mt-24 grid grid-cols-2 gap-y-12 gap-x-24 justify-items-center">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedUser(i)}
                    className={`${boxStyle} ${
                      selectedUser === i
                        ? "bg-[#9EBC59]"
                        : "bg-[#7A9A65]"
                    }`}
                    style={{ width: 305, height: 45 }}
                  >
                    USER #{i}
                  </div>
                ))}
              </div>

              {/* Bottom Buttons */}
              {!manageMode ? (
                <div className="absolute bottom-10 right-12">
                  <button
                    onClick={() => setManageMode(true)}
                    className={`${insideBtn} bg-[#1FA32E]`}
                  >
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

          {/* ------------------ MATERIALS UI ------------------ */}
          {activeTab === "materials" && (
            <div className={boardStyle}>
              <div className="absolute top-6 left-8">
                <div className="bg-[#6F8F5B] text-white px-6 py-2 rounded-full text-sm font-semibold shadow border-2 border-black">
                  Materials List
                </div>
              </div>

              {/* Materials Grid */}
              <div className="mt-24 grid grid-cols-2 gap-y-12 gap-x-24 justify-items-center">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedMaterial(i)}
                    className={`${boxStyle} ${
                      selectedMaterial === i
                        ? "bg-[#9EBC59]"
                        : "bg-[#7A9A65]"
                    }`}
                    style={{ width: 305, height: 45 }}
                  >
                    MATERIAL #{i}
                  </div>
                ))}
              </div>

              {/* Review Content Button */}
              <div className="absolute bottom-10 right-12">
                <button className={`${insideBtn} bg-[#1FA32E]`}>
                  Review Uploaded Content
                </button>
              </div>
            </div>
          )}

          {/* ------------------ DASHBOARD ------------------ */}
          {activeTab === "dashboard" && <div className={boardStyle}></div>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
