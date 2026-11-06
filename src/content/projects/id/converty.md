+++
title = 'Converty — Engine Konversi Berkas Sisi Klien'
date = '2026-11-01'
draft = false
description = '15 alat konversi berkas bawaan peramban: tanpa unggah server, Web Worker terisolasi, CSP ketat, dukungan PWA offline penuh.'
photo = 'converty.webp'
link = 'https://github.com/ridwanmuh3/converty'
demo = 'https://ridwanmuh3.github.io/converty'
+++

> Lima belas alat konversi berkas yang berjalan 100% di dalam peramban: tanpa
> unggah ke server, tanpa akun, terisolasi dalam Web Worker, penegakan Content
> Security Policy yang ketat, dan dukungan PWA offline penuh.

| | |
| --- | --- |
| **Jenis** | Portofolio / showcase rekayasa perangkat lunak |
| **Peran** | Solo — desain manifes, alur kerja web worker, penjadwalan memori, arsitektur PWA, perkakas pengujian |
| **Stack** | SvelteKit 3 · Svelte 5 (runes) · TypeScript · Tailwind CSS 4 · Web Workers · WebCodecs · `pdfjs-dist` · `pdf-lib` · `docx` · `jspdf` |
| **Status** | PWA statis siap produksi; berfungsi offline penuh, tanpa ketergantungan server |
| **Repo** | [`converty`](https://github.com/ridwanmuh3/converty) |

---

## 1. Gambaran Proyek

Layanan konversi berkas berbasis web umumnya membawa risiko tersembunyi: privasi
yang terancam, batasan ukuran berkas, hingga pengunggahan dokumen rahasia ke
server pihak ketiga. Tantangan rekayasa utama bukan sekadar merancang antarmuka
masukan berkas — melainkan **menjalankan pemrosesan dokumen, gambar, dan media
langsung di dalam engine peramban** dengan tetap menjaga responsivitas UI,
melindungi memori perangkat pengguna, serta menjamin privasi *zero-trust* yang
terverifikasi.

Converty menghadirkan platform perkakas tanpa server: mengonversi PDF ke Word,
mengekstrak audio dari video menggunakan WebCodecs, mengompresi gambar,
menggabung/memisah PDF, dan mengodekan MP3 — seluruhnya dieksekusi secara lokal
di sisi klien melalui Web Workers.

Implementasi inti bertumpu pada tiga jaminan arsitektur:

1. **Arsitektur pipeline terisolasi worker** — seluruh proses *parser*,
   *decoder*, dan *encoder* yang berat dieksekusi di luar *main thread* melalui
   tujuh berkas worker khusus (`audio`, `document`, `image`, `image-pdf`,
   `pdf-edit`, `pdf-image`, `video`).
2. **Blokir eksfiltrasi jaringan (`connect-src 'self'`)** — Kebijakan Keamanan
   Konten (CSP) menjamin bahwa meskipun terdapat dependensi yang bermasalah,
   peramban secara otomatis memblokir seluruh pengiriman data keluar selama
   konversi berlangsung.
3. **Konkurensi sadar kapasitas dan batas memori** — penjadwal sisi klien
   mendeteksi inti CPU dan RAM untuk menjalankan pemrosesan paralel 2-up pada
   perangkat desktop, serta membatasi ukuran berkas dan memori untuk melindungi
   peramban seluler.

### Ringkasan cepat

| Dimensi | Nilai |
| --- | --- |
| Alat terintegrasi | 15 alat manipulasi & konversi berkas |
| Berkas Web Worker | 7 bundel worker terisolasi (`src/lib/workers/entries/`) |
| Ketergantungan jaringan | 0 endpoint API runtime; 100% aset statis *prerendered* |
| Kebijakan keamanan | CSP ketat (`connect-src 'self'`), tanpa telemetri, tanpa skrip pihak ketiga |
| Batas aman memori | Batas 25 MB per berkas, batas masukan 100 MB per *batch* |
| Anggaran PWA offline | *App shell* tersimpan + batas *cache* worker 50 MB LRU |
| Verifikasi | 115 pengujian E2E Playwright, 306 audit desain/SEO, kalibrasi performa CPU |

### Yang sengaja dibatasi

Converty dirancang khusus sebagai showcase rekayasa *browser-first*. Fitur OCR
berbasis server untuk dokumen hasil pemindaian sengaja ditiadakan untuk
menghindari pembengkakan ukuran bundel aplikasi. Ekspor dokumen PDF menggunakan
metode penyusunan tata letak *block layout* alih-alih mereplikasi engine cetak
peramban (`window.print()`), sehingga generasi dokumen dibatasi pada karakter
Latin (WinAnsi). Penggunaan pustaka FFmpeg WASM yang berat dihindari dan
digantikan oleh API peramban bawaan yang ringan (WebCodecs, `AudioContext`,
`createImageBitmap`).

---

## 2. Fitur

### Pengalaman pengguna dan penerimaan berkas

- **Penerimaan berkas universal** — antarmuka *drag-and-drop* dengan deteksi tipe
  MIME dan ekstensi otomatis, yang langsung mengarahkan berkas ke pilihan format
  konversi yang valid.
- **Konversi *mixed-batch*** — mengonversi berbagai jenis berkas yang berbeda
  dalam satu antrean sekaligus tanpa perlu berpindah halaman alat.
- **Pratinjau hasil instan** — *thumbnail* gambar real-time, penayangan halaman
  pertama PDF pada kanvas, serta visualisasi gelombang dan durasi audio.
- **Penyimpanan opsi lokal** — pengaturan per alat (tingkat kompresi, orientasi
  PDF, rentang halaman) tersimpan secara lokal di `localStorage` dengan tombol
  reset satu klik.
- **Progressive Web App** — aplikasi desktop dan seluler yang dapat diinstal,
  didukung oleh Service Worker yang menyimpan *app shell* untuk penggunaan
  offline penuh.

### Rekayasa dokumen dan PDF

- **Word → PDF** — memproses struktur OOXML secara langsung (`fflate` + *parser*
  tata letak kustom) dan mengalirkan posisi elemen ke dalam struktur blok
  `jsPDF` dan `autoTable`.
- **Excel → PDF** — mengekstrak matriks data lembar kerja melalui SheetJS dan
  menyusun tabel PDF terstruktur.
- **PDF → Word** — mengekstrak posisi teks melalui `pdfjs-dist`, menerapkan
  heuristik spasial baris dan paragraf, lalu menyusun elemen DOCX terstruktur
  menggunakan `docx`.
- **Manipulasi PDF** — penggabungan PDF yang dapat diurutkan ulang (`merge-pdf`)
  dan pemisahan rentang halaman (`split-pdf`) yang dieksekusi melalui `pdf-lib`.
- **Gambar → PDF dan PDF → JPG** — mengonversi gambar menjadi PDF tunggal atau
  multi-halaman; mengubah halaman PDF menjadi gambar JPEG yang digambar pada
  `OffscreenCanvas` dan dikirimkan sebagai berkas ZIP via `fflate`.

### Pemrosesan media dan audio

- **Video → MP3** — mengekstrak trek audio MP4/MOV dengan `mp4box`, men-decode
  audio mentah melalui API `WebCodecs` bawaan peramban, dan mengodekan MP3
  128 kbps di luar *main thread* menggunakan `lamejs`.
- **Transcoding audio** — men-decode audio masukan menggunakan `AudioContext`
  peramban, melakukan *resampling* ke WAV PCM 16-bit, atau mengodekannya ke MP3.
- **Pemrosesan dan kompresi gambar** — konversi format gambar (PNG, JPEG, WebP)
  serta kompresi kualitas/dimensi berbasis klien menggunakan `createImageBitmap`
  dan `OffscreenCanvas`.
- **Konversi HEIC** — *decoding* gambar HEIC/HEIF bawaan menggunakan `heic2any`.

### Rekayasa dan jaminan kualitas

- **Audit keamanan zero-trust** — pengujian E2E otomatis yang menjamin tidak ada
  permintaan HTTP POST/PUT, tanpa *request body*, dan tanpa panggilan ke domain
  pihak ketiga selama proses konversi.
- **Pengujian performa terkalibrasi CPU** — *harness* pengujian performa yang
  menyesuaikan ambang batas waktu eksekusi berdasarkan performa CPU perangkat
  (`test/perf.mjs`).
- **Suite audit desain dan SEO** — 306 pengujian otomatis yang memastikan
  kontras WCAG AA, target sentuh minimum 44 px, navigasi kibor, mode gelap, serta
  skor Lighthouse.

---

## 3. Tech Stack

| Lapisan | Teknologi | Alasan Penggunaan |
| --- | --- | --- |
| **Frontend dan UI** | SvelteKit 3, Svelte 5 (runes), TypeScript, Tailwind CSS 4, `@sveltejs/adapter-static` | Antarmuka reaktif berkinerja tinggi dengan Svelte 5 runes, *prerendered* penuh sebagai HTML/JS statis |
| **Status dan manifes deklaratif** | Manifes alat deklaratif (`src/lib/tools/`) | Sumber kebenaran tunggal untuk rute, penanganan worker, penerimaan berkas, SEO, dan opsi |
| **Sistem worker** | Web Workers (ES Modules), integrasi bundel worker Vite | Pemrosesan di luar *main thread* untuk mengisolasi *parsing* dokumen dan pengodean media |
| **Pemrosesan PDF** | `pdfjs-dist`, `pdf-lib`, `jspdf`, `jspdf-autotable` | Penayangan PDF presisi tinggi, pembuatan PDF biner, serta manipulasi biner tingkat halaman |
| **Pemrosesan dokumen** | `docx`, SheetJS (`xlsx`), `fflate` | *Parsing* OOXML, ekstraksi matriks XLSX, pembuatan DOCX, serta kompresi ZIP |
| **Media dan audio** | WebCodecs API, `mp4box`, `@breezystack/lamejs`, `createImageBitmap`, `heic2any` | *Demuxing* dan *decoding* perangkat keras bawaan peramban dengan pengodean MP3 yang ringan |
| **PWA dan offline** | Service Worker, pembuat manifes *cache* `scripts/build-sw.mjs` | Penyimpanan *app shell* awal dan *cache* worker dinamis dengan batas 50 MB LRU |
| **Pengujian dan audit** | Playwright Chromium, Vitest, audit desain/SEO kustom, kalibrator performa CPU | Pengujian E2E komprehensif, aksesibilitas, validasi CSP, dan batas performa terkalibrasi |

---

## 4. Arsitektur

### Model eksekusi

Aplikasi berjalan sepenuhnya di dalam *sandbox* peramban. *Main thread*
mengelola antarmuka pengguna, navigasi berkas, dan indikator kemajuan, lalu
melimpahkan beban pemrosesan konversi ke Web Worker yang terisolasi.

<button type="button" class="mermaid-zoom" data-lightbox-src="/diagrams/converty-id-1.svg" data-lightbox-alt="Arsitektur eksekusi Converty" data-lightbox-caption="Arsitektur eksekusi Converty" aria-label="Perbesar diagram arsitektur eksekusi Converty"><img src="/diagrams/converty-id-1.svg" width="1993" height="956" loading="lazy" decoding="async" alt="Diagram arsitektur eksekusi Converty" /></button>

### Distribusi worker dan pipeline pemrosesan

| Berkas worker | Alat yang dikelola | Engine inti | Metode transfer data |
| --- | --- | --- | --- |
| `document.worker.ts` | Word → PDF, Excel → PDF, PDF → Word | `pdfjs-dist`, `jspdf`, `fflate`, `docx`, SheetJS | Transfer `ArrayBuffer` |
| `pdf-edit.worker.ts` | Merge PDF, Split PDF | `pdf-lib` | Transfer `ArrayBuffer` |
| `pdf-image.worker.ts` | PDF → JPG | `pdfjs-dist`, `OffscreenCanvas`, `fflate` | `Blob` / *transferable streams* |
| `image-pdf.worker.ts` | Gambar → PDF, JPG → PDF | `pdf-lib` | Transfer `ArrayBuffer` |
| `image.worker.ts` | Konverter gambar, kompresi gambar | `createImageBitmap`, `OffscreenCanvas` | `ImageBitmap` yang dapat ditransfer |
| `audio.worker.ts` | Konverter audio, konverter MP3 | *Decoder* `AudioContext`, *encoder* MP3 `lamejs` | *Buffer* `Float32Array` |
| `video.worker.ts` | MP4 → MP3, video → MP3 | `mp4box`, `AudioDecoder` WebCodecs, `lamejs` | *Chunk* `AudioData` |
| *Main thread* | HEIC → JPG | `heic2any` | Object Blob URL lokal |

### Strategi penegakan privasi

| Area perlindungan | Mekanisme penegakan | Metode validasi |
| --- | --- | --- |
| **Bebas eksfiltrasi data** | CSP `connect-src 'self'` | Peramban menolak seluruh koneksi keluar non-origin |
| **Pencegahan muatan data** | Pemeriksaan HTTP ketat saat pengujian E2E | `test/e2e.mjs` memastikan 0 permintaan POST/PUT dan 0 *request body* |
| **Pelacakan pihak ketiga** | Tanpa telemetri, *font* diinang secara lokal | Pengujian E2E memverifikasi 0 koneksi domain pihak ketiga |
| **Pencegahan kebocoran memori** | Pencabutan object URL secara eksplisit (`URL.revokeObjectURL`) | Divalidasi setelah pengunduhan berkas / pembersihan tugas |

### Siklus hidup tugas

Sebuah tugas tidak pernah menyentuh jaringan. Tugas dijadwalkan, dialihkan ke
worker berdasarkan referensi, dilaporkan sebagai progres, lalu diselesaikan
sebagai Blob yang diserahkan peramban kepada pengguna.

<button type="button" class="mermaid-zoom" data-lightbox-src="/diagrams/converty-id-2.svg" data-lightbox-alt="Siklus hidup konversi Converty" data-lightbox-caption="Siklus hidup konversi Converty" aria-label="Perbesar diagram siklus hidup konversi Converty"><img src="/diagrams/converty-id-2.svg" width="1027" height="961" loading="lazy" decoding="async" alt="Diagram siklus hidup konversi Converty" /></button>

### Model performa dan konkurensi

- **Penjadwalan konkurensi berbasis kapasitas** — perangkat dengan RAM ≥ 8 GB dan
  ≥ 4 inti CPU dapat menjalankan hingga 2 tugas worker secara bersamaan;
  perangkat seluler atau berkapasitas rendah otomatis memakai mode sekuensial
  (1-up).
- **Isolasi alur kerja berat** — operasi dengan beban memori tinggi (seperti
  konversi video atau *parsing* PDF besar) mendapatkan kunci eksekusi eksklusif
  untuk mencegah penurunan laju bingkai pada antarmuka utama.
- **Pengaliran memori** — ekstraksi halaman PDF → JPG mengalirkan hasil JPEG
  langsung ke dalam arsip ZIP `fflate` untuk mencegah lonjakan penggunaan memori.

### Penanganan kegagalan

| Skenario kegagalan | Penanganan di sisi klien | Dampak pada pengguna |
| --- | --- | --- |
| Batas memori terlampaui | Pembaca masukan berkas menolak beban sebelum konversi dimulai | Pesan kesalahan jelas bahwa ukuran atau jumlah halaman melebihi batas |
| Codec audio tidak didukung | Pemeriksaan kapabilitas WebCodecs gagal secara aman | Petunjuk bahwa berkas video butuh *transcoding* |
| Masukan PDF hasil pindai | Pemeriksaan teks mendeteksi tidak ada teks yang dapat dipilih | Pemberitahuan bahwa dokumen pemindaian butuh OCR (di luar cakupan) |
| Worker crash / out-of-memory | Penangan `onerror` pada worker menangkap eksepsi dan menghentikan tugas | Konversi gagal secara terisolasi; aplikasi pada *main thread* tetap stabil |

---

## 5. Model data dan kontrak konversi

Converty tidak menyimpan apa pun. Tidak ada basis data, tidak ada akun, dan tidak
ada catatan konversi di sisi server — persis inilah yang dijaga oleh jaminan CSP.
Satu-satunya model yang persisten adalah **manifes alat deklaratif** di
`src/lib/tools/`: satu record bertipe per alat, yang saat build dikompilasi
menjadi rute, perutean masukan, pengiriman worker, opsi, dan metadata SEO.

<button type="button" class="mermaid-zoom" data-lightbox-src="/diagrams/converty-id-3.svg" data-lightbox-alt="Model manifes alat Converty" data-lightbox-caption="Model manifes alat Converty" aria-label="Perbesar diagram model manifes alat Converty"><img src="/diagrams/converty-id-3.svg" width="1020" height="902" loading="lazy" decoding="async" alt="Diagram model manifes alat Converty" /></button>

Karena manifes adalah model datanya, entri yang salah menjadi kesalahan saat
build, bukan kejutan saat runtime: alat tidak bisa merujuk worker yang tidak ada,
dan tipe MIME yang diterima tidak bisa dideklarasikan dua kali untuk alat yang
sama.

### Matriks konversi

| Alat | Engine pipeline | Tingkat presisi | Batasan teknis / kompromi |
| --- | --- | --- | --- |
| **Word → PDF** | `fflate` + *parser* OOXML → `jsPDF` + `autoTable` | Struktur mendekati asli | Pengodean *font* WinAnsi (hanya karakter Latin); *text box* tidak diproses |
| **Excel → PDF** | SheetJS → matriks lembar kerja → `jspdf-autotable` | Presisi tabel tinggi | Nilai formula dievaluasi; grafik dan gambar ditiadakan |
| **PDF → Word** | Heuristik spasial `pdfjs-dist` → penyusun `docx` | Rekonstruksi teks terstruktur | Tabel diubah menjadi paragraf; gambar ditiadakan |
| **PDF → JPG** | `pdfjs-dist` → `OffscreenCanvas` → ZIP `fflate` | Hasil gambar presisi | Maksimal 50 halaman; teks diubah menjadi piksel |
| **JPG / gambar → PDF** | Penyisipan gambar `pdf-lib` | Kualitas asli gambar | Dimensi halaman 1:1 atau disesuaikan ke A4; metadata dibersihkan |
| **Merge PDF** | Penggabungan halaman `pdf-lib` | Salinan biner *lossless* | Elemen formulir disalin; penanda buku kompleks diratakan |
| **Split PDF** | Ekstraksi halaman `pdf-lib` | Salinan biner *lossless* | Metadata dipertahankan pada tiap sub-berkas hasil ekstraksi |
| **Compress image** | `createImageBitmap` → `OffscreenCanvas` | Kualitas dapat disesuaikan | Batas dimensi kanvas peramban (penyesuaian otomatis di atas 16,7 MP) |
| **Konverter gambar** | Pengodean ulang kanvas `toBlob` | Presisi visual tinggi | GIF animasi diubah menjadi bingkai pertama; tag EXIF dibersihkan |
| **HEIC → JPG** | *Decoder main-thread* `heic2any` | Presisi warna tinggi | Dieksekusi di *main thread* karena keterbatasan pustaka |
| **MP4 / video → MP3** | *Demuxer* `mp4box` → WebCodecs → `lamejs` | Audio MP3 jernih 128 kbps | Membutuhkan dukungan codec peramban; batas durasi 30 menit |
| **Konverter audio / MP3** | *Decode* `AudioContext` → *encode* `lamejs` | MP3 konstan 128 kbps | Batas durasi audio 10 menit dan *buffer* eksekusi 200 MB |

### Keputusan desain arsitektural

- **Penyusunan tata letak jsPDF vs `window.print()`** — `window.print()`
  menghasilkan tipografi yang sedikit lebih baik, tetapi membutuhkan dialog
  interaktif pengguna sehingga tidak dapat mendukung proses *batching*,
  pemantauan kemajuan, maupun pembuatan berkas ZIP. `jsPDF` memungkinkan
  pemrosesan *batch* dan penanganan latar belakang penuh di dalam worker.
- **WebCodecs vs FFmpeg WASM** — ukuran bundel FFmpeg WASM mencapai 20–30 MB.
  Menggunakan fitur bawaan peramban `WebCodecs` untuk *demuxing* dan *decoding*
  menekan ukuran unduhan awal hingga di bawah 50 KB untuk alat media.

---

## 6. Trade-off

| Keputusan | Keuntungan | Biaya | Penanganan risiko |
| --- | --- | --- | --- |
| **Pemrosesan 100% sisi klien** | Privasi mutlak, tanpa biaya server, dapat berjalan offline | Tergantung pada spesifikasi CPU dan RAM perangkat pengguna | Batasan memori yang aman (25 MB per berkas, masukan *batch* 100 MB) |
| **WebCodecs dibandingkan FFmpeg WASM** | Ukuran bundel JS sangat kecil, waktu muat cepat | Tergantung pada dukungan codec peramban | Pesan penanganan kesalahan yang jelas jika codec tidak didukung |
| **Engine dokumen `jsPDF`** | Pembuatan PDF secara terprogram di dalam worker tanpa pop-up UI | Batasan pengodean *font* Latin (WinAnsi) | Umpan balik langsung jika karakter non-Latin terdeteksi |
| **Manifes deklaratif tunggal** | Navigasi, pemanggilan worker, dan metadata SEO terintegrasi | Membutuhkan validasi ketat saat kompilasi | Pemeriksaan *build-time* memastikan konsistensi struktur manifes |
| **Cache PWA offline** | Halaman langsung terbuka tanpa koneksi internet | Menggunakan kuota penyimpanan lokal hingga 50 MB | Pembersihan *cache* worker otomatis dengan batas 50 MB LRU |

### Yang akan ditambahkan untuk skala lebih besar

- Mengintegrasikan **Tesseract.js WASM** untuk ekstraksi teks OCR pada halaman
  PDF hasil pemindaian.
- Menerapkan ***subsetting font* WebAssembly** (HarfBuzz / FreeType) untuk
  mendukung generasi PDF berbasis aksara CJK dan non-Latin.
- Memanfaatkan **pengodean perangkat keras WebGPU / WebCodecs** untuk
  *transcoding* video penuh di sisi klien.

---

## 7. Kesimpulan

Converty dirancang dengan satu prinsip utama yang tidak dapat ditawar: **tidak
ada satu byte pun data pengguna yang keluar dari peramban, dan tidak ada server
yang memproses berkas pengguna.**

Prinsip tersebut dicapai melalui lapisan jaminan teknis:

- **Web Workers** memastikan tugas berat dieksekusi di luar *main thread* agar
  antarmuka pengguna tetap lancar.
- **Content Security Policy yang ketat** menjamin secara mutlak bahwa tidak ada
  data yang terkirim ke luar.
- **Manifes deklaratif tunggal** memastikan navigasi, pemanggilan worker, dan
  opsi berkas tetap teratur dan *type-safe*.
- **Engine peramban bawaan (WebCodecs, `AudioContext`, Canvas)** menggantikan
  pustaka WASM yang berat untuk menjaga ukuran unduhan tetap minim.
- **Penyimpanan cache Service Worker** mengubah aplikasi menjadi alat offline
  yang tangguh.

Converty membuktikan bahwa aplikasi web dapat menghadirkan pemrosesan dokumen dan
media berkinerja tinggi tanpa mengorbankan privasi pengguna maupun mengeluarkan
biaya operasional server.

### Bacaan lebih lanjut

- [`README.md`](https://github.com/ridwanmuh3/converty/blob/main/README.md) — memulai cepat dan gambaran proyek
- [`ROADMAP.md`](https://github.com/ridwanmuh3/converty/blob/main/ROADMAP.md) — arsitektur, manifes inti, dan fase pengembangan
- [`src/lib/tools/`](https://github.com/ridwanmuh3/converty/tree/main/src/lib/tools) — implementasi manifes deklaratif alat
