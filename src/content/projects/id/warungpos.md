+++
title = 'Warung POS — Aplikasi Kasir untuk Warung Indonesia'
date = '2026-11-01'
draft = false
description = 'Alur kasir web yang menyatukan penjualan, stok, kas laci bersama, dan laporan harian untuk warung — checkout otoritatif server dengan QRIS Xendit dan kredit pelanggan (Ngutang).'
photo = 'warungpos.webp'
link = 'https://github.com/ridwanmuh3/warung-pos'
demo = 'https://warungdotpos.netlify.app'
+++

> Alur kasir berbasis web yang menyatukan penjualan, stok, kas laci bersama, dan
> laporan harian. Aturan pembukuan dibuat eksplisit, bukan diserahkan kepada
> kumpulan halaman CRUD yang terpisah.

| | |
| --- | --- |
| **Jenis** | Proyek full-stack / showcase rekayasa perangkat lunak |
| **Peran** | Solo — alur produk, UI, aturan domain, backend, model data, pengujian |
| **Stack** | React 19 · TanStack Start / Router · TypeScript · Tailwind CSS 4 · Turso / libSQL · Drizzle ORM · Cloudflare R2 · Xendit |
| **Status** | Aplikasi terimplementasi; integrasi pembayaran perlu verifikasi end-to-end sebelum dipakai untuk uang sungguhan |
| **Repo** | [`warung-pos`](https://github.com/ridwanmuh3/warung-pos) |

---

## 1. Gambaran Proyek

Sebuah warung kecil bisa menyelesaikan penjualan dalam hitungan detik, tetapi
masih harus menghabiskan malam untuk mencocokkan tiga catatan terpisah: apa yang
terjual, apa yang tersisa di rak, dan apa yang seharusnya ada di laci. Warung POS
memberi ketiga catatan itu satu alur operasional. Kasir memilih produk, menerima
pembayaran, dan mencetak struk; pemilik melihat penjualan, biaya, kredit
pelanggan yang belum tertagih, serta selisih antara kas yang diharapkan dan kas
yang dihitung.

Bagian sulitnya bukan menampilkan total. Bagian sulitnya adalah menjaga fakta
yang berbeda tetap berbeda: **penjualan tidak sama dengan uang yang diterima**,
**stok di rak tidak selalu menjadi batas yang otoritatif**, dan **order yang
di-void setelah laci ditutup tidak sama dengan uang yang di-refund dari laci
berikutnya**. Aplikasi memodelkan perbedaan itu secara eksplisit alih-alih
menyimpulkannya dari satu label pembayaran.

Inti desainnya memakai checkout otoritatif server. Keranjang di peramban tetap
responsif dan bertahan setelah muat ulang, tetapi server membaca ulang harga dan
HPP produk, menghitung total, menghabiskan keranjang terbuka, menomori order, dan
mencatat pergerakan stok. `orders.cart_id` yang unik mencegah checkout berulang
atas keranjang yang sama menghasilkan penjualan kedua.

### Ringkasan cepat

| Dimensi | Implementasi |
| --- | --- |
| Aplikasi | Satu aplikasi TanStack Start: situs publik plus POS terautentikasi |
| Multi-tenant | Satu tenant per warung; pengguna bergabung lewat membership `owner`, `manager`, atau `cashier` |
| Checkout | Tunai, QRIS Xendit bila dikonfigurasi, dan kredit pelanggan (`Ngutang`) |
| QRIS | Payment request nominal tetap, order pending, webhook, cek status, perpanjangan/pembatalan QR |
| Inventaris | Stok terlacak atau `null` untuk yang tidak dilacak; stock movement menyimpan riwayat perubahan |
| Kas | Satu shift laci bersama per tenant; saldo awal, kas diharapkan, kas dihitung, selisih |
| Pelaporan | Pendapatan dan laba harian, komposisi pembayaran, produk terlaris, jam sibuk, CSV dan Z-report |
| Verifikasi | Suite Vitest, TypeScript, oxlint, pemeriksaan tenant-scoping dan batas impor |

### Yang sengaja dibatasi

Ini aplikasi yang berjalan, bukan klaim bahwa sebuah warung bisa memindahkan uang
sungguhan dengan aman tanpa validasi deployment. Checkout membutuhkan koneksi ke
server; ini bukan POS offline. QR mode uji tidak membuktikan bahwa penerbitan QR
produksi dan pengiriman callback berjalan di akun Xendit sungguhan. Pelunasan
kredit dicatat penuh, bukan bertahap. Struk dicetak lewat dialog cetak peramban;
tidak ada integrasi printer termal langsung. Tidak ada klaim benchmark beban,
ketersediaan multi-region, atau service level produksi.

---

## 2. Fitur

### Alur kasir

- **Cari dan masukkan produk** — cari berdasarkan nama, SKU, atau barcode;
  pemindai keyboard-wedge dapat mengirim kode lalu Enter. Filter kategori dan
  label stok menipis membantu navigasi.
- **Keranjang responsif** — interaksi local-first bertahan setelah refresh;
  keranjang terbuka disinkronkan ke server, dan keranjang bisa diparkir lalu
  dilanjutkan. Perubahan harga katalog ditampilkan sebelum checkout.
- **Checkout tunai** — nominal cepat, kembalian otomatis, diskon nominal atau
  persentase, dan struk yang dapat dicetak lewat peramban.
- **QRIS dinamis** — bila dikonfigurasi, Xendit membuat QR nominal tetap untuk
  order pending. Layar menunggu melakukan polling status pembayaran lokal dan
  menyediakan cek status langsung ke penyedia, pembuatan ulang, atau pembatalan.
  Aksi simulasi sandbox hanya muncul dengan kunci uji.
- **Kredit pelanggan** — `Ngutang` mencatat penjualan selesai dengan saldo belum
  lunas dan nama pelanggan. Pelunasan berikutnya mencatat metode dan, untuk
  tunai, laci yang menerimanya. Pendapatan diakui sekali saat penjualan; kredit
  berjalan ditampilkan terpisah.
- **Konteks order** — kanal (`dine-in`, `takeaway`, `delivery`) dan nama tampilan
  kasir opsional muncul di struk dan riwayat.

### Alur pemilik dan manajer

- **Katalog dan stok** — kelola harga, harga pokok (HPP), jumlah stok opsional,
  ambang restock, SKU, barcode, dan gambar produk di Cloudflare R2. Setiap
  penyesuaian stok terlacak menulis satu movement.
- **Laci bersama** — buka dengan saldo awal, lalu tutup terhadap kas fisik. Kas
  diharapkan menghitung penjualan tunai dan pelunasan atau refund tunai yang
  relevan, bukan setiap transaksi yang berlabel pendapatan.
- **Pelaporan harian** — pendapatan, biaya, laba kotor setelah diskon, margin,
  penjualan per metode dan kategori, produk teratas, jam sibuk, rincian kanal,
  dan tren tujuh hari. Ekspor CSV atau Z-report yang bisa dicetak.
- **Koreksi dengan riwayat** — void penjualan lunas selama shift asalnya masih
  terbuka; setelah shift itu ditutup, catat refund terhadap laci yang membayarnya.
  Kembalikan stok terlacak dan pertahankan order serta alasannya.
- **Akses tim** — pemilik mengelola membership; pemeriksaan peran di sisi server
  membatasi aksi. Seorang pengguna dapat tergabung di lebih dari satu tenant.

### Perilaku platform

- **Situs publik, POS privat** — beranda tampil tanpa sesi; rute terautentikasi
  membaca cookie terenkripsi HTTP-only dan menegakkan membership di server.
- **Onboarding tanpa penjualan palsu** — pemilik baru melihat katalog kosong dan
  daftar periksa penyiapan, bukan transaksi contoh.
- **Pemulihan data lama** — jalur impor eksplisit membantu memindahkan data lama
  yang tersimpan di peramban ke basis data berbasis tenant.
- **Gambar produk browser-first** — server menandatangani unggahan ke R2;
  pembacaan gambar melewati proksi `/img` same-origin milik aplikasi.

---

## 3. Tech Stack

| Lapisan | Teknologi | Alasan Penggunaan |
| --- | --- | --- |
| **UI dan routing** | React 19, TypeScript, TanStack Start / Router | SSR untuk halaman publik, rute dan loader bertipe untuk POS, server function untuk mutasi |
| **Styling dan motion** | Tailwind CSS 4, Tabler Icons, animasi CSS, GSAP | UI seluler dan desktop; animasi masuk CSS tetap jalan sebelum runtime scroll-motion opsional dimuat |
| **Domain dan validasi** | Aturan TypeScript murni, Zod 4 | Satu tempat untuk aturan harga, siklus pembayaran, laci, dan pelaporan; validasi di batas server |
| **Data** | Turso / libSQL, Drizzle ORM, skema SQLite | Order transaksional, keranjang, pergerakan stok, membership, dan percobaan pembayaran dalam satu basis data |
| **Pembayaran** | Xendit Payments API v3, rute webhook, `qrcode.react` | Pembuatan dan tampilan QRIS nominal tetap; pelunasan asinkron dan rekonsiliasi manual |
| **Gambar** | Cloudflare R2, presigned upload | Gambar produk tanpa mengalirkan unggahan berkas melalui server aplikasi |
| **Deployment** | Vite, Netlify Functions | Build full-stack dan rute sisi server pada satu origin |
| **Pemeriksaan** | Vitest, TypeScript, oxlint, skrip penjaga repositori | Uji aturan murni, uji integrasi, pemeriksaan tipe, tenant-scoping dan batas impor |

---

## 4. Arsitektur

### Bentuk sistem

Warung POS adalah monolit modular, bukan jaringan service. Peramban berbicara ke
origin TanStack Start. Loader rute dan server function memanggil modul data yang
sadar tenant; modul itu memakai Drizzle terhadap libSQL. Pembuatan dan
rekonsiliasi pembayaran memanggil Xendit dari server, sementara unggahan gambar
produk langsung ke R2 memakai permintaan bertanda tangan server.

<button type="button" class="mermaid-zoom" data-lightbox-src="/diagrams/warungpos-id-1.svg" data-lightbox-alt="Arsitektur sistem Warung POS" data-lightbox-caption="Arsitektur sistem Warung POS" aria-label="Perbesar diagram arsitektur sistem Warung POS"><img src="/diagrams/warungpos-id-1.svg" width="876" height="1032" loading="lazy" decoding="async" alt="Diagram arsitektur sistem Warung POS" /></button>

### Batas kepemilikan

| Batas | Tanggung jawab |
| --- | --- |
| `src/routes/` | Halaman publik, rute terautentikasi, loader, endpoint callback |
| `src/features/` | Layar checkout, katalog, penjualan, dan shift beserta server function-nya |
| `src/domain/` | Aturan murni harga, siklus penjualan, laci, pelaporan, dan hari bisnis |
| `src/lib/data/*.server.ts` | SQL dan transaksi yang sadar tenant; sebagian infrastruktur lama masih di `src/lib/` |
| `src/db/schema.ts` | Tabel, indeks, dan batasan relasional |
| `src/server/payments/xendit.server.ts` | Format wire Xendit, autentikasi, permintaan QR, dan panggilan status |

### Checkout dan pembayarannya

<button type="button" class="mermaid-zoom" data-lightbox-src="/diagrams/warungpos-id-2.svg" data-lightbox-alt="Urutan checkout dan QRIS Warung POS" data-lightbox-caption="Urutan checkout dan QRIS Warung POS" aria-label="Perbesar diagram urutan checkout dan QRIS Warung POS"><img src="/diagrams/warungpos-id-2.svg" width="1584" height="1153" loading="lazy" decoding="async" alt="Diagram urutan checkout dan QRIS Warung POS" /></button>

1. Peramban memperbarui keranjang lokal; sinkronisasi keranjang menyimpan
   keranjang terbuka untuk pengguna dan tenant yang sedang masuk.
2. Checkout mem-flush keranjang itu. Server membaca harga dan HPP terkini,
   memvalidasi permintaan, menghitung nominal, lalu membuat order secara atomik
   sambil menghabiskan keranjang dan mencatat perubahan stok terlacak.
3. Tunai dan kredit selesai di aplikasi seketika, dengan semantik uang yang
   berbeda. QRIS membuat order `pending` dan meminta QR ke Xendit. Penjualan
   pending **tidak** dihitung sebagai pendapatan lunas.
4. Xendit mengembalikan aksi `QR_STRING` untuk ditampilkan; kasir menyajikan QR
   itu. Callback memverifikasi token dan mencocokkan `reference_id` yang unik
   global ke percobaan pembayaran tersimpan, bukan memercayai tenant ID dari
   badan webhook.
5. Capture sukses dengan nominal yang sesuai menandai payment dan order lunas.
   Polling terhadap state tersimpan menangani penantian normal; cek status
   eksplisit menanyakan langsung ke Xendit saat callback tertunda atau hilang.

Pembuatan QR dan pengiriman callback adalah dua langkah terpisah. Mengonfigurasi
callback saja tidak membuat QR muncul: permintaan awal ke penyedia harus berhasil
dan mengembalikan string QR.

### Konsistensi dan penanganan kegagalan

| Kasus | Perilaku dan batas |
| --- | --- |
| Checkout berulang / tab kedua | `orders.cart_id` unik; checkout memakai ulang order untuk keranjang yang sudah dihabiskan |
| Harga produk berubah | Server memberi harga dari katalog terkini; UI memperingatkan harga keranjang yang basi |
| Oversell | Peringatkan-dan-izinkan: stok terlacak boleh negatif karena hitungan rak bisa basi; movement mencatat delta sebenarnya |
| Permintaan QR gagal | Order tetap pending; percobaan ditandai gagal; kasir bisa membuat QR baru atau membatalkan tanpa memasukkan ulang item |
| QR kedaluwarsa | Layar menawarkan perpanjangan atau pembatalan; pembayaran terlambat yang terkonfirmasi tetap bisa menyelesaikan percobaan kedaluwarsa |
| Callback duplikat atau hilang | Sinyal berulang tidak boleh menggandakan pelunasan; rekonsiliasi manual ke penyedia dapat memperbaiki callback yang terlewat |
| Pembayaran setelah pembatalan | Tidak diam-diam ditandai lunas pada order yang di-void; dicatat sebagai anomali yang butuh penanganan refund manual |
| Refund setelah shift tutup | Dicatat terhadap laci yang membayarnya; ini koreksi kas/inventaris internal, **bukan** refund otomatis lewat Xendit |

---

## 5. ERD

Satu basis data libSQL menyimpan data bisnis warung. Sumber kebenarannya adalah
[`src/db/schema.ts`](https://github.com/ridwanmuh3/warung-pos/blob/main/src/db/schema.ts).
Garis solid adalah foreign key; garis putus-putus adalah referensi **logis** —
`product_id` pada baris item terjual adalah snapshot, bukan constraint.

<button type="button" class="mermaid-zoom" data-lightbox-src="/diagrams/warungpos-id-3.svg" data-lightbox-alt="Relasi basis data Warung POS" data-lightbox-caption="Relasi basis data Warung POS" aria-label="Perbesar diagram relasi basis data Warung POS"><img src="/diagrams/warungpos-id-3.svg" width="2553" height="2286" loading="lazy" decoding="async" alt="Diagram relasi basis data Warung POS" /></button>

### Entitas

| Entitas | Peran bisnis |
| --- | --- |
| `users`, `tenants`, `memberships` | Identitas login global, batas warung, dan peran per warung |
| `products`, `stock_movements` | Katalog dan perubahan inventaris append-only; `stock = null` berarti tidak dilacak |
| `carts`, `cart_items` | Satu keranjang terbuka per konteks pengguna, keranjang diparkir, dan snapshot masukan saat penjualan |
| `orders`, `order_items`, `counters` | Penjualan bernomor, snapshot baris yang tidak berubah, nomor order monoton per tenant |
| `shifts` | Saldo awal laci bersama, kas dihitung, kas diharapkan, dan selisih |
| `payments` | Percobaan QRIS: referensi kita, ID Xendit, string QR, nominal, kedaluwarsa, dan status |

### Batasan yang membawa makna bisnis

| Batasan / aturan | Tujuan |
| --- | --- |
| `UNIQUE (tenant_id, order_number)` dan counter `(tenant_id, key)` | Mencegah tabrakan nomor dan pemakaian ulang setelah void |
| `UNIQUE (cart_id)` pada `orders` | Satu keranjang menjadi paling banyak satu order |
| `UNIQUE (tenant_id, user_id)` pada `memberships` | Satu peran per pengguna di tiap warung |
| `UNIQUE (tenant_id, sku)` dan `(tenant_id, barcode)` | Menghindari kode produk duplikat dalam satu warung, bukan antar warung |
| `UNIQUE (reference_id)` pada `payments` | Mencocokkan callback ke percobaan yang benar tanpa menerima tenant dari pemanggil |
| Kecocokan nominal rupiah bulat sebelum pelunasan QRIS | Capture dengan nominal berbeda tidak pernah diam-diam melunasi order |

### Catatan desain

Baris item menyimpan snapshot nama, kunci gambar, harga, dan HPP sehingga
perubahan katalog di kemudian hari tidak bisa menulis ulang struk atau
perhitungan laba masa lalu. Uang memakai rupiah bulat. Setiap kolom `tenant_id`
bersifat `NOT NULL`; isolasi ditegakkan oleh kueri server yang terfilter tenant
dan pengujiannya, bukan oleh row-level security basis data. Sebagian referensi
sengaja lunak (teks tanpa foreign key).

---

## 6. Trade-off

| Keputusan | Keuntungan | Biaya | Penanganan |
| --- | --- | --- | --- |
| **Satu aplikasi full-stack** alih-alih microservice | Jalur pendek dari UI kasir ke penjualan transaksional | Aplikasi dan basis data berbagi batas kegagalan dan penskalaan | Pemisahan feature/domain; modul khusus server |
| **Keranjang local-first, checkout otoritatif server** | Interaksi cepat dan bertahan setelah muat ulang tanpa memercayai harga peramban | Kasus sinkronisasi dan harga basi perlu perhatian; tidak ada checkout offline | Flush sebelum pembayaran, harga ulang di server, batasan unik keranjang-ke-order |
| **Oversell dengan peringatan** | Penjualan nyata tetap berjalan meski hitungan rak basi | Stok bisa menjadi negatif | Peringatan terlihat dan ledger movement yang tepat; tinjau kekurangan kemudian |
| **QRIS Xendit asinkron** | Nominal tetap per order dan konfirmasi dari penyedia | Pembuatan QR, kedaluwarsa, callback tertunda, dan pengecualian manual | Percobaan pending, cek status, perpanjangan, dan anomali tercatat |
| **Catatan refund manual setelah tutup** | Laci dan inventaris tetap dapat dijelaskan tanpa integrasi pembayaran kedua | Tidak mengirim uang kembali lewat Xendit | Perbedaan didokumentasikan; refund eksternal butuh alur operator |
| **Satu laci bersama per tenant** | Selisih kas jelas, terlepas dari siapa yang melayani penjualan | Tidak dapat merepresentasikan beberapa laci fisik bersamaan | Satu shift terbuka per tenant di logika aplikasi |
| **Hari bisnis memakai jam server** | Satu jam pelaporan yang konsisten di kode saat ini | Zona waktu warung bisa berbeda dari zona waktu server | Helper domain dengan injeksi jam; zona waktu tenant masih kebutuhan terbuka |
| **Batas laju login per proses** | Perlindungan dasar tanpa layanan tambahan | Batas tidak teragregasi antar instance serverless | Butuh limiter bersama atau WAF untuk deployment lebih luas |

### Sebelum dipakai untuk operasi sungguhan

- Verifikasi penerbitan QR, pengiriman callback nyata, pelunasan, kedaluwarsa,
  dan pengecualian secara end-to-end di akun Xendit tujuan. Khususnya, API key
  dan callback yang terkonfigurasi tidak membuktikan bahwa QR yang bisa dipindai
  benar-benar dikembalikan.
- Definisikan alur refund penyedia untuk pembayaran QRIS; refund order saat ini
  mencatat state internal dan efek laci, bukan refund yang diprakarsai penyedia.
- Tambahkan penanganan zona waktu lokal tenant dan limiter bersama atau WAF bila
  deployment mencakup banyak instance.
- Uji backup, migrasi, restore, dan smoke check deployment terhadap lingkungan
  terpisah. Tidak ada klaim ketersediaan tinggi atau hasil uji beban di sini.

---

## 7. Kesimpulan

Warung POS dibangun di sekitar satu invarian praktis: **kasir boleh
menyelesaikan penjualan dengan cepat, tetapi catatannya tetap harus menjelaskan
apa yang terjadi pada stok, piutang, dan kas.**

Keranjang bisa cepat tanpa dipercaya sebagai otoritas harga. Sebuah order bisa
dihitung sebagai penjualan sementara kreditnya belum dibayar. Permintaan QRIS
pending bisa menahan stok tanpa mengklaim pendapatan. Void dan refund berikutnya
sama-sama mengoreksi penjualan tetapi mencatat efek laci yang berbeda. Perbedaan
inilah alasan aplikasi punya order, percobaan pembayaran, movement stok, shift,
dan field pelunasan kredit yang terpisah, bukan satu flag “lunas” yang bisa
diubah.

Proyek ini tetap terbatas: kesiapan pembayaran nyata, penanganan zona waktu, dan
pemulihan operasional butuh pembuktian tingkat deployment. Arsitekturnya membuat
batas itu terlihat, bukan memperlakukan layar yang berjalan sebagai bukti bahwa
alur uang di baliknya sudah lengkap.

### Bacaan lebih lanjut

- [`README.md`](https://github.com/ridwanmuh3/warung-pos/blob/main/README.md) — penyiapan dan ringkasan fitur (sebagian teks pembayaran mendahului integrasi Xendit)
- [`CONTEXT.md`](https://github.com/ridwanmuh3/warung-pos/blob/main/CONTEXT.md) — bahasa domain bersama dan celah hari bisnis yang diketahui
- [`src/db/schema.ts`](https://github.com/ridwanmuh3/warung-pos/blob/main/src/db/schema.ts) — skema terkini, termasuk percobaan pembayaran
- [`docs/architecture.md`](https://github.com/ridwanmuh3/warung-pos/blob/main/docs/architecture.md) — arsitektur dan batas tenant (sebagian path mendahului pemisahan feature)
- [`docs/erd.md`](https://github.com/ridwanmuh3/warung-pos/blob/main/docs/erd.md) — relasi entitas inti (percobaan pembayaran belum digambar)
- [`docs/adr/`](https://github.com/ridwanmuh3/warung-pos/tree/main/docs/adr) — keputusan tentang snapshot, checkout, stok, dan refund
