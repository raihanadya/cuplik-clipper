import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, X as XIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { validateEmail, getPasswordValidationState } from '../../utils/validators.js';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const pwdState = getPasswordValidationState(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateEmail(email)) {
      setServerError('Format email tidak valid.');
      return;
    }

    if (!pwdState.isValid) {
      setServerError('Kata sandi belum memenuhi seluruh syarat keamanan di bawah.');
      return;
    }

    try {
      await register({ email, password });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Pendaftaran gagal. Email mungkin sudah terdaftar.');
    }
  };

  return (
    <Card className="w-full border-[#DEDAD2] bg-[#FFFFFF] shadow-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">Daftar Akun Cuplik</CardTitle>
        <CardDescription>
          Mulai otomasi klip vertikal untuk rekaman webinar Anda
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-2">
          {serverError && (
            <div className="p-3 rounded-xl bg-[#B54A43]/10 border border-[#B54A43]/40 text-[#B54A43] text-xs">
              {serverError}
            </div>
          )}

          <Input
            label="Alamat Email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            disabled={isLoading}
            required
            autoComplete="email"
          />

          <Input
            label="Kata Sandi Baru"
            type={showPassword ? 'text' : 'password'}
            placeholder="Buat kata sandi aman"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            disabled={isLoading}
            required
            autoComplete="new-password"
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#6F6B63] hover:text-[#242321] transition-colors"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          {/* Proactive Password Rules Indicator */}
          <div className="p-3 rounded-xl bg-[#FCFBF8] border border-[#DEDAD2] space-y-1.5 text-xs">
            <p className="font-semibold text-[#242321] text-[11px] uppercase tracking-wider mb-2">
              Syarat Keamanan Kata Sandi:
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className={clsx('flex items-center gap-1.5', pwdState.length ? 'text-[#3F7D55]' : 'text-[#969189]')}>
                {pwdState.length ? <Check className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                <span>Minimal 8 karakter</span>
              </div>
              <div className={clsx('flex items-center gap-1.5', pwdState.upper ? 'text-[#3F7D55]' : 'text-[#969189]')}>
                {pwdState.upper ? <Check className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                <span>Huruf besar (A-Z)</span>
              </div>
              <div className={clsx('flex items-center gap-1.5', pwdState.lower ? 'text-[#3F7D55]' : 'text-[#969189]')}>
                {pwdState.lower ? <Check className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                <span>Huruf kecil (a-z)</span>
              </div>
              <div className={clsx('flex items-center gap-1.5', pwdState.digit ? 'text-[#3F7D55]' : 'text-[#969189]')}>
                {pwdState.digit ? <Check className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                <span>Angka (0-9)</span>
              </div>
              <div className={clsx('flex items-center gap-1.5 col-span-2', pwdState.symbol ? 'text-[#3F7D55]' : 'text-[#969189]')}>
                {pwdState.symbol ? <Check className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                <span>Karakter simbol (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2 h-11 text-base shadow-sm"
            disabled={!pwdState.isValid || !email}
            isLoading={isLoading}
          >
            Daftar & Mulai Cuplik <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </form>

      <CardFooter className="flex justify-center border-t border-[#DEDAD2] mt-6 pt-4 text-xs text-[#6F6B63]">
        Sudah memiliki akun?{' '}
        <Link to={ROUTES.LOGIN} className="ml-1.5 font-semibold text-[#C65D3A] hover:text-[#A94B2D]">
          Masuk di Sini
        </Link>
      </CardFooter>
    </Card>
  );
}

export default RegisterPage;
