import React from 'react';

function About() {
  const team = [
    { name: 'Abdul Ahad', id: '23i-2014' },
    { name: 'M. Faizan Shakeel Manawala', id: '23i-2074' },
    { name: 'M. Huzaifa Amir Gulshan', id: '23i-2099' },
    { name: 'Khalid Umer Bongal', id: '23i-2122' }
  ];

  return (
    <div className="container-clay section-clay">
      <div className="hero-clay">
        <div>
          <span className="badge-clay" style={{ marginBottom: '16px' }}>OUR MISSION</span>
          <h1>Trust, without compromise.</h1>
          <p style={{ fontSize: '20px', color: 'var(--body)', marginBottom: '32px' }}>
            We are building the future of democratic infrastructure. Our protocol ensures that every vote is counted, yet every identity remains hidden.
          </p>
        </div>
        <div>
          <img src="/about.png" alt="About" style={{ width: '100%', borderRadius: '24px' }} />
        </div>
      </div>

      <div style={{ marginTop: '96px' }}>
        <h2 style={{ fontSize: '40px', textAlign: 'center', marginBottom: '48px' }}>Meet the Team.</h2>
        <div className="grid-clay" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {team.map((member, i) => (
            <div key={i} className="card-clay-product" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: i % 2 === 0 ? 'var(--brand-lavender)' : 'var(--brand-peach)', 
                borderRadius: '50%', 
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 600,
                color: 'var(--ink)'
              }}>
                {member.name.charAt(0)}
              </div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>{member.name}</h4>
              <p style={{ fontSize: '14px', color: 'var(--muted)', fontFamily: 'monospace' }}>{member.id}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-clay" style={{ marginTop: '96px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card-clay-feature card-clay-feature-lavender">
          <h3>The Problem</h3>
          <p>Traditional voting systems force a trade-off between transparency and privacy. We believe you should have both.</p>
        </div>
        <div className="card-clay-feature card-clay-feature-teal">
          <h3>The Solution</h3>
          <p>By leveraging zero-knowledge proofs, we can verify that a vote came from a valid voter without knowing who they are.</p>
        </div>
      </div>
    </div>
  );
}

export default About;
