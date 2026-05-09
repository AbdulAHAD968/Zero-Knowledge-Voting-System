const express = require('express');
const mongoose = require('mongoose');
const snarkjs = require('snarkjs');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { buildPoseidon } = require('circomlibjs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// DATABASE
mongoose.connect('mongodb://127.0.0.1:27017/zkVoting')
    .then(() => console.log("✅ Connected to MongoDB via Docker"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const Nullifier = mongoose.model('Nullifier', new mongoose.Schema({
    hash: { type: String, unique: true },
    constituency: { type: String, default: 'lahore' }
}));

const Ballot = mongoose.model('Ballot', new mongoose.Schema({
    candidate: String,
    constituency: { type: String, default: 'lahore' }
}));

// LOAD STATIC KEYS
const vKey = JSON.parse(fs.readFileSync("../circuits/verification_key.json"));
const constituencyConfig = JSON.parse(fs.readFileSync("constituency_config.json"));

// In-memory store of all computed constituency trees
const constituencyTrees = {};

// Builds the hierarchical tree object needed by the frontend SVG renderer.
// Nodes carry: id, hash, type, level, index, voterName (leaves only), children.
function buildHierarchy(levels, voterMap) {
    const { level0, level1, level2, root } = levels;

    function buildNode(levelIdx, nodeIdx) {
        if (levelIdx === 0) {
            return {
                id: `n_0_${nodeIdx}`,
                hash: level0[nodeIdx],
                type: voterMap[nodeIdx] ? 'leaf' : 'empty',
                level: 0,
                index: nodeIdx,
                voterName: voterMap[nodeIdx] || null
            };
        }
        const levelData = levelIdx === 1 ? level1 : level2;
        return {
            id: `n_${levelIdx}_${nodeIdx}`,
            hash: levelData[nodeIdx],
            type: 'internal',
            level: levelIdx,
            index: nodeIdx,
            children: [buildNode(levelIdx - 1, nodeIdx * 2), buildNode(levelIdx - 1, nodeIdx * 2 + 1)]
        };
    }

    return {
        id: 'root',
        hash: root,
        type: 'root',
        level: 3,
        index: 0,
        children: [buildNode(2, 0), buildNode(2, 1)]
    };
}

async function buildConstituencyTrees() {
    const poseidon = await buildPoseidon();
    const F = poseidon.F;
    const hash2 = (a, b) => F.toObject(poseidon([a, b]));
    const hash1 = (a) => F.toObject(poseidon([a]));

    for (const constituency of constituencyConfig.constituencies) {
        const secrets = constituency.voters.map(v => v.secret);

        // 8-slot tree (depth 3)
        const nodes = new Array(8).fill(0n);
        for (let i = 0; i < Math.min(secrets.length, 8); i++) {
            nodes[i] = hash1(BigInt(secrets[i]));
        }

        const level0 = [...nodes];
        const level1 = [];
        for (let i = 0; i < 8; i += 2) level1.push(hash2(level0[i], level0[i + 1]));
        const level2 = [];
        for (let i = 0; i < 4; i += 2) level2.push(hash2(level1[i], level1[i + 1]));
        const root = hash2(level2[0], level2[1]);

        const levels = {
            level0: level0.map(n => n.toString()),
            level1: level1.map(n => n.toString()),
            level2: level2.map(n => n.toString()),
            root: root.toString()
        };

        // voterName lookup by leaf index
        const voterMap = {};
        const voters = constituency.voters.map((voter, idx) => {
            voterMap[idx] = voter.voterName;
            return {
                voterName: voter.voterName,
                leafIndex: idx,
                nullifierHash: hash2(BigInt(voter.secret), 12345n).toString(),
                pathIndices: [idx & 1, (idx >> 1) & 1, (idx >> 2) & 1],
                constituencyId: constituency.id
            };
        });

        constituencyTrees[constituency.id] = {
            id: constituency.id,
            name: constituency.name,
            root: root.toString(),
            levels,
            voters,
            treeData: buildHierarchy(levels, voterMap)
        };

        console.log(`   ✅ ${constituency.name}: root ${root.toString().substring(0, 20)}...`);
    }
}

// API ROUTES

app.get('/constituencies', (req, res) => {
    res.json(Object.values(constituencyTrees).map(c => ({
        id: c.id,
        name: c.name,
        root: c.root,
        voterCount: c.voters.length
    })));
});

// Returns the full Merkle tree structure for visualization.
app.get('/tree-state', (req, res) => {
    const { constituency = 'lahore' } = req.query;
    const tree = constituencyTrees[constituency];
    if (!tree) return res.status(404).json({ error: `Constituency '${constituency}' not found` });

    res.json({
        constituency: tree.id,
        constituencyName: tree.name,
        merkleRoot: tree.root,
        treeData: tree.treeData,
        voters: tree.voters
    });
});

// Returns the most recent nullifier hashes (used voter fingerprints) for the live feed.
app.get('/nullifiers', async (req, res) => {
    try {
        const { constituency } = req.query;
        const query = constituency ? { constituency } : {};
        const docs = await Nullifier.find(query).sort({ _id: -1 }).limit(20);
        res.json(docs.map(n => ({ hash: n.hash, constituency: n.constituency })));
    } catch {
        res.status(500).json({ error: "Could not fetch nullifiers." });
    }
});

app.post('/verify-vote', async (req, res) => {
    try {
        const { proof, publicSignals, candidate, constituency = 'lahore' } = req.body;

        // Signal order from Groth16: [0]=voteOut (output), [1]=merkleRoot, [2]=vote, [3]=nullifierHash
        const claimedRoot = publicSignals[1];
        const nullifierHash = publicSignals[3];

        // Constituency root check — prevents fake trees
        const tree = constituencyTrees[constituency];
        if (!tree) {
            return res.status(400).json({ error: `Unknown constituency: ${constituency}` });
        }
        if (claimedRoot !== tree.root) {
            return res.status(400).json({ error: "Merkle root does not match official constituency registry!" });
        }

        // Double-vote check
        const existing = await Nullifier.findOne({ hash: nullifierHash });
        if (existing) {
            return res.status(400).json({ error: "Identity already used. Double-voting blocked!" });
        }

        // ZK-SNARK cryptographic verification
        const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

        if (isValid) {
            await new Nullifier({ hash: nullifierHash, constituency }).save();
            await new Ballot({ candidate, constituency }).save();
            console.log(`✅ Valid ZK-Proof! Vote for ${candidate} in ${constituency}`);
            res.json({ success: true });
        } else {
            console.log("❌ Invalid ZK-Proof.");
            res.status(400).json({ error: "Cryptographic verification failed." });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: "Server error during verification." });
    }
});

app.get('/results', async (req, res) => {
    try {
        const { constituency } = req.query;
        const pipeline = [
            ...(constituency ? [{ $match: { constituency } }] : []),
            { $group: { _id: "$candidate", count: { $sum: 1 } } }
        ];
        res.json(await Ballot.aggregate(pipeline));
    } catch {
        res.status(500).json({ error: "Could not fetch results." });
    }
});

app.use((req, res) => {
    const indexPath = path.join(__dirname, 'build', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        // No production build present — frontend dev server is handling the UI
        res.status(404).json({ message: 'API-only mode: frontend is served by the dev server on port 3000.' });
    }
});

async function initServer() {
    console.log("🔧 Building constituency Merkle trees...");
    await buildConstituencyTrees();
    const PORT = 5000;
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Verifier Node live at Port ${PORT}`);
        console.log(`🌍 Public Tunnel: https://unbundle-antiviral-dotted.ngrok-free.dev`);
    });
}

initServer();
