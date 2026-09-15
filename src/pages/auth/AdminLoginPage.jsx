import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { validateEmail } from '../../utils/validators.js';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Format email tidak valid.');
      return;
    }

    try {
      await login({ email, password, role: 'admin' });
      navigate(ROUTES.ADMIN, { replace: true });
    } catch (err) {
      setError(err.message || 'Gagal masuk sebagai administrator. Pastikan akun Anda memiliki hak akses admin.');
    }
  };

  return (
    <Card className="w-full border-[#A86F24]/30 bg-[#FFFFFF] shadow-xl">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#A86F24]/10 text-[#A86F24] border border-[#A86F24]/30">
          <Shield className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl font-bold">Konsol Administrator</CardTitle>
        <CardDescription>
          Akses khusus pemantauan telemetri worker, storage, dan kontrol akun
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-xl bg-[#B54A43]/10 border border-[#B54A43]/40 text-[#B54A43] text-xs leading-relaxed">
              {error}
            </div>
          )}

          <Input
            label="Email Administrator"
            type="email"
            placeholder="admin@cuplik.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            disabled={isLoading}
            required
            autoComplete="email"
          />

          <Input
            label="Kata Sandi Admin"
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan kata sandi admin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2 h-11 text-base shadow-sm"
            isLoading={isLoading}
          >
            Masuk Konsol Admin <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </form>

      <CardFooter className="flex justify-center border-t border-[#DEDAD2] mt-6 pt-4 text-xs text-[#6F6B63]">
        Bukan administrator?{' '}
        <Link to={ROUTES.LOGIN} className="ml-1.5 font-semibold text-[#C65D3A] hover:text-[#A94B2D]">
          Kembali ke Login Pengguna
        </Link>
      </CardFooter>
    </Card>
  );
}

export default AdminLoginPage;
