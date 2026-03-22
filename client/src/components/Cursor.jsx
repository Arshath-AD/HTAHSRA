import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function Cursor() {
    const [isPointer, setIsPointer] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Track exact mouse position for the sharp arrow
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Smooth spring physics for the trailing ring
    const springConfig = { damping: 20, stiffness: 150, mass: 0.8 };
    const cursorXSpring = useSpring(mouseX, springConfig);
    const cursorYSpring = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            if (!isVisible) setIsVisible(true);
            // Move framer motion values directly to skip React renders (higher performance)
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            const style = window.getComputedStyle(target);
            const clickable = style.cursor === 'pointer' ||
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') !== null ||
                target.closest('button') !== null;
            setIsPointer(clickable);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', moveCursor);
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [mouseX, mouseY, isVisible]);

    if (!isVisible) return null;

    return (
        <>
            {/* Trailing Object */}
            <motion.div
                className="cursor-trail"
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                }}
                animate={{
                    scale: isPointer ? 1.5 : 1,
                    backgroundColor: isPointer ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 0, 229, 0.1)',
                    borderColor: isPointer ? 'var(--neon-cyan)' : 'var(--neon-magenta)'
                }}
                transition={{ duration: 0.2 }}
            />

            {/* Main Arrow */}
            <motion.div
                className="cursor-main"
                style={{
                    translateX: mouseX,
                    translateY: mouseY,
                }}
                animate={{
                    scale: isPointer ? 0.9 : 1,
                    rotate: isPointer ? -10 : 0
                }}
                transition={{ duration: 0.15 }}
            >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M1 1 L16 10 L10 12 L5 21 Z"
                        fill={isPointer ? "var(--neon-magenta)" : "var(--neon-cyan)"}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        style={{ filter: `drop-shadow(0 0 8px ${isPointer ? '#ff00e5' : '#00f0ff'})` }}
                    />
                </svg>
            </motion.div>
        </>
    );
}
