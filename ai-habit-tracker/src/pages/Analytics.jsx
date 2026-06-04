import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, CheckCircle, Target, Zap } from "lucide-react";
import StreakCalendar from "../components/ui/StreakCalendar";
import { getAnalytics } from "../services/api";

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAnalytics().then(d => { if (d) setData(d); });
  }, []);

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", minHeight: "100vh", background: "var(--background)", color: "var(--text)", padding: "32px", transition: "background-color 0.2s, color 0.2s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .an-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 24px; transition: border-color 0.2s, background-color 0.2s; }
        .an-card:hover { border-color: var(--primary); }
        .stat-pill { border-radius: 16px; padding: 22px; display: flex; flex-direction: column; gap: 10px; }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", margin: "0 0 6px" }}>Analytics</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>Your habit performance at a glance</p>
      </div>

      {!data ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 100, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }} />)}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { icon: <Target size={20} color="var(--primary)" />, bg: "var(--surface-light)", val: data.totalHabits, label: "Total Habits", border: "var(--border)" },
              { icon: <CheckCircle size={20} color="var(--success)" />, bg: "var(--surface-light)", val: data.completedHabits, label: "Completed", border: "var(--border)" },
              { icon: <TrendingUp size={20} color="var(--primary)" />, bg: "var(--surface-light)", val: `${data.completionRate.toFixed(1)}%`, label: "Completion Rate", border: "var(--border)" },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--surface)", border: `1px solid ${s.border}`, borderRadius: 18, padding: 22, transition: "background-color 0.2s, border-color 0.2s" }}>
                <div style={{ width: 42, height: 42, background: s.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>{s.icon}</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>{s.val}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="an-card" style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text)", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <Zap size={18} color="var(--primary)" /> Weekly Progress
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.weeklyData}>
                <defs>
                  <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 12, fontFamily: "Outfit" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 12, fontFamily: "Outfit" }} axisLine={false} tickLine={false} />
                <Tooltip content={({ active, payload, label }) => {
                  if (active && payload?.length) return (
                    <div style={{ background: "var(--surface)", border: "1px solid var(--primary)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--text)" }}>
                      <div style={{ fontWeight: 600 }}>{label}</div>
                      <div style={{ color: "var(--primary)", marginTop: 4 }}>{payload[0].value} completed</div>
                    </div>
                  );
                  return null;
                }} />
                <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorHabits)" dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: "#818cf8" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ✅ Streak Calendar */}
          <div style={{ marginBottom: 24 }}>
            <StreakCalendar />
          </div>

          {/* Insight + Alert */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="an-card" style={{ borderColor: "var(--primary)", background: "var(--surface-light)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--primary)", marginBottom: 10 }}>💡 Insight</div>
              <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>{data.insight}</p>
            </div>
            <div className="an-card" style={{ borderColor: "var(--primary)", background: "var(--surface-light)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--primary)", marginBottom: 10 }}>🚨 Alert</div>
              <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>{data.alert}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;