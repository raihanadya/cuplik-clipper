# Cuplik Backend Design Spec

**Tanggal:** 12 September 2026
**Status:** Approved
**Versi:** 1.0

---

## 1. Overview

Cuplik adalah platform web untuk merepurposing rekaman webinar (30-60 menit) menjadi 3-5 klip vertikal (9:16) bersubtitle Bahasa Indonesia secara asinkron. Backend bertanggung jawab atas: file upload, audio extraction, ASR transcription, LLM-based concept selection, FFmpeg video rendering, dan serving hasil klip.

---

## 2. Tech Stack

| Komponen | Teknologi | Alasan |
|----------|-----------|--------|
| Runtime | Node.js | Tim familiar, ecosystem kuat |
| Framework | Express.js | Simpel, mature, banyak middleware |
| Database | MongoDB + Mongoose | Flexible schema, document-based |
| Queue | BullMQ + Redis | Gratis (open-source), fitur lengkap (priority, retry, delayed) |
| File Storage | Local filesystem | Simpel untuk MVP |
| Auth | JWT Token | Stateless, mudah di-scale |
| ASR | Custom AI (Elice Cloud AI) | Keputusan tim |
| LLM | Custom AI (Elice Cloud AI) | Keputusan tim |
| Video Processing | FFmpeg (via fluent-ffmpeg) | Industry standard, gratis |

---

## 3. Project Structure

```
cuplik-backend/
├── src/
│   ├── config/
│   │   ├── db.js              # Koneksi MongoDB
│   │   ├── redis.js           # Koneksi Redis
│   │   └── env.js             # Load env vars
│   ├── models/
│   │   ├── User.js            # Model user
│   │   ├── Session.js         # Model sesi pemrosesan
│   │   └── Clip.js            # Model klip hasil
│   ├── routes/
│   │   ├── authRoutes.js      # /api/v1/auth/*
│   │   ├── workspaceRoutes.js # /api/v1/workspace/*
│   │   ├── clipRoutes.js      # /api/v1/clips/*
│   │   └── adminRoutes.js     # /api/v1/admin/*
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── workspaceController.js
│   │   ├── clipController.js
│   │   └── adminController.js
│   ├── services/
│   │   ├── ingestService.js   # Validasi & ekstraksi audio
│   │   ├── asrService.js      # Integrasi ASR API
│   │   ├── llmService.js      # OpenAI concept selection
│   │   ├── renderService.js   # FFmpeg rendering
│   │   └── emailService.js    # Kirim email (forgot password)
│   ├── workers/
│   │   ├── pipelineWorker.js  # BullMQ worker utama
│   │   └── rerenderWorker.js  # Worker delta re-render
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── validate.js        # Input validation
│   │   └── errorHandler.js    # Global error handler
│   ├── utils/
│   │   ├── ffmpeg.js          # FFmpeg helpers
│   │   └── fileUtils.js       # File operations
│   └── app.js                 # Express app setup
├── uploads/                   # Temporary video uploads
├── output/                    # Rendered clips output
├── .env                       # Environment variables
├── .env.example               # Template .env
├── package.json
└── README.md
```

---

## 4. Database Models

### 4.1 User

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  is_active: Boolean (default: true),  // Soft delete: false = nonaktif, bisa diaktifkan lagi
  createdAt: Date,
  updatedAt: Date
}
```

**Notes:**
- `is_active: false` = user "dihapus" (soft delete), bisa diaktifkan lagi oleh admin
- Login hanya boleh jika `is_active: true`
- Admin bisa melihat semua user (termasuk nonaktif) dan mengaktifkan kembali

### 4.1.1 PasswordReset (untuk forgot password)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  token: String (required, unique),  // Random token untuk reset
  expiresAt: Date (required),       // Token expired dalam 15 menit
  used: Boolean (default: false),   // Sudah dipakai atau belum
  createdAt: Date
}
```

