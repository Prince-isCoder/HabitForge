import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/* eslint-disable react-refresh/only-export-components */
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || localStorage.getItem('theme') || 'system';
  });
  const [theme, setTheme] = useState(() => {
    const savedMode = localStorage.getItem('themeMode') || localStorage.getItem('theme') || 'system';
    if (savedMode === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'dark'; // fallback
    }
    return savedMode;
  });

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
