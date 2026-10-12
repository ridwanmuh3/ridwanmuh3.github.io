+++
title = 'Post-Quantum FN-DSA JWT'
date = '2026-07-01'
draft = false
description = 'Post-quantum authentication for a Go microservices task API: FN-DSA-512 JWT signing benchmarked with k6. Precomputation cut issuance latency 24.5%, but under stress both methods matched and cryptography stayed below 0.3% of total latency.'
link = 'https://github.com/ridwanmuh3/tasktify'
+++

A task API whose authentication signs its JWTs with **FN-DSA-512**, a post-quantum signature algorithm. The point of the project was not signing with it — it was measuring whether signing with it is affordable, and finding out where the time actually goes.

## What was built

- **Gateway** — HTTP/Fiber, verifies JWTs, exposes the benchmark endpoints.
- **Auth service** — registration and sign-in, signs the tokens.
- **Todo service** — task CRUD.

Services talk **gRPC** to each other and to the gateway, with state in **PostgreSQL**. The signer is selected by configuration, so the same build runs either way:

| Profile | Signer |
| --- | --- |
| `FN-DSA-Precomputed-512` | Precomputed LDL tree |
| `FN-DSA-512` | Original, on demand |

Both emit identical FN-DSA-512 tokens — precomputation is internal signer state, not a different JOSE algorithm. That distinction is what makes the comparison honest: it benchmarks two implementations of the same output, not two different token formats.

## How it was benchmarked

**k6** drove isolated gateway instances — one per signer profile — on a Hostinger VPS with 2 CPU cores and 8 GB of RAM.

## Results

Aggregated across 20 runs, precomputation reduced token issuance latency by **24.5%** and CPU time by **27.3%**, at roughly **108 KB of RAM per signer key**.

## What the stress tests actually showed

At 10, 30, and 50 virtual users the two methods performed nearly identically. Cryptographic processing accounted for **less than 0.3% of total latency** — bcrypt processing and PostgreSQL access dominated.

That is the result worth keeping. FN-DSA-512 is the most expensive operation in the request path by a wide margin, and at 0.3% of latency it still does not register. Precomputation is a real, measurable win, and it optimises a stage that was never the bottleneck.

The repository also ships known-answer (KAT) and adversarial test passes for the FN-DSA implementation alongside the benchmark scripts.