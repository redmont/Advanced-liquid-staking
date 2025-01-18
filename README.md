<h1>Advanced Liquid Staking Protocol</h1>

I wrote this ERC20-based liquid staking contract built in Solidity for Real World Gaming(RWG) "Realbet" Platform.

This project demonstrates production-ready staking architecture designed to reward long-term holders and active governance participants.

Mainnet Deployment: 
[0x25b8176566c2f762820ef6eddf3fc58b23dcb8b6](https://etherscan.io/address/0x25b8176566c2f762820ef6eddf3fc58b23dcb8b6#code#F1#L1)

Audit Report:
[https://staging.vip.realworldgaming.io/$REAL_Zokyo_audit_report_Jan27th_2025.pdf](https://staging.vip.realworldgaming.io/$REAL_Zokyo_audit_report_Jan27th_2025.pdf)

<h3>Key Features</h3>

- <b>Liquid Staking</b>: Stakers receive an ERC20 token (sREAL) representing their staked position, allowing them to utilize their capital elsewhere in DeFi while still earning rewards.

- <b>Tiered Staking System</b>: Multiple tiers with different lock-up periods and reward multipliers, incentivizing long-term commitment.

- <b>Epoch-Based Rewards</b>: Rewards are calculated and distributed on a per-epoch basis, a common pattern in robust DeFi protocols.

- <b>Vote-Coupled Rewards</b>: Integrates a voting mechanism where users must participate in governance to claim their rewards for a given epoch, preventing passive farming and encouraging active participation.

- <b>Role-Based Access Control</b>: Utilizes OpenZeppelin's AccessControl for granular permissions (e.g., EPOCH_MANAGER_ROLE, DEFAULT_ADMIN_ROLE).

- <b>Pausable & Secure</b>: Implements Pausable for emergency stops and ReentrancyGuard to prevent common attack vectors.

<h2>Architectural Overview:</h2>

The system is centered around the TokenStaking contract which inherits from ERC20 to create the liquid sREAL token. Users stake their $REAL tokens and are minted $sREAL. Rewards are calculated based on their "effective amount" (stake amount * tier multiplier) as a proportion of the total effective supply for each epoch in which they actively voted.

<h2>Running Locally & Testing</h2>

```
npm install
npx hardhat test
```
