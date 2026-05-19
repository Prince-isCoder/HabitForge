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
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => e.key === "Enter" && submit();

  return (
    <div className="min-h-screen bg-background flex font-['Outfit',_'Segoe_UI',_sans-serif] overflow-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

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
          @apply bg-primary;
          top: -160px; left: -140px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 380px; height: 380px;
          @apply bg-cyan-500;
          bottom: -100px; right: -80px;
          animation-delay: -3s;
        }
        .blob-3 {
          width: 260px; height: 260px;
          @apply bg-violet-500;
          top: 40%; left: 55%;
          animation-delay: -5s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-28px) scale(1.04); }
        }

        /* ── Left panel ── */
        .left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 72px;
          position: relative;
          z-index: 1;
        }
        .brand-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 56px;
          animation: fadeUp 0.5s ease both;
        }
        .brand-icon {
          width: 46px; height: 46px;
          @apply bg-gradient-to-br from-primary to-cyan-500 rounded-2xl flex items-center justify-center text-[22px] shadow-2xl shadow-primary/45 text-white;
        }
        .brand-name {
          @apply text-[22px] font-bold text-text tracking-tight;
        }
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          @apply bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 text-xs font-medium text-primary tracking-widest uppercase mb-7;
          animation: fadeUp 0.5s 0.1s ease both;
        }
        .hero-title {
          @apply text-[clamp(32px,4vw,52px)] font-bold text-text leading-[1.12] tracking-tight mb-5;
          animation: fadeUp 0.5s 0.2s ease both;
        }
        .hero-title span {
          @apply bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent;
        }
        .hero-sub {
          @apply text-base text-textMuted leading-relaxed max-w-[400px] mb-12 font-normal;
          animation: fadeUp 0.5s 0.3s ease both;
        }
        .stats-row {
          display: flex;
          gap: 36px;
          animation: fadeUp 0.5s 0.4s ease both;
        }
        .stat-item { display: flex; flex-direction: column; gap: 4px; }
        .stat-num {
          @apply text-[26px] font-bold text-text tracking-tight;
        }
        .stat-label {
          @apply text-xs text-textMuted font-normal tracking-wide;
        }
        .stat-divider {
          @apply w-[1px] bg-border/40 self-stretch;
        }

        /* ── Right panel (card) ── */
        .right-panel {
          width: 480px;
          min-height: 100vh;
          @apply bg-surfaceLight/10 border-l border-border/50 flex items-center justify-center px-11 py-12 relative z-[1] backdrop-blur-2xl;
          animation: slideIn 0.5s ease both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .form-inner { width: 100%; }

        /* ── Tab switcher ── */
        .tab-wrap {
          @apply flex bg-surfaceLight/40 border border-border/50 rounded-2xl p-1 mb-9;
        }
        .tab-btn {
          flex: 1;
          @apply p-[11px] border-none rounded-xl text-sm font-semibold cursor-pointer transition-all tracking-wide;
          font-family: 'Outfit', sans-serif;
        }
        .tab-btn.active {
          @apply bg-gradient-to-br from-primary to-primaryHover text-white shadow-lg shadow-primary/35;
        }
        .tab-btn.inactive {
          @apply bg-transparent text-textMuted hover:text-text;
        }

        /* ── Form heading ── */
        .form-title {
          @apply text-2xl font-bold text-text tracking-tight mb-1.5;
        }
        .form-sub {
          @apply text-[13px] text-textMuted mb-8 font-normal;
        }

        /* ── Input fields ── */
        .field-group { @apply flex flex-col gap-4 mb-6; }
        .field-wrap { position: relative; }
        .field-label {
          @apply text-[11px] font-bold tracking-[0.08em] uppercase text-textMuted mb-2 block;
        }
        .field-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 15px;
          @apply text-textMuted/60 text-base pointer-events-none;
        }
        .field-input {
          @apply w-full bg-surfaceLight/40 border border-border/60 rounded-xl pl-[42px] pr-4 py-[13px] text-sm text-text outline-none transition-all box-border;
          font-family: 'Outfit', sans-serif;
        }
        .field-input::placeholder { @apply text-textMuted/40; }
        .field-input:focus {
          @apply border-primary/50 shadow-[0_0_0_3px_rgba(var(--primary-rgb),0.1)] bg-surfaceLight/60;
        }
        .pass-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          @apply text-textMuted text-base p-0 transition-colors hover:text-text;
        }

        /* ── Error ── */
        .error-box {
          @apply bg-danger/10 border border-danger/20 rounded-xl px-[14px] py-[11px] text-[13px] text-danger mb-5 flex items-center gap-2;
        }

        /* ── Submit btn ── */
        .submit-btn {
          @apply w-full py-3.5 bg-gradient-to-br from-primary to-primaryHover border-none rounded-xl text-white text-[15px] font-semibold cursor-pointer transition-all shadow-lg shadow-primary/35 tracking-wide mb-5;
          font-family: 'Outfit', sans-serif;
        }
        .submit-btn:hover:not(:disabled) {
          @apply -translate-y-0.5 shadow-xl shadow-primary/45;
        }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .submit-btn:disabled { @apply opacity-50 cursor-not-allowed; }

        /* ── Divider ── */
        .divider {
          @apply flex items-center gap-3 mb-5;
        }
        .divider-line { @apply flex-1 h-[1px] bg-border/40; }
        .divider-text { @apply text-[11px] text-textMuted font-semibold tracking-widest uppercase; }

        /* ── Switch link ── */
        .switch-link {
          @apply text-center text-[13px] text-textMuted;
        }
        .switch-link button {
          background: none;
          border: none;
          @apply text-primary cursor-pointer text-[13px] font-bold ml-1 transition-colors hover:text-primaryHover hover:underline;
          font-family: 'Outfit', sans-serif;
        }

        /* ── Success toast ── */
        .success-toast {
          @apply bg-success/10 border border-success/25 rounded-xl px-[14px] py-[11px] text-[13px] text-success mb-5 flex items-center gap-2;
        }

        /* ── Responsive ── */
        @media (max-width: 860px) {
          .left-panel { display: none; }
          .right-panel {
            width: 100%;
            border-left: none;
            @apply px-7 py-12;
          }
        }
      `}</style>

      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Left Panel */}
      <div className="left-panel">
        <div className="brand-row">
          <div className="brand-icon">🔥</div>
          <span className="brand-name">HabitForge</span>
        </div>

        <div className="hero-tag">
          <span style={{ width: 6, height: 6, background: '#34d399', borderRadius: '50%', display: 'inline-block' }} />
          AI-Powered Tracking
        </div>

        <h1 className="hero-title">
          Build habits that<br />
          <span>actually stick.</span>
        </h1>

        <p className="hero-sub">
          Your personal AI coach tracks streaks, spots patterns, and nudges you
          exactly when motivation dips — so you never break the chain.
        </p>

        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-num">21</span>
            <span className="stat-label">Days to a habit</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">3×</span>
            <span className="stat-label">Better with AI coach</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">∞</span>
            <span className="stat-label">Streaks possible</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="form-inner">

          {/* Tab switcher */}
          {tab !== "forgot" && tab !== "reset" && (
            <div className="tab-wrap">
              <button className={`tab-btn ${tab === "login" ? "active" : "inactive"}`} onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>Log In</button>
              <button className={`tab-btn ${tab === "signup" ? "active" : "inactive"}`} onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}>Sign Up</button>
            </div>
          )}

          <div className="form-title">
            {tab === "login" ? "Welcome back 👋" : tab === "signup" ? "Create account ✨" : tab === "forgot" ? "Forgot Password 🔑" : "Reset Password 🔒"}
          </div>
          <div className="form-sub">
            {tab === "login" ? "Enter your credentials to continue tracking."
              : tab === "signup" ? "Start your habit journey today. It's free."
              : tab === "forgot" ? "Enter your email — we'll send a reset link to Mailtrap."
              : "Enter your new password below."}
          </div>

          {/* Error */}
          {error && <div className="error-box">⚠ {error}</div>}
          {success && (
            <div className="success-toast">
              {success}
            </div>
          )}

          {/* Fields */}
          {/* Fields */}
          <div className="field-group">
            {tab === "signup" && (
              <div className="field-wrap">
                <label className="field-label">Full Name</label>
                <div className="field-input-wrap">
                  <span className="field-icon">👤</span>
                  <input className="field-input" name="name" value={form.name} onChange={handle} onKeyDown={handleKey} placeholder="John Doe" />
                </div>
              </div>
            )}

            {(tab === "login" || tab === "signup" || tab === "forgot") && (
              <div className="field-wrap">
                <label className="field-label">Email Address</label>
                <div className="field-input-wrap">
                  <span className="field-icon">✉</span>
                  <input className="field-input" name="email" type="email" value={form.email} onChange={handle} onKeyDown={handleKey} placeholder="you@example.com" />
                </div>
              </div>
            )}

            {(tab === "login" || tab === "signup" || tab === "reset") && (
              <div className="field-wrap">
                <label className="field-label">{tab === "reset" ? "New Password" : "Password"}</label>
                <div className="field-input-wrap">
                  <span className="field-icon">🔒</span>
                  <input className="field-input" name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handle} onKeyDown={handleKey} placeholder={tab === "signup" ? "Min. 6 characters" : tab === "reset" ? "Enter new password" : "Your password"} style={{ paddingRight: 44 }} />
                  <button className="pass-toggle" onClick={() => setShowPass(!showPass)} type="button" tabIndex={-1}>{showPass ? "🙈" : "👁"}</button>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button className="submit-btn" onClick={submit} disabled={loading}>
            {loading ? "Please wait..."
              : tab === "login" ? "Log In →"
              : tab === "signup" ? "Create Account →"
              : tab === "forgot" ? "Send Reset Link →"
              : "Reset Password →"}
          </button>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or</span>
            <div className="divider-line" />
          </div>

          <div className="switch-link">
            {tab === "login" && (
              <>
                <button onClick={() => { setTab("forgot"); setError(""); setSuccess(""); }}>Forgot password?</button>
                {" · "}
                <button onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}>Sign up free</button>
              </>
            )}
            {tab === "signup" && (
              <>Already have an account?
                <button onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>Log in</button>
              </>
            )}
            {(tab === "forgot" || tab === "reset") && (
              <>Remember it?
                <button onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>Back to Login</button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;