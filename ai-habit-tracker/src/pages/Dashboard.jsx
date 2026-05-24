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
    <div className="min-h-screen bg-background text-text p-8 font-['Outfit']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .db-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 24px; transition: border-color 0.2s; }
        .db-card:hover { border-color: var(--primary); }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 22px; display: flex; align-items: center; gap: 16px; }
        .stat-icon { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .insight-item { background: color-mix(in srgb, var(--primary) 6%, transparent); border: 1px solid color-mix(in srgb, var(--primary) 12%, transparent); border-radius: 10px; padding: 11px 14px; font-size: 14px; color: var(--textMuted); margin-bottom: 8px; }
        .action-item { background: color-mix(in srgb, #06b6d4 6%, transparent); border: 1px solid color-mix(in srgb, #06b6d4 12%, transparent); border-radius: 10px; padding: 11px 14px; font-size: 14px; color: var(--textMuted); margin-bottom: 8px; }
        .ai-modal { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: var(--surface); border: 1px solid var(--primary); border-radius: 18px; padding: 24px; z-index: 100; width: 90%; max-width: 420px; box-shadow: 0 24px 60px rgba(0,0,0,0.6); backdrop-filter: blur(20px); animation: popIn 0.2s ease; }
        @keyframes popIn { from { opacity:0; transform: translateX(-50%) scale(0.95); } to { opacity:1; transform: translateX(-50%) scale(1); } }
        .suggest-btn { background: linear-gradient(135deg, #4f46e5, #4338ca); border: none; border-radius: 11px; color: #fff; padding: 11px 22px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit',sans-serif; display: flex; align-items: center; gap: 8px; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 16px rgba(79,70,229,0.35); }
        .suggest-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(79,70,229,0.45); }
        .modal-add-btn { background: linear-gradient(135deg,#10b981,#059669); border: none; border-radius: 9px; color: #fff; padding: 9px 18px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit',sans-serif; transition: opacity 0.2s; }
        .modal-skip-btn { background: color-mix(in srgb, var(--danger) 12%, transparent); border: 1px solid color-mix(in srgb, var(--danger) 20%, transparent); border-radius: 9px; color: var(--danger); padding: 9px 18px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit',sans-serif; }
        .section-title { font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--textMuted); margin-bottom: 14px; }
      `}</style>

      {/* AI Habit Modal */}
      {aiHabit && (
        <div className="ai-modal">
          <div className="flex items-center gap-[10px] mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] rounded-[10px] flex items-center justify-center text-lg">🤖</div>
            <div>
              <div className="font-semibold text-[15px] text-text">AI Suggestion</div>
              <div className="text-xs text-textMuted">Personalized for you</div>
            </div>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-[14px_16px] text-base font-semibold text-text mb-[18px]">
            ✨ {aiHabit}
          </div>
          <div className="flex gap-2">
            <button className="modal-add-btn" onClick={addAiHabit}>Add Habit</button>
            <button className="modal-skip-btn" onClick={skipAiHabit}>Skip</button>
          </div>
        </div>
      )}

      {suggestion && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-success/10 border border-success/30 rounded-xl p-[12px_20px] text-success text-sm font-medium z-[99] flex gap-3 items-center">
          {suggestion}
          <button onClick={() => setSuggestion("")} className="bg-none border-none text-success cursor-pointer text-lg leading-none">×</button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-[13px] text-textMuted font-medium mb-[6px] tracking-wide">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 className="text-[28px] font-bold text-text tracking-tight m-0">
              Welcome back, <span className="bg-gradient-to-r from-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">{user?.name?.split(" ")[0] || "there"} 👋</span>
            </h1>
          </div>
          <button className="suggest-btn" onClick={generateHabit}>
            <Zap size={16} /> Suggest Habit
          </button>
        </div>
      </div>

      {!data ? (
        <div className="flex gap-4 mb-7">
          {[1, 2, 3].map(i => <div key={i} className="flex-1 h-[90px] bg-surface border border-border rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-7">
            <div className="stat-card">
              <div className="stat-icon bg-primary/10"><Flame size={20} className="text-primary" /></div>
              <div>
                <div className="text-2xl font-bold text-text">{habits.length}</div>
                <div className="text-xs text-textMuted font-medium mt-[2px]">Active Habits</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-success/10"><TrendingUp size={20} className="text-success" /></div>
              <div>
                <div className="text-2xl font-bold text-text">{habits.filter(h => h.completed).length}</div>
                <div className="text-xs text-textMuted font-medium mt-[2px]">Completed Today</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-cyan-500/10"><Zap size={20} className="text-cyan-500" /></div>
              <div>
                <div className="text-2xl font-bold text-text">
                  {habits.length ? Math.round((habits.filter(h => h.completed).length / habits.length) * 100) : 0}%
                </div>
                <div className="text-xs text-textMuted font-medium mt-[2px]">Completion Rate</div>
              </div>
            </div>

            {/* ✅ Streak Stats */}
            <div className="stat-card !border-orange-500/15 !bg-orange-500/5">
              <div className="stat-icon bg-orange-500/10">
                <span className="text-xl">🔥</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-text">{streakStats?.current ?? "—"}</div>
                <div className="text-xs text-textMuted font-medium mt-[2px]">Current Streak</div>
              </div>
            </div>
            <div className="stat-card !border-yellow-500/15 !bg-yellow-500/5">
              <div className="stat-icon bg-yellow-500/10">
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-text">{streakStats?.longest ?? "—"}</div>
                <div className="text-xs text-textMuted font-medium mt-[2px]">Longest Streak</div>
              </div>
            </div>
            <div className="stat-card !border-primary/15 !bg-primary/5">
              <div className="stat-icon bg-primary/10">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-text">{streakStats?.activeDays ?? "—"}</div>
                <div className="text-xs text-textMuted font-medium mt-[2px]">Active Days</div>
              </div>
            </div>
          </div>

          {/* AI Coach + Insights + Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <div className="db-card bg-gradient-to-br from-primary/10 to-cyan-500/5 !border-primary/20">
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-[38px] h-[38px] bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] rounded-xl flex items-center justify-center text-lg text-white">🤖</div>
                  <div className="font-semibold text-base text-text">AI Coach</div>
                </div>
                <div className="text-[15px] text-textMuted leading-[1.8]">
                  {data.coach.split("\n").map((line, i) => {
                    if (!line.trim()) return <br key={i} />;

                    // Bold **text**
                    const parts = line.split(/\*\*(.*?)\*\*/g);
                    const formatted = parts.map((part, j) =>
                      j % 2 === 1
                        ? <strong key={j} className="text-primary font-semibold">{part}</strong>
                        : part
                    );

                    // Bullet points
                    const isBullet = line.trim().startsWith("-") || line.trim().startsWith("•");
                    // Section headers (lines ending with :)
                    const isHeader = line.trim().endsWith(":") && line.trim().length < 40;

                    if (isHeader) return (
                      <div key={i} className="font-semibold text-primary text-[13px] tracking-wider uppercase mt-3.5 mb-1.5">
                        {formatted}
                      </div>
                    );

                    if (isBullet) return (
                      <div key={i} className="flex gap-2.5 items-start mb-1.5 pl-1">
                        <span className="text-primary mt-[2px] flex-shrink-0">•</span>
                        <span>{formatted}</span>
                      </div>
                    );

                    return <div key={i} className="mb-1.5">{formatted}</div>;
                  })}
                </div>
              </div>
            </div>

            <div className="db-card">
              <div className="flex items-center gap-2.5 mb-4">
                <Brain size={18} className="text-primary" />
                <div className="section-title m-0">Insights</div>
              </div>
              {data.insights.map((item, i) => <div key={i} className="insight-item">💡 {item}</div>)}
            </div>

            <div className="db-card">
              <div className="flex items-center gap-2.5 mb-4">
                <Zap size={18} className="text-cyan-500" />
                <div className="section-title m-0">Actions</div>
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
              <div className="db-card mt-5">
                <div className="text-[13px] font-semibold tracking-wider uppercase text-textMuted mb-4">
                  🏅 Achievements
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {Object.entries(BADGE_DEFS).map(([id, badge]) => {
                    const unlocked = badges.includes(id);
                    return (
                      <div key={id}
                        className={`flex items-center gap-2.5 p-[10px_16px] rounded-xl border transition-all duration-200
                          ${unlocked
                            ? "bg-primary/10 border-primary/30 opacity-100 grayscale-0"
                            : "bg-surface border-border opacity-40 grayscale"}`}
                      >
                        <span className="text-[22px]">{badge.emoji}</span>
                        <div>
                          <div className={`text-[13px] font-semibold ${unlocked ? "text-text" : "text-textMuted"}`}>{badge.name}</div>
                          <div className="text-[11px] text-textMuted">{badge.desc}</div>
                        </div>
                        {unlocked && <span className="text-[10px] bg-success/15 text-success p-[2px_8px] rounded-full font-semibold ml-1">EARNED</span>}
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
