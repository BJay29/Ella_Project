import React from 'react';

const Footer = ({ variant = "login" }) => {
 
  const textStyle = variant === "register" 
    ? "text-gray-700 font-bold" 
    : "text-gray-400 font-medium"; 

  return (
    <div className="absolute bottom-4 text-center px-4 w-full left-0 right-0 pointer-events-none z-50">
      <p className={`text-[8px] md:text-[9px] leading-tight max-w-[600px] mx-auto italic pointer-events-auto ${textStyle}`}>
        An interactive language center is a system that engages students 
        through active learning tools and encourages consistent language practice.
      </p>
    </div>
  );
};

export default Footer;