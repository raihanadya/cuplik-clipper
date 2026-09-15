import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card.jsx';
import { authService } from '../../features/auth/authService.js';
import { ROUTES } from '../../constants/routes.js';
import { validateEmail } from '../../utils/validators.js';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !validateEmail(email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword({ email });
      setSubmittedMessage(
        res?.message ||
          'Tautan pemulihan kata sandi telah dikirimkan ke email Anda jika terdaftar pada sistem kami.'
      );
    } catch (err) {
      setError(err.message || 'Gagal memproses permintaan reset kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-[#DEDAD2] bg-[#FFFFFF] shadow-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">Lupa Kata Sandi</CardTitle>
        <CardDescription>
          Masukkan email Anda untuk menerima instruksi reset kata sandi
        </CardDescription>
      </CardHeader>

      {submittedMessage ? (
        <CardContent className="space-y-4 pt-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3F7D55]/10 text-[#3F7D55] border border-[#3F7D55]/30">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm text-[#242321] leading-relaxed font-medium">
            {submittedMessage}
          </p>
          <p className="text-xs text-[#6F6B63]">
            Periksa kotak masuk atau folder spam Anda. Tautan token reset berlaku selama 15 menit.
          </p>
          <div className="pt-2">
            <Link to={ROUTES.LOGIN}>
              <Button variant="secondary" className="w-full">
                Kembali ke Halaman Masuk
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
              label="Alamat Email Terdaftar"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              disabled={isLoading}
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 h-11 text-base shadow-sm"
              isLoading={isLoading}
            >
              Kirim Tautan Reset
            </Button>
          </CardContent>
        </form>
      )}

      <CardFooter className="flex justify-center border-t border-[#DEDAD2] mt-6 pt-4 text-xs text-[#6F6B63]">
        <Link to={ROUTES.LOGIN} className="flex items-center gap-1.5 hover:text-[#242321] text-[#C65D3A] transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke halaman Masuk
        </Link>
      </CardFooter>
    </Card>
  );
}

export default ForgotPasswordPage;
