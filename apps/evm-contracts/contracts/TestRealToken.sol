// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract TestRealToken is ERC20, Ownable {
    constructor() ERC20("Test Real World Token", "TREAL") Ownable(_msgSender()) {}

    function mint(uint256 amount) public {
        _mint(_msgSender(), amount);
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
