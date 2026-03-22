import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiPlus } from 'react-icons/hi';

export default function CustomDropdown({ value, options, onChange, placeholder = 'Select...', onAddOption, addOptionLabel = '+ Add New' }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="custom-dropdown-wrapper" ref={dropdownRef} style={{ zIndex: isOpen ? 1000 : 10 }}>
            <button
                type="button"
                className={`custom-dropdown-btn input ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="dropdown-selected-text">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="dropdown-arrow-icon"
                >
                    <HiChevronDown size={20} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="custom-dropdown-menu glass-card"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`custom-dropdown-item ${value === option.value ? 'selected' : ''}`}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                {option.color && (
                                    <span
                                        className="dropdown-color-dot"
                                        style={{ backgroundColor: option.color, boxShadow: `0 0 8px ${option.color}` }}
                                    />
                                )}
                                {option.label}
                            </button>
                        ))}
                        {onAddOption && (
                            <button
                                type="button"
                                className="custom-dropdown-item add-new-option"
                                style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 4, paddingTop: 8, color: 'var(--neon-cyan)' }}
                                onClick={() => {
                                    onAddOption();
                                    setIsOpen(false);
                                }}
                            >
                                <HiPlus style={{ marginRight: 6 }} /> {addOptionLabel}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
