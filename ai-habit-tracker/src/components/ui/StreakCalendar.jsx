import React, { useEffect, useState } from "react";
import { getCalendar } from "../../services/api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const getColor = (count) => {
    if (count === 0) return { bg: "var(--surface-light)", border: "var(--border)" };
    if (count === 1) return { bg: "rgba(99,102,241,0.25)",  border: "rgba(99,102,241,0.35)" };
    if (count === 2) return { bg: "rgba(99,102,241,0.45)",  border: "rgba(99,102,241,0.55)" };
    if (count === 3) return { bg: "rgba(99,102,241,0.65)",  border: "rgba(99,102,241,0.75)" };
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
        <div className="bg-surface border border-border rounded-[18px] p-6">
            <div className="h-[120px] flex items-center justify-center text-textMuted text-sm">
                Loading calendar...
            </div>
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
        week.forEach((cell, di) => {
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

    const CELL = 13;
    const GAP  = 3;
    const STEP = CELL + GAP;

    return (
        <div className="bg-surface border border-border rounded-[18px] p-[24px_28px] font-['Outfit'] relative">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');
                .cal-cell {
                    width: ${CELL}px; height: ${CELL}px;
                    border-radius: 3px;
                    cursor: pointer;
                    transition: transform 0.1s;
                    border: 1px solid transparent;
                    flex-shrink: 0;
                }
                .cal-cell:hover { transform: scale(1.3); z-index: 2; }
                .cal-tooltip {
                    position: fixed;
                    @apply bg-surface/95 border border-primary/30 rounded-xl px-3 py-2 text-[12px] text-text shadow-2xl;
                    pointer-events: none;
                    z-index: 100;
                    white-space: nowrap;
                }
                .stat-chip {
                    @apply bg-surfaceLight/40 border border-border rounded-xl px-4 py-2.5 flex flex-col gap-0.5;
                }
            `}</style>

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div>
                    <div className="text-base font-semibold text-text mb-1">
                        🗓 Activity Calendar
                    </div>
                    <div className="text-[13px] text-textMuted">
                        Your habit completions over the last 365 days
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex gap-2.5">
                    <div className="stat-chip">
                        <span className="text-lg font-bold text-text">{currentStreak}</span>
                        <span className="text-[11px] text-textMuted">Current Streak</span>
                    </div>
                    <div className="stat-chip">
                        <span className="text-lg font-bold text-text">{longestStreak}</span>
                        <span className="text-[11px] text-textMuted">Longest Streak</span>
                    </div>
                    <div className="stat-chip">
                        <span className="text-lg font-bold text-text">{totalDays}</span>
                        <span className="text-[11px] text-textMuted">Active Days</span>
                    </div>
                </div>
            </div>

            {/* Calendar grid */}
            <div className="overflow-x-auto pb-2">
                <div className="inline-flex gap-0 min-w-max">

                    {/* Day labels column */}
                    <div className="flex flex-col gap-[3px] mr-1.5 pt-5">
                        {DAYS.map((d, i) => (
                            <div key={d} className={`h-[13px] text-[9px] flex items-center font-medium w-6 ${i % 2 === 0 ? "text-textMuted/70" : "text-transparent"}`}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Weeks */}
                    <div>
                        {/* Month labels */}
                        <div className="flex mb-1 height-4">
                            {grid.map((_, wi) => {
                                const ml = monthLabels.find(m => m.wi === wi);
                                return (
                                    <div key={wi} className="w-[16px] text-[9px] text-textMuted font-medium overflow-visible whitespace-nowrap">
                                        {ml ? ml.label : ""}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grid cells */}
                        <div className="flex gap-[3px]">
                            {grid.map((week, wi) => (
                                <div key={wi} className="flex flex-col gap-[3px]">
                                    {week.map((cell, di) => {
                                        if (!cell) return (
                                            <div key={di} className="w-[13px] h-[13px] shrink-0" />
                                        );
                                        const { bg, border } = getColor(cell.count);
                                        return (
                                            <div
                                                key={di}
                                                className="cal-cell"
                                                style={{ background: bg, borderColor: border }}
                                                onMouseEnter={e => setTooltip({
                                                    x: e.clientX + 12,
                                                    y: e.clientY - 36,
                                                    date: cell.date,
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
            <div className="flex items-center gap-2 mt-4 justify-end">
                <span className="text-[11px] text-textMuted">Less</span>
                {[0, 1, 2, 3, 4].map(n => {
                    const { bg, border } = getColor(n);
                    return <div key={n} className="w-[11px] h-[11px] rounded-[2px]" style={{ background: bg, border: `1px solid ${border}` }} />;
                })}
                <span className="text-[11px] text-textMuted">More</span>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div className="cal-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                    <span className="text-primary font-semibold">{tooltip.date}</span>
                    {" — "}
                    {tooltip.count === 0
                        ? "No habits completed"
                        : `${tooltip.count} habit${tooltip.count > 1 ? "s" : ""} completed`
                    }
                </div>
            )}
        </div>
    );
};

export default StreakCalendar;