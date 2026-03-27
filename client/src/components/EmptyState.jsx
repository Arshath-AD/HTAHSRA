import { motion } from 'framer-motion';
import { HiPlus, HiLink } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

export default function EmptyState() {
    const navigate = useNavigate();

    return (
        <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <div className="empty-state-icon animate-float"><HiLink /></div>
            <h2>No URLs saved yet</h2>
            <p>
                Start saving URLs you want to remember. We'll capture metadata, screenshots,
                and you can add your own notes to never forget why you were there.
            </p>
            <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/add')}
                id="empty-add-url"
            >
                <HiPlus />
                Save your first URL
            </button>
        </motion.div>
    );
}
