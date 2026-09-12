# Cuplik API Contract

**Versi:** 1.1
**Base URL:** `http://localhost:3000`

---

## 1. Auth

### 1.1 Register

* **Endpoint:** `POST /api/v1/auth/register`
* **Auth:** Tidak perlu
* **Request Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "Secret123!"
  }
  ```
* **Response 201:**
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
* **Error Response:**
  | Kode | Error |
  |------|-------|
  | 400 | `Email dan password wajib diisi.` |
  | 400 | `Password tidak valid: minimal 8 karakter, harus mengandung huruf kapital, huruf kecil, angka, dan simbol.` |
  | 400 | `Email tidak valid.` |
* **Password Requirements:**
  - Minimal 8 karakter
  - minimal 1 huruf kapital (A-Z)
  - minimal 1 huruf kecil (a-z)
  - minimal 1 angka (0-9)
  - minimal 1 simbol (!@#$%^&*...)

---

### 1.2 Login

* **Endpoint:** `POST /api/v1/auth/login`
* **Auth:** Tidak perlu
* **Request Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "secret123",
    "role": "user"
  }
  ```
* **Response 200:**
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
* **Error Response:**
  | Kode | Error |
  |------|-------|
  | 400 | `Email, password, dan role wajib diisi.` |
  | 401 | `Email atau password salah.` |
  | 403 | `Akun tidak aktif. Hubungi admin.` |
  | 403 | `Role tidak sesuai.` |

---

### 1.2 Forgot Password

* **Endpoint:** `POST /api/v1/auth/forgot-password`
* **Auth:** Tidak perlu
* **Request Body (JSON):**
  ```json
  {
    "email": "user@example.com"
  }
  ```
* **Response 200:**
  ```json
  {
    "message": "Jika email terdaftar, link reset password telah dikirim."
  }
  ```
* **Catatan:** Response sama无论email ada atau tidak (keamanan).

---

### 1.3 Reset Password

* **Endpoint:** `POST /api/v1/auth/reset-password`
* **Auth:** Tidak perlu
* **Request Body (JSON):**
  ```json
  {
    "token": "abc123-reset-token",
    "new_password": "newSecret456"
  }
  ```
* **Response 200:**
  ```json
  {
    "message": "Password berhasil direset. Silakan login dengan password baru."
  }
  ```
* **Error Response:**
  | Kode | Error |
  |------|-------|
  | 400 | `Token dan password baru wajib diisi.` |
  | 400 | `Token tidak valid atau sudah digunakan.` |
  | 400 | `Token sudah expired. Silakan request ulang.` |

---

### 1.4 Activate User (Admin)

* **Endpoint:** `PATCH /api/v1/auth/admin/users/:user_id/activate`
* **Auth:** Bearer Token (admin only)
* **Response 200:**
  ```json
  {
    "message": "User berhasil diaktifkan.",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "role": "user",
      "is_active": true
    }
  }
  ```

---

### 1.5 Deactivate User (Admin)

* **Endpoint:** `PATCH /api/v1/auth/admin/users/:user_id/deactivate`
* **Auth:** Bearer Token (admin only)
* **Response 200:**
  ```json
  {
    "message": "User berhasil dinonaktifkan.",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "role": "user",
      "is_active": false
    }
  }
  ```

---

### 1.6 Hapus Akun (User)

* **Endpoint:** `DELETE /api/v1/auth/account`
* **Auth:** Bearer Token
* **Request Body (JSON):**
  ```json
  {
    "password": "currentPassword123",
    "permanent": false
  }
  ```
  | Field | Tipe | Wajib | Keterangan |
  |-------|------|-------|------------|
  | `password` | string | Ya | Password saat ini untuk verifikasi |
  | `permanent` | boolean | Tidak | `true` = hapus permanen, `false`/kosong = nonaktifkan |
* **Response 200 (Soft Delete):**
  ```json
  {
    "message": "Akun berhasil dinonaktifkan. Hubungi admin untuk mengaktifkan kembali."
  }
  ```
* **Response 200 (Permanent Delete):**
  ```json
  {
    "message": "Akun berhasil dihapus permanen."
  }
  ```
* **Error Response:**
  | Kode | Error |
  |------|-------|
  | 400 | `Password wajib diisi untuk menghapus akun.` |
  | 401 | `Password salah.` |
* **Catatan:**
  - Wajib verifikasi password sebelumhapus
  - Default: soft delete (nonaktifkan akun)
  - Permanent delete: data user dihapus dari database secara permanen

---

## 2. Workspace

### 2.1 Upload Video

* **Endpoint:** `POST /api/v1/workspace/upload`
* **Auth:** Bearer Token
* **Content-Type:** `multipart/form-data`
* **Request Body (Form Data):**
  | Field | Tipe | Wajib | Keterangan |
  |-------|------|-------|------------|
  | `file` | binary | Ya | Video `.mp4` atau `.mov` (max 1GB, max 45 menit, min 720p) |
  | `layout_template` | string | Ya | `slide_pembicara` \| `talking_head` \| `slide_saja` |
  | `custom_vocabulary` | string | Tidak | Frasa teknis dipisah koma (max 200 karakter) |
