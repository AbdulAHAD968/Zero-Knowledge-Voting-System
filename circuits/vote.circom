pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template Verifier(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal input root;

    component hashes[levels];
    signal currentHash[levels + 1];

    currentHash[0] <== leaf;

    for (var i = 0; i < levels; i++) {
        hashes[i] = Poseidon(2);
        // If index is 0, currentHash is left. If index is 1, currentHash is right.
        hashes[i].inputs[0] <== currentHash[i] + pathIndices[i] * (pathElements[i] - currentHash[i]);
        hashes[i].inputs[1] <== pathElements[i] + pathIndices[i] * (currentHash[i] - pathElements[i]);
        currentHash[i+1] <== hashes[i].out;
    }

    root === currentHash[levels];
}

template Vote() {
    // Private Inputs (Stay on phone)
    signal input secret;
    signal input pathElements[3]; // <--- MUST BE 3
    signal input pathIndices[3];  // <--- MUST BE 3

    // Public Inputs (Seen by server)
    signal input merkleRoot;
    signal input vote;
    signal input nullifierHash;

    // 1. Verify Identity (Secret -> Leaf)
    component leafHasher = Poseidon(1);
    leafHasher.inputs[0] <== secret;

    // 2. Verify Membership in Merkle Tree
    component treeVerifier = Verifier(3); // <--- MUST BE 3
    treeVerifier.leaf <== leafHasher.out;
    treeVerifier.root <== merkleRoot;
    for (var i = 0; i < 3; i++) {
        treeVerifier.pathElements[i] <== pathElements[i];
        treeVerifier.pathIndices[i] <== pathIndices[i];
    }

    // 3. Verify Nullifier (Prevents double voting)
    component nullHasher = Poseidon(2);
    nullHasher.inputs[0] <== secret;
    nullHasher.inputs[1] <== 12345; // Constant salt
    nullifierHash === nullHasher.out;

    // 4. Output the vote (Publicly visible)
    signal output voteOut;
    voteOut <== vote;
}

component main {public [merkleRoot, vote, nullifierHash]} = Vote();
