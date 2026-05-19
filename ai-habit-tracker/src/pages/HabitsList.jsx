import React, { useEffect, useState } from "react";
import { Plus, Flame, Trash2, Check, Zap, Search, X, BarChart2 } from "lucide-react";

const CATEGORIES = ["All", "Health", "Work", "Learning", "Fitness", "Mindfulness", "General"];
const CAT_COLORS = {
  Health: { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  text: "#10b981" },
  Work:   { bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)",  text: "#8b5cf6" },
  Learning:{ bg:"rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.25)",   text: "#06b6d4" },
  Fitness:{ bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.25)",  text: "#f97316" },
  Mindfulness:{ bg:"rgba(139,92,246,0.1)",border:"rgba(139,92,246,0.25)", text: "#a855f7" },
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

  const token = () => localStorage.getItem("token");

  const fetchHabits = () =>
    fetch("http://localhost:5000/api/habits", {
      headers: { "Authorization": `Bearer ${token()}` }
    }).then(r => r.json()).then(d => setHabits(Array.isArray(d) ? d : []));

  useEffect(() => { fetchHabits(); }, []);

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
    <div className="font-['Outfit'] min-h-screen bg-background text-text p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .habit-card { @apply bg-surface border border-border rounded-2xl p-5 flex items-center gap-4 transition-all duration-150; animation:cardIn 0.25s ease both; }
        .habit-card:hover { @apply border-primary/25 -translate-y-px shadow-xl shadow-black/10; }
        .habit-card.done { @apply opacity-55 border-success/15 bg-success/5; }
        @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .check-btn { @apply w-[38px] h-[38px] rounded-full border-2 border-primary/35 bg-transparent cursor-pointer flex items-center justify-center transition-all shrink-0; }
        .check-btn:hover { @apply border-primary bg-primary/10; }
        .check-btn.done { @apply bg-gradient-to-br from-success to-emerald-600 border-transparent shadow-lg shadow-success/30; }
        .delete-btn { @apply w-8 h-8 rounded-[9px] bg-danger/5 border border-danger/10 cursor-pointer flex items-center justify-center transition-all shrink-0 opacity-0; }
        .habit-card:hover .delete-btn { opacity:1; }
        .delete-btn:hover { @apply bg-danger/15 border-danger/30; }
        .stats-btn { @apply w-[30px] h-[30px] rounded-lg bg-primary/5 border border-primary/15 cursor-pointer flex items-center justify-center transition-all shrink-0 opacity-0; }
        .habit-card:hover .stats-btn { opacity:1; }
        .stats-btn:hover { @apply bg-primary/15; }
        .streak-badge { @apply flex items-center gap-1.5 bg-orange-400/5 border border-orange-400/15 rounded-full px-2.5 py-1 text-xs font-semibold text-orange-400 whitespace-nowrap; }
        .add-input { @apply flex-1 bg-surfaceLight/40 border border-border/50 rounded-xl px-4 py-[11px] text-sm text-text font-['Outfit'] outline-none transition-all min-w-0 focus:border-primary/45 focus:shadow-[0_0_0_3px_rgba(var(--primary-rgb),0.1)]; }
        .add-input::placeholder { @apply text-textMuted/50; }
        .cat-select { @apply bg-surfaceLight/40 border border-border/50 rounded-xl px-3.5 py-[11px] text-[13px] text-textMuted font-['Outfit'] outline-none cursor-pointer; }
        .add-btn { @apply bg-gradient-to-br from-primary to-primaryHover border-none rounded-xl text-white px-5 py-[11px] text-sm font-semibold cursor-pointer font-['Outfit'] flex items-center gap-1.5 transition-all shadow-lg shadow-primary/30 whitespace-nowrap; }
        .add-btn:hover { @apply -translate-y-px shadow-xl shadow-primary/40; }
        .ai-btn { @apply bg-primary/10 border border-primary/25 rounded-xl text-primary px-[18px] py-[11px] text-sm font-semibold cursor-pointer font-['Outfit'] flex items-center gap-1.5 transition-all whitespace-nowrap; }
        .ai-btn:hover { @apply bg-primary/20 border-primary/40; }
        .ai-btn:disabled { @apply opacity-50 cursor-not-allowed; }
        .section-label { @apply text-[11px] font-bold tracking-widest uppercase text-textMuted/60 mb-3.5 flex items-center gap-2; }
        .section-label::after { content:''; @apply flex-1 h-[1px] bg-border/50; }
        .ai-modal { position:fixed; top:24px; left:50%; transform:translateX(-50%); @apply bg-surface/98 border border-primary/30 rounded-[18px] p-6 z-[100] w-[90%] max-w-[400px] shadow-2xl backdrop-blur-[24px]; animation:popIn 0.2s ease; }
        @keyframes popIn { from{opacity:0;transform:translateX(-50%) scale(0.95)} to{opacity:1;transform:translateX(-50%) scale(1)} }
        .progress-bar-bg { @apply h-[5px] bg-border/30 rounded-full overflow-hidden mt-2; }
        .progress-bar-fill { @apply h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full transition-all duration-[0.6s] ease-in-out; }
        .search-input { @apply bg-surfaceLight/40 border border-border/50 rounded-xl p-[10px_14px_10px_36px] text-[13px] text-textMuted font-['Outfit'] outline-none transition-all w-[180px] focus:border-primary/40; }
        .search-input::placeholder { @apply text-textMuted/50; }
        .cat-filter-btn { @apply bg-surfaceLight/30 border border-border/50 rounded-full px-3.5 py-1.5 text-xs font-semibold text-textMuted cursor-pointer font-['Outfit'] transition-all whitespace-nowrap; }
        .cat-filter-btn.active { @apply bg-primary/10 border-primary/30 text-primary; }
        .modal-overlay { position:fixed; inset:0; @apply bg-black/70 z-[200] flex items-center justify-center backdrop-blur-[4px]; animation:fadeIn 0.2s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .stats-modal { @apply bg-surface border border-border rounded-[20px] p-7 w-[90%] max-w-[520px] max-height-[80vh] overflow-y-auto; animation:popInCenter 0.2s ease; }
        @keyframes popInCenter { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .mini-cal-cell { @apply w-5 h-5 rounded-[4px] shrink-0; }
        .badge-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); @apply bg-surface/97 border border-primary/35 rounded-2xl p-[14px_22px] flex items-center gap-3 z-[300] shadow-2xl; animation:slideUp 0.3s ease; }
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>

      {/* Badge Toast */}
      {badgeToast && (
        <div className="badge-toast">
          <span className="text-[28px]">{badgeToast.emoji}</span>
          <div>
            <div className="text-[13px] font-bold text-text">Badge Unlocked!</div>
            <div className="text-xs text-primary font-semibold">{badgeToast.name}</div>
            <div className="text-[11px] text-textMuted">{badgeToast.desc}</div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {aiHabit && (
        <div className="ai-modal">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-primary rounded-lg flex items-center justify-center text-lg text-white">🤖</div>
            <div>
              <div className="font-semibold text-[15px] text-text">AI Suggestion</div>
              <div className="text-xs text-textMuted">Personalized for you</div>
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-[14px_16px] text-base font-semibold text-primary mb-[18px]">
            ✨ {aiHabit}
          </div>
          <div className="flex gap-2.5">
            <button onClick={addAiHabit} className="bg-gradient-to-br from-success to-emerald-600 border-none rounded-xl text-white p-[9px_18px] text-sm font-semibold cursor-pointer font-['Outfit']">Add Habit</button>
            <button onClick={() => setAiHabit("")} className="bg-danger/10 border border-danger/20 rounded-xl text-danger p-[9px_18px] text-sm font-semibold cursor-pointer font-['Outfit']">Skip</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {suggestion && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-success/10 border border-success/30 rounded-xl p-[12px_20px] text-success text-sm font-medium z-[99] flex gap-3 items-center">
          {suggestion}
          <button onClick={() => setSuggestion("")} className="bg-none border-none text-success cursor-pointer text-lg">×</button>
        </div>
      )}

      {/* Per-Habit Analytics Modal */}
      {selectedHabit && (
        <div className="modal-overlay" onClick={() => setSelectedHabit(null)}>
          <div className="stats-modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-lg font-bold text-text mb-1">{selectedHabit.title}</div>
                {selectedHabit.category && (
                  <span style={{ fontSize:11, fontWeight:600, background: CAT_COLORS[selectedHabit.category]?.bg || 'var(--surface-light)', border:`1px solid ${CAT_COLORS[selectedHabit.category]?.border || 'var(--border)'}`, color: CAT_COLORS[selectedHabit.category]?.text || 'var(--text-muted)', padding:"3px 10px", borderRadius:99 }}>
                    {selectedHabit.category}
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedHabit(null)} className="bg-surfaceLight/50 border border-border rounded-xl w-[34px] h-[34px] flex items-center justify-center cursor-pointer">
                <X size={16} className="text-textMuted" />
              </button>
            </div>

            {statsLoading ? (
              <div className="text-center text-textMuted/60 py-10">Loading analytics...</div>
            ) : habitStats ? (
              <>
                {/* Stat chips */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label:"Total Done",      val: habitStats.totalCompletions, emoji:"✅" },
                    { label:"Current Streak",  val: habitStats.currentStreak,    emoji:"🔥" },
                    { label:"Best Streak",     val: habitStats.bestStreak,       emoji:"🏆" },
                  ].map((s,i) => (
                    <div key={i} className="bg-surfaceLight/30 border border-border rounded-xl p-[14px_12px] text-center">
                      <div className="text-xl mb-1.5">{s.emoji}</div>
                      <div className="text-[22px] font-bold text-text">{s.val}</div>
                      <div className="text-[11px] text-textMuted mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Last 30 days mini calendar */}
                <div className="mb-2">
                  <div className="text-xs font-bold tracking-[0.07em] uppercase text-textMuted mb-3">Last 30 Days</div>
                  <div className="flex flex-wrap gap-1">
                    {habitStats.last30.map((day, i) => (
                      <div key={i} title={`${day.date}: ${day.completed ? "✅ Done" : "❌ Missed"}`}
                        className="mini-cal-cell"
                        style={{ background: day.completed ? "var(--primary)" : "var(--surface-light)", border:`1px solid ${day.completed ? "var(--primary)" : "var(--border)"}`, opacity: day.completed ? 0.7 : 1 }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2.5">
                    <div className="w-[11px] h-[11px] rounded-[2px] bg-surfaceLight border border-border" />
                    <span className="text-[11px] text-textMuted">Missed</span>
                    <div className="w-[11px] h-[11px] rounded-[2px] bg-primary/70 border border-primary/80 ml-2" />
                    <span className="text-[11px] text-textMuted">Completed</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-textMuted/60 py-10">No data yet — complete this habit to see stats!</div>
            )}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-7">
        <h1 className="text-[28px] font-bold text-text tracking-tight m-[0_0_6px]">My Habits</h1>
        <div className="text-sm text-textMuted mb-2.5">
          {habits.filter(h=>h.completed).length} of {habits.length} completed today
        </div>
        <div className="progress-bar-bg max-w-[320px]">
          <div className="progress-bar-fill" style={{ width:`${completionPct}%` }} />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {CATEGORIES.map(cat => (
          <button key={cat} className={`cat-filter-btn ${filterCat === cat ? "active" : ""}`} onClick={() => setFilterCat(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 mb-8">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-textMuted/60 pointer-events-none" />
          <input className="search-input" placeholder="Search habits..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <button className="ai-btn" onClick={generateHabit} disabled={loading}>
          {loading ? "🤖 Thinking..." : <><Zap size={14} /> Suggest Habit</>}
        </button>

        <div className="flex gap-2 ml-auto flex-wrap">
          <select className="cat-select" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="add-input" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && addHabit()} placeholder="New habit name..." />
          <button className="add-btn" onClick={addHabit}><Plus size={15} /> Add</button>
        </div>
      </div>

      {/* TO DO */}
      <div className="mb-9">
        <div className="section-label">To Do ({activeHabits.length})</div>
        {activeHabits.length === 0 ? (
          <div className="flex flex-col items-center p-[48px_24px] gap-3 text-textMuted text-sm">
            <div className="w-14 h-14 bg-surfaceLight/30 border border-border/50 rounded-2xl flex items-center justify-center"><Zap size={24} className="text-textMuted/40" /></div>
            No pending habits — add one or use AI suggest!
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
            {activeHabits.map(habit => (
              <HabitRow key={habit._id} habit={habit} onToggle={toggleHabit} onDelete={deleteHabit} onStats={openHabitStats} />
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED */}
      {completedHabits.length > 0 && (
        <div>
          <div className="section-label !text-success">Completed ({completedHabits.length})</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 opacity-70">
            {completedHabits.map(habit => (
              <HabitRow key={habit._id} habit={habit} onToggle={toggleHabit} onDelete={deleteHabit} onStats={openHabitStats} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── HabitRow with category badge + stats button ── */
const HabitRow = ({ habit, onToggle, onDelete, onStats }) => {
  const cat = habit.category || "General";
  const c   = CAT_COLORS[cat] || { bg: "var(--surface-light)", border: "var(--border)", text: "var(--text-muted)" };
  return (
    <div className={`habit-card ${habit.completed ? "done" : ""}`}>
      <button className={`check-btn ${habit.completed ? "done" : ""}`} onClick={() => onToggle(habit._id)}>
        <Check size={16} className={habit.completed ? "text-white" : "text-primary/40"} />
      </button>

      <div className="flex-1 min-w-0">
        <div className={`text-[15px] font-semibold ${habit.completed ? "text-textMuted line-through" : "text-text"} mb-1.5 truncate`}>
          {habit.title}
        </div>
        <div className="flex gap-1.5 items-center flex-wrap">
          <div className="streak-badge inline-flex">
            <Flame size={11} /> {habit.streak || 0} day streak
          </div>
          <span className="text-[11px] font-bold px-[9px] py-[3px] rounded-full" style={{ background:c.bg, border:`1px solid ${c.border}`, color:c.text }}>
            {cat}
          </span>
        </div>
      </div>

      <button className="stats-btn" onClick={() => onStats(habit)} title="View analytics">
        <BarChart2 size={13} className="text-primary" />
      </button>

      <button className="delete-btn" onClick={() => onDelete(habit._id)}>
        <Trash2 size={13} className="text-danger" />
      </button>
    </div>
  );
};

export default HabitsList;