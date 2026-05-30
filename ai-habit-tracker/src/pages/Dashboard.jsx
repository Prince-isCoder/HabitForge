import React, { useEffect, useState } from "react";
import { getDashboardData, getCalendar } from "../services/api";
import { Zap, Brain, Flame, TrendingUp, Plus } from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [aiHabit, setAiHabit] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [habits, setHabits] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [streakStats, setStreakStats] = useState(null);

  const generateHabit = async () => {
    const res = await fetch("http://localhost:5000/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: `Suggest ONE unique daily habit. Rules:\n- Do NOT repeat common habits like "drink water"\n- Avoid habits already suggested before\n- Keep it under 5 words\n- No explanation, only habit` }]
      })
    });
    const d = await res.json();
    setAiHabit(d.reply);
  };

  const addAiHabit = async () => {
    const exists = habits.some(h => h.title.toLowerCase() === aiHabit.toLowerCase());
    if (exists) { setSuggestion("⚠ This habit already exists!"); setAiHabit(""); return; }
    await fetch("http://localhost:5000/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ title: aiHabit })
    });
    setSuggestion("✅ Habit added: " + aiHabit);
    setAiHabit("");
  };

  const skipAiHabit = () => setAiHabit("");

  useEffect(() => {
    fetch("http://localhost:5000/api/habits", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    }).then(r => r.json()).then(d => setHabits(d));
  }, []);

  useEffect(() => {
    getDashboardData().then(d => setData(d)).catch(console.error);
  }, []);

  useEffect(() => {
    getCalendar().then(d => {
      if (!d) return;
      const calendar = d.calendar;

      // Current streak
      let current = 0;
      for (let i = calendar.length - 1; i >= 0; i--) {
        if (calendar[i].count > 0) current++;
        else break;
      }

      // Longest streak
      let longest = 0, cur = 0;
      for (const day of calendar) {
        if (day.count > 0) { cur++; longest = Math.max(longest, cur); }
        else cur = 0;
      }

      // Active days
      const activeDays = calendar.filter(d => d.count > 0).length;

      setStreakStats({ current, longest, activeDays });
    });
  }, []);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", minHeight: "100vh", background: "var(--background)", color: "var(--text)", padding: "32px", transition: "background 0.2s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .db-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 24px; transition: border-color 0.2s, background 0.2s; }
        .db-card:hover { border-color: rgba(99,102,241,0.25); }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 22px; display: flex; align-items: center; gap: 16px; transition: background 0.2s, border-color 0.2s; }
        .stat-icon { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .insight-item { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.12); border-radius: 10px; padding: 11px 14px; font-size: 14px; color: var(--text-muted); margin-bottom: 8px; }
        .action-item { background: rgba(6,182,212,0.06); border: 1px solid rgba(6,182,212,0.12); border-radius: 10px; padding: 11px 14px; font-size: 14px; color: var(--text-muted); margin-bottom: 8px; }
        .ai-modal { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: var(--surface); border: 1px solid rgba(139,92,246,0.35); border-radius: 18px; padding: 24px; z-index: 100; width: 90%; max-width: 420px; box-shadow: 0 24px 60px rgba(0,0,0,0.6); backdrop-filter: blur(20px); animation: popIn 0.2s ease; }
        @keyframes popIn { from { opacity:0; transform: translateX(-50%) scale(0.95); } to { opacity:1; transform: translateX(-50%) scale(1); } }
        .suggest-btn { background: linear-gradient(135deg,#4f46e5,#4338ca); border: none; border-radius: 11px; color: #fff; padding: 11px 22px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit',sans-serif; display: flex; align-items: center; gap: 8px; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 16px rgba(79,70,229,0.35); }
        .suggest-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(79,70,229,0.45); }
        .modal-add-btn { background: linear-gradient(135deg,#10b981,#059669); border: none; border-radius: 9px; color: #fff; padding: 9px 18px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit',sans-serif; transition: opacity 0.2s; }
        .modal-skip-btn { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.2); border-radius: 9px; color: #fca5a5; padding: 9px 18px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit',sans-serif; }
        .section-title { font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #475569; margin-bottom: 14px; }
      `}</style>

      {/* AI Habit Modal */}
      {aiHabit && (
        <div className="ai-modal">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#8b5cf6,#6366f1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#f1f5f9" }}>AI Suggestion</div>
              <div style={{ fontSize: 12, color: "#475569" }}>Personalized for you</div>
            </div>
          </div>
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "14px 16px", fontSize: 16, fontWeight: 600, color: "#c7d2fe", marginBottom: 18 }}>
            ✨ {aiHabit}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="modal-add-btn" onClick={addAiHabit}>Add Habit</button>
            <button className="modal-skip-btn" onClick={skipAiHabit}>Skip</button>
          </div>
        </div>
      )}

      {suggestion && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "12px 20px", color: "#6ee7b7", fontSize: 14, fontWeight: 500, zIndex: 99, display: "flex", gap: 12, alignItems: "center" }}>
          {suggestion}
          <button onClick={() => setSuggestion("")} style={{ background: "none", border: "none", color: "#6ee7b7", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, marginBottom: 6, letterSpacing: "0.04em" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", margin: 0 }}>
              Welcome back, <span style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user?.name?.split(" ")[0] || "there"} 👋</span>
            </h1>
          </div>
          <button className="suggest-btn" onClick={generateHabit}>
            <Zap size={16} /> Suggest Habit
          </button>
        </div>
      </div>

      {!data ? (
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 90, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)" }} />)}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(99,102,241,0.12)" }}><Flame size={20} color="#818cf8" /></div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>{habits.length}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>Active Habits</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(16,185,129,0.1)" }}><TrendingUp size={20} color="#34d399" /></div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>{habits.filter(h => h.completed).length}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>Completed Today</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(6,182,212,0.1)" }}><Zap size={20} color="#22d3ee" /></div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>
                  {habits.length ? Math.round((habits.filter(h => h.completed).length / habits.length) * 100) : 0}%
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>Completion Rate</div>
              </div>
            </div>

            {/* ✅ Streak Stats */}
            <div className="stat-card" style={{ borderColor: "rgba(251,146,60,0.15)", background: "rgba(251,146,60,0.04)" }}>
              <div className="stat-icon" style={{ background: "rgba(251,146,60,0.12)" }}>
                <span style={{ fontSize: 20 }}>🔥</span>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>{streakStats?.current ?? "—"}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>Current Streak</div>
              </div>
            </div>
            <div className="stat-card" style={{ borderColor: "rgba(234,179,8,0.15)", background: "rgba(234,179,8,0.04)" }}>
              <div className="stat-icon" style={{ background: "rgba(234,179,8,0.1)" }}>
                <span style={{ fontSize: 20 }}>🏆</span>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>{streakStats?.longest ?? "—"}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>Longest Streak</div>
              </div>
            </div>
            <div className="stat-card" style={{ borderColor: "rgba(139,92,246,0.15)", background: "rgba(139,92,246,0.04)" }}>
              <div className="stat-icon" style={{ background: "rgba(139,92,246,0.1)" }}>
                <span style={{ fontSize: 20 }}>📅</span>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>{streakStats?.activeDays ?? "—"}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>Active Days</div>
              </div>
            </div>
          </div>

          {/* AI Coach + Insights + Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="db-card" style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.08), rgba(6,182,212,0.05))", borderColor: "rgba(99,102,241,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#4f46e5,#06b6d4)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text)" }}>AI Coach</div>
                </div>
                <div style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8 }}>
                  {data.coach.split("\n").map((line, i) => {
                    if (!line.trim()) return <br key={i} />;

                    // Bold **text**
                    const parts = line.split(/\*\*(.*?)\*\*/g);
                    const formatted = parts.map((part, j) =>
                      j % 2 === 1
                        ? <strong key={j} style={{ color: "#c7d2fe", fontWeight: 600 }}>{part}</strong>
                        : part
                    );

                    // Bullet points
                    const isBullet = line.trim().startsWith("-") || line.trim().startsWith("•");
                    // Section headers (lines ending with :)
                    const isHeader = line.trim().endsWith(":") && line.trim().length < 40;

                    if (isHeader) return (
                      <div key={i} style={{ fontWeight: 600, color: "#818cf8", fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 14, marginBottom: 6 }}>
                        {formatted}
                      </div>
                    );

                    if (isBullet) return (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6, paddingLeft: 4 }}>
                        <span style={{ color: "#4f46e5", marginTop: 2, flexShrink: 0 }}>•</span>
                        <span>{formatted}</span>
                      </div>
                    );

                    return <div key={i} style={{ marginBottom: 6 }}>{formatted}</div>;
                  })}
                </div>
              </div>
            </div>

            <div className="db-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Brain size={18} color="#818cf8" />
                <div className="section-title" style={{ margin: 0 }}>Insights</div>
              </div>
              {data.insights.map((item, i) => <div key={i} className="insight-item">💡 {item}</div>)}
            </div>

            <div className="db-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Zap size={18} color="#22d3ee" />
                <div className="section-title" style={{ margin: 0 }}>Actions</div>
              </div>
              {data.actions.map((item, i) => <div key={i} className="action-item">⚡ {item}</div>)}
            </div>
          </div>

          {/* ✅ Feature 6 — Badges */}
          {(() => {
            const u = JSON.parse(localStorage.getItem("user")) || {};
            const badges = u.badges || [];
            const BADGE_DEFS = {
              first_habit: { name: "First Step", emoji: "🌱", desc: "Complete your first habit" },
              streak_7: { name: "On Fire", emoji: "🔥", desc: "Achieve a 7-day streak" },
              perfect_day: { name: "Perfect Day", emoji: "💯", desc: "Complete all habits in one day" },
              xp_100: { name: "Century", emoji: "⚡", desc: "Earn 100 XP" },
              level_3: { name: "Disciplined", emoji: "🏆", desc: "Reach Level 3" },
              legend: { name: "Legend", emoji: "👑", desc: "Reach Level 5" },
            };
            return (
              <div className="db-card" style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
                  🏅 Achievements
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {Object.entries(BADGE_DEFS).map(([id, badge]) => {
                    const unlocked = badges.includes(id);
                    return (
                      <div key={id} style={{
                        background: unlocked ? "rgba(99,102,241,0.1)" : "var(--surface-light)",
                        border: `1px solid ${unlocked ? "rgba(99,102,241,0.3)" : "var(--border)"}`,
                        borderRadius: 12, padding: "10px 16px",
                        display: "flex", alignItems: "center", gap: 10,
                        opacity: unlocked ? 1 : 0.4,
                        transition: "all 0.2s",
                        filter: unlocked ? "none" : "grayscale(1)"
                      }}>
                        <span style={{ fontSize: 22 }}>{badge.emoji}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: unlocked ? "var(--text)" : "var(--text-muted)" }}>{badge.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{badge.desc}</div>
                        </div>
                        {unlocked && <span style={{ fontSize: 10, background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 99, fontWeight: 600, marginLeft: 4 }}>EARNED</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

export default Dashboard;