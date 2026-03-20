import React, { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('ellaDarkMode') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ellaDarkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((v) => !v);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
