import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  RefreshCw,
  Film,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.jsx';
import { ProgressStepper } from '../../components/ui/ProgressStepper.jsx';
import { ErrorBanner } from '../../components/feedback/ErrorBanner.jsx';
import { useSessionPolling } from '../../features/workspace/useSessionPolling.js';
import { useSessionHistory } from '../../hooks/useSessionHistory.js';
import { PIPELINE_STAGES } from '../../constants/pipelineStages.js';
import { ROUTES } from '../../constants/routes.js';
import { formatDuration } from '../../utils/formatters.js';

export function ProcessingPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { updateSessionStatus } = useSessionHistory();

  const {
    sessionData,
    status,
    stage,
    error,
    isCompleted,
    isFailed,
    isExpired,
    elapsedSeconds,
  } = useSessionPolling(sessionId);

  // Update local session history when status completes or fails
  useEffect(() => {
    if (status && sessionId) {
      updateSessionStatus(sessionId, status, {
        clipCount: sessionData?.clips?.length || 0,
      });
    }
  }, [status, sessionId, sessionData, updateSessionStatus]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C65D3A]/20 bg-[#F2DED5] text-[#C65D3A] text-xs font-semibold font-mono">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          <span>Polling REST 5 Detik</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#242321] font-display">
          Pemrosesan Video Otomatis
        </h2>
        <p className="text-sm text-[#6F6B63]">
          Sesi ID: <span className="font-mono text-[#242321] font-semibold">{sessionId}</span>
        </p>
      </div>

      {/* Failure State */}
      {isFailed && (
        <ErrorBanner
          title="Pemrosesan Klip Terhenti"
          error={error || 'Terjadi kegagalan saat menjalankan pipeline AI atau transcoding video.'}
          onRetry={() => navigate(ROUTES.UPLOAD)}
        />
      )}

      {/* Expired State */}
      {isExpired && (
        <ErrorBanner
          title="Media Video Telah Kedaluwarsa"
          error="File video fisik pada sesi ini telah dihapus oleh sistem sesuai kebijakan retensi 24 jam."
          onRetry={() => navigate(ROUTES.UPLOAD)}
        />
      )}

      {/* Main Status Monitor Card */}
      <Card className="border-[#DEDAD2] bg-[#FFFFFF] shadow-sm">
        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Active 4-stage pipeline stepper */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6F6B63] font-mono mb-6">
              Tahapan Pipeline Cuplik
            </h3>
            <ProgressStepper
              stages={PIPELINE_STAGES}
              currentStageId={stage}
              isCompleted={isCompleted}
              isFailed={isFailed}
            />
          </div>

          {/* Real-time Session Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#DEDAD2]">
            <div className="p-3.5 rounded-xl bg-[#FCFBF8] border border-[#DEDAD2]">
              <span className="text-[11px] text-[#6F6B63] flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Waktu Berjalan
              </span>
              <p className="text-base font-bold font-mono text-[#242321] mt-1">
                {formatDuration(elapsedSeconds)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FCFBF8] border border-[#DEDAD2]">
              <span className="text-[11px] text-[#6F6B63] flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" /> Template Layout
              </span>
              <p className="text-base font-bold text-[#C65D3A] mt-1 capitalize font-mono text-sm truncate">
                {sessionData?.template || 'Deterministik'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FCFBF8] border border-[#DEDAD2] col-span-2 sm:col-span-1">
              <span className="text-[11px] text-[#6F6B63] flex items-center gap-1">
                <Film className="h-3.5 w-3.5" /> Status Sesi
              </span>
              <p className="text-sm font-bold mt-1 uppercase font-mono">
                {isCompleted ? (
                  <span className="text-[#3F7D55]">Selesai (Siap)</span>
                ) : isFailed ? (
                  <span className="text-[#B54A43]">Gagal</span>
                ) : (
                  <span className="text-[#A86F24] animate-pulse">Memproses...</span>
                )}
              </p>
            </div>
          </div>

          {/* Live Pipeline Message Box */}
          <div className="p-4 rounded-xl bg-[#FCFBF8] border border-[#DEDAD2] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#242321]">
              <Sparkles className="h-4 w-4 text-[#C65D3A] shrink-0" />
              <span>
                {isCompleted
                  ? 'Klip telah siap! Klik tombol di bawah untuk melihat dan mengedit klip.'
                  : isFailed
                  ? 'Pipeline gagal memproses video ini.'
                  : 'Sistem sedang menganalisis tuturan lisan & mengekstrak highlight berkonsep utuh...'}
              </span>
            </div>
            {!isCompleted && !isFailed && (
              <span className="text-[#6F6B63] font-mono text-[10px] shrink-0">Polling tiap 5 detik</span>
            )}
          </div>

          {/* Action button on completion */}
          {isCompleted && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <Link
                to={ROUTES.CLIPS.replace(':sessionId', sessionId)}
                className="w-full sm:w-auto"
              >
                <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2 shadow-sm">
                  <span>Lihat Klip yang Dihasilkan</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProcessingPage;
