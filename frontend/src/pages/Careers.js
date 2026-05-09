import React from 'react';

function Careers() {
  const jobs = [
    { title: "ZK-SNARK Engineer", team: "Engineering", location: "Remote" },
    { title: "Product Designer", team: "Design", location: "London / Remote" },
    { title: "Growth Lead", team: "Marketing", location: "New York" },
  ];

  return (
    <div className="container-clay section-clay">
      <div className="hero-clay">
        <div>
          <span className="badge-clay" style={{ marginBottom: '16px' }}>WE ARE HIRING</span>
          <h1>Build the future of democracy.</h1>
          <p style={{ fontSize: '20px', color: 'var(--body)', marginBottom: '32px' }}>
            Join a team of cryptographers, designers, and dreamers building the most playful B2B SaaS interface in the voting category.
          </p>
          <button className="btn-clay btn-clay-primary">View Openings</button>
        </div>
        <div>
          <img src="/careers.png" alt="Careers" style={{ width: '100%', borderRadius: '24px' }} />
        </div>
      </div>

      <div style={{ marginTop: '96px' }}>
        <h2 style={{ marginBottom: '48px' }}>Open Roles</h2>
        <div className="grid-clay" style={{ gridTemplateColumns: '1fr' }}>
          {jobs.map((job, i) => (
            <div key={i} className="card-clay-product" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '24px', marginBottom: '4px' }}>{job.title}</h3>
                <p style={{ color: 'var(--muted)', margin: 0 }}>{job.team} • {job.location}</p>
              </div>
              <button className="btn-clay btn-clay-secondary">Apply Now</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Careers;
