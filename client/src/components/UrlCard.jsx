import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BiGlobe, BiCopy, BiEdit } from 'react-icons/bi';
import { HiChatAlt2 } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getScreenshotUrl } from '../services/api';
import { getDomain, timeAgo, getStatusInfo, truncate } from '../utils/helpers';

export default function UrlCard({ url, index = 0 }) {
    const navigate = useNavigate();
    const statusInfo = getStatusInfo(url.status);
    const screenshotUrl = getScreenshotUrl(url.screenshot);
    const displayImage = screenshotUrl || url.ogImage;

    const categoryColor = url.categoryColor || '#00f0ff';

    return (
        <motion.div
            className="url-card"
            onClick={(e) => {
                if ((e.ctrlKey || e.metaKey || e.altKey) && e.shiftKey) {
                    window.open(url.url, '_blank', 'noopener,noreferrer');
                } else {
                    navigate(`/url/${url.id}`);
                }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4 }}
            layout
            id={`url-card-${url.id}`}
        >
            {/* Screenshot */}
            <div className="url-card-screenshot">
                {displayImage ? (
                    <img src={displayImage} alt={url.title || 'Page preview'} loading="lazy" />
                ) : (
                    <div className="url-card-screenshot-placeholder">
                        {url.screenshotStatus === 'pending' ? (
                            <div className="neon-loader" style={{ width: 30, height: 30 }} />
                        ) : (
                            <BiGlobe />
                        )}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="url-card-body">
                <div className="url-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        {url.favicon && (
                            <img
                                src={url.favicon}
                                alt=""
                                className="url-card-favicon"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                        <h3 className="url-card-title">
                            {url.title || getDomain(url.url)}
                        </h3>
                    </div>

                    <div className="url-card-actions" style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button
                            className="card-icon-btn"
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(url.url); toast.success('URL Copied!'); }}
                            title="Copy URL"
                        >
                            <BiCopy size={16} />
                        </button>
                        <button
                            className="card-icon-btn"
                            onClick={(e) => { e.stopPropagation(); navigate(`/url/${url.id}?edit=true`); }}
                            title="Edit URL"
                        >
                            <BiEdit size={16} />
                        </button>
                    </div>
                </div>

                <p className="url-card-url">{url.url}</p>

                {url.description && (
                    <p className="url-card-description" title={url.description}>
                        {truncate(url.description, 80)}
                    </p>
                )}

                {url.notes && (
                    <p className="url-card-notes"><HiChatAlt2 style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{truncate(url.notes, 60)}</p>
                )}

                <div className="url-card-footer">
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span
                            className="badge"
                            style={{
                                background: `${categoryColor}15`,
                                color: categoryColor,
                                border: `1px solid ${categoryColor}30`
                            }}
                        >
                            {url.category}
                        </span>
                        <span className={`badge ${statusInfo.className}`}>
                            {statusInfo.label}
                        </span>
                    </div>
                    <span className="url-card-meta">{timeAgo(url.createdAt)}</span>
                </div>
            </div>
        </motion.div>
    );
}
