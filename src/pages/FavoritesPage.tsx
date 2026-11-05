import React, { useState } from 'react';
import { Heart, Search, BookOpen, Library, LayoutGrid } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { BookCard } from '../components/BookCard';
import { BookSpine } from '../components/BookSpine';

export const FavoritesPage: React.FC = () => {
  const { novels, setActiveTab, viewMode, setViewMode } = useLibrary();
  const [filterQuery, setFilterQuery] = useState('');

  const favoriteNovels = novels.filter(n => n.isFavorite);
  const filtered = favoriteNovels.filter(n => 
    n.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    n.author.toLowerCase().includes(filterQuery.toLowerCase()) ||
    n.genre.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-6 h-6 text-[#C24138] fill-[#C24138]" />
            <h1 className="font-serif-title font-bold text-2xl sm:text-3xl text-[#2C221E]">
              Novel Favorit
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#7A6756]">
            Daftar karya terbaik yang paling berkesan dan kamu simpan di hati
          </p>
        </div>

        {/* View mode toggle */}
        {favoriteNovels.length > 0 && (
          <div className="flex items-center gap-3">
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
          </div>
        )}
      </div>

      {/* Search inside favorites */}
      {favoriteNovels.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#9D8876] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Cari di antara novel favoritmu..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DDD0C0] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:border-[#8A5A36] transition-all"
          />
        </div>
      )}

      {/* Content */}
      {favoriteNovels.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCC] shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#FDF2F2] text-[#C24138] flex items-center justify-center mx-auto mb-3">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif-title font-bold text-xl text-[#2C221E] mb-1">
            Belum ada novel favorit
          </h3>
          <p className="text-xs sm:text-sm text-[#7A6756] max-w-sm mx-auto mb-6">
            Klik ikon hati (❤️) pada kartu buku atau halaman detail untuk menandai novel kesukaanmu.
          </p>
          <button
            onClick={() => setActiveTab('collection')}
            className="px-5 py-2.5 bg-[#8A5A36] hover:bg-[#724828] text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
          >
            Jelajahi Koleksi Novel
          </button>
        </div>
      ) : viewMode === 'shelf' ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#F4EFEA] border border-[#E4D8C8] shadow-inner space-y-6">
          <div className="flex items-end justify-start gap-4 sm:gap-6 overflow-x-auto pb-2 pt-4 px-2">
            {filtered.map((novel) => (
              <BookSpine key={novel.id} novel={novel} />
            ))}
          </div>
          <div className="wooden-shelf h-5 rounded-md -mt-2" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((novel) => (
            <BookCard key={novel.id} novel={novel} />
          ))}
        </div>
      )}
    </div>
  );
};
