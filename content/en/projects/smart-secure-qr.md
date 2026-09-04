+++
date = '2026-08-02T22:32:12+07:00'
draft = false
title = 'Smart Secure QR'
summary = 'QR codes carrying two signatures, one from the issuer and one from a timelock. Each scan verifies where the code originated and rejects it once its validity period has passed.'
+++

## Hello World

Hello world. This page is a stub so the project card on the homepage links
somewhere real instead of a 404.

The work itself is real — QR codes signed twice, once by the issuer and once by
a timelock, so each scan checks where the code came from and rejects it after
expiry. The write-up is not written yet.

### What belongs here

- What problem the dual signature solves, and why one signature is not enough.
- How the timelock is constructed, and what expiry means in practice.
- What was built in Go, and what the PostgreSQL schema holds.
