import React from 'react';

function Election() {
  return (
    <div className="container-clay section-clay">
      <div className="hero-clay">
        <div>
          <span className="badge-clay" style={{ marginBottom: '16px' }}>UPCOMING EVENTS</span>
          <h1>Elections.</h1>
          <p style={{ fontSize: '20px', color: 'var(--body)', marginBottom: '32px' }}>
            Browse and participate in active and upcoming secure elections powered by zk-SNARKs.
          </p>
        </div>
        <div>
          <img src="/election.png" alt="Election" style={{ width: '100%', borderRadius: '24px' }} />
        </div>
      </div>

      <div style={{ marginTop: '96px' }}>
        <div className="card-clay-feature card-clay-feature-pink">
          <h3>Active: 2026 Presidential Primary</h3>
          <p>Voting is now open for the primary elections. Ensure your certificate is updated before casting your ballot.</p>
          <button className="btn-clay btn-clay-on-color" style={{ marginTop: '24px' }}>Vote Now</button>
        </div>
      </div>
    </div>
  );
}

export default Election;
