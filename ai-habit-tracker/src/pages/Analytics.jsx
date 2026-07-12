import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from "recharts";
import { TrendingUp, CheckCircle, Target, Zap, BarChart3, PieChart } from "lucide-react";
import StreakCalendar from "../components/ui/StreakCalendar";
import { getAnalytics } from "../services/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-surface/95 border border-primary/20 rounded-2xl p-4 text-[13px] shadow-2xl backdrop-blur-md">
      <div className="font-bold text-textMuted uppercase tracking-widest text-[10px] mb-2">{label}</div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <div className="text-base font-bold text-text">{payload[0].value} <span className="text-xs font-medium text-textMuted ml-1">completions</span></div>
      </div>
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
    <div className="min-h-screen bg-background text-text p-8 animate-fade-in transition-colors duration-200">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Analytics</h1>
        <p className="text-lg text-textMuted m-0">In-depth performance insights & habit trends</p>
      </div>

      {!data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface/50 border border-border rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Top Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: <Target size={24} />, val: data.totalHabits, label: "Total Habits", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
              { icon: <CheckCircle size={24} />, val: data.completedHabits, label: "All-time Done", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
              { icon: <TrendingUp size={24} />, val: `${data.completionRate.toFixed(1)}%`, label: "Avg. Success", color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
            ].map((s, i) => (
              <div key={i} className={`card flex items-center gap-6 !p-8 group hover:-translate-y-1 transition-all border ${s.border}`}>
                <div className={`w-16 h-16 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                   {s.icon}
                </div>
                <div>
                  <div className="text-3xl font-bold tracking-tight mb-1">{s.val}</div>
                  <div className="text-xs font-bold text-textMuted uppercase tracking-widest">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Chart Card */}
            <div className="lg:col-span-2 card !p-8">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BarChart3 size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Activity Progress</h2>
                    <p className="text-xs text-textMuted font-medium">Daily completions over the last 7 days</p>
                  </div>
                </div>
                <select className="bg-surfaceLight/50 border border-border rounded-xl px-3 py-1.5 text-xs font-bold outline-none">
                   <option>Last 7 Days</option>
                   <option>Last 30 Days</option>
                </select>
              </div>

              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="var(--primary)"
                      strokeWidth={4}
                      fill="url(#colorHabits)"
                      dot={{ fill: "var(--surface)", stroke: "var(--primary)", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 7, fill: "var(--primary)", stroke: "var(--surface)", strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insight Column */}
            <div className="space-y-6">
               <div className="card !p-8 bg-primary/5 border-primary/20">
                 <div className="flex items-center gap-3 mb-6">
                    <Zap size={20} className="text-primary" />
                    <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-primary">Smart Insight</h3>
                 </div>
                 <p className="text-base text-textMuted leading-relaxed font-medium italic">
                    "{data.insight}"
                 </p>
               </div>

               <div className="card !p-8 bg-danger/[0.03] border-danger/10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                    <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-danger">Priority Alert</h3>
                 </div>
                 <p className="text-sm text-textMuted leading-relaxed">
                    {data.alert}
                 </p>
               </div>
            </div>
          </div>

          {/* Activity Heatmap Section */}
          <div className="space-y-6 mb-12">
             <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">Consistency Map</h2>
                <div className="h-px flex-1 bg-border/50" />
             </div>
             <StreakCalendar />
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;