# Cuplik Backend

Backend API untuk platform repurposing webinar ke klip vertikal bersubtitle.

## Tech Stack

- Node.js + Express 5
- MongoDB + Mongoose
- BullMQ + Redis
- FFmpeg (fluent-ffmpeg)
- JWT Auth

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
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/forgot-password` - Request reset password
- `POST /api/v1/auth/reset-password` - Reset password

### Workspace
- `POST /api/v1/workspace/upload` - Upload video
- `GET /api/v1/workspace/session/:session_id/status` - Status polling
- `GET /api/v1/workspace/session/:session_id/clips` - Get clips

### Clips
- `POST /api/v1/clips/:clip_id/rerender` - Re-render clip
- `GET /api/v1/clips/:clip_id/download/mp4` - Download MP4
- `GET /api/v1/clips/:clip_id/download/srt` - Download SRT

### Admin
- `GET /api/v1/admin/telemetry` - Dashboard telemetry (admin only)
