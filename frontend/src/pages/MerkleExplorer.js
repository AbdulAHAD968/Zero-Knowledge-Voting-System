import React, { useState, useEffect, useCallback, useMemo } from 'react';

const API_BASE = "http://localhost:5000";

// ─── SVG layout constants ───────────────────────────────────────────────────
const SVG_W = 960;
const SVG_H = 460;
const R = 22; // node radius

// Pre-computed x positions (spacing = 120)
const LEAF_X   = [60, 180, 300, 420, 540, 660, 780, 900];
const L1_X     = [120, 360, 600, 840];
const L2_X     = [240, 720];
const ROOT_X   = 480;

const LEVEL_Y  = { 3: 70, 2: 170, 1: 280, 0: 390 };
const LABEL_Y  = { 3: 45,  2: 145, 1: 255, 0: 365 };
const LEVEL_LABELS = { 3: 'Root', 2: 'Level 2', 1: 'Level 1', 0: 'Leaves' };

function nodePos(level, index) {
    const y = LEVEL_Y[level];
    switch (level) {
        case 0: return { x: LEAF_X[index],  y };
        case 1: return { x: L1_X[index],    y };
        case 2: return { x: L2_X[index],    y };
        case 3: return { x: ROOT_X,          y };
        default: return { x: 0, y: 0 };
    }
}

function nodeColors(type, isPath, isSibling) {
    if (isPath)    return { fill: '#22c55e', stroke: '#16a34a' };
    if (isSibling) return { fill: '#f59e0b', stroke: '#d97706' };
    switch (type) {
        case 'root':     return { fill: '#6366f1', stroke: '#4f46e5' };
        case 'internal': return { fill: '#0ea5e9', stroke: '#0284c7' };
        case 'leaf':     return { fill: '#8b5cf6', stroke: '#7c3aed' };
        default:         return { fill: '#1f2937', stroke: '#374151' }; // empty
    }
}

function truncHash(h) {
    if (!h || h === '0') return '0x000…';
    return `${h.slice(0, 9)}…${h.slice(-6)}`;
}

// Walk the hierarchy tree and call visitor(node) for every node
function walkTree(node, visitor) {
    visitor(node);
    if (node.children) node.children.forEach(c => walkTree(c, visitor));
}

function collectEdges(node, pathIds, result = []) {
    if (!node.children) return result;
    const from = nodePos(node.level, node.index);
    node.children.forEach(child => {
        const to = nodePos(child.level, child.index);
        const highlighted = pathIds.has(node.id) && pathIds.has(child.id);
        result.push({ key: `${node.id}-${child.id}`, from, to, highlighted });
        collectEdges(child, pathIds, result);
    });
    return result;
}

