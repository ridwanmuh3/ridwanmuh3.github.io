+++
title = 'Dasbor Inventori'
date = '2025-12-01'
draft = false
description = 'Sistem manajemen anggaran dan barang untuk dapur katering dengan 35 endpoint REST API, role-based access control, modul keuangan dan inventaris bahan baku berlapis row-level locking, serta dasbor analitik.'
photo = 'inventory-dashboard.webp'
link = 'https://github.com/ridwanmuh3?tab=repositories&q=simba'
+++

Sistem full-stack yang dibangun untuk SPPG Sinar Asri (Des 2025 - Mar 2026) guna mengelola anggaran dan barang operasional dapur katering dalam program MBG.

## Backend

- **Go, Fiber, GORM, PostgreSQL** dengan 35 endpoint REST API dan role-based access control.
- Modul keuangan dan inventaris bahan baku dilindungi **row-level locking** untuk mencegah race condition.

## Frontend

- **React, TypeScript, TanStack Query** dengan 8 halaman fungsional dan dasbor analitik Recharts untuk visualisasi data keuangan dan stok.