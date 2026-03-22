import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiLink, HiSave, HiPlus } from 'react-icons/hi';
import { urlsApi } from '../services/api';
import { BiNote, BiCategory } from 'react-icons/bi';
import toast from 'react-hot-toast';
import useUrls from '../hooks/useUrls';
import useCategories from '../hooks/useCategories';
import { STATUS_OPTIONS } from '../utils/helpers';
import CustomDropdown from '../components/CustomDropdown';
import AddCategoryModal from '../components/AddCategoryModal';

export default function AddUrl() {
    const navigate = useNavigate();
    const { addUrl } = useUrls();
    const { categories, fetchCategories } = useCategories();

    const [form, setForm] = useState({
        url: '',
        notes: '',
        category: 'other',
        status: 'in-progress',
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [previewBase64, setPreviewBase64] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChange = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file');
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setPreviewBase64(reader.result);
        };
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                handleImageChange(file);
                break;
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleImageChange(e.dataTransfer.files[0]);
        }
    };

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, []);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!form.tags.includes(tagInput.trim())) {
                setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.url.trim()) {
            toast.error('Please enter a URL');
            return;
        }

        // Prepend https:// if missing
        let url = form.url.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        try {
            setSubmitting(true);
            const newUrl = await addUrl({ ...form, url });

            if (previewBase64 && newUrl?.id) {
                await urlsApi.uploadImage(newUrl.id, previewBase64);
            }

            toast.success('URL saved! 🚀');
            navigate('/');
        } catch (err) {
            toast.error('Failed to save URL');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            className="page-wrapper"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="container add-page">
                <button className="detail-back" onClick={() => navigate(-1)}>
                    <HiArrowLeft /> Back
                </button>

                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <span className="neon-text">Save a URL</span>
                </motion.h1>
                <p>Capture a URL with your notes so you never lose context.</p>

                <motion.form
                    className="add-form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* URL Input */}
                    <div className="input-group">
                        <label htmlFor="url-input">
                            <HiLink style={{ verticalAlign: 'middle', marginRight: 6 }} />
                            URL
                        </label>
                        <input
                            type="text"
                            className="input"
                            id="url-input"
                            name="url"
                            placeholder="https://example.com/page"
                            value={form.url}
                            onChange={handleChange}
                            autoFocus
                            autoComplete="off"
                        />
                    </div>

                    {/* Notes */}
                    <div className="input-group">
                        <label htmlFor="notes-input">
                            <BiNote style={{ verticalAlign: 'middle', marginRight: 6 }} />
                            Your Notes — Why are you saving this?
                        </label>
                        <textarea
                            className="input"
                            id="notes-input"
                            name="notes"
                            placeholder="What were you doing? What was important? What should you remember when you come back?"
                            value={form.notes}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>

                    {/* Category & Status */}
                    <div className="add-form-row">
                        <div className="input-group">
                            <label htmlFor="category-select">
                                <BiCategory style={{ verticalAlign: 'middle', marginRight: 6 }} />
                                Category
                            </label>
                            <CustomDropdown
                                value={form.category}
                                onChange={(val) => setForm(prev => ({ ...prev, category: val }))}
                                options={categories.map(cat => ({ value: cat.id, label: cat.name, color: cat.color }))}
                                placeholder="Select Category"
                                onAddOption={() => setShowAddCategory(true)}
                                addOptionLabel="Create New Category..."
                            />
                        </div>

                        <div className="input-group" style={{ zIndex: 40 /* Ensure dropdown escapes lower down limits */ }}>
                            <label htmlFor="status-select">Status</label>
                            <CustomDropdown
                                value={form.status}
                                onChange={(val) => setForm(prev => ({ ...prev, status: val }))}
                                options={STATUS_OPTIONS}
                                placeholder="Select Status"
                            />
                        </div>
                    </div>

                    {/* Custom Preview Image */}
                    <div className="input-group" style={{ zIndex: 30 }}>
                        <label>Custom Preview Image (Optional)</label>
                        <div
                            className="detail-screenshot"
                            style={{ position: 'relative', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px dashed var(--border-subtle)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={(e) => handleImageChange(e.target.files[0])}
                            />
                            {previewBase64 ? (
                                <img src={previewBase64} alt="Preview" style={{ maxHeight: '200px', borderRadius: '8px', opacity: 0.9 }} />
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px' }}>
                                    <HiPlus style={{ fontSize: 24, marginBottom: 8, color: 'var(--neon-purple)' }} />
                                    <p>Click, paste, or drop an image</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="input-group">
                        <label htmlFor="tag-input">Tags (press Enter to add)</label>
                        <input
                            type="text"
                            className="input"
                            id="tag-input"
                            placeholder="Add a tag..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                        />
                        {form.tags.length > 0 && (
                            <div className="tags-container">
                                {form.tags.map(tag => (
                                    <span key={tag} className="tag">
                                        {tag}
                                        <span className="tag-remove" onClick={() => handleRemoveTag(tag)}>×</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="add-form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={submitting}
                            id="submit-url"
                        >
                            {submitting ? (
                                <div className="neon-loader" style={{ width: 20, height: 20, borderWidth: 2 }} />
                            ) : (
                                <>
                                    <HiSave />
                                    Save URL
                                </>
                            )}
                        </button>
                    </div>
                </motion.form>
            </div>

            {showAddCategory && (
                <AddCategoryModal
                    isOpen={showAddCategory}
                    onClose={() => setShowAddCategory(false)}
                    onAdded={async (newId) => {
                        await fetchCategories();
                        setForm(prev => ({ ...prev, category: newId }));
                    }}
                />
            )}
        </motion.div>
    );
}
