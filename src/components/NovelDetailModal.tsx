import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Download, 
  Calendar,
  Layers,
  FileCode2,
  AlertTriangle,
  Home,
  ArrowLeft
} from 'lucide-react';
import { Novel, NovelStatus } from '../types';
import { useLibrary } from '../context/LibraryContext';

export const NovelDetailModal: React.FC = () => {
  const { 
    selectedNovel, 
    setSelectedNovel, 
    openReader, 
    toggleFavorite, 
    openEditModal, 
    deleteNovel,
    changeNovelStatus,
    setActiveTab 
  } = useLibrary();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!selectedNovel) return null;

  const handleClose = () => {
    setSelectedNovel(null);
    setShowConfirmDelete(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNovel(selectedNovel.id);
      handleClose();
    } catch (err) {
      alert('Gagal menghapus novel.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as NovelStatus;
    await changeNovelStatus(selectedNovel.id, newStatus);
  };

  const formattedDate = (dateStr?: string) => {
    if (!dateStr) return 'Belum pernah dibaca';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8DFD5] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Bar: Pilih Novel Lain, Ke Beranda, and Close */}
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleClose();
                setActiveTab('collection');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFE8DC] hover:bg-[#E5D7C5] text-[#5A381E] text-xs font-semibold transition-colors shadow-2xs"
              title="Kembali ke Pilihan Novel Lain"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Pilihan Novel Lain</span>
            </button>
            <button
              onClick={() => {
                handleClose();
                setActiveTab('home');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#DDD0C0] text-[#5A381E] text-xs font-semibold transition-colors shadow-2xs"
              title="Kembali ke Beranda"
            >
              <Home className="w-3.5 h-3.5 text-[#8A5A36]" />
              <span className="hidden sm:inline">Ke Beranda</span>
            </button>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-[#6B5747] hover:text-[#2C221E] shadow-sm transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 pt-3 sm:pt-4">
          {/* Left Column: Book Cover & Badges */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden book-shadow bg-[#EAE2D5] group mb-4">
              <img
                src={selectedNovel.coverUrl}
                alt={selectedNovel.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="absolute inset-0 pointer-events-none book-spine-highlight" />

              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                {selectedNovel.fileType}
              </span>
            </div>

            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(selectedNovel.id)}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all ${
                selectedNovel.isFavorite
                  ? 'bg-[#FDF2F2] border-[#F8B4B4] text-[#C24138]'
                  : 'bg-white border-[#E0D4C3] text-[#6B5747] hover:bg-[#F4ECE2]'
              }`}
            >
              <Heart className={`w-4 h-4 ${selectedNovel.isFavorite ? 'fill-[#C24138]' : ''}`} />
              <span>{selectedNovel.isFavorite ? 'Tersimpan di Favorit' : 'Tambahkan ke Favorit'}</span>
            </button>

            {/* Download File if available */}
            {selectedNovel.fileUrl && (
              <a
                href={selectedNovel.fileUrl}
                download={selectedNovel.fileName || `${selectedNovel.title}.${selectedNovel.fileType}`}
                target="_blank"
                rel="noreferrer"
                className="w-full mt-2 py-2 px-4 rounded-xl text-xs font-medium text-[#7A634E] bg-[#EFE8DC] hover:bg-[#E5DBCB] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas ({selectedNovel.fileType.toUpperCase()})</span>
              </a>
            )}
          </div>

          {/* Right Column: Book Details & Actions */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              {/* Genre badge & Status badge */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EADBCC] text-[#7A4E2D]">
                  {selectedNovel.genre}
                </span>

                <select
                  value={selectedNovel.status}
                  onChange={handleStatusChange}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-[#D5C2AC] text-[#5A3F2A] focus:outline-none focus:ring-1 focus:ring-[#8A5A36] cursor-pointer"
                >
                  <option value="unread">Belum Dibaca</option>
                  <option value="reading">Sedang Dibaca</option>
                  <option value="completed">Selesai Dibaca</option>
                </select>
              </div>

              {/* Title & Author */}
              <h2 className="font-serif-title font-bold text-2xl sm:text-3xl text-[#2C221E] leading-tight mb-1">
                {selectedNovel.title}
              </h2>
              <p className="text-sm font-medium text-[#7A6756] mb-4">
                Penulis: <span className="text-[#3B291A] font-semibold">{selectedNovel.author}</span>
              </p>

              {/* Reading Progress Card */}
              <div className="p-3.5 rounded-2xl bg-[#F2ECE4] border border-[#E4D7C7] mb-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#5A4535] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#8A5A36]" />
                    Progres Membaca
                  </span>
                  <span className="font-bold text-[#8A5A36]">
                    Halaman {selectedNovel.currentPage} dari {selectedNovel.totalPages} ({selectedNovel.progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-[#E0D3C1] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#8A5A36] h-full rounded-full transition-all duration-300"
                    style={{ width: `${selectedNovel.progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#8C7A6B] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Terakhir dibaca: {formattedDate(selectedNovel.lastReadAt)}
                </p>
              </div>

              {/* Synopsis */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E8B7A] mb-1.5">
                  Sinopsis
                </h4>
                <div className="text-sm text-[#4A3B2F] leading-relaxed max-h-36 overflow-y-auto pr-2 font-serif text-justify">
                  {selectedNovel.synopsis}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div>
              {/* Primary Action Button: Baca Sekarang */}
              <button
                onClick={() => openReader(selectedNovel)}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#8A5A36] hover:bg-[#724828] active:scale-[0.99] text-[#FAF7F2] font-semibold text-base shadow-lg shadow-[#8A5A36]/25 flex items-center justify-center gap-2 transition-all mb-3"
              >
                <BookOpen className="w-5 h-5 stroke-[2.3]" />
                <span>
                  {selectedNovel.currentPage > 0 ? 'Lanjutkan Membaca' : 'Baca Sekarang'}
                </span>
              </button>

              {/* Edit and Delete Row */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E8DFD5]">
                <button
                  onClick={() => {
                    handleClose();
                    openEditModal(selectedNovel);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#6E5642] hover:text-[#2C221E] px-3 py-1.5 rounded-lg hover:bg-[#EFE8DC] transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Data Novel</span>
                </button>

                {!showConfirmDelete ? (
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#B9423D] hover:text-[#902A25] px-3 py-1.5 rounded-lg hover:bg-[#FDE8E8] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Novel</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-[#FDE8E8] p-1.5 rounded-xl border border-[#F8B4B4]">
                    <span className="text-[11px] text-[#9B1C1C] font-medium px-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Yakin hapus?
                    </span>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-2 py-0.5 bg-[#C24138] hover:bg-[#9E2A22] text-white text-[11px] font-bold rounded-md transition-colors"
                    >
                      {isDeleting ? '...' : 'Ya'}
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-2 py-0.5 bg-white text-[#555] text-[11px] font-medium rounded-md hover:bg-gray-100"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
