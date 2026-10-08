import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🎨 AI Coloring Studio</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/browse">Browse</Link></li>
        <li><Link to="/gallery">Gallery</Link></li>
        <li><Link to="/login" className="btn-login">Login</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
