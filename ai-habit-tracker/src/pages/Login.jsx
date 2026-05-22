import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  // ✅ Detect reset token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setForm(f => ({ ...f, resetToken: token }));
      setTab("reset");
    }
  }, []);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const submit = async () => {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      if (tab === "forgot") {
        if (!form.email) { setError("Enter your email."); setLoading(false); return; }
        const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email })
        });
        const data = await res.json();
        if (!res.ok) return setError(data.error || "Failed");
        setSuccess("✅ Reset email sent! Check Mailtrap inbox at mailtrap.io");
        return;
      }

      if (tab === "reset") {
        if (!form.password) { setError("Enter new password."); setLoading(false); return; }
        const res = await fetch("http://localhost:5000/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: form.resetToken, password: form.password })
        });
        const data = await res.json();
        if (!res.ok) return setError(data.error || "Reset failed");
        setSuccess("✅ Password reset! You can now log in.");
        setTimeout(() => { setTab("login"); navigate("/login", { replace: true }); }, 2000);
        return;
      }

      if (!form.email || !form.password) return setError("All fields are required.");
      if (tab === "signup" && !form.name) return setError("Name is required.");

      const endpoint = tab === "login"
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/signup";

      const body = tab === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Something went wrong.");

      if (tab === "login") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setTab("login");
        setForm({ name: "", email: "", password: "" });
        setSuccess("✅ Account created! Please log in.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => e.key === "Enter" && submit();

  return (
    <div className="min-h-screen bg-background flex font-sans overflow-hidden relative">
      <style>{`
        /* ── Animated background blobs ── */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.18;
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
        }
        .blob-1 {
          width: 520px; height: 520px;
          background: var(--primary);
          top: -160px; left: -140px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 380px; height: 380px;
          background: #06b6d4;
          bottom: -100px; right: -80px;
          animation-delay: -3s;
        }
        .blob-3 {
          width: 260px; height: 260px;
          background: #8b5cf6;
          top: 40%; left: 55%;
          animation-delay: -5s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-28px) scale(1.04); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Left Panel */}
      <div className="flex-1 hidden lg:flex flex-col justify-center px-20 relative z-10">
        <div className="flex items-center gap-3.5 mb-14 animate-[fadeUp_0.5s_ease_both]">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-cyan-500 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-primary/40">🔥</div>
          <span className="text-2xl font-bold text-text tracking-tight">HabitForge</span>
        </div>

        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 text-xs font-medium text-primary uppercase tracking-wider mb-7 animate-[fadeUp_0.5s_0.1s_ease_both]">
          <span className="w-1.5 h-1.5 bg-success rounded-full" />
          AI-Powered Tracking
        </div>

        <h1 className="text-5xl lg:text-6xl font-bold text-text leading-[1.1] tracking-tight mb-5 animate-[fadeUp_0.5s_0.2s_ease_both]">
          Build habits that<br />
          <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">actually stick.</span>
        </h1>

        <p className="text-lg text-textMuted leading-relaxed max-w-md mb-12 animate-[fadeUp_0.5s_0.3s_ease_both]">
          Your personal AI coach tracks streaks, spots patterns, and nudges you
          exactly when motivation dips — so you never break the chain.
        </p>

        <div className="flex gap-9 animate-[fadeUp_0.5s_0.4s_ease_both]">
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-text tracking-tight">21</span>
            <span className="text-xs text-textMuted uppercase tracking-wider">Days to a habit</span>
          </div>
          <div className="w-px bg-border/50 self-stretch" />
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-text tracking-tight">3×</span>
            <span className="text-xs text-textMuted uppercase tracking-wider">Better with AI coach</span>
          </div>
          <div className="w-px bg-border/50 self-stretch" />
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-text tracking-tight">∞</span>
            <span className="text-xs text-textMuted uppercase tracking-wider">Streaks possible</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[480px] min-h-screen bg-surface/30 border-l border-border/50 flex items-center justify-center p-11 relative z-10 backdrop-blur-2xl animate-[slideIn_0.5s_ease_both]">
        <div className="w-full">

          {/* Tab switcher */}
          {tab !== "forgot" && tab !== "reset" && (
            <div className="flex bg-surfaceLight/20 border border-border/50 rounded-2xl p-1 mb-9">
              <button className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${tab === "login" ? "bg-gradient-to-br from-primary to-primaryHover text-white shadow-lg shadow-primary/30" : "text-textMuted hover:text-text"}`} onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>Log In</button>
              <button className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${tab === "signup" ? "bg-gradient-to-br from-primary to-primaryHover text-white shadow-lg shadow-primary/30" : "text-textMuted hover:text-text"}`} onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}>Sign Up</button>
            </div>
          )}

          <div className="text-2xl font-bold text-text tracking-tight mb-1.5">
            {tab === "login" ? "Welcome back 👋" : tab === "signup" ? "Create account ✨" : tab === "forgot" ? "Forgot Password 🔑" : "Reset Password 🔒"}
          </div>
          <div className="text-[13px] text-textMuted mb-8">
            {tab === "login" ? "Enter your credentials to continue tracking."
              : tab === "signup" ? "Start your habit journey today. It's free."
              : tab === "forgot" ? "Enter your email — we'll send a reset link to Mailtrap."
              : "Enter your new password below."}
          </div>

          {/* Error & Success */}
          {error && <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-[13px] text-danger mb-5 flex items-center gap-2">⚠ {error}</div>}
          {success && <div className="bg-success/10 border border-success/20 rounded-xl px-4 py-3 text-[13px] text-success mb-5 flex items-center gap-2">{success}</div>}

          {/* Fields */}
          <div className="space-y-4 mb-6">
            {tab === "signup" && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-textMuted mb-2 ml-1">Full Name</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-textMuted/50 text-sm">👤</span>
                  <input className="w-full bg-surfaceLight/20 border border-border/50 rounded-xl pl-11 pr-4 py-3.5 text-sm text-text placeholder:text-textMuted/30 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all" name="name" value={form.name} onChange={handle} onKeyDown={handleKey} placeholder="John Doe" />
                </div>
              </div>
            )}

            {(tab === "login" || tab === "signup" || tab === "forgot") && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-textMuted mb-2 ml-1">Email Address</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-textMuted/50 text-sm">✉</span>
                  <input className="w-full bg-surfaceLight/20 border border-border/50 rounded-xl pl-11 pr-4 py-3.5 text-sm text-text placeholder:text-textMuted/30 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all" name="email" type="email" value={form.email} onChange={handle} onKeyDown={handleKey} placeholder="you@example.com" />
                </div>
              </div>
            )}

            {(tab === "login" || tab === "signup" || tab === "reset") && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-textMuted mb-2 ml-1">{tab === "reset" ? "New Password" : "Password"}</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-textMuted/50 text-sm">🔒</span>
                  <input className="w-full bg-surfaceLight/20 border border-border/50 rounded-xl pl-11 pr-12 py-3.5 text-sm text-text placeholder:text-textMuted/30 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all" name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handle} onKeyDown={handleKey} placeholder={tab === "signup" ? "Min. 6 characters" : tab === "reset" ? "Enter new password" : "Your password"} />
                  <button className="absolute right-4 text-textMuted/50 hover:text-textMuted transition-colors text-base" onClick={() => setShowPass(!showPass)} type="button" tabIndex={-1}>{showPass ? "🙈" : "👁"}</button>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button className="w-full py-4 bg-gradient-to-br from-primary to-primaryHover text-white rounded-xl text-[15px] font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-5" onClick={submit} disabled={loading}>
            {loading ? "Please wait..."
              : tab === "login" ? "Log In →"
              : tab === "signup" ? "Create Account →"
              : tab === "forgot" ? "Send Reset Link →"
              : "Reset Password →"}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-[11px] text-textMuted font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <div className="text-center text-[13px] text-textMuted">
            {tab === "login" && (
              <div className="space-x-1.5">
                <button className="text-primary font-semibold hover:underline transition-all" onClick={() => { setTab("forgot"); setError(""); setSuccess(""); }}>Forgot password?</button>
                <span className="text-border/50">·</span>
                <button className="text-primary font-semibold hover:underline transition-all" onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}>Sign up free</button>
              </div>
            )}
            {tab === "signup" && (
              <>Already have an account?
                <button className="ml-1 text-primary font-semibold hover:underline transition-all" onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>Log in</button>
              </>
            )}
            {(tab === "forgot" || tab === "reset") && (
              <>Remember it?
                <button className="ml-1 text-primary font-semibold hover:underline transition-all" onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>Back to Login</button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
