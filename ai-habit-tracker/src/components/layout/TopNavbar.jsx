import React, { useState, useEffect } from 'react';
import { Bell, Search, LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const TopNavbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});

  useEffect(() => {
    const refresh = () => setUser(JSON.parse(localStorage.getItem("user")) || {});
    window.addEventListener("xpUpdated", refresh);
    return () => window.removeEventListener("xpUpdated", refresh);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between sticky top-0 z-20 px-7 h-[68px] bg-surface/80 backdrop-blur-xl border-b border-border font-['Outfit']">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');`}</style>

      {/* Search */}
      <div className="relative flex-1 max-w-[360px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={15} />
        <input
          type="text"
          placeholder="Search habits, insights..."
          className="w-full bg-surfaceLight/30 border border-border rounded-full pl-10 pr-4 py-2 text-[13px] text-text placeholder:text-textMuted outline-none"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-[38px] h-[38px] bg-surfaceLight/30 border border-border rounded-[10px] flex items-center justify-center cursor-pointer transition-colors hover:bg-surfaceLight/50"
        >
          {theme === 'dark' ? <Sun size={16} className="text-text" /> : <Moon size={16} className="text-text" />}
        </button>

        {/* Bell */}
        <button className="w-[38px] h-[38px] bg-surfaceLight/30 border border-border rounded-[10px] flex items-center justify-center cursor-pointer relative transition-colors hover:bg-surfaceLight/50">
          <div className="absolute top-2 right-2 w-[7px] h-[7px] bg-danger rounded-full border-2 border-surface" />
          <Bell size={16} className="text-textMuted" />
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-border mx-2" />

        {/* Avatar + Name */}
        <div className="flex items-center gap-[10px]">
          <div className="text-right">
            <div className="text-[13px] font-semibold text-text">{user?.name || "User"}</div>
            <div className="text-[11px] text-textMuted">Level {user?.level ?? 1}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] flex items-center justify-center font-bold text-sm text-white shadow-[0_0_12px_rgba(79,70,229,0.3)]">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-[7px] bg-danger/10 border border-danger/20 rounded-[10px] px-[14px] py-2 text-danger text-[13px] font-semibold cursor-pointer ml-1 transition-all hover:bg-danger/20"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;