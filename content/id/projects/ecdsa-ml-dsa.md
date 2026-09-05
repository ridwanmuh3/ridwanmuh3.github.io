+++
title = 'ECDSA + ML-DSA di Blockchain'
date = '2026-06-01'
draft = false
description = 'Artikel jurnal (SINTA 3) di ULTIMATICS yang menyajikan skema tanda tangan hibrida ECDSA dan ML-DSA untuk autentikasi transaksi pada blockchain yang kompatibel dengan Ethereum, dengan oracle sebagai off-chain helper dan uji keamanan yang menolak pemalsuan, replay, dan stripping.'
link = 'https://github.com/ridwanmuh3/hybrid-signature-eth-poc'
+++

Artikel jurnal peer-reviewed yang diterbitkan di **ULTIMATICS: Jurnal Teknik Informatika** (SINTA 3), Juni 2026.

## Isi artikel

Menyajikan proof-of-concept skema tanda tangan hibrida **ECDSA + ML-DSA** untuk autentikasi transaksi pada blockchain yang kompatibel dengan Ethereum, menggunakan oracle sebagai off-chain helper.

## Hasil

Diuji pada jaringan privat Foundry Anvil:

- Tanda tangan ML-DSA: **2.531 - 4.738 byte**, round-trip time **0,355 - 0,523 ms**, estimasi gas **64.260 - 99.344**, dibandingkan ECDSA sebesar 65 byte dan 25.828 gas.
- Uji keamanan berhasil menolak **signature stripping, manipulasi pesan, replay, pemalsuan tanda tangan**, dan format TLV yang tidak valid.