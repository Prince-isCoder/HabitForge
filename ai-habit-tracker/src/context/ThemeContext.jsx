import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/* eslint-disable react-refresh/only-export-components */
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || localStorage.getItem('theme') || 'system';
  });

  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (resolvedTheme) => {
      setTheme(resolvedTheme);
      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => applyTheme(e.matches ? 'dark' : 'light');

      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(themeMode);
    }

    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    // Standard toggle between light and dark for quick actions
    setThemeMode((prev) => {
      const currentVisual = prev === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : prev;
      return currentVisual === 'dark' ? 'light' : 'dark';
    });
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
