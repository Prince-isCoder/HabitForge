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
  const xpForNext = user.xpForNext ?? 100;
  const xpPct = Math.min(100, Math.round((xp % 100) / 100 * 100));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside style={{
      width: 240,
      minHeight: "100vh",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Outfit', sans-serif",
      position: "sticky",
      top: 0,
      backdropFilter: "blur(20px)",
      zIndex: 30,
      flexShrink: 0,
      transition: "background 0.2s, border-color 0.2s"
    }}>
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
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.18s ease;
          position: relative;
          margin-bottom: 2px;
        }
        .nav-link-item:hover {
          color: var(--text);
          background: var(--surface-light);
        }
        .nav-link-item.active {
          color: var(--primary);
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.2);
        }
        .nav-link-item.active .nav-icon {
          color: #818cf8;
        }
        .nav-link-item .nav-icon {
          transition: color 0.18s;
          flex-shrink: 0;
        }
        .nav-link-item:hover .nav-icon {
          color: #6366f1;
        }
        .active-dot {
          width: 6px; height: 6px;
          background: #6366f1;
          border-radius: 50%;
          margin-left: auto;
          box-shadow: 0 0 8px rgba(99,102,241,0.6);
        }

        .upgrade-card {
          background: var(--surface-light);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 18px;
          margin: 0 12px 16px;
          transition: border-color 0.2s, background 0.2s;
          cursor: default;
        }
        .upgrade-card:hover {
          background: rgba(99,102,241,0.11);
          border-color: rgba(99,102,241,0.3);
        }
        .upgrade-btn {
          width: 100%;
          background: linear-gradient(135deg, #4f46e5, #4338ca);
          border: none;
          border-radius: 10px;
          color: #fff;
          padding: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          margin-top: 12px;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 14px rgba(79,70,229,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .upgrade-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(79,70,229,0.4);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          width: 100%;
          transition: all 0.18s;
        }
        .logout-btn:hover {
          color: #fca5a5;
          background: rgba(239,68,68,0.07);
        }

        .sidebar-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 8px 0;
        }
      `}</style>

      {/* ── Brand ── */}
      <div style={{
        padding: "24px 20px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid var(--border)",
        marginBottom: 12,
      }}>
        <div style={{
          width: 40, height: 40,
          background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
          boxShadow: "0 0 20px rgba(79,70,229,0.35)",
          flexShrink: 0,
        }}>
          🔥
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
            HabitForge
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400, marginTop: 1 }}>
            AI Habit Tracker
          </div>
        </div>
      </div>

      {/* ── User pill ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "0 12px 16px",
        padding: "10px 12px",
        background: "var(--surface-light)",
        border: "1px solid var(--border)",
        borderRadius: 12,
      }}>
        <div style={{
          width: 32, height: 32,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff",
          flexShrink: 0,
          boxShadow: "0 0 10px rgba(79,70,229,0.25)",
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.name || "User"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Level {level} · {levelName}
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", padding: "4px 6px 10px", marginTop: 4 }}>
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
            {/* active dot added via CSS class check below */}
            <ActiveDot path={path} />
          </NavLink>
        ))}

        <div className="sidebar-divider" style={{ margin: "16px 0 12px" }} />

        {/* Logout in nav */}
        <button className="logout-btn" onClick={logout}>
          <LogOut size={17} style={{ flexShrink: 0 }} />
          Sign Out
        </button>
      </nav>

      {/* ── Upgrade card ── */}
      {/* ✅ XP Progress Card */}
      <div className="upgrade-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={15} color="#818cf8" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
              Level {level} — {levelName}
            </span>
          </div>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
            {xp % 100}/100 XP
          </span>
        </div>

        {/* XP bar */}
        <div style={{ height: 6, background: "rgba(0,0,0,0.1)", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
          <div style={{
            height: "100%",
            width: `${xpPct}%`,
            background: "linear-gradient(90deg,#4f46e5,#06b6d4)",
            borderRadius: 99,
            transition: "width 0.5s ease",
            boxShadow: "0 0 8px rgba(99,102,241,0.5)"
          }} />
        </div>

        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
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