**Indexes:**
- `{ token: 1 }` (unique)
- `{ expiresAt: 1 }` (TTL index, auto-delete setelah expired)

### 4.2 Session (Sesi Pemrosesan)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  sessionId: String (unique, UUID v4),
  status: String (enum: ['queued', 'processing', 'completed', 'failed']),
  layoutTemplate: String (enum: ['slide_pembicara', 'talking_head', 'slide_saja'], required),
  customVocabulary: String (optional, max 20 kata dipisah koma),

  // File info
  originalFileName: String,
  originalFilePath: String,
  audioExtractedPath: String,

  // Progress tracking
  currentStage: String (enum: ['ingestion', 'transcription', 'curation_llm', 'rendering']),
  stagesDetail: {
    ingestion: String (enum: ['pending', 'processing', 'done', 'failed']),
    transcription: String (enum: ['pending', 'processing', 'done', 'failed']),
    curation_llm: String (enum: ['pending', 'processing', 'done', 'failed']),
    rendering: String (enum: ['pending', 'processing', 'done', 'failed'])
  },
  overallProgress: Number (0-100),

  // ASR results
  transcript: [{
    word: String,
    start_time: Number,
    end_time: Number,
    confidence: Number
  }],

  // Error tracking
  errorMessage: String,

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ sessionId: 1 }` (unique)
- `{ userId: 1, createdAt: -1 }`

### 4.3 Clip

```javascript
{
  _id: ObjectId,
  sessionId: ObjectId (ref: Session, required),
  clipId: String (unique, UUID v4),

  // Timing
  startTimeSeconds: Number (required),
  endTimeSeconds: Number (required),
  duration: Number (required),  // 25-75 detik

  // LLM results
  conceptScore: Number (0.0-1.0),
  suggestedTitle: String,
  pedagogicalReason: String,

  // Subtitle data
  subtitles: [{
    word: String,
    start_time: Number,
    end_time: Number
  }],

  // File output
  videoPath: String,
  srtContent: String,

  // Status
  status: String (enum: ['pending', 'rendering', 'done', 'failed']),
  renderAttempts: Number (default: 0),
  lastRenderError: String,

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ clipId: 1 }` (unique)
- `{ sessionId: 1 }`

---

## 5. API Endpoints

### 5.1 Auth

| Method | Endpoint | Fungsi | Auth |
|--------|----------|--------|------|
| POST | `/api/v1/auth/login` | Login, dapat JWT | ❌ |
| POST | `/api/v1/auth/forgot-password` | Kirim reset token ke email | ❌ |
| POST | `/api/v1/auth/reset-password` | Reset password pakai token | ❌ |
| PATCH | `/api/v1/admin/users/:user_id/activate` | Aktifkan user nonaktif | ✅ (admin) |
| PATCH | `/api/v1/admin/users/:user_id/deactivate` | Nonaktifkan user | ✅ (admin) |

**Login Rules:**
- Login hanya berhasil jika `is_active: true`
- Jika `is_active: false`, kembali `{ error: "Akun tidak aktif. Hubungi admin." }`

**Request (Login):**
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "role": "user"
}
```

**Response (Login):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Request (Forgot Password):**
```json
{
  "email": "user@example.com"
}
```

**Response (Forgot Password):**
```json
{
  "message": "Jika email terdaftar, link reset password telah dikirim."
}
```

**Request (Reset Password):**
```json
{
  "token": "abc123-reset-token",
  "new_password": "newSecret456"
}
```

**Response (Reset Password):**
```json
{
  "message": "Password berhasil direset. Silakan login dengan password baru."
}
```

**Forgot Password Flow:**
1. User POST `/api/v1/auth/forgot-password` dengan email
2. System generate reset token (expiry 15 menit), simpan di MongoDB
3. System kirim email berisi link `https://frontend.com/reset-password?token=xxx`
4. User buka link, isi password baru
5. User POST `/api/v1/auth/reset-password` dengan token + new_password
6. System update password hash, hapus token

