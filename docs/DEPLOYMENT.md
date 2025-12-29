# 🚀 Panduan Deployment ResepKu

Panduan lengkap untuk deploy aplikasi ResepKu dengan stack:

- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (Express.js)
- **Database**: Supabase (PostgreSQL)

---

## 📋 Prasyarat

Pastikan Anda sudah memiliki:

- [ ] Akun [GitHub](https://github.com) (untuk connect repository)
- [ ] Akun [Supabase](https://supabase.com) (Sign up dengan GitHub)
- [ ] Akun [Render](https://render.com) (Sign up dengan GitHub)
- [ ] Akun [Vercel](https://vercel.com) (Sign up dengan GitHub)
- [ ] Repository sudah di-push ke GitHub

---

## 📦 Step 1: Setup Database (Supabase)

### 1.1 Buat Project Baru

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Klik **"New Project"**
3. Isi:
   - **Name**: `resepku-db`
   - **Database Password**: (Sasuke1231@@@)
   - **Region**: Singapore (terdekat dengan Indonesia)
4. Klik **"Create new project"** dan tunggu ~2 menit

### 1.2 Dapatkan Connection String

1. Buka **Project Settings** → **Database**
2. Scroll ke bagian **"Connection string"**
3. Pilih tab **"URI"**
4. Copy connection string, formatnya seperti ini:
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
5. **Simpan connection string ini!** Anda akan membutuhkannya nanti.
   postgresql://postgres:[sasuke1231@@@]@db.hopwbvnwydsbmwejukyw.supabase.co:5432/postgres

> ⚠️ **Penting**: Ganti `[YOUR-PASSWORD]` dengan password yang Anda buat tadi!

---

## 🔧 Step 2: Persiapan Kode

### 2.1 Update Prisma Schema untuk PostgreSQL

Edit file `backend/prisma/schema.prisma`:

```prisma
// Ubah dari sqlite ke postgresql
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2.2 Buat File Production Environment

Buat file `backend/.env.production.example`:

```env
# Database
DATABASE_URL="postgresql://..."

# Server
PORT=10000
NODE_ENV=production

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Frontend URL (akan diisi setelah deploy Vercel)
FRONTEND_URL="https://your-app.vercel.app"

# Google OAuth (opsional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 2.3 Update CORS di Backend

Pastikan `backend/src/app.ts` atau `index.ts` mengizinkan CORS dari Vercel:

```typescript
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL || "https://your-app.vercel.app",
    ],
    credentials: true,
  })
);
```

### 2.4 Update API URL di Frontend

Edit file `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend.onrender.com
```

Lalu update `frontend/src/api.ts` jika belum:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  // ... rest of config
});
```

---

## 🖥️ Step 3: Deploy Backend (Render)

### 3.1 Push ke GitHub

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 3.2 Buat Web Service di Render

1. Login ke [Render Dashboard](https://dashboard.render.com)
2. Klik **"New +"** → **"Web Service"**
3. Connect repository GitHub Anda
4. Konfigurasi:

| Setting            | Value                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| **Name**           | `resepku-api`                                                                      |
| **Region**         | Singapore                                                                          |
| **Branch**         | `main`                                                                             |
| **Root Directory** | `backend`                                                                          |
| **Runtime**        | Node                                                                               |
| **Build Command**  | `npm install && npx prisma generate && npx prisma migrate deploy && npm run build` |
| **Start Command**  | `npm start`                                                                        |
| **Instance Type**  | Free                                                                               |

### 3.3 Set Environment Variables

Di Render dashboard, tambahkan Environment Variables:

| Key              | Value                                       |
| ---------------- | ------------------------------------------- |
| `DATABASE_URL`   | (Connection string dari Supabase)           |
| `NODE_ENV`       | `production`                                |
| `PORT`           | `10000`                                     |
| `JWT_SECRET`     | (Generate string random 32+ karakter)       |
| `JWT_EXPIRES_IN` | `7d`                                        |
| `FRONTEND_URL`   | (Kosongkan dulu, isi setelah deploy Vercel) |

### 3.4 Deploy

1. Klik **"Create Web Service"**
2. Tunggu deployment selesai (~5-10 menit)
3. Catat URL backend Anda: `https://resepku-api.onrender.com`

> ⚠️ **Catatan**: Deploy pertama bisa gagal karena migration. Jika error, coba **Manual Deploy** lagi.

---

## 🌐 Step 4: Deploy Frontend (Vercel)

### 4.1 Import Project

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **"Add New..."** → **"Project"**
3. Import repository GitHub Anda

### 4.2 Konfigurasi

| Setting              | Value           |
| -------------------- | --------------- |
| **Framework Preset** | Vite            |
| **Root Directory**   | `frontend`      |
| **Build Command**    | `npm run build` |
| **Output Directory** | `dist`          |
| **Install Command**  | `npm install`   |

### 4.3 Environment Variables

Tambahkan:

| Key            | Value                              |
| -------------- | ---------------------------------- |
| `VITE_API_URL` | `https://resepku-api.onrender.com` |

### 4.4 Deploy

1. Klik **"Deploy"**
2. Tunggu deployment selesai (~2-3 menit)
3. Catat URL frontend: `https://resepku.vercel.app`

---

## 🔗 Step 5: Finalisasi

### 5.1 Update FRONTEND_URL di Render

1. Kembali ke Render Dashboard
2. Buka service `resepku-api`
3. Go to **Environment** tab
4. Tambah/Update:
   - `FRONTEND_URL` = `https://resepku.vercel.app` (URL Vercel Anda)
5. Klik **"Save Changes"** → Service akan auto-redeploy

### 5.2 Test Aplikasi

1. Buka URL Vercel Anda
2. Coba register user baru
3. Coba login
4. Buat organisasi dan data

---

## ✅ Checklist Final

- [ ] Database Supabase created
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Test registration works
- [ ] Test login works
- [ ] Test CRUD operations work

---

## 🐛 Troubleshooting

### Backend tidak start di Render

- Cek logs di Render dashboard
- Pastikan `DATABASE_URL` benar
- Pastikan `npm start` script ada di `package.json`

### CORS Error

- Pastikan `FRONTEND_URL` sudah di-set di Render
- Pastikan tidak ada trailing slash di URL

### Database migration error

- Jalankan manual: `npx prisma migrate deploy`
- Atau reset: `npx prisma db push --force-reset` (⚠️ hapus semua data)

### Login tidak bekerja

- Cek JWT_SECRET sudah di-set
- Pastikan cookies bisa di-set (kredensial true)

---

## 💰 Estimasi Biaya

| Service   | Tier  | Biaya        |
| --------- | ----- | ------------ |
| Vercel    | Hobby | **$0/bulan** |
| Render    | Free  | **$0/bulan** |
| Supabase  | Free  | **$0/bulan** |
| **Total** |       | **$0/bulan** |

> **Note**: Render Free tier akan "sleep" setelah 15 menit tidak aktif. Cold start ~30 detik.

---

## 📞 Butuh Bantuan?

Jika ada error atau kendala, pastikan untuk:

1. Cek logs di masing-masing dashboard
2. Screenshot error message
3. Cek environment variables sudah benar
