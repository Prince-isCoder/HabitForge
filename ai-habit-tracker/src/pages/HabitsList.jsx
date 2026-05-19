import React, { useEffect, useState } from "react";
import { Plus, Flame, Trash2, Check, Zap, Search, X, BarChart2, Filter } from "lucide-react";

const CATEGORIES = ["All", "Health", "Work", "Learning", "Fitness", "Mindfulness", "General"];
const CAT_COLORS = {
  Health: { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)",  text: "#10B981" },
  Work:   { bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.2)",  text: "#6366F1" },
  Learning:{ bg:"rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.2)",   text: "#06B6D4" },
  Fitness:{ bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.2)",  text: "#F97316" },
  Mindfulness:{ bg:"rgba(168,85,247,0.1)",border:"rgba(168,85,247,0.2)", text: "#A855F7" },
  General: { bg: "var(--surface-light)", border: "var(--border)", text: "var(--text-muted)" },
};

const HabitsList = () => {
  const [habits,          setHabits]          = useState([]);
  const [aiHabit,         setAiHabit]         = useState("");
  const [suggestion,      setSuggestion]      = useState("");
  const [title,           setTitle]           = useState("");
  const [category,        setCategory]        = useState("General");
  const [filterCat,       setFilterCat]       = useState("All");
  const [loading,         setLoading]         = useState(false);
  const [search,          setSearch]          = useState("");
  const [selectedHabit,   setSelectedHabit]   = useState(null);  // for analytics modal
  const [habitStats,      setHabitStats]      = useState(null);
  const [statsLoading,    setStatsLoading]    = useState(false);
  const [badgeToast,      setBadgeToast]      = useState(null);  // {emoji, name}

  const token = React.useCallback(() => localStorage.getItem("token"), []);

  const fetchHabits = React.useCallback(() =>
    fetch("http://localhost:5000/api/habits", {
      headers: { "Authorization": `Bearer ${token()}` }
    }).then(r => r.json()).then(d => setHabits(Array.isArray(d) ? d : [])), [token]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  // ✅ Filter by search + category
  const filtered = habits.filter(h => {
    const matchSearch = h.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === "All" || h.category === filterCat;
    return matchSearch && matchCat;
  });
  const activeHabits    = filtered.filter(h => !h.completed);
  const completedHabits = filtered.filter(h => h.completed);
  const completionPct   = habits.length ? Math.round((habits.filter(h => h.completed).length / habits.length) * 100) : 0;

  const generateHabit = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token()}` },
        body: JSON.stringify({ messages: [{ role: "user", content: `Suggest ONE useful daily habit. Max 5 words. No generic habits. Only return the habit text.` }] })
      });
      const data = await res.json();
      const habitText = data.reply || "";
      if (!habitText.trim()) { setSuggestion("⚠ AI returned empty habit"); return; }
      setAiHabit(habitText);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const addAiHabit = async () => {
    const exists = habits.some(h => h.title.toLowerCase() === aiHabit.toLowerCase());
    if (exists) { setSuggestion("⚠ Already exists!"); setAiHabit(""); return; }
    await fetch("http://localhost:5000/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token()}` },
      body: JSON.stringify({ title: aiHabit, category })
    });
    await fetchHabits();
    setSuggestion("✅ Added: " + aiHabit);
    setAiHabit("");
  };

  const addHabit = async () => {
    if (!title.trim()) return;
    await fetch("http://localhost:5000/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token()}` },
      body: JSON.stringify({ title, category })
    });
    setTitle("");
    await fetchHabits();
  };

  const toggleHabit = async (id) => {
    const res = await fetch("http://localhost:5000/api/habits/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token()}` },
      body: JSON.stringify({ habitId: id })
    });
    const data = await res.json();

    // ✅ XP + badges update
    if (data?.xpUpdate) {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      localStorage.setItem("user", JSON.stringify({
        ...user,
        xp:        data.xpUpdate.xp,
        level:     data.xpUpdate.level,
        levelName: data.xpUpdate.levelName,
        xpForNext: data.xpUpdate.xpForNext,
        badges:    data.xpUpdate.badges
      }));
      window.dispatchEvent(new Event("xpUpdated"));
    }

    // ✅ Badge toast notification
    if (data?.newBadges?.length > 0) {
      setBadgeToast(data.newBadges[0]);
      setTimeout(() => setBadgeToast(null), 4000);
    }

    await fetchHabits();
  };

  const deleteHabit = async (id) => {
    await fetch(`http://localhost:5000/api/habits/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token()}` }
    });
    await fetchHabits();
  };

  // ✅ Fetch per-habit analytics
  const openHabitStats = async (habit) => {
    setSelectedHabit(habit);
    setHabitStats(null);
    setStatsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/analytics/habit/${habit._id}`, {
        headers: { "Authorization": `Bearer ${token()}` }
      });
      const data = await res.json();
      setHabitStats(data);
    } catch (err) { console.error(err); }
    finally { setStatsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background text-text p-8 animate-fade-in">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .habit-card { @apply bg-surface border border-border rounded-3xl p-6 flex items-center gap-6 transition-all duration-200 shadow-sm shadow-black/[0.02] group; }
        .habit-card:hover { @apply border-primary/30 -translate-y-1 shadow-xl shadow-primary/5; }
        .habit-card.done { @apply opacity-60 border-success/20 bg-success/[0.02]; }

        .check-btn { @apply w-12 h-12 rounded-2xl border-2 border-border bg-surface cursor-pointer flex items-center justify-center transition-all shrink-0 hover:border-primary/50 hover:bg-primary/5; }
        .check-btn.done { @apply bg-success border-transparent shadow-lg shadow-success/30 scale-105; }

        .action-icon-btn { @apply w-10 h-10 rounded-xl bg-surfaceLight/50 text-textMuted flex items-center justify-center transition-all hover:bg-primary/10 hover:text-primary border border-border/50; }
        .action-icon-btn.delete { @apply hover:bg-danger/10 hover:text-danger hover:border-danger/20; }

        .streak-pill { @apply flex items-center gap-1.5 bg-orange-500/5 border border-orange-500/10 rounded-full px-3 py-1 text-xs font-bold text-orange-500 uppercase tracking-wider; }
      `}</style>

      {/* Badge Toast */}
      {badgeToast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-surface border border-primary/20 rounded-3xl p-6 flex items-center gap-4 z-[300] shadow-2xl animate-slideUp">
          <span className="text-4xl">{badgeToast.emoji}</span>
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-primary mb-1">New Badge!</div>
            <div className="text-lg font-bold text-text">{badgeToast.name}</div>
            <div className="text-xs text-textMuted mt-1">{badgeToast.desc}</div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {aiHabit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
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
               <button className="flex-1 btn btn-secondary py-3" onClick={() => setAiHabit("")}>Maybe later</button>
             </div>
           </div>
        </div>
      )}

      {/* Toast */}
      {suggestion && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-surface border border-success/30 rounded-2xl px-6 py-4 text-success font-bold z-[99] flex gap-4 items-center shadow-xl">
          <span className="text-xl">✅</span> {suggestion}
          <button onClick={() => setSuggestion("")} className="ml-4 text-textMuted hover:text-text transition-colors">×</button>
        </div>
      )}

      {/* Per-Habit Analytics Modal */}
      {selectedHabit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedHabit(null)}>
          <div className="bg-surface border border-border rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-popIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-text mb-2">{selectedHabit.title}</h3>
                {selectedHabit.category && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: CAT_COLORS[selectedHabit.category]?.bg || 'var(--surface-light)', border:`1px solid ${CAT_COLORS[selectedHabit.category]?.border || 'var(--border)'}`, color: CAT_COLORS[selectedHabit.category]?.text || 'var(--text-muted)' }}>
                    {selectedHabit.category}
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedHabit(null)} className="w-10 h-10 flex items-center justify-center bg-surfaceLight/50 rounded-xl hover:bg-surfaceLight transition-all">
                <X size={20} className="text-textMuted" />
              </button>
            </div>

            {statsLoading ? (
              <div className="text-center py-12 text-textMuted font-medium italic">Generating analytics...</div>
            ) : habitStats ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                  {[
                    { label:"Total Done",      val: habitStats.totalCompletions, emoji:"✅" },
                    { label:"Current Streak",  val: habitStats.currentStreak,    emoji:"🔥" },
                    { label:"Best Streak",     val: habitStats.bestStreak,       emoji:"🏆" },
                  ].map((s,i) => (
                    <div key={i} className="bg-background border border-border/50 rounded-2xl p-5 text-center">
                      <div className="text-2xl mb-2">{s.emoji}</div>
                      <div className="text-2xl font-bold text-text tracking-tight">{s.val}</div>
                      <div className="text-[10px] font-bold text-textMuted uppercase tracking-widest mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* mini calendar */}
                <div className="mb-2">
                  <div className="text-xs font-bold tracking-[0.12em] uppercase text-textMuted mb-4">Activity Pattern (Last 30 Days)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {habitStats.last30.map((day, i) => (
                      <div key={i} title={`${day.date}: ${day.completed ? "Done" : "Missed"}`}
                        className="w-6 h-6 rounded-[6px] shrink-0"
                        style={{ background: day.completed ? "var(--primary)" : "var(--surface-light)", border:`1px solid ${day.completed ? "var(--primary)" : "var(--border)"}`, opacity: day.completed ? 0.8 : 1 }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-[3px] bg-surfaceLight border border-border" />
                      <span className="text-[11px] text-textMuted font-medium">Missed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-[3px] bg-primary/70" />
                      <span className="text-[11px] text-textMuted font-medium">Completed</span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">My Habits</h1>
          <div className="flex items-center gap-3">
             <div className="flex-1 w-64 h-2 bg-border/40 rounded-full overflow-hidden">
               <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${completionPct}%` }} />
             </div>
             <span className="text-sm font-bold text-primary">{completionPct}% today</span>
          </div>
        </div>
        <button className="btn btn-secondary px-6 py-3 gap-2 rounded-2xl" onClick={generateHabit} disabled={loading}>
          <Zap size={18} className="text-primary" /> Suggest Habit
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-border rounded-[2rem] p-6 mb-10 flex flex-wrap items-center gap-6 shadow-sm">
        <div className="flex-1 flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${filterCat === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background text-textMuted hover:bg-surfaceLight'}`}
              onClick={() => setFilterCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-px h-8 bg-border/50 hidden lg:block" />

        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
             className="bg-background border border-border/50 rounded-2xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all w-64"
             placeholder="Search habits..."
             value={search}
             onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="bg-primary/[0.02] border border-primary/10 rounded-[2rem] p-8 mb-12 flex flex-wrap gap-4 items-center">
         <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Plus size={24} />
         </div>
         <select className="bg-surface border border-border rounded-2xl px-5 py-3 text-sm outline-none font-bold" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            className="flex-1 input-field !py-3 !rounded-2xl min-w-[200px]"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addHabit()}
            placeholder="What's your new habit?"
          />
          <button className="btn btn-primary px-10 py-3 rounded-2xl" onClick={addHabit}>Add Habit</button>
      </div>

      {/* Habits Grid */}
      <div className="space-y-12">
        {/* TO DO Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Active Tasks</h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{activeHabits.length}</span>
          </div>

          {activeHabits.length === 0 ? (
            <div className="card border-dashed flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-surfaceLight/50 rounded-full flex items-center justify-center mb-4 text-2xl">✨</div>
              <h3 className="font-bold text-lg mb-1">Clear for now!</h3>
              <p className="text-textMuted text-sm">Add a new goal or enjoy your progress.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
              {activeHabits.map(habit => (
                <HabitRow key={habit._id} habit={habit} onToggle={toggleHabit} onDelete={deleteHabit} onStats={openHabitStats} />
              ))}
            </div>
          )}
        </div>

        {/* COMPLETED Section */}
        {completedHabits.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-success/80">Finished Goals</h2>
              <span className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full">{completedHabits.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 opacity-70">
              {completedHabits.map(habit => (
                <HabitRow key={habit._id} habit={habit} onToggle={toggleHabit} onDelete={deleteHabit} onStats={openHabitStats} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── HabitRow Component ── */
const HabitRow = ({ habit, onToggle, onDelete, onStats }) => {
  const cat = habit.category || "General";
  const c   = CAT_COLORS[cat] || CAT_COLORS.General;
  return (
    <div className={`habit-card ${habit.completed ? "done" : ""}`}>
      <button className={`check-btn ${habit.completed ? "done" : ""}`} onClick={() => onToggle(habit._id)}>
        <Check size={24} className={habit.completed ? "text-white" : "text-border group-hover:text-primary transition-colors"} />
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={`text-lg font-bold mb-2 truncate ${habit.completed ? "line-through text-textMuted" : "text-text"}`}>
          {habit.title}
        </h4>
        <div className="flex gap-3 items-center">
          <div className="streak-pill">
            <Flame size={12} className="fill-orange-500" /> {habit.streak || 0}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg" style={{ background: c.bg, border:`1px solid ${c.border}`, color: c.text }}>
            {cat}
          </span>
        </div>
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="action-icon-btn" onClick={() => onStats(habit)} title="Analytics">
          <BarChart2 size={16} />
        </button>
        <button className="action-icon-btn delete" onClick={() => onDelete(habit._id)} title="Delete">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default HabitsList;