import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="section-clay" style={{ backgroundColor: 'var(--surface-soft)', paddingBottom: '0' }}>
      <div className="container-clay" style={{ paddingBottom: '80px' }}>
        <div className="grid-clay" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <h4 style={{ fontSize: '18px', marginBottom: '24px' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <Link to="/election" className="nav-link-clay" style={{ margin: 0 }}>Election</Link>
              <Link to="/technology" className="nav-link-clay" style={{ margin: 0 }}>Technology</Link>
              <Link to="/security" className="nav-link-clay" style={{ margin: 0 }}>Security</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', marginBottom: '24px' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <Link to="/documentation" className="nav-link-clay" style={{ margin: 0 }}>Documentation</Link>
              <Link to="/api-reference" className="nav-link-clay" style={{ margin: 0 }}>API Reference</Link>
              <Link to="/whitepaper" className="nav-link-clay" style={{ margin: 0 }}>Whitepaper</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', marginBottom: '24px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <Link to="/about" className="nav-link-clay" style={{ margin: 0 }}>About Us</Link>
              <Link to="/careers" className="nav-link-clay" style={{ margin: 0 }}>Careers</Link>
              <Link to="/contact" className="nav-link-clay" style={{ margin: 0 }}>Contact</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', marginBottom: '24px' }}>Connect</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <Link to="/twitter" className="nav-link-clay" style={{ margin: 0 }}>Twitter</Link>
              <Link to="/github" className="nav-link-clay" style={{ margin: 0 }}>GitHub</Link>
              <Link to="/discord" className="nav-link-clay" style={{ margin: 0 }}>Discord</Link>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'relative', pointerEvents: 'none' }}>
        <img src="/footer-mountains.png" alt="Mountains" style={{ width: '100%', display: 'block' }} />
      </div>
    </footer>
  );
}

export default Footer;
