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
