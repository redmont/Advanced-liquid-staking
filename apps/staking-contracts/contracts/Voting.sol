// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    mapping(uint256 epoch => bytes32 root) public epochMerkleRoots;

    event MerkleRootSet(uint256 indexed epoch, bytes32 merkleRoot);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setMerkleRoot(uint256 epoch, bytes32 merkleRoot) external onlyOwner {
        epochMerkleRoots[epoch] = merkleRoot;
        emit MerkleRootSet(epoch, merkleRoot);
    }

    function hasVoted(uint256 epoch, address user, bytes32[] calldata merkleProof) public view returns (bool) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(user))));
        return MerkleProof.verify(merkleProof, epochMerkleRoots[epoch], leaf);
    }
}
