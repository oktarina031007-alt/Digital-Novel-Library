import React, { useState, useMemo } from 'react';
import { 
  BookMarked, 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  LayoutGrid, 
  Library, 
  BookOpen,
  X
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { NovelGenre, NovelStatus } from '../types';
import { BookCard } from '../components/BookCard';
import { BookSpine } from '../components/BookSpine';

const GENRES: (NovelGenre | 'All')[] = [
  'All',
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

export const CollectionPage: React.FC = () => {
  const { 
    novels, 
    openCreateModal, 
    searchQuery, 
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    viewMode,
    setViewMode 
  } = useLibrary();

  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'author' | 'progress'>('recent');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'epub'>('all');

  // Filter and sort novels
  const filteredNovels = useMemo(() => {
    let result = [...novels];

    // Search query (title, author, genre, synopsis)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          n.author.toLowerCase().includes(q) ||
          n.genre.toLowerCase().includes(q) ||
          n.synopsis.toLowerCase().includes(q)
      );
    }

    // Genre filter
    if (selectedCategory !== 'All') {
      result = result.filter(n => n.genre.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter(n => n.status === selectedStatus);
    }

    // Format filter
    if (formatFilter !== 'all') {
      result = result.filter(n => n.fileType === formatFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        const timeA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : new Date(a.updatedAt).getTime();
        const timeB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : new Date(b.updatedAt).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'author') {
        return a.author.localeCompare(b.author);
      }
      if (sortBy === 'progress') {
        return b.progressPercent - a.progressPercent;
      }
      return 0;
    });

    return result;
  }, [novels, searchQuery, selectedCategory, selectedStatus, formatFilter, sortBy]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedStatus !== 'all' || formatFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('all');
    setFormatFilter('all');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookMarked className="w-6 h-6 text-[#8A5A36]" />
            <h1 className="font-serif-title font-bold text-2xl sm:text-3xl text-[#2C221E]">
              Koleksi Saya
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#7A6756]">
            Menampilkan {filteredNovels.length} dari {novels.length} novel di perpustakaanmu
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-[#EFE8DC] p-1 rounded-xl border border-[#E0D4C3]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
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
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'shelf'
                  ? 'bg-white text-[#5A381E] shadow-xs'
                  : 'text-[#85705F] hover:text-[#2C221E]'
              }`}
              title="Tampilan Rak Kayu Digital"
            >
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">Rak Kayu</span>
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8A5A36] hover:bg-[#724828] active:scale-[0.99] text-white text-sm font-semibold shadow-md shadow-[#8A5A36]/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Novel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#EADBCC] shadow-xs space-y-3.5">
        {/* Search input + Sort row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#9D8876] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul, penulis, atau genre..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9D8876] hover:text-[#2C221E]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort By selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[#8C7A6B] font-medium whitespace-nowrap hidden sm:inline">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto text-xs font-semibold px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD0C0] text-[#5A3F2A] focus:outline-none focus:border-[#8A5A36] cursor-pointer"
            >
              <option value="recent">Terakhir Dibaca / Diperbarui</option>
              <option value="title">Judul (A - Z)</option>
              <option value="author">Penulis (A - Z)</option>
              <option value="progress">Progres Membaca Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Filter Badges: Status & Format */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F5EFEB]">
          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#8C7A6B] mr-1 font-medium">Status:</span>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'reading', label: 'Sedang Dibaca' },
              { id: 'completed', label: 'Selesai' },
              { id: 'unread', label: 'Belum Dibaca' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id as any)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                  selectedStatus === st.id
                    ? 'bg-[#8A5A36] text-white shadow-xs font-semibold'
                    : 'bg-[#F2ECE4] text-[#6B5544] hover:bg-[#EADBCC]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Format filter (PDF / EPUB) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#8C7A6B] mr-1 font-medium">Format:</span>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'pdf', label: 'PDF' },
              { id: 'epub', label: 'EPUB' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setFormatFilter(fmt.id as any)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                  formatFilter === fmt.id
                    ? 'bg-[#5B3E2B] text-white font-semibold'
                    : 'bg-[#F2ECE4] text-[#6B5544] hover:bg-[#EADBCC]'
                }`}
              >
                {fmt.label}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="ml-2 text-xs font-semibold text-[#B9423D] hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Genre Pill Horizontal scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-xs text-[#8C7A6B] mr-1 font-medium flex-shrink-0">Kategori:</span>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedCategory(g)}
              className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === g
                  ? 'bg-[#EADBCC] text-[#6B3E18] font-bold border border-[#C4A882]'
                  : 'bg-[#FAF7F2] text-[#7A6756] border border-[#E8DFD5] hover:bg-[#EFE8DC]'
              }`}
            >
              {g === 'All' ? 'Semua Kategori' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Main Novel List/Shelf */}
      {filteredNovels.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCC] shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F2ECE4] text-[#8A5A36] flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-8 h-8 opacity-75" />
          </div>
          <h3 className="font-serif-title font-bold text-xl text-[#2C221E] mb-1">
            Tidak ada novel yang sesuai
          </h3>
          <p className="text-xs sm:text-sm text-[#7A6756] max-w-md mx-auto mb-6">
            {hasActiveFilters
              ? 'Coba ubah kata kunci pencarian atau sesuaikan filter status dan kategori.'
              : 'Perpustakaanmu masih kosong. Mulai tambahkan novel pertamamu sekarang!'}
          </p>

          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE8DC] border border-[#DDD0C0] text-[#5A381E] text-xs font-semibold rounded-xl transition-colors"
            >
              Atur Ulang Semua Filter
            </button>
          ) : (
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-[#8A5A36] hover:bg-[#724828] text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
            >
              + Tambah Novel Sekarang
            </button>
          )}
        </div>
      ) : viewMode === 'shelf' ? (
        /* Digital Bookshelf View */
        <div className="p-6 sm:p-8 rounded-3xl bg-[#F4EFEA] border border-[#E4D8C8] shadow-inner space-y-6">
          <div className="flex items-end justify-start gap-4 sm:gap-6 overflow-x-auto pb-2 pt-4 px-2">
            {filteredNovels.map((novel) => (
              <BookSpine key={novel.id} novel={novel} />
            ))}
          </div>
          <div className="wooden-shelf h-5 rounded-md -mt-2" />
        </div>
      ) : (
        /* Modern Card Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredNovels.map((novel) => (
            <BookCard key={novel.id} novel={novel} />
          ))}
        </div>
      )}
    </div>
  );
};
