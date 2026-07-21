import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const getInitialThemeMode = () => {
  return localStorage.getItem('themeMode') || localStorage.getItem('theme') || 'system';
};

const getDerivedTheme = (mode) => {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
};

/* eslint-disable react-refresh/only-export-components */
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => getInitialThemeMode());
  const [theme, setTheme] = useState(() => {
    const mode = getInitialThemeMode();
    const visualTheme = getDerivedTheme(mode);
    const root = window.document.documentElement;
    if (visualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    return visualTheme;
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
