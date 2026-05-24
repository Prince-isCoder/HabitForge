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
    const loadUser = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        setName(user.name || "");
        setEmail(user.email || "");
      }
    };
    loadUser();
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
    <div className="min-h-screen bg-background text-text p-8 font-['Outfit']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .s-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 28px; margin-bottom: 20px; }
        .s-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--textMuted); margin-bottom: 8px; display: block; }
        .s-input { width: 100%; background: var(--surfaceLight); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; font-size: 14px; color: var(--text); font-family: 'Outfit',sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
        .s-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 10%, transparent); }
        .s-input:disabled { opacity: 0.4; cursor: not-allowed; }
        .save-btn { background: linear-gradient(135deg,#4f46e5,#4338ca); border: none; border-radius: 12px; color: #fff; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit',sans-serif; display: flex; align-items: center; gap: 8px; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 16px rgba(79,70,229,0.3); }
        .save-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(79,70,229,0.4); }
        .logout-btn { background: color-mix(in srgb, var(--danger) 8%, transparent); border: 1px solid color-mix(in srgb, var(--danger) 20%, transparent); border-radius: 12px; color: var(--danger); padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit',sans-serif; display: flex; align-items: center; gap: 8px; transition: background 0.2s, border-color 0.2s; }
        .logout-btn:hover { background: color-mix(in srgb, var(--danger) 14%, transparent); border-color: color-mix(in srgb, var(--danger) 35%, transparent); }
        .toggle-wrap { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border); }
        .toggle-wrap:last-child { border-bottom: none; padding-bottom: 0; }
        .toggle { width: 46px; height: 26px; background: var(--surfaceLight); border-radius: 99px; cursor: pointer; position: relative; transition: background 0.25s; border: 1px solid var(--border); flex-shrink: 0; }
        .toggle.on { background: linear-gradient(135deg,#4f46e5,#4338ca); border-color: transparent; }
        .toggle-dot { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: transform 0.25s; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
        .toggle.on .toggle-dot { transform: translateX(20px); }
        .section-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; margin-right: 14px; flex-shrink: 0; }
        .success-toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: color-mix(in srgb, var(--success) 10%, transparent); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); border-radius: 12px; padding: 12px 20px; color: var(--success); font-size: 14px; font-weight: 500; z-index: 99; animation: popIn 0.2s ease; }
        @keyframes popIn { from { opacity:0; transform: translateX(-50%) translateY(-8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      {saved && <div className="success-toast">✅ Changes saved successfully!</div>}

      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-text tracking-tight mb-1.5">Settings</h1>
        <p className="text-[14px] text-textMuted m-0">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="s-card">
        <div className="flex items-center mb-6">
          <div className="section-icon bg-primary/10"><User size={18} className="text-primary" /></div>
          <div>
            <div className="font-semibold text-base text-text">Profile</div>
            <div className="text-xs text-textMuted">Update your display name</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-6">
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] flex items-center justify-center text-[28px] font-bold text-white flex-shrink-0 shadow-[0_0_24px_rgba(79,70,229,0.35)]">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="flex items-center mb-5">
          <div className="section-icon bg-cyan-500/10"><Bell size={18} className="text-cyan-500" /></div>
          <div>
            <div className="font-semibold text-base text-text">Preferences</div>
            <div className="text-xs text-textMuted">App settings and notifications</div>
          </div>
        </div>

        <div className="toggle-wrap">
          <div>
            <div className="text-[14px] font-medium text-text">Dark Theme</div>
            <div className="text-xs text-textMuted mt-[2px]">Toggle between light and dark mode</div>
          </div>
          <button className={`toggle ${theme === 'dark' ? "on" : ""}`} onClick={toggleTheme}>
            <div className="toggle-dot" />
          </button>
        </div>

        <div className="toggle-wrap">
          <div>
            <div className="text-[14px] font-medium text-text">Daily Reminders</div>
            <div className="text-xs text-textMuted mt-[2px]">Get notified to log your habits</div>
          </div>
          <button className={`toggle ${notifications ? "on" : ""}`} onClick={() => setNotifications(!notifications)}>
            <div className="toggle-dot" />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="s-card">
        <div className="flex items-center mb-5">
          <div className="section-icon bg-danger/10"><Shield size={18} className="text-danger" /></div>
          <div>
            <div className="font-semibold text-base text-text">Account</div>
            <div className="text-xs text-textMuted">Manage your session</div>
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
