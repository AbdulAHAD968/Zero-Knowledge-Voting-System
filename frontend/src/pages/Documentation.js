import React from 'react';

function Documentation() {
  return (
    <div className="container-clay section-clay">
      <div className="hero-clay">
        <div>
          <span className="badge-clay" style={{ marginBottom: '16px' }}>GUIDES & TUTORIALS</span>
          <h1>Documentation.</h1>
          <p style={{ fontSize: '20px', color: 'var(--body)', marginBottom: '32px' }}>
            Learn how to integrate, deploy, and audit the SecureZK voting protocol.
          </p>
        </div>
        <div>
          <img src="/docs.png" alt="Docs" style={{ width: '100%', borderRadius: '24px' }} />
        </div>
      </div>

      <div className="grid-clay" style={{ marginTop: '96px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card-clay-feature card-clay-feature-ochre">
          <h3>Quick Start</h3>
          <p>Get up and running with a local development environment in under 5 minutes.</p>
          <button className="btn-clay btn-clay-on-color" style={{ marginTop: 'auto' }}>Read Guide</button>
        </div>
        <div className="card-clay-feature card-clay-feature-lavender">
          <h3>Circuit Logic</h3>
          <p>Deep dive into the Circom circuits that power our zero-knowledge proofs.</p>
          <button className="btn-clay btn-clay-on-color" style={{ marginTop: 'auto' }}>View Logic</button>
        </div>
        <div className="card-clay-feature card-clay-feature-teal">
          <h3>Security Audit</h3>
          <p>Our latest security findings and best practices for running a secure election.</p>
          <button className="btn-clay btn-clay-on-color" style={{ marginTop: 'auto' }}>See Audit</button>
        </div>
      </div>
    </div>
  );
}

export default Documentation;
