import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddUrl from './pages/AddUrl';
import UrlDetail from './pages/UrlDetail';
import UrlsList from './pages/UrlsList';
import BdrDashboard from './pages/BdrDashboard';
import AddTask from './pages/AddTask';
import Cursor from './components/Cursor';

function App() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Alt+Shift+N -> Add URL
            if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                navigate('/add');
            }
            // Alt+Shift+T -> Add Task (BDR)
            if (e.altKey && e.shiftKey && e.key.toLowerCase() === 't') {
                e.preventDefault();
                navigate('/bdr/add');
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
                    <Route path="/all" element={<UrlsList />} />
                    <Route path="/add" element={<AddUrl />} />
                    <Route path="/url/:id" element={<UrlDetail />} />
                    <Route path="/bdr" element={<BdrDashboard />} />
                    <Route path="/bdr/add" element={<AddTask />} />
                </Routes>
            </AnimatePresence>
        </>
    );
}

export default App;
