// contracts/MockTokenStaking.sol
// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.20;

import "./TokenStaking.sol";

/**
 * @title MockTokenStaking
 * WARNING: use only for testing and debugging purpose
 */
contract MockTokenStaking is TokenStaking {
    uint256 mockTime = 0;

    constructor(address token_, uint256 _epochDuration) TokenStaking(token_, _epochDuration) {}

    function setCurrentTime(uint256 _time) external {
        mockTime = _time;
    }

    function getCurrentTime() internal view virtual override returns (uint256) {
        return mockTime;
    }
}
