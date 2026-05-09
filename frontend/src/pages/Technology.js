import React from 'react';

function Technology() {
  return (
    <div className="container-clay section-clay">
      <div className="hero-clay">
        <div>
          <span className="badge-clay" style={{ marginBottom: '16px' }}>UNDER THE HOOD</span>
          <h1>Technology.</h1>
          <p style={{ fontSize: '20px', color: 'var(--body)', marginBottom: '32px' }}>
            A deep dive into the cryptography, circuits, and infrastructure that make SecureZK possible.
          </p>
        </div>
        <div>
          <img src="/technology.png" alt="Technology" style={{ width: '100%', borderRadius: '24px' }} />
        </div>
      </div>

      <div className="grid-clay" style={{ marginTop: '96px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card-clay-feature card-clay-feature-lavender">
          <h3>zk-SNARKs</h3>
          <p>We use Groth16 proofs to provide succinct, non-interactive arguments of knowledge.</p>
        </div>
        <div className="card-clay-feature card-clay-feature-teal">
          <h3>Merkle Trees</h3>
          <p>Our identity system relies on Merkle Trees to prove membership without revealing which voter you are.</p>
        </div>
        <div className="card-clay-feature card-clay-feature-peach">
          <h3>Node Network</h3>
          <p>A distributed network of verifier nodes ensures that no single entity can tamper with the results.</p>
        </div>
      </div>
    </div>
  );
}

export default Technology;
