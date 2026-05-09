import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as snarkjs from 'snarkjs';

const API_BASE = "http://localhost:5000";

function Home() {
  const [cert, setCert]                   = useState(null);
  const [constituency, setConstituency]   = useState('lahore');
  const [constituencies, setConstituencies] = useState([]);
  const [results, setResults]             = useState([]);
  const [loading, setLoading]             = useState(false);
  const [logs, setLogs]                   = useState([]);
  const consoleRef = useRef(null);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  // Load constituency list for the selector
  useEffect(() => {
    fetch(`${API_BASE}/constituencies`, {
      headers: { "ngrok-skip-browser-warning": "69420" }
    })
      .then(r => r.json())
      .then(setConstituencies)
      .catch(console.error);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.secret || !data.merklePath) {
          throw new Error("Certificate file is missing cryptographic fields (secret or merklePath). Please regenerate certificates.");
        }
        setCert(data);
        // Auto-select the constituency embedded in the certificate if available
        if (data.constituencyId) setConstituency(data.constituencyId);
        
        const displayName = data.voterName || "Unknown Voter";
        const displayConstituency = data.constituencyName || "Legacy Branch";
        addLog(`Identity Loaded: ${displayName} (${displayConstituency})`);
      } catch (err) {
        alert("Error loading certificate: " + err.message);
        addLog(`ERROR: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const castVote = async (voteValue) => {
    if (!cert) return alert("Please upload your certificate first!");

    setLoading(true);
    setLogs([]);
    addLog("Initializing ZK-SNARK Prover...");

    try {
      // Use the root embedded in the certificate (set by issue_certs.js)
      const input = {
        secret:       (cert.secret || "").toString(),
        pathElements: (cert.merklePath || []).map(x => x.toString()),
        pathIndices:  (cert.pathIndices || []).map(x => x.toString()),
        merkleRoot:   (cert.merkleRoot || "").toString(),
        vote:         voteValue.toString(),
        nullifierHash: (cert.nullifierHash || "").toString()
      };

      addLog("Generating Groth16 Proof… (local CPU — this takes a few seconds)");

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "/zk-assets/vote.wasm",
        "/zk-assets/vote_0001.zkey"
      );

      addLog("✅ Proof Generated Locally!");
      addLog(`Transmitting to Verifier Node… (constituency: ${constituency})`);

      const response = await fetch(`${API_BASE}/verify-vote`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420"
        },
        body: JSON.stringify({
          proof,
          publicSignals,
          candidate: voteValue === 1 ? "Candidate A" : "Candidate B",
          constituency
        })
      });

      const resData = await response.json();
      if (resData.success) {
        addLog("🏆 SUCCESS: Server verified your ZK-Proof!");
        fetchResults();
      } else {
        addLog(`❌ REJECTED: ${resData.error}`);
      }

    } catch (err) {
      console.error(err);
      addLog(`FATAL: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_BASE}/results?constituency=${constituency}`, {
        headers: { "ngrok-skip-browser-warning": "69420" }
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Results fetch failed");
    }
  };

  useEffect(() => { fetchResults(); }, [constituency]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeConstituency = constituencies.find(c => c.id === constituency);

  return (
    <>
      <section className="section-clay">
        <div className="container-clay">
          <div className="hero-clay">
            <div>
              <span className="badge-clay" style={{ marginBottom: '16px' }}>VERSION 2.0 • ZK-SNARKS READY</span>
              <h1 style={{ marginBottom: '24px' }}>Vote with unique privacy.</h1>
              <p style={{ fontSize: '20px', color: 'var(--body)', marginBottom: '32px', maxWidth: '500px' }}>
                The world's most secure, anonymous, and verifiable voting system built on zero-knowledge proofs.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a href="#vote" className="btn-clay btn-clay-primary">Cast Your Vote</a>
                <Link to="/explorer" className="btn-clay btn-clay-secondary">Merkle Explorer</Link>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <img src="/hero.png" alt="Hero" style={{ width: '100%', borderRadius: '24px' }} />
            </div>
          </div>
        </div>
      </section>

      <section id="vote" className="section-clay" style={{ backgroundColor: 'var(--surface-soft)' }}>
        <div className="container-clay">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '40px' }}>Simple. Secure. Sovereign.</h2>
          </div>

          {/* Constituency selector */}
          <div className="card-clay-product" style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Constituency
              </label>
              <select
                value={constituency}
                onChange={e => { setConstituency(e.target.value); setCert(null); setLogs([]); }}
                style={{
                  padding: '10px 40px 10px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--hairline)',
                  background: 'var(--canvas)',
                  color: 'var(--ink)',
                  fontFamily: 'inherit',
                  fontSize: '15px',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center'
                }}>
                {constituencies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {activeConstituency && (
              <div style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                Root: {activeConstituency.root.substring(0, 20)}…
              </div>
            )}
            <Link to="/explorer" style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              View Merkle Tree →
            </Link>
          </div>

          <div className="grid-clay" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {/* Identity Card */}
            <div className="card-clay-feature card-clay-feature-lavender">
              <span className="badge-clay" style={{ alignSelf: 'flex-start' }}>STEP 1</span>
              <h3>Identity Verification</h3>
              <p>Upload your voter certificate from NADRA to initialize your session securely.</p>
              <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                <img src="/identity.png" alt="Identity" style={{ width: '120px', marginBottom: '16px' }} />
                <input type="file" id="cert-upload" hidden onChange={handleFileUpload} accept=".json" />
                <label htmlFor="cert-upload" className="btn-clay btn-clay-on-color" style={{ width: '100%', cursor: 'pointer' }}>
                  {cert ? `✓ Loaded: ${cert.voterName}` : 'Upload Certificate'}
                </label>
                {cert && cert.constituencyId && cert.constituencyId !== constituency && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626' }}>
                    ⚠️ Certificate is for {cert.constituencyName} — constituency updated automatically
                  </div>
                )}
              </div>
            </div>

            {/* Ballot Card */}
            <div className="card-clay-feature card-clay-feature-teal">
              <span className="badge-clay" style={{ alignSelf: 'flex-start' }}>STEP 2</span>
              <h3>Anonymous Ballot</h3>
              <p>Cast your vote without revealing your identity to anyone, anywhere.</p>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <img src="/ballot.png" alt="Ballot" style={{ width: '120px', marginBottom: '16px' }} />
                </div>
                <button
                  disabled={loading || !cert}
                  onClick={() => castVote(1)}
                  className="btn-clay btn-clay-on-color">
                  Vote for Candidate A
                </button>
                <button
                  disabled={loading || !cert}
                  onClick={() => castVote(2)}
                  className="btn-clay btn-clay-on-color">
                  Vote for Candidate B
                </button>
              </div>
            </div>

            {/* Console Card */}
            <div className="card-clay-product" style={{ gridColumn: 'span 1' }}>
              <span className="badge-clay" style={{ marginBottom: '12px' }}>LIVE MONITOR</span>
              <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Cryptographic Console</h3>
              <div className="console-clay" ref={consoleRef}>
                {logs.length === 0 && <span style={{ color: 'var(--muted)' }}>Waiting for user action…</span>}
                {logs.map((log, i) => (
                  <div key={i} style={{
                    color: log.includes('✅') || log.includes('🏆') ? '#22c55e' :
                           log.includes('❌') || log.includes('FATAL') ? '#ef4444' :
                           '#0ea5e9'
                  }}>
                    {log}
                  </div>
                ))}
                {loading && <div style={{ marginTop: '8px', color: '#0ea5e9' }}>Proving… ⚙️</div>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-clay">
        <div className="container-clay">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2>Live Election Standings</h2>
            {activeConstituency && (
              <p style={{ color: 'var(--muted)', marginTop: '8px' }}>{activeConstituency.name}</p>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
            {results.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>No votes recorded yet for this constituency.</p>
            ) : results.map((r, i) => (
              <div
                key={r._id}
                className={`card-clay-feature ${i === 0 ? 'card-clay-feature-pink' : 'card-clay-feature-ochre'}`}
                style={{ minWidth: '240px', textAlign: 'center', padding: '32px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{r._id.toUpperCase()}</span>
                <div style={{ fontSize: '64px', fontWeight: 500, margin: '16px 0' }}>{r.count}</div>
                <span style={{ opacity: 0.8 }}>Total Votes</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/explorer" className="btn-clay btn-clay-secondary">
              Explore the Merkle Tree →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
