import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🎨 AI Coloring Studio</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/browse">Browse</Link></li>
        <li><Link to="/gallery">Gallery</Link></li>
        
        {!user ? (
          <>
            <li><Link to="/login" className="btn-login">Login</Link></li>
            {/* <li><Link to="/register" className="btn-login" style={{ backgroundColor: '#28a745' }}>Register</Link></li> */}
          </>
        ) : (
          <li className="user-menu-container">
            <button 
              className="user-menu-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user.username}
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={handleLogout} className="dropdown-item">Logout</button>
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
