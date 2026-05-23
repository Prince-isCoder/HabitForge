import React, { useState, useEffect } from "react";
import { User, Bell, Moon, Sun, Shield, LogOut, Save } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(false);
  const [saved, setSaved] = useState(false);

  // ✅ Load user from localStorage on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, []);

  // ✅ Save changes to localStorage
  const saveChanges = () => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const updated = { ...user, name };
    localStorage.setItem("user", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", minHeight: "100vh", background: "var(--background)", color: "var(--text)", padding: "32px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .s-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 18px; padding: 28px; margin-bottom: 20px; }
        .s-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; display: block; }
        .s-input { width: 100%; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 12px 16px; font-size: 14px; color: var(--text); font-family: 'Outfit',sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
        .s-input:focus { border-color: rgba(79,70,229,0.5); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
        .s-input:disabled { opacity: 0.4; cursor: not-allowed; }
        .save-btn { background: linear-gradient(135deg,#4f46e5,#4338ca); border: none; border-radius: 12px; color: #fff; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit',sans-serif; display: flex; align-items: center; gap: 8px; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 16px rgba(79,70,229,0.3); }
        .save-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(79,70,229,0.4); }
        .logout-btn { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; color: #fca5a5; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit',sans-serif; display: flex; align-items: center; gap: 8px; transition: background 0.2s, border-color 0.2s; }
        .logout-btn:hover { background: rgba(239,68,68,0.14); border-color: rgba(239,68,68,0.35); }
        .toggle-wrap { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border); }
        .toggle-wrap:last-child { border-bottom: none; padding-bottom: 0; }
        .toggle { width: 46px; height: 26px; background: var(--border); border-radius: 99px; cursor: pointer; position: relative; transition: background 0.25s; border: none; flex-shrink: 0; }
        .toggle.on { background: linear-gradient(135deg,#4f46e5,#4338ca); }
        .toggle-dot { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: transform 0.25s; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
        .toggle.on .toggle-dot { transform: translateX(20px); }
        .section-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; margin-right: 14px; flex-shrink: 0; }
        .success-toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 12px 20px; color: #6ee7b7; font-size: 14px; font-weight: 500; z-index: 99; animation: popIn 0.2s ease; }
        @keyframes popIn { from { opacity:0; transform: translateX(-50%) translateY(-8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      {saved && <div className="success-toast">✅ Changes saved successfully!</div>}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", margin: "0 0 6px" }}>Settings</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="s-card">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div className="section-icon" style={{ background: "rgba(99,102,241,0.1)" }}><User size={18} color="#818cf8" /></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text)" }}>Profile</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Update your display name</div>
          </div>
        </div>

        <div style={{ display: "flex", align: "center", gap: 32, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff", flexShrink: 0, boxShadow: "0 0 24px rgba(79,70,229,0.35)" }}>
            {name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="s-label">Display Name</label>
                <input className="s-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="s-label">Email Address</label>
                <input className="s-input" value={email} disabled placeholder="your@email.com" />
              </div>
            </div>
          </div>
        </div>

        <button className="save-btn" onClick={saveChanges}>
          <Save size={15} /> Save Changes
        </button>
      </div>

      {/* Preferences */}
      <div className="s-card">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <div className="section-icon" style={{ background: "rgba(6,182,212,0.1)" }}><Bell size={18} color="#22d3ee" /></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text)" }}>Preferences</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>App settings and notifications</div>
          </div>
        </div>

        <div className="toggle-wrap">
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Toggle between light and dark modes</div>
          </div>
          <button className={`toggle ${theme === 'dark' ? "on" : ""}`} onClick={toggleTheme}>
            <div className="toggle-dot" />
          </button>
        </div>

        <div className="toggle-wrap">
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Daily Reminders</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Get notified to log your habits</div>
          </div>
          <button className={`toggle ${notifications ? "on" : ""}`} onClick={() => setNotifications(!notifications)}>
            <div className="toggle-dot" />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="s-card">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <div className="section-icon" style={{ background: "rgba(239,68,68,0.08)" }}><Shield size={18} color="#fca5a5" /></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text)" }}>Account</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Manage your session</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
