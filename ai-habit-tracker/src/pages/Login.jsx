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
    <div style={{
      minHeight: "100vh",
      background: "#0a0c12",
      display: "flex",
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      overflow: "hidden",
      position: "relative"
    }}>
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
          background: #4f46e5;
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
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          box-shadow: 0 0 24px rgba(79,70,229,0.45);
        }
        .brand-name {
          font-size: 22px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.02em;
        }
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(79,70,229,0.12);
          border: 1px solid rgba(79,70,229,0.25);
          border-radius: 99px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 500;
          color: #a5b4fc;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 28px;
          animation: fadeUp 0.5s 0.1s ease both;
        }
        .hero-title {
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 700;
          color: #f1f5f9;
          line-height: 1.12;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
          animation: fadeUp 0.5s 0.2s ease both;
        }
        .hero-title span {
          background: linear-gradient(90deg, #6366f1, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          font-size: 16px;
          color: #64748b;
          line-height: 1.65;
          max-width: 400px;
          margin-bottom: 48px;
          font-weight: 400;
          animation: fadeUp 0.5s 0.3s ease both;
        }
        .stats-row {
          display: flex;
          gap: 36px;
          animation: fadeUp 0.5s 0.4s ease both;
        }
        .stat-item { display: flex; flex-direction: column; gap: 4px; }
        .stat-num {
          font-size: 26px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.02em;
        }
        .stat-label {
          font-size: 12px;
          color: #475569;
          font-weight: 400;
          letter-spacing: 0.04em;
        }
        .stat-divider {
          width: 1px;
          background: rgba(255,255,255,0.06);
          align-self: stretch;
        }

        /* ── Right panel (card) ── */
        .right-panel {
          width: 480px;
          min-height: 100vh;
          background: rgba(255,255,255,0.025);
          border-left: 1px solid rgba(255,255,255,0.055);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 44px;
          position: relative;
          z-index: 1;
          backdrop-filter: blur(20px);
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
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 4px;
          margin-bottom: 36px;
        }
        .tab-btn {
          flex: 1;
          padding: 11px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'Outfit', sans-serif;
          letter-spacing: 0.01em;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #4f46e5, #4338ca);
          color: #fff;
          box-shadow: 0 4px 16px rgba(79,70,229,0.35);
        }
        .tab-btn.inactive {
          background: transparent;
          color: #475569;
        }
        .tab-btn.inactive:hover { color: #94a3b8; }

        /* ── Form heading ── */
        .form-title {
          font-size: 24px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .form-sub {
          font-size: 13px;
          color: #475569;
          margin-bottom: 32px;
          font-weight: 400;
        }

        /* ── Input fields ── */
        .field-group { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .field-wrap { position: relative; }
        .field-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #475569;
          margin-bottom: 8px;
          display: block;
        }
        .field-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 15px;
          color: #334155;
          font-size: 15px;
          pointer-events: none;
        }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 13px 16px 13px 42px;
          font-size: 14px;
          color: #e2e8f0;
          font-family: 'Outfit', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: #334155; }
        .field-input:focus {
          border-color: rgba(79,70,229,0.5);
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
          background: rgba(255,255,255,0.06);
        }
        .pass-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
          font-size: 16px;
          padding: 0;
          transition: color 0.2s;
        }
        .pass-toggle:hover { color: #94a3b8; }

        /* ── Error ── */
        .error-box {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px;
          color: #fca5a5;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Submit btn ── */
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #4f46e5, #4338ca);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 6px 24px rgba(79,70,229,0.38);
          letter-spacing: 0.01em;
          margin-bottom: 20px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(79,70,229,0.48);
        }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Divider ── */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .divider-text { font-size: 11px; color: #334155; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }

        /* ── Switch link ── */
        .switch-link {
          text-align: center;
          font-size: 13px;
          color: #475569;
        }
        .switch-link button {
          background: none;
          border: none;
          color: #6366f1;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          padding: 0;
          margin-left: 4px;
          transition: color 0.2s;
        }
        .switch-link button:hover { color: #818cf8; text-decoration: underline; }

        /* ── Success toast ── */
        .success-toast {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px;
          color: #6ee7b7;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Responsive ── */
        @media (max-width: 860px) {
          .left-panel { display: none; }
          .right-panel {
            width: 100%;
            border-left: none;
            padding: 48px 28px;
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
            <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#6ee7b7", marginBottom: 20 }}>
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