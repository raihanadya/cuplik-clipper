# Cuplik Backend Flow Documentation

**Tanggal:** 12 September 2026
**Versi:** 1.0
**Tujuan:** Dokumentasi lengkap untuk handover developer

---

## Daftar Isi

1. [Arsitektur Sistem](#1-arsitektur-sistem)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [API Endpoints Flow](#5-api-endpoints-flow)
6. [User Flow](#6-user-flow)
7. [Code Flow: Auth](#7-code-flow-auth)
8. [Code Flow: Upload & Pipeline](#8-code-flow-upload--pipeline)
9. [Code Flow: Clip Management](#9-code-flow-clip-management)
10. [Code Flow: Admin](#10-code-flow-admin)
11. [Worker Pipeline Flow](#11-worker-pipeline-flow)
12. [Middleware Flow](#12-middleware-flow)
13. [Error Handling Flow](#13-error-handling-flow)
14. [File Retention Flow](#14-file-retention-flow)
15. [Environment Variables](#15-environment-variables)

---

## 1. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Frontend)                        │
│                    http://localhost:5173                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP Request
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS SERVER                          │
│                     src/app.js (port 3000)                     │
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Helmet  │  │   CORS   │  │  Morgan  │  │  JSON    │        │
│  │ (security│  │ (origin  │  │ (logging)│  │ (parser) │        │
│  │ headers) │  │  check)  │  │          │  │          │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ROUTES                                │  │
│  │  /api/v1/auth/*    → authController                      │  │
│  │  /api/v1/workspace/* → workspaceController               │  │
│  │  /api/v1/clips/*   → clipController                      │  │
│  │  /api/v1/admin/*   → adminController                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  MIDDLEWARE                              │  │
│  │  auth.js       → JWT verification + role check           │  │
│  │  validate.js   → Joi schema validation                   │  │
│  │  errorHandler.js → Global error catcher                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   MongoDB    │ │    Redis     │ │ Elice AI     │
    │  (Mongoose)  │ │  (BullMQ)    │ │ Cloud API    │
    │  localhost   │ │  localhost   │ │  (ASR + LLM) │
    │  :27017      │ │  :6379       │ │  External    │
    └──────────────┘ └──────────────┘ └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   WORKERS    │
                    │ pipeline.js  │
                    │ rerender.js  │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   FFMPEG     │
                    │  (rendering) │
                    └──────────────┘
```

---

## 2. Tech Stack & Dependencies

| Komponen | Teknologi | Versi | Fungsi |
|----------|-----------|-------|--------|
| Runtime | Node.js | - | JavaScript runtime |
| Framework | Express.js | 5.2.1 | HTTP server |
| Database | MongoDB + Mongoose | 9.10.0 | Document database |
| Queue | BullMQ + Redis (ioredis) | 6.3.4 / 6.0.0 | Job queue async |
| Auth | JWT (jsonwebtoken) | 9.0.3 | Stateless auth |
| Password Hash | bcryptjs | 3.0.3 | Bcrypt hashing |
| File Upload | Multer | 2.3.0 | Multipart handling |
| Video Processing | FFmpeg (fluent-ffmpeg + ffmpeg-static) | 2.1.3 / 5.3.0 | Video rendering |
| Email | Nodemailer | 10.0.8 | SMTP email |
| HTTP Client | form-data + native http/https | - | API calls |
| Security | Helmet | 8.3.0 | Security headers |
| Logging | Morgan | 1.12.1 | HTTP request logging |
| Scheduling | node-cron | 4.6.0 | Cron job cleanup |
| UUID | uuid | 14.0.2 | Unique ID generation |

---

## 3. Project Structure

```
cuplik-backend/
├── src/
│   ├── app.js                    # Entry point - Express setup + server start
│   ├── config/
│   │   ├── db.js                 # MongoDB connection via Mongoose
│   │   ├── env.js                # Environment variables loader (dotenv)
│   │   └── redis.js              # Redis connection via ioredis
│   ├── models/
│   │   ├── User.js               # User model (email, password, role, is_active)
│   │   ├── PasswordReset.js      # Password reset tokens (TTL index)
│   │   ├── Session.js            # Processing sessions (status, progress, transcript)
│   │   └── Clip.js               # Generated clips (timing, subtitles, video path)
│   ├── routes/
│   │   ├── authRoutes.js         # /api/v1/auth/*
│   │   ├── workspaceRoutes.js    # /api/v1/workspace/*
│   │   ├── clipRoutes.js         # /api/v1/clips/*
│   │   └── adminRoutes.js        # /api/v1/admin/*
│   ├── controllers/
│   │   ├── authController.js     # Login, forgot/reset password, activate/deactivate
│   │   ├── workspaceController.js # Upload, status, get clips
│   │   ├── clipController.js     # Re-render, download MP4/SRT
│   │   └── adminController.js    # Telemetry dashboard
│   ├── services/
│   │   ├── ingestService.js      # File validation + audio extraction
│   │   ├── asrService.js         # Whisper API transcription
│   │   ├── llmService.js         # GPT concept selection
│   │   ├── renderService.js      # FFmpeg video rendering
│   │   └── emailService.js       # Nodemailer SMTP
│   ├── workers/
│   │   ├── pipelineWorker.js     # Main 4-stage processing pipeline
│   │   └── rerenderWorker.js     # Delta re-render worker
│   ├── middleware/
│   │   ├── auth.js               # JWT auth + admin role check
│   │   ├── validate.js           # Joi validation middleware
│   │   └── errorHandler.js       # Global error handler
│   └── utils/
│       ├── ffmpeg.js             # FFmpeg helpers (metadata, extract audio)
│       └── fileUtils.js          # File system helpers (ensureDir, cleanup)
├── uploads/                      # Temporary video uploads
├── output/                       # Rendered clip outputs
├── tests/                        # Jest test suites
├── .env                          # Environment variables (not committed)
├── .env.example                  # Template .env
├── package.json                  # Dependencies & scripts
└── README.md                     # Basic setup docs
```

---

## 4. Database Schema

### 4.1 User Model (`src/models/User.js`)

```
┌─────────────────────────────────────────┐
│                 USER                    │
├─────────────────────────────────────────┤
│ _id          : ObjectId (auto)          │
│ email        : String (unique, required)│
│ password     : String (hashed, select:0)│
│ role         : String ['user','admin']  │
│ is_active    : Boolean (default: true)  │
│ createdAt    : Date (auto)              │
│ updatedAt    : Date (auto)              │
└─────────────────────────────────────────┘

Notes:
- password field has `select: false` → must use .select('+password') to fetch
- is_active: false = soft delete (can be reactivated by admin)
- Login only works if is_active: true
- User can self-delete: soft delete (default) or permanent delete (with password verification)
```

### 4.2 PasswordReset Model (`src/models/PasswordReset.js`)

```
┌─────────────────────────────────────────┐
│            PASSWORD_RESET               │
├─────────────────────────────────────────┤
│ _id          : ObjectId (auto)          │
│ userId       : ObjectId (ref: User)     │
│ token        : String (unique, indexed) │
│ expiresAt    : Date (TTL auto-delete)   │
│ used         : Boolean (default: false) │
│ createdAt    : Date (auto)              │
└─────────────────────────────────────────┘

Indexes:
- { token: 1 } → unique index for fast lookup
- { expiresAt: 1 } → TTL index (expireAfterSeconds: 0) → auto-delete after expiry
```

### 4.3 Session Model (`src/models/Session.js`)

```
┌─────────────────────────────────────────────────────┐
│                   SESSION                           │
├─────────────────────────────────────────────────────┤
│ _id                : ObjectId (auto)                │
│ userId             : ObjectId (ref: User)           │
│ sessionId          : String (UUID v4, unique)       │
│ status             : String [queued|processing|     │
│                             completed|failed]       │
│ layoutTemplate     : String [slide_pembicara|       │
│                             talking_head|slide_saja]│
│ customVocabulary   : String (optional, max 200)     │
│ originalFileName   : String                         │
│ originalFilePath   : String                         │
│ audioExtractedPath : String                         │
│ currentStage       : String [ingestion|transcription│
│                             curation_llm|rendering] │
│ stagesDetail       : Object {                       │
│   ingestion      : [pending|processing|done|failed] │
│   transcription  : [pending|processing|done|failed] │
│   curation_llm   : [pending|processing|done|failed] │
│   rendering      : [pending|processing|done|failed] │
│ }                                                   │
│ overallProgress    : Number (0-100)                 │
│ transcript         : Array [{                       │
│   word       : String                               │
│   start_time : Number                               │
│   end_time   : Number                               │
│   confidence : Number                               │
│ }]                                                  │
│ errorMessage       : String                         │
│ createdAt          : Date (auto)                    │
│ updatedAt          : Date (auto)                    │
└─────────────────────────────────────────────────────┘

Indexes:
- { sessionId: 1 } → unique
- { userId: 1, createdAt: -1 } → user's session history
```

### 4.4 Clip Model (`src/models/Clip.js`)

```
┌─────────────────────────────────────────────────────┐
│                    CLIP                             │
├─────────────────────────────────────────────────────┤
│ _id               : ObjectId (auto)                 │
│ sessionId         : ObjectId (ref: Session)         │
│ clipId            : String (UUID v4, unique)        │
│ startTimeSeconds  : Number (required)               │
│ endTimeSeconds    : Number (required)               │
│ duration          : Number (required, 25-75s)       │
│ conceptScore      : Number (0.0-1.0)                │
│ suggestedTitle    : String                          │
│ pedagogicalReason : String                          │
│ subtitles         : Array [{                        │
│   word       : String                               │
│   start_time : Number                               │
│   end_time   : Number                               │
│ }]                                                  │
│ videoPath         : String (path to MP4)            │
│ srtContent        : String (SRT file content)       │
│ status            : String [pending|rendering|done| │
│                            failed]                  │
│ renderAttempts    : Number (default: 0)             │
│ lastRenderError   : String                          │
│ createdAt         : Date (auto)                     │
│ updatedAt         : Date (auto)                     │
└─────────────────────────────────────────────────────┘

Indexes:
- { clipId: 1 } → unique
- { sessionId: 1 } → find clips by session
```

---

## 5. API Endpoints Flow

### 5.1 Auth Endpoints

```
┌──────────────────────────────────────────────────────────────┐
│                     AUTH ENDPOINTS                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /api/v1/auth/register                                  │
│  ├── No auth required                                        │
│  ├── Body: { email, password }                               │
│  ├── Validate:                                               │
│  │   ├── email/password required                              │
│  │   ├── password regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)     │
│  │   │   (?=.*[!@#$%^&*...]).{8,}$/                           │
│  │   │   (min 8 char, uppercase, lowercase, number, symbol)   │
│  │   └── if invalid → "Password tidak valid: minimal 8        │
│  │       karakter, harus mengandung huruf kapital, huruf      │
│  │       kecil, angka, dan simbol."                           │
│  ├── Check email not exists                                  │
│  ├── Hash password (bcrypt, 12 rounds)                       │
│  ├── Create user (role: 'user')                              │
│  ├── Generate JWT token (id, role)                           │
│  └── Return: { token, user: { id, email, role } }            │
│                                                              │
│  POST /api/v1/auth/login                                     │
│  ├── No auth required                                        │
│  ├── Body: { email, password, role }                         │
│  ├── Validate: email/password/role required                  │
│  ├── Find user by email (with password field)                │
│  ├── Check is_active === true                                │
│  ├── Check role matches                                      │
│  ├── Compare password with bcrypt                            │
│  ├── Generate JWT token (id, role)                           │
│  └── Return: { token, user: { id, email, role } }            │
│                                                              │
│  POST /api/v1/auth/forgot-password                           │
│  ├── No auth required                                        │
│  ├── Body: { email }                                         │
│  ├── Find user by email                                      │
│  ├── Generate random 32-byte token                           │
│  ├── Save to PasswordReset (expiresAt: now + 15min)          │
│  ├── Send email with reset link                              │
│  └── Return: { message } (same response even if no user)     │
│                                                              │
│  POST /api/v1/auth/reset-password                            │
│  ├── No auth required                                        │
│  ├── Body: { token, new_password }                           │
│  ├── Find PasswordReset by token (used: false)               │
│  ├── Check expiry (15 minutes)                               │
│  ├── Hash new password (bcrypt, 12 rounds)                   │
│  ├── Update user password                                    │
│  ├── Mark token as used                                      │
│  └── Return: { message }                                     │
│                                                              │
│  PATCH /api/v1/auth/admin/users/:user_id/activate            │
│  ├── Auth required (admin only)                              │
│  ├── Update user.is_active = true                            │
│  └── Return: { message, user }                               │
│                                                              │
│  PATCH /api/v1/auth/admin/users/:user_id/deactivate          │
│  ├── Auth required (admin only)                              │
│  ├── Update user.is_active = false                           │
│  └── Return: { message, user }                               │
│                                                              │
│  DELETE /api/v1/auth/account                                  │
│  ├── Auth required (user itself)                             │
│  ├── Body: { password, permanent }                           │
│  ├── Verify password with bcrypt                             │
│  ├── If permanent === true:                                  │
│  │   └── User.findByIdAndDelete() → hapus permanen           │
│  ├── Else:                                                   │
│  │   └── User.findByIdAndUpdate({ is_active: false })        │
│  └── Return: { message }                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Workspace Endpoints

```
┌──────────────────────────────────────────────────────────────┐
│                   WORKSPACE ENDPOINTS                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /api/v1/workspace/upload                               │
│  ├── Auth required                                           │
│  ├── Multer: single file upload (field: 'file')              │
│  ├── Validate: file exists, layout_template valid            │
│  ├── Create Session document (status: 'queued')              │
│  ├── Add job to 'cuplik-pipeline' queue                      │
│  └── Return: { session_id, status, message }                 │
│                                                              │
│  GET /api/v1/workspace/session/:session_id/status            │
│  ├── Auth required                                           │
│  ├── Find session by sessionId                               │
│  └── Return: { session_id, progress, stage, detail, error }  │
│                                                              │
│  GET /api/v1/workspace/session/:session_id/clips             │
│  ├── Auth required                                           │
│  ├── Find session by sessionId                               │
│  ├── Find all clips by sessionId (sorted by startTime)       │
│  └── Return: { clips: [...] }                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Clip Endpoints

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIP ENDPOINTS                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /api/v1/clips/:clip_id/rerender                        │
│  ├── Auth required                                           │
│  ├── Body: { start_time_seconds, end_time_seconds,           │
│  │          modified_title, modified_subtitles }             │
│  ├── Find clip by clipId                                     │
│  ├── Update clip status → 'rendering'                        │
│  ├── Add job to 'cuplik-rerender' queue                      │
│  └── Return: { clip_id, status, new_video_url }              │
│                                                              │
│  GET /api/v1/clips/:clip_id/download/mp4                     │
│  ├── Auth required                                           │
│  ├── Find clip by clipId                                     │
│  ├── Check file exists on disk                               │
│  └── Stream binary MP4 file                                  │
│                                                              │
│  GET /api/v1/clips/:clip_id/download/srt                     │
│  ├── Auth required                                           │
│  ├── Find clip by clipId                                     │
│  ├── Check srtContent exists                                 │
│  └── Stream text SRT file                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.4 Admin Endpoints

```
┌──────────────────────────────────────────────────────────────┐
│                    ADMIN ENDPOINTS                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  GET /api/v1/admin/telemetry                                 │
│  ├── Auth required (admin only)                              │
│  ├── Query BullMQ queue stats (waiting/active/failed)        │
│  ├── Calculate storage usage (uploads/ + output/)            │
│  ├── Estimate API costs (tokens + audio minutes)             │
│  └── Return: { worker_status, storage_retention,             │
│               api_cost_meter }                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. User Flow

### 6.1 Flow Register

```
User (Baru)
    │
    ▼
┌──────────────┐    POST /api/v1/auth/register
│   Register   │    { email, password }
│   Page       │────────────────────────────────────►
└──────────────┘                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │  Validate    │
                                               │  input       │
                                               │  - email     │
                                               │  - password  │
                                               │    (>= 8 char,│
                                               │     uppercase,│
                                               │     lowercase,│
                                               │     number,   │
                                               │     symbol)   │
                                               └──────┬───────┘
                                                      │
                                       ┌──────────────┴──────────────┐
                                       ▼                             ▼
                                ┌───────────┐                 ┌───────────┐
                                │  Email    │                 │  Success  │
                                │  exists   │                 │  201 OK   │
                                │  400      │                 └─────┬─────┘
                                └───────────┘                       │
                                                                    ▼
                                                             Return JWT Token
                                                             { token, user }
```

### 6.2 Flow Login

```
User (Trainer/Marketing)
    │
    ▼
┌─────────────┐     POST /api/v1/auth/login
│   Login     │     { email, password, role: "user" }
│   Page      │─────────────────────────────────────────►
└─────────────┘                                          │
                                                         ▼
                                                  ┌──────────────┐
                                                  │  Validate    │
                                                  │  credentials │
                                                  └──────┬───────┘
                                                         │
                                          ┌──────────────┴──────────────┐
                                          ▼                             ▼
                                   ┌───────────┐                 ┌───────────┐
                                   │  Success  │                 │  Failed   │
                                   │  200 OK   │                 │  401/403  │
                                   └─────┬─────┘                 └─────┬─────┘
                                         │                             │
                                         ▼                             ▼
                                  Return JWT Token              Show Error Message
                                  { token, user }
```

### 6.3 Flow Upload Video & Processing

```
User
    │
    ▼
┌──────────────┐    POST /api/v1/workspace/upload
│   Upload     │    Multipart: file + layout_template + custom_vocabulary
│   Page       │──────────────────────────────────────────────────────►
└──────────────┘                                                       │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │ Validate     │
                                                               │ file & params│
                                                               └──────┬───────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │  Create      │
                                                               │  Session     │
                                                               │  (queued)    │
                                                               └──────┬───────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │  Add to      │
                                                               │  BullMQ      │
                                                               │  Queue       │
                                                               └──────┬───────┘
                                                                      │
    ┌─────────────────────────────────────────────────────────────────┘
    ▼
┌──────────────┐
│   Return     │    { session_id, status: "queued" }
│   Response   │
└──────────────┘

                    ┌──────────────────────────────────────────────┐
                    │           WORKER PIPELINE (async)            │
                    │                                              │
User polls status ◄─┤  Stage 1: Ingestion (10%)                    │
GET /status/:id     │  ├── Validate file (format, size, duration)  │
                    │  ├── Extract audio (WAV mono 16kHz)          │
                    │  └── Update session (25%)                    │
                    │                                              │
                    │  Stage 2: Transcription (30%)                │
                    │  ├── Send audio to Whisper API               │
                    │  ├── Receive word-level timestamps           │
                    │  └── Update session (50%)                    │
                    │                                              │
                    │  Stage 3: LLM Curation (55%)                 │
                    │  ├── Send transcript to GPT API              │
                    │  ├── Receive 3-5 concept segments            │
                    │  ├── Create Clip documents                   │
                    │  └── Update session (70%)                    │
                    │                                              │
                    │  Stage 4: Rendering (75%)                    │
                    │  ├── For each clip:                          │
                    │  │   ├── FFmpeg render (layout + subtitle)   │
                    │  │   ├── Save MP4 + SRT                      │
                    │  │   └── Update progress                     │
                    │  └── Session completed (100%)                │
                    │                                              │
                    └──────────────────────────────────────────────┘
```

### 6.4 Flow Re-render Clip

```
User (Editor)
    │
    ▼
┌──────────────┐    POST /api/v1/clips/:clip_id/rerender
│   Editor     │    { start_time_seconds, end_time_seconds,
│   Page       │      modified_title, modified_subtitles }
│              │────────────────────────────────────────────────►
└──────────────┘                                                  │
                                                                  ▼
                                                           ┌──────────────┐
                                                           │  Find clip   │
                                                           │ Update status│
                                                           │  → rendering │
                                                           └──────┬───────┘
                                                                  │
                                                                  ▼
                                                           ┌──────────────┐
                                                           │  Add to      │
                                                           │  rerender    │
                                                           │  queue       │
                                                           └──────┬───────┘
                                                                  │
    ┌─────────────────────────────────────────────────────────────┘
    ▼
┌──────────────┐
│   Return     │    { clip_id, status: "rendering", new_video_url }
│   Response   │
└──────────────┘

                    ┌──────────────────────────────────────────────┐
                    │         RERENDER WORKER (async)              │
                    │                                              │
                    │  ├── Find clip + session                     │
                    │  ├── FFmpeg render with new params           │
                    │  ├── Update clip (videoPath, srtContent)     │
                    │  └── Status → done                           │
                    │                                              │
                    └──────────────────────────────────────────────┘
```

### 6.5 Flow Download

```
User
    │
    ├── GET /api/v1/clips/:clip_id/download/mp4
    │   ├── Find clip by clipId
    │   ├── Check file exists on disk
    │   ├── Set Content-Disposition header
    │   └── Stream binary MP4
    │
    └── GET /api/v1/clips/:clip_id/download/srt
        ├── Find clip by clipId
        ├── Check srtContent exists
        ├── Set Content-Type + Content-Disposition
        └── Stream text SRT
```

### 6.6 Flow Hapus Akun

```
User
    │
    ▼
┌──────────────┐    DELETE /api/v1/auth/account
│   Settings   │    { password: "currentPassword", permanent: false }
│   Page       │─────────────────────────────────────────────────────►
└──────────────┘                                                       │
                                                                       ▼
                                                                ┌──────────────┐
                                                                │  Verifikasi  │
                                                                │  password    │
                                                                │  (bcrypt)    │
                                                                └──────┬───────┘
                                                                       │
                                                        ┌──────────────┴──────────────┐
                                                        ▼                             ▼
                                                 ┌───────────┐                 ┌───────────┐
                                                 │  Salah    │                 │  Benar    │
                                                 │  401      │                 │  Lanjut   │
                                                 └───────────┘                 └─────┬─────┘
                                                                                     │
                                                                   ┌─────────────────┴─────────────────┐
                                                                   ▼                                   ▼
                                                           permanent: false                     permanent: true
                                                                   │                                   │
                                                                   ▼                                   ▼
                                                          ┌─────────────────┐               ┌─────────────────┐
                                                          │ Nonaktifkan     │               │ Hapus permanen  │
                                                          │ is_active:false │               │ dari database   │
                                                          └────────┬────────┘               └────────┬────────┘
                                                                   │                                   │
                                                                   ▼                                   ▼
                                                          "Akun dinonaktifkan"              "Akun dihapus permanen"
```

---

## 7. Code Flow: Auth

### 7.1 Register Flow (`src/controllers/authController.js:49-85`)

```
Request: POST /api/v1/auth/register
    │
    ├── Extract: { email, password } from req.body
    │
    ├── Validation
    │   ├── if (!email || !password) → 400 "Email dan password wajib diisi"
    │   └── if (!passwordRegex.test(password)) → 400 "Password tidak valid:
    │       minimal 8 karakter, harus mengandung huruf kapital,
    │       huruf kecil, angka, dan simbol."
    │       Regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*...]).{8,}$/
    │
    ├── Check email exists
    │   └── User.findOne({ email })
    │       └── if (existingUser) → 400 "Email tidak valid"
    │
    ├── Hash password
    │   └── bcrypt.hash(password, 12)
    │
    ├── Create user
    │   └── User.create({ email, password: hashedPassword, role: 'user' })
    │
    ├── Generate JWT
    │   └── jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn })
    │
    └── Response: 201 { token, user: { id, email, role } }
```

### 7.2 Login Flow (`src/controllers/authController.js:9-47`)

```
Request: POST /api/v1/auth/login
    │
    ├── Extract: { email, password, role } from req.body
    │
    ├── Validation
    │   └── if (!email || !password || !role) → 400 error
    │
    ├── Find User
    │   └── User.findOne({ email }).select('+password')
    │       └── Note: password field is hidden by default (select: false)
    │
    ├── Check user exists
    │   └── if (!user) → 401 "Email atau password salah"
    │
    ├── Check is_active
    │   └── if (!user.is_active) → 403 "Akun tidak aktif"
    │
    ├── Check role match
    │   └── if (user.role !== role) → 403 "Role tidak sesuai"
    │
    ├── Compare password
    │   └── bcrypt.compare(password, user.password)
    │       └── if (!isMatch) → 401 "Email atau password salah"
    │
    ├── Generate JWT
    │   └── jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn })
    │
    └── Response: 200 { token, user: { id, email, role } }
```

### 7.3 Forgot Password Flow (`src/controllers/authController.js:98-127`)

```
Request: POST /api/v1/auth/forgot-password
    │
    ├── Extract: { email } from req.body
    │
    ├── Validation
    │   └── if (!email) → 400 error
    │
    ├── Find User
    │   └── User.findOne({ email })
    │
    ├── Generate token
    │   ├── crypto.randomBytes(32).toString('hex')
    │   └── expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    │
    ├── Save to PasswordReset
    │   └── PasswordReset.create({ userId, token, expiresAt })
    │
    ├── Send email
    │   ├── Build reset link: https://frontend.com/reset-password?token=xxx
    │   └── sendEmail({ to, subject, html })
    │
    └── Response: 200 { message } (same even if user not found - security)
```

### 7.4 Reset Password Flow (`src/controllers/authController.js:129-155`)

```
Request: POST /api/v1/auth/reset-password
    │
    ├── Extract: { token, new_password } from req.body
    │
    ├── Validation
    │   └── if (!token || !new_password) → 400 error
    │
    ├── Find token
    │   └── PasswordReset.findOne({ token, used: false })
    │       └── if (!found) → 400 "Token tidak valid atau sudah digunakan"
    │
    ├── Check expiry
    │   └── if (expiresAt < new Date()) → 400 "Token sudah expired"
    │
    ├── Hash new password
    │   └── bcrypt.hash(new_password, 12)
    │
    ├── Update user
    │   └── User.findByIdAndUpdate(userId, { password: hashedPassword })
    │
    ├── Mark token used
    │   └── resetRecord.used = true; await resetRecord.save()
    │
    └── Response: 200 { message }
```

### 7.5 Delete Account Flow (`src/controllers/authController.js:186-210`)

```
Request: DELETE /api/v1/auth/account
    │
    ├── Auth required (user itself)
    │
    ├── Extract: { password, permanent } from req.body
    │
    ├── Validation
    │   └── if (!password) → 400 "Password wajib diisi untuk menghapus akun"
    │
    ├── Find user
    │   └── User.findById(req.user._id).select('+password')
    │
    ├── Verify password with bcrypt
    │   └── bcrypt.compare(password, user.password)
    │       └── if (!isMatch) → 401 "Password salah"
    │
    ├── If permanent === true:
    │   └── User.findByIdAndDelete(req.user._id) → hapus permanen dari DB
    │
    ├── Else (default):
    │   └── User.findByIdAndUpdate(req.user._id, { is_active: false }) → nonaktifkan
    │
    └── Response: 200 { message }
```

### 7.6 JWT Auth Middleware (`src/middleware/auth.js:5-25`)

```
Request with Authorization header
    │
    ├── Check header exists and starts with "Bearer "
    │   └── if (!header || !header.startsWith('Bearer ')) → 401
    │
    ├── Extract token
    │   └── header.split(' ')[1]
    │
    ├── Verify JWT
    │   └── jwt.verify(token, JWT_SECRET)
    │       └── if invalid/expired → 401
    │
    ├── Find user
    │   └── User.findById(decoded.id)
    │       └── if (!user || !user.is_active) → 403
    │
    ├── Attach user to request
    │   └── req.user = user
    │
    └── next()
```

---

## 8. Code Flow: Upload & Pipeline

### 8.1 Upload Controller (`src/controllers/workspaceController.js:23-69`)

```
Request: POST /api/v1/workspace/upload (multipart)
    │
    ├── Check file exists
    │   └── if (!req.file) → 400
    │
    ├── Extract body params
    │   └── { layout_template, custom_vocabulary }
    │
    ├── Validate layout_template
    │   ├── if (!layout_template) → 400
    │   └── if (!validLayouts.includes(layout_template)) → 400
    │
    ├── Generate sessionId (UUID v4)
    │
    ├── Create Session document
    │   └── Session.create({
    │         userId: req.user._id,
    │         sessionId,
    │         status: 'queued',
    │         layoutTemplate,
    │         customVocabulary,
    │         originalFileName,
    │         originalFilePath,
    │         stagesDetail: { all 'pending' }
    │       })
    │
    ├── Add to BullMQ queue
    │   └── queue.add('process', { sessionId }, { jobId: sessionId })
    │
    └── Response: 201 { session_id, status: "queued", message }
```

### 8.2 Pipeline Worker (`src/workers/pipelineWorker.js:23-113`)

```
Job received from 'cuplik-pipeline' queue
    │
    ├── Extract sessionId from job.data
    │
    ├── Find session
    │   └── Session.findOne({ sessionId })
    │       └── if (!session) → throw error
    │
    ├── STAGE 1: INGESTION (progress: 10% → 25%)
    │   ├── updateStage(sessionId, 'ingestion', 'processing', 10)
    │   ├── ingestService.processUpload(file, layout, vocabulary, userId)
    │   │   ├── validateFile(file)
    │   │   │   ├── Check format (.mp4/.mov)
    │   │   │   ├── Check size (< 1GB)
    │   │   │   ├── Get metadata (duration, resolution)
    │   │   │   ├── Check duration (< 45 min)
    │   │   │   └── Check resolution (>= 720p)
    │   │   └── extractAudio(file.path, audioPath)
    │   │       └── FFmpeg: convert to WAV mono 16kHz
    │   ├── Save audioExtractedPath to session
    │   └── updateStage(sessionId, 'ingestion', 'done', 25)
    │
    ├── STAGE 2: TRANSCRIPTION (progress: 30% → 50%)
    │   ├── updateStage(sessionId, 'transcription', 'processing', 30)
    │   ├── asrService.transcribe(audioPath, vocabulary)
    │   │   ├── Read audio file as buffer
    │   │   ├── Create FormData with file + language + prompt
    │   │   ├── POST to Elice AI Cloud Whisper endpoint (mlapi.run)
    │   │   └── Return: [{ word, start_time, end_time, confidence }]
    │   ├── Save transcript to session
    │   └── updateStage(sessionId, 'transcription', 'done', 50)
    │
    ├── STAGE 3: LLM CURATION (progress: 55% → 70%)
    │   ├── updateStage(sessionId, 'curation_llm', 'processing', 55)
    │   ├── llmService.selectConcepts(transcript, vocabulary)
    │   │   ├── Format transcript with timestamps
    │   │   ├── Build prompt (system + user message)
    │   │   ├── POST to Elice AI Cloud GPT endpoint (mlapi.run, JSON mode)
    │   │   └── Return: [{ clip_id, start/end_time, duration,
    │   │                   concept_score, title, reason }]
    │   ├── Create Clip documents for each concept
    │   │   └── Clip.create({ sessionId, clipId, timing, subtitles, ... })
    │   └── updateStage(sessionId, 'curation_llm', 'done', 70)
    │
    ├── STAGE 4: RENDERING (progress: 75% → 100%)
    │   ├── updateStage(sessionId, 'rendering', 'processing', 75)
    │   ├── For each clip:
    │   │   ├── Update clip status → 'rendering'
    │   │   ├── renderService.renderClip(source, segment, template, subs, outputPath)
    │   │   │   ├── generateSRT(subtitles, srtPath)
    │   │   │   ├── buildFilterComplex(template, 1080, 1920)
    │   │   │   │   ├── 'slide_pembicara': split + overlay (slide 60% + cam 30%)
    │   │   │   │   ├── 'talking_head': crop center 9:16
    │   │   │   │   └── 'slide_saja': scale + pad black
    │   │   │   └── FFmpeg: cut + filter + burn subtitle → MP4
    │   │   ├── Update clip (videoPath, srtContent, status: 'done')
    │   │   └── Update progress (75-100%)
    │   └── Session status → 'completed', overallProgress → 100
    │
    └── On error at any stage:
        ├── Session status → 'failed'
        ├── Session errorMessage = error.message
        └── throw error (BullMQ will retry)
```

---

## 9. Code Flow: Clip Management

### 9.1 Re-render Flow (`src/controllers/clipController.js:9-41`)

```
Request: POST /api/v1/clips/:clip_id/rerender
    │
    ├── Extract body params
    │   └── { start_time_seconds, end_time_seconds, modified_title, modified_subtitles }
    │
    ├── Validate required fields
    │   └── if missing → 400 "Parameter tidak lengkap"
    │
    ├── Find clip
    │   └── Clip.findOne({ clipId })
    │       └── if (!clip) → 404 "Klip tidak ditemukan"
    │
    ├── Update clip
    │   └── Clip.findOneAndUpdate({ clipId },
    │         { status: 'rendering', suggestedTitle: modified_title })
    │
    ├── Add to rerender queue
    │   └── rerenderQueue.add('rerender', {
    │         clipId, start_time_seconds, end_time_seconds, modified_subtitles
    │       })
    │
    └── Response: 200 { clip_id, status: "rendering", new_video_url }
```

### 9.2 Download MP4 Flow (`src/controllers/clipController.js:43-59`)

```
Request: GET /api/v1/clips/:clip_id/download/mp4
    │
    ├── Find clip
    │   └── Clip.findOne({ clipId })
    │       └── if (!clip || !clip.videoPath) → 404
    │
    ├── Check file exists
    │   └── if (!fs.existsSync(clip.videoPath)) → 404
    │
    ├── Build filename
    │   └── `cuplik_${clip.suggestedTitle || 'clip'}_${Date.now()}.mp4`
    │
    └── Stream file
        └── res.download(clip.videoPath, filename)
```

---

## 10. Code Flow: Admin

### 10.1 Telemetry Flow (`src/controllers/adminController.js:8-68`)

```
Request: GET /api/v1/admin/telemetry
    │
    ├── Auth + Admin check (middleware)
    │
    ├── Get queue stats (parallel)
    │   ├── pipelineQueue.getWaitingCount()
    │   ├── pipelineQueue.getActiveCount()
    │   ├── pipelineQueue.getFailedCount()
    │   ├── rerenderQueue.getWaitingCount()
    │   ├── rerenderQueue.getActiveCount()
    │   └── rerenderQueue.getFailedCount()
    │
    ├── Calculate storage
    │   ├── Scan uploads/ directory
    │   ├── Scan output/ directory
    │   ├── Sum file sizes → usedGb
    │   └── Count total files → tempFilesCount
    │
    ├── Estimate API costs
    │   ├── Count sessions × 10000 tokens estimate
    │   ├── Count sessions × 5 minutes estimate
    │   └── Calculate cost: (minutes × $0.06) + (tokens × $0.00001)
    │
    └── Response: 200 { worker_status, storage_retention, api_cost_meter }
```

---

## 11. Worker Pipeline Flow

### 11.1 Queue Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      REDIS (BullMQ)                        │
│                                                            │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │  Queue: cuplik-pipeline │  │  Queue: cuplik-rerender │  │
│  │                         │  │                         │  │
│  │  ┌─────────────────┐    │  │  ┌─────────────────┐    │  │
│  │  │ Waiting Jobs    │    │  │  │ Waiting Jobs    │    │  │
│  │  │ (pending)       │    │  │  │ (pending)       │    │  │
│  │  └────────┬────────┘    │  │  └────────┬────────┘    │  │
│  │           │             │  │           │             │  │
│  │           ▼             │  │           ▼             │  │
│  │  ┌─────────────────┐    │  │  ┌─────────────────┐    │  │
│  │  │ Active Jobs     │    │  │  │ Active Jobs     │    │  │
│  │  │ (processing)    │    │  │  │ (processing)    │    │  │
│  │  │ concurrency: 2  │    │  │  │ concurrency: 1  │    │  │
│  │  └────────┬────────┘    │  │  └────────┬────────┘    │  │
│  │           │             │  │           │             │  │
│  │           ▼             │  │           ▼             │  │
│  │  ┌─────────────────┐    │  │  ┌─────────────────┐    │  │
│  │  │ Completed Jobs  │    │  │  │ Completed Jobs  │    │  │
│  │  └─────────────────┘    │  │  └─────────────────┘    │  │
│  │                         │  │                         │  │
│  │  ┌─────────────────┐    │  │  ┌─────────────────┐    │  │
│  │  │ Failed Jobs     │    │  │  │ Failed Jobs     │    │  │
│  │  │ (retry: 3x)     │    │  │  │ (retry: 3x)     │    │  │
│  │  └─────────────────┘    │  │  └─────────────────┘    │  │
│  │                         │  │                         │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 11.2 Worker Lifecycle

```
Pipeline Worker (pipelineWorker.js)
    │
    ├── Initialize: new Worker('cuplik-pipeline', handler, { concurrency: 2 })
    │
    ├── Process job:
    │   ├── Find session by sessionId
    │   ├── Execute 4 stages sequentially
    │   ├── Update progress at each stage
    │   └── On success: session.status = 'completed'
    │
    ├── Error handling:
    │   ├── Catch error in handler
    │   ├── Set session.status = 'failed'
    │   ├── Set session.errorMessage
    │   └── throw error → BullMQ retries (3x, exponential backoff)
    │
    └── Event: pipelineWorker.on('failed', (job, err) => log)

Rerender Worker (rerenderWorker.js)
    │
    ├── Initialize: new Worker('cuplik-rerender', handler, { concurrency: 1 })
    │
    ├── Process job:
    │   ├── Find clip + session
    │   ├── Render with new params
    │   └── Update clip (videoPath, srtContent, status: 'done')
    │
    └── Note: No retry on failure (manual re-trigger needed)
```

---

## 12. Middleware Flow

### 12.1 Request Processing Pipeline

```
Incoming Request
    │
    ▼
┌──────────────────────────────┐
│  helmet()                     │  Security headers
│  ├── X-Content-Type-Options   │
│  ├── X-Frame-Options          │
│  ├── Strict-Transport-Security│
│  └── ... (11 more)            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ cors({ origin })             │  Check CORS origin
│ └── Reject if origin mismatch│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  morgan('dev')               │  Log request
│  └── GET /api/v1/... 200 5ms │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  express.json()              │  Parse JSON body
│  express.urlencoded()        │  Parse URL-encoded body
└──────────────┬───────────────┘
               │
               ▼
┌────────────────────────────────┐
│  Router                        │  Match route
│  └── authMiddleware            │  (if auth required)
│      ├── Verify JWT            │
│      ├── Find user             │
│      ├── Check is_active       │
│      └── req.user = user       │
│  └── adminMiddleware           │  (if admin required)
│      └── Check role === 'admin'│
└──────────────┬─────────────────┘
               │
               ▼
┌───────────────────────────────┐
│  Controller                   │  Execute handler
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│  errorHandler                 │  Catch unhandled errors
│  ├── MulterError → 400        │
│  ├── LIMIT_FILE_SIZE → 400    │
│  ├── CastError → 400          │
│  └── Default → 500            │
└───────────────────────────────┘
```

---

## 13. Error Handling Flow

### 13.1 Error Types & Responses

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CLIENT ERRORS (4xx):                                       │
│  ├── 400 Bad Request                                        │
│  │   ├── Invalid file format                                │
│  │   ├── File too large (>1GB)                              │
│  │   ├── Duration too long (>45min)                         │
│  │   ├── Missing required fields                            │
│  │   ├── Invalid layout template                            │
│  │   ├── Token expired                                      │
│  │   ├── Token already used                                 │
│  │   ├── Password required for delete account               │
│  │   └── Email atau password anda salah (register)          │
│  │       (password tidak valid: < 8 char, tanpa uppercase,  │
│  │        lowercase, angka, atau simbol)                    │
│  │                                                          │
│  ├── 401 Unauthorized                                       │
│  │   ├── Missing/invalid JWT token                          │
│  │   └── Email atau password anda salah (login)             │
│  │                                                          │
│  ├── 403 Forbidden                                          │
│  │   ├── Account inactive                                   │
│  │   ├── Role mismatch                                      │
│  │   └── Admin access required                              │
│  │                                                          │
│  └── 404 Not Found                                          │
│      ├── Session not found                                  │
│      ├── Clip not found                                     │
│      └── File not found on disk                             │
│                                                             │
│  SERVER ERRORS (5xx):                                       │
│  └── 500 Internal Server Error                              │
│      ├── ASR API failure                                    │
│      ├── LLM API failure                                    │
│      ├── FFmpeg failure                                     │
│      └── Database error                                     │
│                                                             │
│  Error Response Format:                                     │
│  { "error": "Error message in Indonesian" }                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 13.2 BullMQ Retry Strategy

```
Job fails
    │
    ├── Attempt 1 → retry after 1s
    ├── Attempt 2 → retry after 2s
    ├── Attempt 3 → retry after 4s
    └── All failed → job moves to 'failed' state
        └── Session status → 'failed' with errorMessage
```

---

## 14. File Retention Flow

### 14.1 Cron Job (`src/app.js:43-69`)

```
Schedule: Every hour (0 * * * *)
    │
    ├── Calculate cutoff: now - 24 hours
    │
    ├── Cleanup uploads/ directory
    │   ├── List all files
    │   ├── Check mtime < cutoff
    │   └── Delete expired files
    │
    ├── Cleanup output/ directory
    │   ├── List all files
    │   ├── Check mtime < cutoff
    │   └── Delete expired files
    │
    └── Log results
        └── "[CRON] Cleaned X uploads, Y outputs"
```

### 14.2 File Lifecycle

```
Upload
    │
    ├── uploads/audio_TIMESTAMP.wav (extracted audio)
    │   └── Deleted after 24 hours
    │
    ├── uploads/original_video.mp4 (uploaded video)
    │   └── Deleted after 24 hours
    │
    └── output/clipId.mp4 (rendered clip)
        └── Deleted after 24 hours

Note: Database records (Session, Clip) are NOT deleted
      Only physical files are cleaned up
```

---

## 15. Environment Variables

```env
# Server
PORT=3000                    # Server port
NODE_ENV=development         # development | production

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cuplik

# Redis
REDIS_HOST=localhost         # Redis host
REDIS_PORT=6379              # Redis port

# JWT
JWT_SECRET=your-secret-key   # JWT signing secret
JWT_EXPIRES_IN=24h           # Token expiry

# Elice AI Cloud API (Whisper Large-v3 + GPT 5.6 Luna)
API_KEY=your-api-key                       # Single API key for all AI providers
ASR_API_URL=https://mlapi.run/805a20fb-...   # Whisper endpoint (Elice AI Cloud)
LLM_API_URL=https://mlapi.run/286e9158-...   # GPT endpoint (Elice AI Cloud)

# Email (Forgot Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@cuplik.id

# File Storage
UPLOAD_DIR=./uploads         # Temporary uploads
OUTPUT_DIR=./output          # Rendered clips

# Limits
MAX_FILE_SIZE=1073741824     # 1GB in bytes
MAX_DURATION=2700            # 45 min in seconds

# CORS
CORS_ORIGIN=http://localhost:5173  # Frontend URL
```

---

**Selesai.** Dokumentasi ini mencakup semua flow dalam backend Cuplik untuk memudahkan handover.
