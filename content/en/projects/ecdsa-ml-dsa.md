+++
title = 'ECDSA + ML-DSA on Blockchain'
date = '2026-06-01'
draft = false
description = 'Journal article in ULTIMATICS (SINTA 3) presenting a hybrid ECDSA and ML-DSA signature scheme for transaction authentication on an Ethereum-compatible blockchain, with an oracle as off-chain helper and security tests rejecting forgery, replay, and stripping.'
link = 'https://github.com/ridwanmuh3/hybrid-signature-eth-poc'
+++

Peer-reviewed journal article published in **ULTIMATICS: Jurnal Teknik Informatika** (SINTA 3), June 2026.

## The paper

Presents a proof-of-concept hybrid **ECDSA + ML-DSA** signature scheme for transaction authentication on an Ethereum-compatible blockchain, using an oracle as off-chain helper.

## Results

Tested on a Foundry Anvil private network:

- ML-DSA signatures: **2,531 - 4,738 bytes**, round-trip time **0.355 - 0.523 ms**, estimated gas **64,260 - 99,344**, versus ECDSA at 65 bytes and 25,828 gas.
- Security tests rejected **signature stripping, message manipulation, replay, signature forgery**, and invalid TLV formats.