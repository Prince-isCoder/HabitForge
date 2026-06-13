import React, { useState } from "react";
import { User, Bell, Moon, Shield, LogOut, Save, Sun, Mail, Key } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
  const [name, setName] = useState(() => {
    const userStr = localStorage.getItem("user");
    return userStr ? (JSON.parse(userStr).name || "") : "";
  });
  const [email] = useState(() => {
    const userStr = localStorage.getItem("user");
    return userStr ? (JSON.parse(userStr).email || "") : "";
  });
  const [notifications, setNotifications] = useState(false);
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();

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
    <div className="min-h-screen bg-background text-text p-8 animate-fade-in">
      {saved && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-surface border border-success/30 rounded-2xl px-6 py-4 text-success font-bold z-[99] flex gap-4 items-center shadow-xl animate-popIn">
          <span>✅</span> Profile updated successfully
        </div>
      )}

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Settings</h1>
        <p className="text-lg text-textMuted m-0">Customize your experience and manage account</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 space-y-8">
          {/* Profile Section */}
          <div className="card !p-8">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Personal Profile</h3>
                <p className="text-sm text-textMuted font-medium">Public display information</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-12 mb-10">
              <div className="flex flex-col items-center gap-4 group">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primaryHover flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform">
                  {name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <button className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] hover:underline">Change Avatar</button>
              </div>

              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted/40" />
                    <input className="input-field !pl-12" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted/40" />
                    <input className="input-field !pl-12 !opacity-60 !bg-surfaceLight" value={email} disabled placeholder="you@example.com" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
               <button className="btn btn-primary px-8 py-3 rounded-2xl gap-2" onClick={saveChanges}>
                 <Save size={18} /> Update Profile
               </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="card !p-8">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Bell size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Preferences</h3>
                <p className="text-sm text-textMuted font-medium">App behavior & visual style</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all group text-left ${
                    theme === 'light'
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : 'bg-surfaceLight/30 border-border/50 hover:border-primary/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    theme === 'light' ? 'bg-white text-primary shadow-sm' : 'bg-surface text-textMuted'
                  }`}>
                    <Sun size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">Light Mode</div>
                    <div className="text-xs text-textMuted">Clean and bright interface</div>
                  </div>
                  {theme === 'light' && <div className="w-2 h-2 rounded-full bg-primary" />}
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all group text-left ${
                    theme === 'dark'
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : 'bg-surfaceLight/30 border-border/50 hover:border-primary/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    theme === 'dark' ? 'bg-surface text-primary shadow-sm' : 'bg-surface text-textMuted'
                  }`}>
                    <Moon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">Dark Mode</div>
                    <div className="text-xs text-textMuted">Easy on the eyes</div>
                  </div>
                  {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-5 bg-surfaceLight/30 rounded-2xl border border-border/50 hover:border-primary/20 transition-all group">
                <div className="flex gap-4 items-center">
                   <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-textMuted">
                      <Bell size={20} />
                   </div>
                   <div>
                     <div className="text-sm font-bold">Smart Reminders</div>
                     <div className="text-xs text-textMuted">Intelligent habit logging notifications</div>
                   </div>
                </div>
                <button
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${notifications ? 'bg-primary' : 'bg-border'}`}
                  onClick={() => setNotifications(!notifications)}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${notifications ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account & Safety */}
        <div className="space-y-8">
           <div className="card !p-8 border-danger/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-danger/10 rounded-2xl flex items-center justify-center text-danger">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Security</h3>
                  <p className="text-xs text-textMuted font-medium">Session & Safety</p>
                </div>
              </div>

              <div className="space-y-4">
                 <button className="w-full flex items-center justify-between p-4 bg-background border border-border/50 rounded-2xl text-sm font-bold hover:bg-surfaceLight transition-all group">
                    <div className="flex items-center gap-3">
                       <Key size={16} className="text-textMuted group-hover:text-primary" />
                       Change Password
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-textMuted">Update</span>
                 </button>

                 <button
                  className="w-full btn btn-secondary !border-danger/20 !text-danger !bg-danger/[0.03] hover:!bg-danger/10 !py-3.5 !rounded-2xl gap-3 mt-4"
                  onClick={logout}
                 >
                   <LogOut size={18} /> Sign Out of App
                 </button>
              </div>
           </div>

           <div className="card !p-8 bg-gradient-to-br from-primary to-primaryHover text-white">
              <h3 className="text-lg font-bold mb-2">HabitForge Pro</h3>
              <p className="text-xs text-white/80 leading-relaxed mb-6 font-medium">Unlock advanced AI insights, unlimited habits, and cloud synchronization across devices.</p>
              <button className="w-full py-3 bg-white text-primary rounded-xl text-sm font-bold hover:bg-white/90 transition-all shadow-lg">Upgrade Now</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;