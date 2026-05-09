# SecureZK: Sovereign Zero-Knowledge Voting Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![ZK-SNARKS](https://img.shields.io/badge/Cryptography-ZK--SNARKs-blueviolet)](https://snarkjs.herokuapp.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)](https://www.mongodb.com/)

SecureZK is an industrial-grade, privacy-preserving digital voting system. It utilizes ZK-SNARKs (Groth16) to solve the fundamental paradox of electronic voting: ensuring only registered voters can vote, exactly once, without ever revealing who voted for whom.

![Landing Page](docs/1.png)

---

## The Problem
Every digital voting system faces the same tension: to prevent fraud, the server must know who voted, but knowing who voted destroys anonymity. Traditional systems resolve this by trusting a central authority to keep the two pieces of information separate. That trust is the attack surface.

This project eliminates the need for that trust entirely using zero-knowledge cryptography.

---

## How It Works

### The Core Idea
A voter's identity is represented as a leaf in a Merkle tree. To vote, the voter generates a ZK proof that says:

> "I know a secret that hashes to a leaf inside this tree, and here is a unique fingerprint derived from that secret -- but I will not tell you which leaf I am."

The server learns:
- The voter is registered (the proof is valid against the official Merkle root)
- The voter has not voted before (the nullifier is fresh)
- The vote value

### Step-by-Step Flow
```text
Voter's Device                          Server (Port 5000)

1. Load certificate (JSON)
   - secret (private)
   - merklePath[3] (private)
   - pathIndices[3] (private)
   - merkleRoot (public)

2. Select constituency + candidate

3. Generate Groth16 proof (in-browser WASM)
   - Hash secret via Poseidon(1)     -> leaf
   - Reconstruct root via path       -> must match merkleRoot
   - Hash (secret, 12345)            -> nullifierHash
   - Proof generated locally; secret never transmitted

4. POST /verify-vote
   { proof, publicSignals, candidate, constituency }
                                      5. Check nullifierHash not in DB
                                         -> reject if seen before

                                      6. Verify Groth16 proof against
                                         verification_key.json
                                         -> reject if invalid

                                      7. Validate publicSignals[1]
                                         (merkleRoot) matches the
                                         official root for the claimed
                                         constituency
                                         -> reject if mismatched

                                      8. Save nullifier + ballot to MongoDB
                                         -> return { success: true }
```

![Voting Console](docs/2.png)

---

## Architecture & Project Structure

```text
zK-Voting-System/
|
|-- circuits/                   ZK circuit source and compiled artifacts
|   |-- vote.circom             Circuit logic (Circom 2.0)
|   |-- vote.r1cs               Compiled constraint system (R1CS format)
|   |-- vote.sym                Debug symbol table
|   |-- verification_key.json   Public key used by server to verify proofs
|   |-- vote_js/                Browser-side witness calculator
|   |   |-- vote.wasm           Compiled circuit (WebAssembly)
|   |   |-- witness_calculator.js
|
|-- backend/
|   |-- server.js               Express API, Merkle tree builder, ZK verifier
|   |-- issue_certs.js          Generates constituency trees and voter certificates
|   |-- verification_key.json   Copy of circuits/verification_key.json
|
|-- frontend/
|   |-- src/
|   |   |-- App.js              Root router
|   |   |-- pages/
|   |   |   |-- Home.js         Voting page: cert upload, proof generation, results
|   |   |   |-- MerkleExplorer.js   Visual tree dashboard, live nullifier feed
|   |-- public/
|   |   |-- zk-assets/
|   |   |   |-- vote.wasm       Circuit compiled to WASM (copy from circuits/)
|   |   |   |-- vote_0001.zkey  Proving key (from trusted setup)
|
|-- docs/                       Visual assets and screenshots
```

---

## The Cryptographic Core (/circuits)

In ZK-SNARKs, a "circuit" is a program expressed as a system of arithmetic constraints. vote.circom wires together three checks into a single provable statement:

| Step | Operation | Purpose |
|------|-----------|---------|
| 1 | leaf = Poseidon(secret) | Derives the voter's leaf from their private secret |
| 2 | Verifier(3) | Proves the leaf exists in the official Merkle tree |
| 3 | nullifierHash === Poseidon(secret, 12345) | Binds the double-vote fingerprint to the same secret |
| 4 | voteOut <== vote | Passes the vote choice as a public output |

### Why you cannot change the circuit without recompiling
verification_key.json and vote_0001.zkey are mathematically bound to the exact constraint system in vote.r1cs. Changing one line of vote.circom produces a different R1CS, which invalidates all existing keys. This ensures that no one can silently alter the voting logic once the keys are generated.

---

## Merkle Explorer
A visual dashboard at /explorer that renders the full tree for any constituency as an SVG pyramid. Upload a certificate to highlight the proof path in green.

![Merkle Explorer](docs/3.png)

---

## Setup & Installation

### 1. Prerequisites
- Node.js v20+
- Docker (for MongoDB)
- npm

### 2. Install all dependencies
```bash
npm run install:all
```

### 3. Start MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### 4. Generate voter certificates
```bash
cd backend
node issue_certs.js
```
This creates 24 unique identity files (8 per constituency) in the certs/ folder.

### 5. Start the full stack
```bash
cd ..
npm run dev
```
Frontend: http://localhost:3000 | Backend API: http://localhost:5000

---

## Security Model
| Threat | Mitigation |
|--------|-----------|
| Server learns voter identity | Server only sees nullifier hash and proof, never the secret or leaf index |
| Voter votes twice | Nullifier stored after first vote; duplicate rejected before proof verification |
| Voter forges membership | Invalid Merkle path produces wrong root; Groth16 verification fails |
| Constituency Crossing | Server checks publicSignals[1] against the official root for the claimed constituency |

---

## Recompiling the Circuit
Only needed if vote.circom is modified.
```bash
cd circuits
# Requires Circom compiler
circom vote.circom --wasm --r1cs --sym
snarkjs groth16 setup vote.r1cs pot12_final.ptau vote_0000.zkey
snarkjs zkey contribute vote_0000.zkey vote_0001.zkey --name="contributor"
snarkjs zkey export verificationkey vote_0001.zkey verification_key.json
```

---

*Built for democratic integrity and cryptographic privacy.*
