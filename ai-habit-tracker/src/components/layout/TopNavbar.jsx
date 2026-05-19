import React, { useState, useEffect } from 'react';
import { Bell, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopNavbar = () => {
  const navigate = useNavigate();
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
    <header className="h-[68px] bg-surface/85 backdrop-blur-2xl border-b border-border/50 flex items-center justify-between px-7 sticky top-0 z-20 font-['Outfit']">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');`}</style>

      {/* Search */}
      <div className="relative flex-1 max-w-[360px]">
        <Search className="absolute left-[13px] top-1/2 -translate-y-1/2 text-textMuted/60" size={15} />
        <input
          type="text"
          placeholder="Search habits, insights..."
          className="w-full bg-surfaceLight/40 border border-border/50 rounded-full pl-[38px] pr-4 py-[9px] text-[13px] text-textMuted font-['Outfit'] outline-none box-border focus:border-primary/40 transition-colors"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Bell */}
        <button className="w-[38px] h-[38px] bg-surfaceLight/40 border border-border/50 rounded-xl flex items-center justify-center cursor-pointer relative hover:bg-surfaceLight/60 transition-colors">
          <div className="absolute top-2 right-2 w-[7px] h-[7px] bg-danger rounded-full border-2 border-surface" />
          <Bell size={16} className="text-textMuted" />
        </button>

        {/* Divider */}
        <div className="w-[1px] h-7 bg-border/50 mx-2" />

        {/* Avatar + Name */}
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <div className="text-[13px] font-semibold text-text">{user?.name || "User"}</div>
            <div className="text-[11px] text-textMuted">Level {user?.level ?? 1}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-primary/30">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 bg-danger/5 border border-danger/20 rounded-xl px-[14px] py-2 text-danger text-[13px] font-semibold cursor-pointer font-['Outfit'] ml-1 transition-all hover:bg-danger/10"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;