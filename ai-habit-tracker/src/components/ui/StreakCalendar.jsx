import React, { useEffect, useState } from "react";
import { getCalendar } from "../../services/api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const getColor = (count) => {
    if (count === 0) return { bg: "var(--surface-light)", border: "var(--border)" };
    if (count === 1) return { bg: "rgba(var(--primary-rgb), 0.2)",  border: "rgba(var(--primary-rgb), 0.3)" };
    if (count === 2) return { bg: "rgba(var(--primary-rgb), 0.4)",  border: "rgba(var(--primary-rgb), 0.5)" };
    if (count === 3) return { bg: "rgba(var(--primary-rgb), 0.7)",  border: "rgba(var(--primary-rgb), 0.8)" };
    return              { bg: "var(--primary)",   border: "var(--primary)"    };
};

const StreakCalendar = () => {
    const [calData, setCalData]   = useState(null);
    const [tooltip, setTooltip]   = useState(null); // { x, y, date, count }
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        getCalendar()
            .then(d => setCalData(d))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="card !p-12 flex flex-col items-center justify-center animate-pulse">
            <div className="w-12 h-12 bg-surfaceLight rounded-full mb-4" />
            <div className="text-textMuted text-sm font-medium">Loading activity data...</div>
        </div>
    );

    if (!calData) return null;

    const { calendar } = calData;

    // Pad start so grid aligns to correct weekday
    const firstDay = new Date(calendar[0].date).getDay();
    const padded   = [...Array(firstDay).fill(null), ...calendar];

    // Total weeks
    const weeks = Math.ceil(padded.length / 7);

    // Build grid: weeks × 7
    const grid = [];
    for (let w = 0; w < weeks; w++) {
        grid.push(padded.slice(w * 7, w * 7 + 7));
    }

    // Month labels — find first cell of each month
    const monthLabels = [];
    let lastMonth = -1;
    grid.forEach((week, wi) => {
        week.forEach((cell) => {
            if (!cell) return;
            const m = new Date(cell.date).getMonth();
            if (m !== lastMonth) {
                monthLabels.push({ wi, label: MONTHS[m] });
                lastMonth = m;
            }
        });
    });

    // Stats
    const totalDays    = calendar.filter(d => d.count > 0).length;
    const currentStreak = (() => {
        let s = 0;
        for (let i = calendar.length - 1; i >= 0; i--) {
            if (calendar[i].count > 0) s++;
            else break;
        }
        return s;
    })();
    const longestStreak = (() => {
        let best = 0, cur = 0;
        for (const d of calendar) {
            if (d.count > 0) { cur++; best = Math.max(best, cur); }
            else cur = 0;
        }
        return best;
    })();

    const CELL = 14;

    return (
        <div className="card !p-8 relative">
            <style>{`
                .cal-cell {
                    width: ${CELL}px; height: ${CELL}px;
                    border-radius: 3px;
                    cursor: pointer;
                    transition: all 0.1s;
                    border: 1px solid transparent;
                    flex-shrink: 0;
                }
                .cal-cell:hover { transform: scale(1.4); z-index: 2; border-color: var(--primary); box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3); }
                .cal-tooltip {
                    position: fixed;
                    @apply bg-surface/98 border border-primary/20 rounded-xl px-4 py-2.5 text-[11px] text-text shadow-2xl backdrop-blur-md;
                    pointer-events: none;
                    z-index: 100;
                    white-space: nowrap;
                    animation: popIn 0.15s ease-out;
                }
            `}</style>

            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h3 className="font-bold text-lg mb-1">Consistency Heatmap</h3>
                    <p className="text-xs text-textMuted font-medium uppercase tracking-widest">365-day tracking history</p>
                </div>

                <div className="flex gap-4">
                    {[
                        { label: "Active Days", val: totalDays },
                        { label: "Longest", val: `${longestStreak}d` },
                        { label: "Current", val: `${currentStreak}d` }
                    ].map((s, i) => (
                        <div key={i} className="bg-surfaceLight/30 border border-border rounded-xl px-4 py-2 flex flex-col items-center min-w-[80px]">
                            <span className="text-lg font-bold text-text leading-tight">{s.val}</span>
                            <span className="text-[9px] font-bold text-textMuted uppercase tracking-widest">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid Container */}
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <div className="inline-flex gap-0 min-w-max">
                    {/* Weekdays Labels */}
                    <div className="flex flex-col gap-[4px] mr-3 pt-6">
                        {DAYS.map((d, i) => (
                            <div key={d} className={`h-[14px] text-[10px] flex items-center font-bold w-6 ${i % 2 === 0 ? "text-textMuted/60" : "text-transparent"}`}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* The Grid */}
                    <div>
                        {/* Month labels header */}
                        <div className="flex mb-2 h-4">
                            {grid.map((_, wi) => {
                                const ml = monthLabels.find(m => m.wi === wi);
                                return (
                                    <div key={wi} className="w-[18px] text-[9px] text-textMuted font-bold uppercase tracking-tighter overflow-visible whitespace-nowrap">
                                        {ml ? ml.label : ""}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Cells */}
                        <div className="flex gap-[4px]">
                            {grid.map((week, wi) => (
                                <div key={wi} className="flex flex-col gap-[4px]">
                                    {week.map((cell, di) => {
                                        if (!cell) return (
                                            <div key={di} className="w-[14px] h-[14px] shrink-0 opacity-20" />
                                        );
                                        const { bg, border } = getColor(cell.count);
                                        return (
                                            <div
                                                key={di}
                                                className="cal-cell"
                                                style={{ background: bg, borderColor: border }}
                                                onMouseEnter={e => setTooltip({
                                                    x: e.clientX + 15,
                                                    y: e.clientY - 45,
                                                    date: new Date(cell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                                    count: cell.count
                                                })}
                                                onMouseLeave={() => setTooltip(null)}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-8 justify-end">
                <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Less</span>
                <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(n => {
                        const { bg, border } = getColor(n);
                        return <div key={n} className="w-[11px] h-[11px] rounded-[2px]" style={{ background: bg, border: `1px solid ${border}` }} />;
                    })}
                </div>
                <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">More</span>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div className="cal-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                    <div className="font-bold mb-0.5">{tooltip.date}</div>
                    <div className="text-textMuted font-medium">
                        {tooltip.count === 0 ? "No activity logged" : `${tooltip.count} habit${tooltip.count > 1 ? "s" : ""} completed`}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StreakCalendar;