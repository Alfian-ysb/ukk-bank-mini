# UKK Bank Mini API

Dokumentasi endpoint REST API untuk aplikasi UKK Bank Mini.

## Konfigurasi dasar

Base URL lokal:

```text
http://localhost:8000/api
```

Endpoint yang menggunakan middleware `auth:sanctum` harus mengirimkan token:

```http
Authorization: Bearer {access_token}
Accept: application/json
Content-Type: application/json
```

Role yang digunakan:

| Role | Keterangan |
|---|---|
| `admin` | Mengelola staff dan nasabah |
| `supervisor` | Melihat transaksi/jurnal dan menyetujui shift |
| `teller` | Membuka/menutup shift dan melayani transaksi |
| customer | Mengakses profil dan riwayat transaksi |

## Format response

Response sukses umumnya menggunakan format:

```json
{
  "status": "success",
  "message": "Pesan operasi",
  "data": {}
}
```

Response validasi:

```json
{
  "status": "error",
  "message": "Validasi gagal",
  "errors": {
    "field": [
      "Pesan validasi"
    ]
  }
}
```

## 1. Autentikasi staff

### Login staff

```http
POST /staff/login
```

Auth: tidak diperlukan.

Request body:

```json
{
  "username": "teller01",
  "password": "rahasia"
}
```

Response `200`:

```json
{
  "status": "success",
  "access_token": "1|token...",
  "token_type": "Bearer",
  "message": "login berhasil",
  "user": {
    "id": 1,
    "username": "teller01",
    "full_name": "Teller Satu",
    "role": "teller"
  }
}
```

### Logout staff

```http
POST /staff/logout
```

Auth: `auth:sanctum`.

Response `200`:

```json
{
  "status": "success",
  "message": "Logout berhasil"
}
```

### User yang sedang login

```http
GET /user
```

Auth: `auth:sanctum`.

Response `200`: objek user yang sedang login.

## 2. Autentikasi customer

### Login customer

```http
POST /customer/login
```

Auth: tidak diperlukan.

Request body:

```json
{
  "nis": "123456",
  "password": "rahasia"
}
```

Response `200`:

```json
{
  "status": "success",
  "message": "Login nasabah berhasil",
  "token": "2|token...",
  "data": {
    "id": 1,
    "nis": "123456",
    "student_name": "Nama Nasabah",
    "status": "active",
    "balance": 500000
  }
}
```

### Lupa password customer

Alur lupa password tidak memerlukan login. Nasabah mengirim NIS dan email terdaftar, memverifikasi OTP dari email, lalu menetapkan password baru.

#### Meminta OTP

```http
POST /customer/forgot-password
```

Auth: tidak diperlukan.

Request body:

```json
{
  "nis": "123456",
  "email": "nasabah@example.com"
}
```

Response `202` menggunakan pesan generik baik data cocok maupun tidak:

```json
{
  "status": "success",
  "message": "Jika NIS dan email cocok, kode OTP akan dikirim atau masih dalam masa tunggu.",
  "data": {
    "challenge_id": "id-tantangan-opaque"
  }
}
```

Jika NIS dan email cocok, OTP 4 digit dikirim ke email terdaftar. Kode berlaku 5 menit, maksimal 3 percobaan, dengan jeda kirim ulang 30 detik. Endpoint dibatasi hingga 5 permintaan per menit per IP. Untuk melanjutkan, aplikasi Flutter tetap menggunakan `challenge_id` dari response; challenge yang tidak cocok akan gagal diverifikasi.

#### Memverifikasi OTP

```http
POST /customer/verify-password-reset-otp
```

Auth: tidak diperlukan.

Request body:

```json
{
  "challenge_id": "id-tantangan-dari-request",
  "otp": "0123"
}
```

Response `200` jika OTP benar:

```json
{
  "status": "success",
  "message": "Kode OTP berhasil diverifikasi.",
  "data": {
    "reset_token": "token-otorisasi-reset-password",
    "expires_in_minutes": 10
  }
}
```

