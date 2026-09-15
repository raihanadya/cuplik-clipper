import React from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Clock,
  Film,
  Sparkles,
  ArrowRight,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { EmptyState } from '../../components/feedback/EmptyState.jsx';
import { useSessionHistory } from '../../hooks/useSessionHistory.js';
import { ROUTES } from '../../constants/routes.js';
import { formatDate, formatRelativeTime } from '../../utils/formatters.js';
import { getTemplateById } from '../../constants/layoutTemplates.js';

export function DashboardPage() {
  const { sessions, removeSession, clearSessions } = useSessionHistory();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Siap Ditinjau
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="warning" className="gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" /> Sedang Diproses
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Gagal
          </Badge>
        );
      case 'expired':
        return <Badge variant="secondary">Media Kedaluwarsa</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Top Banner */}
      <div className="rounded-3xl border border-[#DEDAD2] bg-[#FCFBF8] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F2DED5] text-[#C65D3A] text-xs font-semibold font-mono mb-2 border border-[#C65D3A]/20">
            <Sparkles className="h-3.5 w-3.5" /> Workspace Cuplik
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#242321] font-display">
            Dashboard Proyek Video
          </h2>
          <p className="mt-1 text-sm text-[#6F6B63] max-w-xl">
            Kelola sesi konversi rekaman webinar Anda ke klip vertikal 9:16 berkonsep utuh.
          </p>
        </div>

        <Link to={ROUTES.UPLOAD} className="shrink-0">
          <Button size="lg" variant="primary" magnetic className="gap-2 shadow-sm">
            <UploadCloud className="h-5 w-5" />
            <span>Unggah Video Baru</span>
          </Button>
        </Link>
      </div>

      {/* History Session Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#242321] font-display">
              Riwayat Sesi Konversi
            </h3>
            <p className="text-xs text-[#6F6B63]">
              Disimpan secara lokal pada browser Anda. File fisik pada server diproteksi retensi 24 jam.
            </p>
          </div>

          {sessions.length > 0 && (
            <button
              onClick={clearSessions}
              className="text-xs text-[#6F6B63] hover:text-[#B54A43] transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Bersihkan Riwayat
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <EmptyState
            title="Belum Ada Sesi Video"
            description="Anda belum mengunggah rekaman video webinar untuk diproses. Unggah video MP4 atau MOV untuk memulai ekstraksi klip vertikal pertama Anda."
            action={{
              label: 'Unggah Video Pertama',
              onClick: () => window.location.assign(ROUTES.UPLOAD)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((item) => {
              const templateInfo = getTemplateById(item.template);

              return (
                <Card
                  key={item.sessionId}
                  className="border-[#DEDAD2] bg-[#FCFBF8] hover:border-[#969189] transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(item.status)}
                      <span className="text-[11px] text-[#6F6B63] flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-[#242321] font-semibold text-sm">
                        <Film className="h-4 w-4 text-[#C65D3A] shrink-0" />
                        <span className="truncate">{item.filename || 'Rekaman Video'}</span>
                      </div>
                      <p className="text-xs text-[#6F6B63] mt-1">
                        Template: <span className="text-[#242321] font-medium">{templateInfo?.label || item.template}</span>
                      </p>
                      {item.clipCount > 0 && (
                        <p className="text-xs text-[#C65D3A] font-medium mt-0.5">
                          {item.clipCount} klip berhasil dihasilkan
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-[#DEDAD2] flex items-center justify-between">
                    <button
                      onClick={() => removeSession(item.sessionId)}
                      className="p-1.5 rounded-lg text-[#969189] hover:text-[#B54A43] hover:bg-[#B54A43]/10 transition-colors"
                      aria-label="Hapus sesi dari riwayat"
                      title="Hapus dari riwayat lokal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {item.status === 'completed' ? (
                      <Link to={ROUTES.CLIPS.replace(':sessionId', item.sessionId)}>
                        <Button size="sm" variant="primary" className="gap-1.5">
                          Tinjau Klip <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <Link to={ROUTES.SESSION_STATUS.replace(':sessionId', item.sessionId)}>
                        <Button size="sm" variant="secondary" className="gap-1.5">
                          Lihat Status <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
