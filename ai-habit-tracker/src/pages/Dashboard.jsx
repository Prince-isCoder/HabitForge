import React, { useEffect, useState } from "react";
import { getDashboardData, getCalendar } from "../services/api";
import { Zap, Brain, Flame, TrendingUp, Plus, LayoutGrid, Calendar, Bot } from "lucide-react";

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
    <div className="min-h-screen bg-background text-text p-8 animate-fade-in">
      {/* AI Habit Modal */}
      {aiHabit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--backdrop)] backdrop-blur-sm">
          <div className="bg-surface border border-primary/30 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-popIn">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
              <div>
                <h3 className="font-bold text-lg">AI Smart Suggestion</h3>
                <p className="text-sm text-textMuted">Tailored for your current goals</p>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 text-xl font-bold text-primary mb-8 text-center">
              “{aiHabit}”
            </div>
            <div className="flex gap-4">
              <button className="flex-1 btn btn-primary py-3" onClick={addAiHabit}>Add Habit</button>
              <button className="flex-1 btn btn-secondary py-3" onClick={skipAiHabit}>Maybe later</button>
            </div>
          </div>
        </div>
      )}

      {suggestion && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-surface border border-success/30 rounded-2xl px-6 py-4 text-success font-bold z-[99] flex gap-4 items-center shadow-xl">
          <span className="text-xl">✅</span> {suggestion}
          <button onClick={() => setSuggestion("")} className="ml-4 text-textMuted hover:text-text transition-colors">×</button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-textMuted font-bold text-xs uppercase tracking-[0.2em] mb-3">
             <Calendar size={14} /> {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Hi, <span className="bg-gradient-to-r from-primary to-primaryHover bg-clip-text text-transparent">{user?.name?.split(" ")[0] || "there"}</span> 👋
          </h1>
          <p className="text-textMuted mt-3 text-lg">Ready to conquer your goals today?</p>
        </div>
        <button
          className="btn btn-primary px-8 py-4 text-base gap-2 rounded-2xl"
          onClick={generateHabit}
        >
          <Zap size={20} /> Suggest Habit
        </button>
      </div>

      {!data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface/50 border border-border rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Active Habits", val: habits.length, icon: <LayoutGrid className="text-primary" />, color: "bg-primary/10" },
              { label: "Done Today", val: habits.filter(h => h.completed).length, icon: <TrendingUp className="text-success" />, color: "bg-success/10" },
              { label: "Completion", val: `${habits.length ? Math.round((habits.filter(h => h.completed).length / habits.length) * 100) : 0}%`, icon: <Zap className="text-orange-500" />, color: "bg-orange-500/10" },
              { label: "Current Streak", val: `${streakStats?.current ?? 0}d`, icon: <Flame className="text-danger" />, color: "bg-danger/10" }
            ].map((stat, i) => (
              <div key={i} className="card card-hover flex flex-col justify-between group">
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                   {React.cloneElement(stat.icon, { size: 24 })}
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1 tracking-tight">{stat.val}</div>
                  <div className="text-xs font-bold text-textMuted uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            {/* AI Coach Main Card */}
            <div className="xl:col-span-2">
              <div className="card bg-gradient-to-br from-surface to-primary/[0.03] border-primary/10 !p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                       <Bot size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Personal AI Coach</h2>
                      <p className="text-sm text-textMuted font-medium">Daily Analysis & Feedback</p>
                    </div>
                  </div>
                  <div className="hidden md:flex gap-2">
                    <span className="bg-primary/5 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-primary/10">Insight Mode</span>
                  </div>
                </div>

                <div className="space-y-6 text-base text-text/80 leading-relaxed max-w-3xl">
                  {data.coach.split("\n").map((line, i) => {
                    if (!line.trim()) return <div key={i} className="h-4" />;

                    // Bold **text**
                    const parts = line.split(/\*\*(.*?)\*\*/g);
                    const formatted = parts.map((part, j) =>
                      j % 2 === 1 ? <strong key={j} className="text-text font-bold">{part}</strong> : part
                    );

                    const isBullet = line.trim().startsWith("-") || line.trim().startsWith("•");
                    const isHeader = line.trim().endsWith(":") && line.trim().length < 50;

                    if (isHeader) return (
                      <div key={i} className="text-primary font-bold text-sm uppercase tracking-widest pt-4">
                        {formatted}
                      </div>
                    );

                    if (isBullet) return (
                      <div key={i} className="flex gap-3 items-start pl-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                        <span className="text-textMuted">{formatted}</span>
                      </div>
                    );

                    return <p key={i} className="text-textMuted">{formatted}</p>;
                  })}
                </div>
              </div>
            </div>

            {/* Quick Stats & Badges */}
            <div className="space-y-8">
              <div className="card !p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Brain size={20} className="text-primary" />
                  <h3 className="font-bold text-sm uppercase tracking-widest">Key Insights</h3>
                </div>
                <div className="space-y-4">
                  {data.insights.slice(0, 3).map((item, i) => (
                    <div key={i} className="bg-background border border-border/50 rounded-2xl p-4 flex gap-4 group hover:border-primary/30 transition-all">
                       <span className="text-lg grayscale group-hover:grayscale-0 transition-all">💡</span>
                       <p className="text-sm text-textMuted font-medium leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card !p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-lg">🏅</span>
                  <h3 className="font-bold text-sm uppercase tracking-widest">Recent Badges</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(() => {
                    const u = JSON.parse(localStorage.getItem("user")) || {};
                    const badges = u.badges || [];
                    const BADGE_DEFS = {
                      first_habit: { emoji: "🌱", name: "First Step" },
                      streak_7: { emoji: "🔥", name: "On Fire" },
                      perfect_day: { emoji: "💯", name: "Perfect Day" },
                      xp_100: { emoji: "⚡", name: "Century" },
                      level_3: { emoji: "🏆", name: "Disciplined" },
                    };
                    return Object.entries(BADGE_DEFS).map(([id, badge]) => {
                      const unlocked = badges.includes(id);
                      return (
                        <div key={id} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all border ${unlocked ? 'bg-primary/10 border-primary/20 grayscale-0 shadow-sm shadow-primary/5' : 'bg-background border-border/50 grayscale opacity-30'}`} title={badge.name}>
                          {badge.emoji}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;