OTP salah, kedaluwarsa, sudah dipakai, melewati batas percobaan, atau challenge tidak valid menghasilkan `422`. Endpoint dibatasi hingga 10 permintaan per menit per IP.

#### Menetapkan password baru

```http
POST /customer/reset-password
```

Auth: tidak diperlukan.

Request body:

```json
{
  "reset_token": "token-otorisasi-reset-password",
  "new_password": "password-baru"
}
```

Password baru minimal 6 karakter. Reset token berlaku 10 menit dan hanya dapat digunakan sekali. Response sukses berisi `"message": "Password berhasil diperbarui."`; token tidak valid, kedaluwarsa, atau telah digunakan menghasilkan `422`. Endpoint dibatasi hingga 10 permintaan per menit per IP.

Urutan layar Flutter: masukkan NIS + email, masukkan OTP dari email, lalu setelah verifikasi sukses masukkan password baru dan konfirmasinya. Jangan simpan atau log OTP maupun `reset_token`.

### Mengubah email dengan OTP

Semua endpoint pada alur ini mengharuskan nasabah login. Kode OTP dikirim ke
email baru yang diminta. Email akun baru berubah hanya setelah OTP berhasil
diverifikasi. Setelah berhasil, seluruh token login nasabah dicabut sehingga
nasabah harus login kembali.

#### Meminta OTP

```http
POST /customer/change-email/request-otp
```

Request body:

```json
{
  "new_email": "email-baru@example.com"
}
```

Response sukses `202` berisi `challenge_id`. Email harus valid, berbeda dari
email saat ini, dan belum digunakan nasabah lain. Kode OTP 4 digit berlaku
selama 5 menit, maksimal 3 percobaan, dengan jeda permintaan ulang 30 detik.
Endpoint dibatasi hingga 5 permintaan per menit per IP.

#### Memverifikasi OTP dan mengganti email

```http
POST /customer/change-email/verify-otp
```

Request body:

```json
{
  "challenge_id": "id-tantangan-dari-request",
  "otp": "0123"
}
```

Response sukses:

```json
{
  "status": "success",
  "message": "Email berhasil diperbarui. Silakan login kembali."
}
```

Jika OTP benar, email nasabah diperbarui dan semua token akses nasabah dicabut.
Nasabah harus kembali ke halaman login. OTP salah, kedaluwarsa, atau sudah
digunakan menghasilkan `422`. Endpoint dibatasi hingga 10 permintaan per menit
per IP.

### Ubah PIN dengan OTP

Semua endpoint pada alur ini mengharuskan nasabah login. Sertakan token Sanctum:

```http
Authorization: Bearer <customer-token>
```

Email tujuan diambil dari akun nasabah yang sedang login; aplikasi tidak mengirim NIS atau email.

#### Meminta kode OTP

```http
POST /customer/change-pin/request-otp
```

Auth: `auth:sanctum`.

Tidak memerlukan request body. Kode OTP 4 digit dikirim ke email terdaftar milik nasabah.

```json
{
  "status": "success",
  "message": "Kode OTP telah dikirim ke email terdaftar.",
  "data": {
    "challenge_id": "id-tantangan-acak"
  }
}
```

Jika akun belum memiliki email, endpoint menghasilkan `422`. OTP berlaku 5 menit dan dapat dicoba maksimal 3 kali. Permintaan ulang dalam 30 detik menghasilkan `429` beserta `challenge_id` yang sama, tanpa mengirim kode baru. Endpoint dibatasi hingga 5 permintaan per menit per IP.

#### Memverifikasi kode OTP

Setelah nasabah memasukkan OTP pada aplikasi Flutter, kirim:

```http
POST /customer/change-pin/verify-otp
```

Auth: `auth:sanctum`.

Request body:

```json
{
  "challenge_id": "id-tantangan-dari-request",
  "otp": "0123"
}
```

