import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlus, HiX, HiCheckCircle } from 'react-icons/hi';
import { BsCalendarWeek, BsMoonFill } from 'react-icons/bs';
import useTasks from '../hooks/useTasks';

export default function AddTask() {
    const navigate = useNavigate();
    const hooks = useTasks();

    const [formParams, setFormParams] = useState({
        title: '',
        type: 'adhoc', // 'routine' or 'adhoc'
        cadence: 'daily', // for routine
        date: new Date().toISOString().slice(0, 10), // for adhoc
    });

    // Auto-focus input on mount
    useEffect(() => {
        document.getElementById('task-title-input')?.focus();
    }, []);

    // Global keyboard listener for Esc -> go back
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') navigate(-1);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formParams.title.trim()) return;

        hooks.addTask({
            ...formParams,
            title: formParams.title.trim()
        });

        navigate('/bdr');
    };

    return (
        <motion.div
            className="page-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <div className="container" style={{ maxWidth: '600px', marginTop: '4rem' }}>
                <div className="cyberpunk-hero" style={{ padding: '2.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 240, 255, 0.2)', paddingBottom: '1rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="neon-text">NEW</span> TASK
                        </h2>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="bdr-icon-btn dimmed"
                            style={{ opacity: 1, border: '1px solid rgba(255,255,255,0.1)', padding: '4px', borderRadius: '4px' }}
                        >
                            <HiX />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--neon-cyan)', letterSpacing: '2px' }}>
                                TASK DESCRIPTION
                            </label>
                            <input
                                id="task-title-input"
                                type="text"
                                className="nav-search-input"
                                value={formParams.title}
                                onChange={e => setFormParams({ ...formParams, title: e.target.value })}
                                placeholder="What needs to drop?"
                                style={{ width: '100%', fontSize: '1.1rem', padding: '12px 16px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,240,255,0.3)', color: '#fff' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-tertiary)', letterSpacing: '2px' }}>
                                    TYPE
                                </label>
                                <select
                                    className="bdr-cadence-select"
                                    value={formParams.type}
                                    onChange={e => setFormParams({ ...formParams, type: e.target.value })}
                                    style={{ padding: '10px 12px', fontSize: '1rem' }}
                                >
                                    <option value="adhoc">Ad-Hoc (One-off)</option>
                                    <option value="routine">Routine (Recurring)</option>
                                </select>
                            </div>

                            {formParams.type === 'routine' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-tertiary)', letterSpacing: '2px' }}>
                                        CADENCE
                                    </label>
                                    <select
                                        className="bdr-cadence-select"
                                        value={formParams.cadence}
                                        onChange={e => setFormParams({ ...formParams, cadence: e.target.value })}
                                        style={{ padding: '10px 12px', fontSize: '1rem' }}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-tertiary)', letterSpacing: '2px' }}>
                                        DATE
                                    </label>
                                    <input
                                        type="date"
                                        className="bdr-date-select"
                                        value={formParams.date}
                                        onChange={e => setFormParams({ ...formParams, date: e.target.value })}
                                        style={{ padding: '10px 12px', fontSize: '1rem' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                type="button"
                                className="btn"
                                onClick={() => navigate(-1)}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '1.05rem' }}
                                disabled={!formParams.title.trim()}
                            >
                                <HiCheckCircle /> Create
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </motion.div>
    );
}
