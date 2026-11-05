import React from 'react';
import { History, BookOpen, Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export const HistoryPage: React.FC = () => {
  const { novels, openReader, setSelectedNovel, setActiveTab } = useLibrary();

  // Filter novels that have been opened or read, sorted by lastReadAt descending
  const historyList = novels
    .filter(n => n.lastReadAt || n.currentPage > 0)
    .sort((a, b) => {
      const timeA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
      const timeB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
      return timeB - timeA;
    });

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return 'Belum pernah dibaca';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 2) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} menit yang lalu`;
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari yang lalu`;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <History className="w-6 h-6 text-[#8A5A36]" />
          <h1 className="font-serif-title font-bold text-2xl sm:text-3xl text-[#2C221E]">
            Riwayat Bacaan
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#7A6756]">
          Catatan jejak aktivitas membaca novelmu di semua perangkat
        </p>
      </div>

      {historyList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCC] shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F2ECE4] text-[#8A5A36] flex items-center justify-center mx-auto mb-3">
            <Clock className="w-8 h-8 opacity-75" />
          </div>
          <h3 className="font-serif-title font-bold text-xl text-[#2C221E] mb-1">
            Belum ada riwayat bacaan
          </h3>
          <p className="text-xs sm:text-sm text-[#7A6756] max-w-sm mx-auto mb-6">
            Buka salah satu novel dari rak bukumu untuk mulai mencatat riwayat halaman terakhir yang dibaca.
          </p>
          <button
            onClick={() => setActiveTab('collection')}
            className="px-5 py-2.5 bg-[#8A5A36] hover:bg-[#724828] text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
          >
            Pilih Novel untuk Dibaca
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {historyList.map((novel, index) => (
            <div
              key={novel.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EADBCC] hover:border-[#D5C2AC] shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Index badge */}
                <span className="hidden sm:inline-block w-6 text-center text-xs font-bold text-[#A89685]">
                  #{index + 1}
                </span>

                {/* Cover Thumbnail */}
                <div
                  onClick={() => setSelectedNovel(novel)}
                  className="w-14 sm:w-16 aspect-[3/4] rounded-xl overflow-hidden book-shadow flex-shrink-0 cursor-pointer group bg-[#E8DFD5]"
                >
                  <img
                    src={novel.coverUrl}
                    alt={novel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EADBCC] text-[#7A4E2D]">
                      {novel.genre}
                    </span>
                    <span className="text-xs text-[#8C7A6B] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(novel.lastReadAt)}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedNovel(novel)}
                    className="font-serif-title font-bold text-base sm:text-lg text-[#2C221E] hover:text-[#8A5A36] cursor-pointer truncate"
                  >
                    {novel.title}
                  </h3>
                  <p className="text-xs text-[#7A6756] truncate">
                    Oleh {novel.author}
                  </p>
                </div>
              </div>

              {/* Progress & Quick Continue button */}
              <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F2ECE4]">
                <div className="text-left sm:text-right">
                  <p className="text-xs font-semibold text-[#5A4535]">
                    Halaman {novel.currentPage} / {novel.totalPages}
                  </p>
                  <div className="w-28 sm:w-32 bg-[#EFE8DC] h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${
                        novel.status === 'completed' ? 'bg-[#2E8B57]' : 'bg-[#8A5A36]'
                      }`}
                      style={{ width: `${novel.progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#8C7A6B] mt-0.5">
                    {novel.progressPercent}% terselesaikan
                  </p>
                </div>

                <button
                  onClick={() => openReader(novel)}
                  className="px-4 py-2 bg-[#8A5A36] hover:bg-[#724828] active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all flex-shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lanjutkan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
