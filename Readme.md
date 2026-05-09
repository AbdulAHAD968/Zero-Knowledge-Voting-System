# SecureZK: Sovereign Zero-Knowledge Voting Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![ZK-SNARKS](https://img.shields.io/badge/Cryptography-ZK--SNARKs-blueviolet)](https://snarkjs.herokuapp.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)](https://www.mongodb.com/)

**SecureZK** is an industrial-grade, privacy-preserving digital voting system. It utilizes **ZK-SNARKs (Groth16)** to solve the fundamental paradox of electronic voting: ensuring only registered voters can vote, exactly once, without ever revealing who voted for whom.

![Landing Page](docs/1.png)

---

## 🔒 The Paradox of Privacy
Traditional voting systems rely on a "Trusted Authority" to keep voter identities separate from their ballots. SecureZK eliminates this single point of failure using mathematical proofs.

- **Anonymity**: Your identity is never transmitted. Only a cryptographic proof of eligibility reaches the server.
- **Integrity**: Every vote is mathematically tied to a registered constituency's Merkle Root.
- **Double-Vote Protection**: A unique "Nullifier" fingerprint is derived from your secret, ensuring one person = one vote, without linking it back to your name.

---

## 🚀 Key Features

### 1. Anonymous Proving
Voters generate a **Groth16 ZK-Proof** locally in their browser. The private secret never leaves their device. The server only receives the "YES/NO" answer to the question: *"Are you a registered voter who hasn't voted yet?"*

![Voting Console](docs/2.png)

### 2. Merkle Tree Visualization
Explore the constituency's cryptographic structure in real-time. Watch the Merkle path light up as you verify your certificate.
- **Dynamic Roots**: Each city (Lahore, Karachi, Islamabad) maintains its own independent Merkle tree.
- **Live Nullifier Feed**: Transparently track used fingerprints to ensure election integrity.

![Merkle Explorer](docs/3.png)

### 3. Multi-Constituency Isolation
The system handles multiple voting regions simultaneously. A voter registered in Lahore cannot cast a ballot in the Karachi constituency, as the server validates the embedded Merkle Root against the official registry.

---

## 🛠️ Technology Stack
- **Cryptography**: Circom 2.1, SnarkJS (Groth16)
- **Hashing**: Poseidon (Optimized for ZK circuits)
- **Frontend**: React.js, SnarkJS-WASM
- **Backend**: Node.js, Express, MongoDB (Dockerized)
- **Styling**: Vanilla CSS (Premium Clay-inspired design)

---

## 🚦 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **Docker** (for MongoDB)
- **Git**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/AbdulAHAD968/Zero-Knowledge-Voting-System.git
cd Zero-Knowledge-Voting-System

# Install all dependencies
npm run install:all
```

### 3. Launch the Platform
```bash
# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo

# Generate voter certificates (24 unique identities)
cd backend
node issue_certs.js

# Start the full stack
cd ..
npm run dev
```

---

## 📂 Project Structure
```text
├── circuits/           # Circom source code and ZK artifacts (.zkey, .wasm)
├── backend/            # Express verifier node and certificate issuer
├── frontend/           # React application and ZK-prover integration
├── certs/              # Sample voter certificates for testing
└── docs/               # Visual documentation assets
```

---

## 📜 Security Model
| Threat | Mitigation Strategy |
| :--- | :--- |
| **Identity Leak** | Private secrets are processed via Poseidon hashing; only proofs are shared. |
| **Double Voting** | Nullifiers are stored in MongoDB; duplicates are rejected instantly. |
| **Fake Registration** | Every proof must match the official constituency Merkle Root. |
| **Data Tampering** | Circuits are mathematically bound to the R1CS constraint system. |

---

## 🤝 Contributing
We welcome contributions to our ZK-circuits and security protocols. Please open an issue or submit a pull request.

**License**: Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ by the SecureZK Team.*
