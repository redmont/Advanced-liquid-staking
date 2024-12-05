import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export interface Proof {
  address: `0x${string}`;
  proof: string[];
}

export const generateEpochMerkleTree = (voterAddresses: string[]) => {
  const leaves = voterAddresses.map((address) => [address]);

  const tree = StandardMerkleTree.of(leaves, ["address"]);

  const { root } = tree;
  const proofs = [];

  for (const [i, [address]] of tree.entries()) {
    if (!address) {
      continue;
    }

    proofs.push({
      address: address as `0x${string}`,
      proof: tree.getProof(i) as `0x${string}`[],
    } as Proof);
  }

  return {
    root: root as `0x${string}`,
    proofs,
  } as const;
};
