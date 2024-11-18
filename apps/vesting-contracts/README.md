[![Actions Status](https://github.com/abdelhamidbakhta/token-vesting-contracts/workflows/test/badge.svg)](https://github.com/abdelhamidbakhta/token-vesting-contracts/actions/workflows/test.yml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![license](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/erc20-token-vesting.svg)](https://badge.fury.io/js/erc20-token-vesting)

# Token Vesting Contracts

## Overview

On-Chain vesting scheme enabled by smart contracts.

`TokenVesting` contract can release its token balance gradually like a typical vesting scheme, with a cliff and vesting
period. The vesting schedules are optionally revocable by the owner.

## 🎭🧑‍💻 Security audits

- [Security audit](https://github.com/abdelhamidbakhta/token-vesting-contracts/blob/main/audits/hacken_audit_report.pdf)
  from [Hacken](https://hacken.io)

This repository is compatible with both Forge and Hardhat. Forge needs to be ran (install and build) before Hardhat is
used in order to load dependency contracts. You can find the specific instructions for each tool below.

### Forge

#### 📦 Installation

```console
forge install
```

#### ⛏️ Compile

```console
forge build
```

#### 🌡️ Testing

```console
$ forge test
```

### Hardhat

#### 📦 Installation

```console
$ pnpm i
```

#### ⛏️ Compile

```console
$ pnpm compile
```

This task will compile all smart contracts in the `contracts` directory. ABI files will be automatically exported in
`build/abi` directory.

#### 📚 Documentation

Documentation is auto-generated after each build in `docs` directory.

The generated output is a static website containing smart contract documentation.

#### 🌡️ Testing

Note: make sure to have ran forge build and compile before you run tests.

```console
$ yarn test
```

#### 📊 Code coverage

```console
$ yarn coverage
```

The report will be printed in the console and a static website containing full report will be generated in `coverage`
directory.

#### ✨ Code style

```console
$ yarn prettier
```

#### 🐱‍💻 Verify & Publish contract source code

You can choose to add a parameters json file to the `apps/vesting-contracts/ignition/parameters` using all available
parameters for the module in `ignition/modules` folder or the command will prompt you the required variables to enter.

Command to deploy:

```console
hardhat ignition deploy ignition/modules/(contract name).ts --network (network) --parameters ./ignition/parameters/(network).json
```
```console
pnpm hardhat ignition verify --network sepolia chain-11155111
```

## 📄 License

**Token Vesting Contracts** is released under the [Apache-2.0](LICENSE).

