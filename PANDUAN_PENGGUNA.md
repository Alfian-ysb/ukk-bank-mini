# Panduan Penggunaan UKK Bank Mini

Panduan ini menjelaskan penggunaan aplikasi web untuk staff bank mini. Panduan instalasi dan menjalankan aplikasi ada di [README utama](./README.md). Detail endpoint untuk integrasi customer atau aplikasi lain ada di [dokumentasi API](./backend/API.md).


## Masuk dan navigasi

1. Buka URL frontend, lalu masuk dengan username dan password staff.
2. Setelah berhasil, aplikasi membuka dashboard sesuai role akun.
3. Gunakan menu navigasi untuk berpindah halaman. Menu `Keluar` mengakhiri sesi dan kembali ke halaman login.

Pada halaman dashboard, tombol angka dengan Alt dapat digunakan sebagai pintasan menu; pintasan tidak aktif saat fokus berada di kolom input.

## Admin

### Menyiapkan bank

1. Buka menu `Settings`.
2. Perbarui nama dan alamat bank, kontak, batas saldo minimal, serta batas minimum dan maksimum penarikan sesuai kebijakan bank.
3. Klik `Simpan Semua Pengaturan` dan konfirmasi penyimpanan.
4. Pada bagian saldo awal brankas di halaman yang sama, masukkan saldo pembukaan kas sesuai formulir.

Periksa kembali nilai sebelum disimpan karena pengaturan batas akan digunakan dalam operasional.

### Mengelola staff

1. Buka menu `Staff`, lalu pilih `Tambah Staff`.
2. Isi identitas login staff dan pilih role yang sesuai dengan tugasnya.
3. Simpan, lalu pastikan akun muncul pada daftar staff.
4. Gunakan pencarian untuk menemukan akun. Pilih `Lihat` atau `Edit` untuk memeriksa dan memperbarui data. `Hapus` menghapus akun setelah konfirmasi.

Berikan kredensial kepada pemilik akun melalui saluran yang aman.

### Mengelola nasabah

- Untuk menambahkan satu nasabah, buka `Nasabah` lalu pilih `Tambah Nasabah` dan lengkapi formulir.
- Untuk memasukkan banyak data, unduh `Template CSV`, isi kolom sesuai template, lalu unggah file. Tinjau dan koreksi pratinjau sebelum mengonfirmasi impor.
- Gunakan pencarian untuk mencari nasabah berdasarkan nomor rekening, NIS, nama, jurusan, atau angkatan. Dari daftar, admin dapat melihat, mengedit, atau menghapus data.

Jangan mengubah nama atau urutan kolom pada template CSV. Pastikan data sensitif seperti PIN dan password hanya diberikan kepada pihak yang berwenang.

### Memantau aktivitas

Gunakan `Log Transaksi` untuk meninjau transaksi dan `Jurnal Akuntansi` untuk melihat pencatatan akuntansi. Dashboard admin juga menyediakan ringkasan operasional.

## Teller

### Membuka shift

1. Buka menu `Shift`.
2. Masukkan nama dan kelas 1 sampai 3 petugas teller.
3. Hitung uang tunai awal dan masukkan jumlah lembar/keping untuk setiap pecahan yang ditampilkan.
4. Pilih `Buka Shift & Simpan Saldo Awal` setelah data diperiksa.

### Melayani transaksi

1. Buka menu `Transaksi`.
2. Cari nasabah dengan nomor rekening, atau gunakan pemindai QR dan izinkan akses kamera pada browser jika diminta.
3. Pastikan identitas nasabah yang tampil benar.
4. Pilih jenis transaksi setoran atau penarikan, masukkan nominal, lalu kirim transaksi.
5. Periksa status transaksi pada layar. Cetak struk setelah tombol `Cetak Struk` tersedia.

Pastikan nomor rekening dan nominal benar sebelum mengirim transaksi.

### Menutup shift dan melihat laporan

1. Setelah kegiatan transaksi selesai, kembali ke `Shift`.
2. Hitung uang fisik di laci dan isi jumlah untuk setiap pecahan pada bagian saldo akhir.
3. Pilih `Tutup Shift & Ajukan Laporan`. Laporan akan tersedia untuk ditinjau supervisor.
4. Buka menu `Laporan` untuk memuat laporan berdasarkan tanggal dan memeriksa saldo sistem, saldo fisik, serta selisih kas.

## Supervisor

### Meninjau dan menyetujui laporan shift

1. Buka menu `Laporan Harian`.
2. Filter daftar berdasarkan status. Laporan berstatus `closed` menunggu persetujuan.
3. Pilih `Lihat` pada laporan untuk memeriksa petugas, rincian uang awal/akhir, transaksi, dan rekap saldo.
4. Jika data sudah sesuai, pilih `Setujui Laporan` dan konfirmasi. Laporan yang sudah disetujui berstatus `approved`.
5. Gunakan `Cetak / Print` bila diperlukan untuk mencetak detail laporan.

### Pemantauan

Supervisor dapat menggunakan `Log Transaksi`, `Nasabah`, `Jurnal Akuntansi`, dan dashboard untuk meninjau aktivitas. Halaman `Vault` menampilkan saldo brankas.

## Jika mengalami kendala

- Tidak bisa masuk: pastikan username dan password benar; minta admin memeriksa akun dan role.
- Menu tidak tersedia: akses menu dibatasi berdasarkan role akun.
- Data tidak termuat atau muncul pesan koneksi: pastikan frontend dan backend aktif serta konfigurasi URL API benar.
- CSV ditolak: gunakan template yang disediakan, periksa kolom dan data wajib, lalu tinjau pesan validasi pada layar.
- QR tidak terbaca: izinkan akses kamera pada browser atau masukkan nomor rekening secara manual.

Untuk endpoint dan alur autentikasi customer, lihat [dokumentasi API](./backend/API.md). Aplikasi web staff ini menggunakan login staff; dokumentasi API memuat layanan customer yang dapat dipakai oleh aplikasi customer terpisah.