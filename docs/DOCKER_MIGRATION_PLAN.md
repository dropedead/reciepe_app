# Rencana Migrasi Docker untuk ResepKu App

> **Status**: Disimpan untuk implementasi nanti (saat pre-deployment)
> **Dibuat**: 29 Desember 2024

## Ringkasan

Dokumen ini berisi rencana migrasi aplikasi ResepKu ke Docker untuk memudahkan development dan deployment.

**Struktur Aplikasi Saat Ini:**

- **Backend**: Express.js + Prisma ORM + SQLite
- **Frontend**: Vite + React + TypeScript + TailwindCSS

**Target Setelah Migrasi:**

- Backend, Frontend, dan PostgreSQL berjalan dalam Docker containers
- Data persisten dengan Docker volumes
- Easy setup untuk developer baru

---

## Penjelasan Docker untuk Pemula

### Apa itu Docker?

Docker adalah platform yang memungkinkan Anda menjalankan aplikasi dalam "container" - lingkungan terisolasi yang berisi semua yang dibutuhkan aplikasi untuk berjalan (code, runtime, libraries, dll).

### Istilah Docker yang Perlu Diketahui

| Istilah            | Penjelasan                                                 |
| ------------------ | ---------------------------------------------------------- |
| **Image**          | Template/blueprint untuk container (seperti ISO installer) |
| **Container**      | Instance yang berjalan dari image (seperti VM yang ringan) |
| **Dockerfile**     | File instruksi untuk membuat image                         |
| **docker-compose** | Tool untuk menjalankan multiple containers sekaligus       |
| **Volume**         | Penyimpanan data yang persisten di luar container          |

---

## File yang Akan Dibuat

### 1. `Dockerfile.backend`

```dockerfile
# Backend Dockerfile untuk Express.js + Prisma
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/ .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### 2. `Dockerfile.frontend`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. `docker-compose.yml`

```yaml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    container_name: resepku-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: recipe_app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: resepku-backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/recipe_app?schema=public
      PORT: 3001
      NODE_ENV: production
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
    ports:
      - "3001:3001"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: resepku-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 4. `.dockerignore`

```
node_modules
dist
.git
.env
*.log
.DS_Store
```

---

## Langkah Migrasi

### Step 1: Update Prisma Schema

Ubah provider dari SQLite ke PostgreSQL di `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // ubah dari "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 2: Buat File Docker

Copy semua file di atas ke root project.

### Step 3: Build dan Jalankan

```bash
# Build dan jalankan semua containers
docker-compose up --build

# Jalankan di background
docker-compose up -d

# Jalankan migrasi database
docker-compose exec backend npx prisma migrate deploy

# Jalankan seed (opsional)
docker-compose exec backend npm run seed
```

### Step 4: Verifikasi

- Frontend: http://localhost
- Backend API: http://localhost:3001/api

---

## Perintah Docker Berguna

```bash
# Lihat status containers
docker-compose ps

# Lihat logs
docker-compose logs -f

# Stop semua
docker-compose down

# Reset database (hapus data)
docker-compose down -v
docker-compose up -d

# Masuk ke container
docker-compose exec backend sh
docker-compose exec db psql -U postgres -d recipe_app
```

---

## Catatan Penting

⚠️ **Backup Data**: Sebelum migrasi, backup database SQLite (`backend/prisma/dev.db`).

⚠️ **Data Migration**: Data dari SQLite tidak otomatis pindah ke PostgreSQL. Perlu seed ulang atau export-import manual.

💡 **Development**: Untuk development sehari-hari dengan hot-reload, tetap gunakan local development sampai siap deploy.
