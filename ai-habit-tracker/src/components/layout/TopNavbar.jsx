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
    <header style={{ height: 68, background: "rgba(10,12,18,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 20, fontFamily: "'Outfit',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');`}</style>

      {/* Search */}
      <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
        <Search style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#334155" }} size={15} />
        <input
          type="text"
          placeholder="Search habits, insights..."
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 99, paddingLeft: 38, paddingRight: 16, paddingTop: 9, paddingBottom: 9, fontSize: 13, color: "#94a3b8", fontFamily: "'Outfit',sans-serif", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Bell */}
        <button style={{ width: 38, height: 38, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
          <div style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, background: "#ef4444", borderRadius: "50%", border: "2px solid #0a0c12" }} />
          <Bell size={16} color="#475569" />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.07)", margin: "0 8px" }} />

        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{user?.name || "User"}</div>
            <div style={{ fontSize: 11, color: "#475569" }}>Level {user?.level ?? 1}</div>
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