function collectNodes(node, pathIds, siblingIds, result = []) {
    result.push({ ...node, isPath: pathIds.has(node.id), isSibling: siblingIds.has(node.id) });
    if (node.children) node.children.forEach(c => collectNodes(c, pathIds, siblingIds, result));
    return result;
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function MerkleExplorer() {
    const [constituencies, setConstituencies]     = useState([]);
    const [selectedId, setSelectedId]             = useState('lahore');
    const [treeState, setTreeState]               = useState(null);
    const [nullifiers, setNullifiers]             = useState([]);
    const [cert, setCert]                         = useState(null);
    const [hoveredId, setHoveredId]               = useState(null);
    const [treeLoading, setTreeLoading]           = useState(false);

    // Leaf index from cert pathIndices (bit decomposition)
    const leafIndex = useMemo(() => {
        if (!cert) return null;
        return cert.pathIndices.reduce((acc, bit, i) => acc + bit * (1 << i), 0);
    }, [cert]);

    // Green: nodes on the proof path from leaf to root
    const pathIds = useMemo(() => {
        if (leafIndex === null) return new Set();
        return new Set([
            `n_0_${leafIndex}`,
            `n_1_${Math.floor(leafIndex / 2)}`,
            `n_2_${Math.floor(leafIndex / 4)}`,
            'root'
        ]);
    }, [leafIndex]);

    // Amber: sibling nodes (the merklePath elements the verifier needs)
    const siblingIds = useMemo(() => {
        if (leafIndex === null) return new Set();
        return new Set([
            `n_0_${leafIndex ^ 1}`,
            `n_1_${(Math.floor(leafIndex / 2)) ^ 1}`,
            `n_2_${(Math.floor(leafIndex / 4)) ^ 1}`
        ]);
    }, [leafIndex]);

    const fetchTree = useCallback(async (id) => {
        setTreeLoading(true);
        try {
            const r = await fetch(`${API_BASE}/tree-state?constituency=${id}`, {
                headers: { "ngrok-skip-browser-warning": "69420" }
            });
            setTreeState(await r.json());
        } catch (e) { console.error(e); }
        finally { setTreeLoading(false); }
    }, []);

    const fetchNullifiers = useCallback(async () => {
        try {
            const r = await fetch(`${API_BASE}/nullifiers?constituency=${selectedId}`, {
                headers: { "ngrok-skip-browser-warning": "69420" }
            });
            setNullifiers(await r.json());
        } catch (e) { console.error(e); }
    }, [selectedId]);

    useEffect(() => {
        fetch(`${API_BASE}/constituencies`, {
            headers: { "ngrok-skip-browser-warning": "69420" }
        })
            .then(r => r.json())
            .then(setConstituencies)
            .catch(console.error);
    }, []);

    useEffect(() => {
        fetchTree(selectedId);
        fetchNullifiers();
        const id = setInterval(fetchNullifiers, 3000);
        return () => clearInterval(id);
    }, [selectedId, fetchTree, fetchNullifiers]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                setCert(data);
                if (data.constituencyId) setSelectedId(data.constituencyId);
            } catch { alert("Invalid Certificate File!"); }
        };
        reader.readAsText(file);
    };

    // Find hovered node data for the tooltip
    const hoveredNode = useMemo(() => {
        if (!hoveredId || !treeState) return null;
        let found = null;
        walkTree(treeState.treeData, n => { if (n.id === hoveredId) found = n; });
        return found;
    }, [hoveredId, treeState]);

    const edges   = useMemo(() => treeState ? collectEdges(treeState.treeData, pathIds)                  : [], [treeState, pathIds]);
    const nodes   = useMemo(() => treeState ? collectNodes(treeState.treeData, pathIds, siblingIds)      : [], [treeState, pathIds, siblingIds]);

    // Verify the loaded cert's root matches the currently viewed tree
    const rootMismatch = cert && treeState && cert.merkleRoot !== treeState.merkleRoot;

    return (
        <section className="section-clay">
            <div className="container-clay">

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <span className="badge-clay" style={{ marginBottom: '16px' }}>MERKLE EXPLORER</span>
                    <h2 style={{ fontSize: '40px' }}>Visualize the Math</h2>
                    <p style={{ color: 'var(--body)', maxWidth: '580px', margin: '0 auto', fontSize: '18px' }}>
                        Explore each constituency's Merkle tree. Upload a certificate to watch the
                        zero-knowledge proof path light up in real time.
                    </p>
                </div>

                {/* Controls */}
                <div className="card-clay-product" style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Constituency
                            </label>
                            <select
                                value={selectedId}
                                onChange={e => { setSelectedId(e.target.value); setCert(null); }}
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
                                    <option key={c.id} value={c.id}>{c.name} — {c.voterCount} voters</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Highlight Path
                            </label>
                            <input type="file" id="explorer-cert" hidden onChange={handleFileUpload} accept=".json" />
                            <label htmlFor="explorer-cert" className="btn-clay btn-clay-secondary" style={{ cursor: 'pointer' }}>
                                {cert ? `✓ ${cert.voterName}` : 'Upload Certificate'}
                            </label>
                        </div>

                        {cert && (
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                {[
                                    { color: '#22c55e', label: 'Proof path' },
                                    { color: '#f59e0b', label: 'Merkle siblings' }
                                ].map(l => (
                                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: '13px' }}>{l.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {rootMismatch && (
                        <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px' }}>
                            ⚠️ The certificate's Merkle root doesn't match this constituency's tree.
                            Run <code>node issue_certs.js</code> in the backend to regenerate certificates.
                        </div>
                    )}
                </div>

                {/* Tree SVG */}
                <div className="card-clay-product" style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px' }}>
                            {treeState ? treeState.constituencyName : 'Loading…'} — Merkle Tree (depth 3, 8 slots)
                        </h3>
                        {treeState && (
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--muted)' }}>
                                Root: {truncHash(treeState.merkleRoot)}
                            </span>
                        )}
                    </div>

                    {treeLoading ? (
                        <div style={{ height: SVG_H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                            Building tree…
                        </div>
                    ) : treeState ? (
                        <div style={{ overflowX: 'auto' }}>
                            <svg
                                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                                width="100%"
                                style={{ minWidth: 600, display: 'block' }}
                                aria-label="Merkle tree diagram">

                                {/* Level guide lines + labels */}
                                {[3, 2, 1, 0].map(lv => (
                                    <g key={lv}>
                                        <line x1={0} y1={LEVEL_Y[lv]} x2={SVG_W} y2={LEVEL_Y[lv]}
                                            stroke="#1f2937" strokeWidth={1} strokeDasharray="4 6" />
                                        <text x={8} y={LABEL_Y[lv]} fontSize={11}
                                            fill={lv === 3 ? '#818cf8' : lv === 0 ? '#a78bfa' : '#38bdf8'}
                                            fontWeight={600}>
                                            {LEVEL_LABELS[lv]}
                                        </text>
                                    </g>
                                ))}

                                {/* Edges */}
                                {edges.map(e => (
                                    <line key={e.key}
                                        x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
                                        stroke={e.highlighted ? '#22c55e' : '#374151'}
                                        strokeWidth={e.highlighted ? 3 : 1.5}
                                    />
                                ))}

                                {/* Nodes */}
                                {nodes.map(n => {
                                    const { x, y } = nodePos(n.level, n.index);
                                    const { fill, stroke } = nodeColors(n.type, n.isPath, n.isSibling);
                                    const hovered = hoveredId === n.id;
                                    const r = hovered ? R + 5 : R;
                                    return (
                                        <g key={n.id}
                                            onMouseEnter={() => setHoveredId(n.id)}
                                            onMouseLeave={() => setHoveredId(null)}
                                            style={{ cursor: 'default' }}>
                                            <circle cx={x} cy={y} r={r}
                                                fill={fill} stroke={stroke} strokeWidth={2}
                                                style={{ transition: 'r 0.12s' }} />
                                            {/* Inner label */}
                                            {n.type === 'root' && (
                                                <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fill="white" fontWeight={700}>R</text>
                                            )}
                                            {n.type === 'empty' && (
                                                <text x={x} y={y + 4} textAnchor="middle" fontSize={13} fill="#4b5563">∅</text>
                                            )}
                                            {/* Voter name under leaf */}
                                            {n.type === 'leaf' && n.voterName && (
                                                <text x={x} y={y + R + 16} textAnchor="middle" fontSize={11} fill="#c4b5fd">
                                                    {n.voterName}
                                                </text>
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    ) : null}

                    {/* Hover tooltip */}
                    {hoveredNode && (
                        <div style={{
                            marginTop: '16px',
                            padding: '14px 18px',
                            borderRadius: '12px',
                            background: 'var(--surface-soft)',
                            border: '1px solid var(--hairline)',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            lineHeight: 1.7
                        }}>
                            <div><strong>Node</strong>  {hoveredNode.id}  (level {hoveredNode.level})</div>
                            {hoveredNode.voterName && <div><strong>Voter</strong>  {hoveredNode.voterName}</div>}
                            <div style={{ wordBreak: 'break-all' }}>
                                <strong>Hash</strong>&nbsp;&nbsp;
                                <span style={{ color: '#38bdf8' }}>
                                    {hoveredNode.hash && hoveredNode.hash !== '0'
                                        ? hoveredNode.hash
                                        : '0  (empty padding slot)'}
                                </span>
                            </div>
                            {pathIds.has(hoveredNode.id) && (
                                <div style={{ color: '#22c55e', marginTop: '4px' }}>✓ On this voter's proof path</div>
                            )}
                            {siblingIds.has(hoveredNode.id) && (
                                <div style={{ color: '#f59e0b', marginTop: '4px' }}>⟳ Merkle path element (sibling hash)</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom row: legend + nullifier feed */}
                <div className="grid-clay" style={{ gridTemplateColumns: '1fr 1fr' }}>

                    {/* How it works */}
                    <div className="card-clay-feature card-clay-feature-lavender">
                        <h3 style={{ marginBottom: '20px' }}>How Merkle Proofs Work</h3>
                        {[
                            { color: '#8b5cf6', label: 'Leaf',       desc: "Poseidon(voter's secret) — one per registered voter" },
                            { color: '#0ea5e9', label: 'Internal',   desc: 'Poseidon(left, right) — hashes bubble up the tree' },
                            { color: '#6366f1', label: 'Root',       desc: 'Single public anchor committed to by the server' },
                            { color: '#22c55e', label: 'Proof path', desc: 'The 3 nodes the ZK circuit reconstructs to reach the root' },
                            { color: '#f59e0b', label: 'Siblings',   desc: 'Hashes provided as hints so the circuit can hash upward' },
                            { color: '#1f2937', label: 'Empty slot',  desc: 'Padding — the tree always has 8 leaves (2³)' }
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ width: 13, height: 13, borderRadius: '50%', background: item.color, flexShrink: 0, marginTop: 3 }} />
                                <div style={{ fontSize: '14px' }}>
                                    <strong>{item.label}: </strong>
                                    <span style={{ opacity: 0.85, fontFamily: 'monospace', fontSize: '12px' }}>{item.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Live nullifier feed */}
                    <div className="card-clay-feature card-clay-feature-teal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Used Fingerprints</h3>
                            <span className="badge-clay" style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}>LIVE</span>
                        </div>
                        <p style={{ fontSize: '13px', opacity: 0.85, margin: 0 }}>
                            Each nullifier is <em>Poseidon(secret, 12345)</em>. Once recorded, that voter
                            cannot vote again — without revealing who they are.
                        </p>
                        <div style={{
                            background: 'rgba(0,0,0,0.25)',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            maxHeight: '240px',
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            flex: 1
                        }}>
                            {nullifiers.length === 0 ? (
                                <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '24px 0' }}>
                                    No votes cast yet in this constituency
                                </div>
                            ) : nullifiers.map((n, i) => (
                                <div key={i} style={{
                                    padding: '5px 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                                    wordBreak: 'break-all',
                                    color: '#86efac'
                                }}>
                                    <span style={{ opacity: 0.5, marginRight: '8px' }}>#{i + 1}</span>
                                    {n.hash}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
