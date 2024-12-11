// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Multicall } from "@openzeppelin/contracts/utils/Multicall.sol";

contract TokenMaster is AccessControl, ReentrancyGuard, Pausable, Multicall {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    address public authorizedSigner;
    ERC20 public token;
    address public treasury;
    mapping(bytes16 => bool) public claimed;
    mapping(address => uint256) public nonces;

    event TokenPayOut(address indexed walletAddress, bytes16 indexed claimId, uint256 amount);

    constructor(address _authorizedSigner, address _treasury, ERC20 _token) {
        require(_authorizedSigner != address(0), "Invalid signer address");
        require(address(_token) != address(0), "Invalid token address");
        require(address(_treasury) != address(0), "Invalid treasury address");

        token = _token;
        authorizedSigner = _authorizedSigner;
    }

    function setTreasury(address _treasury) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(_treasury) != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    function getMessageHash(
        bytes16 _claimId,
        address _receiver,
        uint256 _amount,
        uint256 _nonce
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(_claimId, _receiver, _amount, block.chainid, address(this), _nonce));
    }

    receive() external payable {}

    fallback() external payable {}

    function _verifySignature(bytes32 data, bytes memory signature) internal view returns (bool) {
        return data.toEthSignedMessageHash().recover(signature) == authorizedSigner;
    }

    function claimToken(bytes16 claimId, uint256 amount, bytes memory signature) public whenNotPaused nonReentrant {
        address receiver = msg.sender;
        bytes32 message = getMessageHash(claimId, receiver, amount, nonces[receiver]);

        require(_verifySignature(message, signature), "Invalid signature");
        require(!claimed[claimId], "Token already issued");

        claimed[claimId] = true;
        nonces[receiver]++;

        bool success = token.transferFrom(treasury, receiver, amount);
        require(success, "Failed to send Token");

        emit TokenPayOut(receiver, claimId, amount);
    }
}
