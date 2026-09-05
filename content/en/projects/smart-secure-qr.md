+++
title = 'Smart Secure QR'
date = '2026-02-01'
draft = false
description = 'Web application securing QR codes and embedded documents with dual digital signatures and time-based encryption. Each scan verifies where the code originated and rejects it once its validity period has passed.'
photo = 'smart-secure-qr.webp'
link = 'https://smart-secure-qrcode.netlify.app'
+++

Built as a research assistant project at Universitas Siliwangi (Feb 2026 - Mar 2026), this web application secures QR codes and embedded documents against forgery and misuse.

## What it does

- Issues QR codes and embedded documents with a **dual digital signature** and time-based encryption, so each scan verifies where the code originated and rejects it once its validity period has passed.
- Exposes **12 REST API endpoints** covering the issuance and verification flow, implemented with **Nuxt 4**.

## Validation

The security mechanism was benchmarked and functionally tested to confirm it behaves as designed. Signatures, expiry handling, and the verification flow were validated end to end.