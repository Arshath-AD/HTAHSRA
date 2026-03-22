import { formatDistanceToNow, format } from 'date-fns';

/**
 * Extract domain from URL
 */
export function getDomain(url) {
    try {
        const u = new URL(url);
        return u.hostname.replace('www.', '');
    } catch {
        return url;
    }
}

/**
 * Truncate text
 */
export function truncate(text, maxLength = 100) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

/**
 * Format relative time
 */
export function timeAgo(dateStr) {
    try {
        return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
        return dateStr;
    }
}

/**
 * Format full date
 */
export function formatDate(dateStr) {
    try {
        return format(new Date(dateStr), 'MMM dd, yyyy · hh:mm a');
    } catch {
        return dateStr;
    }
}

/**
 * Status labels and colors
 */
export const STATUS_OPTIONS = [
    { value: 'in-progress', label: 'In Progress', className: 'status-in-progress' },
    { value: 'paused', label: 'Paused', className: 'status-paused' },
    { value: 'completed', label: 'Completed', className: 'status-completed' },
    { value: 'revisit', label: 'Revisit', className: 'status-revisit' }
];

export function getStatusInfo(status) {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}
