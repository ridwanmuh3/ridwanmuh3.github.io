+++
title = 'Converty — Client-Side File Conversion Engine'
date = '2026-11-01'
draft = false
description = 'Fifteen browser-native file conversion tools: zero server uploads, isolated Web Workers, strict CSP, full offline PWA.'
photo = 'converty.webp'
link = 'https://github.com/ridwanmuh3/converty'
demo = 'https://ridwanmuh3.github.io/converty'
+++

> Fifteen file conversion tools running 100% inside the browser: zero server
> uploads, zero accounts, isolated Web Workers, strict Content Security Policy
> enforcement, and full offline PWA functionality.

| | |
| --- | --- |
| **Type** | Portfolio / engineering showcase |
| **Role** | Solo — manifest design, web worker pipelines, memory scheduler, PWA architecture, test tooling |
| **Stack** | SvelteKit 3 · Svelte 5 (runes) · TypeScript · Tailwind CSS 4 · Web Workers · WebCodecs · `pdfjs-dist` · `pdf-lib` · `docx` · `jspdf` |
| **Status** | Production-ready static PWA; fully offline capable, zero server dependencies |
| **Repo** | [`converty`](https://github.com/ridwanmuh3/converty) |

---

## 1. Project Overview

Web-based file converters usually come with a hidden tax: privacy risks,
paywalls, file size caps, and uploading confidential documents to third-party
servers. The fundamental engineering challenge is not styling a file input — it
is **running multi-format document, image, and media transcoding directly inside
browser engines** while maintaining UI responsiveness, protecting client memory
from crashing, and enforcing verifiable zero-trust privacy.

Converty models a zero-server utility suite: convert PDFs to Word documents,
demux video audio via WebCodecs, transcode images, merge/split PDFs, and encode
MP3s — all executed client-side inside Web Workers.

The core implementation relies on three structural guarantees:

1. **Worker-isolated pipeline architecture** — all CPU-heavy parsers, decoders,
   and encoders run off the main thread across seven specialized worker entries
   (`audio`, `document`, `image`, `image-pdf`, `pdf-edit`, `pdf-image`, `video`).
2. **Network exfiltration block (`connect-src 'self'`)** — Content Security
   Policy hashes guarantee that even if a dependency contains malicious logic,
   the browser blocks any outbound data transfer during conversions.
3. **Capability-aware concurrency and memory ceilings** — a client-side scheduler
   detects CPU cores and RAM to run 2-up concurrency on capable desktops while
   capping file and memory bounds to protect mobile browsers.

### At a glance

| Dimension | Value |
| --- | --- |
| Integrated tools | 15 file conversion & manipulation tools |
| Web Worker entries | 7 isolated worker bundles (`src/lib/workers/entries/`) |
| Network dependencies | 0 runtime API endpoints; 100% static prerendered assets |
| Security policy | Strict CSP (`connect-src 'self'`), zero telemetry, zero third-party scripts |
| Memory safety cap | 25 MB file limit, 100 MB batch input ceiling |
| PWA offline budget | Shell precached + 50 MB LRU worker cache cap |
| Verification suite | 115 E2E Playwright checks, 306 design/SEO audits, CPU-calibrated perf baseline |

### Intentionally limited

Converty is a browser-first engineering showcase. Server-side OCR for scanned
images is omitted to avoid multi-megabyte binary bloat. PDF document export uses
block-layout rendering rather than full browser print engine replication
(`window.print()`), restricting document generation to Latin script (WinAnsi).
Heavy FFmpeg WASM binaries were intentionally avoided in favor of lightweight
native browser APIs (WebCodecs, `AudioContext`, `createImageBitmap`).

---

## 2. Features

### User experience and intake

- **Universal file intake** — a drag-and-drop landing interface with automatic
  MIME and extension detection, routing dropped files to valid output format
  options.
- **Mixed-batch conversion** — convert multiple distinct file types in a single
  queue without manually jumping between individual tool pages.
- **Instant output previews** — real-time image thumbnails, first-page PDF canvas
  renderings, and audio waveforms/durations.
- **Option persistence** — per-tool settings (compression levels, PDF
  orientation, page ranges) saved locally in `localStorage` with a single-click
  reset.
- **Progressive Web App** — installable desktop/mobile app powered by a Service
  Worker that precaches the application shell for full offline usage.

### Document and PDF engineering

- **Word → PDF** — parses OOXML structures directly (`fflate` + custom layout
  parser) and streams layout positioning into `jsPDF` block structures and
  `autoTable`.
- **Excel → PDF** — extracts workbook matrix data via SheetJS and constructs
  structured PDF tables.
- **PDF → Word** — extracts text positions via `pdfjs-dist`, applies line and
  paragraph spatial heuristics, and constructs structured DOCX elements via
  `docx`.
- **PDF manipulation** — reorderable PDF merging (`merge-pdf`) and custom
  page-range extraction (`split-pdf`) executing via `pdf-lib`.
- **Image → PDF and PDF → JPG** — convert images into single or multi-page PDFs;
  rasterize PDF pages to JPEG images rendered on `OffscreenCanvas` and delivered
  via `fflate` streaming ZIP files.

### Media and audio processing

- **Video → MP3** — demuxes MP4/MOV audio streams with `mp4box`, decodes raw
  audio via native `WebCodecs`, and encodes 128 kbps MP3 files off the main
  thread using `lamejs`.
- **Audio transcoding** — decodes input audio using browser `AudioContext`,
  resamples to 16-bit PCM WAV, or encodes to MP3.
- **Image processing and compression** — client-side image transcoding (PNG,
  JPEG, WebP) and quality/dimension compression using `createImageBitmap` and
  `OffscreenCanvas`.
- **HEIC conversion** — native HEIC/HEIF decoding via `heic2any`.

### Engineering and quality assurance

- **Zero-trust security audit** — automated E2E assertion guaranteeing zero HTTP
  POST/PUT requests, zero request bodies, and zero third-party domain calls
  during conversions.
- **CPU-calibrated benchmark gate** — performance test harness scaling long-task
  timing checks according to hardware CPU benchmarks (`test/perf.mjs`).
- **Design and SEO audit suite** — 306 automated checks asserting WCAG AA
  contrast, 44 px touch targets, keyboard navigation, dark mode, and Lighthouse
  metrics.

---

## 3. Tech Stack

| Layer | Technologies | Why it is here |
| --- | --- | --- |
| **Frontend and UI** | SvelteKit 3, Svelte 5 (runes), TypeScript, Tailwind CSS 4, `@sveltejs/adapter-static` | High-performance reactive UI using Svelte 5 runes, fully prerendered as static HTML/JS |
| **State and declarative manifest** | Declarative tool manifest (`src/lib/tools/`) | Single source of truth for routes, worker routing, file acceptance, SEO, and options |
| **Worker system** | Web Workers (ES modules), Vite worker bundle integration | Off-main-thread processing isolating heavy document parsing and media encoding |
| **PDF processing** | `pdfjs-dist`, `pdf-lib`, `jspdf`, `jspdf-autotable` | High-fidelity PDF rendering, binary PDF creation, and page-level byte manipulations |
| **Document processing** | `docx`, SheetJS (`xlsx`), `fflate` | OOXML parsing, XLSX matrix extraction, DOCX creation, and streaming ZIP compression |
| **Media and audio** | WebCodecs API, `mp4box`, `@breezystack/lamejs`, `createImageBitmap`, `heic2any` | Native browser demuxing and hardware decoding with lightweight MP3 encoding |
| **PWA and offline** | Service Worker, `scripts/build-sw.mjs` cache manifest generator | Shell precaching and dynamic worker chunk caching capped at 50 MB LRU |
| **Testing and audit** | Playwright Chromium, Vitest, custom design/SEO audit, CPU calibration harness | Comprehensive E2E, accessibility, CSP validation, and hardware-calibrated perf gates |

---

## 4. Architecture

### Execution model

The application operates entirely within the browser sandbox. The main UI thread
manages user interaction, intake routing, and progress UI, delegating conversion
workloads to dedicated Web Workers.

<button type="button" class="mermaid-zoom" data-lightbox-src="/diagrams/converty-en-1.svg" data-lightbox-alt="Converty execution architecture" data-lightbox-caption="Converty execution architecture" aria-label="Enlarge Converty execution architecture diagram"><img src="/diagrams/converty-en-1.svg" width="1954" height="956" loading="lazy" decoding="async" alt="Converty execution architecture diagram" /></button>

### Worker distribution and processing pipelines

| Worker file | Tools it serves | Core engine | Data transfer |
| --- | --- | --- | --- |
| `document.worker.ts` | Word → PDF, Excel → PDF, PDF → Word | `pdfjs-dist`, `jspdf`, `fflate`, `docx`, SheetJS | `ArrayBuffer` transfer |
| `pdf-edit.worker.ts` | Merge PDF, Split PDF | `pdf-lib` | `ArrayBuffer` transfer |
| `pdf-image.worker.ts` | PDF → JPG | `pdfjs-dist`, `OffscreenCanvas`, `fflate` | `Blob` / transferable streams |
| `image-pdf.worker.ts` | Image → PDF, JPG → PDF | `pdf-lib` | `ArrayBuffer` transfer |
| `image.worker.ts` | Image converter, image compression | `createImageBitmap`, `OffscreenCanvas` | Transferable `ImageBitmap` |
| `audio.worker.ts` | Audio converter, MP3 converter | `AudioContext` decoder, `lamejs` MP3 encoder | `Float32Array` buffers |
| `video.worker.ts` | MP4 → MP3, video → MP3 | `mp4box`, WebCodecs `AudioDecoder`, `lamejs` | `AudioData` chunks |
| *Main thread* | HEIC → JPG | `heic2any` | Local Blob object URL |

### Privacy enforcement strategy

| Protection area | Enforcement mechanism | Validation method |
| --- | --- | --- |
| **No data exfiltration** | CSP `connect-src 'self'` | The browser rejects every non-origin outbound connection |
| **No payload submission** | Strict HTTP inspection during E2E | `test/e2e.mjs` asserts 0 POST/PUT requests and 0 request bodies |
| **No third-party tracking** | No telemetry, locally hosted fonts | E2E asserts 0 third-party domain connections |
| **No memory leakage** | Explicit object URL revocation (`URL.revokeObjectURL`) | Validated after each file download / task cleanup |

### Task lifecycle

A job never touches the network. It is scheduled, transferred by reference to a
worker, reported back as progress, and resolved as a Blob the browser hands to
the user.

<button type="button" class="mermaid-zoom" data-lightbox-src="/diagrams/converty-en-2.svg" data-lightbox-alt="Converty conversion lifecycle" data-lightbox-caption="Converty conversion lifecycle" aria-label="Enlarge Converty conversion lifecycle diagram"><img src="/diagrams/converty-en-2.svg" width="948" height="959" loading="lazy" decoding="async" alt="Converty conversion lifecycle diagram" /></button>

### Performance and concurrency model

- **Capacity-aware concurrency scheduling** — devices with ≥8 GB RAM and ≥4 CPU
  cores run up to 2 worker tasks in parallel; mobile or low-capacity devices fall
  back to sequential (1-up) mode automatically.
- **Heavy-workload isolation** — memory-intensive operations (such as video
  conversion or parsing large PDFs) take an exclusive execution lock so the main
  UI never drops frames.
- **Memory streaming** — PDF page extraction to JPG streams JPEG output straight
  into the `fflate` ZIP archive, preventing memory spikes.

### Failure handling

| Failure scenario | Client-side handling | User impact |
| --- | --- | --- |
| Memory cap exceeded | File intake rejects the payload before conversion starts | Clear error that the size or page count is over the limit |
| Audio codec unsupported | WebCodecs capability check fails safely | Guidance that the video file needs transcoding |
| Scanned PDF input | Text check detects no selectable text | Notice that scanned documents need OCR (out of scope) |
| Worker crash / out-of-memory | The worker's `onerror` handler catches the exception and stops the task | The conversion fails in isolation; the main thread stays stable |

---

## 5. Data model and conversion contracts

Converty stores nothing. There is no database, no account, and no server-side
record of a conversion, which is exactly what the CSP guarantee is protecting.
The only persistent model is the **declarative tool manifest** in
`src/lib/tools/`: one typed record per tool, compiled into routes, intake
routing, worker dispatch, options, and SEO metadata at build time.

<button type="button" class="mermaid-zoom" data-lightbox-src="/diagrams/converty-en-3.svg" data-lightbox-alt="Converty tool manifest model" data-lightbox-caption="Converty tool manifest model" aria-label="Enlarge Converty tool manifest diagram"><img src="/diagrams/converty-en-3.svg" width="1020" height="902" loading="lazy" decoding="async" alt="Converty tool manifest diagram" /></button>

Because the manifest is the data model, a wrong entry is a build-time error, not
a runtime surprise: a tool cannot reference a worker entry that does not exist,
and an accepted MIME type cannot be declared twice for the same tool.

### Conversion matrix

| Tool | Pipeline engine | Fidelity | Technical limit / compromise |
| --- | --- | --- | --- |
| **Word → PDF** | `fflate` + OOXML parser → `jsPDF` + `autoTable` | Near-original structure | WinAnsi font encoding (Latin script only); text boxes are not processed |
| **Excel → PDF** | SheetJS → worksheet matrix → `jspdf-autotable` | High table fidelity | Formula results are evaluated; charts and images are dropped |
| **PDF → Word** | `pdfjs-dist` spatial heuristics → `docx` builder | Structured text reconstruction | Tables become paragraphs; images are dropped |
| **PDF → JPG** | `pdfjs-dist` → `OffscreenCanvas` → `fflate` ZIP | Pixel-accurate output | 50 pages maximum; text becomes pixels |
| **JPG / image → PDF** | `pdf-lib` image embedding | Original image quality | Page is 1:1 or fitted to A4; metadata is stripped |
| **Merge PDF** | `pdf-lib` page concatenation | Lossless binary copy | Form fields are copied; complex bookmarks are flattened |
| **Split PDF** | `pdf-lib` page extraction | Lossless binary copy | Metadata is retained in each extracted sub-file |
| **Compress image** | `createImageBitmap` → `OffscreenCanvas` | Adjustable quality | Browser canvas dimension cap (auto-downscale above 16.7 MP) |
| **Image converter** | Canvas `toBlob` re-encode | High visual fidelity | Animated GIF becomes the first frame; EXIF tags are stripped |
| **HEIC → JPG** | `heic2any` main-thread decoder | High colour fidelity | Runs on the main thread because of library constraints |
| **MP4 / video → MP3** | `mp4box` demuxer → WebCodecs → `lamejs` | Clean 128 kbps MP3 | Requires browser codec support; 30-minute duration limit |
| **Audio / MP3 converter** | `AudioContext` decode → `lamejs` encode | Constant 128 kbps MP3 | 10-minute audio limit and a 200 MB execution buffer |

### Architectural decisions

- **jsPDF block layout vs `window.print()`** — `window.print()` produces slightly
  better typography, but it needs an interactive user dialog, which rules out
  batching, progress monitoring, and ZIP generation. `jsPDF` allows full batch
  processing and background handling inside the worker.
- **WebCodecs vs FFmpeg WASM** — FFmpeg WASM bundles reach 20–30 MB. Using
  native `WebCodecs` for demuxing and decoding keeps the initial download under
  50 KB for media tools.

---

## 6. Trade-offs

| Decision | What it buys | What it costs | How it is contained |
| --- | --- | --- | --- |
| **100% client-side processing** | Absolute privacy, no server cost, works offline | Depends on the user's CPU and RAM | Safe memory caps (25 MB per file, 100 MB batch input) |
| **WebCodecs over FFmpeg WASM** | Very small JS bundle, fast load | Depends on browser codec support | Clear error handling when a codec is unsupported |
| **`jsPDF` document engine** | Programmatic PDF generation inside the worker with no UI pop-up | Latin-only (WinAnsi) font encoding | Immediate feedback when non-Latin characters are detected |
| **Single declarative manifest** | Navigation, worker dispatch, and SEO metadata stay in sync | Requires strict validation at compile time | Build-time checks enforce manifest consistency |
| **Offline PWA cache** | Pages open instantly without a connection | Uses up to 50 MB of local storage quota | Automatic worker cache eviction with a 50 MB LRU cap |

### What I would add at larger scale

- Integrate **Tesseract.js WASM** for OCR text extraction on scanned PDF pages.
- Apply **WebAssembly font subsetting** (HarfBuzz / FreeType) to support CJK and
  non-Latin script PDF generation.
- Use **WebGPU / WebCodecs hardware encoding** for full client-side video
  transcoding.

---

## 7. Conclusion

Converty is built around one non-negotiable principle: **not a single byte of
user data leaves the browser, and no server ever processes a user file.**

That principle is reached through layers of technical guarantees:

- **Web Workers** keep heavy work off the main thread so the interface stays
  smooth.
- **A strict Content Security Policy** makes it impossible for data to be sent
  out.
- **A single declarative manifest** keeps navigation, worker dispatch, and file
  options consistent and type-safe.
- **Native browser engines (WebCodecs, `AudioContext`, Canvas)** replace heavy
  WASM libraries and keep the download small.
- **Service Worker caching** turns the application into a resilient offline tool.

Converty demonstrates that a web application can deliver high-performance
document and media processing without sacrificing user privacy or paying for
server operations.

### Further reading

- [`README.md`](https://github.com/ridwanmuh3/converty/blob/main/README.md) — quick start and project overview
- [`ROADMAP.md`](https://github.com/ridwanmuh3/converty/blob/main/ROADMAP.md) — architecture, manifest core, and development phases
- [`src/lib/tools/`](https://github.com/ridwanmuh3/converty/tree/main/src/lib/tools) — declarative tool manifest implementation
