import React, { useState, useEffect } from "react";
import { User, Bell, Moon, Sun, Shield, LogOut, Save } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [saved, setSaved] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
    <div className="min-h-screen bg-background text-text p-8 font-sans">
      {saved && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-success/10 border border-success/30 rounded-xl px-5 py-3 text-success text-sm font-medium z-[99] animate-fade-in">
          ✅ Changes saved successfully!
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text tracking-tight mb-1.5">Settings</h1>
        <p className="text-sm text-textMuted">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-surface/30 border border-border/50 rounded-2xl p-7 mb-5">
        <div className="flex items-center mb-6">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center mr-3.5 shrink-0">
            <User size={18} className="text-primary" />
          </div>
          <div>
            <div className="font-semibold text-text">Profile</div>
            <div className="text-xs text-textMuted">Update your display name</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-6">
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-lg shadow-primary/30">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-textMuted mb-2">Display Name</label>
                <input
                  className="w-full bg-surfaceLight/20 border border-border/50 rounded-xl px-4 py-3 text-sm text-text outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-textMuted mb-2">Email Address</label>
                <input
                  className="w-full bg-surfaceLight/10 border border-border/30 rounded-xl px-4 py-3 text-sm text-text/50 cursor-not-allowed"
                  value={email}
                  disabled
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>
        </div>

        <button className="bg-gradient-to-br from-primary to-primaryHover text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95" onClick={saveChanges}>
          <Save size={15} /> Save Changes
        </button>
      </div>

      {/* Preferences */}
      <div className="bg-surface/30 border border-border/50 rounded-2xl p-7 mb-5">
        <div className="flex items-center mb-5">
          <div className="w-9 h-9 bg-cyan-500/10 rounded-xl flex items-center justify-center mr-3.5 shrink-0">
            <Bell size={18} className="text-cyan-500" />
          </div>
          <div>
            <div className="font-semibold text-text">Preferences</div>
            <div className="text-xs text-textMuted">App settings and notifications</div>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-border/30">
          <div>
            <div className="text-sm font-medium text-text">Dark Theme</div>
            <div className="text-xs text-textMuted mt-0.5">Switch between light and dark modes</div>
          </div>
          <button
            className={`w-[46px] h-[26px] rounded-full relative transition-all duration-300 ${theme === 'dark' ? 'bg-primary' : 'bg-surfaceLight'}`}
            onClick={toggleTheme}
          >
            <div className={`absolute top-0.5 left-0.5 w-[22px] h-[22px] bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${theme === 'dark' ? 'translate-x-[20px]' : ''}`}>
              {theme === 'dark' ? <Moon size={12} className="text-primary" /> : <Sun size={12} className="text-amber-500" />}
            </div>
          </button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <div className="text-sm font-medium text-text">Daily Reminders</div>
            <div className="text-xs text-textMuted mt-0.5">Get notified to log your habits</div>
          </div>
          <button
            className={`w-[46px] h-[26px] rounded-full relative transition-all duration-300 ${notifications ? 'bg-primary' : 'bg-surfaceLight'}`}
            onClick={() => setNotifications(!notifications)}
          >
            <div className={`absolute top-0.5 left-0.5 w-[22px] h-[22px] bg-white rounded-full shadow-md transition-transform duration-300 ${notifications ? 'translate-x-[20px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="bg-surface/30 border border-border/50 rounded-2xl p-7">
        <div className="flex items-center mb-5">
          <div className="w-9 h-9 bg-danger/10 rounded-xl flex items-center justify-center mr-3.5 shrink-0">
            <Shield size={18} className="text-danger" />
          </div>
          <div>
            <div className="font-semibold text-text">Account</div>
            <div className="text-xs text-textMuted">Manage your session</div>
          </div>
        </div>
        <button className="bg-danger/10 border border-danger/20 text-danger px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-danger/20 transition-all active:scale-95" onClick={logout}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
