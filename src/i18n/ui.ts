import type { Lang } from '../config';

/**
 * UI strings, extracted from i18n/{en,id}.toml.
 * Strings may contain HTML (rendered with set:html, as in Hugo) or {placeholders}.
 */
const en = {
  skipToContent: 'Skip to content',

  viewCv: 'View CV',

  contactMe: 'Contact me',
  navMain: 'Main navigation',
  navHome: '{name}, home',
  navMenu: 'Menu',
  langSwitchTo: 'Switch to {language}',

  allRightsReserved: 'All rights reserved',
  poweredBy: 'Powered by <a href="https://astro.build/" class="link-accent">Astro</a>',

  nothingPublishedHere: 'Nothing published here yet.',
  emptyBlogs:
    'Posts are still being written. In the meantime, the work itself is listed on the <a href="{url}" class="link-accent">projects page</a>.',
  emptyOther:
    'Write-ups are in preparation. The <a href="{url}" class="link-accent">homepage</a> lists the work completed so far.',

  seeMore: 'View more',

  pagination: 'Pagination',
  paginationPrev: 'Previous',
  paginationNext: 'Next',

  contactFormTitle: '// Send a message',
  contactFormBody: 'Goes straight to my inbox. I read every one.',
  contactName: 'Name',
  contactEmail: 'Email',
  contactMessage: 'Message',
  contactMessagePlaceholder: 'What role are you hiring for?',
  contactSend: 'Send message',
  contactSending: 'Sending…',
  contactSent: 'Sent. I will reply to that address.',
  contactInvalidName: 'Please enter your name.',
  contactInvalidEmail: 'That email address does not look right.',
  contactInvalidMessage: 'Please write a little more (at least 10 characters).',
  contactError:
    'The message could not be sent. WhatsApp above is the quickest alternative.',
  contactRateLimited:
    'That is several messages in an hour. Try WhatsApp above instead.',
  contactNeedsJs:
    'The message form needs JavaScript. The channels above work without it.',

  minRead: 'min read',
  viewProject: 'View project',
  backTo: 'Back to {title}',
  navSection: 'Section',

  projectScreenshot: 'Screenshot of {title}',
  projectType: 'Type',
  projectTimeline: 'Timeline',
  projectStack: 'Stack',
  techStack: 'Tech stack',
  gpa: 'GPA',
  present: 'Present',

  imageEnlarge: 'Tap to enlarge: {title}',
  imageViewer: 'Screenshot viewer',
  imageClose: 'Close viewer',
  imageZoom: 'Zoom',
  imageZoomIn: 'Zoom in',
  imageZoomOut: 'Zoom out',
  imageFit: 'Fit',
  diagramZoom: 'Enlarge diagram',
  mediaViewer: 'Image and diagram viewer',

  error404Title: '// 404 Not Found',
  error404Body:
    'This page has been moved or never existed. Nothing is at fault on your end.',
  startFromHomepage:
    'Or <a href="{url}" class="link-accent">start from the homepage</a>.',
} as const;

export type UIKey = keyof typeof en;

const id: Record<UIKey, string> = {
  skipToContent: 'Lewati ke konten',

  viewCv: 'Lihat CV',

  contactMe: 'Hubungi saya',
  navMain: 'Navigasi utama',
  navHome: '{name}, beranda',
  navMenu: 'Menu',
  langSwitchTo: 'Ganti ke {language}',

  allRightsReserved: 'Hak cipta dilindungi undang-undang',
  poweredBy:
    'Dibangun dengan <a href="https://astro.build/" class="link-accent">Astro</a>',

  nothingPublishedHere: 'Belum ada konten yang diterbitkan di sini.',
  emptyBlogs:
    'Tulisan masih dalam proses penulisan. Sementara itu, karya yang sudah ada dapat dilihat di <a href="{url}" class="link-accent">halaman proyek</a>.',
  emptyOther:
    'Tulisan sedang dipersiapkan. <a href="{url}" class="link-accent">Halaman utama</a> memuat pekerjaan yang telah diselesaikan sejauh ini.',

  seeMore: 'Lihat lainnya',

  pagination: 'Navigasi halaman',
  paginationPrev: 'Sebelumnya',
  paginationNext: 'Berikutnya',

  contactFormTitle: '// Kirim pesan',
  contactFormBody: 'Pesan langsung masuk ke kotak masuk saya. Semuanya saya baca.',
  contactName: 'Nama',
  contactEmail: 'Email',
  contactMessage: 'Pesan',
  contactMessagePlaceholder: 'Anda sedang merekrut untuk posisi apa?',
  contactSend: 'Kirim pesan',
  contactSending: 'Mengirim…',
  contactSent: 'Terkirim. Saya akan membalas ke alamat tersebut.',
  contactInvalidName: 'Mohon isi nama Anda.',
  contactInvalidEmail: 'Sepertinya alamat email tersebut tidak tepat.',
  contactInvalidMessage: 'Mohon tulis sedikit lebih panjang (minimal 10 karakter).',
  contactError: 'Pesan gagal dikirim. WhatsApp di atas adalah alternatif tercepat.',
  contactRateLimited:
    'Anda sudah mengirim beberapa pesan dalam satu jam. Silakan gunakan WhatsApp di atas.',
  contactNeedsJs:
    'Formulir pesan memerlukan JavaScript. Saluran di atas tetap berfungsi tanpanya.',

  minRead: 'menit baca',
  viewProject: 'Lihat proyek',
  backTo: 'Kembali ke {title}',
  navSection: 'Bagian',

  projectScreenshot: 'Tangkapan layar {title}',
  projectType: 'Jenis',
  projectTimeline: 'Periode',
  projectStack: 'Teknologi',
  techStack: 'Teknologi',
  gpa: 'IPK',
  present: 'Sekarang',

  imageEnlarge: 'Ketuk untuk memperbesar: {title}',
  imageViewer: 'Penampil tangkapan layar',
  imageClose: 'Tutup penampil',
  imageZoom: 'Perbesar',
  imageZoomIn: 'Perbesar',
  imageZoomOut: 'Perkecil',
  imageFit: 'Pas',
  diagramZoom: 'Perbesar diagram',
  mediaViewer: 'Penampil gambar dan diagram',

  error404Title: '// 404 Tidak Ditemukan',
  error404Body:
    'Halaman ini mungkin telah dipindahkan atau memang tidak pernah ada. Ini bukan kesalahan Anda.',
  startFromHomepage:
    'Atau <a href="{url}" class="link-accent">mulai dari halaman utama</a>.',
};

export const ui = { en, id };

export function t(
  lang: Lang,
  key: UIKey,
  params?: Record<string, string | number>,
): string {
  const template: string = ui[lang][key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    String(params[name] ?? `{${name}}`),
  );
}
