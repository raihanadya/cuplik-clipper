import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card.jsx';
import { InlineFieldError } from '../../components/feedback/InlineFieldError.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { validateEmail } from '../../utils/validators.js';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errors = {};

    if (!email) {
      errors.email = 'Email wajib diisi.';
    } else if (!validateEmail(email)) {
      errors.email = 'Format email tidak valid.';
    }

    if (!password) {
      errors.password = 'Kata sandi wajib diisi.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      await login({ email, password, role: 'user' });
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Gagal masuk. Periksa email dan kata sandi Anda.');
    }
  };

  return (
    <Card className="w-full border-[#DEDAD2] bg-[#FFFFFF] shadow-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">Masuk ke Akun</CardTitle>
        <CardDescription>
          Akses riwayat proyek dan mulai proses klip video baru
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
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
            }}
            error={fieldErrors.email}
            icon={Mail}
            disabled={isLoading}
            required
            autoComplete="email"
          />

          <div className="space-y-1">
            <Input
              label="Kata Sandi"
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
              }}
              error={fieldErrors.password}
              icon={Lock}
              disabled={isLoading}
              required
              autoComplete="current-password"
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
            <div className="flex justify-end pt-1">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-xs text-[#C65D3A] hover:text-[#A94B2D] transition-colors"
              >
                Lupa kata sandi?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2 h-11 text-base shadow-sm"
            isLoading={isLoading}
          >
            Masuk Sekarang <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </form>

      <CardFooter className="flex justify-center border-t border-[#DEDAD2] mt-6 pt-4 text-xs text-[#6F6B63]">
        Belum memiliki akun?{' '}
        <Link to={ROUTES.REGISTER} className="ml-1.5 font-semibold text-[#C65D3A] hover:text-[#A94B2D]">
          Daftar Gratis
        </Link>
      </CardFooter>
    </Card>
  );
}

export default LoginPage;
