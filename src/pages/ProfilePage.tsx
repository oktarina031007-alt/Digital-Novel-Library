import React, { useState } from 'react';
import { 
  UserCircle2, 
  Mail, 
  LogOut, 
  Save, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  CloudCheck,
  ShieldCheck,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';

export const ProfilePage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user, logout, updateProfile } = useAuth();
  const { novels } = useLibrary();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCC] shadow-xs max-w-md mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-[#F2ECE4] text-[#8A5A36] flex items-center justify-center mx-auto mb-4">
          <UserCircle2 className="w-8 h-8" />
        </div>
        <h2 className="font-serif-title font-bold text-2xl text-[#2C221E] mb-2">
          Masuk ke Akunmu
        </h2>
        <p className="text-xs text-[#7A6756] mb-6">
          Masuk atau daftar untuk mengakses koleksi novel digital pribadimu di mana saja.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-2.5 px-4 bg-[#8A5A36] hover:bg-[#724828] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#8A5A36]/20 transition-all"
        >
          Masuk / Buat Akun
        </button>
      </div>
    );
  }

  // Reading metrics
  const totalCount = novels.length;
  const completedCount = novels.filter(n => n.status === 'completed').length;
  const readingCount = novels.filter(n => n.status === 'reading').length;
  const totalPagesRead = novels.reduce((acc, n) => acc + (n.currentPage || 0), 0);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        newPassword: newPassword.trim() ? newPassword.trim() : undefined,
      });
      setMessage('Profil berhasil diperbarui!');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui profil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF7F2] to-[#F2EAE0] p-6 sm:p-8 border border-[#E8DFD5] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative group">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
            alt={user.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md bg-[#EADBCC]"
          />
        </div>

        {/* User Details */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="font-serif-title font-bold text-2xl sm:text-3xl text-[#2C221E]">
              {user.name}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EADBCC] text-[#7A4E2D]">
              Anggota Aktif
            </span>
          </div>

          <p className="text-xs text-[#7A6756] flex items-center justify-center sm:justify-start gap-1.5 mb-3">
            <Mail className="w-3.5 h-3.5 text-[#8A5A36]" />
            <span>{user.email}</span>
          </p>

          <p className="text-xs text-[#5A4535] leading-relaxed max-w-xl font-serif">
            {user.bio || 'Pencinta novel dan buku digital di NovelBox.'}
          </p>

          {/* Cloud sync banner */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-[#E0D4C3] text-[11px] font-medium text-[#2E8B57]">
            <ShieldCheck className="w-4 h-4 text-[#2E8B57]" />
            <span>Tersinkronisasi ke Cloud Storage & Database</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FDF2F2] text-[#B9423D] hover:text-[#902A25] border border-[#EADBCC] hover:border-[#F8B4B4] text-xs font-semibold shadow-xs transition-colors self-center sm:self-start"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun</span>
        </button>
      </div>

      {/* Reading Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-[#EADBCC] shadow-xs">
          <p className="text-[11px] font-medium text-[#8C7A6B]">Total Buku Disimpan</p>
          <p className="font-serif-title font-bold text-2xl text-[#2C221E] mt-1">{totalCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#EADBCC] shadow-xs">
          <p className="text-[11px] font-medium text-[#8C7A6B]">Buku Selesai Dibaca</p>
          <p className="font-serif-title font-bold text-2xl text-[#247039] mt-1">{completedCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#EADBCC] shadow-xs">
          <p className="text-[11px] font-medium text-[#8C7A6B]">Sedang Dalam Bacaan</p>
          <p className="font-serif-title font-bold text-2xl text-[#8C620A] mt-1">{readingCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#EADBCC] shadow-xs">
          <p className="text-[11px] font-medium text-[#8C7A6B]">Total Halaman Ditelusuri</p>
          <p className="font-serif-title font-bold text-2xl text-[#8A5A36] mt-1">{totalPagesRead}</p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCC] shadow-xs">
        <h2 className="font-serif-title font-bold text-xl text-[#2C221E] mb-1">
          Ubah Informasi Profil
        </h2>
        <p className="text-xs text-[#7A6756] mb-6">
          Perbarui nama lengkap, bio, atau ubah kata sandi akunmu
        </p>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-[#DEF7EC] border border-[#BCF0DA] text-[#03543F] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#FDE8E8] border border-[#F8B4B4] text-[#9B1C1C] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Alamat Email (Tetap)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 bg-[#F2ECE4] border border-[#DDD0C0] rounded-xl text-sm text-[#7A6756] cursor-not-allowed opacity-80"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Bio Singkat</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan sedikit tentang minat bacamu..."
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] transition-all resize-none font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A4535] mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#8A5A36]" />
              Ubah Kata Sandi (Opsional)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kosongkan jika tidak ingin mengubah kata sandi"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] transition-all"
            />
          </div>

          <div className="pt-3 border-t border-[#F2ECE4] flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#8A5A36] hover:bg-[#724828] active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#8A5A36]/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
