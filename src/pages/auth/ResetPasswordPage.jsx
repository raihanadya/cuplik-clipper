import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card.jsx';
import { authService } from '../../features/auth/authService.js';
import { ROUTES } from '../../constants/routes.js';
import { getPasswordValidationState } from '../../utils/validators.js';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const pwdState = getPasswordValidationState(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token reset tidak valid atau tidak ditemukan pada tautan.');
      return;
    }

    if (!pwdState.isValid) {
      setError('Kata sandi baru belum memenuhi standar keamanan.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ token, new_password: newPassword });
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Token reset telah kedaluwarsa atau tidak valid.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full border-[#B54A43]/30 bg-[#FFFFFF] shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B54A43]/10 text-[#B54A43] border border-[#B54A43]/30 mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold">Token Tidak Ditemukan</CardTitle>
          <CardDescription>
            Tautan reset kata sandi tidak memuat parameter token yang sah. Silakan minta tautan baru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to={ROUTES.FORGOT_PASSWORD}>
            <Button variant="primary" className="w-full">
              Kirim Ulang Permintaan Reset
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-[#DEDAD2] bg-[#FFFFFF] shadow-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">Reset Kata Sandi</CardTitle>
        <CardDescription>
          Masukkan kata sandi baru untuk akun Anda
        </CardDescription>
      </CardHeader>

      {isSuccess ? (
        <CardContent className="space-y-4 pt-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3F7D55]/10 text-[#3F7D55] border border-[#3F7D55]/30">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-[#242321]">Kata Sandi Diperbarui!</h3>
          <p className="text-xs text-[#6F6B63]">
            Kata sandi akun Anda telah berhasil diubah. Silakan masuk menggunakan kata sandi baru.
          </p>
          <div className="pt-3">
            <Link to={ROUTES.LOGIN}>
              <Button variant="primary" className="w-full">
                Masuk Sekarang <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            {error && (
              <div className="p-3 rounded-xl bg-[#B54A43]/10 border border-[#B54A43]/40 text-[#B54A43] text-xs">
                {error}
              </div>
            )}

            <Input
              label="Kata Sandi Baru"
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan kata sandi baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={Lock}
              disabled={isLoading}
              required
              autoComplete="new-password"
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#6F6B63] hover:text-[#242321] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <Input
              label="Konfirmasi Kata Sandi"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              disabled={isLoading}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 h-11 text-base shadow-sm"
              disabled={!pwdState.isValid || !confirmPassword}
              isLoading={isLoading}
            >
              Simpan Kata Sandi Baru
            </Button>
          </CardContent>
        </form>
      )}

      <CardFooter className="flex justify-center border-t border-[#DEDAD2] mt-6 pt-4 text-xs text-[#6F6B63]">
        <Link to={ROUTES.LOGIN} className="text-[#C65D3A] hover:text-[#A94B2D] transition-colors">
          Kembali ke Halaman Masuk
        </Link>
      </CardFooter>
    </Card>
  );
}

export default ResetPasswordPage;
