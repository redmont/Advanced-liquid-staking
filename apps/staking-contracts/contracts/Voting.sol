// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { TokenStakingRoles } from "./TokenStakingRoles.sol";

contract Voting is TokenStakingRoles {
    mapping(uint256 epoch => bytes32 root) public epochMerkleRoots;

    event MerkleRootSet(uint256 indexed epoch, bytes32 merkleRoot);

    constructor(address initialOwner) AccessControl() {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
    }

    function setMerkleRoot(uint256 epoch, bytes32 merkleRoot) external onlyRole(EPOCH_MANAGER_ROLE) {
        epochMerkleRoots[epoch] = merkleRoot;
        emit MerkleRootSet(epoch, merkleRoot);
    }

    function hasVoted(uint256 epoch, address user, bytes32[] calldata merkleProof) public view returns (bool) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(user))));
        return MerkleProof.verify(merkleProof, epochMerkleRoots[epoch], leaf);
    }
}
