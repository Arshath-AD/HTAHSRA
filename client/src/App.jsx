import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddUrl from './pages/AddUrl';
import UrlDetail from './pages/UrlDetail';
import Cursor from './components/Cursor';

function App() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                navigate('/add');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    return (
        <>
            <Cursor />
            <Navbar />
            <AnimatePresence mode="wait">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/add" element={<AddUrl />} />
                    <Route path="/url/:id" element={<UrlDetail />} />
                </Routes>
            </AnimatePresence>
        </>
    );
}

export default App;
