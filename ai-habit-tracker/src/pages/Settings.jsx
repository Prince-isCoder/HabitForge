import React, { useState, useEffect } from "react";
import { User, Bell, Moon, Shield, LogOut, Save, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [saved, setSaved] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

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
    <div className="font-['Outfit'] min-h-screen bg-background text-text p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .s-card { @apply bg-surfaceLight/30 border border-border/60 rounded-[18px] p-7 mb-5; }
        .s-label { @apply text-[11px] font-bold tracking-[0.08em] uppercase text-textMuted mb-2 block; }
        .s-input { @apply w-full bg-surfaceLight/50 border border-border/80 rounded-xl px-4 py-3 text-sm text-text font-['Outfit'] outline-none transition-all box-border focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(var(--primary-rgb),0.1)]; }
        .s-input:disabled { @apply opacity-40 cursor-not-allowed; }
        .save-btn { @apply bg-gradient-to-br from-primary to-primaryHover border-none rounded-xl text-white px-6 py-3 text-sm font-semibold cursor-pointer font-['Outfit'] flex items-center gap-2 transition-all shadow-lg shadow-primary/30; }
        .save-btn:hover { @apply -translate-y-px shadow-xl shadow-primary/40; }
        .logout-btn { @apply bg-danger/5 border border-danger/20 rounded-xl text-danger px-6 py-3 text-sm font-semibold cursor-pointer font-['Outfit'] flex items-center gap-2 transition-all hover:bg-danger/10; }
        .toggle-wrap { @apply flex items-center justify-between py-4 border-b border-border/40; }
        .toggle-wrap:last-child { @apply border-b-0 pb-0; }
        .toggle { @apply w-[46px] h-[26px] bg-surfaceLight/80 rounded-full cursor-pointer relative transition-colors border-none shrink-0; }
        .toggle.on { @apply bg-gradient-to-br from-primary to-primaryHover; }
        .toggle-dot { @apply absolute top-0.5 left-0.5 w-[22px] h-[22px] bg-white rounded-full transition-transform shadow-md; }
        .toggle.on .toggle-dot { transform: translateX(20px); }
        .section-icon { @apply w-[38px] h-[38px] rounded-xl flex items-center justify-center mr-3.5 shrink-0; }
        .success-toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); @apply bg-success/10 border border-success/30 rounded-xl px-5 py-3 text-success text-sm font-medium z-[99]; animation: popIn 0.2s ease; }
        @keyframes popIn { from { opacity:0; transform: translateX(-50%) translateY(-8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      {saved && <div className="success-toast">✅ Changes saved successfully!</div>}

      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-text tracking-tight m-[0_0_6px]">Settings</h1>
        <p className="text-sm text-textMuted m-0">Manage your profile and preferences</p>
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

        <div className="flex items-center gap-8 mb-6">
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-[28px] font-bold text-white shrink-0 shadow-xl shadow-primary/35">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1">
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
            <div className="text-sm font-medium text-text">Dark Theme</div>
            <div className="text-xs text-textMuted mt-0.5">Toggle between light and dark mode</div>
          </div>
          <button className={`toggle ${isDark ? "on" : ""}`} onClick={toggleTheme}>
            <div className="toggle-dot flex items-center justify-center">
              {isDark ? <Moon size={12} className="text-primary" /> : <Sun size={12} className="text-orange-400" />}
            </div>
          </button>
        </div>

        <div className="toggle-wrap">
          <div>
            <div className="text-sm font-medium text-text">Daily Reminders</div>
            <div className="text-xs text-textMuted mt-0.5">Get notified to log your habits</div>
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