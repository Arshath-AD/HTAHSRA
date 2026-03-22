import { Link, useNavigate } from 'react-router-dom';
import { HiPlus } from 'react-icons/hi';
import { BiLink } from 'react-icons/bi';

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="navbar-logo">
                    <div className="navbar-logo-icon">H</div>
                    <span className="logo-text">
                        {'HTAHSRA'.split('').map((char, i) => (
                            <span key={i} className="hover-char">{char}</span>
                        ))}
                    </span>
                </Link>

                <div className="navbar-actions">
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
                </div>
            </div>
        </nav>
    );
}
