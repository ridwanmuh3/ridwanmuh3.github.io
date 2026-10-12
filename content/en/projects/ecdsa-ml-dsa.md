+++
title = 'ECDSA + ML-DSA on Blockchain'
date = '2026-06-01'
draft = false
description = 'Journal article in ULTIMATICS (SINTA 3) and the proof of concept behind it: a hybrid ECDSA and ML-DSA signature scheme for transaction authentication on an Ethereum-compatible blockchain, with post-quantum signing handled off-chain by an oracle.'
photo = 'pqc-blockchain.webp'
link = 'https://github.com/ridwanmuh3/hybrid-signature-eth-poc'
+++

Peer-reviewed journal article published in **ULTIMATICS: Jurnal Teknik Informatika** (SINTA 3), June 2026, documenting the proof of concept built alongside it.

> Implementation of ECDSA and ML-DSA Digital Signature Schemes for Transaction Authentication on Blockchain

## How the hybrid works

An Ethereum-compatible chain authenticates every transaction with two signatures of different kinds, and the expensive one never reaches the chain:

- **ML-DSA** signing and verification happen through an **off-chain oracle**.
- The **smart contract** verifies the ECDSA signature and stores the ML-DSA hash.

Built with **React, Viem, Foundry, Solidity, Golang, MetaMask** as a proof of concept, December 2025 - June 2026.

## Measured on Foundry Anvil

| | ML-DSA | ECDSA |
| --- | --- | --- |
| Signature size | 2,531 - 4,738 bytes | 65 bytes |
| Round-trip time | 0.355 - 0.523 ms | — |
| Gas | 64,260 - 99,344 | 25,828 |

Post-quantum signatures cost roughly 2.5x to 3.8x the gas of a conventional ECDSA signature, and still round-trip in under a millisecond. That ratio is the thing the oracle design exists to absorb.