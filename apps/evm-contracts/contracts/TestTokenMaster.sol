// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import { TokenMaster } from "./TokenMaster.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestTokenMaster is TokenMaster {
    constructor(
        address _authorizedSigner,
        address _treasury,
        ERC20 _token
    ) TokenMaster(_authorizedSigner, _treasury, _token) {}

    function setNonce(address _receiver, uint256 _nonce) public onlyRole(DEFAULT_ADMIN_ROLE) {
        nonces[_receiver] = _nonce;
    }

    function resetClaimed(bytes16 claimId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        claimed[claimId] = false;
    }
}