### 5.2 Workspace

| Method | Endpoint | Fungsi | Auth |
|--------|----------|--------|------|
| POST | `/api/v1/workspace/upload` | Upload video + pilih layout | ✅ |
| GET | `/api/v1/workspace/session/:session_id/status` | Polling status | ✅ |
| GET | `/api/v1/workspace/session/:session_id/clips` | Ambil data clips | ✅ |

**Upload Request (Multipart Form Data):**
- `file` (binary, required) - MP4/MOV, max 45 menit, max 1GB, min 720p
- `layout_template` (string, required) - `slide_pembicara` | `talking_head` | `slide_saja`
- `custom_vocabulary` (string, optional) - Frasa teknis dipisah koma, max 20 kata

**Upload Response:**
```json
{
  "session_id": "abc-123-def-456",
  "status": "queued",
  "message": "Video berhasil diterima dan masuk antrean."
}
```

**Status Response:**
```json
{
  "session_id": "abc-123-def-456",
  "overall_progress_percentage": 65,
  "current_stage": "curation_llm",
  "stages_detail": {
    "ingestion": "done",
    "transcription": "done",
    "curation_llm": "processing",
    "rendering": "pending"
  },
  "error_message": null
}
```

**Clips Response:**
```json
{
  "clips": [
    {
      "clip_id": "clip-001",
      "start_time_seconds": 252.5,
      "end_time_seconds": 299.5,
      "duration": 47.0,
      "concept_score": 0.88,
      "suggested_title": "Bedanya Prompt yang Asal dan Benar",
      "pedagogical_reason": "Menjelaskan perbandingan langsung dengan analogi yang selesai.",
      "subtitles": [
        { "word": "Jadi", "start_time": 252.5, "end_time": 252.8 },
        { "word": "teman-teman", "start_time": 252.9, "end_time": 253.4 }
      ],
      "status": "done"
    }
  ]
}
```

### 5.3 Clips

| Method | Endpoint | Fungsi | Auth |
|--------|----------|--------|------|
| POST | `/api/v1/clips/:clip_id/rerender` | Re-render klip yang diedit | ✅ |
| GET | `/api/v1/clips/:clip_id/download/mp4` | Download video MP4 | ✅ |
| GET | `/api/v1/clips/:clip_id/download/srt` | Download file SRT | ✅ |

**Re-render Request:**
```json
{
  "start_time_seconds": 253.0,
  "end_time_seconds": 300.0,
  "modified_title": "Perbedaan Prompt Asal vs Benar",
  "modified_subtitles": [
    { "word": "Jadi", "start_time": 253.0, "end_time": 253.3 },
    { "word": "teman-teman", "start_time": 253.4, "end_time": 253.9 }
  ]
}
```

**Re-render Response:**
```json
{
  "clip_id": "clip-001",
  "status": "rendering",
  "message": "Re-render dimulai, estimasi < 60 detik."
}
```

### 5.4 Admin

| Method | Endpoint | Fungsi | Auth |
|--------|----------|--------|------|
| GET | `/api/v1/admin/telemetry` | Dashboard admin | ✅ (admin) |

**Telemetry Response:**
```json
{
  "worker_status": {
    "active_jobs": 2,
    "waiting_jobs": 5,
    "failed_jobs": 0,
    "queue_latency_seconds": 12
  },
  "storage_retention": {
    "used_gb": 4.2,
    "temp_files_count": 15,
    "last_cleanup": "2026-09-12T10:00:00Z"
  },
  "api_cost_meter": {
    "llm_tokens_used": 125000,
    "asr_audio_minutes": 45.5,
    "estimated_cost_usd": 3.75
  }
}
```

---

## 6. Worker Pipeline (BullMQ)

### 6.1 Queue Configuration

```javascript
const pipelineQueue = new Queue('cuplik-pipeline', { connection: redis });
const rerenderQueue = new Queue('cuplik-rerender', { connection: redis });
```

