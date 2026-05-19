import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, CheckCircle, Target, Zap } from "lucide-react";
import StreakCalendar from "../components/ui/StreakCalendar";
import { getAnalytics } from "../services/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-surface/95 border border-primary/25 rounded-xl p-[10px_14px] text-[13px] text-text shadow-xl">
      <div className="font-bold">{label}</div>
      <div className="text-primary mt-1">{payload[0].value} completed</div>
    </div>
  );
  return null;
};

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAnalytics().then(d => { if (d) setData(d); });
  }, []);

  return (
    <div className="font-['Outfit'] min-h-screen bg-background text-text p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .an-card { @apply bg-surface border border-border rounded-[18px] p-6 transition-colors; }
        .an-card:hover { @apply border-primary/20; }
        .stat-pill { border-radius: 16px; padding: 22px; display: flex; flex-direction: column; gap: 10px; }
      `}</style>

      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-text tracking-tight m-[0_0_6px]">Analytics</h1>
        <p className="text-sm text-textMuted m-0">Your habit performance at a glance</p>
      </div>

      {!data ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => <div key={i} className="h-[100px] bg-surface border border-border rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">
            {[
              { icon: <Target size={20} className="text-primary" />, bg: "bg-primary/10", val: data.totalHabits, label: "Total Habits", border: "border-primary/20" },
              { icon: <CheckCircle size={20} className="text-success" />, bg: "bg-success/10", val: data.completedHabits, label: "Completed", border: "border-success/20" },
              { icon: <TrendingUp size={20} className="text-cyan-500" />, bg: "bg-cyan-500/10", val: `${data.completionRate.toFixed(1)}%`, label: "Completion Rate", border: "border-cyan-500/20" },
            ].map((s, i) => (
              <div key={i} className={`bg-surface border ${s.border} rounded-[18px] p-[22px]`}>
                <div className={`w-[42px] h-[42px] ${s.bg} rounded-xl flex items-center justify-center mb-3.5`}>{s.icon}</div>
                <div className="text-3xl font-bold text-text tracking-tight">{s.val}</div>
                <div className="text-[13px] text-textMuted mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="an-card mb-6">
            <div className="font-semibold text-base text-text mb-6 flex items-center gap-2.5">
              <Zap size={18} className="text-primary" /> Weekly Progress
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.weeklyData}>
                <defs>
                  <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 12, fontFamily: "Outfit" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12, fontFamily: "Outfit" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="completed" stroke="var(--primary)" strokeWidth={2.5} fill="url(#colorHabits)" dot={{ fill: "var(--primary)", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: "var(--primary)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ✅ Streak Calendar */}
          <div className="mb-6">
            <StreakCalendar />
          </div>

          {/* Insight + Alert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="an-card !border-primary/20 !bg-primary/5">
              <div className="text-xs font-bold tracking-widest uppercase text-primary mb-2.5">💡 Insight</div>
              <p className="text-[15px] text-textMuted leading-[1.65] m-0">{data.insight}</p>
            </div>
            <div className="an-card !border-cyan-500/20 !bg-cyan-500/5">
              <div className="text-xs font-bold tracking-widest uppercase text-cyan-500 mb-2.5">🚨 Alert</div>
              <p className="text-[15px] text-textMuted leading-[1.65] m-0">{data.alert}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;