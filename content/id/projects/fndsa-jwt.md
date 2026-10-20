+++
title = 'FN-DSA JWT Post-Kuantum'
date = '2026-07-01'
draft = false
mark = 'PQ'
description = 'Autentikasi post-kuantum untuk task API microservice Go. Token JWT ditandatangani dengan FN-DSA-512, lalu diuji memakai k6: precomputation memangkas latensi penerbitan 24,5%, tetapi saat pengujian beban kedua metode setara dan proses kriptografi hanya 0,3% dari latensi keseluruhan.'
link = 'https://github.com/ridwanmuh3/tasktify'
+++

Sebuah task API yang autentikasinya menandatangani JWT dengan **FN-DSA-512**, sebuah algoritma tanda tangan post-kuantum. Fokus proyek ini bukan menandatangani dengannya, melainkan mengukur apakah penandatanganan dengannya terjangkau, dan mencari ke mana waktu sebenarnya habis.

## Apa yang dibangun

- **Gateway** — HTTP/Fiber, memverifikasi JWT, dan mengekspos endpoint benchmark.
- **Auth service** — registrasi dan sign-in, menandatangani token.
- **Todo service** — CRUD task.

Antar service berkomunikasi via **gRPC**, dengan state di **PostgreSQL**. Penanda tangan dipilih lewat konfigurasi, sehingga build yang sama dapat berjalan dengan kedua cara:

| Profil | Penanda tangan |
| --- | --- |
| `FN-DSA-Precomputed-512` | Precomputed LDL tree |
| `FN-DSA-512` | Asli, secara on demand |

Keduanya menghasilkan token FN-DSA-512 yang identik — precomputation adalah state internal penanda tangan, bukan algoritma JOSE yang berbeda. Pembedaan inilah yang membuat perbandingannya jujur: yang diuji adalah dua implementasi dari keluaran yang sama, bukan dua format token yang berbeda.

## Bagaimana pengukurannya

**k6** mengarahkan trafik ke instance gateway yang terisolasi — satu instance per profil penanda tangan — pada VPS Hostinger dengan 2 core CPU dan RAM 8 GB.

## Hasil

Digabungkan dari 20 kali pengujian, precomputation menurunkan latensi penerbitan token sebesar **24,5%** dan waktu CPU sebesar **27,3%**, dengan penggunaan RAM sekitar **108 KB per kunci signer**.

## Apa yang sebenarnya ditunjukkan oleh stress test

Pada 10, 30, dan 50 pengguna virtual, kedua metode menghasilkan performa yang nyaris sama. Proses kriptografi hanya menyumbang **kurang dari 0,3% dari latensi keseluruhan** — bcrypt dan akses PostgreSQL yang mendominasi.

Inilah hasil yang layak disimpan. FN-DSA-512 adalah operasi termahal dalam alur request dengan selisih yang jauh, dan pada 0,3% dari latensi ia tetap tidak terasa. Precomputation memberi pengurangan yang terukur, sekaligus mengoptimalkan tahap yang memang tidak pernah menjadi *bottleneck*.

Repositori ini juga menyertakan pengujian known-answer (KAT) dan adversarial untuk implementasi FN-DSA, berdampingan dengan skrip benchmark.