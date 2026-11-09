# Backend UKK Bank Mini

Backend menyediakan REST API aplikasi UKK Bank Mini, dibangun dengan Laravel dan Laravel Sanctum. Panduan fitur keseluruhan dan menjalankan frontend tersedia di [README utama](../README.md).

## Persiapan lokal

Persyaratan: PHP 8.3+, Composer, dan database yang kompatibel (konfigurasi contoh menggunakan MySQL).

```powershell
composer install
Copy-Item .env.example .env
```

Atur koneksi database pada `.env` dan buat databasenya. Kemudian jalankan:

```powershell
php artisan key:generate
php artisan migrate
php artisan serve
```

API lokal berjalan pada `http://localhost:8000/api`. Jika menggunakan antrean database, jalankan worker pada terminal terpisah:

```powershell
php artisan queue:work
```

## Pengujian

```powershell
php artisan test
```

## Referensi API

Dokumentasi endpoint, autentikasi, role, dan format respons tersedia di [API.md](./API.md).

## Kredensial dan konfigurasi

Konfigurasi lokal disimpan di `.env` dan dicontohkan di [.env.example](./.env.example). Jangan commit file `.env` atau kredensial service account Firebase. Atur `FIREBASE_CREDENTIALS` ke file kredensial lokal jika integrasi Firebase digunakan.
