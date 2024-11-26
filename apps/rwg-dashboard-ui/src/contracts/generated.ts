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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
 */
export const testStakingVaultAddress = {
  11155111: '0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0',
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
 */
export const testStakingVaultConfig = {
  address: testStakingVaultAddress,
  abi: testStakingVaultAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TestToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const testTokenAddress = {
  11155111: '0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2',
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const testTokenConfig = {
  address: testTokenAddress,
  abi: testTokenAbi,
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
 */
export const useReadTestStakingVault = /*#__PURE__*/ createUseReadContract({
  abi: testStakingVaultAbi,
  address: testStakingVaultAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"claimableEarnings"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
 */
export const useReadTestStakingVaultTiers = /*#__PURE__*/ createUseReadContract(
  {
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'tiers',
  },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"token"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
 */
export const useReadTestStakingVaultToken = /*#__PURE__*/ createUseReadContract(
  {
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
    functionName: 'token',
  },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"totalUsers"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
 */
export const useWriteTestStakingVault = /*#__PURE__*/ createUseWriteContract({
  abi: testStakingVaultAbi,
  address: testStakingVaultAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
 */
export const useSimulateTestStakingVault =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testStakingVaultAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
 */
export const useWatchTestStakingVaultEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testStakingVaultAbi,
    address: testStakingVaultAddress,
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testStakingVaultAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xAfa68D066A7e809EFAb066dcA5001f1cD1e75eA0)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useReadTestToken = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"allowance"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useReadTestTokenAllowance = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'allowance',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"balanceOf"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useReadTestTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'balanceOf',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"decimals"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useReadTestTokenDecimals = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'decimals',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"name"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useReadTestTokenName = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'name',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useReadTestTokenOwner = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"symbol"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useReadTestTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'symbol',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"totalSupply"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useReadTestTokenTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'totalSupply',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useWriteTestToken = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  address: testTokenAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useWriteTestTokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'approve',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"mint"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useWriteTestTokenMint = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'mint',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useWriteTestTokenTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  address: testTokenAddress,
  functionName: 'transfer',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useSimulateTestToken = /*#__PURE__*/ createUseSimulateContract({
  abi: testTokenAbi,
  address: testTokenAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useSimulateTestTokenMint = /*#__PURE__*/ createUseSimulateContract(
  { abi: testTokenAbi, address: testTokenAddress, functionName: 'mint' },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useWatchTestTokenEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: testTokenAbi, address: testTokenAddress },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testTokenAbi}__ and `eventName` set to `"Approval"`
 *
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
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
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x80503a00e1B60C9Be8E6f005C3d4fDbbDAbd5be2)
 */
export const useWatchTestTokenTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testTokenAbi,
    address: testTokenAddress,
    eventName: 'Transfer',
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
