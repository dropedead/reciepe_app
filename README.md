# ResepKu - Aplikasi Manajemen Resep & Kalkulator HPP

<p align="center">
  <strong>Platform lengkap untuk mengelola resep, menu, dan menghitung Harga Pokok Penjualan (HPP) untuk bisnis kuliner</strong>
</p>

---

## 📋 Deskripsi

**ResepKu** adalah aplikasi web full-stack yang dirancang khusus untuk bisnis kuliner (restoran, cafe, catering, cloud kitchen) untuk:

- Mengelola database resep dan menu
- Menghitung HPP (Harga Pokok Penjualan) secara otomatis
- Menganalisis profit margin
- Membuat paket promo bundling
- Mengelola tim dengan sistem multi-tenant

---

## ✨ Fitur Utama

### 🍳 Menu Lab

| Fitur               | Deskripsi                                                           |
| ------------------- | ------------------------------------------------------------------- |
| **Manajemen Menu**  | Buat dan kelola menu dengan kategori, harga jual, dan foto          |
| **Manajemen Resep** | Buat resep dengan bahan-bahan, SOP, dan video tutorial              |
| **Komponen Resep**  | Resep bisa menggunakan resep lain sebagai komponen (nested recipes) |
| **Kalkulator HPP**  | Hitung HPP otomatis berdasarkan bahan dan resep                     |

### 📦 Master Data

| Fitur             | Deskripsi                                                           |
| ----------------- | ------------------------------------------------------------------- |
| **Bahan Baku**    | Kelola database bahan dengan harga beli dan konversi satuan         |
| **Satuan**        | Custom satuan dengan konversi otomatis (kg → gram, liter → ml, dll) |
| **Kategori**      | Kategorisasi untuk bahan, resep, dan menu                           |
| **Riwayat Harga** | Tracking perubahan harga bahan dari waktu ke waktu                  |

### 🎯 Promosi

| Fitur                   | Deskripsi                                                       |
| ----------------------- | --------------------------------------------------------------- |
| **Menu Bundling**       | Buat paket promo dengan kombinasi menu                          |
| **Tipe Promo**          | Buy 1 Get 1, Buy 2 Get 1, Diskon %, Diskon Nominal, Harga Paket |
| **Analisis HPP Bundle** | Hitung HPP dan profit margin untuk setiap bundle                |

### 👥 Kolaborasi Tim

| Fitur                 | Deskripsi                                 |
| --------------------- | ----------------------------------------- |
| **Multi-Tenant**      | Setiap organisasi memiliki data terpisah  |
| **Role Management**   | Owner, Admin, Member dengan akses berbeda |
| **Undang Anggota**    | Undang anggota tim via email              |
| **Notifikasi In-App** | Notifikasi untuk undangan dan aktivitas   |

### 🔐 Autentikasi

| Fitur                  | Deskripsi                        |
| ---------------------- | -------------------------------- |
| **Email & Password**   | Registrasi dan login tradisional |
| **Google OAuth**       | Login dengan akun Google         |
| **Email Verification** | Verifikasi email untuk keamanan  |
| **Profile Management** | Edit profil, foto, dan password  |

---

## 🛠️ Tech Stack

### Frontend

| Teknologi           | Fungsi                  |
| ------------------- | ----------------------- |
| **React 18**        | UI Framework            |
| **TypeScript**      | Type Safety             |
| **Vite**            | Build Tool & Dev Server |
| **TailwindCSS**     | Styling                 |
| **React Router v6** | Routing                 |
| **Axios**           | HTTP Client             |
| **Lucide React**    | Icon Library            |
| **Chart.js**        | Data Visualization      |

### Backend

| Teknologi               | Fungsi           |
| ----------------------- | ---------------- |
| **Express.js**          | Web Framework    |
| **TypeScript**          | Type Safety      |
| **Prisma ORM**          | Database ORM     |
| **PostgreSQL/SQLite**   | Database         |
| **JWT**                 | Authentication   |
| **bcrypt**              | Password Hashing |
| **Google Auth Library** | OAuth            |

---

## 📁 Struktur Project

```
reciepe_app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── migrations/      # Database migrations
│   │   └── seed.ts          # Seed data
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, tenant middleware
│   │   └── index.ts         # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── api.ts           # API client
│   │   └── App.tsx          # Main App
│   └── package.json
│
└── docs/
    └── DOCKER_MIGRATION_PLAN.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm atau yarn
- PostgreSQL (production) atau SQLite (development)

### Development Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd reciepe_app

# 2. Setup Backend
cd backend
npm install
npx prisma migrate dev    # Setup database
npm run seed              # Optional: seed sample data
npm run dev               # Start backend (localhost:3001)

# 3. Setup Frontend (terminal baru)
cd frontend
npm install
npm run dev               # Start frontend (localhost:5173)
```

### Environment Variables

**Backend (.env)**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/recipe_app"
PORT=3001
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
```

**Frontend (.env)**

```env
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 📊 Database Schema Overview

```
User ──────────────────────────┐
  │                            │
  ├── OrganizationMember ──────┼── Organization
  │                            │       │
  ├── Notification             │       ├── Ingredient ── PriceHistory
  │                            │       │
  └── Invitation (sent) ───────┘       ├── Recipe ──┬── RecipeIngredient
                                       │            └── RecipeComponent
                                       │
                                       ├── Menu ──┬── MenuRecipe
                                       │          └── MenuBundleItem
                                       │
                                       ├── MenuBundle ── MenuBundleItem
                                       │
                                       └── Categories (ingredient, menu, recipe)
```

---

## 📱 Screenshots

> Screenshots dapat ditambahkan di sini

---

## 📝 API Documentation

Base URL: `http://localhost:3001/api`

### Auth

- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login
- `POST /auth/google` - Google OAuth login
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile

### Master Data

- `GET/POST/PUT/DELETE /ingredients` - CRUD bahan baku
- `GET/POST/PUT/DELETE /units` - CRUD satuan
- `GET/POST/PUT/DELETE /categories` - CRUD kategori bahan

### Menu Lab

- `GET/POST/PUT/DELETE /recipes` - CRUD resep
- `GET/POST/PUT/DELETE /menus` - CRUD menu
- `GET/POST/PUT/DELETE /recipe-categories` - CRUD kategori resep
- `GET/POST/PUT/DELETE /menu-categories` - CRUD kategori menu

### Promosi

- `GET/POST/PUT/DELETE /bundling` - CRUD menu bundling
- `POST /bundling/calculate` - Hitung HPP bundle

### Team

- `GET/POST/PUT/DELETE /organizations` - CRUD organisasi
- `POST /invitations` - Kirim undangan
- `GET /notifications` - Get notifikasi

---

## 🔒 Multi-Tenancy

Aplikasi ini menggunakan sistem multi-tenant dimana:

- Setiap organisasi memiliki data terpisah
- User bisa menjadi anggota di beberapa organisasi
- Header `X-Organization-Id` digunakan untuk menentukan konteks organisasi

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Built with ❤️ for Indonesian F&B businesses
