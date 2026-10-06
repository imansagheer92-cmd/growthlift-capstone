import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        {/* Logo */}
        <NavLink to="/" className="navbar__logo" onClick={closeMenu}>
          <span className="navbar__logo-icon">💰</span>
          SpendWise
        </NavLink>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>

        {/* Nav links */}
        <nav className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
                Dashboard
              </NavLink>
              <NavLink to="/expenses" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
                Expenses
              </NavLink>
              <NavLink to="/add-expense" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
                Add Expense
              </NavLink>
              <span className="navbar__greeting">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
                Home
              </NavLink>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
                Login
              </NavLink>
              <NavLink to="/register" onClick={closeMenu}>
                <span className="btn btn-primary btn-sm">Get Started</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
