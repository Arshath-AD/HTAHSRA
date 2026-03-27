import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheck, HiTrash, HiPencil, HiX, HiPlus, HiFire, HiCollection } from 'react-icons/hi';
import { HiBolt } from 'react-icons/hi2';
import { BsCalendarWeek, BsMoonFill } from 'react-icons/bs';
import useTasks from '../hooks/useTasks';
import { BdrRoutineBarChart, BdrTaskDistributionChart } from '../components/CyberCharts';

const CADENCE_COLORS = { daily: '#00f0ff', weekly: '#ff00e5', monthly: '#39ff14' };
const CADENCE_ICONS = {
    daily: <HiBolt style={{ display: 'inline', verticalAlign: 'middle' }} />,
    weekly: <BsCalendarWeek style={{ display: 'inline', verticalAlign: 'middle' }} />,
    monthly: <BsMoonFill style={{ display: 'inline', verticalAlign: 'middle' }} />,
};

// ─── Seeded random for deterministic positions ────────────────────────────────
function srand(seed) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

// ─── Number Formatter for single digit dates ──────────────────────────────────
const padZero = (n) => n < 10 ? '0' + n : n;

// Helper to format date as "Wed 25 Mar"
const formatBdrDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
};

// Helper: Calculate automatic deadline for routine tasks
const getRoutineDeadlineDate = (cadence) => {
    const d = new Date();
    if (cadence === 'daily') return d.toISOString();
    if (cadence === 'weekly') {
        const diff = 6 - d.getDay(); // 6 is Saturday
        d.setDate(d.getDate() + diff);
        return d.toISOString();
    }
    if (cadence === 'monthly') {
        d.setMonth(d.getMonth() + 1, 0); // naturally handles leap year logic
        return d.toISOString();
    }
    return d.toISOString();
};

// ─── Scatter positions using grid cells + jitter (no overlaps) ────────────────
function scatterGrid(items, cols = 6) {
    // Determine how many cells we need. To make it sparse, use 1.5x cells
    const totalCells = Math.max(items.length * 2, cols * 3);
    const availableCells = Array.from({ length: totalCells }, (_, i) => i);

    // Shuffle cells deterministically so it's stable per set of cards
    for (let i = availableCells.length - 1; i > 0; i--) {
        const j = Math.floor(srand(i * 13) * (i + 1));
        [availableCells[i], availableCells[j]] = [availableCells[j], availableCells[i]];
    }

    return items.map((item, i) => {
        const cellIndex = availableCells[i];
        const gridCol = (cellIndex % cols) + 1; // CSS grid is 1-indexed
        const gridRow = Math.floor(cellIndex / cols) + 1;

        // Jitter within -30px to 30px
        const jx = (srand(i * 7 + 3) - 0.5) * 60;
        const jy = (srand(i * 11 + 7) - 0.5) * 60;

        return {
            ...item,
            gridCol,
            gridRow,
            jx: jx.toFixed(1),
            jy: jy.toFixed(1),
            floatDelay: `${(srand(i * 13) * 3).toFixed(1)}s`,
            floatDuration: `${(3 + srand(i * 17) * 3).toFixed(1)}s`,
        };
    });
}

