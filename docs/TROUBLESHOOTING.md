# Troubleshooting Guide - ResepKu

## Daftar Isi

1. [Masalah Umum](#1-masalah-umum)
2. [Autentikasi & Login](#2-autentikasi--login)
3. [Database & Data](#3-database--data)
4. [Perhitungan HPP](#4-perhitungan-hpp)
5. [Multi-Tenancy](#5-multi-tenancy)
6. [Development Issues](#6-development-issues)

---

## 1. Masalah Umum

### Halaman Tidak Bisa Dibuka / Blank Screen

**Gejala:** Halaman kosong atau error saat loading

**Solusi:**

1. Refresh halaman (`Ctrl + F5` untuk hard refresh)
2. Buka Console (F12) cek error
3. Pastikan backend berjalan di port 3001
4. Pastikan frontend berjalan di port 5173

```bash
# Restart backend
cd backend
npm run dev

# Restart frontend
cd frontend
npm run dev
```

---

### API Error 500 (Internal Server Error)

**Gejala:** Error saat save data atau load halaman

**Solusi:**

1. Cek terminal backend untuk error message
2. Pastikan database bisa diakses
3. Cek file `.env` konfigurasi `DATABASE_URL`

```bash
# Test koneksi database
cd backend
npx prisma db push
```

---

### Tidak Ada Data yang Muncul

**Gejala:** Halaman kosong tapi tidak error

**Solusi:**

1. Pastikan sudah login dengan organisasi yang benar
2. Cek organisasi yang aktif di dropdown navbar
3. Jalankan seed untuk data dummy:

```bash
cd backend
npm run seed
```

---

## 2. Autentikasi & Login

### Tidak Bisa Login

**Gejala:** Login gagal meski password benar

**Solusi:**

1. Pastikan email sudah diverifikasi
2. Cek apakah menggunakan login Google atau Email
3. Reset password jika lupa

---

### Google Login Error

**Gejala:** Error saat login dengan Google

**Solusi:**

1. Pastikan `GOOGLE_CLIENT_ID` sudah di-set di `.env`
2. Pastikan domain sudah terdaftar di Google Console
3. Untuk localhost, tambahkan `http://localhost:5173` di Authorized Origins

---

### Token Expired / Session Habis

**Gejala:** Tiba-tiba di-logout atau error 401

**Solusi:**

1. Login ulang
2. Jika terjadi terus, cek `JWT_SECRET` di backend `.env`
3. Hapus cookies dan localStorage:

```javascript
// Di console browser
localStorage.clear();
```

---

### Email Verifikasi Tidak Terkirim

**Gejala:** Tidak menerima email verifikasi

**Solusi:**

1. Cek folder Spam/Junk
2. Pastikan konfigurasi SMTP di `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email
   SMTP_PASS=your-app-password
   ```
3. Untuk Gmail, gunakan App Password (bukan password biasa)

---

## 3. Database & Data

### Prisma Migration Error

**Gejala:** Error saat `npx prisma migrate dev`

**Solusi:**

```bash
# Reset migrasi (PERHATIAN: hapus semua data)
npx prisma migrate reset

# Atau sync schema tanpa migrasi
npx prisma db push
```

---

### Data Tidak Tersimpan

**Gejala:** Buat data baru tapi tidak muncul

**Solusi:**

1. Cek Console/Network tab untuk error
2. Pastikan semua field wajib terisi
3. Cek apakah ada validasi yang gagal

---

### Data Terhapus Setelah Restart

**Gejala:** Data hilang setelah restart server

**Solusi:**

1. Pastikan menggunakan database file yang benar:
   ```env
   DATABASE_URL="file:./dev.db"
   ```
2. Jangan hapus folder `prisma` atau file `dev.db`

---

### Tidak Bisa Hapus Bahan yang Digunakan

**Gejala:** Error "Tidak dapat menghapus bahan yang masih digunakan"

**Penjelasan:** Ini adalah **fitur proteksi** agar data tetap konsisten.

**Solusi:**

1. Hapus dulu bahan dari semua resep yang menggunakannya
2. Atau gunakan bahan pengganti di resep-resep tersebut
3. Baru kemudian hapus bahan

---

## 4. Perhitungan HPP

### HPP Menunjukkan 0 atau NaN

**Gejala:** HPP tidak terhitung dengan benar

**Solusi:**

1. Pastikan harga beli bahan sudah diisi
2. Pastikan kuantitas resep sudah diisi
3. Cek konversi satuan sudah benar:
   ```
   Harga per unit = Harga beli / Konversi rate
   ```

---

### HPP Berbeda dari Perhitungan Manual

**Gejala:** Hasil HPP tidak sesuai ekspektasi

**Cek:**

1. **Yield percentage** - Persentase bahan yang bisa dipakai
2. **Konversi satuan** - kg ke gram = 1000
3. **Komponen resep** - HPP sub-recipe ikut dihitung

**Rumus:**

```
HPP Bahan = (Harga Beli / Package Size) × (100 / Yield%) / Konversi Rate × Kuantitas
```

---

### Profit Margin Negatif

**Gejala:** Profit margin di bawah 0%

**Penyebab:**

- Harga jual lebih rendah dari HPP
- Harga bahan naik tapi harga jual belum di-update

**Solusi:**

1. Perbarui harga jual menu
2. Cek riwayat harga bahan yang naik signifikan
3. Cari bahan alternatif yang lebih murah

---

## 5. Multi-Tenancy

### Tidak Bisa Lihat Data Organisasi Lain

**Penjelasan:** Ini adalah **fitur keamanan**. Setiap organisasi memiliki data terpisah.

**Solusi:**

- Pindah ke organisasi yang benar via dropdown di navbar
- Minta undangan dari organisasi tersebut

---

### Undangan Tidak Terkirim

**Gejala:** Error saat mengundang anggota

**Solusi:**

1. Pastikan email valid
2. Pastikan user belum menjadi anggota
3. Cek apakah undangan sebelumnya masih pending

---

### Tidak Bisa Keluar dari Organisasi

**Gejala:** Error "Owner tidak bisa keluar"

**Penjelasan:** Owner tidak bisa meninggalkan organisasi yang dibuatnya.

**Solusi:**

1. Transfer ownership ke member lain terlebih dulu
2. Atau hapus organisasi (semua data akan hilang)

---

## 6. Development Issues

### Port Already in Use

**Gejala:** `Error: listen EADDRINUSE :::3001`

**Solusi Windows:**

```bash
# Cari proses yang menggunakan port
netstat -ano | findstr :3001

# Kill proses (ganti PID dengan nomor yang tampil)
taskkill /PID <PID> /F
```

**Solusi Mac/Linux:**

```bash
# Kill proses di port 3001
lsof -ti:3001 | xargs kill -9
```

---

### Hot Reload Tidak Bekerja

**Gejala:** Perubahan code tidak ter-refresh otomatis

**Solusi Frontend:**

1. Restart Vite dev server
2. Hapus cache: `rm -rf node_modules/.vite`

**Solusi Backend:**

1. Pastikan menggunakan `npm run dev:watch`
2. Atau restart server manual

---

### TypeScript Error

**Gejala:** Error type saat compile

**Solusi:**

```bash
# Regenerate Prisma types
cd backend
npx prisma generate

# Clear TypeScript cache
rm -rf node_modules/.cache
npm run build
```

---

### CORS Error

**Gejala:** `Access-Control-Allow-Origin` error di browser

**Solusi:**

1. Pastikan frontend mengakses URL yang benar
2. Cek konfigurasi CORS di backend:
   ```typescript
   app.use(
     cors({
       origin: "http://localhost:5173",
       credentials: true,
     })
   );
   ```

---

## Kontak Support

Jika masalah masih berlanjut:

1. Cek issue di GitHub repository
2. Buat issue baru dengan detail:
   - Langkah reproduksi
   - Screenshot error
   - Log dari console/terminal
