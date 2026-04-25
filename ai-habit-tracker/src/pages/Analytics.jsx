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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div style={{ background: "rgba(15,18,28,0.95)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#c7d2fe" }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ color: "#818cf8", marginTop: 4 }}>{payload[0].value} completed</div>
      </div>
    );
    return null;
  };

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", minHeight: "100vh", background: "#0a0c12", color: "#e2e8f0", padding: "32px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .an-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 24px; transition: border-color 0.2s; }
        .an-card:hover { border-color: rgba(99,102,241,0.2); }
        .stat-pill { border-radius: 16px; padding: 22px; display: flex; flex-direction: column; gap: 10px; }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em", margin: "0 0 6px" }}>Analytics</h1>
        <p style={{ fontSize: 14, color: "#475569", margin: 0 }}>Your habit performance at a glance</p>
      </div>

      {!data ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 100, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)" }} />)}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { icon: <Target size={20} color="#818cf8" />, bg: "rgba(99,102,241,0.1)", val: data.totalHabits, label: "Total Habits", border: "rgba(99,102,241,0.2)" },
              { icon: <CheckCircle size={20} color="#34d399" />, bg: "rgba(16,185,129,0.1)", val: data.completedHabits, label: "Completed", border: "rgba(16,185,129,0.2)" },
              { icon: <TrendingUp size={20} color="#22d3ee" />, bg: "rgba(6,182,212,0.1)", val: `${data.completionRate.toFixed(1)}%`, label: "Completion Rate", border: "rgba(6,182,212,0.2)" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.border}`, borderRadius: 18, padding: 22 }}>
                <div style={{ width: 42, height: 42, background: s.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>{s.icon}</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>{s.val}</div>
                <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="an-card" style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 16, color: "#f1f5f9", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <Zap size={18} color="#818cf8" /> Weekly Progress
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
                <Tooltip content={<CustomTooltip />} />
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
            <div className="an-card" style={{ borderColor: "rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.04)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4f46e5", marginBottom: 10 }}>💡 Insight</div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.65, margin: 0 }}>{data.insight}</p>
            </div>
            <div className="an-card" style={{ borderColor: "rgba(6,182,212,0.2)", background: "rgba(6,182,212,0.04)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#06b6d4", marginBottom: 10 }}>🚨 Alert</div>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.65, margin: 0 }}>{data.alert}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;