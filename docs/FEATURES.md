# Dokumentasi Fitur ResepKu

## Daftar Isi

1. [Dashboard](#1-dashboard)
2. [Menu Lab](#2-menu-lab)
3. [Master Data](#3-master-data)
4. [Promosi](#4-promosi)
5. [Manajemen Tim](#5-manajemen-tim)
6. [Profil & Pengaturan](#6-profil--pengaturan)

---

## 1. Dashboard

Dashboard menampilkan ringkasan statistik bisnis kuliner Anda.

### Statistik yang Ditampilkan

- **Total Menu** - Jumlah menu yang terdaftar
- **Total Resep** - Jumlah resep yang tersimpan
- **Total Bahan** - Jumlah bahan baku yang terdaftar
- **Rata-rata Profit Margin** - Persentase margin keuntungan rata-rata

### Tips

- Dashboard otomatis ter-refresh saat ada perubahan data
- Klik kartu statistik untuk navigasi ke halaman terkait

---

## 2. Menu Lab

### 2.1 Manajemen Menu

Halaman untuk mengelola daftar menu yang dijual.

#### Membuat Menu Baru

1. Klik tombol **"Tambah Menu"**
2. Isi informasi:
   - **Nama Menu** (wajib)
   - **Deskripsi** (opsional)
   - **Harga Jual** (wajib)
   - **Kategori** (opsional)
3. Tambahkan resep yang menjadi komposisi menu
4. Klik **"Simpan"**

#### HPP Menu

HPP menu dihitung otomatis berdasarkan:

- Resep yang digunakan
- Bahan baku dari setiap resep
- Harga beli bahan terkini

#### Filter & Pencarian

- Filter berdasarkan kategori
- Filter berdasarkan range harga
- Filter berdasarkan profit margin
- Pencarian berdasarkan nama

---

### 2.2 Manajemen Resep

Halaman untuk membuat dan mengelola resep.

#### Membuat Resep Baru

1. Klik tombol **"Tambah Resep"**
2. Isi informasi dasar:
   - **Nama Resep** (wajib)
   - **Deskripsi** (opsional)
   - **Jumlah Porsi** (default: 1)
   - **Kategori** (opsional)
3. Tambahkan bahan-bahan dengan kuantitas
4. (Opsional) Tambahkan komponen resep lain
5. (Opsional) Tambahkan SOP dan video tutorial
6. Klik **"Simpan"**

#### Fitur Komponen Resep

Resep dapat menggunakan resep lain sebagai komponen (nested recipe).
Contoh: Resep "Nasi Goreng Spesial" menggunakan komponen "Bumbu Dasar Merah".

#### Kalkulasi HPP Resep

HPP resep dihitung dari:

- Total harga semua bahan × kuantitas
- Total HPP komponen resep × kuantitas

---

### 2.3 Kalkulator HPP

Tools untuk simulasi perhitungan HPP.

#### Cara Penggunaan

1. Pilih menu yang ingin dihitung
2. Sistem akan menampilkan:
   - Breakdown bahan dan harganya
   - Total HPP
   - Harga jual
   - Profit margin (%)
3. Simulasikan perubahan harga bahan
4. Export hasil ke PDF/Excel

---

## 3. Master Data

### 3.1 Bahan Baku

Kelola database bahan baku dengan informasi harga dan konversi satuan.

#### Field Bahan Baku

| Field          | Deskripsi                       | Contoh      |
| -------------- | ------------------------------- | ----------- |
| Nama           | Nama bahan                      | Daging Ayam |
| Satuan Beli    | Satuan saat pembelian           | kg          |
| Harga Beli     | Harga per satuan beli           | Rp 35.000   |
| Ukuran Kemasan | Ukuran per kemasan              | 1           |
| Yield (%)      | Persentase yang bisa dipakai    | 85%         |
| Satuan Pakai   | Satuan saat digunakan di resep  | gram        |
| Konversi       | Faktor konversi ke satuan pakai | 1000        |

#### Rumus Kalkulasi

```
Harga per Satuan Pakai = (Harga Beli / Ukuran Kemasan) / (Yield% / 100) / Konversi
```

---

### 3.2 Satuan

Kelola satuan yang digunakan dalam sistem.

#### Grup Satuan Default

- **Berat**: kg, gram, ons, pound
- **Volume**: liter, ml, gallon
- **Panjang**: meter, cm
- **Jumlah**: pcs, lusin, gross
- **Kemasan**: pack, karton, dus, sachet

#### Konversi Otomatis

Sistem mendukung konversi otomatis antar satuan dalam grup yang sama.

---

### 3.3 Kategori

Kelola kategori untuk:

- Kategori Bahan Baku
- Kategori Resep
- Kategori Menu

---

### 3.4 Riwayat Harga

Tracking perubahan harga bahan dari waktu ke waktu.

#### Fitur

- Lihat tren harga dalam grafik
- Filter berdasarkan periode
- Catat supplier dan notes
- Export data harga

---

## 4. Promosi

### 4.1 Menu Bundling

Buat paket promo dengan kombinasi beberapa menu.

#### Tipe Promosi

| Tipe           | Deskripsi           | Contoh                     |
| -------------- | ------------------- | -------------------------- |
| Buy 1 Get 1    | Beli 1 gratis 1     | Beli Burger gratis Kentang |
| Buy 2 Get 1    | Beli 2 gratis 1     | Beli 2 Ayam gratis 1       |
| Diskon %       | Potongan persentase | Diskon 20%                 |
| Diskon Nominal | Potongan nominal    | Potongan Rp 10.000         |
| Harga Paket    | Harga tetap bundle  | Paket Hemat Rp 50.000      |

#### Membuat Bundle Promo

1. Klik **"Buat Promo"**
2. Isi nama dan deskripsi bundle
3. Pilih tipe promosi
4. Tambahkan menu ke dalam bundle
5. Set periode validitas (opsional)
6. Lihat simulasi HPP dan profit
7. Klik **"Simpan"**

#### Analisis Bundle

Sistem otomatis menghitung:

- Total HPP bundle
- Harga normal vs harga promo
- Profit margin setelah diskon
- Saran harga dengan margin tertentu

---

## 5. Manajemen Tim

### 5.1 Multi-Tenant (Organisasi)

Setiap organisasi memiliki data terpisah.

#### Membuat Organisasi

1. Saat onboarding, Anda akan diminta membuat organisasi
2. Atau klik **"Buat Organisasi Baru"** di switcher

#### Mengganti Organisasi

Gunakan dropdown di navbar untuk berpindah antar organisasi.

---

### 5.2 Undang Anggota

#### Role & Akses

| Role       | Akses                                         |
| ---------- | --------------------------------------------- |
| **Owner**  | Full access, kelola anggota, hapus organisasi |
| **Admin**  | Full access data, undang anggota              |
| **Member** | Read & write data, tidak bisa kelola tim      |

#### Cara Mengundang

1. Buka **Manajemen Tim**
2. Klik **"Undang Anggota"**
3. Masukkan email
4. Pilih role
5. Kirim undangan

#### Menerima Undangan

1. Penerima akan mendapat notifikasi di aplikasi
2. Klik **"Terima"** untuk bergabung
3. Atau **"Tolak"** untuk menolak

---

## 6. Profil & Pengaturan

### 6.1 Edit Profil

- Ubah nama
- Ubah email (memerlukan verifikasi ulang)
- Ubah foto profil

### 6.2 Ganti Password

Tersedia untuk user dengan login email/password (bukan Google OAuth).

### 6.3 Keluar dari Organisasi

Member dan Admin dapat keluar dari organisasi (kecuali Owner).

---

## Keyboard Shortcuts

| Shortcut   | Aksi                  |
| ---------- | --------------------- |
| `Ctrl + K` | Buka pencarian global |
| `Escape`   | Tutup modal           |
| `Enter`    | Submit form           |
