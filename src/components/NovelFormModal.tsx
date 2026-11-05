import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  BookMarked, 
  Check, 
  Image as ImageIcon, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Novel, NovelGenre, NovelStatus } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { api } from '../api';

const GENRE_OPTIONS: NovelGenre[] = [
  'Romance',
  'Fantasy',
  'Horror',
  'Mystery',
  'Adventure',
  'Comedy',
  'Thriller',
  'Drama',
  'Lainnya',
];

const PRESET_COVERS = [
  { genre: 'Romance', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80', label: 'Vintage Romance' },
  { genre: 'Mystery', url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80', label: 'Classic Noir' },
  { genre: 'Adventure', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', label: 'Antique World' },
  { genre: 'Fantasy', url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80', label: 'Mystic Forest' },
  { genre: 'Horror', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', label: 'Gothic Castle' },
  { genre: 'Drama', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80', label: 'Old Library' },
];

export const NovelFormModal: React.FC = () => {
  const { isFormOpen, closeFormModal, novelToEdit, createNovel, updateNovel, setActiveTab } = useLibrary();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<NovelGenre>('Romance');
  const [synopsis, setSynopsis] = useState('');
  const [totalPages, setTotalPages] = useState<number>(200);
  const [status, setStatus] = useState<NovelStatus>('unread');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);

  // File states
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [fileType, setFileType] = useState<'pdf' | 'epub' | 'text'>('pdf');
  const [fileSizeStr, setFileSizeStr] = useState<string | undefined>(undefined);

  const [isUploading, setIsUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (novelToEdit) {
      setTitle(novelToEdit.title);
      setAuthor(novelToEdit.author);
      setGenre((novelToEdit.genre as NovelGenre) || 'Romance');
      setSynopsis(novelToEdit.synopsis || '');
      setTotalPages(novelToEdit.totalPages || 200);
      setStatus(novelToEdit.status || 'unread');
      setCoverUrl(novelToEdit.coverUrl || PRESET_COVERS[0].url);
      setFileUrl(novelToEdit.fileUrl);
      setFileName(novelToEdit.fileName);
      setFileType(novelToEdit.fileType || 'pdf');
      setFileSizeStr(undefined);
    } else {
      setTitle('');
      setAuthor('');
      setGenre('Romance');
      setSynopsis('');
      setTotalPages(200);
      setStatus('unread');
      setCoverUrl(PRESET_COVERS[0].url);
      setFileUrl(undefined);
      setFileName(undefined);
      setFileType('pdf');
      setFileSizeStr(undefined);
    }
    setError(null);
  }, [novelToEdit, isFormOpen]);

  if (!isFormOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'epub') {
      setError('Hanya berkas format PDF atau EPUB yang didukung.');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await api.uploadFile(file);
      setFileUrl(uploaded.url);
      setFileName(uploaded.originalName);
      setFileType(ext as 'pdf' | 'epub');
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFileSizeStr(`${sizeMB} MB`);

      // If user hasn't typed title yet, auto-fill from filename
      if (!title.trim()) {
        const guessedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(guessedTitle.charAt(0).toUpperCase() + guessedTitle.slice(1));
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah berkas novel.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCoverUploading(true);
    setError(null);
    try {
      const uploaded = await api.uploadFile(file);
      setCoverUrl(uploaded.url);
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah sampul buku.');
    } finally {
      setIsCoverUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError('Judul novel dan nama penulis wajib diisi.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload: Partial<Novel> = {
        title: title.trim(),
        author: author.trim(),
        genre,
        synopsis: synopsis.trim() || 'Belum ada sinopsis untuk novel ini.',
        totalPages: Math.max(1, totalPages),
        status,
        coverUrl,
        fileUrl,
        fileName,
        fileType,
      };

      if (novelToEdit) {
        await updateNovel(novelToEdit.id, payload);
      } else {
        await createNovel(payload);
        setActiveTab('collection');
      }
      closeFormModal();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan novel.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={closeFormModal}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8DFD5] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#F2ECE4] border-b border-[#E5DACD]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8A5A36] text-white flex items-center justify-center shadow-xs">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-xl text-[#2C221E]">
                {novelToEdit ? 'Edit Novel' : 'Tambah Novel Baru'}
              </h3>
              <p className="text-xs text-[#7A6756]">
                Simpan novel digitalmu ke penyimpanan cloud perpustakaan pribadi.
              </p>
            </div>
          </div>
          <button
            onClick={closeFormModal}
            className="p-1.5 rounded-full text-[#8C7A6B] hover:text-[#2C221E] hover:bg-[#EADBCC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-[#FDE8E8] border border-[#F8B4B4] text-[#9B1C1C] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">
                Judul Novel <span className="text-[#C24138]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Sang Pemimpi"
                className="w-full px-3.5 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] focus:ring-2 focus:ring-[#8A5A36]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">
                Nama Penulis <span className="text-[#C24138]">*</span>
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Contoh: Andrea Hirata"
                className="w-full px-3.5 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] focus:ring-2 focus:ring-[#8A5A36]/20 transition-all"
              />
            </div>
          </div>

          {/* Genre, Total Pages, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as NovelGenre)}
                className="w-full px-3 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] cursor-pointer"
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Total Halaman</label>
              <input
                type="number"
                min="1"
                max="5000"
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">Status Bacaan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NovelStatus)}
                className="w-full px-3 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] cursor-pointer"
              >
                <option value="unread">Belum Dibaca</option>
                <option value="reading">Sedang Dibaca</option>
                <option value="completed">Selesai Dibaca</option>
              </select>
            </div>
          </div>

          {/* File Upload Box (PDF / EPUB) */}
          <div className="p-4 rounded-2xl bg-[#F2ECE4] border border-[#E2D4C3]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#5A4535] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#8A5A36]" />
                Unggah File Novel (PDF / EPUB)
              </label>
              <span className="text-[11px] text-[#8C7A6B]">Tersimpan di Cloud</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.epub"
              onChange={handleFileUpload}
              className="hidden"
            />

            {fileUrl ? (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#D5C2AC]">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-[#EADBCC] text-[#7A4E2D] flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                    {fileType}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[#2C221E] truncate">
                      {fileName || 'Berkas Novel Terpilih'}
                    </p>
                    {fileSizeStr && (
                      <p className="text-[10px] text-[#8C7866]">{fileSizeStr}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2E8B57] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Siap
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#8A5A36] hover:underline font-medium"
                  >
                    Ganti
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D5C2AC] hover:border-[#8A5A36] rounded-xl p-5 text-center cursor-pointer transition-colors bg-white/60 hover:bg-white"
              >
                <Upload className="w-6 h-6 text-[#8A5A36] mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-[#3B291A]">
                  {isUploading ? 'Sedang Mengunggah...' : 'Klik untuk memilih berkas PDF atau EPUB'}
                </p>
                <p className="text-[11px] text-[#8C7866] mt-0.5">
                  Maksimal ukuran 50MB. File dapat dibaca langsung di browser kapan saja.
                </p>
              </div>
            )}
          </div>

          {/* Cover Selection (Custom upload or preset) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#5A4535] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#8A5A36]" />
                Sampul Novel (Cover)
              </label>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="text-xs text-[#8A5A36] hover:underline font-semibold flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Unggah Sampul Sendiri</span>
              </button>
              <input
                type="file"
                ref={coverInputRef}
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>

            {/* Preview & Preset Covers */}
            <div className="flex items-start gap-4">
              <div className="relative w-20 aspect-[3/4] rounded-xl overflow-hidden book-shadow flex-shrink-0 bg-[#E8DFD5] border-2 border-[#8A5A36]">
                <img
                  src={coverUrl}
                  alt="Preview Sampul"
                  className="w-full h-full object-cover"
                />
                {isCoverUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px]">
                    ...
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="text-[11px] text-[#8C7866] mb-1.5">Pilih dari preset sampul estetis:</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_COVERS.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setCoverUrl(preset.url)}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                        coverUrl === preset.url ? 'border-[#8A5A36] scale-105 shadow-md' : 'border-transparent hover:opacity-80'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      {coverUrl === preset.url && (
                        <div className="absolute inset-0 bg-[#8A5A36]/30 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-xs font-semibold text-[#5A4535] mb-1.5">
              Sinopsis / Catatan Buku
            </label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Tulis ringkasan singkat isi novel..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] focus:ring-2 focus:ring-[#8A5A36]/20 transition-all font-serif resize-none"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DFD5]">
            <button
              type="button"
              onClick={closeFormModal}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#7A634E] hover:bg-[#EFE8DC] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-6 py-2.5 rounded-xl bg-[#8A5A36] hover:bg-[#724828] active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-[#8A5A36]/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : novelToEdit ? 'Simpan Perubahan' : 'Tambahkan ke Rak'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