Response `200` jika OTP benar:

```json
{
  "status": "success",
  "message": "Kode OTP berhasil diverifikasi.",
  "data": {
    "reset_token": "token-otorisasi-reset",
    "expires_in_minutes": 10
  }
}
```

Challenge hanya berlaku bagi nasabah yang meminta OTP. OTP salah, kedaluwarsa, sudah dipakai, atau melewati batas percobaan menghasilkan `422`. Endpoint dibatasi hingga 10 permintaan per menit per IP. Aplikasi hanya menampilkan form PIN baru setelah endpoint ini berhasil.

#### Menyimpan PIN baru

Setelah verifikasi OTP berhasil, Flutter mengirim token otorisasi dan PIN baru:

```http
POST /customer/change-pin/reset
```

Auth: `auth:sanctum`.

Request body:

```json
{
  "reset_token": "token-otorisasi-reset",
  "new_pin": "654321"
}
```

PIN baru harus terdiri dari 4 sampai 6 digit. Token reset hanya dapat digunakan oleh nasabah yang sama, berlaku 10 menit, dan hanya dapat digunakan sekali. Token tidak valid, kedaluwarsa, sudah digunakan, atau milik nasabah lain menghasilkan response `422`. Endpoint dibatasi hingga 10 permintaan per menit per IP.

Urutan layar Flutter: nasabah login, memilih ubah PIN, meminta OTP, memasukkan OTP, lalu setelah verifikasi sukses memasukkan PIN baru dan konfirmasinya. Jangan simpan atau log OTP maupun `reset_token`. Atur konfigurasi `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, dan `MAIL_FROM_ADDRESS` di `.env` agar email benar-benar terkirim. `MAIL_MAILER=log` hanya menulis email ke log aplikasi.

### Logout customer

```http
POST /customer/logout
```

Auth: `auth:sanctum`.

Response `200`:

```json
{
  "status": "success",
  "message": "Logout berhasil"
}
```

### Profil customer

```http
GET /customer/profile
```

Auth: `auth:sanctum`.

Response `200`:

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "nis": "123456",
    "student_name": "Nama Nasabah",
    "status": "active",
    "balance": 500000
  }
}
```

### Simpan token notifikasi Firebase

```http
POST /customer/fcm-token
```

Auth: `auth:sanctum`.

Request body:

```json
{
  "fcm_token": "token-dari-firebase-cloud-messaging"
}
```

Endpoint ini dipanggil aplikasi Flutter setelah login dan setiap kali token FCM berubah.

### Riwayat transaksi customer

```http
GET /customer/history
```

Auth: `auth:sanctum`.

Response `200`:

```json
{
  "status": "success",
  "data": [
    {
      "id": 10,
      "customer_id": 1,
      "user_id": 2,
      "shift_id": 4,
      "date": "2026-10-30 09:00:00",
      "transaction_type": "deposit",
      "amount": 100000
    }
  ]
}
```

### Import nasabah melalui CSV

Admin dapat menambahkan banyak nasabah sekaligus melalui:

```http
POST /admin/customers/import
Content-Type: multipart/form-data
```

Field upload wajib bernama `file`. File harus berformat CSV atau TXT dengan
header berikut:

```csv
nis,student_name,email,major,cohort_year,pin,password
12345,Budi Santoso,budi@example.com,RPL,2026,123456,password123
```

Kolom `email` opsional. Kolom tersebut boleh dihilangkan dari header atau
dibiarkan kosong. Jika diisi, email harus valid dan belum digunakan nasabah lain.

Jika ada baris yang tidak valid atau NIS duplikat, seluruh import dibatalkan
dan API mengembalikan `422` beserta nomor baris yang bermasalah.

### Persetujuan transaksi nasabah

Penarikan teller dibuat sebagai `pending` dan saldo baru berubah setelah
nasabah menyetujui dengan PIN. Setoran langsung diproses oleh backend tanpa
notifikasi dan tanpa approval nasabah.

