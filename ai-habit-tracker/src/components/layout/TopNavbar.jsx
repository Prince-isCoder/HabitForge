import React, { useState, useEffect } from 'react';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const TopNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});

  useEffect(() => {
    const refresh = () => setUser(JSON.parse(localStorage.getItem("user")) || {});
    window.addEventListener("xpUpdated", refresh);
    return () => window.removeEventListener("xpUpdated", refresh);
  }, []);

  return (
    <header className="h-20 bg-surface/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-20">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted/50" size={18} />
        <input
          type="text"
          placeholder="Search habits, trends..."
          className="w-full bg-background border border-border/50 rounded-2xl pl-12 pr-4 py-2.5 text-sm text-text outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-background border border-border/50 rounded-xl text-textMuted hover:text-primary hover:border-primary/30 transition-all relative group"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Bell */}
        <button className="p-2.5 bg-background border border-border/50 rounded-xl text-textMuted hover:text-primary hover:border-primary/30 transition-all relative group">
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-surface group-hover:scale-110 transition-transform" />
          <Bell size={20} />
        </button>

        <div className="w-px h-8 bg-border/50 mx-2" />

        {/* Level Badge */}
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 px-4 py-2 rounded-xl">
           <div className="text-right">
             <div className="text-xs font-bold text-primary uppercase tracking-widest leading-tight">Level {user?.level ?? 1}</div>
             <div className="text-[10px] text-textMuted font-semibold uppercase tracking-wider">{user?.levelName || "Beginner"}</div>
           </div>
           <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-primary/20">
             {user?.level ?? 1}
           </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;