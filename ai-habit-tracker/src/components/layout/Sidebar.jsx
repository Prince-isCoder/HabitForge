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
    <aside className="w-[240px] min-h-screen bg-surface border-r border-border flex flex-col font-['Outfit'] sticky top-0 backdrop-blur-xl z-30 flex-shrink-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        .nav-link-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--textMuted);
          text-decoration: none;
          transition: all 0.18s ease;
          position: relative;
          margin-bottom: 2px;
        }
        .nav-link-item:hover {
          color: var(--text);
          background: var(--surfaceLight);
        }
        .nav-link-item.active {
          color: var(--text);
          background: color-mix(in srgb, var(--primary) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
        }
        .nav-link-item.active .nav-icon {
          color: var(--primary);
        }
        .nav-link-item .nav-icon {
          transition: color 0.18s;
          flex-shrink: 0;
        }
        .nav-link-item:hover .nav-icon {
          color: var(--primary);
        }
        .active-dot {
          width: 6px; height: 6px;
          background: var(--primary);
          border-radius: 50%;
          margin-left: auto;
          box-shadow: 0 0 8px var(--primary);
        }

        .upgrade-card {
          background: color-mix(in srgb, var(--primary) 7%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary) 18%, transparent);
          border-radius: 16px;
          padding: 18px;
          margin: 0 12px 16px;
          transition: border-color 0.2s, background 0.2s;
          cursor: default;
        }
        .upgrade-card:hover {
          background: color-mix(in srgb, var(--primary) 11%, transparent);
          border-color: color-mix(in srgb, var(--primary) 30%, transparent);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--textMuted);
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          width: 100%;
          transition: all 0.18s;
        }
        .logout-btn:hover {
          color: var(--danger);
          background: color-mix(in srgb, var(--danger) 7%, transparent);
        }

        .sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 8px 0;
        }
      `}</style>

      {/* ── Brand ── */}
      <div className="p-[24px_20px_20px] flex items-center gap-3 border-b border-border mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] rounded-xl flex items-center justify-center text-[20px] shadow-[0_0_20px_rgba(79,70,229,0.35)] flex-shrink-0">
          🔥
        </div>
        <div>
          <div className="text-base font-bold text-text tracking-tight">
            HabitForge
          </div>
          <div className="text-[11px] text-textMuted font-normal mt-[1px]">
            AI Habit Tracker
          </div>
        </div>
      </div>

      {/* ── User pill ── */}
      <div className="flex items-center gap-[10px] m-[0_12px_16px] p-[10px_12px] bg-surfaceLight/30 border border-border rounded-xl">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 shadow-[0_0_10px_rgba(79,70,229,0.25)]">
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

      {/* ── Nav ── */}
      <nav className="flex-1 p-[0_12px] overflow-y-auto">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-textMuted/50 p-[4px_6px_10px] mt-1">
          Navigation
        </div>

        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
          >
            <Icon size={17} className="nav-icon" />
            {label}
            <ActiveDot path={path} />
          </NavLink>
        ))}

        <div className="sidebar-divider my-4" />

        {/* Logout in nav */}
        <button className="logout-btn" onClick={logout}>
          <LogOut size={17} className="flex-shrink-0" />
          Sign Out
        </button>
      </nav>

      {/* ── Upgrade card ── */}
      {/* ✅ XP Progress Card */}
      <div className="upgrade-card">
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-primary" />
            <span className="text-[13px] font-bold text-text">
              Level {level} — {levelName}
            </span>
          </div>
          <span className="text-[11px] text-textMuted font-medium">
            {xp % 100}/100 XP
          </span>
        </div>

        {/* XP bar */}
        <div className="h-[6px] bg-surfaceLight border border-border rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-[#4f46e5] to-[#06b6d4] rounded-full transition-[width] duration-500 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            style={{ width: `${xpPct}%` }}
          />
        </div>

        <div className="text-[11px] text-textMuted">
          {100 - (xp % 100)} XP to Level {level + 1}
        </div>
      </div>

    </aside>
  );
};

/* Tiny helper — shows active dot only when route matches */
const ActiveDot = ({ path }) => {
  const current = window.location.pathname;
  const isActive = path === "/" ? current === "/" : current.startsWith(path);
  return isActive ? <span className="active-dot" /> : null;
};

export default Sidebar;
