import React from 'react';

function Whitepaper() {
  return (
    <div className="container-clay section-clay">
      <div className="hero-clay">
        <div>
          <span className="badge-clay" style={{ marginBottom: '16px' }}>TECHNICAL PAPER</span>
          <h1>Whitepaper.</h1>
          <p style={{ fontSize: '20px', color: 'var(--body)', marginBottom: '32px' }}>
            A deep dive into the mathematical foundations and architectural design of SecureZK.
          </p>
          <button className="btn-clay btn-clay-primary">Download PDF</button>
        </div>
        <div>
          <img src="/whitepaper.png" alt="Whitepaper" style={{ width: '100%', borderRadius: '24px' }} />
        </div>
      </div>

      <div style={{ marginTop: '96px' }}>
        <div className="card-clay-feature card-clay-feature-pink">
          <h3>Abstract</h3>
          <p>
            SecureZK presents a novel approach to electronic voting using zk-SNARKs. By decoupling identity from ballot submission through Merkle Tree memberships, we achieve non-malleability and receipt-freeness while maintaining a public audit trail.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Whitepaper;
