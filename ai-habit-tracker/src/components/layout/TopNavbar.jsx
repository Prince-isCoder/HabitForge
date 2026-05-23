import React, { useState, useEffect } from 'react';
import { Bell, Search, LogOut, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const TopNavbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const { theme, toggleTheme } = useTheme();

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
    <header style={{ height: 68, background: "var(--navbar-bg)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 20, fontFamily: "'Outfit',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');`}</style>

      {/* Search */}
      <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
        <Search style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={15} />
        <input
          type="text"
          placeholder="Search habits, insights..."
          style={{ width: "100%", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 99, paddingLeft: 38, paddingRight: 16, paddingTop: 9, paddingBottom: 9, fontSize: 13, color: "var(--text-muted)", fontFamily: "'Outfit',sans-serif", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{ width: 38, height: 38, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginRight: 8 }}
        >
          {theme === 'dark' ? <Sun size={16} color="var(--text-muted)" /> : <Moon size={16} color="var(--text-muted)" />}
        </button>

        {/* Bell */}
        <button style={{ width: 38, height: 38, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
          <div style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, background: "#ef4444", borderRadius: "50%", border: "2px solid var(--background)" }} />
          <Bell size={16} color="var(--text-muted)" />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "var(--border)", margin: "0 8px" }} />

        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{user?.name || "User"}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Level {user?.level ?? 1}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff", boxShadow: "0 0 12px rgba(79,70,229,0.3)" }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 10, padding: "8px 14px", color: "#fca5a5", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", marginLeft: 4, transition: "background 0.2s" }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
