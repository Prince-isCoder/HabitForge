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
    <header className="h-[68px] bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-7 sticky top-0 z-20 font-sans">
      {/* Search */}
      <div className="relative flex-1 max-w-[360px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" size={15} />
        <input
          type="text"
          placeholder="Search habits, insights..."
          className="w-full bg-surfaceLight/20 border border-border/50 rounded-full pl-10 pr-4 py-2 text-[13px] text-text placeholder:text-textMuted/50 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Bell */}
        <button className="w-[38px] h-[38px] bg-surfaceLight/20 border border-border/50 rounded-xl flex items-center justify-center cursor-pointer relative hover:bg-surfaceLight/40 transition-colors">
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger rounded-full border-2 border-background" />
          <Bell size={16} className="text-textMuted" />
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-border mx-2" />

        {/* Avatar + Name */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <div className="text-[13px] font-semibold text-text">{user?.name || "User"}</div>
            <div className="text-[11px] text-textMuted">Level {user?.level ?? 1}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center font-bold text-sm text-white shadow-sm shadow-primary/25">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl px-3.5 py-2 text-danger text-[13px] font-semibold cursor-pointer hover:bg-danger/20 transition-all ml-1"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
