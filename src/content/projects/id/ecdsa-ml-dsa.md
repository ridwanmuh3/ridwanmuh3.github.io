+++
title = 'ECDSA + ML-DSA di Blockchain'
date = '2026-06-01'
draft = false
description = 'Artikel jurnal di ULTIMATICS (SINTA 3) beserta proof of concept di baliknya: skema tanda tangan hibrida ECDSA dan ML-DSA untuk autentikasi transaksi pada blockchain yang kompatibel dengan Ethereum. Penandatanganan post-kuantum dikerjakan off-chain oleh oracle.'
photo = 'pqc-blockchain.webp'
link = 'https://github.com/ridwanmuh3/hybrid-signature-eth-poc'
+++

Artikel jurnal yang telah peer-review dan diterbitkan di **ULTIMATICS: Jurnal Teknik Informatika** (SINTA 3), Juni 2026, mendokumentasikan proof of concept yang dibangun berdampingan dengannya.

> Implementation of ECDSA and ML-DSA Digital Signature Schemes for Transaction Authentication on Blockchain

## Cara kerja hibrida

Blockchain yang kompatibel dengan Ethereum mengautentikasi setiap transaksi dengan dua tanda tangan berbeda jenis, dan yang mahal itu tidak pernah menyentuh rantai:

- Penandatanganan dan verifikasi **ML-DSA** dilakukan melalui **oracle off-chain**.
- **Smart contract** memverifikasi tanda tangan ECDSA dan menyimpan hash ML-DSA.

Dibangun dengan **React, Viem, Foundry, Solidity, Golang, MetaMask** sebagai proof of concept, Desember 2025 - Juni 2026.

## Diukur pada Foundry Anvil

| | ML-DSA | ECDSA |
| --- | --- | --- |
| Ukuran tanda tangan | 2.531 - 4.738 byte | 65 byte |
| Round-trip time | 0,355 - 0,523 ms | — |
| Gas | 64.260 - 99.344 | 25.828 |

Tanda tangan post-kuantum idealnya 2,5x sampai 3,8x lebih mahal dalam gas dibanding tanda tangan ECDSA konvensional, dan tetap menyelesaikan round-trip di bawah satu milidetik. Rasio itulah yang diserap oleh desain oracle.