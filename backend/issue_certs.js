const { buildPoseidon } = require("circomlibjs");
const fs = require("fs");

const constituencyConfig = JSON.parse(fs.readFileSync("constituency_config.json"));

async function run() {
    const poseidon = await buildPoseidon();
    const F = poseidon.F;
    const hash2 = (a, b) => F.toObject(poseidon([a, b]));
    const hash1 = (a) => F.toObject(poseidon([a]));

    const allCerts = {};

    for (const constituency of constituencyConfig.constituencies) {
        console.log(`\n🏛️  Building tree for ${constituency.name}...`);

        const secrets = constituency.voters.map(v => v.secret);
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

        console.log(`   Root: ${root.toString()}`);

        const voters = constituency.voters.map((voter, idx) => {
            const pathIndices = [idx & 1, (idx >> 1) & 1, (idx >> 2) & 1];

            const cert = {
                voterName: voter.voterName,
                constituencyId: constituency.id,
                constituencyName: constituency.name,
                secret: voter.secret,
                nullifierHash: hash2(BigInt(voter.secret), 12345n).toString(),
                merklePath: [
                    level0[idx ^ 1].toString(),
                    level1[(idx >> 1) ^ 1].toString(),
                    level2[(idx >> 2) ^ 1].toString()
                ],
                pathIndices,
                merkleRoot: root.toString()
            };

            const fileName = `${constituency.id}_citizen_${String(idx + 1).padStart(2, '0')}.json`;
            fs.writeFileSync(fileName, JSON.stringify(cert, null, 2));
            console.log(`   ✅ ${fileName}`);

            return cert;
        });

        allCerts[constituency.id] = {
            constituencyId: constituency.id,
            constituencyName: constituency.name,
            merkleRoot: root.toString(),
            voters
        };
    }

    fs.writeFileSync("all_certs.json", JSON.stringify(allCerts, null, 2));
    console.log("\n✅ All constituency certificates generated!");
    console.log("📂 Individual certs: <id>_citizen_XX.json  (upload these to vote)");
    console.log("📂 Master registry:  all_certs.json");
}

run();
