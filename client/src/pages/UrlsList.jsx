import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlus, HiSearch, HiArrowLeft } from 'react-icons/hi';
import useUrls from '../hooks/useUrls';
import useCategories from '../hooks/useCategories';
import UrlCard from '../components/UrlCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import CustomDropdown from '../components/CustomDropdown';
import { STATUS_OPTIONS } from '../utils/helpers';

export default function UrlsList() {
    const navigate = useNavigate();
    const { urls, loading, fetchUrls, filters, setFilters } = useUrls();
    const { categories } = useCategories();
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput, setFilters]);

    const isAbsoluteEmpty = urls.length === 0 && !filters.search && (!filters.category || filters.category === 'all') && (!filters.status || filters.status === 'all');

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
                        <HiArrowLeft /> Back
                    </button>
                    <h1 style={{ margin: 0, color: 'var(--neon-cyan)', textShadow: '0 0 10px rgba(0, 240, 255, 0.4)' }}>All System URLs</h1>
                </div>

                {/* Filters */}
                {!isAbsoluteEmpty && (
                    <motion.div
                        className="filters-bar"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
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
            >
                <HiPlus />
            </motion.button>
        </motion.div>
    );
}
