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

## 3. Endpoint admin

Semua endpoint pada bagian ini menggunakan:

```text
auth:sanctum + role:admin
```

### Setup saldo awal Brankas Utama

```http
POST /admin/vault/opening-balance
```

Endpoint ini hanya dapat diakses oleh user dengan role `admin`.
Saldo awal hanya dapat diset satu kali. Request ini membuat mutasi
`Saldo Awal Sistem -> Brankas Utama` dan menjadi dasar saldo Brankas.

Request body:

```json
{
  "amount": 4000000
}
```

`amount` adalah total saldo awal Brankas dalam rupiah.

Response `201`:

```json
{
  "status": "success",
  "message": "Saldo awal Brankas Utama berhasil disimpan.",
  "data": {
    "location": "Brankas Utama",
    "amount": 4000000,
    "from_location": "Saldo Awal Sistem",
    "to_location": "Brankas Utama"
  }
}
```

Jika saldo awal sudah pernah diset, response `422`. Teller dan supervisor
akan menerima response `403` karena route berada di middleware `role:admin`.

### Daftar staff

```http
GET /admin/staff
```

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
  ]
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
GET /admin/customers
```

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
  ]
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
  "amount": 100000,
  "pin": "123456"
}
```

Aturan:

- `transaction_type`: `deposit` atau `withdrawal`.
- `amount` minimal `10000`.
- `pin` harus 6 digit.
- Harus ada shift dengan status `open`.
- Untuk withdrawal, saldo customer harus mencukupi.

Response `200`:

```json
{
  "status": "success",
  "message": "Transaction successful",
  "data": {
    "transaction_type": "deposit",
    "amount": 100000,
    "customer_balance": 600000,
    "transaction_date": "2026-10-30T09:00:00+07:00"
  }
}
```

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
    "shift": {
      "id": 4,
      "status": "closed",
      "opening_balance": 900000,
      "closing_digital_balance": 950000,
      "closing_physical_balance": 950000,
      "difference": 0,
      "closed_by": 2
    },
    "total_deposits": 200000,
    "total_withdrawals": 150000
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
langsung dari data `shifts`, sehingga dapat dilihat saat shift masih `open`,
setelah `closed`, maupun setelah `approved`.

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

Saat shift dibuka, sistem mencatat transfer `Brankas Utama -> Loket`
sebesar modal awal. Saat shift di-approve, sistem mencatat transfer
`Loket -> Brankas Utama` sebesar saldo fisik akhir.

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
GET /supervisor/shifts
```

Auth: `auth:sanctum` dan `role:supervisor`.

Laporan harian sekarang tersimpan langsung pada data `shifts`.

### Daftar transaksi

```http
GET /supervisor/transactions
```

Auth: `auth:sanctum` dan `role:supervisor`.

Response `200`:

```json
{
  "status": "success",
  "data": []
}
```

Jika tidak ada transaksi, response `404`.

### Daftar jurnal akuntansi

```http
GET /supervisor/journals
```

Auth: `auth:sanctum` dan `role:supervisor`.

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
  ]
}
```

### Daftar nasabah

```http
GET /supervisor/customers
```

Auth: `auth:sanctum` dan `role:supervisor`.

Response mengikuti endpoint `GET /admin/customers`.

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
