import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TestStakingVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const testStakingVaultAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AmountRequired' },
  {
    type: 'error',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'available', internalType: 'uint256', type: 'uint256' },
      { name: 'required', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  { type: 'error', inputs: [], name: 'InsufficientBalance' },
  { type: 'error', inputs: [], name: 'InvalidAddress' },
  { type: 'error', inputs: [], name: 'InvalidTier' },
  { type: 'error', inputs: [], name: 'LockupTimeMustBeGreaterThanZero' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'TransferFailed' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint64',
        type: 'uint64',
        indexed: true,
      },
    ],
    name: 'AccountDeposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint64',
        type: 'uint64',
        indexed: true,
      },
    ],
    name: 'AccountWithdrawal',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'function',
    inputs: [],
    name: 'TOKEN',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'claimableEarnings',
    outputs: [{ name: 'claimable', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
      { name: 'tier', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'deposits',
    outputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'timestamp', internalType: 'uint64', type: 'uint64' },
      { name: 'unlockTime', internalType: 'uint64', type: 'uint64' },
      {
        name: 'tier',
        internalType: 'struct StakingVault.Tier',
        type: 'tuple',
        components: [
          { name: 'lockupTime', internalType: 'uint64', type: 'uint64' },
          { name: 'multiplier', internalType: 'uint32', type: 'uint32' },
          { name: 'multiplierDecimals', internalType: 'uint8', type: 'uint8' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'getDeposits',
    outputs: [
      {
        name: '',
        internalType: 'struct StakingVault.Deposit[]',
        type: 'tuple[]',
        components: [
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'timestamp', internalType: 'uint64', type: 'uint64' },
          { name: 'unlockTime', internalType: 'uint64', type: 'uint64' },
          {
            name: 'tier',
            internalType: 'struct StakingVault.Tier',
            type: 'tuple',
            components: [
              { name: 'lockupTime', internalType: 'uint64', type: 'uint64' },
              { name: 'multiplier', internalType: 'uint32', type: 'uint32' },
              {
                name: 'multiplierDecimals',
                internalType: 'uint8',
                type: 'uint8',
              },
            ],
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTiers',
    outputs: [
      {
        name: '',
        internalType: 'struct StakingVault.Tier[]',
        type: 'tuple[]',
        components: [
          { name: 'lockupTime', internalType: 'uint64', type: 'uint64' },
          { name: 'multiplier', internalType: 'uint32', type: 'uint32' },
          { name: 'multiplierDecimals', internalType: 'uint8', type: 'uint8' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalShares',
    outputs: [
      { name: '_totalShares', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tierId', internalType: 'uint256', type: 'uint256' },
      { name: 'lockupTime', internalType: 'uint64', type: 'uint64' },
      { name: 'multiplier', internalType: 'uint32', type: 'uint32' },
      { name: 'multiplierDecimals', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'setTier',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'shares',
    outputs: [
      { name: 'totalShares', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'sharesPerUser',
    outputs: [
      { name: '', internalType: 'address[]', type: 'address[]' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'tiers',
    outputs: [
      { name: 'lockupTime', internalType: 'uint64', type: 'uint64' },
      { name: 'multiplier', internalType: 'uint32', type: 'uint32' },
      { name: 'multiplierDecimals', internalType: 'uint8', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'totalUsers',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const testStakingVaultAddress = {
  11155111: '0x274608045cD704A291bFF9d79453D98C4E78baA4',
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const testStakingVaultConfig = {
  address: testStakingVaultAddress,
  abi: testStakingVaultAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TestToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const testTokenAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const testTokenAddress = {
  11155111: '0x77b8aD2325dDCC403e167ac238b15ed194ceCF71',
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const testTokenConfig = {
  address: testTokenAddress,
  abi: testTokenAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TokenMaster
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const tokenMasterAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_authorizedSigner', internalType: 'address', type: 'address' },
      { name: '_token', internalType: 'contract ERC20', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'walletAddress',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receiptId',
        internalType: 'bytes16',
        type: 'bytes16',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokenPayOut',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  { type: 'fallback', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'authorizedSigner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'receiptId', internalType: 'bytes16', type: 'bytes16' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'claimToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes16', type: 'bytes16' }],
    name: 'claimed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_receiptId', internalType: 'bytes16', type: 'bytes16' },
      { name: '_receiver', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
      { name: '_nonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getMessageHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'contract ERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address payable', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const tokenMasterAddress = {
  11155111: '0x642875E3b07Eaf23629b3f4C32c2E514305F203e',
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const tokenMasterConfig = {
  address: tokenMasterAddress,
  abi: tokenMasterAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TokenStaking
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const tokenStakingAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: '_epochDuration', internalType: 'uint256', type: 'uint256' },
      {
        name: '_tiers',
        internalType: 'struct TokenStaking.Tier[]',
        type: 'tuple[]',
        components: [
          { name: 'lockPeriod', internalType: 'uint256', type: 'uint256' },
          { name: 'multiplier', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'CannotSetRewardForPastEpochs' },
  { type: 'error', inputs: [], name: 'CannotStakeZeroAmount' },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  { type: 'error', inputs: [], name: 'EpochDurationMustBeGreaterThanZero' },
  { type: 'error', inputs: [], name: 'InvalidEpoch' },
  { type: 'error', inputs: [], name: 'InvalidStakeIndex' },
  { type: 'error', inputs: [], name: 'InvalidTierIndex' },
  { type: 'error', inputs: [], name: 'LockPeriodNotEnded' },
  { type: 'error', inputs: [], name: 'MultiplierMustBeGreaterThanZero' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'RewardTransferFailed' },
  { type: 'error', inputs: [], name: 'StakeTransferFailed' },
  { type: 'error', inputs: [], name: 'TransferNotAllowed' },
  { type: 'error', inputs: [], name: 'UnstakeTransferFailed' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'epoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'merkleRoot',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'MerkleRootSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RewardClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'epoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RewardSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'tierIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Staked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'lockPeriod',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'multiplier',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TierAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'index',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'lockPeriod',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'multiplier',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TierUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Unstaked',
  },
  {
    type: 'function',
    inputs: [],
    name: 'TOKEN',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'stakeIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'epochs', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'merkleProofs',
        internalType: 'bytes32[][]',
        type: 'bytes32[][]',
      },
    ],
    name: 'calculateRewards',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'stakeIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'votedEpochs', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'calculateRewardsWithVoting',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'stakeIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'epochs', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'merkleProofs',
        internalType: 'bytes32[][]',
        type: 'bytes32[][]',
      },
    ],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultEpochRewards',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochDuration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'epochMerkleRoots',
    outputs: [{ name: 'root', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'getRewardsForEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'getTotalEffectiveSupplyAtEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserStakes',
    outputs: [
      {
        name: '',
        internalType: 'struct TokenStaking.Stake[]',
        type: 'tuple[]',
        components: [
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'effectiveAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'tierIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'lastClaimEpoch', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'merkleProof', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'hasVoted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastTotalEffectiveSupplyChangedAtEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'rewardsPerEpoch',
    outputs: [{ name: 'reward', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_epochDuration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setEpochDuration',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'merkleRoot', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'setMerkleRoot',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'reward', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setRewardForEpoch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'index', internalType: 'uint256', type: 'uint256' },
      { name: 'lockPeriod', internalType: 'uint256', type: 'uint256' },
      { name: 'multiplier', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setTier',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'tierIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'tiers',
    outputs: [
      { name: 'lockPeriod', internalType: 'uint256', type: 'uint256' },
      { name: 'multiplier', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalEffectiveSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'totalEffectiveSupplyAtEpoch',
    outputs: [
      {
        name: 'totalEffectiveSupply',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'stakeIndex', internalType: 'uint256', type: 'uint256' }],
    name: 'unstake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userStakes',
    outputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'effectiveAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'tierIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'lastClaimEpoch', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const tokenStakingAddress = {
  11155111: '0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f',
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const tokenStakingConfig = {
  address: tokenStakingAddress,
  abi: tokenStakingAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TokenVesting
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const tokenVestingAbi = [
  {
    type: 'constructor',
    inputs: [{ name: 'token_', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  { type: 'fallback', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [{ name: 'holder', internalType: 'address', type: 'address' }],
    name: 'computeNextVestingScheduleIdForHolder',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'vestingScheduleId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'computeReleasableAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'holder', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'computeVestingScheduleIdForAddressAndIndex',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '_beneficiary', internalType: 'address', type: 'address' },
      { name: '_start', internalType: 'uint256', type: 'uint256' },
      { name: '_cliff', internalType: 'uint256', type: 'uint256' },
      { name: '_duration', internalType: 'uint256', type: 'uint256' },
      { name: '_slicePeriodSeconds', internalType: 'uint256', type: 'uint256' },
      { name: '_revocable', internalType: 'bool', type: 'bool' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createVestingSchedule',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'holder', internalType: 'address', type: 'address' }],
    name: 'getLastVestingScheduleForHolder',
    outputs: [
      {
        name: '',
        internalType: 'struct TokenVesting.VestingSchedule',
        type: 'tuple',
        components: [
          { name: 'beneficiary', internalType: 'address', type: 'address' },
          { name: 'cliff', internalType: 'uint256', type: 'uint256' },
          { name: 'start', internalType: 'uint256', type: 'uint256' },
          { name: 'duration', internalType: 'uint256', type: 'uint256' },
          {
            name: 'slicePeriodSeconds',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'revocable', internalType: 'bool', type: 'bool' },
          { name: 'amountTotal', internalType: 'uint256', type: 'uint256' },
          { name: 'released', internalType: 'uint256', type: 'uint256' },
          { name: 'revoked', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'getVestingIdAtIndex',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'vestingScheduleId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getVestingSchedule',
    outputs: [
      {
        name: '',
        internalType: 'struct TokenVesting.VestingSchedule',
        type: 'tuple',
        components: [
          { name: 'beneficiary', internalType: 'address', type: 'address' },
          { name: 'cliff', internalType: 'uint256', type: 'uint256' },
          { name: 'start', internalType: 'uint256', type: 'uint256' },
          { name: 'duration', internalType: 'uint256', type: 'uint256' },
          {
            name: 'slicePeriodSeconds',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'revocable', internalType: 'bool', type: 'bool' },
          { name: 'amountTotal', internalType: 'uint256', type: 'uint256' },
          { name: 'released', internalType: 'uint256', type: 'uint256' },
          { name: 'revoked', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'holder', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getVestingScheduleByAddressAndIndex',
    outputs: [
      {
        name: '',
        internalType: 'struct TokenVesting.VestingSchedule',
        type: 'tuple',
        components: [
          { name: 'beneficiary', internalType: 'address', type: 'address' },
          { name: 'cliff', internalType: 'uint256', type: 'uint256' },
          { name: 'start', internalType: 'uint256', type: 'uint256' },
          { name: 'duration', internalType: 'uint256', type: 'uint256' },
          {
            name: 'slicePeriodSeconds',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'revocable', internalType: 'bool', type: 'bool' },
          { name: 'amountTotal', internalType: 'uint256', type: 'uint256' },
          { name: 'released', internalType: 'uint256', type: 'uint256' },
          { name: 'revoked', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getVestingSchedulesCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_beneficiary', internalType: 'address', type: 'address' },
    ],
    name: 'getVestingSchedulesCountByBeneficiary',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getVestingSchedulesTotalAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getWithdrawableAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'vestingScheduleId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'release',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'vestingScheduleId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'revoke',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const tokenVestingAddress = {
  11155111: '0xC6a6EbB044629647eb5CD2eFCC1C748c38349154',
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const tokenVestingConfig = {
  address: tokenVestingAddress,
  abi: tokenVestingAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVault = /*#__PURE__*/ createUseReadContract({
  abi: testStakingVaultAbi,
  address: testStakingVaultAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"TOKEN"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVaultToken = /*#__PURE__*/ createUseReadContract(
  {
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'TOKEN',
  },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"claimableEarnings"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVaultClaimableEarnings =
  /*#__PURE__*/ createUseReadContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'claimableEarnings',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"deposits"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVaultDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'deposits',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"getDeposits"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVaultGetDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'getDeposits',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"getTiers"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVaultGetTiers =
  /*#__PURE__*/ createUseReadContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'getTiers',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"getTotalShares"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVaultGetTotalShares =
  /*#__PURE__*/ createUseReadContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'getTotalShares',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVaultOwner = /*#__PURE__*/ createUseReadContract(
  {
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'owner',
  },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVaultPendingOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'pendingOwner',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"shares"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVaultShares =
  /*#__PURE__*/ createUseReadContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'shares',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"sharesPerUser"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVaultSharesPerUser =
  /*#__PURE__*/ createUseReadContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'sharesPerUser',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"tiers"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVaultTiers = /*#__PURE__*/ createUseReadContract(
  {
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'tiers',
  },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"totalUsers"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useReadTestStakingVaultTotalUsers =
  /*#__PURE__*/ createUseReadContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'totalUsers',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testStakingVaultAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useWriteTestStakingVault = /*#__PURE__*/ createUseWriteContract({
  abi: testStakingVaultAbi,
  address: testStakingVaultAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useWriteTestStakingVaultAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'acceptOwnership',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"deposit"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useWriteTestStakingVaultDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'deposit',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useWriteTestStakingVaultRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'renounceOwnership',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"setTier"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useWriteTestStakingVaultSetTier =
  /*#__PURE__*/ createUseWriteContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'setTier',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useWriteTestStakingVaultTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'transferOwnership',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useWriteTestStakingVaultWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'withdraw',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testStakingVaultAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useSimulateTestStakingVault =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useSimulateTestStakingVaultAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'acceptOwnership',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"deposit"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useSimulateTestStakingVaultDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'deposit',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useSimulateTestStakingVaultRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'renounceOwnership',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"setTier"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useSimulateTestStakingVaultSetTier =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'setTier',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useSimulateTestStakingVaultTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'transferOwnership',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useSimulateTestStakingVaultWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'withdraw',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testStakingVaultAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useWatchTestStakingVaultEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testStakingVaultAbi}__ and `eventName` set to `"AccountDeposit"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useWatchTestStakingVaultAccountDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    eventName: 'AccountDeposit',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testStakingVaultAbi}__ and `eventName` set to `"AccountWithdrawal"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useWatchTestStakingVaultAccountWithdrawalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    eventName: 'AccountWithdrawal',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testStakingVaultAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useWatchTestStakingVaultOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    eventName: 'OwnershipTransferStarted',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testStakingVaultAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x274608045cD704A291bFF9d79453D98C4E78baA4)
 */
export const useWatchTestStakingVaultOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    eventName: 'OwnershipTransferred',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useReadTestToken = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"allowance"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useReadTestTokenAllowance = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'allowance',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"balanceOf"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useReadTestTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'balanceOf',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"decimals"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useReadTestTokenDecimals = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'decimals',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"name"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useReadTestTokenName = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'name',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useReadTestTokenOwner = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"symbol"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useReadTestTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'symbol',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"totalSupply"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useReadTestTokenTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'totalSupply',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useWriteTestToken = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  address: testTokenAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useWriteTestTokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'approve',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"mint"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useWriteTestTokenMint = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'mint',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useWriteTestTokenRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: testTokenAbi,
    address: testTokenAddress,
    functionName: 'renounceOwnership',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transfer"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useWriteTestTokenTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'transfer',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useWriteTestTokenTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: testTokenAbi,
    address: testTokenAddress,
    functionName: 'transferFrom',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useWriteTestTokenTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: testTokenAbi,
    address: testTokenAddress,
    functionName: 'transferOwnership',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useSimulateTestToken = /*#__PURE__*/ createUseSimulateContract({
  abi: testTokenAbi,
  address: testTokenAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useSimulateTestTokenApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    address: testTokenAddress,
    functionName: 'approve',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"mint"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useSimulateTestTokenMint = /*#__PURE__*/ createUseSimulateContract(
  { abi: testTokenAbi, address: testTokenAddress, functionName: 'mint' },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useSimulateTestTokenRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    address: testTokenAddress,
    functionName: 'renounceOwnership',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transfer"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useSimulateTestTokenTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    address: testTokenAddress,
    functionName: 'transfer',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useSimulateTestTokenTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    address: testTokenAddress,
    functionName: 'transferFrom',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useSimulateTestTokenTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    address: testTokenAddress,
    functionName: 'transferOwnership',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testTokenAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useWatchTestTokenEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: testTokenAbi, address: testTokenAddress },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testTokenAbi}__ and `eventName` set to `"Approval"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useWatchTestTokenApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testTokenAbi,
    address: testTokenAddress,
    eventName: 'Approval',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testTokenAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useWatchTestTokenOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testTokenAbi,
    address: testTokenAddress,
    eventName: 'OwnershipTransferred',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testTokenAbi}__ and `eventName` set to `"Transfer"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77b8aD2325dDCC403e167ac238b15ed194ceCF71)
 */
export const useWatchTestTokenTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testTokenAbi,
    address: testTokenAddress,
    eventName: 'Transfer',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenMasterAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useReadTokenMaster = /*#__PURE__*/ createUseReadContract({
  abi: tokenMasterAbi,
  address: tokenMasterAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useReadTokenMasterDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'DEFAULT_ADMIN_ROLE',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"authorizedSigner"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useReadTokenMasterAuthorizedSigner =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'authorizedSigner',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"claimed"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useReadTokenMasterClaimed = /*#__PURE__*/ createUseReadContract({
  abi: tokenMasterAbi,
  address: tokenMasterAddress,
  functionName: 'claimed',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"getMessageHash"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useReadTokenMasterGetMessageHash =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'getMessageHash',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"getRoleAdmin"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useReadTokenMasterGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'getRoleAdmin',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"hasRole"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useReadTokenMasterHasRole = /*#__PURE__*/ createUseReadContract({
  abi: tokenMasterAbi,
  address: tokenMasterAddress,
  functionName: 'hasRole',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"nonces"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useReadTokenMasterNonces = /*#__PURE__*/ createUseReadContract({
  abi: tokenMasterAbi,
  address: tokenMasterAddress,
  functionName: 'nonces',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"paused"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useReadTokenMasterPaused = /*#__PURE__*/ createUseReadContract({
  abi: tokenMasterAbi,
  address: tokenMasterAddress,
  functionName: 'paused',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useReadTokenMasterSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'supportsInterface',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"token"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useReadTokenMasterToken = /*#__PURE__*/ createUseReadContract({
  abi: tokenMasterAbi,
  address: tokenMasterAddress,
  functionName: 'token',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenMasterAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWriteTokenMaster = /*#__PURE__*/ createUseWriteContract({
  abi: tokenMasterAbi,
  address: tokenMasterAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"claimToken"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWriteTokenMasterClaimToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'claimToken',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWriteTokenMasterGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'grantRole',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWriteTokenMasterRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'renounceRole',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWriteTokenMasterRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'revokeRole',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWriteTokenMasterWithdraw = /*#__PURE__*/ createUseWriteContract(
  {
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'withdraw',
  },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenMasterAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useSimulateTokenMaster = /*#__PURE__*/ createUseSimulateContract({
  abi: tokenMasterAbi,
  address: tokenMasterAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"claimToken"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useSimulateTokenMasterClaimToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'claimToken',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useSimulateTokenMasterGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'grantRole',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useSimulateTokenMasterRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'renounceRole',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useSimulateTokenMasterRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'revokeRole',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenMasterAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useSimulateTokenMasterWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    functionName: 'withdraw',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenMasterAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWatchTokenMasterEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenMasterAbi}__ and `eventName` set to `"Paused"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWatchTokenMasterPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    eventName: 'Paused',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenMasterAbi}__ and `eventName` set to `"RoleAdminChanged"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWatchTokenMasterRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    eventName: 'RoleAdminChanged',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenMasterAbi}__ and `eventName` set to `"RoleGranted"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWatchTokenMasterRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    eventName: 'RoleGranted',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenMasterAbi}__ and `eventName` set to `"RoleRevoked"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWatchTokenMasterRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    eventName: 'RoleRevoked',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenMasterAbi}__ and `eventName` set to `"TokenPayOut"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWatchTokenMasterTokenPayOutEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    eventName: 'TokenPayOut',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenMasterAbi}__ and `eventName` set to `"Unpaused"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x642875E3b07Eaf23629b3f4C32c2E514305F203e)
 */
export const useWatchTokenMasterUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenMasterAbi,
    address: tokenMasterAddress,
    eventName: 'Unpaused',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStaking = /*#__PURE__*/ createUseReadContract({
  abi: tokenStakingAbi,
  address: tokenStakingAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"TOKEN"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingToken = /*#__PURE__*/ createUseReadContract({
  abi: tokenStakingAbi,
  address: tokenStakingAddress,
  functionName: 'TOKEN',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"allowance"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingAllowance = /*#__PURE__*/ createUseReadContract(
  {
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'allowance',
  },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"balanceOf"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingBalanceOf = /*#__PURE__*/ createUseReadContract(
  {
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'balanceOf',
  },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"calculateRewards"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingCalculateRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'calculateRewards',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"calculateRewardsWithVoting"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingCalculateRewardsWithVoting =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'calculateRewardsWithVoting',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"decimals"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingDecimals = /*#__PURE__*/ createUseReadContract({
  abi: tokenStakingAbi,
  address: tokenStakingAddress,
  functionName: 'decimals',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"defaultEpochRewards"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingDefaultEpochRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'defaultEpochRewards',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"epochDuration"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingEpochDuration =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'epochDuration',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"epochMerkleRoots"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingEpochMerkleRoots =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'epochMerkleRoots',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"getCurrentEpoch"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingGetCurrentEpoch =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'getCurrentEpoch',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"getRewardsForEpoch"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingGetRewardsForEpoch =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'getRewardsForEpoch',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"getTotalEffectiveSupplyAtEpoch"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingGetTotalEffectiveSupplyAtEpoch =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'getTotalEffectiveSupplyAtEpoch',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"getUserStakes"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingGetUserStakes =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'getUserStakes',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"hasVoted"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingHasVoted = /*#__PURE__*/ createUseReadContract({
  abi: tokenStakingAbi,
  address: tokenStakingAddress,
  functionName: 'hasVoted',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"lastTotalEffectiveSupplyChangedAtEpoch"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingLastTotalEffectiveSupplyChangedAtEpoch =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'lastTotalEffectiveSupplyChangedAtEpoch',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"name"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingName = /*#__PURE__*/ createUseReadContract({
  abi: tokenStakingAbi,
  address: tokenStakingAddress,
  functionName: 'name',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingOwner = /*#__PURE__*/ createUseReadContract({
  abi: tokenStakingAbi,
  address: tokenStakingAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"rewardsPerEpoch"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingRewardsPerEpoch =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'rewardsPerEpoch',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"symbol"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingSymbol = /*#__PURE__*/ createUseReadContract({
  abi: tokenStakingAbi,
  address: tokenStakingAddress,
  functionName: 'symbol',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"tiers"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingTiers = /*#__PURE__*/ createUseReadContract({
  abi: tokenStakingAbi,
  address: tokenStakingAddress,
  functionName: 'tiers',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"totalEffectiveSupply"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingTotalEffectiveSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'totalEffectiveSupply',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"totalEffectiveSupplyAtEpoch"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingTotalEffectiveSupplyAtEpoch =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'totalEffectiveSupplyAtEpoch',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"totalSupply"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'totalSupply',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"userStakes"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useReadTokenStakingUserStakes =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'userStakes',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStaking = /*#__PURE__*/ createUseWriteContract({
  abi: tokenStakingAbi,
  address: tokenStakingAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStakingApprove = /*#__PURE__*/ createUseWriteContract(
  {
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'approve',
  },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"claimRewards"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStakingClaimRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'claimRewards',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStakingRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'renounceOwnership',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"setEpochDuration"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStakingSetEpochDuration =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'setEpochDuration',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"setMerkleRoot"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStakingSetMerkleRoot =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'setMerkleRoot',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"setRewardForEpoch"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStakingSetRewardForEpoch =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'setRewardForEpoch',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"setTier"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStakingSetTier = /*#__PURE__*/ createUseWriteContract(
  {
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'setTier',
  },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"stake"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStakingStake = /*#__PURE__*/ createUseWriteContract({
  abi: tokenStakingAbi,
  address: tokenStakingAddress,
  functionName: 'stake',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"transfer"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStakingTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'transfer',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStakingTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'transferFrom',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStakingTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'transferOwnership',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"unstake"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWriteTokenStakingUnstake = /*#__PURE__*/ createUseWriteContract(
  {
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'unstake',
  },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStaking = /*#__PURE__*/ createUseSimulateContract({
  abi: tokenStakingAbi,
  address: tokenStakingAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStakingApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'approve',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"claimRewards"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStakingClaimRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'claimRewards',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStakingRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'renounceOwnership',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"setEpochDuration"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStakingSetEpochDuration =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'setEpochDuration',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"setMerkleRoot"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStakingSetMerkleRoot =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'setMerkleRoot',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"setRewardForEpoch"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStakingSetRewardForEpoch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'setRewardForEpoch',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"setTier"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStakingSetTier =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'setTier',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"stake"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStakingStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'stake',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"transfer"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStakingTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'transfer',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStakingTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'transferFrom',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStakingTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'transferOwnership',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenStakingAbi}__ and `functionName` set to `"unstake"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useSimulateTokenStakingUnstake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    functionName: 'unstake',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenStakingAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWatchTokenStakingEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenStakingAbi}__ and `eventName` set to `"Approval"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWatchTokenStakingApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    eventName: 'Approval',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenStakingAbi}__ and `eventName` set to `"MerkleRootSet"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWatchTokenStakingMerkleRootSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    eventName: 'MerkleRootSet',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenStakingAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWatchTokenStakingOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    eventName: 'OwnershipTransferred',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenStakingAbi}__ and `eventName` set to `"RewardClaimed"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWatchTokenStakingRewardClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    eventName: 'RewardClaimed',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenStakingAbi}__ and `eventName` set to `"RewardSet"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWatchTokenStakingRewardSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    eventName: 'RewardSet',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenStakingAbi}__ and `eventName` set to `"Staked"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWatchTokenStakingStakedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    eventName: 'Staked',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenStakingAbi}__ and `eventName` set to `"TierAdded"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWatchTokenStakingTierAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    eventName: 'TierAdded',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenStakingAbi}__ and `eventName` set to `"TierUpdated"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWatchTokenStakingTierUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    eventName: 'TierUpdated',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenStakingAbi}__ and `eventName` set to `"Transfer"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWatchTokenStakingTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    eventName: 'Transfer',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenStakingAbi}__ and `eventName` set to `"Unstaked"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x77Ea6Da0F6F7155d78845535771a179Efa4c2a3f)
 */
export const useWatchTokenStakingUnstakedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenStakingAbi,
    address: tokenStakingAddress,
    eventName: 'Unstaked',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVesting = /*#__PURE__*/ createUseReadContract({
  abi: tokenVestingAbi,
  address: tokenVestingAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"computeNextVestingScheduleIdForHolder"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingComputeNextVestingScheduleIdForHolder =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'computeNextVestingScheduleIdForHolder',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"computeReleasableAmount"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingComputeReleasableAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'computeReleasableAmount',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"computeVestingScheduleIdForAddressAndIndex"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingComputeVestingScheduleIdForAddressAndIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'computeVestingScheduleIdForAddressAndIndex',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"getLastVestingScheduleForHolder"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingGetLastVestingScheduleForHolder =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'getLastVestingScheduleForHolder',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"getToken"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingGetToken = /*#__PURE__*/ createUseReadContract({
  abi: tokenVestingAbi,
  address: tokenVestingAddress,
  functionName: 'getToken',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"getVestingIdAtIndex"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingGetVestingIdAtIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'getVestingIdAtIndex',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"getVestingSchedule"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingGetVestingSchedule =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'getVestingSchedule',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"getVestingScheduleByAddressAndIndex"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingGetVestingScheduleByAddressAndIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'getVestingScheduleByAddressAndIndex',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"getVestingSchedulesCount"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingGetVestingSchedulesCount =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'getVestingSchedulesCount',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"getVestingSchedulesCountByBeneficiary"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingGetVestingSchedulesCountByBeneficiary =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'getVestingSchedulesCountByBeneficiary',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"getVestingSchedulesTotalAmount"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingGetVestingSchedulesTotalAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'getVestingSchedulesTotalAmount',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"getWithdrawableAmount"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingGetWithdrawableAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'getWithdrawableAmount',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useReadTokenVestingOwner = /*#__PURE__*/ createUseReadContract({
  abi: tokenVestingAbi,
  address: tokenVestingAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenVestingAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useWriteTokenVesting = /*#__PURE__*/ createUseWriteContract({
  abi: tokenVestingAbi,
  address: tokenVestingAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"createVestingSchedule"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useWriteTokenVestingCreateVestingSchedule =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'createVestingSchedule',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"release"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useWriteTokenVestingRelease = /*#__PURE__*/ createUseWriteContract(
  {
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'release',
  },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"revoke"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useWriteTokenVestingRevoke = /*#__PURE__*/ createUseWriteContract({
  abi: tokenVestingAbi,
  address: tokenVestingAddress,
  functionName: 'revoke',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useWriteTokenVestingTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'transferOwnership',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useWriteTokenVestingWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'withdraw',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenVestingAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useSimulateTokenVesting = /*#__PURE__*/ createUseSimulateContract({
  abi: tokenVestingAbi,
  address: tokenVestingAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"createVestingSchedule"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useSimulateTokenVestingCreateVestingSchedule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'createVestingSchedule',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"release"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useSimulateTokenVestingRelease =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'release',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"revoke"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useSimulateTokenVestingRevoke =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'revoke',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useSimulateTokenVestingTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'transferOwnership',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenVestingAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useSimulateTokenVestingWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    functionName: 'withdraw',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenVestingAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useWatchTokenVestingEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenVestingAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xC6a6EbB044629647eb5CD2eFCC1C748c38349154)
 */
export const useWatchTokenVestingOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenVestingAbi,
    address: tokenVestingAddress,
    eventName: 'OwnershipTransferred',
  });
