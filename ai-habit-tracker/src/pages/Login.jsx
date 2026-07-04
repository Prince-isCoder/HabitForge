import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen bg-background flex font-['Inter',_sans-serif] overflow-hidden relative">
      <style>{`
        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          @apply opacity-10 dark:opacity-15;
          animation: float 20s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>

      {/* Background blobs */}
      <div className="auth-blob w-[600px] h-[600px] bg-primary top-[-200px] left-[-200px]" />
      <div className="auth-blob w-[500px] h-[500px] bg-cyan-500 bottom-[-150px] right-[-100px] animation-delay-[-5s]" />
      <div className="auth-blob w-[400px] h-[400px] bg-violet-500 top-[20%] right-[10%] animation-delay-[-10s]" />

      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-primary/20 text-white font-bold">🔥</div>
          <span className="text-2xl font-bold tracking-tight text-text">HabitForge</span>
        </div>

        <div className="max-w-xl">
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-[0.2em] mb-8 w-fit">
            <Sparkles size={14} /> AI-Powered Growth
          </div>
          <h1 className="text-6xl font-bold tracking-tight leading-[1.05] mb-8">
            Master your life,<br />
            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">one habit at a time.</span>
          </h1>
          <p className="text-xl text-textMuted leading-relaxed mb-12">
            Experience the next generation of habit tracking. Our AI analyzes your behavior to provide personalized insights that keep you consistent.
          </p>

          <div className="grid grid-cols-2 gap-8">
             {[
               { label: "Completion Rate", val: "+45%", desc: "Average increase" },
               { label: "Active Users", val: "10k+", desc: "Tracking daily" }
             ].map((s, i) => (
               <div key={i} className="space-y-1">
                 <div className="text-3xl font-bold text-text">{s.val}</div>
                 <div className="text-xs font-bold text-textMuted uppercase tracking-widest">{s.label}</div>
                 <div className="text-[10px] text-textMuted/60">{s.desc}</div>
               </div>
             ))}
          </div>
        </div>

        <div className="text-sm text-textMuted/60 font-medium">
          © 2024 HabitForge Inc. Professional Grade Tracking.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-[560px] min-h-screen bg-surface/40 backdrop-blur-3xl border-l border-border/50 flex items-center justify-center p-8 relative z-10 animate-slideIn">
        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-3">
             {tab !== "forgot" && tab !== "reset" && (
                <div className="flex bg-surfaceLight/50 p-1 rounded-2xl border border-border/50 mb-10">
                  <button className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'login' ? 'bg-surface text-text shadow-sm' : 'text-textMuted hover:text-text'}`} onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>Log In</button>
                  <button className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'signup' ? 'bg-surface text-text shadow-sm' : 'text-textMuted hover:text-text'}`} onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}>Sign Up</button>
                </div>
             )}

             <h2 className="text-3xl font-bold tracking-tight">
                {tab === "login" ? "Welcome back" : tab === "signup" ? "Get started" : "Security Check"}
             </h2>
             <p className="text-textMuted font-medium">
                {tab === "login" ? "Enter your details to access your dashboard." : tab === "signup" ? "Create an account to start your journey." : "Follow the steps to regain access."}
             </p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-2xl p-4 flex items-center gap-3 text-sm text-danger font-bold animate-popIn">
               <span className="text-lg">⚠</span> {error}
            </div>
          )}

          {success && (
            <div className="bg-success/10 border border-success/20 rounded-2xl p-4 flex items-center gap-3 text-sm text-success font-bold animate-popIn">
               <CheckCircle2 size={18} /> {success}
            </div>
          )}

          <div className="space-y-5">
            {tab === "signup" && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted/40" />
                  <input className="input-field !pl-12" name="name" value={form.name} onChange={handle} onKeyDown={handleKey} placeholder="John Doe" />
                </div>
              </div>
            )}

            {(tab === "login" || tab === "signup" || tab === "forgot") && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted/40" />
                  <input className="input-field !pl-12" name="email" type="email" value={form.email} onChange={handle} onKeyDown={handleKey} placeholder="you@example.com" />
                </div>
              </div>
            )}

            {(tab === "login" || tab === "signup" || tab === "reset") && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Password</label>
                   {tab === 'login' && <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline" onClick={() => setTab("forgot")}>Forgot?</button>}
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted/40" />
                  <input className="input-field !pl-12 pr-12" name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handle} onKeyDown={handleKey} placeholder="••••••••" />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted/40 hover:text-text transition-colors" onClick={() => setShowPass(!showPass)} type="button">
                     {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="w-full btn btn-primary !py-4 !rounded-2xl text-base gap-3 group"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Processing..." : (
               <>
                 {tab === 'login' ? 'Access Dashboard' : tab === 'signup' ? 'Create Account' : 'Verify Identity'}
                 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </>
            )}
          </button>

          <div className="text-center">
             {tab === 'forgot' || tab === 'reset' ? (
                <button className="text-sm font-bold text-textMuted hover:text-primary transition-colors" onClick={() => setTab("login")}>Back to Login</button>
             ) : (
                <p className="text-sm text-textMuted font-medium">
                   {tab === 'login' ? "Don't have an account?" : "Already a member?"}
                   <button className="ml-2 text-primary font-bold hover:underline" onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}>
                      {tab === 'login' ? 'Sign up for free' : 'Sign in here'}
                   </button>
                </p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;