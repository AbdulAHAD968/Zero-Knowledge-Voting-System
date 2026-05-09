import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

function Community() {
  const { platform: paramPlatform } = useParams();
  const location = useLocation();
  
  // Extract platform from param or from the end of the pathname
  const platform = paramPlatform || location.pathname.split('/').pop().toLowerCase();
  
  const platforms = {
    twitter: {
      name: 'Twitter',
      color: 'card-clay-feature-pink',
      description: 'Follow us for the latest updates on ZK-tech and election security.',
      cta: 'Follow @SecureZK'
    },
    github: {
      name: 'GitHub',
      color: 'card-clay-feature-teal',
      description: 'Contribute to our open-source circuits and verification logic.',
      cta: 'View Repositories'
    },
    discord: {
      name: 'Discord',
      color: 'card-clay-feature-lavender',
      description: 'Join our community of cryptographers and developers.',
      cta: 'Join Discord Server'
    }
  };

  const data = platforms[platform] || platforms.twitter;

  return (
    <div className="container-clay section-clay">
      <div className="hero-clay">
        <div>
          <span className="badge-clay" style={{ marginBottom: '16px' }}>COMMUNITY</span>
          <h1>Join us on {data.name}.</h1>
          <p style={{ fontSize: '20px', color: 'var(--body)', marginBottom: '32px' }}>
            {data.description}
          </p>
        </div>
        <div>
          <img src="/community.png" alt="Community" style={{ width: '100%', borderRadius: '24px' }} />
        </div>
      </div>

      <div style={{ marginTop: '96px', textAlign: 'center' }}>
        <div className={`card-clay-feature ${data.color}`} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3>Ready to get involved?</h3>
          <p style={{ opacity: 0.9 }}>{data.name} is the best place to engage with our team and other contributors.</p>
          <button className="btn-clay btn-clay-on-color" style={{ width: '100%', marginTop: '24px' }}>{data.cta}</button>
        </div>
      </div>
    </div>
  );
}

export default Community;
