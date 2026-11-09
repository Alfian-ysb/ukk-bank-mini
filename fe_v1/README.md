# Frontend UKK Bank Mini

Aplikasi web untuk operasional admin, teller, dan supervisor. Frontend menggunakan React, React Router, dan Vite, serta berkomunikasi dengan backend Laravel melalui REST API.

Panduan sistem dan cara menjalankan backend tersedia di [README utama](../README.md).

## Persiapan lokal

Persyaratan: Node.js dan npm yang kompatibel dengan Vite 8, serta backend yang sudah berjalan.

```powershell
npm install
Copy-Item .env.example .env
```

Atur `VITE_API_URL` di `.env` ke URL dasar backend, tanpa akhiran `/api`:

```dotenv
VITE_API_URL=http://localhost:8000
```

Jalankan server pengembangan:

```powershell
npm run dev
```

## Validasi dan build

```powershell
npm run lint
npm run build
```

Build produksi dibuat di direktori `dist`. Konfigurasi Netlify di repository mengatur direktori ini sebagai hasil publikasi dan mengarahkan navigasi SPA ke `index.html`. Atur `VITE_API_URL` di environment build hosting ke URL backend produksi.

## Referensi API

Lihat dokumentasi API bersama di [backend/API.md](../backend/API.md).