### 6.2 Pipeline Stages

```
[Upload] ──► [Queue: cuplik-pipeline]
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │ STAGE 1: INGESTION                  │
  │ - Validate file (format, size, dur) │
  │ - Extract audio ke WAV mono 16kHz   │
  │ - Simpan path ke MongoDB            │
  └─────────────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │ STAGE 2: TRANSCRIPTION (ASR)        │
  │ - Kirim audio ke Custom ASR API     │
  │ - Terima word-level timestamps      │
  │ - Simpan transcript ke MongoDB      │
  └─────────────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │ STAGE 3: CURATION (LLM)            │
  │ - Kirim transcript ke OpenAI API    │
  │ - Prompt: concept completeness      │
  │ - Terima 3-5 segmen + scores       │
  │ - Simpan clips ke MongoDB           │
  └─────────────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │ STAGE 4: RENDERING (FFmpeg)         │
  │ - Buat 3-5 clip berdasarkan segmen  │
  │ - Apply layout template 9:16        │
  │ - Burn subtitle (Clean/Highlight)   │
  │ - Simpan output ke /output/         │
  └─────────────────────────────────────┘
                     │
                     ▼
  [Status: completed] ──► Frontend polls & shows clip cards
```

### 6.3 Worker Error Handling

- Setiap stage yang gagal akan update `stagesDetail` ke `"failed"` dan `errorMessage`
- BullMQ retry: max 3 attempts, exponential backoff
- Jika gagal setelah retry, session status = `"failed"`

---

## 7. Services

### 7.1 IngestService

```javascript
// Fungsi utama:
- validateFile(file)       // Cek format (MP4/MOV), size (<1GB), duration (<45min)
- extractAudio(filePath)   // FFmpeg: convert ke WAV mono 16kHz
- getVideoMetadata(filePath) // Ambil duration, resolution
```

### 7.2 ASRService

```javascript
// Fungsi utama:
- transcribe(audioPath, vocabulary?)
  // POST ke ASR_API_URL dengan audio + custom vocabulary
  // Return: [{ word, start_time, end_time, confidence }]
```

### 7.3 LLMService

```javascript
// Fungsi utama:
- selectConcepts(transcript, vocabulary?)
  // Kirim ke OpenAI dengan structured prompt
  // Return: [{ clip_id, start_time_seconds, end_time_seconds, duration,
  //            concept_score, suggested_title, pedagogical_reason }]

// Prompt template:
"You are an educational content curator. Given the following transcript
with word-level timestamps, identify 3-5 segments that form complete
educational concepts. Each segment must have:
1. Pembuka Kontekstual (introduction)
2. Elaborasi/Solusi (explanation)
3. Kesimpulan Mandiri (conclusion)

Duration constraint: 25-75 seconds per segment.
Output JSON with the specified schema."
```

### 7.4 RenderService

```javascript
// Fungsi utama:
- renderClip(sourceVideo, segment, template, subtitles, outputPath)
  // FFmpeg pipeline:
  // 1. Cut segment dari source video
  // 2. Apply layout template (9:16)
  // 3. Generate ASS subtitle file
  // 4. Burn subtitle ke video
  // 5. Output MP4 1080x1920

- generateSRT(subtitles, outputPath)
  // Generate .srt file dari subtitle data
```

### 7.5 Layout Templates

**Template A: Slide + Pembicara (Default)**
```
┌─────────────────┐
│                 │
│   SLIDE AREA    │  60% height
│  (crop/fit)     │
│                 │
├─────────────────┤
│  ┌───────────┐  │
│  │  WEBCAM   │  │  30% height
│  │  (PiP)    │  │
│  └───────────┘  │
├─────────────────┤
│   SUBTITLE      │  10% height
└─────────────────┘
```

