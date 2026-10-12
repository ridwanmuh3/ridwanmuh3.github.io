+++
title = 'Inventory Dashboard'
date = '2025-12-01'
draft = false
description = 'Sistem manajemen anggaran dan barang multi-tenant untuk dapur katering, dengan 35 endpoint REST API, role-based access control, row-level locking pada modul keuangan dan inventaris bahan baku, serta dasbor analitik.'
photo = 'sppg-app.webp'
link = 'https://github.com/ridwanmuh3?tab=repositories&q=simba'
+++

Sistem full-stack yang dibangun untuk SPPG Sinar Asri (Des 2025 - Mar 2026) guna mengelola anggaran dan barang operasional dapur katering dalam program MBG.

## Backend

- **Go, Fiber, GORM, PostgreSQL** dengan 35 endpoint REST API dan role-based access control.
- Modul keuangan dan inventaris bahan baku dilindungi **row-level locking** untuk mencegah race condition pada transaksi yang berjalan bersamaan.

## Satu deployment, banyak dapur

Sistem berjalan dengan arsitektur **multi-tenant**, dengan setiap dapur sebagai tenant. Satu deployment melayani seluruh program, dan data anggaran serta inventaris tetap terisolasi antar-dapur — apa yang bisa diakses pengguna ditentukan oleh dapur tempat ia terdaftar dan hak aksesnya, bukan oleh layar mana yang ia buka.

## Frontend

- **React, TypeScript, TanStack Query** dengan 8 halaman fungsional dan dasbor analitik Recharts untuk data keuangan dan inventaris.