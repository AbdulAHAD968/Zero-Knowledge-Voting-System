import React from 'react';

function Contact() {
  return (
    <div className="container-clay section-clay">
      <div className="hero-clay">
        <div>
          <span className="badge-clay" style={{ marginBottom: '16px' }}>GET IN TOUCH</span>
          <h1>We'd love to hear from you.</h1>
          <p style={{ fontSize: '20px', color: 'var(--body)', marginBottom: '32px' }}>
            Have questions about ZK-SNARKs or want to implement SecureZK in your organization? Drop us a line.
          </p>
        </div>
        <div>
          <img src="/contact.png" alt="Contact" style={{ width: '100%', borderRadius: '24px' }} />
        </div>
      </div>

      <div style={{ marginTop: '96px', maxWidth: '600px', margin: '96px auto 0' }}>
        <div className="card-clay-feature card-clay-feature-teal">
          <h3 style={{ color: 'white' }}>Send us a message</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'white' }}>Name</label>
              <input type="text" className="input-clay" placeholder="Your name" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'white' }}>Email</label>
              <input type="email" className="input-clay" placeholder="you@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'white' }}>Message</label>
              <textarea className="input-clay" style={{ height: '120px', padding: '12px' }} placeholder="How can we help?"></textarea>
            </div>
            <button className="btn-clay btn-clay-on-color" style={{ width: '100%' }}>Send Message</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
