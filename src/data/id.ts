import type { SiteContent } from './types';

export const id = {
  hero: {
    tagline: 'Saya membangun REST API dan layanan backend dengan Go, NestJS, dan PostgreSQL.',
  },

  sections: {
    skills: { title: '// Keahlian' },
    projects: { title: '// Proyek' },
    blogs: { title: '// Blog' },
    education: { title: '// Pendidikan' },
    experiences: { title: '// Pengalaman Kerja' },
    cta: {
      title: '// Mari Bekerja Sama',
      body: 'Saya terbuka untuk peran backend penuh waktu maupun kontrak — hybrid, remote, atau onsite di Indonesia.',
      cta_label: 'Hubungi saya',
      cta_href: '/contact/',
    },
  },

  pages: {
    projects: {
      title: 'Proyek',
      body: 'Tulisan mengenai proyek, terbaru terlebih dahulu.',
    },
    blogs: {
      title: 'Blog',
      body: 'Catatan seputar rekayasa backend: permasalahan yang saya temui, keputusan yang harus saya tinjau ulang, dan kesimpulan yang layak dicatat.',
    },
    contact: {
      title: 'Kontak',
      body: 'Kirim pesan singkat tentang permasalahan dan teknologi yang digunakan. Pesan langsung masuk ke kotak masuk saya. Umumnya saya membalas dalam satu hingga dua hari.',
    },
  },

  skills: [
    { label: 'Bahasa & Framework', items: [
      { name: 'Go' }, { name: 'TypeScript' }, { name: 'Node.js' },
      { name: 'NestJS' }, { name: 'Fiber' }, { name: 'Echo' },
      { name: 'Nuxt' }, { name: 'React' }, { name: 'Vue' },
    ] },
    { label: 'Data & Messaging', items: [
      { name: 'PostgreSQL' }, { name: 'Redis' }, { name: 'RabbitMQ' },
      { name: 'gRPC' }, { name: 'GORM' },
    ] },
    { label: 'Autentikasi & Kripto', items: [
      { name: 'JWT' }, { name: 'Solidity' }, { name: 'Foundry' },
    ] },
    { label: 'Observabilitas & Pengujian', items: [
      { name: 'OpenTelemetry' }, { name: 'Prometheus' }, { name: 'Grafana' },
      { name: 'k6' }, { name: 'Playwright' }, { name: 'Jest' },
    ] },
    { label: 'Platform & Peralatan', items: [
      { name: 'Docker' }, { name: 'Linux' }, { name: 'Git' },
      { name: 'GitHub' }, { name: 'Google Cloud Platform' }, { name: 'Postman' },
    ] },
  ],

  socials: [
    {
      icon: 'brand-github',
      label: 'GitHub',
      href: 'https://github.com/ridwanmuh3',
    },
    {
      icon: 'brand-whatsapp',
      label: 'WhatsApp',
      href: 'https://wa.me/6285793516167?text=Halo%20Ridwan,%20saya%20ingin%20berdiskusi%20lebih%20lanjut.',
    },
    {
      icon: 'brand-linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/ridwanmuh3',
    },
  ],

  education: [
    {
      name: 'Sarjana Informatika (S1)',
      company: 'Universitas Siliwangi',
      start: '2022-08',
      end: '2026-07',
      gpa: '3.74/4.00',
      description:
        'Berfokus pada kelompok keahlian Jaringan Komputer, Keamanan dan Forensik Digital (JKF), khususnya kriptografi.',
    },
  ],

  experiences: [
    {
      name: 'Asisten Peneliti',
      company: 'Universitas Siliwangi',
      start: '2026-02',
      end: '2026-03',
      description:
        'Mengimplementasikan sistem penelitian berbasis web yang mengamankan QR code dan embedded document menggunakan Nuxt 4, dengan 12 endpoint REST API untuk proses penerbitan dan verifikasi dokumen.',
      keypoints: ['tanda tangan digital', 'enkripsi berbasis waktu'],
    },
    {
      name: 'Full Stack Web Developer',
      company: 'SPPG Sinar Asri',
      start: '2025-12',
      end: '2026-03',
      description:
        'Membangun sistem manajemen anggaran dan barang untuk operasional dapur program SPPG MBG dengan backend Go, Fiber, GORM, dan PostgreSQL, 35 endpoint REST API, serta role-based access control.',
      keypoints: ['row-level locking', 'React', 'TanStack Query'],
    },
    {
      name: 'Backend Developer Intern',
      company: 'Kantor Pertanahan Kabupaten Pangandaran',
      start: '2025-06',
      end: '2025-08',
      description:
        'Mengembangkan layanan backend REST API untuk sistem pengarsipan dengan autentikasi JWT, role-based access control, pencarian berkas, pengajuan dan pelacakan permintaan arsip, serta manajemen riwayat menggunakan Go, Echo, GORM, dan PostgreSQL.',
      keypoints: ['arsitektur berlapis', 'UML'],
    },
  ],

  projects: [
    {
      name: 'Smart Secure QR',
      skills: ['Nuxt', 'Tanda tangan digital', 'REST API'],
      duration: 'Feb 2026 - Mar 2026',
      date: '2026-02-01',
      description:
        'Aplikasi web yang mengamankan QR code dan embedded document dengan tanda tangan digital dan enkripsi berbasis waktu. Setiap pemindaian memeriksa asal dokumen dan menolak kode yang masa berlakunya sudah habis.',
      type: 'Riset',
      photo: 'smart-secure-qr.webp',
      url: '/projects/smart-secure-qr/',
      link: 'https://smart-secure-qrcode.netlify.app',
    },
    {
      name: 'FN-DSA JWT Post-Kuantum',
      skills: [
        'Golang',
        'Fiber',
        'gRPC',
        'FN-DSA',
        'PostgreSQL',
        'k6',
      ],
      duration: 'Feb 2026 - Jul 2026',
      date: '2026-07-01',
      description:
        'Autentikasi post-kuantum untuk task API microservice Go. Token JWT ditandatangani dengan FN-DSA-512, lalu diuji memakai k6: precomputation memangkas latensi penerbitan 24,5%, tetapi saat pengujian beban kedua metode setara dan proses kriptografi hanya 0,3% dari latensi keseluruhan.',
      type: 'Proyek',
      mark: 'PQ',
      url: '/projects/fndsa-jwt/',
      link: 'https://github.com/ridwanmuh3/tasktify',
    },
    {
      name: 'Inventory Dashboard',
      skills: ['Go', 'Fiber', 'PostgreSQL', 'React', 'TypeScript', 'TanStack Query'],
      duration: 'Des 2025 - Mar 2026',
      date: '2025-12-01',
      description:
        'Sistem manajemen anggaran dan barang multi-tenant untuk dapur katering: satu deployment melayani banyak dapur sekaligus. Tersedia 35 endpoint REST API, role-based access control, row-level locking pada modul keuangan dan inventaris bahan baku, serta dasbor analitik.',
      type: 'Produk',
      photo: 'sppg-app.webp',
      url: '/projects/inventory-dashboard/',
      link: 'https://github.com/ridwanmuh3?tab=repositories&q=simba',
    },
    {
      name: 'ECDSA + ML-DSA di Blockchain',
      skills: ['Solidity', 'Golang', 'React', 'Foundry', 'Viem', 'MetaMask'],
      duration: 'Des 2025 - Jun 2026',
      date: '2026-06-01',
      description:
        'Artikel jurnal di ULTIMATICS (SINTA 3) beserta proof of concept di baliknya: skema tanda tangan hibrida ECDSA dan ML-DSA untuk autentikasi transaksi pada blockchain yang kompatibel dengan Ethereum. Penandatanganan post-kuantum dikerjakan off-chain oleh oracle.',
      type: 'Publikasi',
      photo: 'pqc-blockchain.webp',
      url: '/projects/ecdsa-ml-dsa/',
      link: 'https://github.com/ridwanmuh3/hybrid-signature-eth-poc',
    },
    {
      name: 'CinX — Platform Pemesanan Tiket Bioskop',
      skills: ['Vue 3', 'NestJS', 'gRPC', 'PostgreSQL', 'Redis', 'RabbitMQ', 'Xendit'],
      duration: 'Sep 2026 - Okt 2026',
      date: '2026-09-01',
      description:
        'Platform pemesanan tiket bioskop yang dibangun sebagai sistem terdistribusi. Kursi di-hold lima menit dengan lock Redis dan unique constraint di database. Pembayaran Xendit berjalan asinkron, tiket terbit lewat event, dan dana baru dikembalikan setelah penyedia memastikan uang benar-benar kembali.',
      type: 'Proyek',
      mark: 'CX',
      url: '/projects/cinx/',
      link: 'https://github.com/ridwanmuh3/cinx',
    },
  ],
} satisfies SiteContent;
