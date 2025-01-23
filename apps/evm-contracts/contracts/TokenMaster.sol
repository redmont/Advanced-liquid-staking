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
    mapping(bytes16 claimId => bool claimed) public claimed;
    mapping(address addr => uint256 nonce) public nonces;

    event TokenPayOut(address indexed walletAddress, bytes16 indexed claimId, uint256 amount);

    error InvalidSignerAddress();
    error InvalidTreasuryAddress();
    error InvalidTokenAddress();
    error InvalidSignature();
    error TokenAlreadyIssued();
    error InsufficientAllowance();
    error FailedToSendToken();

    constructor(address _authorizedSigner, address _treasury, ERC20 _token) {
        if (_authorizedSigner != address(0)) {
            revert InvalidSignerAddress();
        }

        if (address(_treasury) == address(0)) {
            revert InvalidTreasuryAddress();
        }

        if (address(_token) == address(0)) {
            revert InvalidTokenAddress();
        }

        authorizedSigner = _authorizedSigner;
        token = _token;
        treasury = _treasury;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setTreasury(address _treasury) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (address(_treasury) == address(0)) {
            revert InvalidTreasuryAddress();
        }

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

        if (!_verifySignature(message, signature)) {
            revert InvalidSignature();
        }

        if (claimed[claimId]) {
            revert TokenAlreadyIssued();
        }

        if (token.allowance(treasury, address(this)) < amount) {
            revert InsufficientAllowance();
        }

        claimed[claimId] = true;
        nonces[receiver]++;

        bool success = token.transferFrom(treasury, receiver, amount);
        if (!success) {
            revert FailedToSendToken();
        }

        emit TokenPayOut(receiver, claimId, amount);
    }
}
