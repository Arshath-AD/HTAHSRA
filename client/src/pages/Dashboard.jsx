import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlus, HiSearch } from 'react-icons/hi';
import { BiFilterAlt } from 'react-icons/bi';
import useUrls from '../hooks/useUrls';
import useCategories from '../hooks/useCategories';
import UrlCard from '../components/UrlCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import CustomDropdown from '../components/CustomDropdown';
import { STATUS_OPTIONS } from '../utils/helpers';

export default function Dashboard() {
    const navigate = useNavigate();
    const { urls, loading, fetchUrls, filters, setFilters } = useUrls();
    const { categories } = useCategories();

    const [searchInput, setSearchInput] = useState('');

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput, setFilters]);

    const handleCategoryChange = (e) => {
        setFilters(prev => ({ ...prev, category: e.target.value }));
    };

    const handleStatusChange = (e) => {
        setFilters(prev => ({ ...prev, status: e.target.value }));
    };

    // Stats
    const totalUrls = urls.length;
    const inProgressCount = urls.filter(u => u.status === 'in-progress').length;
    const pausedCount = urls.filter(u => u.status === 'paused').length;
    const completedCount = urls.filter(u => u.status === 'completed').length;
    const revisitCount = urls.filter(u => u.status === 'revisit').length;

    const isAbsoluteEmpty = urls.length === 0 && !filters.search && (!filters.category || filters.category === 'all') && (!filters.status || filters.status === 'all');

    // Auto-refresh for pending metadata/screenshots
    useEffect(() => {
        const hasPending = urls.some(u =>
            u.metadataStatus === 'pending' || u.screenshotStatus === 'pending'
        );
        if (hasPending) {
            const interval = setInterval(fetchUrls, 5000);
            return () => clearInterval(interval);
        }
    }, [urls, fetchUrls]);

    return (
        <motion.div
            className="page-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="container">
                {/* Hero */}
                <div className="dashboard-hero">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                        <span className="neon-text logo-text">
                            {'HTAHSRA'.split('').map((char, i) => (
                                <span key={i} className="hover-char">{char}</span>
                            ))}
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
                    >
                        Your URL command center. Save, organize, and never forget why you were there.
                    </motion.p>
                </div>

                {/* Stats */}
                {!isAbsoluteEmpty && (
                    <motion.div
                        className="dashboard-stats"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="stat-card">
                            <div className="stat-card-value neon-text-cyan">{totalUrls}</div>
                            <div className="stat-card-label">Total URLs</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value" style={{ color: 'var(--neon-orange)' }}>{inProgressCount}</div>
                            <div className="stat-card-label">In Progress</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value" style={{ color: 'var(--neon-magenta)' }}>{pausedCount}</div>
                            <div className="stat-card-label">Paused</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value" style={{ color: 'var(--neon-lime)' }}>{completedCount}</div>
                            <div className="stat-card-label">Completed</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value" style={{ color: 'var(--neon-purple)' }}>{revisitCount}</div>
                            <div className="stat-card-label">Revisit</div>
                        </div>
                    </motion.div>
                )}

                {/* Filters */}
                {!isAbsoluteEmpty && (
                    <motion.div
                        className="filters-bar"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="search-wrapper">
                            <HiSearch className="search-icon" />
                            <input
                                type="text"
                                className="input"
                                placeholder="Search URLs, titles, notes..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                id="search-urls"
                            />
                        </div>

                        <CustomDropdown
                            value={filters.category || 'all'}
                            onChange={(val) => setFilters(prev => ({ ...prev, category: val }))}
                            options={[
                                { value: 'all', label: 'All Categories' },
                                ...categories.map(cat => ({ value: cat.id, label: cat.name, color: cat.color }))
                            ]}
                        />

                        <CustomDropdown
                            value={filters.status || 'all'}
                            onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                            options={[
                                { value: 'all', label: 'All Status' },
                                ...STATUS_OPTIONS
                            ]}
                        />
                    </motion.div>
                )}

                {/* Content */}
                {loading ? (
                    <Loader />
                ) : isAbsoluteEmpty ? (
                    <EmptyState />
                ) : urls.length === 0 ? (
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="empty-state-icon">🔍</div>
                        <h2>No results found</h2>
                        <p>Try adjusting your search or filters</p>
                    </motion.div>
                ) : (
                    <div className="url-grid">
                        {urls.map((url, index) => (
                            <UrlCard key={url.id} url={url} index={index} />
                        ))}
                    </div>
                )}
            </div>

            {/* FAB */}
            <motion.button
                className="fab"
                onClick={() => navigate('/add')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5, type: 'spring' }}
                id="fab-add"
            >
                <HiPlus />
            </motion.button>
        </motion.div>
    );
}
