import React from 'react';
import { Heart, BookOpen, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Novel } from '../types';
import { useLibrary } from '../context/LibraryContext';

interface BookCardProps {
  novel: Novel;
}

export const BookCard: React.FC<BookCardProps> = ({ novel }) => {
  const { setSelectedNovel, openReader, toggleFavorite } = useLibrary();

  const getStatusBadge = (status: Novel['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E3F2E6] text-[#247039] border border-[#C2E3C9]">
            <CheckCircle2 className="w-3 h-3" />
            Selesai Dibaca
          </span>
        );
      case 'reading':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3D6] text-[#8C620A] border border-[#F6E1A7]">
            <Clock className="w-3 h-3" />
            Sedang Dibaca
          </span>
        );
      case 'unread':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFE8DC] text-[#7A634E] border border-[#DECDBB]">
            Belum Dibaca
          </span>
        );
    }
  };

  const getFormatBadge = (type: Novel['fileType']) => {
    const isEpub = type === 'epub';
    return (
      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
        isEpub ? 'bg-[#5B3E2B] text-[#F5EFEB]' : 'bg-[#9C382A] text-white'
      }`}>
        {type.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="group relative bg-white rounded-2xl p-3.5 border border-[#EADBCC] hover:border-[#D5C2AC] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Cover image container with realistic book spine effect */}
        <div 
          onClick={() => setSelectedNovel(novel)}
          className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#EAE2D5] cursor-pointer mb-3 shadow-xs group-hover:scale-[1.01] transition-transform"
        >
          <img
            src={novel.coverUrl}
            alt={novel.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Book spine highlight gradient */}
          <div className="absolute inset-0 pointer-events-none book-spine-highlight" />

          {/* Top badges over cover */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            {getFormatBadge(novel.fileType)}
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(novel.id);
            }}
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
              novel.isFavorite
                ? 'bg-white/90 text-[#C24138] shadow-xs'
                : 'bg-black/30 hover:bg-black/50 text-white'
            }`}
            title={novel.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          >
            <Heart className={`w-4 h-4 ${novel.isFavorite ? 'fill-[#C24138]' : ''}`} />
          </button>

          {/* Quick Read Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openReader(novel);
              }}
              className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-white text-[#5A381E] text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{novel.currentPage > 0 ? 'Lanjutkan' : 'Mulai Baca'}</span>
            </button>
          </div>
        </div>

        {/* Status & Genre */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="text-[11px] font-medium text-[#8A5A36] uppercase tracking-wider">
            {novel.genre}
          </span>
          {getStatusBadge(novel.status)}
        </div>

        {/* Title & Author */}
        <h3
          onClick={() => setSelectedNovel(novel)}
          className="font-serif-title font-bold text-base text-[#2C221E] hover:text-[#8A5A36] line-clamp-1 cursor-pointer transition-colors"
          title={novel.title}
        >
          {novel.title}
        </h3>
        <p className="text-xs text-[#7A6756] line-clamp-1 mb-2 font-medium">
          {novel.author}
        </p>
      </div>

      {/* Progress & Footer info */}
      <div className="pt-2 border-t border-[#F2ECE4]">
        <div className="flex items-center justify-between text-[11px] text-[#8C7866] mb-1">
          <span>
            Hal {novel.currentPage} / {novel.totalPages}
          </span>
          <span className="font-semibold text-[#5A3F2A]">
            {novel.progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#EFE8DC] h-1.5 rounded-full overflow-hidden mb-2.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              novel.status === 'completed'
                ? 'bg-[#2E8B57]'
                : novel.progressPercent > 0
                ? 'bg-[#8A5A36]'
                : 'bg-transparent'
            }`}
            style={{ width: `${novel.progressPercent}%` }}
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openReader(novel)}
            className="flex-1 py-1.5 px-3 bg-[#FAF7F2] hover:bg-[#8A5A36] text-[#5A381E] hover:text-white border border-[#E0D3C2] hover:border-[#8A5A36] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{novel.currentPage > 0 ? 'Lanjutkan' : 'Baca'}</span>
          </button>
          <button
            onClick={() => setSelectedNovel(novel)}
            className="py-1.5 px-2.5 bg-[#FAF7F2] hover:bg-[#F2EBE1] text-[#7A634E] border border-[#E0D3C2] rounded-xl text-xs font-medium transition-colors"
            title="Lihat Detail Novel"
          >
            Detail
          </button>
        </div>
      </div>
    </div>
  );
};
