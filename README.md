# UKK Bank Mini

Aplikasi operasional bank mini yang terdiri dari API backend Laravel dan aplikasi web React. Aplikasi web menyediakan dashboard untuk admin, teller, dan supervisor; backend juga menyediakan endpoint untuk autentikasi dan layanan nasabah.

## Fitur

| Peran | Fitur utama |
|---|---|
| Admin | Mengelola staff dan nasabah, mengimpor data nasabah melalui CSV, mengatur saldo awal vault, serta melihat transaksi dan jurnal. |
| Teller | Membuka dan menutup shift, melayani transaksi nasabah, serta membuat laporan harian. |
| Supervisor | Meninjau dan menyetujui shift, melihat saldo vault, nasabah, transaksi, dan jurnal. |
| Nasabah (API) | Login, melihat profil dan riwayat, menyetujui atau menolak permintaan transaksi, serta mengelola PIN/email. |

## Teknologi

- **Backend:** PHP 8.3+, Laravel 13, Laravel Sanctum, MySQL, Firebase Admin SDK, dan Laravel Excel.
- **Frontend:** React 19, Vite 8, React Router, dan Tailwind CSS 4.
- **Deploy frontend:** konfigurasi Netlify tersedia di [`netlify.toml`](./netlify.toml).

## Struktur repository

```text
backend/     API Laravel, konfigurasi, migrasi database, dan pengujian
fe_v1/       Aplikasi web React
netlify.toml Konfigurasi build dan routing SPA di Netlify
```

## Persyaratan

- PHP 8.3 atau lebih baru beserta Composer.
- MySQL atau server database yang kompatibel dengan konfigurasi Laravel.
- Node.js dan npm yang kompatibel dengan Vite 8.
- Kredensial Firebase hanya jika fitur yang memerlukan Firebase digunakan.

## Menjalankan secara lokal

Jalankan backend dan frontend di dua terminal terpisah dari direktori repository.

### 1. Siapkan backend

```powershell
cd backend
composer install
Copy-Item .env.example .env
```

Edit `backend/.env`, terutama koneksi database (`DB_*`). Pastikan database yang disebutkan pada `DB_DATABASE` sudah dibuat, kemudian jalankan:

```powershell
php artisan key:generate
php artisan migrate
php artisan serve
```

API lokal tersedia di `http://localhost:8000/api`. Untuk memproses pekerjaan antrean, jalankan worker di terminal backend tambahan:

```powershell
cd backend
php artisan queue:work
```

### 2. Siapkan frontend

```powershell
cd fe_v1
npm install
Copy-Item .env.example .env
```

Atur `fe_v1/.env`:

```dotenv
VITE_API_URL=http://localhost:8000
```

Nilai tersebut adalah URL dasar backend **tanpa** akhiran `/api`; frontend menambahkan prefix API secara otomatis. Jalankan server pengembangan:

```powershell
npm run dev
```

Buka URL lokal yang ditampilkan Vite di terminal.

## Konfigurasi tambahan

- Pengaturan database, antrean, email, dan Firebase berada di `backend/.env`; gunakan `backend/.env.example` sebagai acuan.
- `FIREBASE_CREDENTIALS` dapat diarahkan ke file service account Firebase. Simpan file tersebut di lokasi aman dan jangan commit kredensial atau file `.env`.
- `MAIL_MAILER=log` pada konfigurasi contoh mengirimkan keluaran email ke log aplikasi, bukan ke layanan email sungguhan.
- Untuk deploy frontend ke Netlify, set `VITE_API_URL` pada environment build Netlify ke URL backend yang dapat diakses dari browser. Backend harus di-host dan dikonfigurasi secara terpisah.

## Pengujian dan build

Backend, dari direktori `backend`:

```powershell
php artisan test
```

Frontend, dari direktori `fe_v1`:

```powershell
npm run lint
npm run build
```

## Dokumentasi API

Lihat [referensi endpoint API](./backend/API.md) untuk autentikasi, role, format respons, serta rincian request dan response.
