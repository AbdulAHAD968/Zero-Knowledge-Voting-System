import React from 'react';

function Security() {
  return (
    <div className="container-clay section-clay">
      <div className="hero-clay">
        <div>
          <span className="badge-clay" style={{ marginBottom: '16px' }}>TRUST & SAFETY</span>
          <h1>Security.</h1>
          <p style={{ fontSize: '20px', color: 'var(--body)', marginBottom: '32px' }}>
            Security isn't just a feature; it's our entire foundation. Here's how we protect every single vote.
          </p>
        </div>
        <div>
          <img src="/security.png" alt="Security" style={{ width: '100%', borderRadius: '24px' }} />
        </div>
      </div>

      <div style={{ marginTop: '96px' }}>
        <div className="card-clay-feature card-clay-feature-ochre">
          <h3>Immutable Proofs</h3>
          <p>Every vote is accompanied by a cryptographic proof that is permanently stored and verified against the electoral roll.</p>
        </div>
        <div className="card-clay-product" style={{ marginTop: '24px' }}>
          <h3>Auditability</h3>
          <p>Anyone can verify the entire election tally without seeing how any individual voted. This is the beauty of zero-knowledge.</p>
        </div>
      </div>
    </div>
  );
}

export default Security;
