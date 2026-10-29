import type { SiteContent } from './types';

export const en = {
  hero: {
    tagline: 'I build REST APIs and backend services with Go, NestJS, and PostgreSQL.',
  },

  sections: {
    skills: { title: '// Skills' },
    projects: { title: '// Projects' },
    blogs: { title: '// Blogs' },
    education: { title: '// Education' },
    experiences: { title: '// Experience' },
    cta: {
      title: "// Let's Work Together",
      body: "Hiring a Backend Developer? I'm open to full-time or contract, hybrid, remote, or onsite in Indonesia.",
      cta_label: 'Contact me',
      cta_href: '/contact/',
    },
  },

  pages: {
    projects: {
      title: 'Projects',
      body: 'Project write-ups, most recent first.',
    },
    blogs: {
      title: 'Blogs',
      body: 'Notes on backend engineering: problems I have run into, decisions I have had to revisit, and conclusions worth recording.',
    },
    contact: {
      title: 'Contact',
      body: 'Send a brief note about the problem and the stack involved. It goes straight to my inbox. I generally reply within one to two days.',
    },
  },

  skills: [
    { label: 'Languages & Frameworks', items: [
      { name: 'Go' }, { name: 'TypeScript' }, { name: 'Node.js' },
      { name: 'NestJS' }, { name: 'Fiber' }, { name: 'Echo' },
      { name: 'Nuxt' }, { name: 'React' }, { name: 'Vue' },
    ] },
    { label: 'Data & Messaging', items: [
      { name: 'PostgreSQL' }, { name: 'Redis' },
      { name: 'gRPC' }, { name: 'GORM' },
    ] },
    { label: 'Auth & Crypto', items: [
      { name: 'JWT' }, { name: 'Solidity' }, { name: 'Foundry' },
    ] },
    { label: 'Performance Testing', items: [
      { name: 'k6' },
    ] },
    { label: 'Platform & Tooling', items: [
      { name: 'Docker' }, { name: 'Linux' }, { name: 'Git' },
      { name: 'GitHub' }, { name: 'Google Cloud Platform' }, { name: 'Postman' },
    ] },
    { label: 'AI Tools', items: [
      { name: 'OpenCode' }, { name: '9router' },
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
      href: "https://wa.me/6285793516167?text=Hello%20Ridwan!%20Let's%20connect!",
    },
    {
      icon: 'brand-linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/ridwanmuh3',
    },
  ],

  education: [
    {
      name: 'Bachelor of Informatics (S1)',
      company: 'Universitas Siliwangi',
      start: '2022-08',
      end: '2026-07',
      gpa: '3.74/4.00',
      description:
        'Focused on the Computer Networks, Security, and Digital Forensics (JKF) track, especially cryptography.',
    },
  ],

  experiences: [
    {
      name: 'Research Assistant',
      company: 'Universitas Siliwangi',
      start: '2026-02',
      end: '2026-03',
      description:
        'Implemented a web-based research system securing QR codes and embedded documents, built with Nuxt 4 and exposing 12 REST API endpoints for document issuance and verification.',
      keypoints: ['digital signature', 'time-based encryption'],
    },
    {
      name: 'Full Stack Web Developer',
      company: 'SPPG Sinar Asri',
      start: '2025-12',
      end: '2026-03',
      description:
        'Built a budget and goods management system for the kitchen operations of the SPPG MBG program with a Go, Fiber, GORM, and PostgreSQL backend, 35 REST API endpoints, and role-based access control.',
      keypoints: ['row-level locking', 'React', 'TanStack Query'],
    },
    {
      name: 'Backend Developer Intern',
      company: 'Kantor Pertanahan Kabupaten Pangandaran',
      start: '2025-06',
      end: '2025-08',
      description:
        'Built the REST API backend for an archive system with JWT authentication, role-based access control, file search, archive request submission and tracking, and history management using Go, Echo, GORM, and PostgreSQL.',
      keypoints: ['layered architecture', 'UML'],
    },
  ],

  projects: [
    {
      name: 'Smart Secure QR',
      skills: ['Nuxt', 'Digital signature', 'REST API'],
      duration: 'Feb 2026 - Mar 2026',
      date: '2026-02-01',
      description:
        'Web application securing QR codes and embedded documents with a digital signature and time-based encryption. Each scan verifies where the code originated and rejects it once its validity period has passed.',
      type: 'Research',
      photo: 'smart-secure-qr.webp',
      url: '/projects/smart-secure-qr/',
      link: 'https://smart-secure-qrcode.netlify.app',
    },
    {
      name: 'Post-Quantum FN-DSA JWT',
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
        'Post-quantum authentication for a Go microservices task API: FN-DSA-512 JWT signing benchmarked with k6. Precomputation cut issuance latency 24.5%, but under stress both methods matched and cryptography stayed below 0.3% of total latency.',
      type: 'Project',
      mark: 'PQ',
      url: '/projects/fndsa-jwt/',
      link: 'https://github.com/ridwanmuh3/tasktify',
    },
    {
      name: 'Inventory Dashboard',
      skills: ['Go', 'Fiber', 'PostgreSQL', 'React', 'TypeScript', 'TanStack Query'],
      duration: 'Dec 2025 - Mar 2026',
      date: '2025-12-01',
      description:
        'Multi-tenant budget and goods management system for a catering kitchen, with 35 REST API endpoints, role-based access control, row-level locking on the finance and raw-material inventory modules, and analytics dashboards.',
      type: 'Product',
      photo: 'sppg-app.webp',
      url: '/projects/inventory-dashboard/',
      link: 'https://github.com/ridwanmuh3?tab=repositories&q=simba',
    },
    {
      name: 'ECDSA + ML-DSA on Blockchain',
      skills: ['Solidity', 'Golang', 'React', 'Foundry', 'Viem', 'MetaMask'],
      duration: 'Dec 2025 - Jun 2026',
      date: '2026-06-01',
      description:
        'Journal article in ULTIMATICS (SINTA 3) and the proof of concept behind it: a hybrid ECDSA and ML-DSA signature scheme for transaction authentication on an Ethereum-compatible blockchain, with post-quantum signing handled off-chain by an oracle.',
      type: 'Publication',
      photo: 'pqc-blockchain.webp',
      url: '/projects/ecdsa-ml-dsa/',
      link: 'https://github.com/ridwanmuh3/hybrid-signature-eth-poc',
    },
    {
      name: 'CinX — Cinema Ticketing Platform',
      skills: ['Vue 3', 'NestJS', 'gRPC', 'PostgreSQL', 'Redis', 'RabbitMQ', 'Xendit'],
      duration: 'Sep 2026 - Oct 2026',
      date: '2026-09-01',
      description:
        'Cinema ticketing built as a distributed system: five-minute seat holds backed by Redis locks and a database unique constraint, asynchronous Xendit payments, event-driven ticket issuance, and refunds that follow the money instead of flipping a status flag.',
      type: 'Project',
      mark: 'CX',
      url: '/projects/cinx/',
      link: 'https://github.com/ridwanmuh3/cinx',
    },
  ],
} satisfies SiteContent;
