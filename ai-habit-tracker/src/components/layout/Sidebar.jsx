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
    <aside className="w-60 min-h-screen bg-surface border-r border-border flex flex-col font-sans sticky top-0 backdrop-blur-xl z-30 shrink-0">
      <style>{`
        .nav-link-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.18s ease;
          position: relative;
          margin-bottom: 2px;
        }
        .nav-link-item:hover {
          color: var(--text);
          background: rgba(var(--primary), 0.04);
        }
        .nav-link-item.active {
          color: var(--text);
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .nav-link-item.active .nav-icon {
          color: var(--primary);
        }
        .nav-link-item .nav-icon {
          transition: color 0.18s;
          flex-shrink: 0;
        }
        .active-dot {
          width: 6px; height: 6px;
          background: var(--primary);
          border-radius: 50%;
          margin-left: auto;
          box-shadow: 0 0 8px var(--primary);
        }
      `}</style>

      {/* Brand */}
      <div className="p-6 pb-5 flex items-center gap-3 border-b border-border mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-cyan-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-primary/30 shrink-0">
          🔥
        </div>
        <div>
          <div className="text-base font-bold text-text tracking-tight">HabitForge</div>
          <div className="text-[11px] text-textMuted font-normal mt-0.5">AI Habit Tracker</div>
        </div>
      </div>

      {/* User pill */}
      <div className="flex items-center gap-2.5 mx-3 mb-4 p-2.5 bg-surfaceLight/30 border border-border/50 rounded-xl">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-[13px] font-bold text-white shrink-0 shadow-sm shadow-primary/25">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-text truncate">
            {user?.name || "User"}
          </div>
          <div className="text-[11px] text-textMuted">
            Level {level} · {levelName}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="text-[10px] font-bold tracking-widest uppercase text-textMuted/60 px-1.5 pb-2.5 mt-1">
          Navigation
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
          >
            <item.icon size={17} className="nav-icon" />
            {item.label}
            <ActiveDot path={item.path} />
          </NavLink>
        ))}

        <div className="h-px bg-border my-4 mx-1" />

        <button className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-textMuted hover:text-danger hover:bg-danger/10 w-full transition-all" onClick={logout}>
          <LogOut size={17} className="shrink-0" />
          Sign Out
        </button>
      </nav>

      {/* XP Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4.5 mx-3 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-primary" />
            <span className="text-[13px] font-bold text-text">
              Level {level}
            </span>
          </div>
          <span className="text-[11px] text-textMuted font-medium">
            {xp % 100}/100 XP
          </span>
        </div>

        <div className="h-1.5 bg-textMuted/10 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" style={{ width: `${xpPct}%` }} />
        </div>

        <div className="text-[11px] text-textMuted/70">
          {100 - (xp % 100)} XP to Level {level + 1}
        </div>
      </div>
    </aside>
  );
};

const ActiveDot = ({ path }) => {
  const current = window.location.pathname;
  const isActive = path === "/" ? current === "/" : current.startsWith(path);
  return isActive ? <span className="active-dot" /> : null;
};

export default Sidebar;
