import React, { useEffect, useState } from "react";
import { Plus, Flame, Trash2, Check, Zap, Search, X, BarChart2 } from "lucide-react";

const CATEGORIES = ["All", "Health", "Work", "Learning", "Fitness", "Mindfulness", "General"];
const CAT_COLORS = {
  Health: { bg: "color-mix(in srgb, var(--success) 10%, transparent)",  border: "color-mix(in srgb, var(--success) 25%, transparent)",  text: "var(--success)" },
  Work:   { bg: "color-mix(in srgb, var(--primary) 10%, transparent)",  border: "color-mix(in srgb, var(--primary) 25%, transparent)",  text: "var(--primary)" },
  Learning:{ bg:"color-mix(in srgb, #06b6d4 10%, transparent)",   border: "color-mix(in srgb, #06b6d4 25%, transparent)",   text: "#06b6d4" },
  Fitness:{ bg: "color-mix(in srgb, #fb923c 10%, transparent)",  border: "color-mix(in srgb, #fb923c 25%, transparent)",  text: "#fb923c" },
  Mindfulness:{ bg:"color-mix(in srgb, #8b5cf6 10%, transparent)",border:"color-mix(in srgb, #8b5cf6 25%, transparent)", text: "#8b5cf6" },
  General:{ bg: "var(--surfaceLight)", border:"var(--border)",  text: "var(--textMuted)" },
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
    <div className="min-h-screen bg-background text-text p-8 font-['Outfit']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .habit-card { background: var(--surface); border:1px solid var(--border); border-radius:16px; padding:20px; display:flex; align-items:center; gap:16px; transition:border-color 0.2s,transform 0.15s,box-shadow 0.2s; animation:cardIn 0.25s ease both; }
        .habit-card:hover { border-color: var(--primary); transform:translateY(-1px); box-shadow:0 8px 32px rgba(0,0,0,0.1); }
        .habit-card.done { opacity:0.7; border-color: color-mix(in srgb, var(--success) 20%, transparent); background: color-mix(in srgb, var(--success) 5%, transparent); }
        @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .check-btn { width:38px; height:38px; border-radius:50%; border:2px solid color-mix(in srgb, var(--primary) 35%, transparent); background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0; }
        .check-btn:hover { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent); }
        .check-btn.done { background:linear-gradient(135deg,#10b981,#059669); border-color:transparent; box-shadow:0 0 12px rgba(16,185,129,0.3); }
        .delete-btn { width:32px; height:32px; border-radius:9px; background: color-mix(in srgb, var(--danger) 6%, transparent); border:1px solid color-mix(in srgb, var(--danger) 12%, transparent); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0; opacity:0; }
        .habit-card:hover .delete-btn { opacity:1; }
        .delete-btn:hover { background: color-mix(in srgb, var(--danger) 15%, transparent); border-color: color-mix(in srgb, var(--danger) 30%, transparent); }
        .stats-btn { width:30px; height:30px; border-radius:8px; background: color-mix(in srgb, var(--primary) 8%, transparent); border:1px solid color-mix(in srgb, var(--primary) 15%, transparent); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0; opacity:0; }
        .habit-card:hover .stats-btn { opacity:1; }
        .stats-btn:hover { background: color-mix(in srgb, var(--primary) 18%, transparent); }
        .streak-badge { display:flex; align-items:center; gap:5px; background:rgba(251,146,60,0.08); border:1px solid rgba(251,146,60,0.15); border-radius:99px; padding:4px 10px; font-size:12px; font-weight:600; color:#fb923c; white-space:nowrap; }
        .add-input { flex:1; background: var(--surface); border:1px solid var(--border); border-radius:12px; padding:11px 16px; font-size:14px; color: var(--text); font-family:'Outfit',sans-serif; outline:none; transition:border-color 0.2s,box-shadow 0.2s; min-width:0; }
        .add-input:focus { border-color: var(--primary); box-shadow:0 0 0 3px color-mix(in srgb, var(--primary) 10%, transparent); }
        .add-input::placeholder { color: var(--textMuted); }
        .cat-select { background: var(--surface); border:1px solid var(--border); border-radius:12px; padding:11px 14px; font-size:13px; color: var(--textMuted); font-family:'Outfit',sans-serif; outline:none; cursor:pointer; }
        .add-btn { background:linear-gradient(135deg,#4f46e5,#4338ca); border:none; border-radius:12px; color:#fff; padding:11px 20px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; display:flex; align-items:center; gap:7px; transition:transform 0.15s,box-shadow 0.15s; box-shadow:0 4px 16px rgba(79,70,229,0.3); white-space:nowrap; }
        .add-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(79,70,229,0.4); }
        .ai-btn { background: color-mix(in srgb, #8b5cf6 10%, transparent); border:1px solid color-mix(in srgb, #8b5cf6 25%, transparent); border-radius:12px; color:#a78bfa; padding:11px 18px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; display:flex; align-items:center; gap:7px; transition:all 0.2s; white-space:nowrap; }
        .ai-btn:hover { background: color-mix(in srgb, #8b5cf6 18%, transparent); border-color: color-mix(in srgb, #8b5cf6 40%, transparent); }
        .ai-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .section-label { font-size:11px; font-weight:600; letter-spacing:0.09em; text-transform:uppercase; color: var(--textMuted); margin-bottom:14px; display:flex; align-items:center; gap:8px; }
        .section-label::after { content:''; flex:1; height:1px; background: var(--border); }
        .ai-modal { position:fixed; top:24px; left:50%; transform:translateX(-50%); background: var(--surface); border:1px solid var(--primary); border-radius:18px; padding:24px; z-index:100; width:90%; max-width:400px; box-shadow:0 24px 60px rgba(0,0,0,0.5); backdrop-filter:blur(24px); animation:popIn 0.2s ease; }
        @keyframes popIn { from{opacity:0;transform:translateX(-50%) scale(0.95)} to{opacity:1;transform:translateX(-50%) scale(1)} }
        .progress-bar-bg { height:5px; background: var(--surfaceLight); border-radius:99px; overflow:hidden; margin-top:8px; }
        .progress-bar-fill { height:100%; background:linear-gradient(90deg,#4f46e5,#06b6d4); border-radius:99px; transition:width 0.6s ease; }
        .search-input { background: var(--surface); border:1px solid var(--border); border-radius:12px; padding:10px 14px 10px 36px; font-size:13px; color: var(--text); font-family:'Outfit',sans-serif; outline:none; transition:border-color 0.2s; width:180px; }
        .search-input:focus { border-color: var(--primary); }
        .search-input::placeholder { color: var(--textMuted); }
        .cat-filter-btn { background: var(--surface); border:1px solid var(--border); border-radius:99px; padding:6px 14px; font-size:12px; font-weight:600; color: var(--textMuted); cursor:pointer; font-family:'Outfit',sans-serif; transition:all 0.2s; white-space:nowrap; }
        .cat-filter-btn.active { background: color-mix(in srgb, var(--primary) 12%, transparent); border-color: var(--primary); color: var(--primary); }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:200; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); animation:fadeIn 0.2s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .stats-modal { background: var(--surface); border:1px solid var(--border); border-radius:20px; padding:28px; width:90%; max-width:520px; max-height:80vh; overflow-y:auto; animation:popInCenter 0.2s ease; }
        @keyframes popInCenter { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .mini-cal-cell { width:20px; height:20px; border-radius:4px; flex-shrink:0; }
        .badge-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background: var(--surface); border:1px solid var(--primary); border-radius:16px; padding:14px 22px; display:flex; align-items:center; gap:12px; z-index:300; box-shadow:0 16px 48px rgba(0,0,0,0.5); animation:slideUp 0.3s ease; }
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>

      {/* Badge Toast */}
      {badgeToast && (
        <div className="badge-toast">
          <span style={{ fontSize: 28 }}>{badgeToast.emoji}</span>
          <div>
            <div className="text-[13px] font-bold text-text">Badge Unlocked!</div>
            <div className="text-[12px] text-primary font-semibold">{badgeToast.name}</div>
            <div className="text-[11px] text-textMuted">{badgeToast.desc}</div>
          </div>
        </div>
      )}

      {/* AI Modal */}
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
            <button onClick={addAiHabit} className="bg-gradient-to-br from-[#10b981] to-[#059669] border-none rounded-xl color-white p-[9px_18px] text-[14px] font-bold cursor-pointer font-['Outfit']">Add Habit</button>
            <button onClick={() => setAiHabit("")} className="bg-danger/10 border border-danger/20 rounded-xl text-danger p-[9px_18px] text-[14px] font-bold cursor-pointer font-['Outfit']">Skip</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {suggestion && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-success/10 border border-success/30 rounded-xl p-[12px_20px] text-success text-[14px] font-medium z-[99] flex gap-3 items-center">
          {suggestion}
          <button onClick={() => setSuggestion("")} className="bg-none border-none text-success cursor-pointer text-[18px]">×</button>
        </div>
      )}

      {/* Per-Habit Analytics Modal */}
      {selectedHabit && (
        <div className="modal-overlay" onClick={() => setSelectedHabit(null)}>
          <div className="stats-modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[18px] font-bold text-text mb-1">{selectedHabit.title}</div>
                {selectedHabit.category && (
                  <span style={{ fontSize:11, fontWeight:600, background: CAT_COLORS[selectedHabit.category]?.bg, border:`1px solid ${CAT_COLORS[selectedHabit.category]?.border}`, color: CAT_COLORS[selectedHabit.category]?.text, padding:"3px 10px", borderRadius:99 }}>
                    {selectedHabit.category}
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedHabit(null)} className="bg-surfaceLight border border-border rounded-xl w-[34px] h-[34px] flex items-center justify-center cursor-pointer">
                <X size={16} className="text-textMuted" />
              </button>
            </div>

            {statsLoading ? (
              <div className="text-center text-textMuted py-10">Loading analytics...</div>
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
                      <div className="text-[20px] mb-1.5">{s.emoji}</div>
                      <div className="text-[22px] font-bold text-text">{s.val}</div>
                      <div className="text-[11px] text-textMuted mt-[2px]">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Last 30 days mini calendar */}
                <div className="mb-2">
                  <div className="text-[12px] font-bold tracking-wider uppercase text-textMuted mb-3">Last 30 Days</div>
                  <div className="flex flex-wrap gap-1">
                    {habitStats.last30.map((day, i) => (
                      <div key={i} title={`${day.date}: ${day.completed ? "✅ Done" : "❌ Missed"}`}
                        className="mini-cal-cell"
                        style={{ background: day.completed ? "var(--primary)" : "var(--surfaceLight)", border:`1px solid var(--border)` }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-[10px]">
                    <div className="w-[11px] h-[11px] rounded-[2px] bg-surfaceLight border border-border" />
                    <span className="text-[11px] text-textMuted">Missed</span>
                    <div className="w-[11px] h-[11px] rounded-[2px] bg-primary ml-2" />
                    <span className="text-[11px] text-textMuted">Completed</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-textMuted py-10">No data yet — complete this habit to see stats!</div>
            )}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-7">
        <h1 className="text-[28px] font-bold text-text tracking-tight mb-1.5">My Habits</h1>
        <div className="text-[14px] text-textMuted mb-2.5">
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
          <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
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
          <div className="flex flex-col items-center p-[48px_24px] gap-3 text-textMuted text-[14px]">
            <div className="w-14 h-14 bg-surfaceLight/30 border border-border rounded-2xl flex items-center justify-center"><Zap size={24} className="text-textMuted/40" /></div>
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
  const c   = CAT_COLORS[cat] || CAT_COLORS.General;
  return (
    <div className={`habit-card ${habit.completed ? "done" : ""}`}>
      <button className={`check-btn ${habit.completed ? "done" : ""}`} onClick={() => onToggle(habit._id)}>
        <Check size={16} color={habit.completed ? "#fff" : "var(--primary)"} />
      </button>

      <div className="flex-1 min-w-0">
        <div className={`text-[15px] font-semibold mb-1.5 truncate ${habit.completed ? "text-textMuted line-through" : "text-text"}`}>
          {habit.title}
        </div>
        <div className="flex gap-1.5 items-center flex-wrap">
          <div className="streak-badge inline-flex">
            <Flame size={11} /> {habit.streak || 0} day streak
          </div>
          <span style={{ fontSize:11, fontWeight:600, background:c.bg, border:`1px solid ${c.border}`, color:c.text, padding:"3px 9px", borderRadius:99 }}>
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
