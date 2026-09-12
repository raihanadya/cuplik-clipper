# Cuplik Backend

Backend API untuk platform repurposing webinar ke klip vertikal bersubtitle.

## Tech Stack

- Node.js + Express 5
- MongoDB + Mongoose
- BullMQ + Redis
- FFmpeg (fluent-ffmpeg)
- JWT Auth
- bcryptjs (password hashing)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup MongoDB dan Redis

3. Copy `.env.example` ke `.env` dan isi environment variables

4. Jalankan server:
   ```bash
   npm run dev        # Development
   npm start          # Production
   npm run worker     # Pipeline worker
   ```

## API Endpoints

### Auth
| Method | Endpoint | Fungsi | Auth |
|--------|----------|--------|------|
| POST | `/api/v1/auth/register` | Daftar akun baru | ❌ |
| POST | `/api/v1/auth/login` | Login | ❌ |
| POST | `/api/v1/auth/forgot-password` | Request reset password | ❌ |
| POST | `/api/v1/auth/reset-password` | Reset password | ❌ |
| DELETE | `/api/v1/auth/account` | Hapus akun (soft/permanent) | ✅ |

### Admin - User Management
| Method | Endpoint | Fungsi | Auth |
|--------|----------|--------|------|
| PATCH | `/api/v1/auth/admin/users/:user_id/activate` | Aktifkan user | ✅ (admin) |
| PATCH | `/api/v1/auth/admin/users/:user_id/deactivate` | Nonaktifkan user | ✅ (admin) |

### Workspace
| Method | Endpoint | Fungsi | Auth |
|--------|----------|--------|------|
| POST | `/api/v1/workspace/upload` | Upload video | ✅ |
| GET | `/api/v1/workspace/session/:session_id/status` | Status polling | ✅ |
| GET | `/api/v1/workspace/session/:session_id/clips` | Get clips | ✅ |

### Clips
| Method | Endpoint | Fungsi | Auth |
|--------|----------|--------|------|
| POST | `/api/v1/clips/:clip_id/rerender` | Re-render clip | ✅ |
| GET | `/api/v1/clips/:clip_id/download/mp4` | Download MP4 | ✅ |
| GET | `/api/v1/clips/:clip_id/download/srt` | Download SRT | ✅ |

### Admin - Telemetry
| Method | Endpoint | Fungsi | Auth |
|--------|----------|--------|------|
| GET | `/api/v1/admin/telemetry` | Dashboard telemetry | ✅ (admin) |

## Contoh Penggunaan

### Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Secret123!"}'
```

**Password Requirements:**
- Minimal 8 karakter
- minimal 1 huruf kapital (A-Z)
- minimal 1 huruf kecil (a-z)
- minimal 1 angka (0-9)
- minimal 1 simbol (!@#$%^&*...)

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123","role":"user"}'
```

### Upload Video
```bash
curl -X POST http://localhost:3000/api/v1/workspace/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@video.mp4" \
  -F "layout_template=talking_head" \
  -F "custom_vocabulary=AI, machine learning"
```

### Hapus Akun (Soft Delete)
```bash
curl -X DELETE http://localhost:3000/api/v1/auth/account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"currentPassword123"}'
```

### Hapus Akun (Permanent)
```bash
curl -X DELETE http://localhost:3000/api/v1/auth/account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"currentPassword123","permanent":true}'
```

## Dokumentasi Lengkap

- `backend-flow.md` - Code flow dan user flow
- `tutorial-penggunaan-dan-apa-yang-kurang.md` - Setup infrastruktur
- `API-Contract.md` - Spesifikasi API lengkap
- `cuplik-backend-design-spec.md` - Design specification