**Template B: Talking Head (Full Face)**
```
┌─────────────────┐
│                 │
│                 │
│   CROP 9:16     │  Center on face
│   ON SPEAKER    │
│                 │
│                 │
├─────────────────┤
│   SUBTITLE      │
└─────────────────┘
```

**Template C: Slide Saja**
```
┌─────────────────┐
│   ░░░░░░░░░░░   │  Blurred/solid background
│  ┌───────────┐  │
│  │           │  │
│  │   SLIDE   │  │  Centered proportionally
│  │           │  │
│  └───────────┘  │
│   ░░░░░░░░░░░   │
├─────────────────┤
│   SUBTITLE      │
└─────────────────┘
```

---

## 8. Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cuplik

# Redis (untuk BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Auth
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# ASR Engine (Custom AI)
ASR_API_URL=https://your-asr-api.com/v1/transcribe
ASR_API_KEY=your-asr-api-key

# OpenAI (untuk LLM Concept Selection)
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4

# Email (untuk forgot password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@cuplik.id

# File Storage
UPLOAD_DIR=./uploads
OUTPUT_DIR=./output

# Limits
MAX_FILE_SIZE=1073741824  # 1GB in bytes
MAX_DURATION=2700         # 45 minutes in seconds
```

---

## 9. Error Handling

| Error Type | HTTP Status | Response |
|------------|-------------|----------|
| Invalid file format | 400 | `{ error: "Format tidak didukung. Gunakan MP4/MOV." }` |
| File terlalu besar | 400 | `{ error: "Ukuran file melebihi 1GB." }` |
| Durasi > 45 menit | 400 | `{ error: "Durasi video maksimal 45 menit." }` |
| ASR API gagal | 500 | `{ error: "Transkripsi gagal. Silakan coba lagi." }` |
| OpenAI gagal | 500 | `{ error: "Kurasi konsep gagal. Silakan coba lagi." }` |
| FFmpeg gagal | 500 | `{ error: "Rendering gagal. Silakan coba lagi." }` |
| File tidak ditemukan | 404 | `{ error: "File tidak ditemukan." }` |
| Unauthorized | 401 | `{ error: "Token tidak valid atau expired." }` |
| Akun nonaktif | 403 | `{ error: "Akun tidak aktif. Hubungi admin." }` |
| Email tidak ditemukan | 404 | `{ error: "Email tidak terdaftar." }` |
| Token expired | 400 | `{ error: "Token sudah expired. Silakan request ulang." }` |
| Token sudah dipakai | 400 | `{ error: "Token sudah digunakan." }` |
| Session tidak ditemukan | 404 | `{ error: "Sesi pemrosesan tidak ditemukan." }` |
| Clip tidak ditemukan | 404 | `{ error: "Klip tidak ditemukan." }` |

---

## 10. File Retention Policy (24 jam)

Cron job berjalan setiap jam untuk menghapus file yang berusia > 24 jam:

```javascript
// node-cron: setiap jam
cron.schedule('0 * * * *', async () => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;

  // 1. Hapus file di uploads/ yang > 24 jam
  // 2. Hapus file di output/ yang > 24 jam
  // 3. Update MongoDB: hapus path file yang sudah dihapus
  // 4. Log jumlah file yang dihapus
});
```

---

## 11. Security

- **Helmet** untuk security headers
- **CORS** untuk restrict origin
- **Rate limiting** untuk prevent abuse
- **JWT** untuk authentication
- **File validation** sebelum diproses
- **Input sanitization** untuk prevent NoSQL injection
- **Environment variables** untuk semua secrets (tidak di-hardcode)

---

## 12. NFR Compliance

| NFR | Strategy |
|-----|----------|
| NFR-1 (Latency < video duration) | BullMQ parallel processing, FFmpeg optimization |
| NFR-2 (Queue isolation) | BullMQ worker terpisah dari web server |
| NFR-3 (24h retention) | Cron job cleanup |
| NFR-4 (Real-time status) | Polling 5 detik via REST API |
