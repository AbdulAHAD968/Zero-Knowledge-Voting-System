import React from 'react';

function APIReference() {
  return (
    <div className="container-clay section-clay">
      <div className="hero-clay">
        <div>
          <span className="badge-clay" style={{ marginBottom: '16px' }}>DEVELOPER TOOLS</span>
          <h1>API Reference.</h1>
          <p style={{ fontSize: '20px', color: 'var(--body)', marginBottom: '32px' }}>
            The complete reference for our REST API and client libraries.
          </p>
        </div>
        <div>
          <img src="/api.png" alt="API" style={{ width: '100%', borderRadius: '24px' }} />
        </div>
      </div>

      <div style={{ marginTop: '96px' }}>
        <div className="card-clay-product">
          <h3>Authentication</h3>
          <p>All API requests must include a valid JWT token in the Authorization header.</p>
          <pre className="console-clay" style={{ backgroundColor: 'var(--surface-soft)', padding: '16px', borderRadius: '12px' }}>
            Authorization: Bearer YOUR_TOKEN
          </pre>
        </div>
        <div className="card-clay-product" style={{ marginTop: '24px' }}>
          <h3>Endpoints</h3>
          <p>POST /verify-vote - Submits a ZK-Proof for verification.</p>
          <p>GET /results - Returns the current live election standings.</p>
        </div>
      </div>
    </div>
  );
}

export default APIReference;
