import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sliders,
  Sparkles,
  ArrowLeft,
  Clock,
  Download,
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { VideoPlayer } from '../../components/media/VideoPlayer.jsx';
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton.jsx';
import { ErrorBanner } from '../../components/feedback/ErrorBanner.jsx';
import { workspaceService } from '../../features/workspace/workspaceService.js';
import { clipService } from '../../features/clips/clipService.js';
import { ROUTES } from '../../constants/routes.js';
import { formatDuration } from '../../utils/formatters.js';

export function ClipEditorPage() {
  const { sessionId, clipId } = useParams();
  const navigate = useNavigate();

  const [clip, setClip] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [subtitleText, setSubtitleText] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isRerendering, setIsRerendering] = useState(false);
  const [rerenderSuccess, setRerenderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [videoTimestamp, setVideoTimestamp] = useState(Date.now());

  useEffect(() => {
    let isMounted = true;
    async function loadClip() {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const sessionData = await workspaceService.getSessionStatus(sessionId);
        const targetClip = (sessionData.clips || []).find((c) => c.clip_id === clipId);

        if (!targetClip) {
          throw new Error('Klip tidak ditemukan dalam sesi ini.');
        }

        if (isMounted) {
          setClip(targetClip);
          setStartTime(Number(targetClip.start_time || 0));
          setEndTime(Number(targetClip.end_time || 0));
          setSubtitleText(targetClip.subtitle_text || targetClip.transcript_snippet || '');
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Gagal memuat editor klip.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (sessionId && clipId) {
      loadClip();
    }

    return () => {
      isMounted = false;
    };
  }, [sessionId, clipId]);

  const handleNudgeStart = (delta) => {
    setRerenderSuccess(false);
    setStartTime((prev) => {
      const nextVal = Math.max(0, Number((prev + delta).toFixed(2)));
      return nextVal < endTime ? nextVal : prev;
    });
  };

  const handleNudgeEnd = (delta) => {
    setRerenderSuccess(false);
    setEndTime((prev) => {
      const nextVal = Number((prev + delta).toFixed(2));
      return nextVal > startTime ? nextVal : prev;
    });
  };

  const handleRerender = async () => {
    if (startTime >= endTime) {
      setErrorMessage('Waktu mulai harus lebih kecil daripada waktu selesai.');
      return;
    }

    setIsRerendering(true);
    setErrorMessage('');
    setRerenderSuccess(false);

    try {
      const result = await clipService.rerenderClip(clipId, {
        start_time: startTime,
        end_time: endTime,
        subtitle_text: subtitleText.trim(),
      });

      setRerenderSuccess(true);
      setVideoTimestamp(Date.now()); // bust video cache
      if (result) {
        setClip((prev) => ({ ...prev, ...result }));
      }
    } catch (err) {
      setErrorMessage(err.message || 'Gagal merender ulang klip. Coba beberapa saat lagi.');
    } finally {
      setIsRerendering(false);
    }
  };

  const handleDownload = (type = 'mp4') => {
    clipService.triggerBrowserDownload(clipId, type);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="title" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton variant="card" className="h-[400px]" />
          <LoadingSkeleton variant="card" className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (errorMessage && !clip) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorBanner
          title="Klip Tidak Ditemukan"
          error={errorMessage}
          onRetry={() => navigate(ROUTES.CLIPS.replace(':sessionId', sessionId))}
        />
      </div>
    );
  }

  const duration = Math.max(0, endTime - startTime);
  const streamUrl = `${clip?.video_url || clipService.getVideoStreamUrl(clipId)}?t=${videoTimestamp}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.CLIPS.replace(':sessionId', sessionId)}
          className="text-xs text-[#6F6B63] hover:text-[#242321] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Klip Sesi
        </Link>
        <span className="text-xs font-mono text-[#969189]">ID: {clipId}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Native 9:16 Video Player Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <Card className="w-full max-w-[320px] border-[#DEDAD2] bg-[#FFFFFF] overflow-hidden shadow-sm">
            <div className="p-3 bg-[#FCFBF8] flex items-center justify-between border-b border-[#DEDAD2] text-xs">
              <span className="font-semibold text-[#242321] truncate">Pratinjau Vertikal 9:16</span>
              <span className="text-[10px] bg-[#F2DED5] text-[#C65D3A] px-2 py-0.5 rounded font-mono font-bold">
                {formatDuration(duration)}
              </span>
            </div>

            <div className="p-4 bg-[#F7F5F0] flex justify-center">
              <div className="w-full max-w-[280px]">
                <VideoPlayer
                  key={videoTimestamp}
                  src={streamUrl}
                  aspect="vertical"
                  title={clip?.title || 'Klip Vertikal'}
                />
              </div>
            </div>

            <div className="p-3 bg-[#FCFBF8] border-t border-[#DEDAD2] flex items-center justify-between text-xs">
              <Button
                size="sm"
                variant="primary"
                className="gap-1.5 text-xs flex-1 mr-2 shadow-xs"
                onClick={() => handleDownload('mp4')}
              >
                <Download className="h-3.5 w-3.5" /> Unduh MP4
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5 text-xs"
                onClick={() => handleDownload('srt')}
              >
                <FileText className="h-3.5 w-3.5" /> SRT
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column (7 cols): Nudge Controls & Subtitle Editor */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-[#DEDAD2] bg-[#FFFFFF] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#DEDAD2]">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-[#242321]">
                <Sliders className="h-5 w-5 text-[#C65D3A]" />
                Editor Penyelarasan Klip
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-[#B54A43]/10 border border-[#B54A43]/40 text-[#B54A43] text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {rerenderSuccess && (
                <div className="p-3.5 rounded-xl bg-[#3F7D55]/10 border border-[#3F7D55]/30 text-[#3F7D55] text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#3F7D55]" />
                  <span>Klip berhasil dirender ulang! Pratinjau video telah diperbarui.</span>
                </div>
              )}

              {/* 1. Nudge Start Time */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#242321]">
                    Titik Waktu Mulai (Start Time)
                  </label>
                  <span className="font-mono text-[#C65D3A] font-bold">{formatDuration(startTime)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleNudgeStart(-0.5)}
                    className="gap-1 font-mono text-xs px-3"
                  >
                    <Minus className="h-3 w-3" /> 0.5s
                  </Button>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={startTime}
                    onChange={(e) => {
                      setRerenderSuccess(false);
                      setStartTime(Number(e.target.value));
                    }}
                    className="flex-1 rounded-xl border border-[#DEDAD2] bg-[#FFFFFF] px-3 py-2 text-sm font-mono text-[#242321] text-center focus:border-[#C65D3A] focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleNudgeStart(0.5)}
                    className="gap-1 font-mono text-xs px-3"
                  >
                    <Plus className="h-3 w-3" /> 0.5s
                  </Button>
                </div>
              </div>

              {/* 2. Nudge End Time */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#242321]">
                    Titik Waktu Selesai (End Time)
                  </label>
                  <span className="font-mono text-[#C65D3A] font-bold">{formatDuration(endTime)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleNudgeEnd(-0.5)}
                    className="gap-1 font-mono text-xs px-3"
                  >
                    <Minus className="h-3 w-3" /> 0.5s
                  </Button>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={endTime}
                    onChange={(e) => {
                      setRerenderSuccess(false);
                      setEndTime(Number(e.target.value));
                    }}
                    className="flex-1 rounded-xl border border-[#DEDAD2] bg-[#FFFFFF] px-3 py-2 text-sm font-mono text-[#242321] text-center focus:border-[#C65D3A] focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleNudgeEnd(0.5)}
                    className="gap-1 font-mono text-xs px-3"
                  >
                    <Plus className="h-3 w-3" /> 0.5s
                  </Button>
                </div>
              </div>

              {/* 3. Subtitle Text Editor */}
              <div className="space-y-2">
                <label className="font-bold text-[#242321] text-xs block">
                  Teks Subtitle / Transkripsi Lisan
                </label>
                <textarea
                  rows={4}
                  value={subtitleText}
                  onChange={(e) => {
                    setRerenderSuccess(false);
                    setSubtitleText(e.target.value);
                  }}
                  className="w-full rounded-xl border border-[#DEDAD2] bg-[#FFFFFF] p-3 text-xs leading-relaxed text-[#242321] placeholder:text-[#969189] focus:border-[#C65D3A] focus:outline-none focus:ring-1 focus:ring-[#C65D3A]"
                  placeholder="Koreksi kata atau ejaan subtitle di sini..."
                />
                <p className="text-[11px] text-[#6F6B63]">
                  Perubahan teks subtitle akan langsung diburn-in pada video hasil rerender.
                </p>
              </div>

              {/* Rerender Trigger */}
              <div className="pt-4 border-t border-[#DEDAD2] flex items-center justify-between gap-4">
                <div className="text-xs text-[#6F6B63] font-mono">
                  Durasi Hasil: <span className="font-bold text-[#242321]">{duration.toFixed(1)} detik</span>
                </div>

                <Button
                  variant="primary"
                  className="gap-2 px-6 shadow-sm"
                  onClick={handleRerender}
                  disabled={isRerendering || startTime >= endTime}
                  isLoading={isRerendering}
                >
                  <RefreshCw className={`h-4 w-4 ${isRerendering ? 'animate-spin' : ''}`} />
                  {isRerendering ? 'Merender Ulang...' : 'Rerender Klip'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ClipEditorPage;
