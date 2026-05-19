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
    <div className="font-['Outfit'] min-h-screen bg-background text-text p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .db-card { @apply bg-surfaceLight/30 border border-border rounded-[18px] p-6 transition-colors; }
        .db-card:hover { @apply border-primary/25; }
        .stat-card { @apply bg-surfaceLight/30 border border-border rounded-2xl p-[22px] flex items-center gap-4; }
        .stat-icon { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .insight-item { @apply bg-primary/5 border border-primary/10 rounded-xl p-[11px_14px] text-sm text-textMuted mb-2; }
        .action-item { @apply bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-[11px_14px] text-sm text-textMuted mb-2; }
        .ai-modal { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); @apply bg-surface/98 border border-primary/30 rounded-[18px] p-6 z-[100] w-[90%] max-w-[420px] shadow-2xl backdrop-blur-2xl; animation: popIn 0.2s ease; }
        @keyframes popIn { from { opacity:0; transform: translateX(-50%) scale(0.95); } to { opacity:1; transform: translateX(-50%) scale(1); } }
        .suggest-btn { @apply bg-gradient-to-br from-primary to-primaryHover border-none rounded-xl text-white p-[11px_22px] text-sm font-semibold cursor-pointer font-['Outfit'] flex items-center gap-2 transition-all shadow-lg shadow-primary/30; }
        .suggest-btn:hover { @apply -translate-y-0.5 shadow-xl shadow-primary/40; }
        .modal-add-btn { @apply bg-gradient-to-br from-success to-emerald-600 border-none rounded-lg text-white p-[9px_18px] text-sm font-semibold cursor-pointer font-['Outfit'] transition-opacity; }
        .modal-skip-btn { @apply bg-danger/10 border border-danger/20 rounded-lg text-danger p-[9px_18px] text-sm font-semibold cursor-pointer font-['Outfit']; }
        .section-title { @apply text-[13px] font-bold tracking-widest uppercase text-textMuted mb-3.5; }
      `}</style>

      {/* AI Habit Modal */}
      {aiHabit && (
        <div className="ai-modal">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-primary rounded-lg flex items-center justify-center text-lg">🤖</div>
            <div>
              <div className="font-semibold text-[15px] text-text">AI Suggestion</div>
              <div className="text-xs text-textMuted">Personalized for you</div>
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-[14px_16px] text-base font-semibold text-primary mb-[18px]">
            ✨ {aiHabit}
          </div>
          <div className="flex gap-2.5">
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
            <div className="text-[13px] text-textMuted font-medium mb-1.5 tracking-widest">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 className="text-[28px] font-bold text-text tracking-tight m-0">
              Welcome back, <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">{user?.name?.split(" ")[0] || "there"} 👋</span>
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
                <div className="text-xs text-textMuted font-medium mt-0.5">Active Habits</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-success/10"><TrendingUp size={20} className="text-success" /></div>
              <div>
                <div className="text-2xl font-bold text-text">{habits.filter(h => h.completed).length}</div>
                <div className="text-xs text-textMuted font-medium mt-0.5">Completed Today</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-cyan-500/10"><Zap size={20} className="text-cyan-500" /></div>
              <div>
                <div className="text-2xl font-bold text-text">
                  {habits.length ? Math.round((habits.filter(h => h.completed).length / habits.length) * 100) : 0}%
                </div>
                <div className="text-xs text-textMuted font-medium mt-0.5">Completion Rate</div>
              </div>
            </div>

            {/* ✅ Streak Stats */}
            <div className="stat-card !border-orange-400/20 !bg-orange-400/5">
              <div className="stat-icon bg-orange-400/10">
                <span className="text-xl">🔥</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-text">{streakStats?.current ?? "—"}</div>
                <div className="text-xs text-textMuted font-medium mt-0.5">Current Streak</div>
              </div>
            </div>
            <div className="stat-card !border-yellow-500/20 !bg-yellow-500/5">
              <div className="stat-icon bg-yellow-500/10">
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-text">{streakStats?.longest ?? "—"}</div>
                <div className="text-xs text-textMuted font-medium mt-0.5">Longest Streak</div>
              </div>
            </div>
            <div className="stat-card !border-primary/20 !bg-primary/5">
              <div className="stat-icon bg-primary/10">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-text">{streakStats?.activeDays ?? "—"}</div>
                <div className="text-xs text-textMuted font-medium mt-0.5">Active Days</div>
              </div>
            </div>
          </div>

          {/* AI Coach + Insights + Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-full">
              <div className="db-card bg-gradient-to-br from-primary/10 to-cyan-500/5 !border-primary/20">
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-[38px] h-[38px] bg-gradient-to-br from-primary to-cyan-500 rounded-xl flex items-center justify-center text-lg">🤖</div>
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
                      <div key={i} className="font-bold text-primary text-[13px] tracking-widest uppercase mt-3.5 mb-1.5">
                        {formatted}
                      </div>
                    );

                    if (isBullet) return (
                      <div key={i} className="flex gap-2.5 items-start mb-1.5 pl-1">
                        <span className="text-primary mt-0.5 shrink-0">•</span>
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
                <div className="section-title !m-0">Insights</div>
              </div>
              {data.insights.map((item, i) => <div key={i} className="insight-item">💡 {item}</div>)}
            </div>

            <div className="db-card">
              <div className="flex items-center gap-2.5 mb-4">
                <Zap size={18} className="text-cyan-500" />
                <div className="section-title !m-0">Actions</div>
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
                <div className="text-[13px] font-bold tracking-widest uppercase text-textMuted mb-4">
                  🏅 Achievements
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {Object.entries(BADGE_DEFS).map(([id, badge]) => {
                    const unlocked = badges.includes(id);
                    return (
                      <div key={id} className={`bg-surfaceLight/30 border border-border rounded-xl p-[10px_16px] flex items-center gap-2.5 transition-all ${unlocked ? "border-primary/30 bg-primary/5 opacity-100 grayscale-0" : "opacity-40 grayscale"}`}>
                        <span className="text-[22px]">{badge.emoji}</span>
                        <div>
                          <div className={`text-[13px] font-bold ${unlocked ? "text-text" : "text-textMuted"}`}>{badge.name}</div>
                          <div className="text-[11px] text-textMuted/70">{badge.desc}</div>
                        </div>
                        {unlocked && <span className="text-[10px] bg-success/15 text-success px-2 py-0.5 rounded-full font-bold ml-1">EARNED</span>}
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