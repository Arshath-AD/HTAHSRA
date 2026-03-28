import React, { useMemo } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, Legend
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

const NeonFilter = () => (
    <defs>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
        <filter id="heavyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    </defs>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const color = payload[0].payload?.color || payload[0].color || '#00f0ff';
        return (
            <div style={{
                background: 'rgba(5, 5, 8, 0.95)',
                border: `1px solid ${color}`,
                padding: '10px 14px',
                borderRadius: '4px',
                boxShadow: `0 0 15px ${color}40`,
                fontFamily: 'var(--font-mono)',
                color: '#fff',
                fontSize: '0.85rem',
                backdropFilter: 'blur(4px)'
            }}>
                {label && <div style={{ marginBottom: '6px', color: 'var(--text-tertiary)' }}>{label}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }}></div>
                    <span style={{ fontWeight: 'bold', color }}>
                        {payload[0].name !== label ? `${payload[0].name}: ` : ''}{payload[0].value} URLs
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export function CategoryPieChart({ urls, categories }) {
    const data = useMemo(() => {
        const counts = {};
        urls.forEach(url => {
            const catId = url.category || 'uncategorized';
            counts[catId] = (counts[catId] || 0) + 1;
        });

        return Object.entries(counts).map(([catId, count]) => {
            if (catId === 'uncategorized') {
                return { name: 'Uncategorized', value: count, color: '#a200ff' }; // Neon purple fallback
            }
            const cat = categories.find(c => c.id === catId);
            return {
                name: cat ? cat.name : 'Unknown',
                value: count,
                color: cat ? cat.color : '#00f0ff'
            };
        }).sort((a, b) => b.value - a.value);
    }, [urls, categories]);

    if (data.length === 0) return null;

    return (
        <div className="cyber-chart-container">
            <h3 className="cyber-chart-title">Data Distribution</h3>
            <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <NeonFilter />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} filter="url(#neonGlow)" />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function ActivityLineChart({ urls }) {
    const data = useMemo(() => {
        const days = 14; // Last 14 days
        const counts = {};

        // Initialize timeline
        for (let i = days - 1; i >= 0; i--) {
            const d = startOfDay(subDays(new Date(), i));
            counts[d.getTime()] = 0;
        }

        urls.forEach(url => {
            if (!url.createdAt) return;
            const d = startOfDay(new Date(url.createdAt)).getTime();
            if (counts[d] !== undefined) {
                counts[d]++;
            }
        });

        return Object.entries(counts).map(([time, count]) => ({
            dateStr: format(new Date(parseInt(time)), 'MMM dd'),
            count
        }));
    }, [urls]);

    if (urls.length === 0) return null;

    return (
        <div className="cyber-chart-container">
            <h3 className="cyber-chart-title">Uplink Activity (14 Days)</h3>
            <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <NeonFilter />
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 240, 255, 0.1)" vertical={false} />
                        <XAxis
                            dataKey="dateStr"
                            stroke="rgba(255, 255, 255, 0.3)"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                            tickMargin={10}
                        />
                        <YAxis
                            stroke="rgba(255, 255, 255, 0.3)"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="count"
                            name="Saved"
                            stroke="var(--neon-cyan)"
                            strokeWidth={3}
                            dot={{ fill: 'var(--bg-card)', stroke: 'var(--neon-cyan)', strokeWidth: 2, r: 4, filter: 'url(#neonGlow)' }}
                            activeDot={{ r: 6, fill: 'var(--neon-cyan)', stroke: '#fff', filter: 'url(#heavyGlow)' }}
                            filter="url(#neonGlow)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function BdrRoutineBarChart({ stats }) {
    if (!stats) return null;

    const data = [
        {
            name: 'DAILY',
            done: stats.daily.done,
            remaining: stats.daily.total - stats.daily.done,
            color: '#00f0ff'
        },
        {
            name: 'WEEKLY',
            done: stats.weekly.done,
            remaining: stats.weekly.total - stats.weekly.done,
            color: '#ff00e5'
        },
        {
            name: 'MONTHLY',
            done: stats.monthly.done,
            remaining: stats.monthly.total - stats.monthly.done,
            color: '#39ff14'
        }
    ];

    return (
        <div className="cyber-chart-container">
            <h3 className="cyber-chart-title">Routine Progress</h3>
            <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                        <NeonFilter />
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 240, 255, 0.1)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                        <YAxis stroke="rgba(255, 255, 255, 0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)' }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', paddingTop: '10px' }} />
                        <Bar dataKey="done" name="Completed" stackId="a">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} filter="url(#neonGlow)" />
                            ))}
                        </Bar>
                        <Bar dataKey="remaining" name="Remaining" stackId="a">
                            {data.map((entry, index) => (
                                <Cell key={`cell-bg-${index}`} fill="rgba(255, 255, 255, 0.05)" stroke={entry.color} strokeWidth={1} strokeDasharray="3 3" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function BdrContributionHeatmap({ completions }) {
    const DAYS = 365;

    const data = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cells = [];
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - DAYS + 1);
        const dayOfWeek = startDate.getDay();
        const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(startDate.getDate() - offset);

        const cursor = new Date(startDate);
        while (cursor <= today) {
            const dateStr = cursor.toISOString().slice(0, 10);
            let count = 0;
            Object.values(completions || {}).forEach(taskBuckets => {
                if (taskBuckets[dateStr]) count++;
            });
            cells.push({ dateStr, count, date: new Date(cursor) });
            cursor.setDate(cursor.getDate() + 1);
        }
        return cells;
    }, [completions]);

    const totalCompleted = useMemo(() => data.reduce((sum, c) => sum + (c.count > 0 ? 1 : 0), 0), [data]);

    const weeks = useMemo(() => {
        const result = [];
        for (let i = 0; i < data.length; i += 7) result.push(data.slice(i, i + 7));
        return result;
    }, [data]);

    const monthLabels = useMemo(() => {
        const labels = [];
        const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        weeks.forEach((week, wi) => {
            const firstDay = week[0];
            if (!firstDay) return;
            const d = firstDay.date;
            if (d.getDate() <= 7) labels.push({ weekIndex: wi, label: MONTH_NAMES[d.getMonth()] });
        });
        return labels;
    }, [weeks]);

    const getColor = (count) => {
        if (count === 0) return { bg: 'rgba(255,255,255,0.04)', shadow: 'none', border: 'rgba(255,255,255,0.06)' };
        if (count === 1) return { bg: 'rgba(0,240,255,0.12)', shadow: 'none', border: 'rgba(0,240,255,0.2)' };
        if (count === 2) return { bg: 'rgba(0,240,255,0.3)', shadow: '0 0 6px rgba(0,240,255,0.3)', border: 'rgba(0,240,255,0.4)' };
        if (count === 3) return { bg: 'rgba(0,240,255,0.6)', shadow: '0 0 10px rgba(0,240,255,0.5)', border: 'rgba(0,240,255,0.7)' };
        return { bg: '#00f0ff', shadow: '0 0 14px #00f0ff, 0 0 4px #fff', border: '#00f0ff' };
    };

    const CELL = 18;
    const GAP = 4;
    const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(0,240,255,0.03) 0%, rgba(0,0,0,0) 60%)',
            border: '1px solid rgba(0,240,255,0.12)',
            borderRadius: 12,
            padding: '20px 24px 16px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 40px rgba(0,240,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative corner accent */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'radial-gradient(circle at top right, rgba(0,240,255,0.08), transparent 70%)', pointerEvents: 'none' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #00f0ff, #a200ff)', borderRadius: 2 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        Task Completion History
                    </span>
                </div>
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#00f0ff',
                    background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)',
                    padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em'
                }}>
                    {totalCompleted} active days
                </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    {/* Day labels */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px`, paddingTop: CELL + GAP + 4 }}>
                        {DAY_LABELS.map((d, i) => (
                            <div key={i} style={{ height: CELL, fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)', lineHeight: `${CELL}px`, width: 28, textAlign: 'right' }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    <div>
                        {/* Month labels */}
                        <div style={{ display: 'flex', gap: `${GAP}px`, marginBottom: 4, height: CELL }}>
                            {weeks.map((_, wi) => {
                                const ml = monthLabels.find(m => m.weekIndex === wi);
                                return (
                                    <div key={wi} style={{ width: CELL, fontSize: '10px', color: ml ? 'rgba(255,255,255,0.45)' : 'transparent', fontFamily: 'var(--font-mono)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                        {ml ? ml.label : '·'}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Cells */}
                        <div style={{ display: 'flex', gap: `${GAP}px` }}>
                            {weeks.map((week, wi) => (
                                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}>
                                    {week.map((cell, di) => {
                                        const c = getColor(cell.count);
                                        return (
                                            <div
                                                key={di}
                                                title={`${cell.dateStr} · ${cell.count} task${cell.count !== 1 ? 's' : ''} completed`}
                                                style={{
                                                    width: CELL, height: CELL,
                                                    borderRadius: 3,
                                                    background: c.bg,
                                                    boxShadow: c.shadow,
                                                    border: `1px solid ${c.border}`,
                                                    cursor: 'default',
                                                    transition: 'transform 0.15s, box-shadow 0.15s',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'scale(1.6)';
                                                    if (cell.count > 0) e.currentTarget.style.boxShadow = '0 0 16px #00f0ff, 0 0 4px #fff';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = c.shadow;
                                                }}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 14 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Less</span>
                {[0, 1, 2, 3, 4].map(n => {
                    const c = getColor(n);
                    return <div key={n} style={{ width: 12, height: 12, borderRadius: 3, background: c.bg, border: `1px solid ${c.border}`, boxShadow: c.shadow }} />;
                })}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>More</span>
            </div>
        </div>
    );
}

export function BdrTaskDistributionChart({ hooks }) {
    if (!hooks || !hooks.tasks) return null;

    const data = [
        { name: 'Daily', value: hooks.tasks.routine.filter(t => t.cadence === 'daily').length, color: '#00f0ff' },
        { name: 'Weekly', value: hooks.tasks.routine.filter(t => t.cadence === 'weekly').length, color: '#ff00e5' },
        { name: 'Monthly', value: hooks.tasks.routine.filter(t => t.cadence === 'monthly').length, color: '#39ff14' },
        { name: 'Ad-Hoc', value: hooks.tasks.adhoc.length, color: '#a200ff' }
    ].filter(d => d.value > 0);

    if (data.length === 0) return null;

    return (
        <div className="cyber-chart-container">
            <h3 className="cyber-chart-title">Task Load Distribution</h3>
            <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <NeonFilter />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} filter="url(#neonGlow)" />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
