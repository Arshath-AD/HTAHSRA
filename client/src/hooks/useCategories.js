import { useState, useEffect } from 'react';
import { categoriesApi } from '../services/api';

export default function useCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data } = await categoriesApi.getAll();
            setCategories(data.data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const addCategory = async (name, color) => {
        const { data } = await categoriesApi.create({ name, color });
        setCategories(prev => [...prev, data.data]);
        return data.data;
    };

    return { categories, loading, fetchCategories, addCategory };
}
