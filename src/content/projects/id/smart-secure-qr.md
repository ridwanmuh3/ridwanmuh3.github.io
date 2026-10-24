+++
title = 'Smart Secure QR'
date = '2026-02-01'
draft = false
description = 'Aplikasi web yang mengamankan QR code dan embedded document dengan tanda tangan digital dan enkripsi berbasis waktu. Setiap pemindaian memeriksa asal dokumen dan menolak kode yang masa berlakunya sudah habis.'
photo = 'smart-secure-qr.webp'
link = 'https://smart-secure-qrcode.netlify.app'
+++

Dibangun sebagai proyek asisten riset di Universitas Siliwangi (Feb 2026 - Mar 2026), aplikasi web ini mengamankan QR code dan embedded document dari pemalsuan dan penyalahgunaan.

## Fungsinya

Dokumen keluar dari sistem dengan **tanda tangan digital** dan masa berlaku yang ditegakkan server. Setiap pemindaian memeriksa integritas, keaslian, dan masa berlaku sebelum dokumen di balik kode ditampilkan.

- Menerbitkan QR code dan embedded document dengan tanda tangan digital dan enkripsi berbasis waktu, sehingga setiap pemindaian memverifikasi asal kode dan menolaknya setelah masa berlakunya habis.
- Menyediakan **12 endpoint REST API** untuk alur penerbitan dan verifikasi, diimplementasikan dengan **Nuxt 4**.

## Validasi

Mekanisme keamanan diuji melalui benchmarking dan pengujian fungsional untuk memastikan perilakunya sesuai rancangan. Tanda tangan, penanganan kedaluwarsa, dan alur verifikasi divalidasi ujung ke ujung.