* **Response 201:**
  ```json
  {
    "session_id": "abc-123-def-456",
    "status": "queued",
    "message": "Video berhasil diterima dan masuk antrean."
  }
  ```

---

### 2.2 Get Session Status

* **Endpoint:** `GET /api/v1/workspace/session/:session_id/status`
* **Auth:** Bearer Token
* **Response 200:**
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
* **Stage Values:** `ingestion`, `transcription`, `curation_llm`, `rendering`
* **Status Values:** `pending`, `processing`, `done`, `failed`

---

### 2.3 Get Session Clips

* **Endpoint:** `GET /api/v1/workspace/session/:session_id/clips`
* **Auth:** Bearer Token
* **Response 200:**
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
        "video_preview_url": "/api/v1/clips/clip-001/download/mp4",
        "subtitles": [
          { "word": "Jadi", "start_time": 252.5, "end_time": 252.8 },
          { "word": "teman-teman", "start_time": 252.9, "end_time": 253.4 }
        ],
        "status": "done"
      }
    ]
  }
  ```
* **Catatan:**
  - `video_preview_url` bernilai `null` jika status clip bukan `"done"`
  - Clips diurutkan berdasarkan `start_time_seconds` (ascending)
  - Field `status` tersedia: `pending`, `rendering`, `done`, `failed`

---

## 3. Clips

### 3.1 Re-render Clip

* **Endpoint:** `POST /api/v1/clips/:clip_id/rerender`
* **Auth:** Bearer Token
* **Request Body (JSON):**
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
* **Response 200:**
  ```json
  {
    "clip_id": "clip-001",
    "status": "rendering",
    "new_video_url": "/api/v1/clips/clip-001/download/mp4"
  }
  ```

---

### 3.2 Download MP4

* **Endpoint:** `GET /api/v1/clips/:clip_id/download/mp4`
* **Auth:** Bearer Token
* **Response:** Binary stream `.mp4`
* **Content-Disposition:** `attachment; filename="cuplik_[judul-klip]_[timestamp].mp4"`

---

### 3.3 Download SRT

* **Endpoint:** `GET /api/v1/clips/:clip_id/download/srt`
* **Auth:** Bearer Token
* **Response:** Text stream `.srt`
* **Content-Type:** `text/srt`
* **Content-Disposition:** `attachment; filename="cuplik_[judul-klip]_[timestamp].srt"`

---

## 4. Admin

### 4.1 Telemetry Dashboard

* **Endpoint:** `GET /api/v1/admin/telemetry`
* **Auth:** Bearer Token (admin only)
* **Response 200:**
  ```json
  {
    "worker_status": {
      "active_jobs": 2,
      "waiting_jobs": 5,
      "failed_jobs": 0,
      "queue_latency_seconds": 0
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

## 5. Error Response Format

Semua error response mengikuti format:
```json
{
  "error": "Pesan error dalam Bahasa Indonesia"
}
```

### Daftar Error

| Kode | Endpoint | Error |
|------|----------|-------|
| 400 | Login | `Email, password, dan role wajib diisi.` |
| 400 | Upload | `File video wajib diupload.` |
| 400 | Upload | `Layout template wajib dipilih.` |
| 400 | Upload | `Layout template tidak valid.` |
| 400 | Upload | `Format tidak didukung. Gunakan MP4/MOV.` |
| 400 | Upload | `Ukuran file melebihi 1GB.` |
| 400 | Upload | `Durasi video maksimal 45 menit.` |
| 400 | Upload | `Resolusi minimal 720p.` |
| 400 | Re-render | `Parameter tidak lengkap.` |
| 400 | Reset Password | `Token dan password baru wajib diisi.` |
| 400 | Reset Password | `Token tidak valid atau sudah digunakan.` |
| 400 | Reset Password | `Token sudah expired. Silakan request ulang.` |
| 401 | Auth | `Email atau password salah.` |
| 401 | Auth | `Token tidak valid atau expired.` |
| 403 | Auth | `Akun tidak aktif. Hubungi admin.` |
| 403 | Auth | `Role tidak sesuai.` |
| 403 | Admin | `Akses ditolak. Hanya admin.` |
| 404 | Status/Clips | `Sesi pemrosesan tidak ditemukan.` |
| 404 | Clips | `Klip tidak ditemukan.` |
| 404 | Download | `File tidak ditemukan.` |
| 500 | Semua | `Terjadi kesalahan server.` |

---

## 6. Authentication

### Cara Menggunakan

1. Login untuk mendapatkan `token`
2. Sertakan token di header setiap request:
   ```
   Authorization: Bearer <token>
   ```

### Role-Based Access

| Role | Akses |
|------|-------|
| `user` | Upload, status, clips, download, re-render |
| `admin` | Semua akses user + activate/deactivate user + telemetry |

---

## 7. Flow Lupa Password

```
1. User POST /api/v1/auth/forgot-password { email }
2. System generate token (15 menit expiry), simpan di MongoDB
3. System kirim email berisi link reset
4. User buka link, isi password baru
5. User POST /api/v1/auth/reset-password { token, new_password }
6. System update password, hapus token
```
