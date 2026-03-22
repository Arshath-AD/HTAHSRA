import { useState } from 'react';
import Modal from './Modal';
import useCategories from '../hooks/useCategories';
import toast from 'react-hot-toast';

export default function AddCategoryModal({ isOpen, onClose, onAdded }) {
    const { addCategory } = useCategories();
    const [name, setName] = useState('');
    const [color, setColor] = useState('#a200ff');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setSubmitting(true);
            const newCat = await addCategory(name.trim(), color);
            toast.success('Category added!');
            setName('');
            if (onAdded) onAdded(newCat.id);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add category');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Category">
            <form onSubmit={handleSubmit} className="add-form">
                <div className="input-group">
                    <label>Category Name</label>
                    <input
                        autoFocus
                        type="text"
                        className="input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Finances"
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Color</label>
                    <input
                        type="color"
                        className="input"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        style={{ height: 40, padding: 4 }}
                    />
                </div>
                <div className="modal-actions" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Adding...' : 'Add Category'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
