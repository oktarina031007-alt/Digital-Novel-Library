import React, { useState } from 'react';
import { 
  FolderTree, 
  Heart, 
  Sparkles, 
  Ghost, 
  Search, 
  Compass, 
  Smile, 
  Zap, 
  Film, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { NovelGenre } from '../types';
import { BookCard } from '../components/BookCard';

interface CategoryMeta {
  genre: NovelGenre;
  label: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bgGradient: string;
}

const CATEGORIES_DATA: CategoryMeta[] = [
  {
    genre: 'Romance',
    label: 'Romance',
    desc: 'Kisah cinta manis, emosi mendalam, dan perjalanan hubungan dua insan.',
    icon: Heart,
    color: '#8C3A48',
    bgGradient: 'from-[#FDF2F4] to-[#FCE7EB]',
  },
  {
    genre: 'Fantasy',
    label: 'Fantasy',
    desc: 'Dunia sihir penuh keajaiban, makhluk mitos, dan petualangan epik.',
    icon: Sparkles,
    color: '#2B5A75',
    bgGradient: 'from-[#F0F7FB] to-[#E3F0F8]',
  },
  {
    genre: 'Horror',
    label: 'Horror',
    desc: 'Nuansa mencekam, misteri supranatural, dan ketegangan bulu kuduk.',
    icon: Ghost,
    color: '#3D3136',
    bgGradient: 'from-[#F5F2F3] to-[#EAE4E6]',
  },
  {
    genre: 'Mystery',
    label: 'Mystery',
    desc: 'Teka-teki kriminal rumit, penyelidikan detektif, dan rahasia tersembunyi.',
    icon: Search,
    color: '#354366',
    bgGradient: 'from-[#F2F4F9] to-[#E5E9F4]',
  },
  {
    genre: 'Adventure',
    label: 'Adventure',
    desc: 'Eksplorasi tempat asing, bahaya menantang, dan keberanian tanpa batas.',
    icon: Compass,
    color: '#755024',
    bgGradient: 'from-[#FCF7F0] to-[#F7EEE1]',
  },
  {
    genre: 'Comedy',
    label: 'Comedy',
    desc: 'Kisah jenaka mengocok perut, satir cerdas, dan momen penuh tawa.',
    icon: Smile,
    color: '#8A5D28',
    bgGradient: 'from-[#FCF8F2] to-[#F6EDE0]',
  },
  {
    genre: 'Thriller',
    label: 'Thriller',
    desc: 'Ketegangan pacuan waktu berkecepatan tinggi yang memompa adrenalin.',
    icon: Zap,
    color: '#852A20',
    bgGradient: 'from-[#FDF3F2] to-[#FCE5E3]',
  },
  {
    genre: 'Drama',
    label: 'Drama',
    desc: 'Konflik realistis, pendalaman karakter emosional, dan dinamika kehidupan.',
    icon: Film,
    color: '#4B3659',
    bgGradient: 'from-[#F8F3FA] to-[#F0E5F5]',
  },
  {
    genre: 'Lainnya',
    label: 'Lainnya',
    desc: 'Berbagai genre lain seperti fiksi ilmiah, biografi, sejarah, dan puisi.',
    icon: Layers,
    color: '#524B47',
    bgGradient: 'from-[#F5F3F2] to-[#EAE7E4]',
  },
];

export const CategoriesPage: React.FC = () => {
  const { novels, setSelectedCategory, setActiveTab, openCreateModal } = useLibrary();
  const [selectedGenre, setSelectedGenre] = useState<NovelGenre>('Romance');

  // Count novels per genre
  const getCount = (genre: NovelGenre) => {
    return novels.filter(n => n.genre.toLowerCase() === genre.toLowerCase()).length;
  };

  const selectedNovels = novels.filter(
    n => n.genre.toLowerCase() === selectedGenre.toLowerCase()
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FolderTree className="w-6 h-6 text-[#8A5A36]" />
          <h1 className="font-serif-title font-bold text-2xl sm:text-3xl text-[#2C221E]">
            Kategori Novel
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#7A6756]">
          Jelajahi dan kelompokkan novel favoritmu berdasarkan genre cerita
        </p>
      </div>

      {/* Categories Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES_DATA.map((cat) => {
          const Icon = cat.icon;
          const count = getCount(cat.genre);
          const isSelected = selectedGenre === cat.genre;

          return (
            <div
              key={cat.genre}
              onClick={() => setSelectedGenre(cat.genre)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                isSelected
                  ? 'border-[#8A5A36] ring-2 ring-[#8A5A36]/20 shadow-md bg-white'
                  : 'border-[#EADBCC] hover:border-[#C4A882] bg-white hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 bg-gradient-to-br ${cat.bgGradient}`}
                    style={{ color: cat.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      isSelected
                        ? 'bg-[#8A5A36] text-white'
                        : 'bg-[#F2ECE4] text-[#6B5544]'
                    }`}
                  >
                    {count} Novel
                  </span>
                </div>

                <h3 className="font-serif-title font-bold text-lg text-[#2C221E] mb-1">
                  {cat.label}
                </h3>
                <p className="text-xs text-[#7A6756] leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#F2ECE4] flex items-center justify-between text-xs font-semibold" style={{ color: cat.color }}>
                <span>{isSelected ? 'Sedang Ditampilkan' : 'Pilih Genre Ini'}</span>
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Category Novels Section */}
      <div className="pt-4 border-t border-[#E8DFD5] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-title font-bold text-xl sm:text-2xl text-[#2C221E]">
              Novel dalam Kategori: <span className="text-[#8A5A36]">{selectedGenre}</span>
            </h2>
            <p className="text-xs text-[#7A6756]">
              {selectedNovels.length} novel ditemukan dalam genre ini
            </p>
          </div>

          {selectedNovels.length > 0 && (
            <button
              onClick={() => {
                setSelectedCategory(selectedGenre);
                setActiveTab('collection');
              }}
              className="text-xs font-bold text-[#8A5A36] hover:underline"
            >
              Buka di Koleksi Saya →
            </button>
          )}
        </div>

        {selectedNovels.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#EADBCC]">
            <p className="text-sm text-[#7A6756] mb-3">
              Belum ada novel dengan kategori <span className="font-bold">{selectedGenre}</span> di perpustakaanmu.
            </p>
            <button
              onClick={openCreateModal}
              className="text-xs font-semibold px-4 py-2 bg-[#8A5A36] hover:bg-[#724828] text-white rounded-xl shadow-xs transition-colors"
            >
              + Tambah Novel {selectedGenre}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {selectedNovels.map((novel) => (
              <BookCard key={novel.id} novel={novel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