```http
GET /customer/transaction-requests/{request_id}
POST /customer/transaction-requests/{request_id}/approve
POST /customer/transaction-requests/{request_id}/reject
```

Endpoint persetujuan hanya digunakan untuk penarikan:

```json
{
  "pin": "123456"
}
```

Setoran tidak membuat approval request yang menunggu nasabah; endpoint teller
langsung mengembalikan status `completed`.

Status yang mungkin dikembalikan:

| Status | Keterangan |
|---|---|
| `pending` | Menunggu persetujuan nasabah |
| `approved` | Persetujuan sudah dicatat saat proses finalisasi |
| `rejected` | Ditolak nasabah |
| `expired` | Melewati waktu kedaluwarsa |
| `completed` | Saldo, transaksi, dan jurnal sudah berhasil dibuat |

Verifikasi PIN penarikan dibatasi maksimal 3 percobaan untuk setiap permintaan transaksi.
Percobaan PIN yang salah menambah `verification_attempts`; setelah percobaan
ketiga, status menjadi `rejected`, transaksi dibatalkan, dan saldo tidak
berubah. Percobaan pertama dan kedua mengembalikan `422`, sedangkan percobaan
ketiga mengembalikan `409` dengan pesan pembatalan.

PIN tidak pernah dikirim melalui FCM. Jika `fcm_token` kosong, request tetap
dibuat `pending`. Jika pengiriman FCM gagal, request dihapus dan API
mengembalikan `503`; tidak ada saldo atau transaksi final yang berubah.

Teller dapat memeriksa status:

```http
GET /teller/transaction-requests/{request_id}
```

## 3. Endpoint admin

Semua endpoint pada bagian ini menggunakan:

```text
auth:sanctum + role:admin
```

### Setup saldo awal Brankas Utama

```http
POST /admin/vault/opening-balance
```

Request body:

```json
{
  "amount": 4000000
}
```

`amount` adalah total saldo awal dalam rupiah dan dicatat sebagai mutasi
`Saldo Awal Sistem -> Brankas Utama`. Endpoint hanya dapat digunakan sekali
oleh role `admin`. Jika sudah pernah digunakan, response `422`.

### Daftar staff

```http
GET /admin/staff?page=1&per_page=15
```

`page` default `1`; `per_page` default `15` dan dibatasi maksimum `100`.

Response `200`:

```json
{
  "status": "success",
  "data": [
    {
      "id": 2,
      "username": "teller01",
      "full_name": "Teller Satu",
      "role": "teller"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 1,
    "last_page": 1,
    "from": 1,
    "to": 1
  }
}
```

### Detail staff

```http
GET /admin/staff/{id}
```

Response `200`:

```json
{
  "status": "success",
  "data": {
    "id": 2,
    "username": "teller01",
    "full_name": "Teller Satu",
    "role": "teller"
  }
}
```

Jika tidak ditemukan, response `404`:

```json
{
  "status": "error",
  "message": "User not found"
}
```

### Tambah staff

```http
POST /admin/staff
```

Request body:

```json
{
  "username": "supervisor01",
  "full_name": "Supervisor Satu",
  "password": "rahasia",
  "role": "supervisor"
}
```

`role` yang valid: `admin`, `supervisor`, `teller`.

Response `201`:

```json
{
  "status": "success",
  "message": "Staff created successfully",
  "data": {
    "id": 3,
    "username": "supervisor01",
    "full_name": "Supervisor Satu",
    "role": "supervisor"
  }
}
```

### Update staff

```http
PATCH /admin/staff/{id}
```

Semua field bersifat opsional.

Request body:

```json
{
  "full_name": "Supervisor Utama",
  "password": "password-baru",
  "role": "supervisor"
}
```

Response `200`:

```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {}
}
```

### Hapus staff

```http
DELETE /admin/staff/{id}
```

Response `200`:

