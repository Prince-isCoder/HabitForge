import React, { useEffect, useState } from "react";
import { Plus, Flame, Trash2, Check, Zap, Search, X, BarChart2 } from "lucide-react";

const CATEGORIES = ["All", "Health", "Work", "Learning", "Fitness", "Mindfulness", "General"];
const CAT_COLORS = {
  Health: { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  text: "#34d399" },
  Work:   { bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)",  text: "#818cf8" },
  Learning:{ bg:"rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.25)",   text: "#22d3ee" },
  Fitness:{ bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.25)",  text: "#fb923c" },
  Mindfulness:{ bg:"rgba(139,92,246,0.1)",border:"rgba(139,92,246,0.25)", text: "#a78bfa" },
  General:{ bg: "rgba(128,128,128,0.1)", border:"rgba(128,128,128,0.2)",  text: "var(--text-muted)" },
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
    <div style={{ fontFamily: "'Outfit',sans-serif", minHeight: "100vh", background: "var(--background)", color: "var(--text)", padding: "32px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .habit-card { background: var(--card-bg); border:1px solid var(--card-border); border-radius:16px; padding:20px; display:flex; align-items:center; gap:16px; transition:border-color 0.2s,transform 0.15s,box-shadow 0.2s; animation:cardIn 0.25s ease both; }
        .habit-card:hover { border-color:rgba(99,102,241,0.25); transform:translateY(-1px); box-shadow:0 8px 32px rgba(0,0,0,0.15); }
        .habit-card.done { opacity:0.65; border-color:rgba(16,185,129,0.15); background:rgba(16,185,129,0.03); }
        @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .check-btn { width:38px; height:38px; border-radius:50%; border:2px solid rgba(99,102,241,0.35); background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0; }
        .check-btn:hover { border-color:#6366f1; background:rgba(99,102,241,0.1); }
        .check-btn.done { background:linear-gradient(135deg,#10b981,#059669); border-color:transparent; box-shadow:0 0 12px rgba(16,185,129,0.3); }
        .delete-btn { width:32px; height:32px; border-radius:9px; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.12); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0; opacity:0; }
        .habit-card:hover .delete-btn { opacity:1; }
        .delete-btn:hover { background:rgba(239,68,68,0.15); border-color:rgba(239,68,68,0.3); }
        .stats-btn { width:30px; height:30px; border-radius:8px; background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.15); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0; opacity:0; }
        .habit-card:hover .stats-btn { opacity:1; }
        .stats-btn:hover { background:rgba(99,102,241,0.18); }
        .streak-badge { display:flex; align-items:center; gap:5px; background:rgba(251,146,60,0.08); border:1px solid rgba(251,146,60,0.15); border-radius:99px; padding:4px 10px; font-size:12px; font-weight:600; color:#fb923c; white-space:nowrap; }
        .add-input { flex:1; background: var(--card-bg); border: 1px solid var(--card-border); border-radius:12px; padding:11px 16px; font-size:14px; color: var(--text); font-family:'Outfit',sans-serif; outline:none; transition:border-color 0.2s,box-shadow 0.2s; min-width:0; }
        .add-input:focus { border-color:rgba(79,70,229,0.45); box-shadow:0 0 0 3px rgba(79,70,229,0.1); }
        .add-input::placeholder { color: var(--text-muted); }
        .cat-select { background: var(--card-bg); border: 1px solid var(--card-border); border-radius:12px; padding:11px 14px; font-size:13px; color: var(--text-muted); font-family:'Outfit',sans-serif; outline:none; cursor:pointer; }
        .add-btn { background:linear-gradient(135deg,#4f46e5,#4338ca); border:none; border-radius:12px; color:#fff; padding:11px 20px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; display:flex; align-items:center; gap:7px; transition:transform 0.15s,box-shadow 0.15s; box-shadow:0 4px 16px rgba(79,70,229,0.3); white-space:nowrap; }
        .add-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(79,70,229,0.4); }
        .ai-btn { background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.25); border-radius:12px; color:#a78bfa; padding:11px 18px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; display:flex; align-items:center; gap:7px; transition:all 0.2s; white-space:nowrap; }
        .ai-btn:hover { background:rgba(139,92,246,0.18); border-color:rgba(139,92,246,0.4); }
        .ai-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .section-label { font-size:11px; font-weight:600; letter-spacing:0.09em; text-transform:uppercase; color: var(--text-muted); margin-bottom:14px; display:flex; align-items:center; gap:8px; }
        .section-label::after { content:''; flex:1; height:1px; background: var(--border); }
        .ai-modal { position:fixed; top:24px; left:50%; transform:translateX(-50%); background: var(--background); border: 1px solid rgba(139,92,246,0.3); border-radius:18px; padding:24px; z-index:100; width:90%; max-width:400px; box-shadow:0 24px 60px rgba(0,0,0,0.5); backdrop-filter:blur(24px); animation:popIn 0.2s ease; }
        @keyframes popIn { from{opacity:0;transform:translateX(-50%) scale(0.95)} to{opacity:1;transform:translateX(-50%) scale(1)} }
        .progress-bar-bg { height:5px; background: var(--border); border-radius:99px; overflow:hidden; margin-top:8px; }
        .progress-bar-fill { height:100%; background:linear-gradient(90deg,#4f46e5,#06b6d4); border-radius:99px; transition:width 0.6s ease; }
        .search-input { background: var(--card-bg); border: 1px solid var(--card-border); border-radius:12px; padding:10px 14px 10px 36px; font-size:13px; color: var(--text-muted); font-family:'Outfit',sans-serif; outline:none; transition:border-color 0.2s; width:180px; }
        .search-input:focus { border-color:rgba(79,70,229,0.4); }
        .search-input::placeholder { color: var(--text-muted); }
        .cat-filter-btn { background: var(--card-bg); border: 1px solid var(--card-border); border-radius:99px; padding:6px 14px; font-size:12px; font-weight:600; color: var(--text-muted); cursor:pointer; font-family:'Outfit',sans-serif; transition:all 0.2s; white-space:nowrap; }
        .cat-filter-btn.active { background:rgba(99,102,241,0.12); border-color:rgba(99,102,241,0.3); color:#818cf8; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:200; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); animation:fadeIn 0.2s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .stats-modal { background: var(--background); border: 1px solid var(--border); border-radius:20px; padding:28px; width:90%; max-width:520px; max-height:80vh; overflow-y:auto; animation:popInCenter 0.2s ease; }
        @keyframes popInCenter { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .mini-cal-cell { width:20px; height:20px; border-radius:4px; flex-shrink:0; }
        .badge-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background: var(--background); border: 1px solid rgba(99,102,241,0.35); border-radius:16px; padding:14px 22px; display:flex; align-items:center; gap:12px; z-index:300; box-shadow:0 16px 48px rgba(0,0,0,0.4); animation:slideUp 0.3s ease; }
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>

      {/* Badge Toast */}
      {badgeToast && (
        <div className="badge-toast">
          <span style={{ fontSize: 28 }}>{badgeToast.emoji}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Badge Unlocked!</div>
            <div style={{ fontSize: 12, color: "#818cf8", fontWeight: 600 }}>{badgeToast.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{badgeToast.desc}</div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {aiHabit && (
        <div className="ai-modal">
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ width:36, height:36, background:"linear-gradient(135deg,#8b5cf6,#6366f1)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
            <div>
              <div style={{ fontWeight:600, fontSize:15, color:"var(--text)" }}>AI Suggestion</div>
              <div style={{ fontSize:12, color:"var(--text-muted)" }}>Personalized for you</div>
            </div>
          </div>
          <div style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:12, padding:"14px 16px", fontSize:16, fontWeight:600, color:"var(--primary)", marginBottom:18 }}>
            ✨ {aiHabit}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={addAiHabit} style={{ background:"linear-gradient(135deg,#10b981,#059669)", border:"none", borderRadius:10, color:"#fff", padding:"9px 18px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>Add Habit</button>
            <button onClick={() => setAiHabit("")} style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, color:"#fca5a5", padding:"9px 18px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>Skip</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {suggestion && (
        <div style={{ position:"fixed", top:24, left:"50%", transform:"translateX(-50%)", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:12, padding:"12px 20px", color:"#6ee7b7", fontSize:14, fontWeight:500, zIndex:99, display:"flex", gap:12, alignItems:"center" }}>
          {suggestion}
          <button onClick={() => setSuggestion("")} style={{ background:"none", border:"none", color:"#6ee7b7", cursor:"pointer", fontSize:18 }}>×</button>
        </div>
      )}

      {/* Per-Habit Analytics Modal */}
      {selectedHabit && (
        <div className="modal-overlay" onClick={() => setSelectedHabit(null)}>
          <div className="stats-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <div style={{ fontSize:18, fontWeight:700, color:"var(--text)", marginBottom:4 }}>{selectedHabit.title}</div>
                {selectedHabit.category && (
                  <span style={{ fontSize:11, fontWeight:600, background: CAT_COLORS[selectedHabit.category]?.bg, border:`1px solid ${CAT_COLORS[selectedHabit.category]?.border}`, color: CAT_COLORS[selectedHabit.category]?.text, padding:"3px 10px", borderRadius:99 }}>
                    {selectedHabit.category}
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedHabit(null)} style={{ background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:10, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <X size={16} color="var(--text-muted)" />
              </button>
            </div>

            {statsLoading ? (
              <div style={{ textAlign:"center", color:"var(--text-muted)", padding:"40px 0" }}>Loading analytics...</div>
            ) : habitStats ? (
              <>
                {/* Stat chips */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
                  {[
                    { label:"Total Done",      val: habitStats.totalCompletions, emoji:"✅" },
                    { label:"Current Streak",  val: habitStats.currentStreak,    emoji:"🔥" },
                    { label:"Best Streak",     val: habitStats.bestStreak,       emoji:"🏆" },
                  ].map((s,i) => (
                    <div key={i} style={{ background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:12, padding:"14px 12px", textAlign:"center" }}>
                      <div style={{ fontSize:20, marginBottom:6 }}>{s.emoji}</div>
                      <div style={{ fontSize:22, fontWeight:700, color:"var(--text)" }}>{s.val}</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Last 30 days mini calendar */}
                <div style={{ marginBottom:8 }}>
                  <div style={{ fontSize:12, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:12 }}>Last 30 Days</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {habitStats.last30.map((day, i) => (
                      <div key={i} title={`${day.date}: ${day.completed ? "✅ Done" : "❌ Missed"}`}
                        className="mini-cal-cell"
                        style={{ background: day.completed ? "rgba(99,102,241,0.7)" : "var(--card-bg)", border:`1px solid ${day.completed ? "rgba(99,102,241,0.8)" : "var(--card-border)"}` }}
                      />
                    ))}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
                    <div style={{ width:11, height:11, borderRadius:2, background:"var(--card-bg)", border:"1px solid var(--card-border)" }} />
                    <span style={{ fontSize:11, color:"var(--text-muted)" }}>Missed</span>
                    <div style={{ width:11, height:11, borderRadius:2, background:"rgba(99,102,241,0.7)", border:"1px solid rgba(99,102,241,0.8)", marginLeft:8 }} />
                    <span style={{ fontSize:11, color:"var(--text-muted)" }}>Completed</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign:"center", color:"var(--text-muted)", padding:"40px 0" }}>No data yet — complete this habit to see stats!</div>
            )}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, fontWeight:700, color:"var(--text)", letterSpacing:"-0.02em", margin:"0 0 6px" }}>My Habits</h1>
        <div style={{ fontSize:14, color:"var(--text-muted)", marginBottom:10 }}>
          {habits.filter(h=>h.completed).length} of {habits.length} completed today
        </div>
        <div className="progress-bar-bg" style={{ maxWidth:320 }}>
          <div className="progress-bar-fill" style={{ width:`${completionPct}%` }} />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} className={`cat-filter-btn ${filterCat === cat ? "active" : ""}`} onClick={() => setFilterCat(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:10, marginBottom:32 }}>
        <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
          <Search size={14} style={{ position:"absolute", left:12, color:"var(--text-muted)", pointerEvents:"none" }} />
          <input className="search-input" placeholder="Search habits..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <button className="ai-btn" onClick={generateHabit} disabled={loading}>
          {loading ? "🤖 Thinking..." : <><Zap size={14} /> Suggest Habit</>}
        </button>

        <div style={{ display:"flex", gap:8, marginLeft:"auto", flexWrap:"wrap" }}>
          <select className="cat-select" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="add-input" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && addHabit()} placeholder="New habit name..." />
          <button className="add-btn" onClick={addHabit}><Plus size={15} /> Add</button>
        </div>
      </div>

      {/* TO DO */}
      <div style={{ marginBottom:36 }}>
        <div className="section-label">To Do ({activeHabits.length})</div>
        {activeHabits.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"48px 24px", gap:12, color:"var(--text-muted)", fontSize:14 }}>
            <div style={{ width:56, height:56, background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center" }}><Zap size={24} color="var(--text-muted)" /></div>
            No pending habits — add one or use AI suggest!
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
            {activeHabits.map(habit => (
              <HabitRow key={habit._id} habit={habit} onToggle={toggleHabit} onDelete={deleteHabit} onStats={openHabitStats} />
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED */}
      {completedHabits.length > 0 && (
        <div>
          <div className="section-label" style={{ color:"#10b981" }}>Completed ({completedHabits.length})</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12, opacity:0.7 }}>
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
        <Check size={16} color={habit.completed ? "#fff" : "rgba(99,102,241,0.4)"} />
      </button>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:15, fontWeight:600, color:habit.completed ? "var(--text-muted)" : "var(--text)", textDecoration:habit.completed ? "line-through" : "none", marginBottom:6, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {habit.title}
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          <div className="streak-badge" style={{ display:"inline-flex" }}>
            <Flame size={11} /> {habit.streak || 0} day streak
          </div>
          <span style={{ fontSize:11, fontWeight:600, background:c.bg, border:`1px solid ${c.border}`, color:c.text, padding:"3px 9px", borderRadius:99 }}>
            {cat}
          </span>
        </div>
      </div>

      <button className="stats-btn" onClick={() => onStats(habit)} title="View analytics">
        <BarChart2 size={13} color="#818cf8" />
      </button>

      <button className="delete-btn" onClick={() => onDelete(habit._id)}>
        <Trash2 size={13} color="#f87171" />
      </button>
    </div>
  );
};

export default HabitsList;
