import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiPlus } from 'react-icons/hi';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const isBdr = location.pathname.startsWith('/bdr');

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                {/* Static nav links: HTAHSRA + BDR side by side */}
                <div className="navbar-links">
                    <Link to="/" className={`navbar-logo ${!isBdr ? 'navbar-logo--active' : ''}`}>
                        <div className="navbar-logo-icon">H</div>
                        <span className="logo-text">
                            {'HTAHSRA'.split('').map((char, i) => (
                                <span key={i} className="hover-char">{char}</span>
                            ))}
                        </span>
                    </Link>

                    <Link to="/bdr" className={`navbar-logo navbar-logo--bdr ${isBdr ? 'navbar-logo--active' : ''}`}>
                        <div className="navbar-logo-icon navbar-logo-icon--bdr">B</div>
                        <span className="logo-text">
                            {'BDR'.split('').map((char, i) => (
                                <span key={i} className="hover-char">{char}</span>
                            ))}
                        </span>
                    </Link>
                </div>

                <div className="navbar-actions">
                    {!isBdr && (
                        <>
                            <div className="shortcut-container">
                                <kbd className="shortcut-hint">Alt+Shift+N</kbd>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/add')}
                                id="nav-add-url"
                            >
                                <HiPlus />
                                Save URL
                            </button>
                        </>
                    )}
                    {isBdr && (
                        <button
                            className="btn btn-primary bdr-new-task-btn"
                            onClick={() => document.dispatchEvent(new CustomEvent('bdr:new-task'))}
                            id="nav-new-task"
                        >
                            <HiPlus />
                            New Task
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
