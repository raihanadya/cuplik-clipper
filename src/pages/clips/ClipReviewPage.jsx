import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Download,
  FileText,
  Sliders,
  Sparkles,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Film,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { VideoPlayer } from '../../components/media/VideoPlayer.jsx';
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton.jsx';
import { ErrorBanner } from '../../components/feedback/ErrorBanner.jsx';
import { workspaceService } from '../../features/workspace/workspaceService.js';
import { clipService } from '../../features/clips/clipService.js';
import { ROUTES } from '../../constants/routes.js';
import { formatDuration } from '../../utils/formatters.js';

export function ClipReviewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadClips() {
      setIsLoading(true);
      setError('');
      try {
        const data = await workspaceService.getSessionStatus(sessionId);
        if (isMounted) {
          setSession(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Gagal memuat hasil kurasi klip.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (sessionId) {
      loadClips();
    }

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const handleDownload = (clipId, type = 'mp4') => {
    clipService.triggerBrowserDownload(clipId, type);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="title" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" className="aspect-[9/16] h-[450px]" />
          <LoadingSkeleton variant="card" className="aspect-[9/16] h-[450px]" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorBanner
          title="Sesi Tidak Ditemukan atau Gagal"
          error={error || 'Tidak dapat menemukan data klip untuk sesi ini.'}
          onRetry={() => navigate(ROUTES.DASHBOARD)}
        />
      </div>
    );
  }

  const clips = session.clips || [];

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DEDAD2]">
        <div>
          <Link
            to={ROUTES.DASHBOARD}
            className="text-xs text-[#6F6B63] hover:text-[#242321] flex items-center gap-1 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Dashboard
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#242321] font-display">
            Hasil Kurasi Klip Vertikal 9:16
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6B63] mt-1">
            Ditemukan <strong className="text-[#242321]">{clips.length} sorotan materi</strong> dengan Concept Completeness utuh.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={ROUTES.UPLOAD}>
            <Button size="sm" variant="secondary">
              Unggah Video Lain
            </Button>
          </Link>
        </div>
      </div>

      {clips.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#FCFBF8] border border-[#DEDAD2]">
          <Film className="h-10 w-10 text-[#969189] mx-auto mb-3" />
          <p className="text-[#242321] font-semibold">Tidak Ada Klip Dihasilkan</p>
          <p className="text-xs text-[#6F6B63] mt-1">
            Video mungkin terlalu pendek atau tidak terdeteksi pembicaraan yang cukup.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clips.map((clip, index) => {
            const clipDuration = (clip.end_time || 0) - (clip.start_time || 0);

            return (
              <Card
                key={clip.clip_id || index}
                className="border-[#DEDAD2] bg-[#FFFFFF] overflow-hidden flex flex-col justify-between hover:border-[#969189] transition-all shadow-xs"
              >
                {/* 9:16 Video Player Preview Container */}
                <div className="p-4 bg-[#F7F5F0] flex justify-center border-b border-[#DEDAD2]">
                  <div className="w-full max-w-[260px]">
                    <VideoPlayer
                      src={clip.video_url || clipService.getVideoStreamUrl(clip.clip_id)}
                      aspect="vertical"
                      title={clip.title || `Klip ${index + 1}`}
                    />
                  </div>
                </div>

                {/* Metadata & Subtitle snippet */}
                <div className="p-5 space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="font-mono text-[10px]">
                      Klip #{index + 1}
                    </Badge>
                    <span className="text-xs font-mono text-[#6F6B63] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(clipDuration)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#242321] font-display">
                    {clip.title || `Sorotan Konsep #${index + 1}`}
                  </h3>

                  <div className="text-xs text-[#6F6B63] bg-[#FCFBF8] p-3 rounded-xl border border-[#DEDAD2] font-sans line-clamp-3">
                    {clip.subtitle_text || clip.transcript_snippet || 'Transkripsi ASR Bahasa Indonesia terlampir.'}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#969189] font-mono pt-1">
                    <span>Mulai: {formatDuration(clip.start_time || 0)}</span>
                    <span>Selesai: {formatDuration(clip.end_time || 0)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-[#FCFBF8] border-t border-[#DEDAD2] space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="gap-1.5 justify-center shadow-xs"
                      onClick={() => handleDownload(clip.clip_id, 'mp4')}
                    >
                      <Download className="h-3.5 w-3.5" /> Unduh MP4
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1.5 justify-center text-xs"
                      onClick={() => handleDownload(clip.clip_id, 'srt')}
                    >
                      <FileText className="h-3.5 w-3.5" /> Subtitle SRT
                    </Button>
                  </div>

                  <Link
                    to={ROUTES.CLIP_EDIT.replace(':sessionId', sessionId).replace(':clipId', clip.clip_id)}
                    className="block"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-center text-xs text-[#C65D3A] hover:text-[#A94B2D] gap-1.5"
                    >
                      <Sliders className="h-3.5 w-3.5" /> Edit Nudge & Subtitle
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ClipReviewPage;