```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

### Daftar nasabah

```http
GET /admin/customers?page=1&per_page=15
```

`page` default `1`; `per_page` default `15` dan dibatasi maksimum `100`.

Response `200`:

```json
{
  "status": "success",
  "data": [
    {
      "account_number": "100001",
      "nis": "123456",
      "student_name": "Nama Nasabah",
      "major": "RPL",
      "cohort_year": "2026",
      "status": "active",
      "balance": 500000
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 1,
    "last_page": 1,
    "from": 1,
    "to": 1
  }
}
```

### Detail nasabah

```http
GET /admin/customers/{id}
```

Response `200` menggunakan format `status` dan `data` nasabah.

### Tambah nasabah

```http
POST /admin/customers
```

Request body:

```json
{
  "nis": "123456",
  "student_name": "Nama Nasabah",
  "major": "RPL",
  "cohort_year": "2026",
  "pin": "123456",
  "password": "rahasia"
}
```

Response `201`:

```json
{
  "status": "success",
  "message": "Customer created successfully",
  "data": {}
}
```

### Update nasabah

```http
PATCH /admin/customers/{id}
```

Semua field bersifat opsional.

Request body:

```json
{
  "student_name": "Nama Nasabah Baru",
  "major": "TKJ",
  "cohort_year": "2026",
  "pin": "654321",
  "password": "password-baru"
}
```

Response `200` menggunakan format `status`, `message`, dan `data`.

### Hapus nasabah

```http
DELETE /admin/customers/{id}
```

Response `200`:

```json
{
  "status": "success",
  "message": "Customer deleted successfully"
}
```

## 4. Endpoint teller

Semua endpoint pada bagian ini menggunakan:

```text
auth:sanctum + role:teller
```

## 4.1 Buka shift

```http
POST /teller/shifts/open
```

Request body:

```json
{
  "shift_date": "2026-10-30",
  "assigned_staff": [2, 3, 4],
  "opening_denominations": [
    {
      "denomination": 100000,
      "quantity": 5
    },
    {
      "denomination": 50000,
      "quantity": 4
    },
    {
      "denomination": 20000,
      "quantity": 5
    },
    {
      "denomination": 10000,
      "quantity": 10
    }
  ]
}
```

Aturan:

- `shift_date` opsional; default tanggal hari ini.
- `assigned_staff` wajib berisi 2-3 ID user yang berbeda.
- Semua user pada `assigned_staff` harus memiliki role `teller`.
- `opening_denominations` wajib berupa daftar denominasi.
- `opening_balance` dihitung dengan rumus `denomination * quantity`.

Response `201`:

```json
{
  "status": "success",
  "message": "Shift berhasil dibuka.",
  "data": {
    "id": 4,
    "shift_date": "2026-10-30",
    "status": "open",
    "opening_balance": 900000,
    "assigned_staff": [2, 3, 4],
    "opened_by": 2,
    "denominations": [
      {
        "type": "opening",
        "denomination": 100000,
        "quantity": 5,
        "amount": 500000
      }
    ]
  }
}
```

Jika shift pada tanggal tersebut sudah ada, response `409`.

## 4.2 Cari nasabah

```http
POST /teller/customer
```

Request body:

```json
{
  "account_number": "100001"
}
```

Response `200`:

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "account_number": "100001",
    "nis": "123456",
    "student_name": "Nama Nasabah",
    "balance": 500000
  }
}
```

Jika nasabah tidak ditemukan, response `404`.

## 4.3 Simpan transaksi

```http
POST /teller/customer/{id}/transaction
```

Request body:

```json
{
  "transaction_type": "deposit",
  "amount": 100000
}
```

Aturan:

- `transaction_type`: `deposit` atau `withdrawal`.
- `amount` minimal `10000`.
- Harus ada shift dengan status `open`.
- Untuk withdrawal, saldo customer harus mencukupi.
- PIN tidak dikirim oleh teller.

Response `202`:

```json
{
  "status": "success",
  "message": "Permintaan transaksi menunggu persetujuan nasabah.",
  "data": {
    "request_id": 12,
    "transaction_type": "deposit",
    "amount": 100000,
    "status": "pending",
    "expires_at": "2026-11-02T09:31:00+07:00"
  }
}
```

Saldo dan transaksi final belum berubah pada response ini. Teller memeriksa
status melalui `GET /teller/transaction-requests/{request_id}`.

## 4.4 Tutup shift dan kas

```http
POST /teller/shifts/close
```

Request body:

```json
{
  "closing_denominations": [
    {
      "denomination": 100000,
      "quantity": 6
    },
    {
      "denomination": 50000,
      "quantity": 3
    },
    {
      "denomination": 20000,
      "quantity": 4
    },
    {
      "denomination": 10000,
      "quantity": 8
    }
  ]
}
```

Sistem menghitung:

```text
saldo_akhir_digital =
saldo_awal + total_setoran - total_penarikan

saldo_akhir_fisik =
jumlah(denomination * quantity)

selisih =
saldo_akhir_fisik - saldo_akhir_digital
```

Jika selisih bukan `0`, status shift tetap `open`, laporan tidak dibuat, dan response `422` dikembalikan:

```json
{
  "status": "warning",
  "message": "Penutupan kas dibatalkan karena terdapat selisih.",
  "errors": {
    "closing_denominations": [
      "Saldo fisik tidak sama dengan saldo digital.",
      "Selisih: -50000. Laporan belum dikunci."
    ]
  }
}
```

Jika saldo cocok, response `200`:

```json
{
  "status": "success",
  "message": "Shift berhasil ditutup dan laporan harian tersimpan pada shift.",
  "data": {
    "id": 4,
    "status": "closed",
    "opening_balance": 900000,
    "total_deposits": 200000,
    "total_withdrawals": 150000,
    "closing_digital_balance": 950000,
    "closing_physical_balance": 950000,
    "difference": 0,
    "closed_by": 2
  }
}
```

## 4.5 Lihat report harian teller

```http
POST /teller/daily-report
```

Auth: `auth:sanctum` dan `role:teller`.

Request body opsional:

```json
{
  "date": "2026-10-30"
}
```

Jika `date` tidak dikirim, sistem menggunakan tanggal hari ini. Report diambil
langsung dari data `shifts`.

Response `200`:

```json
{
  "status": "success",
  "data": {
    "shift_date": "2026-10-30",
    "status": "closed",
    "opening_balance": 900000,
    "total_deposits": 200000,
    "total_withdrawals": 150000,
    "closing_digital_balance": 950000,
    "closing_physical_balance": 950000,
    "difference": 0,
    "assigned_staff": [2, 3, 4],
    "denominations": [],
    "transactions": []
  }
}
```

Jika shift pada tanggal tersebut tidak ditemukan, response `404`.

## 5. Endpoint supervisor

### Lihat saldo Brankas Utama

```http
GET /supervisor/vault/balance
```

Auth: `auth:sanctum` dan `role:supervisor`.

Saldo dihitung dari seluruh mutasi `cash_transfers`:

```text
saldo brankas = total masuk - total keluar
```

Response `200`:

```json
{
  "status": "success",
  "data": {
    "location": "Brankas Utama",
    "total_in": 1300000,
    "total_out": 1000000,
    "balance": 300000
  }
}
```

### Approve shift

```http
PATCH /supervisor/shifts/{shift}/approve
```

Auth:

```text
auth:sanctum + role:supervisor
```

Request body: tidak ada.

Shift harus memiliki status `closed`.

Response `200`:

```json
{
  "status": "success",
  "message": "Shift berhasil di-approve.",
  "data": {
    "id": 4,
    "status": "approved",
    "approved_by": 5,
    "approved_at": "2026-10-30T17:00:00+07:00",
    "cash_transfers": [
      {
        "shift_id": 4,
        "amount": 950000,
        "from_location": "Loket",
        "to_location": "Brankas Utama",
        "transferred_by": 5
      }
    ]
  }
}
```

Jika shift belum `closed`, response `422`.

### Daftar shift dan laporan harian

```http
GET /supervisor/shifts?page=1&per_page=15&status=closed
```

Auth: `auth:sanctum` dan `role:supervisor`.

Laporan harian sekarang merupakan data pada tabel `shifts`, sehingga response berisi
saldo, total transaksi, status, dan rincian denominasi shift.
Parameter `page` default `1`, sedangkan `per_page` default `15` dan dibatasi maksimum
`100`. Parameter `status` opsional menerima `open`, `closed`, atau `approved`.

Response `200`:

```json
{
  "status": "success",
  "data": [
    {
      "id": 4,
      "shift_date": "2026-10-30",
      "status": "approved",
      "opening_balance": 900000,
      "total_deposits": 200000,
      "total_withdrawals": 150000,
      "closing_digital_balance": 950000,
      "closing_physical_balance": 950000,
      "difference": 0
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 1,
    "last_page": 1,
    "from": 1,
    "to": 1
  }
}
```

### Daftar transaksi

```http
GET /admin/transactions?page=1&per_page=15
POST /supervisor/transactions?page=1&per_page=15
```

Auth: `/admin/transactions` menggunakan role `admin`, sedangkan
`/supervisor/transactions` menggunakan role `supervisor`.
`page` default `1`; `per_page` default `15` dan dibatasi maksimum `100`.
Filter tanggal yang tersedia tetap dapat digabung dengan parameter paginasi.

Response `200`:

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "transaction_type": "deposit",
      "amount": 100000
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 1,
    "last_page": 1,
    "from": 1,
    "to": 1
  }
}
```

Jika tidak ada transaksi yang cocok dengan filter, response `404`.

### Ekspor riwayat transaksi

```http
GET /admin/transactions/export?start_date=2026-03-01&end_date=2026-03-31
GET /supervisor/transactions/export?start_date=2026-03-01&end_date=2026-03-31
```

Auth: endpoint admin memerlukan role `admin`, dan endpoint supervisor memerlukan
role `supervisor`. Filter `date`, `week`, `month`, `start_date`, dan `end_date`
sama dengan daftar transaksi. Ekspor mengabaikan paginasi dan mengunduh semua
transaksi yang cocok sebagai file `.xlsx`.

### Daftar jurnal akuntansi

```http
GET /admin/journals?page=1&per_page=15
GET /supervisor/journals?page=1&per_page=15
```

Auth: masing-masing endpoint memerlukan role `admin` atau `supervisor`.
`page` default `1`; `per_page` default `15` dan dibatasi maksimum `100`.

Response `200`:

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "transaction_id": 10,
      "account_code": "101",
      "position": "debit",
      "amount": 100000
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 1,
    "last_page": 1,
    "from": 1,
    "to": 1
  }
}
```

### Daftar nasabah

```http
GET /supervisor/customers
```

Auth: `auth:sanctum` dan `role:supervisor`.

Response mengikuti endpoint `GET /admin/customers`, termasuk parameter `page` dan `per_page`.

## 6. Status dan kode HTTP

| Kode | Keterangan |
|---:|---|
| `200` | Operasi berhasil |
| `201` | Data berhasil dibuat |
| `401` | Token tidak ada atau kredensial salah |
| `403` | Role tidak memiliki akses |
| `404` | Data atau resource tidak ditemukan |
| `409` | Konflik, misalnya shift tanggal tersebut sudah ada |
| `422` | Validasi gagal atau saldo fisik tidak cocok |
| `500` | Kesalahan server |

## 7. Alur operasional shift

```text
Teller login
  -> POST /teller/shifts/open
  -> POST /teller/customer/{id}/transaction
  -> POST /teller/shifts/close
  -> Supervisor PATCH /supervisor/shifts/{shift}/approve
  -> Kas dicatat berpindah dari Loket ke Brankas Utama
```
