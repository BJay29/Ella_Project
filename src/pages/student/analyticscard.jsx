import React from 'react';

const AnalyticsCard = () => {
  // Mock data base sa design mo
  const stats = [
    { label: 'Activity Completed', value: '87.5%', color: 'border-[#4CAF50]' },
    { label: 'Quiz Completed', value: '87.5%', color: 'border-[#FFEB3B]' },
    { label: 'Average Score', value: '90%', color: 'border-[#2196F3]' },
  ];

  const skillBars = [
    { name: 'Reading', progress: '75%', color: 'bg-[#4CAF50]' },
    { name: 'Writing', progress: '60%', color: 'bg-[#9C27B0]' },
    { name: 'Speaking', progress: '45%', color: 'bg-[#CDDC39]' },
    { name: 'Listening', progress: '80%', color: 'bg-[#2196F3]' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 self-start ml-4">My Progress Analytics</h2>

      {/* TOP SECTION: BADGE AND CIRCLES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mb-10 items-center">
        {/* Total Badge Earned */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 mb-2 flex items-center justify-center">
             {/* Pwede mong palitan ng actual badge image asset mo */}
             <span className="text-5xl">🏆</span> 
          </div>
          <p className="text-[10px] font-bold text-center leading-tight">
            Total Badge Earned <br /> 999999
          </p>
        </div>

        {/* Circular Progress Stats */}
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full border-[10px] ${stat.color} bg-white flex items-center justify-center shadow-sm`}>
              <span className="text-lg font-bold">{stat.value}</span>
            </div>
            <p className="text-[10px] font-bold mt-3 text-gray-700 uppercase tracking-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* MIDDLE SECTION: SKILL POWER BARS */}
      <div className="w-full mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4 self-start ml-4">Skill Power Bars</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 px-4">
          {skillBars.map((skill, index) => (
            <div key={index} className="flex flex-col w-full">
              <span className="text-xs font-bold mb-1 ml-10">{skill.name}</span>
              <div className="flex items-center gap-3">
                {/* Skill Icon Circle */}
                <div className={`w-8 h-8 rounded-full ${skill.color} border-2 border-white shadow-sm flex-shrink-0`}></div>
                {/* Progress Bar Container */}
                <div className="flex-1 h-6 bg-gray-400/30 rounded-full overflow-hidden border border-black/5">
                  <div 
                    className={`h-full ${skill.color} transition-all duration-1000`} 
                    style={{ width: skill.progress }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION: RECENT ACTIVITY */}
      <div className="w-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4 self-start ml-4">Recent Activity</h3>
        <div className="flex flex-wrap gap-4 px-4">
          {['Quest 1: Reading', 'Quest 2: Reading', 'Quest 3: Listening'].map((quest, i) => (
            <div key={i} className="bg-[#A2BC56] text-black px-6 py-2 rounded-2xl font-medium text-sm shadow-sm border border-black/5">
              {quest}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCard;