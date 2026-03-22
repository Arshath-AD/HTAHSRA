import { useState, useEffect, useCallback } from 'react';
import { urlsApi } from '../services/api';

export default function useUrls(initialFilters = {}) {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters);

    const fetchUrls = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await urlsApi.getAll(filters);
            setUrls(data.data);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch URLs:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchUrls();
    }, [fetchUrls]);

    const addUrl = async (urlData) => {
        const { data } = await urlsApi.create(urlData);
        setUrls(prev => [data.data, ...prev]);
        return data.data;
    };

    const updateUrl = async (id, updates) => {
        const { data } = await urlsApi.update(id, updates);
        setUrls(prev => prev.map(u => (u.id === id ? data.data : u)));
        return data.data;
    };

    const deleteUrl = async (id) => {
        await urlsApi.delete(id);
        setUrls(prev => prev.filter(u => u.id !== id));
    };

    const refreshUrl = async (id) => {
        await urlsApi.refresh(id);
    };

    return {
        urls,
        loading,
        error,
        filters,
        setFilters,
        fetchUrls,
        addUrl,
        updateUrl,
        deleteUrl,
        refreshUrl
    };
}
