import React from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Bookmark, 
  Heart, 
  Search, 
  Plus, 
  ArrowRight, 
  Sparkles,
  Library,
  LayoutGrid
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { BookCard } from '../components/BookCard';
import { BookSpine } from '../components/BookSpine';

export const HomePage: React.FC = () => {
  const { 
    novels, 
    setActiveTab, 
    openCreateModal, 
    openReader, 
    setSelectedNovel,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode 
  } = useLibrary();
  const { user } = useAuth();

  // Stats
  const totalCount = novels.length;
  const readingCount = novels.filter(n => n.status === 'reading').length;
  const completedCount = novels.filter(n => n.status === 'completed').length;
  const unreadCount = novels.filter(n => n.status === 'unread').length;

  // Novel Terakhir Dibaca
  const lastReadNovel = novels
    .filter(n => n.lastReadAt || n.currentPage > 0)
    .sort((a, b) => {
      const timeA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
      const timeB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
      return timeB - timeA;
    })[0] || novels[0];

  // Novel Favorit
  const favoriteNovels = novels.filter(n => n.isFavorite);

  // Time-based warm greeting in Indonesian
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Pembaca';

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Greeting & Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5C3D24] via-[#754E2E] to-[#8C603A] text-white p-6 sm:p-10 shadow-lg">
        {/* Background ambient accents */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-[#F7EFE6] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#E6C9A8]" />
            <span>Perpustakaan Digital Pribadi</span>
          </div>

          <h1 className="font-serif-title font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight mb-2">
            {getGreeting()}, {userName}.
          </h1>
          <p className="text-sm sm:text-base text-[#EADCCE] font-light max-w-xl leading-relaxed mb-6">
            Seluruh koleksi novel kesayanganmu tersimpan aman dalam satu tempat. Lanjutkan membaca petualanganmu hari ini.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-white text-[#5A381E] text-sm font-bold shadow-md hover:scale-102 active:scale-98 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Novel Baru</span>
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <span>Buka Koleksi Saya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Statistical Cards (Jumlah Seluruh, Sedang Dibaca, Selesai Dibaca, Belum Dibaca) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Koleksi */}
        <div 
          onClick={() => setActiveTab('collection')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EADBCC] hover:border-[#C4A882] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EADBCC] text-[#7A4E2D] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#8C7A6B] font-medium">Seluruh Koleksi</p>
          <p className="font-serif-title font-bold text-2xl sm:text-3xl text-[#2C221E] mt-0.5">
            {totalCount} <span className="text-xs font-sans font-normal text-[#8C7A6B]">buku</span>
          </p>
        </div>

        {/* Sedang Dibaca */}
        <div 
          onClick={() => {
            setActiveTab('collection');
          }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EADBCC] hover:border-[#C4A882] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FEF3D6] text-[#8C620A] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#8C7A6B] font-medium">Sedang Dibaca</p>
          <p className="font-serif-title font-bold text-2xl sm:text-3xl text-[#8C620A] mt-0.5">
            {readingCount} <span className="text-xs font-sans font-normal text-[#8C7A6B]">buku</span>
          </p>
        </div>

        {/* Selesai Dibaca */}
        <div 
          onClick={() => setActiveTab('collection')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EADBCC] hover:border-[#C4A882] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E3F2E6] text-[#247039] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#8C7A6B] font-medium">Selesai Dibaca</p>
          <p className="font-serif-title font-bold text-2xl sm:text-3xl text-[#247039] mt-0.5">
            {completedCount} <span className="text-xs font-sans font-normal text-[#8C7A6B]">buku</span>
          </p>
        </div>

        {/* Belum Dibaca */}
        <div 
          onClick={() => setActiveTab('collection')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EADBCC] hover:border-[#C4A882] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F0EBE3] text-[#7A634E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Bookmark className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#8C7A6B] font-medium">Belum Dibaca</p>
          <p className="font-serif-title font-bold text-2xl sm:text-3xl text-[#5A4535] mt-0.5">
            {unreadCount} <span className="text-xs font-sans font-normal text-[#8C7A6B]">buku</span>
          </p>
        </div>
      </section>

      {/* 3. Novel Terakhir Dibaca (Spotlight Hero) */}
      {lastReadNovel && (
        <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EADBCC] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8A5A36]" />
              <h2 className="font-serif-title font-bold text-lg sm:text-xl text-[#2C221E]">
                Terakhir Kamu Baca
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-[#8A5A36] hover:underline flex items-center gap-1"
            >
              Lihat Riwayat Lengkap →
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#EDE2D4]">
            {/* Book Cover */}
            <div 
              onClick={() => setSelectedNovel(lastReadNovel)}
              className="relative w-36 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden book-shadow flex-shrink-0 cursor-pointer group bg-[#E8DFD5]"
            >
              <img
                src={lastReadNovel.coverUrl}
                alt={lastReadNovel.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 pointer-events-none book-spine-highlight" />
            </div>

            {/* Info and Progress */}
            <div className="flex-1 flex flex-col justify-between w-full">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EADBCC] text-[#7A4E2D]">
                    {lastReadNovel.genre}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#8C7A6B]">
                    Format: {lastReadNovel.fileType}
                  </span>
                </div>

                <h3 
                  onClick={() => setSelectedNovel(lastReadNovel)}
                  className="font-serif-title font-bold text-xl sm:text-2xl text-[#2C221E] hover:text-[#8A5A36] cursor-pointer transition-colors"
                >
                  {lastReadNovel.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#7A6756] mb-3">
                  Penulis: <span className="font-semibold text-[#3B291A]">{lastReadNovel.author}</span>
                </p>

                <p className="text-xs text-[#5A4535] line-clamp-2 sm:line-clamp-3 mb-4 font-serif leading-relaxed">
                  {lastReadNovel.synopsis}
                </p>
              </div>

              {/* Progress & Actions */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#5A4535]">
                    Halaman {lastReadNovel.currentPage} dari {lastReadNovel.totalPages}
                  </span>
                  <span className="font-bold text-[#8A5A36]">
                    {lastReadNovel.progressPercent}% Selesai
                  </span>
                </div>

                <div className="w-full bg-[#E8DFD5] h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-[#8A5A36] h-full rounded-full transition-all duration-500"
                    style={{ width: `${lastReadNovel.progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openReader(lastReadNovel)}
                    className="px-5 py-2.5 bg-[#8A5A36] hover:bg-[#724828] active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-[#8A5A36]/20 flex items-center gap-2 transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Lanjutkan Membaca</span>
                  </button>
                  <button
                    onClick={() => setSelectedNovel(lastReadNovel)}
                    className="px-4 py-2.5 bg-white hover:bg-[#F2ECE4] border border-[#DDD0C0] text-[#5A4535] rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                  >
                    Detail Novel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Digital Bookshelf OR Card Grid Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-[#8A5A36]" />
            <h2 className="font-serif-title font-bold text-xl text-[#2C221E]">
              Rak Buku Perpustakaan
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#EFE8DC] p-1 rounded-xl border border-[#E0D4C3]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#5A381E] shadow-xs'
                    : 'text-[#85705F] hover:text-[#2C221E]'
                }`}
                title="Tampilan Grid Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Kartu</span>
              </button>
              <button
                onClick={() => setViewMode('shelf')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'shelf'
                    ? 'bg-white text-[#5A381E] shadow-xs'
                    : 'text-[#85705F] hover:text-[#2C221E]'
                }`}
                title="Tampilan Rak Buku Kayu"
              >
                <Library className="w-4 h-4" />
                <span className="hidden sm:inline">Rak Kayu</span>
              </button>
            </div>

            <button
              onClick={() => setActiveTab('collection')}
              className="text-xs font-semibold text-[#8A5A36] hover:underline ml-2"
            >
              Lihat Semua ({novels.length}) →
            </button>
          </div>
        </div>

        {/* SHELF VIEW */}
        {viewMode === 'shelf' ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F4EFEA] border border-[#E4D8C8] shadow-inner space-y-6">
            <div className="flex items-end justify-start gap-4 sm:gap-6 overflow-x-auto pb-2 pt-4 px-2">
              {novels.map((novel) => (
                <BookSpine key={novel.id} novel={novel} />
              ))}
            </div>
            {/* Realistic wooden shelf board */}
            <div className="wooden-shelf h-5 rounded-md -mt-2" />
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {novels.slice(0, 8).map((novel) => (
              <BookCard key={novel.id} novel={novel} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Novel Favorit Section */}
      {favoriteNovels.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#C24138] fill-[#C24138]" />
              <h2 className="font-serif-title font-bold text-xl text-[#2C221E]">
                Novel Favoritmu
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('favorites')}
              className="text-xs font-semibold text-[#8A5A36] hover:underline"
            >
              Buka Semua Favorit ({favoriteNovels.length}) →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {favoriteNovels.slice(0, 4).map((novel) => (
              <BookCard key={novel.id} novel={novel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
