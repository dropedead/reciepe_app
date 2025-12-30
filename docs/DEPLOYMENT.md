# 🚀 Panduan Deployment ResepKu

Panduan ini mencakup dua opsi deployment:

1. **Cloud Services** (Vercel + Render + Supabase) - Gratis, mudah
2. **VPS + Docker** - Full control, self-hosted

---

# 📌 OPSI 1: Cloud Services (Gratis)

Stack: Frontend (Vercel), Backend (Render), Database (Supabase)

## 📋 Prasyarat

- [ ] Akun [GitHub](https://github.com)
- [ ] Akun [Supabase](https://supabase.com)
- [ ] Akun [Render](https://render.com)
- [ ] Akun [Vercel](https://vercel.com)
- [ ] Repository sudah di-push ke GitHub

---

## 📦 Step 1: Setup Database (Supabase)

### 1.1 Buat Project Baru

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Klik **"New Project"**
3. Isi:
   - **Name**: `resepku-db`
   - **Database Password**: (password aman)
   - **Region**: Singapore
4. Klik **"Create new project"**

### 1.2 Dapatkan Connection String

1. Buka **Project Settings** → **Database**
2. Copy connection string dari tab **"URI"**

---

## 🔧 Step 2: Deploy Backend (Render)

1. Login ke [Render Dashboard](https://dashboard.render.com)
2. **New +** → **Web Service**
3. Connect repository GitHub

| Setting            | Value                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| **Name**           | `resepku-api`                                                                      |
| **Region**         | Singapore                                                                          |
| **Root Directory** | `backend`                                                                          |
| **Build Command**  | `npm install && npx prisma generate && npx prisma migrate deploy && npm run build` |
| **Start Command**  | `npm start`                                                                        |

### Environment Variables:

| Key              | Value                 |
| ---------------- | --------------------- |
| `DATABASE_URL`   | (dari Supabase)       |
| `NODE_ENV`       | `production`          |
| `JWT_SECRET`     | (random 32+ karakter) |
| `JWT_EXPIRES_IN` | `7d`                  |
| `FRONTEND_URL`   | (URL Vercel nanti)    |

---

## 🌐 Step 3: Deploy Frontend (Vercel)

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. **Add New...** → **Project**
3. Import repository GitHub

| Setting            | Value      |
| ------------------ | ---------- |
| **Framework**      | Vite       |
| **Root Directory** | `frontend` |

### Environment Variables:

| Key            | Value                              |
| -------------- | ---------------------------------- |
| `VITE_API_URL` | `https://resepku-api.onrender.com` |

---

## 💰 Estimasi Biaya (Cloud)

| Service  | Biaya    |
| -------- | -------- |
| Vercel   | $0/bulan |
| Render   | $0/bulan |
| Supabase | $0/bulan |

> ⚠️ Render Free tier akan "sleep" setelah 15 menit idle.

---

---

# 📌 OPSI 2: VPS + Docker (Self-Hosted)

Stack: Docker Compose dengan PostgreSQL, Backend, Frontend, Nginx

## 📋 Prasyarat

- [ ] VPS Ubuntu 20.04 (minimal 1GB RAM)
- [ ] Akun GitHub
- [ ] Domain (opsional, bisa pakai IP)

---

## 🛠️ Step 1: Setup VPS

### 1.1 SSH ke VPS

```bash
ssh root@YOUR_VPS_IP
```

### 1.2 Jalankan Setup Script

```bash
# Download dan jalankan setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/deploy/setup-vps.sh -o setup-vps.sh
sudo bash setup-vps.sh
```

Script ini akan:

- ✅ Install Docker & Docker Compose
- ✅ Buat user `deploy`
- ✅ Setup firewall (UFW)
- ✅ Buat swap file 2GB

---

## 📥 Step 2: Clone Repository

```bash
# Ganti ke user deploy
sudo su - deploy

# Clone repository
git clone https://github.com/YOUR_USERNAME/reciepe_app.git /home/deploy/resepku
cd /home/deploy/resepku
```

---

## ⚙️ Step 3: Konfigurasi Environment

```bash
# Copy template environment
cp .env.docker.example .env

# Edit file .env
nano .env
```

Isi variabel berikut:

```env
DB_USER=resepku
DB_PASSWORD=password_aman_anda
DB_NAME=resepku

JWT_SECRET=minimal_32_karakter_random_string
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://YOUR_VPS_IP
VITE_API_URL=http://YOUR_VPS_IP/api
```

---

## 🚀 Step 4: Deploy

```bash
# Build dan jalankan containers
docker-compose up -d --build

# Cek status containers
docker-compose ps

# Lihat logs
docker-compose logs -f
```

---

## 🔄 Step 5: Setup Auto-Deploy dari GitHub

### 5.1 Generate SSH Key di VPS

```bash
sudo -u deploy ssh-keygen -t ed25519 -C "github-actions"
# Tekan Enter untuk semua prompt

# Tampilkan public key
cat /home/deploy/.ssh/id_ed25519.pub
```

Tambahkan public key ke `/home/deploy/.ssh/authorized_keys`

### 5.2 Setup GitHub Secrets

Buka GitHub repo → **Settings** → **Secrets and variables** → **Actions**

Tambahkan secrets:

| Secret Name    | Value                                             |
| -------------- | ------------------------------------------------- |
| `VPS_HOST`     | IP address VPS Anda                               |
| `VPS_USERNAME` | `deploy`                                          |
| `VPS_SSH_KEY`  | (private key dari `/home/deploy/.ssh/id_ed25519`) |
| `VPS_PORT`     | `22`                                              |

### 5.3 Test Auto-Deploy

Push perubahan ke branch `main`, dan GitHub Actions akan otomatis deploy!

---

## 🔧 Maintenance Commands

```bash
# Restart semua containers
docker-compose restart

# Stop semua containers
docker-compose down

# Lihat logs
docker-compose logs -f backend

# Masuk ke container database
docker exec -it resepku-db psql -U resepku

# Update dan rebuild
git pull && docker-compose up -d --build

# Bersihkan unused images
docker system prune -f
```

---

## 🐛 Troubleshooting

### Container tidak start

```bash
docker-compose logs backend
# Cek error message
```

### Database connection error

```bash
# Pastikan DB container running
docker-compose ps

# Restart DB
docker-compose restart db
```

### Out of memory

```bash
# Cek memory usage
free -h

# Cek swap
swapon --show
```

---

## 💰 Estimasi Biaya (VPS)

| Provider     | Spek                  | Biaya            |
| ------------ | --------------------- | ---------------- |
| Rumahweb     | 1GB RAM, 1 Core, 20GB | ~Rp 50.000/bulan |
| DigitalOcean | 1GB RAM, 1 Core, 25GB | $6/bulan         |
| Vultr        | 1GB RAM, 1 Core, 25GB | $6/bulan         |

---

## 📁 File Structure (Docker)

```
reciepe_app/
├── .github/workflows/deploy.yml  # Auto-deploy
├── backend/
│   ├── Dockerfile               # Backend image
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile               # Frontend image
│   ├── nginx.conf               # SPA routing
│   └── .dockerignore
├── deploy/
│   ├── nginx/nginx.conf         # Reverse proxy
│   ├── setup-vps.sh            # VPS setup script
│   └── deploy.sh               # Manual deploy
├── docker-compose.yml           # Orchestration
└── .env.docker.example          # Env template
```
