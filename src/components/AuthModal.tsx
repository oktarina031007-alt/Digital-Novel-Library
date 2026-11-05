import React, { useState } from 'react';
import { BookOpen, X, KeyRound, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register, loginDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(defaultMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setVerificationCode('');
    setNewPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await login(email, password);
      onClose();
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password);
      onClose();
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registrasi gagal. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setSuccessMessage(`Kode pemulihan: ${res.verificationCode}`);
      setVerificationCode(res.verificationCode);
      setMode('reset');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengirim kode pemulihan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal 6 karakter.');
      return;
    }
    setIsLoading(true);
    try {
      await api.resetPassword({
        email,
        verificationCode,
        newPassword
      });
      setSuccessMessage('Kata sandi berhasil diperbarui! Silakan masuk.');
      setMode('login');
      setPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengatur ulang kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await loginDemo();
      onClose();
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk akun demo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E5DACD] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warm aesthetic */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-[#F2EAE0] to-[#FAF7F2] border-b border-[#EDE3D6]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-[#9C8877] hover:text-[#3B291A] hover:bg-[#EADBCC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#8A5A36] to-[#603D22] flex items-center justify-center text-white shadow-md shadow-[#8A5A36]/25 mb-3">
            <BookOpen className="w-6 h-6 text-[#F9F5F0]" />
          </div>

          <h2 className="text-center font-serif-title text-2xl font-bold text-[#2C221E]">
            {mode === 'login' && 'Masuk ke NovelBox'}
            {mode === 'register' && 'Buka Perpustakaanmu'}
            {mode === 'forgot' && 'Pemulihan Kata Sandi'}
            {mode === 'reset' && 'Atur Kata Sandi Baru'}
          </h2>
          <p className="text-center text-xs text-[#8A7665] mt-1">
            {mode === 'login' && 'Lanjutkan membaca novel favoritmu dari mana saja.'}
            {mode === 'register' && 'Simpan dan kelola seluruh koleksi novel digitalmu.'}
            {mode === 'forgot' && 'Masukkan email terdaftar untuk menerima kode verifikasi.'}
            {mode === 'reset' && 'Masukkan kode verifikasi dan tentukan kata sandi baru.'}
          </p>
        </div>

        {/* Content body */}
        <div className="p-6">
          {/* Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-[#FDE8E8] border border-[#F8B4B4] text-[#9B1C1C] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-[#DEF7EC] border border-[#BCF0DA] text-[#03543F] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Alamat Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9C8877] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] focus:ring-2 focus:ring-[#8A5A36]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-[#5A4535]">Kata Sandi</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                    }}
                    className="text-xs text-[#8A5A36] hover:underline"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9C8877] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] focus:ring-2 focus:ring-[#8A5A36]/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#8A5A36] hover:bg-[#744929] active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#8A5A36]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? 'Sedang Memproses...' : 'Masuk Sekarang'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9C8877] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Aurelia Santoso"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] focus:ring-2 focus:ring-[#8A5A36]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Alamat Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9C8877] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] focus:ring-2 focus:ring-[#8A5A36]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9C8877] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] focus:ring-2 focus:ring-[#8A5A36]/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#8A5A36] hover:bg-[#744929] active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#8A5A36]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Mendaftarkan...' : 'Buat Akun NovelBox'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form: FORGOT */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Email Akun</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9C8877] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] focus:ring-2 focus:ring-[#8A5A36]/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#8A5A36] hover:bg-[#744929] text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? 'Mengirim...' : 'Kirim Kode Verifikasi'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-[#8A5A36] hover:underline mt-2"
              >
                ← Kembali ke Halaman Masuk
              </button>
            </form>
          )}

          {/* Form: RESET */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Kode Verifikasi (6 Angka)</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#9C8877] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Contoh: 123456"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] tracking-widest font-mono text-center focus:outline-none focus:border-[#8A5A36] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9C8877] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#8A5A36] hover:bg-[#744929] text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
              </button>
            </form>
          )}

          {/* 1-Click Demo Login Button (Only in login/register mode) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="mt-5 pt-4 border-t border-[#E8DFD5] space-y-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2 px-3 bg-[#EFE5D8] hover:bg-[#E5D7C5] text-[#5A381E] border border-[#D5C2AC] rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>⚡ Masuk Akun Demo (Aurelia Santoso)</span>
              </button>

              <div className="text-center text-xs text-[#7A6756]">
                {mode === 'login' ? (
                  <p>
                    Belum punya akun?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setErrorMessage(null);
                      }}
                      className="font-bold text-[#8A5A36] hover:underline"
                    >
                      Daftar Sekarang
                    </button>
                  </p>
                ) : (
                  <p>
                    Sudah punya akun?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMessage(null);
                      }}
                      className="font-bold text-[#8A5A36] hover:underline"
                    >
                      Masuk di Sini
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
