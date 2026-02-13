import React from 'react';
import Sidebar from "/src/components/layout/Sidebar.jsx";

const ReviewTask = () => {
  return (
    <div className="flex min-h-screen bg-white font-sans text-black">
      <Sidebar />
      
      <main className="flex-1 py-5 px-10 overflow-y-auto">
        {/* Header - Replaced .page-header */}
        <header className="flex justify-between items-center border-b-[3px] border-black pb-2.5 mb-5">
          <div className="flex items-center gap-5">
            <h2 className="font-black text-xl m-0">ELLA QUEST</h2>
            <span className="text-[12px] font-bold uppercase tracking-wider">[User: Instructor]</span>
          </div>
          <div className="flex gap-5 text-2xl">
            <span className="cursor-pointer hover:scale-110 transition-transform">💬</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">🔔</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">➡️</span>
          </div>
        </header>

        {/* Toggle Tabs - Replaced .review-tabs */}
        <div className="flex gap-5 my-8 justify-center">
          <button className="bg-[#d9d9d9] border-2 border-black rounded-xl py-2.5 px-8 text-base font-bold cursor-pointer hover:bg-black hover:text-white transition-all">
            Writing Review
          </button>
          <button className="bg-[#d9d9d9] border-2 border-black rounded-xl py-2.5 px-8 text-base font-bold cursor-pointer hover:bg-black hover:text-white transition-all">
            Speaking Review
          </button>
        </div>

        {/* Workspace Layout - Replaced .review-workspace */}
        <div className="flex gap-10 max-w-[1100px] mx-auto items-stretch">
          
          {/* LEFT: Student Submission Panel - Replaced .submission-panel */}
          <section className="flex-[2] bg-[#d9d9d9] border-2 border-blue-500 p-6 shadow-sm">
            {/* Student Header Info */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4">
                <div className="w-[45px] h-[45px] bg-white rounded-full border border-black/10 shadow-inner"></div>
                <div>
                  <h3 className="m-0 text-base font-extrabold uppercase tracking-tight">Ernie Bading</h3>
                  <p className="m-0 text-sm font-medium text-gray-700">Quest 5 Writing</p>
                </div>
              </div>
              <div className="bg-transparent border-2 border-black rounded-2xl py-0.5 px-2.5 text-[12px] font-black uppercase">
                Pending Review
              </div>
            </div>

            <hr className="border-none border-t-2 border-black mb-6" />

            {/* Prompt Section */}
            <div className="mb-6">
              <label className="block font-black text-sm mb-1.5 uppercase">Writing Prompt</label>
              <div className="bg-[#d9d9d9] border-2 border-black rounded-xl h-[60px] shadow-inner">
                {/* Placeholder for prompt text */}
              </div>
            </div>

            {/* Response Section */}
            <div className="mb-6">
              <label className="block font-black text-sm mb-1.5 uppercase">Student Response</label>
              <div className="bg-[#d9d9d9] border-2 border-black rounded-xl h-[150px] shadow-inner">
                 {/* Placeholder for student answer */}
              </div>
            </div>
          </section>

          {/* RIGHT: Scoring/Grading Panel - Replaced .grading-panel */}
          <aside className="flex-1 flex flex-col gap-5">
            {/* Replaced .grading-box */}
            <div className="bg-[#d9d9d9] border-2 border-gray-400 p-5 flex flex-col gap-4 flex-grow rounded-sm shadow-sm">
              <label className="font-black text-lg uppercase tracking-tighter">Score</label>
              <input 
                type="text" 
                className="bg-transparent border-2 border-black rounded-xl h-9 px-3 font-bold outline-none focus:bg-white/50 transition-colors" 
              />
              
              {/* Replaced .comment-box */}
              <div className="border-2 border-black rounded-xl flex-grow min-h-[150px] bg-transparent shadow-inner p-2">
                <textarea 
                  placeholder="FEEDBACK..." 
                  className="w-full h-full bg-transparent border-none outline-none resize-none font-bold text-sm"
                ></textarea>
              </div>
              
              <div className="border-2 border-black rounded-xl h-9 bg-transparent"></div>
            </div>

            {/* Replaced .submit-grading-btn */}
            <button className="bg-[#d9d9d9] border-2 border-black rounded-2xl h-20 cursor-pointer hover:bg-black transition-colors group">
              <span className="group-hover:text-white font-black text-xl">SUBMIT</span>
            </button>
          </aside>

        </div>
      </main>
    </div>
  );
};

export default ReviewTask;