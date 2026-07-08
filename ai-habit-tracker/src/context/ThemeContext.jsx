import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/* eslint-disable react-refresh/only-export-components */
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || localStorage.getItem('theme') || 'dark';
  });
  const [theme, setTheme] = useState('dark'); // 'light' or 'dark'

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (mode) => {
      let visualTheme = mode;
      if (mode === 'system') {
        visualTheme = mediaQuery.matches ? 'dark' : 'light';
      }

      if (visualTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      setTheme(visualTheme);
    };

    applyTheme(themeMode);
    localStorage.setItem('themeMode', themeMode);

    const handleChange = () => {
      if (themeMode === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
