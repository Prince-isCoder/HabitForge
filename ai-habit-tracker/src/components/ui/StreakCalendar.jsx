import React, { useEffect, useState } from "react";
import { getCalendar } from "../../services/api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const getColor = (count) => {
    if (count === 0) return { bg: "var(--card-bg)", border: "var(--card-border)" };
    if (count === 1) return { bg: "rgba(99,102,241,0.25)",  border: "rgba(99,102,241,0.35)" };
    if (count === 2) return { bg: "rgba(99,102,241,0.45)",  border: "rgba(99,102,241,0.55)" };
    if (count === 3) return { bg: "rgba(99,102,241,0.65)",  border: "rgba(99,102,241,0.75)" };
    return              { bg: "rgba(99,102,241,0.9)",   border: "rgba(139,92,246,1)"    };
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
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 18, padding: 24 }}>
            <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
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

    const CELL = 13;
    const GAP  = 3;
    const STEP = CELL + GAP;

    return (
        <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: 18,
            padding: "24px 28px",
            fontFamily: "'Outfit',sans-serif",
            position: "relative",
        }}>
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
                    background: var(--background);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 8px 12px;
                    font-size: 12px;
                    color: var(--text);
                    pointer-events: none;
                    z-index: 100;
                    white-space: nowrap;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                }
                .stat-chip {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 10px;
                    padding: 10px 16px;
                    display: flex; flex-direction: column; gap: 3px;
                }
            `}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                        🗓 Activity Calendar
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        Your habit completions over the last 365 days
                    </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: 10 }}>
                    <div className="stat-chip">
                        <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{currentStreak}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Current Streak</span>
                    </div>
                    <div className="stat-chip">
                        <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{longestStreak}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Longest Streak</span>
                    </div>
                    <div className="stat-chip">
                        <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{totalDays}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Active Days</span>
                    </div>
                </div>
            </div>

            {/* Calendar grid */}
            <div style={{ overflowX: "auto", paddingBottom: 8 }}>
                <div style={{ display: "inline-flex", gap: 0, minWidth: "max-content" }}>

                    {/* Day labels column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: GAP, marginRight: 6, paddingTop: 20 }}>
                        {DAYS.map((d, i) => (
                            <div key={d} style={{
                                height: CELL,
                                fontSize: 9,
                                color: i % 2 === 0 ? "var(--text-muted)" : "transparent",
                                display: "flex", alignItems: "center",
                                fontWeight: 500,
                                width: 24,
                            }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Weeks */}
                    <div>
                        {/* Month labels */}
                        <div style={{ display: "flex", marginBottom: 4, height: 16 }}>
                            {grid.map((_, wi) => {
                                const ml = monthLabels.find(m => m.wi === wi);
                                return (
                                    <div key={wi} style={{ width: STEP, fontSize: 9, color: "var(--text-muted)", fontWeight: 500, overflow: "visible", whiteSpace: "nowrap" }}>
                                        {ml ? ml.label : ""}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grid cells */}
                        <div style={{ display: "flex", gap: GAP }}>
                            {grid.map((week, wi) => (
                                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                                    {week.map((cell, di) => {
                                        if (!cell) return (
                                            <div key={di} style={{ width: CELL, height: CELL, flexShrink: 0 }} />
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Less</span>
                {[0, 1, 2, 3, 4].map(n => {
                    const { bg, border } = getColor(n);
                    return <div key={n} style={{ width: 11, height: 11, borderRadius: 2, background: bg, border: `1px solid ${border}` }} />;
                })}
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>More</span>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div className="cal-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                    <span style={{ color: "var(--primary)", fontWeight: 600 }}>{tooltip.date}</span>
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
