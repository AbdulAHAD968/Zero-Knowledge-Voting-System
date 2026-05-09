import React from 'react';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="nav-clay">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
        <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></div>
        <span style={{ fontWeight: 600, fontSize: '20px' }}>SecureZK</span>
      </Link>
      <div className="nav-links">
        <Link to="/" className="nav-link-clay">Home</Link>
        <Link to="/explorer" className="nav-link-clay">Explorer</Link>
        <Link to="/about" className="nav-link-clay">About</Link>
        <Link to="/careers" className="nav-link-clay">Careers</Link>
        <Link to="/contact" className="nav-link-clay">Contact</Link>
        <button className="btn-clay btn-clay-primary">Try Free</button>
      </div>
    </nav>
  );
}

export default Navigation;
