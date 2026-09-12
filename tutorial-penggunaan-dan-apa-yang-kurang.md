# Tutorial Penggunaan & Yang Kurang

**Tanggal:** 12 September 2026
**Versi:** 1.0
**Tujuan:** Panduan lengkap setup infrastruktur & deployment

---

## Daftar Isi

1. [Prasyarat](#1-prasyarat)
2. [Setup MongoDB](#2-setup-mongodb)
3. [Setup Redis](#3-setup-redis)
4. [Setup Email (Forgot Password)](#4-setup-email-forgot-password)
5. [Setup Elice AI Cloud API Keys](#5-setup-elice-ai-cloud-api-keys)
6. [Setup Lokal (Development)](#6-setup-lokal-development)
7. [Menjalankan Worker](#7-menjalankan-worker)
8. [Testing API](#8-testing-api)
9. [Deploy ke Vercel](#9-deploy-ke-vercel)
10. [Deploy ke VPS](#10-deploy-ke-vps)
11. [Troubleshooting](#11-troubleshooting)
12. [Checklist Handover](#12-checklist-handover)

---

## 1. Prasyarat

Sebelum memulai, pastikan sudah terinstall:

| Software | Versi Minimum | Cek Instalasi |
|----------|---------------|---------------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Git | 2.0+ | `git --version` |
| FFmpeg | 5.0+ | `ffmpeg -version` |
| MongoDB | 6.0+ | `mongod --version` |
| Redis | 7.0+ | `redis-server --version` |

**Catatan:** Jika menggunakan MongoDB Atlas dan Redis Cloud, FFmpeg dan Redis lokal tidak perlu diinstall (kecuali untuk rendering video).

---

## 2. Setup MongoDB

### 2.1 Opsi A: MongoDB Atlas (Recommended untuk Production)

**Langkah-langkah:**

1. **Buka** [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. **Sign up** atau **Login** ke akun MongoDB
3. **Create Cluster:**
   - Klik "Build a Database"
   - Pilih "FREE" (M0 Sandbox)
   - Pilih region terdekat (Singapore recommended)
   - Klik "Create"
4. **Setup Database Access:**
   - Buka menu "Security" → "Database Access"
   - Klik "Add New Database User"
   - Authentication Method: "Password"
   - Username: `cuplik-admin` (atau sesuai selera)
   - Password: `your-strong-password` (catat ini!)
   - Database User Privileges: "Read and Write to Any Database"
   - Klik "Add User"
5. **Setup Network Access:**
   - Buka menu "Security" → "Network Access"
   - Klik "Add IP Address"
   - Untuk development: Klik "Allow Access from Anywhere" (0.0.0.0/0)
   - Untuk production: Tambahkan IP VPS/Frontend only
   - Klik "Confirm"
6. **Get Connection String:**
   - Buka menu "Deployment" → "Database"
   - Klik "Connect" pada cluster
   - Pilih "Connect your application"
   - Driver: "Node.js"
   - Version: "5.0 or later"
   - Copy connection string

**Connection String Format:**
```
mongodb+srv://cuplik-admin:your-password@cluster0.xxxxx.mongodb.net/cuplik?retryWrites=true&w=majority
```

7. **Update `.env`:**
```env
MONGODB_URI=mongodb+srv://cuplik-admin:your-password@cluster0.xxxxx.mongodb.net/cuplik?retryWrites=true&w=majority
```

### 2.2 Opsi B: MongoDB Lokal (Development)

**Install MongoDB Community Edition:**

**Windows:**
1. Download dari [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run installer
3. Pilih "Complete" installation
4. Install MongoDB as a Service
5. MongoDB akan jalan otomatis di port 27017

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Linux (Ubuntu/Debian):**
```bash
# Import public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-community

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Connection String (Lokal):**
```env
MONGODB_URI=mongodb://localhost:27017/cuplik
```

### 2.3 Verifikasi MongoDB

```bash
# Test koneksi
mongosh "mongodb://localhost:27017/cuplik"

# Atau dengan MongoDB Compass (GUI)
# Download: https://www.mongodb.com/products/compass
# Paste connection string → Connect
```

---

## 3. Setup Redis

### 3.1 Opsi A: Redis Cloud (Recommended untuk Production)

**Langkah-langkah:**

1. **Buka** [https://redis.com/try/free/](https://redis.com/try/free/)
2. **Sign up** atau **Login**
3. **Create Database:**
   - Pilih "Redis Stack"
   - Pilih region terdekat
   - Pilih "Free" plan (30MB)
   - Klik "Create"
4. **Get Connection Details:**
   - Buka database → "Connect"
   - Pilih "Redis CLI"
   - Copy host, port, password

**Connection Details:**
```
Host: redis-xxxxx.c1.ap-southeast-1-1.ec2.cloud.redislabs.com
Port: 12345
Password: your-password
```

5. **Update `.env`:**
```env
REDIS_HOST=redis-xxxxx.c1.ap-southeast-1-1.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASS=your-password
```

**Note:** Jika Redis Cloud membutuhkan password, update `src/config/redis.js`:
```javascript
const redis = new Redis({
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,
  password: ENV.REDIS_PASS, // tambahkan ini
  maxRetriesPerRequest: null,
});
```

### 3.2 Opsi B: Redis Lokal (Development)

**Install Redis:**

**Windows:**
1. Download dari [https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)
2. Extract ke `C:\Redis`
3. Jalankan: `redis-server.exe redis.windows.conf`

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

**Connection String (Lokal):**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3.3 Verifikasi Redis

```bash
# Test koneksi
redis-cli ping
# Should return: PONG

# Atau dengan Redis GUI (RedisInsight)
# Download: https://redis.com/redisinsight/
```

---

## 4. Setup Email (Forgot Password)

### 4.1 Opsi A: Gmail SMTP (Recommended untuk Development)

**Langkah-langkah:**

1. **Buka Akun Google** yang akan digunakan sebagai pengirim email
2. **Enable 2-Factor Authentication:**
   - Buka [https://myaccount.google.com/security](https://myaccount.google.com/security)
   - Aktifkan "2-Step Verification"
3. **Generate App Password:**
   - Buka [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Pilih app: "Mail"
   - Pilih device: "Other (Custom name)" → ketik "Cuplik Backend"
   - Klik "Generate"
   - **CATAT password yang muncul!** (16 karakter, format: xxxx xxxx xxxx xxxx)
4. **Update `.env`:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx   # App password, bukan password Google!
EMAIL_FROM=noreply@cuplik.id
```

**Catatan Penting:**
- `SMTP_PASS` adalah **App Password**, bukan password Google biasa!
- Jika tidak muncul opsi App Password, pastikan 2FA sudah aktif
- Jika masih error, coba "Less secure app access" (tidak recommended)

### 4.2 Opsi B: SendGrid (Recommended untuk Production)

**Langkah-langkah:**

1. **Buka** [https://sendgrid.com](https://sendgrid.com)
2. **Sign up** (free tier: 100 email/hari)
3. **Create API Key:**
   - Settings → API Keys → Create API Key
   - Name: "Cuplik Backend"
   - Permissions: "Full Access" atau "Mail Send Only"
   - Copy API Key
4. **Verify Sender Email:**
   - Settings → Sender Authentication
   - Single Sender Verification
   - Verify email yang akan digunakan sebagai pengirim
5. **Update `.env`:** (perlu update emailService.js untuk SendGrid)

**Note:** SendGrid menggunakan API, bukan SMTP. Perlu modifikasi `emailService.js`:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  await sgMail.send({
    from: ENV.EMAIL_FROM,
    to,
    subject,
    html,
  });
};
```

### 4.3 Opsi C: Mailtrap (Untuk Testing)

1. **Buka** [https://mailtrap.io](https://mailtrap.io)
2. **Sign up** free
3. **Create Inbox:**
   - My Inbox → Create Inbox
   - Name: "Cuplik Backend"
4. **Get SMTP Credentials:**
   - Buka inbox → SMTP Settings
   - Pilih "Node.js - Nodemailer"
   - Copy host, port, username, password

**Update `.env`:**
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
EMAIL_FROM=noreply@cuplik.id
```

### 4.4 Verifikasi Email

```bash
# Test kirim email
node -e "
const { sendEmail } = require('./src/services/emailService');
sendEmail({
  to: 'your-email@gmail.com',
  subject: 'Test Cuplik Email',
  html: '<p>Test email berhasil!</p>'
}).then(() => console.log('Email sent!')).catch(err => console.error(err));
"
```

---

## 5. Setup Elice AI Cloud API Keys

### 5.1 Info

- **Platform:** Elice AI Cloud
- **Endpoint URL:** Menggunakan domain `mlapi.run` (bukan `cloud.elice.io`)
- **API Key:** Satu API key bisa dipakai untuk semua provider AI (Whisper, GPT, dll)
- **Provider tersedia:** Whisper Large-v3 (ASR), GPT-5.6 Luna (LLM), dan lainnya

### 5.2 Update `.env`

```env
API_KEY=your-api-key
ASR_API_URL=https://mlapi.run/805a20fb-b66b-4b7c-84fb-079c12b76937
LLM_API_URL=https://mlapi.run/286e9158-d32e-436d-a23d-36b43fc8e68a
```

### 5.3 Update Code (jika perlu)

Jika endpoint URL berbeda dari yang ada di code, update `src/services/asrService.js` dan `src/services/llmService.js`:

**asrService.js:**
```javascript
// Header authorization
authorization: `Bearer ${ENV.API_KEY}`,
```

**llmService.js:**
```javascript
// Header authorization
authorization: `Bearer ${ENV.API_KEY}`,
```

### 5.4 Verifikasi API

```bash
# Test ASR API (Whisper)
curl -X POST "https://mlapi.run/805a20fb-b66b-4b7c-84fb-079c12b76937" \
  -H "accept: application/json" \
  -H "authorization: Bearer YOUR_API_KEY" \
  -F "file=@test-audio.wav" \
  -F "language=id"

# Test LLM API (GPT)
curl -X POST "https://mlapi.run/286e9158-d32e-436d-a23d-36b43fc8e68a" \
  -H "accept: application/json" \
  -H "authorization: Bearer YOUR_API_KEY" \
  -H "content-type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"response_format":{"type":"json_object"}}'
```

**Catatan:**
- Satu API Key (`API_KEY`) bisa dipakai untuk semua provider AI di Elice AI Cloud
- Tidak perlu beda API key untuk ASR dan LLM
- Cek dokumentasi Elice AI Cloud untuk format request/response yang tepat

---

## 6. Setup Lokal (Development)

### 6.1 Clone Repository

```bash
git clone https://github.com/your-repo/cuplik-backend.git
cd cuplik-backend
```

### 6.2 Install Dependencies

```bash
npm install
```

### 6.3 Setup Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit .env (isi semua variabel sesuai tutorial di atas)
# Gunakan editor favorit (VS Code, nano, vim, dll)
```

### 6.4 Buat Database Admin User

```bash
# Jalankan MongoDB shell
mongosh

# Switch ke database cuplik
use cuplik

# Buat admin user
db.users.insertOne({
  email: "admin@cuplik.id",
  password: "$2a$12$LJ3m4ys3Lk0TSwHJMl.KEe9SZvZ3.xhTBMDbxdGJyBMnR5iKz2pWm", // password: admin123
  role: "admin",
  is_active: true
})

# Exit
exit
```

**Catatan:** Password di atas adalah hash bcrypt dari "admin123". Untuk generate hash sendiri:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 12).then(hash => console.log(hash))"
```

### 6.5 Jalankan Server

Buka **3 terminal** terpisah:

**Terminal 1 - Backend Server:**
```bash
cd cuplik-backend
npm run dev
# Output: Cuplik backend running on port 3000
```

**Terminal 2 - Pipeline Worker:**
```bash
cd cuplik-backend
npm run worker
# Output: Redis connected, Worker ready
```

**Terminal 3 - (Opsional) Rerender Worker:**
```bash
# Jalankan jika ingin support re-render
node -e "require('./src/workers/rerenderWorker')"
```

### 6.6 Test Server

```bash
# Health check
curl http://localhost:3000/health
# Output: {"status":"ok"}

# Login (gunakan admin yang sudah dibuat)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cuplik.id","password":"admin123","role":"admin"}'
# Output: {"token":"eyJhbG...","user":{...}}
```

---

## 7. Menjalankan Worker

### 7.1 Pipeline Worker

Pipeline worker memproses video yang di-upload:

```bash
# Jalankan di terminal terpisah
npm run worker

# Atau dengan PM2 (recommended untuk production)
pm2 start src/workers/pipelineWorker.js --name cuplik-worker
```

**Fungsi:**
- Menerima job dari queue `cuplik-pipeline`
- Memproses 4 stage: Ingestion → Transcription → Curation → Rendering
- Concurrency: 2 job bersamaan

### 7.2 Rerender Worker

Rerender worker menangani re-render klip yang diedit:

```bash
# Jalankan di terminal terpisah
node src/workers/rerenderWorker.js

# Atau dengan PM2
pm2 start src/workers/rerenderWorker.js --name cuplik-rerender
```

**Fungsi:**
- Menerima job dari queue `cuplik-rerender`
- Re-render klip dengan parameter baru
- Concurrency: 1 job pada satu waktu

### 7.3 Monitoring Worker

```bash
# Cek status worker dengan PM2
pm2 list
pm2 logs cuplik-worker
pm2 logs cuplik-rerender

# Cek queue status via API
curl http://localhost:3000/api/v1/admin/telemetry \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 8. Testing API

### 8.1 Menggunakan cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cuplik.id","password":"admin123","role":"admin"}'
```

**Upload Video:**
```bash
curl -X POST http://localhost:3000/api/v1/workspace/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/video.mp4" \
  -F "layout_template=talking_head" \
  -F "custom_vocabulary=AI, machine learning, deep learning"
```

**Cek Status:**
```bash
curl http://localhost:3000/api/v1/workspace/session/YOUR_SESSION_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Ambil Clips:**
```bash
curl http://localhost:3000/api/v1/workspace/session/YOUR_SESSION_ID/clips \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Download MP4:**
```bash
curl http://localhost:3000/api/v1/clips/YOUR_CLIP_ID/download/mp4 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o clip-output.mp4
```

**Download SRT:**
```bash
curl http://localhost:3000/api/v1/clips/YOUR_CLIP_ID/download/srt \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o subtitle.srt
```

**Re-render Clip:**
```bash
curl -X POST http://localhost:3000/api/v1/clips/YOUR_CLIP_ID/rerender \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "start_time_seconds": 120.5,
    "end_time_seconds": 170.5,
    "modified_title": "Judul Baru",
    "modified_subtitles": [
      {"word": "Halo", "start_time": 120.5, "end_time": 120.8},
      {"word": "semua", "start_time": 120.9, "end_time": 121.2}
    ]
  }'
```

### 8.2 Menggunakan Postman

1. Import collection dari API Contract (baca `API-Contract.md`)
2. Set environment variables:
   - `base_url`: `http://localhost:3000`
   - `token`: (dari response login)
3. Jalankan request sesuai urutan

### 8.3 Testing Flow Lengkap

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cuplik.id","password":"admin123","role":"admin"}' | jq -r '.token')

# 2. Upload video
SESSION_ID=$(curl -s -X POST http://localhost:3000/api/v1/workspace/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-video.mp4" \
  -F "layout_template=talking_head" | jq -r '.session_id')

# 3. Poll status (sampai completed)
while true; do
  STATUS=$(curl -s http://localhost:3000/api/v1/workspace/session/$SESSION_ID/status \
    -H "Authorization: Bearer $TOKEN")
  echo "$STATUS" | jq '.overall_progress_percentage, .current_stage'
  
  if echo "$STATUS" | jq -e '.stages_detail.rendering == "done"' > /dev/null; then
    break
  fi
  sleep 5
done

# 4. Ambil clips
curl -s http://localhost:3000/api/v1/workspace/session/$SESSION_ID/clips \
  -H "Authorization: Bearer $TOKEN" | jq '.clips[].suggested_title'

# 5. Download clip pertama
CLIP_ID=$(curl -s http://localhost:3000/api/v1/workspace/session/$SESSION_ID/clips \
  -H "Authorization: Bearer $TOKEN" | jq -r '.clips[0].clip_id')

curl -X GET http://localhost:3000/api/v1/clips/$CLIP_ID/download/mp4 \
  -H "Authorization: Bearer $TOKEN" \
  -o output-clip.mp4

echo "Download selesai: output-clip.mp4"
```

---

## 9. Deploy ke Vercel

### 9.1 Catatan Penting

**Vercel adalah serverless platform** - tidak bisa menjalankan:
- Worker (BullMQ)
- Cron job (node-cron)
- WebSocket
- Long-running processes

**Solusi:** Deploy backend ke VPS (Railway, Render, DigitalOcean) atau gunakan Vercel untuk frontend only.

### 9.2 Deploy ke Railway (Recommended)

**Railway mendukung:**
- Node.js apps
- MongoDB (built-in)
- Redis (built-in)
- Background workers
- Cron jobs

**Langkah-langkah:**

1. **Buka** [https://railway.app](https://railway.app)
2. **Sign up** dengan GitHub
3. **Create New Project:**
   - "New Project" → "Deploy from GitHub Repo"
   - Pilih repository `cuplik-backend`
4. **Tambah MongoDB:**
   - "New" → "Database" → "MongoDB"
   - Railway akan provide connection string
   - Copy ke `MONGODB_URI` di Variables
5. **Tambah Redis:**
   - "New" → "Database" → "Redis"
   - Copy connection details ke Variables
6. **Set Environment Variables:**
   - Klik service → "Variables"
   - Tambah semua variabel dari `.env`:

```
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://mongo:xxxxx.railway.internal:27017/cuplik
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
JWT_SECRET=your-production-secret
API_KEY=your-api-key
ASR_API_URL=https://mlapi.run/xxx
LLM_API_URL=https://mlapi.run/yyy
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@cuplik.id
CORS_ORIGIN=https://your-frontend.vercel.app
```

7. **Deploy Worker:**
   - Klik service → "Settings" → "Start Command"
   - Set: `node src/workers/pipelineWorker.js`
   - Duplicate service untuk rerender worker

8. **Custom Domain (Opsional):**
   - Settings → Networking → Custom Domain
   - Tambah domain: `api.cuplik.id`
   - Update DNS records sesuai instruksi

### 9.3 Deploy ke Render

1. **Buka** [https://render.com](https://render.com)
2. **Create Web Service:**
   - Connect GitHub repo
   - Name: `cuplik-backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
3. **Tambah Redis:**
   - New → Redis
   - Copy connection details
4. **Gunakan MongoDB Atlas** (free tier)
5. **Create Background Worker:**
   - New → Background Worker
   - Same repo
   - Start Command: `npm run worker`

### 9.4 Deploy ke DigitalOcean App Platform

1. **Buka** [https://cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. **Create App:**
   - Connect GitHub
   - Select repo
   - Choose "Web Service"
   - Run Command: `npm start`
3. **Tambah Managed Database:**
   - Create → Databases → MongoDB
   - Create → Databases → Redis
4. **Set Environment Variables** di App Settings

---

## 10. Deploy ke VPS

### 10.1 Setup VPS (Ubuntu 22.04)

**Persiapan:**
```bash
# SSH ke VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MongoDB
# (ikuti langkah di Section 2.1 untuk MongoDB Atlas, atau install lokal)

# Install Redis
apt install -y redis-server
systemctl enable redis-server

# Install FFmpeg
apt install -y ffmpeg

# Install PM2
npm install -g pm2
```

### 10.2 Deploy Application

```bash
# Clone repository
cd /var/www
git clone https://github.com/your-repo/cuplik-backend.git
cd cuplik-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit semua variabel

# Start server
pm2 start src/app.js --name cuplik-server

# Start workers
pm2 start src/workers/pipelineWorker.js --name cuplik-worker
pm2 start src/workers/rerenderWorker.js --name cuplik-rerender

# Save PM2 config
pm2 save
pm2 startup

# Check status
pm2 list
pm2 logs
```

### 10.3 Setup Nginx (Reverse Proxy)

```bash
# Install Nginx
apt install -y nginx

# Create config
nano /etc/nginx/sites-available/cuplik
```

**Isi config:**
```nginx
server {
    listen 80;
    server_name api.cuplik.id;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/cuplik /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Setup SSL dengan Certbot
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.cuplik.id
```

### 10.4 Setup SSL (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d api.cuplik.id

# Auto-renewal (sudah otomatis)
certbot renew --dry-run
```

### 10.5 Monitoring dengan PM2

```bash
# Cek status
pm2 list

# Cek logs
pm2 logs cuplik-server
pm2 logs cuplik-worker

# Restart jika error
pm2 restart cuplik-server

# Cek resource usage
pm2 monit

# Setup log rotation
pm2 install pm2-logrotate
pm2 logrotate set --interval 1d --retain 7
```

---

## 11. Troubleshooting

### 11.1 MongoDB Connection Error

**Error:** `MongoDB connection error: connect ECONNREFUSED`

**Solusi:**
```bash
# Cek apakah MongoDB jalan
sudo systemctl status mongod

# Jika belum jalan
sudo systemctl start mongod

# Cek port
netstat -tlnp | grep 27017
```

### 11.2 Redis Connection Error

**Error:** `Redis error: connect ECONNREFUSED`

**Solusi:**
```bash
# Cek apakah Redis jalan
sudo systemctl status redis-server

# Jika belum jalan
sudo systemctl start redis-server

# Test koneksi
redis-cli ping
```

### 11.3 FFmpeg Not Found

**Error:** `ffmpeg-static: no such file or directory`

**Solusi:**
```bash
# Install ffmpeg-static
npm install ffmpeg-static

# Atau install FFmpeg global
sudo apt install ffmpeg

# Cek path
ffmpeg -version
```

### 11.4 Email Send Failed

**Error:** `Invalid login: 535 Authentication Failed`

**Solusi:**
1. Pastikan 2FA aktif di Google
2. Gunakan App Password, bukan password biasa
3. Cek `SMTP_USER` dan `SMTP_PASS` di `.env`
4. Test dengan Mailtrap dulu

### 11.5 Worker Tidak Jalan

**Error:** Worker tidak memproses job

**Solusi:**
```bash
# Cek apakah worker process jalan
pm2 list

# Cek logs
pm2 logs cuplik-worker

# Restart worker
pm2 restart cuplik-worker

# Cek Redis queue
redis-cli LLEN bull:cuplik-pipeline:waiting
```

### 11.6 File Upload Gagal

**Error:** `Ukuran file melebihi 1GB`

**Solusi:**
1. Cek `MAX_FILE_SIZE` di `.env` (default: 1073741824 = 1GB)
2. Cek config Nginx: `client_max_body_size 1G;`
3. Untuk Vercel: max 4.5MB (tidak cocok untuk video)

---

## 12. Checklist Handover

Sebelum handover ke developer lain, pastikan:

### 12.1 Credential & Access

- [ ] MongoDB Atlas access (atau VPS MongoDB credentials)
- [ ] Redis Cloud access (atau VPS Redis credentials)
- [ ] Elice AI Cloud API keys (ASR + LLM endpoints)
- [ ] Email SMTP credentials (Gmail App Password)
- [ ] JWT Secret (production)
- [ ] GitHub repository access
- [ ] VPS/Railway/Render access
- [ ] Domain DNS access (jika ada custom domain)
- [ ] Admin account credentials

### 12.2 Documentation

- [ ] `backend-flow.md` - Backend flow documentation
- [ ] `tutorial-penggunaan-dan-apa-yang-kurang.md` - Setup tutorial
- [ ] `API-Contract.md` - API specification
- [ ] `cuplik-backend-design-spec.md` - Design specification
- [ ] `README.md` - Basic setup guide

### 12.3 Code & Dependencies

- [ ] Semua dependencies terinstall (`npm install`)
- [ ] `.env` terisi lengkap (atau `.env.example` sebagai template)
- [ ] Tidak ada hardcoded secrets di code
- [ ] Semua environment variables didokumentasikan

### 12.4 Infrastructure

- [ ] MongoDB connection tested
- [ ] Redis connection tested
- [ ] FFmpeg installed dan working
- [ ] Elice AI Cloud API endpoints tested
- [ ] Email sending tested
- [ ] Worker running dan memproses jobs
- [ ] Cron job (file retention) working

### 12.5 Testing

- [ ] Login flow tested
- [ ] Upload video tested
- [ ] Pipeline processing tested
- [ ] Download MP4/SRT tested
- [ ] Re-render tested
- [ ] Error handling tested
- [ ] Admin telemetry tested

### 12.6 Deployment

- [ ] Server deployed dan running
- [ ] SSL certificate installed (jika production)
- [ ] CORS configured untuk frontend URL
- [ ] PM2/process manager configured
- [ ] Log rotation configured
- [ ] Monitoring setup (PM2 logs, error tracking)

---

## 13. Obfuscation (Proteksi Source Code)

Obfuscation adalah teknik untuk membuat kode sulit dibaca dan dipahami, tetapi tetap bisa dijalankan. Berguna untuk melindungi source code saat deploy ke production.

### 13.1 Mengapa Perlu Obfuscation?

- Melindifikasi algoritma bisnis
- Mencegah reverse engineering
- Melindungi API keys dan secrets
- Komersialisasi produk

### 13.2 Opsi Obfuscation untuk Node.js

#### Opsi A: javascript-obfuscator (Recommended)

**Install:**
```bash
npm install -g javascript-obfuscator
```

**Obfuscate satu file:**
```bash
javascript-obfuscator src/app.js --output dist/app.js --compact true --control-flow-flattening true
```

**Obfuscate semua file:**
```bash
# Buat script obfuscate.js
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const obfuscateFile = (inputPath, outputPath) => {
  const code = fs.readFileSync(inputPath, 'utf8');
  const result = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
  });
  
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result.getObfuscatedCode());
};

// Obfuscate semua file di src/
const srcDir = './src';
const distDir = './dist';

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  if (file.endsWith('.js')) {
    obfuscateFile(`${srcDir}/${file}`, `${distDir}/${file}`);
    console.log(`Obfuscated: ${file}`);
  }
});
```

**Jalankan:**
```bash
node obfuscate.js
```

#### Opsi B: Use Deno (Alternatif)

Deno memiliki fitur compile ke binary yang sudah ter-obfuscate:
```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh

# Compile ke binary
deno compile --allow-all src/app.js
```

#### Opsi C: pkg (Compile ke Binary)

```bash
# Install
npm install -g pkg

# Compile
pkg src/app.js --targets node18-linux-x64 --output dist/cuplik
```

### 13.3 Level Obfuscation

| Level | Fitur | Performa | Keterangan |
|-------|-------|----------|------------|
| Low | Compact, rename vars | Cepat | Minimal proteksi |
| Medium | + Control flow flattening | Sedang | Recommended |
| High | + Dead code injection, string encoding | Lambat | Maximum proteksi |
| Very High | + Self-defending, debug protection | Sangat Lambat | Overkill |

### 13.4 Konfigurasi Recommended

```javascript
// obfuscator-config.js
module.exports = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
};
```

### 13.5 Build Script

Tambahkan script di `package.json`:
```json
{
  "scripts": {
    "build": "node obfuscate.js",
    "start:prod": "node dist/app.js"
  }
}
```

**Jalankan:**
```bash
npm run build
npm run start:prod
```

### 13.6 Yang TIDAK Perlu Diobfuscate

- `node_modules/` - Dependencies sudah di-minify
- `package.json` - Hanya metadata
- `.env` - Secrets harusnya sudah terpisah
- Config files - Tidak mengandung logic penting

### 13.7 Tips Production

1. **Jangan obfuscate di development** - Sulit debugging
2. **Simpan source asli** - Untuk maintenance
3. **Test setelah obfuscate** - Pastikan tidak error
4. **Monitor performance** - Obfuscation menambah overhead
5. **Kombinasikan dengan encryption** - Untuk API keys

### 13.8 Alternatif: Enkripsi Environment Variables

Daripada obfuscate semua code, cukup encrypt .env:

```bash
# Install dotenvx
npm install -g dotenvx

# Encrypt .env
dotenvx encrypt

# Decrypt saat runtime
dotenvx run -- node src/app.js
```

---

**Selesai.** Dokumentasi ini harusnya cukup untuk developer baru bisa setup dan menjalankan backend Cuplik dari nol.
