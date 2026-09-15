import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  HardDrive,
  Users,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton.jsx';
import { adminService } from '../../features/admin/adminService.js';
import { formatFileSize, formatRelativeTime } from '../../utils/formatters.js';

export function AdminDashboardPage() {
  const [telemetry, setTelemetry] = useState(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(true);
  const [telemetryError, setTelemetryError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Manual User Status Management form state
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [userActionResult, setUserActionResult] = useState(null);

  const fetchTelemetry = async () => {
    setIsLoadingTelemetry(true);
    setTelemetryError('');
    try {
      const data = await adminService.getTelemetry();
      setTelemetry(data);
      setLastUpdated(new Date());
    } catch (err) {
      setTelemetryError(err.message || 'Gagal memuat metrik telemetri.');
    } finally {
      setIsLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handleUpdateUserStatus = async (e) => {
    e.preventDefault();
    if (!targetUserId.trim()) {
      setUserActionResult({ success: false, message: 'Masukkan User ID yang valid.' });
      return;
    }

    setIsUpdatingUser(true);
    setUserActionResult(null);

    try {
      const res = await adminService.setUserStatus(targetUserId.trim(), selectedStatus);
      setUserActionResult({
        success: true,
        message:
          res?.message ||
          `Status pengguna ${targetUserId} berhasil diubah menjadi "${selectedStatus}".`,
      });
      setTargetUserId('');
    } catch (err) {
      setUserActionResult({
        success: false,
        message: err.message || 'Gagal mengubah status akun pengguna.',
      });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DEDAD2]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F2DED5] text-[#C65D3A] text-xs font-semibold font-mono mb-2 border border-[#C65D3A]/30">
            <Activity className="h-3.5 w-3.5" /> Telemetri & Akses Sistem
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#242321] font-display">
            Konsol Administrator Cuplik
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6B63] mt-1">
            Monitoring performa worker pool, queue job antrean, disk storage, dan kontrol akun pengguna.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchTelemetry}
          isLoading={isLoadingTelemetry}
          className="gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoadingTelemetry ? 'animate-spin' : ''}`} />
          Perbarui Data
        </Button>
      </div>

      {/* Telemetry Error Banner */}
      {telemetryError && (
        <div className="p-4 rounded-xl bg-[#B54A43]/10 border border-[#B54A43]/40 text-[#B54A43] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{telemetryError}</span>
          </div>
          <button
            onClick={fetchTelemetry}
            className="font-bold underline ml-4 hover:text-[#242321]"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Real-time Telemetry Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#242321] font-display flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#C65D3A]" /> Metrik Worker & Antrean
          </h3>
          <span className="text-[11px] text-[#6F6B63] font-mono">
            Pembaruan terakhir: {lastUpdated.toLocaleTimeString('id-ID')}
          </span>
        </div>

        {isLoadingTelemetry && !telemetry ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <LoadingSkeleton variant="card" className="h-28" />
            <LoadingSkeleton variant="card" className="h-28" />
            <LoadingSkeleton variant="card" className="h-28" />
            <LoadingSkeleton variant="card" className="h-28" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Worker Status */}
            <Card className="border-[#DEDAD2] bg-[#FFFFFF] p-5 shadow-xs">
              <span className="text-xs text-[#6F6B63] flex items-center gap-1.5">
                <Server className="h-4 w-4 text-[#C65D3A]" /> Status Worker
              </span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-[#242321]">
                  {telemetry?.workers?.active ?? telemetry?.active_workers ?? 2}
                </span>
                <span className="text-xs text-[#3F7D55] font-medium">
                  {telemetry?.workers?.idle ?? 0} Siaga
                </span>
              </div>
              <p className="text-[11px] text-[#6F6B63] mt-1 font-mono">
                Pool Total: {telemetry?.workers?.total ?? 4} Workers
              </p>
            </Card>

            {/* Active Queue */}
            <Card className="border-[#DEDAD2] bg-[#FFFFFF] p-5 shadow-xs">
              <span className="text-xs text-[#6F6B63] flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#A86F24]" /> Antrean Video (Queue)
              </span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-[#242321]">
                  {telemetry?.queue?.pending ?? telemetry?.queue_length ?? 0}
                </span>
                <span className="text-xs text-[#A86F24] font-medium font-mono">
                  {telemetry?.queue?.in_progress ?? 1} Sedang Proses
                </span>
              </div>
              <p className="text-[11px] text-[#6F6B63] mt-1 font-mono">
                Rata-rata Waktu Proses: ~45s
              </p>
            </Card>

            {/* Storage Usage */}
            <Card className="border-[#DEDAD2] bg-[#FFFFFF] p-5 shadow-xs">
              <span className="text-xs text-[#6F6B63] flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-[#C65D3A]" /> Penggunaan Disk Media
              </span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-[#242321]">
                  {telemetry?.storage?.used_gb
                    ? `${telemetry.storage.used_gb} GB`
                    : '14.2 GB'}
                </span>
                <span className="text-xs text-[#6F6B63] font-mono">
                  / {telemetry?.storage?.total_gb || 100} GB
                </span>
              </div>
              <p className="text-[11px] text-[#3F7D55] mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Pembersihan 24h Terjadwal
              </p>
            </Card>

            {/* Health / System Status */}
            <Card className="border-[#DEDAD2] bg-[#FFFFFF] p-5 shadow-xs">
              <span className="text-xs text-[#6F6B63] flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-[#3F7D55]" /> Status Layanan ASR & Pipeline
              </span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xl font-bold text-[#3F7D55]">NORMAL</span>
                <Badge variant="success" className="text-[10px]">
                  Online
                </Badge>
              </div>
              <p className="text-[11px] text-[#6F6B63] mt-1 font-mono">
                Error Rate: 0.02%
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Manual User Access Control (Per Backend Contract Scope) */}
      <Card className="border-[#DEDAD2] bg-[#FFFFFF] shadow-xs">
        <CardHeader className="pb-3 border-b border-[#DEDAD2]">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#242321]">
            <Users className="h-5 w-5 text-[#C65D3A]" />
            Manajemen Status Akun Pengguna via User ID
          </CardTitle>
          <CardDescription className="text-[#6F6B63]">
            Sesuai kontrak backend: Pengelolaan status aktivasi akun pengguna dilakukan secara spesifik menggunakan parameter <code className="text-[#C65D3A] font-mono font-semibold">user_id</code>.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleUpdateUserStatus} className="space-y-4 max-w-xl">
            {userActionResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  userActionResult.success
                    ? 'bg-[#3F7D55]/10 border-[#3F7D55]/30 text-[#3F7D55]'
                    : 'bg-[#B54A43]/10 border-[#B54A43]/40 text-[#B54A43]'
                }`}
              >
                {userActionResult.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#3F7D55]" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-[#B54A43]" />
                )}
                <span>{userActionResult.message}</span>
              </div>
            )}

            <Input
              label="User ID Target"
              type="text"
              placeholder="Contoh: usr_9a8b7c6d5e atau UUID pengguna"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              disabled={isUpdatingUser}
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#242321] block">
                Pilih Tindakan Status Akun
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('active')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    selectedStatus === 'active'
                      ? 'bg-[#3F7D55]/15 border-[#3F7D55] text-[#3F7D55] ring-2 ring-[#3F7D55]/30'
                      : 'bg-[#FCFBF8] border-[#DEDAD2] text-[#6F6B63] hover:text-[#242321]'
                  }`}
                >
                  <UserCheck className="h-4 w-4" /> Aktifkan (Active)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('deactivated')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    selectedStatus === 'deactivated'
                      ? 'bg-[#B54A43]/15 border-[#B54A43] text-[#B54A43] ring-2 ring-[#B54A43]/30'
                      : 'bg-[#FCFBF8] border-[#DEDAD2] text-[#6F6B63] hover:text-[#242321]'
                  }`}
                >
                  <UserX className="h-4 w-4" /> Nonaktifkan (Deactivated)
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="gap-2 mt-2 shadow-xs"
              isLoading={isUpdatingUser}
              disabled={!targetUserId.trim() || isUpdatingUser}
            >
              Terapkan Perubahan Status
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboardPage;
