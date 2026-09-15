import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Trash2,
  LogOut,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.jsx';
import { Dialog } from '../../components/ui/Dialog.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { ROUTES } from '../../constants/routes.js';

export function AccountPage() {
  const { user, role, logout, deleteAccount, isLoading } = useAuth();
  const navigate = useNavigate();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'HAPUS') {
      setDeleteError('Ketik kata "HAPUS" untuk mengonfirmasi tindakan ini.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteAccount();
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      setDeleteError(err.message || 'Gagal menghapus akun. Silakan coba lagi.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Pengaturan Akun
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Kelola profil pengguna, preferensi keamanan, dan data akun Cuplik Anda.
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="border-slate-800 bg-slate-900/80 shadow-xl">
        <CardHeader className="pb-4 border-b border-slate-800">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-400" />
            Informasi Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Alamat Email</span>
              <span className="text-sm font-bold text-white font-mono">
                {user?.email || 'Tidak diketahui'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={role === 'admin' ? 'warning' : 'primary'} className="uppercase font-mono text-[10px]">
                {role === 'admin' ? 'Administrator' : 'Pengguna Standar'}
              </Badge>
              <Badge variant="success" className="text-[10px]">
                Aktif
              </Badge>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Privasi & Retensi 24 Jam Aktif</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Seluruh file video mentah dan artefak transcoding pada server Cuplik dibersihkan secara terjadwal setiap 24 jam setelah sesi selesai.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-slate-300 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Keluar dari Sesi Ini
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone: Delete Account */}
      <Card className="border-rose-500/30 bg-rose-950/10 shadow-xl">
        <CardHeader className="pb-3 border-b border-rose-500/20">
          <CardTitle className="text-lg font-bold text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            Zona Berbahaya (Danger Zone)
          </CardTitle>
          <CardDescription className="text-rose-300/80">
            Tindakan penghapusan akun bersifat permanen dan tidak dapat dibatalkan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">Hapus Akun Pengguna</p>
            <p className="text-xs text-slate-400 max-w-md">
              Menghapus kredensial autentikasi Anda dari database server dan menghentikan seluruh sesi aktif.
            </p>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setDeleteError('');
              setDeleteConfirmationText('');
              setIsDeleteDialogOpen(true);
            }}
            className="shrink-0 gap-2"
          >
            <Trash2 className="h-4 w-4" /> Hapus Akun Saya
          </Button>
        </CardContent>
      </Card>

      {/* Deletion Confirmation Modal Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
        title="Konfirmasi Hapus Akun Permanen"
        description="Apakah Anda yakin ingin menghapus akun Cuplik Anda secara permanen?"
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
              {deleteError}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-rose-400">Peringatan Kritis:</p>
            <p>
              Tindakan ini akan menghapus akun email <strong className="text-white">{user?.email}</strong> secara instan melalui endpoint resmi backend <code className="text-rose-300 font-mono">DELETE /api/v1/auth/account</code>.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Ketik kata <span className="font-mono text-rose-400 font-bold">HAPUS</span> untuk melanjutkan:
            </label>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="HAPUS"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-white focus:border-rose-500 focus:outline-none"
              disabled={isDeleting}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmationText !== 'HAPUS' || isDeleting}
              isLoading={isDeleting}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Ya, Hapus Akun
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default AccountPage;
