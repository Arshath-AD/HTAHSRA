import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'bdr_tasks';
const STREAK_KEY = 'bdr_streaks';
const COMPLETION_KEY = 'bdr_completions';

// Returns "YYYY-MM-DD" string for a given Date (or today)
const toDateStr = (d = new Date()) =>
    d.toISOString().slice(0, 10);

// Returns the start of the current ISO week (Monday) as a date string
const getWeekKey = () => {
    const d = new Date();
    const day = d.getDay(); // 0=Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return toDateStr(d);
};

// Returns "YYYY-MM" for monthly key
const getMonthKey = () => new Date().toISOString().slice(0, 7);

// Returns the "completion bucket" for a task cadence
const getBucket = (cadence) => {
    if (cadence === 'daily') return toDateStr();
    if (cadence === 'weekly') return getWeekKey();
    if (cadence === 'monthly') return getMonthKey();
    return toDateStr();
};

const DEFAULT_TASKS = {
    routine: [],  // { id, title, cadence: 'daily'|'weekly'|'monthly', createdAt }
    adhoc: [],    // { id, title, cadence, createdAt }
};

const DEFAULT_COMPLETIONS = {};
// Shape: { taskId: { [bucket]: boolean } }

const DEFAULT_STREAKS = {};
// Shape: { taskId: { count: number, lastBucket: string } }

export default function useTasks() {
    const [tasks, setTasks] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_TASKS;
        } catch { return DEFAULT_TASKS; }
    });

    const [completions, setCompletions] = useState(() => {
        try {
            const stored = localStorage.getItem(COMPLETION_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_COMPLETIONS;
        } catch { return DEFAULT_COMPLETIONS; }
    });

    const [streaks, setStreaks] = useState(() => {
        try {
            const stored = localStorage.getItem(STREAK_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_STREAKS;
        } catch { return DEFAULT_STREAKS; }
    });

    // Persist on every change
    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }, [tasks]);
    useEffect(() => { localStorage.setItem(COMPLETION_KEY, JSON.stringify(completions)); }, [completions]);
    useEffect(() => { localStorage.setItem(STREAK_KEY, JSON.stringify(streaks)); }, [streaks]);

    const addTask = useCallback((section, title, cadence, dueDate = null) => {
        const newTask = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title,
            cadence,
            dueDate,
            createdAt: new Date().toISOString(),
        };
        setTasks(prev => ({ ...prev, [section]: [...prev[section], newTask] }));
    }, []);

    const removeTask = useCallback((section, id) => {
        setTasks(prev => ({ ...prev, [section]: prev[section].filter(t => t.id !== id) }));
        setCompletions(prev => { const n = { ...prev }; delete n[id]; return n; });
        setStreaks(prev => { const n = { ...prev }; delete n[id]; return n; });
    }, []);

    const updateTask = useCallback((section, id, updates) => {
        setTasks(prev => ({
            ...prev,
            [section]: prev[section].map(t => t.id === id ? { ...t, ...updates } : t),
        }));
    }, []);

    const toggleComplete = useCallback((id, cadence) => {
        const bucket = getBucket(cadence);
        const wasCompleted = completions[id]?.[bucket] ?? false;
        const nowCompleted = !wasCompleted;

        setCompletions(prev => ({
            ...prev,
            [id]: { ...(prev[id] || {}), [bucket]: nowCompleted },
        }));

        // Update streak
        setStreaks(prev => {
            const current = prev[id] || { count: 0, lastBucket: null };
            if (nowCompleted) {
                // Only increment if not already counted this bucket
                if (current.lastBucket !== bucket) {
                    return { ...prev, [id]: { count: current.count + 1, lastBucket: bucket } };
                }
            } else {
                // Undo completion: decrement if last bucket matches
                if (current.lastBucket === bucket && current.count > 0) {
                    // Find the previous bucket to roll back to
                    return { ...prev, [id]: { count: current.count - 1, lastBucket: null } };
                }
            }
            return prev;
        });
    }, [completions]);

    const isCompleted = useCallback((id, cadence) => {
        const bucket = getBucket(cadence);
        return completions[id]?.[bucket] ?? false;
    }, [completions]);

    const getTaskStreak = useCallback((id) => {
        return streaks[id]?.count ?? 0;
    }, [streaks]);

    // Overall stats
    const getStats = useCallback(() => {
        const allRoutine = tasks.routine;
        const today = toDateStr();
        const weekKey = getWeekKey();
        const monthKey = getMonthKey();

        const dailyRoutine = allRoutine.filter(t => t.cadence === 'daily');
        const weeklyRoutine = allRoutine.filter(t => t.cadence === 'weekly');
        const monthlyRoutine = allRoutine.filter(t => t.cadence === 'monthly');

        const dailyDone = dailyRoutine.filter(t => completions[t.id]?.[today]).length;
        const weeklyDone = weeklyRoutine.filter(t => completions[t.id]?.[weekKey]).length;
        const monthlyDone = monthlyRoutine.filter(t => completions[t.id]?.[monthKey]).length;

        // Overall streak = min streak across all routine tasks (the "weakest link" model)
        const overallStreak = allRoutine.length > 0
            ? Math.min(...allRoutine.map(t => streaks[t.id]?.count ?? 0))
            : 0;

        return {
            daily: { done: dailyDone, total: dailyRoutine.length },
            weekly: { done: weeklyDone, total: weeklyRoutine.length },
            monthly: { done: monthlyDone, total: monthlyRoutine.length },
            overallStreak,
        };
    }, [tasks, completions, streaks]);

    return {
        tasks,
        completions,
        streaks,
        addTask,
        removeTask,
        updateTask,
        toggleComplete,
        isCompleted,
        getTaskStreak,
        getStats,
    };
}
