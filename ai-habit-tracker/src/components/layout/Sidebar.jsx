import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CheckSquare, Bot, BarChart2,
  Settings, LogOut, Flame, ChevronRight, Zap
} from "lucide-react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/habits", icon: CheckSquare, label: "Habits" },
  { path: "/coach", icon: Bot, label: "AI Coach" },
  { path: "/analytics", icon: BarChart2, label: "Analytics" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});

  // ✅ Re-read user from localStorage whenever XP updates
  useEffect(() => {
    const refresh = () => setUser(JSON.parse(localStorage.getItem("user")) || {});
    window.addEventListener("xpUpdated", refresh);
    return () => window.removeEventListener("xpUpdated", refresh);
  }, []);

  const xp = user.xp ?? 0;
  const level = user.level ?? 1;
  const levelName = user.levelName ?? "Beginner";
  const xpPct = Math.min(100, Math.round((xp % 100) / 100 * 100));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-[260px] min-h-screen bg-surface border-r border-border flex flex-col sticky top-0 z-30 shrink-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        .nav-link-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          @apply text-textMuted;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          margin-bottom: 4px;
        }
        .nav-link-item:hover {
          @apply text-text bg-surfaceLight/50;
        }
        .nav-link-item.active {
          @apply text-primary bg-primary/5;
        }
        .nav-link-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 4px;
          @apply bg-primary rounded-r-full;
        }
        .nav-link-item .nav-icon {
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .upgrade-card {
          @apply bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 mx-4 mb-6 transition-all;
          cursor: default;
        }
      `}</style>

      {/* ── Brand ── */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-xl shadow-lg shadow-primary/20 shrink-0 text-white">
          🔥
        </div>
        <div>
          <div className="text-lg font-bold text-text tracking-tight leading-none">
            HabitForge
          </div>
          <div className="text-[11px] text-textMuted font-medium mt-1 uppercase tracking-wider">
            AI tracking
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-textMuted/50 px-3 pb-4 mt-2">
          Menu
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
          >
            <item.icon size={18} className="nav-icon" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}

        <div className="h-px bg-border/50 my-6 mx-3" />

        {/* User section in sidebar bottom if needed, but for now just logout */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-textMuted hover:text-danger hover:bg-danger/5 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </nav>

      {/* ── User & XP ── */}
      <div className="p-4 mt-auto">
        <div className="upgrade-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white shadow-md shadow-primary/20">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-text truncate">
                {user?.name || "User"}
              </div>
              <div className="text-[11px] text-textMuted font-semibold uppercase tracking-wider">
                Lvl {level} · {levelName}
              </div>
            </div>
          </div>

          <div className="h-1.5 bg-background rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"
              style={{ width: `${xpPct}%` }}
            />
          </div>

          <div className="text-[10px] text-textMuted font-bold text-right uppercase tracking-widest">
             {xp % 100} / 100 XP
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;