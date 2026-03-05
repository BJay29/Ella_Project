import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructorSidebar from "../../components/layout/instructorsidebar.jsx"; 

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Dashboard'); 
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // --- PROTECT ROUTE LOGIC ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Debugging logs para sa tracking
    console.log("Auth Guard - Token exists:", !!token);
    console.log("Auth Guard - Stored Role:", userRole);

    if (!token) {
      console.warn("No token found. Redirecting...");
      navigate('/login', { replace: true });
      return;
    }

    // Siguraduhin na lowercase at walang extra spaces ang check
    const normalizedRole = userRole ? userRole.toLowerCase().trim() : '';

    if (normalizedRole !== 'instructor') {
      console.error("Unauthorized role:", normalizedRole);
      navigate('/login', { replace: true });
    } else {
      // Dito lang natin i-se-set sa TRUE kapag sigurado nang Instructor
      setIsAuthorized(true); 
    }
  }, [navigate]);

  const confirmLogout = () => {
    localStorage.clear(); 
    navigate("/login", { replace: true });
  };

  // --- SAFETY RENDER ---
  // Kung hindi pa authorized, mag-render lang ng blanko o loading screen.
  // Ito ang pipigil para hindi "mag-overlap" ang Login screen sa Dashboard.
  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen bg-[#d9ead3] flex items-center justify-center">
        <div className="animate-pulse font-black text-gray-500 uppercase tracking-widest">
          Verifying Credentials...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#d9ead3] font-sans text-black relative">
      
      {/* SIDEBAR */}
      <InstructorSidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={() => setShowLogoutModal(true)} 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter">
            {activePage}
          </h2>
          <div className="flex gap-4 items-center">
            <button className="p-1 hover:scale-110 transition-transform"><span className="text-2xl">💬</span></button>
            <button className="p-1 hover:scale-110 transition-transform"><span className="text-2xl">🔔</span></button>
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="p-1 hover:text-red-600 transition-all hover:scale-110 font-bold uppercase text-sm"
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* --- DYNAMIC CONTENT AREA --- */}

        {/* 1. DASHBOARD VIEW */}
        {activePage === 'Dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-bold text-lg text-gray-700">Total Students</h3>
                <p className="text-4xl font-black mt-2">24</p>
                <div className="h-1 bg-black mt-4 w-full rounded-full opacity-20"></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-bold text-lg text-gray-700">Flagged Students</h3>
                <p className="text-4xl font-black mt-2 text-red-600">3</p>
                <p className="text-[10px] font-bold uppercase text-red-400">Needs attention</p>
                <div className="h-1 bg-red-600 mt-4 w-full rounded-full"></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-bold text-lg text-gray-700">Avg Class Score</h3>
                <p className="text-4xl font-black mt-2">85%</p>
                <div className="h-1 bg-green-600 mt-4 w-full rounded-full opacity-50"></div>
              </div>
            </section>

            {/* Action Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {[
                { title: "Class Progress", color: "border-blue-400", desc: "Track real-time student activity and module completion." },
                { title: "Intervention Alerts", color: "border-black", iconColor: "bg-red-600", desc: "System-generated alerts for students falling behind." },
                { title: "Review Task", color: "border-black", desc: "Pending assignments and manual grading tasks." },
                { title: "Analytics Dashboard", color: "border-black", desc: "Deep-dive reports into curriculum effectiveness." }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActivePage(item.title)}
                  className={`bg-white p-8 rounded-[40px] border-2 ${item.color} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all cursor-pointer group`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border border-black ${item.iconColor || 'bg-gray-100'}`}>
                      <div className="w-8 h-8 flex items-center justify-center font-bold">📄</div>
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tight">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-bold leading-tight">{item.desc}</p>
                      <button className="mt-6 flex items-center font-black text-sm uppercase group-hover:gap-3 transition-all">
                        View details <span className="ml-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px]">➝</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* 2. OTHER VIEWS (PLACEHOLDERS) */}
        {activePage !== 'Dashboard' && (
          <div className="flex flex-col items-center justify-center h-[60vh] bg-white/50 rounded-[40px] border-4 border-dashed border-black/10 animate-in zoom-in duration-300">
            <h3 className="text-4xl font-black italic text-black/20 uppercase">{activePage}</h3>
            <p className="font-bold text-black/30 mt-2">Coming Soon: Section is under development.</p>
            <button 
              onClick={() => setActivePage('Dashboard')}
              className="mt-6 bg-black text-white px-8 py-2 rounded-full font-bold hover:scale-105 transition-all shadow-lg"
            >
              BACK TO DASHBOARD
            </button>
          </div>
        )}

      </main>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-6">
          <div className="bg-[#C1E1C1] w-full max-w-[450px] p-12 rounded-[50px] shadow-2xl flex flex-col items-center border-4 border-black animate-in zoom-in duration-200">
            <h2 className="text-[#1A2E35] text-2xl md:text-3xl font-black text-center leading-tight mb-10 italic">
              Are you sure you want to<br />Logout!?
            </h2>
            <div className="flex gap-6 w-full justify-center">
              <button 
                onClick={confirmLogout}
                className="w-32 py-3 bg-[#718E5A] text-white border-2 border-black rounded-full font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
              >
                Yes
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="w-32 py-3 bg-[#A2C371] text-white border-2 border-black rounded-full font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;