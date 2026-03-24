import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiArrowLeft,
    HiExternalLink,
    HiPencil,
    HiTrash,
    HiRefresh,
    HiSave,
    HiX,
    HiPlus
} from 'react-icons/hi';
import { BiGlobe, BiTime, BiCategory, BiInfoCircle, BiCopy } from 'react-icons/bi';
import toast from 'react-hot-toast';
import { urlsApi, getScreenshotUrl } from '../services/api';
import { getDomain, formatDate, getStatusInfo, STATUS_OPTIONS } from '../utils/helpers';
import useCategories from '../hooks/useCategories';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import CustomDropdown from '../components/CustomDropdown';
import AddCategoryModal from '../components/AddCategoryModal';

export default function UrlDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { categories, fetchCategories } = useCategories();

    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef(null);

    const [editForm, setEditForm] = useState({
        title: '',
        notes: '',
        category: '',
        status: 'revisit',
        url: ''
    });
    const [deleteModal, setDeleteModal] = useState(false);

    const fetchUrl = async () => {
        try {
            setLoading(true);
            const { data } = await urlsApi.getById(id);
            setUrl(data.data);
        } catch (err) {
            toast.error('URL not found');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUrl();
    }, [id]);

    useEffect(() => {
        if (url) {
            setEditForm({
                title: url.title || '',
                notes: url.notes || '',
                category: categories.find(c => c.name === url.category)?.id || url.category || '',
                status: url.status || 'revisit',
                url: url.url || ''
            });
        }
    }, [url, categories]);

    useEffect(() => {
        if (location.search.includes('edit=true')) {
            setEditing(true);
        }
    }, [location]);

    // Auto-refresh for pending
    useEffect(() => {
        if (url && (url.metadataStatus === 'pending' || url.screenshotStatus === 'pending')) {
            const interval = setInterval(fetchUrl, 4000);
            return () => clearInterval(interval);
        }
    }, [url]);

    const handleSave = async () => {
        try {
            const { data } = await urlsApi.update(id, editForm);
            setUrl(data.data);
            setEditing(false);
            toast.success('Updated! ✨');
        } catch (err) {
            toast.error('Failed to update');
        }
    };

    const handleDelete = async () => {
        try {
            await urlsApi.delete(id);
            toast.success('URL deleted');
            navigate('/');
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await urlsApi.refresh(id);
            toast.success('Refresh requested. It may take a moment.');
        } catch (err) {
            toast.error('Failed to command refresh');
        } finally {
            setRefreshing(false);
        }
    };

    const handleUploadImage = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file');
            return;
        }

        try {
            setUploadingImage(true);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64Data = reader.result;
                try {
                    await urlsApi.uploadImage(id, base64Data);
                    toast.success('Custom image uploaded!');
                    fetchUrl(); // Refresh the data to get the new screenshot filename
                } catch (err) {
                    toast.error('Failed to upload image');
                }
            };
        } catch (err) {
            toast.error('Error processing image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                handleUploadImage(file);
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
            handleUploadImage(e.dataTransfer.files[0]);
        }
    };

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [id]);

    if (loading) return <Loader />;
    if (!url) return null;

    const statusInfo = getStatusInfo(url.status);
    const screenshotUrl = getScreenshotUrl(url.screenshot);
    const displayImage = screenshotUrl || url.ogImage;
    const category = categories.find(c => c.id === url.category);

    return (
        <motion.div
            className="page-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="container detail-page">
                {/* Top Bar with Back and Actions */}
                <motion.div
                    className="detail-top-bar"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Link to="/" className="detail-back">
                        <HiArrowLeft /> Back to Dashboard
                    </Link>

                    <div className="detail-top-actions">
                        <a
                            href={url.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                            id="open-url"
                        >
                            <HiExternalLink /> Open
                        </a>

                        {editing ? (
                            <>
                                <button className="btn btn-primary btn-sm" onClick={handleSave} id="save-edit">
                                    <HiSave /> Save
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
                                    <HiX /> Cancel
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} id="edit-url">
                                <HiPencil /> Edit
                            </button>
                        )}

                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            id="refresh-url"
                        >
                            <HiRefresh style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                            Refresh
                        </button>

                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteModal(true)}
                            id="delete-url"
                        >
                            <HiTrash /> Delete
                        </button>
                    </div>
                </motion.div>

                {/* Screenshot */}
                <motion.div
                    className="detail-screenshot"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    style={{ position: 'relative' }}
                >
                    {uploadingImage && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: 12 }}>
                            <div className="neon-loader" />
                        </div>
                    )}

                    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 5, opacity: editing ? 1 : 0.7, transition: 'opacity 0.2s' }} className="image-upload-trigger hover-reveal">
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={(e) => handleUploadImage(e.target.files[0])}
                        />
                        <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <HiPlus /> Update Image (drag/paste)
                        </button>
                    </div>

                    {displayImage ? (
                        <img src={displayImage} alt={url.title || 'Page preview'} style={{ opacity: uploadingImage ? 0.5 : 1 }} />
                    ) : (
                        <div className="detail-screenshot-placeholder">
                            {url.screenshotStatus === 'pending' ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div className="neon-loader" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
                                    <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
                                        Capturing screenshot...
                                    </p>
                                </div>
                            ) : (
                                <BiGlobe />
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Header */}
                <motion.div
                    className="detail-header"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {url.favicon && (
                        <img
                            src={url.favicon}
                            alt=""
                            className="detail-favicon"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}
                    <div className="detail-header-text">
                        {editing ? (
                            <input
                                type="text"
                                className="input"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}
                            />
                        ) : (
                            <h1>{url.title || getDomain(url.url)}</h1>
                        )}
                        {editing ? (
                            <input
                                type="url"
                                className="input"
                                value={editForm.url}
                                onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                                style={{ color: 'var(--neon-cyan)', marginBottom: '8px' }}
                                placeholder="https://..."
                            />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <a
                                    href={url.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="detail-url"
                                >
                                    {url.url}
                                </a>
                                <button
                                    className="card-icon-btn"
                                    onClick={() => { navigator.clipboard.writeText(url.url); toast.success('URL Copied! 📋'); }}
                                    title="Copy URL"
                                >
                                    <BiCopy size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Badges */}
                <motion.div
                    className="detail-badges"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                >
                    {editing ? (
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', zIndex: 40, position: 'relative' }}>
                            <CustomDropdown
                                value={editForm.category}
                                onChange={(val) => setEditForm(prev => ({ ...prev, category: val }))}
                                options={categories.map(cat => ({ value: cat.id, label: cat.name, color: cat.color }))}
                                placeholder="Select Category"
                                onAddOption={() => setShowAddCategory(true)}
                                addOptionLabel="Create New Category..."
                            />
                            <div style={{ zIndex: 39 }}>
                                <CustomDropdown
                                    value={editForm.status}
                                    onChange={(val) => setEditForm(prev => ({ ...prev, status: val }))}
                                    options={STATUS_OPTIONS}
                                    placeholder="Select Status"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <span
                                className="badge"
                                style={{
                                    background: `${category?.color || '#00f0ff'}15`,
                                    color: category?.color || '#00f0ff',
                                    border: `1px solid ${category?.color || '#00f0ff'}30`
                                }}
                            >
                                <BiCategory style={{ fontSize: 12 }} />
                                {url.category}
                            </span>
                            <span className={`badge ${statusInfo.className}`}>
                                {statusInfo.label}
                            </span>
                            {url.siteName && (
                                <span className="badge badge-neon">
                                    <BiGlobe style={{ fontSize: 12 }} />
                                    {url.siteName}
                                </span>
                            )}
                        </>
                    )}
                </motion.div>

                {/* Description */}
                {url.description && (
                    <motion.div
                        className="detail-section"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2><BiInfoCircle /> Description</h2>
                        <div className="detail-description">{url.description}</div>
                    </motion.div>
                )}

                {/* Notes */}
                <motion.div
                    className="detail-section"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <h2>📝 Your Notes</h2>
                    {editing ? (
                        <textarea
                            className="input"
                            value={editForm.notes}
                            onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                            rows={5}
                            placeholder="Why did you save this URL? What were you doing?"
                        />
                    ) : url.notes ? (
                        <div className="detail-notes">{url.notes}</div>
                    ) : (
                        <div className="detail-notes" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                            No notes yet. Click edit to add your thoughts.
                        </div>
                    )}
                </motion.div>

                {/* Tags */}
                {url.tags && url.tags.length > 0 && (
                    <motion.div
                        className="detail-section"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2>🏷️ Tags</h2>
                        <div className="tags-container">
                            {url.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Metadata */}
                <motion.div
                    className="detail-section"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <h2><BiTime /> Timeline</h2>
                    <div className="detail-meta">
                        <div className="detail-meta-item">
                            <div className="detail-meta-label">Saved On</div>
                            <div className="detail-meta-value">{formatDate(url.createdAt)}</div>
                        </div>
                        <div className="detail-meta-item">
                            <div className="detail-meta-label">Last Updated</div>
                            <div className="detail-meta-value">{formatDate(url.updatedAt)}</div>
                        </div>
                        <div className="detail-meta-item">
                            <div className="detail-meta-label">Domain</div>
                            <div className="detail-meta-value">{getDomain(url.url)}</div>
                        </div>
                        <div className="detail-meta-item">
                            <div className="detail-meta-label">Type</div>
                            <div className="detail-meta-value">{url.type || 'website'}</div>
                        </div>
                    </div>
                </motion.div>

                {/* End Content Sections */}

                {/* Delete Modal */}
                <Modal
                    isOpen={deleteModal}
                    onClose={() => setDeleteModal(false)}
                    title="Delete URL"
                >
                    <p>Are you sure you want to delete this URL? This action cannot be undone.</p>
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={() => setDeleteModal(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-danger" onClick={handleDelete} id="confirm-delete">
                            Delete Permanently
                        </button>
                    </div>
                </Modal>

                {showAddCategory && (
                    <AddCategoryModal
                        isOpen={showAddCategory}
                        onClose={() => setShowAddCategory(false)}
                        onAdded={async (newId) => {
                            await fetchCategories();
                            setEditForm(prev => ({ ...prev, category: newId }));
                        }}
                    />
                )}
            </div>
        </motion.div>
    );
}