// ─── Task Row ────────────────────────────────────────────────────────────────
function TaskRow({ task, section, onToggle, onDelete, onEdit, isCompleted, streak, isAdhoc }) {
    const [editing, setEditing] = useState(false);
    const [editVal, setEditVal] = useState(task.title);
    const done = isCompleted(task.id, task.cadence);
    const displayDate = isAdhoc ? task.dueDate : getRoutineDeadlineDate(task.cadence);

    const handleEditSave = () => {
        if (editVal.trim()) onEdit(section, task.id, { title: editVal.trim() });
        setEditing(false);
    };

    return (
        <motion.div className={`bdr-task-row ${done ? 'completed' : ''}`} layout
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <button className={`bdr-check-btn ${done ? 'checked' : ''}`} onClick={() => onToggle(task.id, task.cadence)}>
                {done && <HiCheck />}
            </button>
            {editing ? (
                <input className="bdr-edit-input" value={editVal} onChange={e => setEditVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') setEditing(false); }} autoFocus />
            ) : (
                <span className={`bdr-task-title ${done ? 'done' : ''}`}>
                    {isAdhoc && (
                        <span className="bdr-adhoc-cadence-badge" style={{ color: CADENCE_COLORS[task.cadence], marginRight: '8px', fontSize: '0.7em', padding: '2px 6px', border: `1px solid ${CADENCE_COLORS[task.cadence]}40`, borderRadius: '4px', flexShrink: 0 }}>
                            [{task.cadence.toUpperCase()}]
                        </span>
                    )}
                    <span className="bdr-task-title-text" title={task.title}>{task.title}</span>
                    {displayDate && (
                        <span className="bdr-task-due-date">
                            {formatBdrDate(displayDate)}
                        </span>
                    )}
                </span>
            )}
            <div className="bdr-task-meta">
                {!isAdhoc && streak > 0 && <span className="bdr-streak-badge"><HiFire style={{ display: 'inline', verticalAlign: 'middle' }} /> {streak}</span>}
                {editing ? (
                    <>
                        <button className="bdr-icon-btn green" onClick={handleEditSave}><HiCheck /></button>
                        <button className="bdr-icon-btn dimmed" onClick={() => setEditing(false)}><HiX /></button>
                    </>
                ) : (
                    <>
                        <button className="bdr-icon-btn dimmed" onClick={() => setEditing(true)}><HiPencil /></button>
                        <button className="bdr-icon-btn red" onClick={() => onDelete(section, task.id)}><HiTrash /></button>
                    </>
                )}
            </div>
        </motion.div>
    );
}

// ─── Add Task Form ────────────────────────────────────────────────────────────
function AddTaskForm({ section, onAdd, defaultCadence }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [cadence, setCadence] = useState(defaultCadence || 'daily');
    const [dueDate, setDueDate] = useState('');
    const formRef = useRef(null);

    // Listen for the navbar's "New Task" button to auto-open the adhoc form
    useEffect(() => {
        if (section !== 'adhoc') return;
        const handler = () => {
            setOpen(true);
            setTimeout(() => formRef.current?.querySelector('input')?.focus(), 50);
        };
        document.addEventListener('bdr:new-task', handler);
        return () => document.removeEventListener('bdr:new-task', handler);
    }, [section]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        if (section === 'adhoc' && !dueDate) {
            alert('Please select a due date or deadline for the ad-hoc task.');
            return;
        }
        onAdd(section, title.trim(), cadence, section === 'adhoc' ? dueDate : null);
        setTitle('');
        setDueDate('');
        setOpen(false);
    };

    if (!open) return (
        <button className="bdr-add-inline-btn" onClick={() => setOpen(true)}><HiPlus /> Add task</button>
    );

    return (
        <motion.form ref={formRef} className="bdr-add-form-inline" onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <input className="bdr-edit-input" placeholder="Task title..." value={title} onChange={e => setTitle(e.target.value)} autoFocus />
            {!defaultCadence && (
                <select className="bdr-cadence-select" value={cadence} onChange={e => setCadence(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            )}
            {section === 'adhoc' && (
                <input type="date" className="bdr-date-select" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
            )}
            <button type="submit" className="bdr-icon-btn green"><HiCheck /></button>
            <button type="button" className="bdr-icon-btn dimmed" onClick={() => setOpen(false)}><HiX /></button>
        </motion.form>
    );
}

// ─── Cadence Group ─────────────────────────────────────────────────────────────
function CadenceGroup({ cadence, tasks, section, hooks }) {
    const color = CADENCE_COLORS[cadence];
    const filtered = tasks.filter(t => t.cadence === cadence);
    const done = filtered.filter(t => hooks.isCompleted(t.id, cadence)).length;
    return (
        <div className="bdr-cadence-group">
            <div className="bdr-cadence-header" style={{ borderColor: color }}>
                <span className="bdr-cadence-title" style={{ color }}>{CADENCE_ICONS[cadence]} {cadence.charAt(0).toUpperCase() + cadence.slice(1)}</span>
                {filtered.length > 0 && <span className="bdr-cadence-progress" style={{ color }}>{done}/{filtered.length}</span>}
            </div>
            <AnimatePresence>
                {filtered.map(t => (
                    <TaskRow key={t.id} task={t} section={section}
                        onToggle={hooks.toggleComplete} onDelete={hooks.removeTask}
                        onEdit={hooks.updateTask} isCompleted={hooks.isCompleted}
                        streak={hooks.getTaskStreak(t.id)} isAdhoc={false} />
                ))}
            </AnimatePresence>
            <AddTaskForm section={section} onAdd={hooks.addTask} defaultCadence={cadence} />
        </div>
    );
}

// ─── Adhoc Group (Flat List) ───────────────────────────────────────────────────
function AdhocGroup({ tasks, hooks }) {
    const order = { daily: 1, weekly: 2, monthly: 3 };
    const sorted = [...tasks].sort((a, b) => order[a.cadence] - order[b.cadence]);

    return (
        <div className="bdr-adhoc-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence>
                {sorted.map(t => (
                    <TaskRow key={t.id} task={t} section="adhoc"
                        onToggle={hooks.toggleComplete} onDelete={hooks.removeTask}
                        onEdit={hooks.updateTask} isCompleted={hooks.isCompleted}
                        streak={0} isAdhoc={true} />
                ))}
            </AnimatePresence>
            <div style={{ marginTop: '0.5rem' }}>
                <AddTaskForm section="adhoc" onAdd={hooks.addTask} />
            </div>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function BdrDashboard() {
    const hooks = useTasks();
    const stats = hooks.getStats();

    const allTasks = useMemo(() => [
        ...hooks.tasks.routine.map(t => ({ ...t, isAdhoc: false })),
        ...hooks.tasks.adhoc.map(t => ({ ...t, isAdhoc: true }))
    ], [hooks.tasks]);

    const cadenceStreaks = useMemo(() => {
        const result = {};
        ['daily', 'weekly', 'monthly'].forEach(cad => {
            const cadTasks = hooks.tasks.routine.filter(t => t.cadence === cad);
            result[cad] = cadTasks.length > 0 ? Math.min(...cadTasks.map(t => hooks.getTaskStreak(t.id))) : 0;
        });
        return result;
    }, [hooks.tasks.routine, hooks.getTaskStreak]);

    // Build all card data: overall (biggest) → cadence (medium) → tasks (small)
    const allCards = useMemo(() => {
        const cards = [];

        // Overall — biggest
        cards.push({
            id: 'overall', tier: 'overall',
            content: (
                <div className="bdr-card-inner">
                    <div className="bdr-card-big-val" style={{ color: '#ff6b00' }}>{stats.overallStreak}</div>
                    <div className="bdr-card-label">OVERALL STREAK</div>
                </div>
            ),
            borderColor: '#ff6b00',
            glow: '#ff6b00',
        });

        // Cadence — medium
        ['daily', 'weekly', 'monthly'].forEach(cad => {
            const color = CADENCE_COLORS[cad];
            cards.push({
                id: `cad-${cad}`, tier: 'cadence',
                content: (
                    <div className="bdr-card-inner">
                        <div className="bdr-card-med-val" style={{ color }}>
                            {stats[cad].done}<span className="bdr-card-denom">/{stats[cad].total}</span>
                        </div>
                        <div className="bdr-card-label" style={{ color }}>{cad.toUpperCase()}</div>
                    </div>
                ),
                borderColor: color,
                glow: color,
            });
        });

        // Per-task — smallest
        allTasks.forEach(task => {
            const color = CADENCE_COLORS[task.cadence];
            const done = hooks.isCompleted(task.id, task.cadence);
            const streak = task.isAdhoc ? 'T' : hooks.getTaskStreak(task.id);
            const short = task.title.length > 12 ? task.title.slice(0, 11) + '…' : task.title;
            cards.push({
                id: task.id, tier: 'task',
                content: (
                    <div className="bdr-card-inner">
                        <div className="bdr-card-task-streak" style={{ color: done ? '#39ff14' : '#ff6b00', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {streak}
                        </div>
                        <div className="bdr-card-task-name">{short}</div>
                    </div>
                ),
                borderColor: done ? '#39ff14' : color,
                glow: done ? '#39ff14' : color,
                isDone: done,
            });
        });

        return cards;
    }, [stats, allTasks, cadenceStreaks, hooks]);

    // Calculate grid cols based on card count
    const cols = allCards.length <= 6 ? 4 : allCards.length <= 12 ? 5 : 6;
    const scattered = useMemo(() => scatterGrid(allCards, cols), [allCards, cols]);

    return (
        <motion.div className="page-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="container">

                {/* Header */}
                <div className="bdr-header">
                    <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="bdr-title">BURDEN <span className="neon-text">DROPPING</span> ROOM</h1>
                        <p className="bdr-subtitle">{'>'} Drop your burdens. Rise above the grind.</p>
                    </motion.div>
                </div>

                {/* BDR Analytics */}
                <motion.div
                    className="cyber-charts-grid"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <BdrRoutineBarChart stats={stats} />
                    <BdrTaskDistributionChart hooks={hooks} />
                </motion.div>

                {/* Routine Section */}
                <motion.section className="bdr-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="bdr-section-header">
                        <div className="bdr-section-label"><span className="bdr-section-icon"><HiBolt /></span>ROUTINE</div>
                        <span className="bdr-section-sub">Resets with each cycle</span>
                    </div>
                    <div className="bdr-cadence-grid">
                        {['daily', 'weekly', 'monthly'].map(cadence => (
                            <CadenceGroup key={cadence} cadence={cadence} tasks={hooks.tasks.routine} section="routine" hooks={hooks} />
                        ))}
                    </div>
                </motion.section>

                {/* Ad-hoc Section */}
                <motion.section className="bdr-section bdr-section-adhoc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    <div className="bdr-section-header">
                        <div className="bdr-section-label"><span className="bdr-section-icon"><HiCollection /></span>AD-HOC TASKS</div>
                        <span className="bdr-section-sub">One-off & situational tasks</span>
                    </div>
                    <AdhocGroup tasks={hooks.tasks.adhoc} hooks={hooks} />
                </motion.section>

                {/* ── FLOATING SCATTER FIELD ── */}
                <div className="bdr-scatter-field" style={{ '--scatter-cols': cols }}>
                    {scattered.map((card) => (
                        <div
                            key={card.id}
                            className={`bdr-float-card bdr-float-${card.tier} ${card.isDone ? 'bdr-float-done' : ''}`}
                            style={{
                                gridColumn: card.gridCol,
                                gridRow: card.gridRow,
                                marginLeft: `${card.jx}px`,
                                marginTop: `${card.jy}px`,
                                borderColor: card.borderColor,
                                boxShadow: `0 0 20px ${card.glow}30, inset 0 0 15px ${card.glow}08`,
                                animationDelay: card.floatDelay,
                                animationDuration: card.floatDuration,
                            }}
                        >
                            {card.content}
                        </div>
                    ))}
                </div>

                <div className="bottom-spacing" style={{ height: '80px' }} />
            </div>
        </motion.div>
    );
}
