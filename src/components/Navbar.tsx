import React from 'react';
import { BookOpen, Search, Plus, Bookmark, User as UserIcon, LogIn, LayoutGrid, Library } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    openCreateModal,
    viewMode,
    setViewMode,
    novels
  } = useLibrary();
  const { user } = useAuth();

  const favoriteCount = novels.filter(n => n.isFavorite).length;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8A5A36] to-[#603D22] flex items-center justify-center text-white shadow-md shadow-[#8A5A36]/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-[#F5EFEB]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-title font-bold text-xl sm:text-2xl tracking-tight text-[#2C221E]">NovelBox</span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#EADBCC] text-[#7A4E2D]">
                Library
              </span>
            </div>
            <p className="text-[11px] text-[#8C7A6B] hidden sm:block -mt-0.5">All Your Novels, One Place.</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-6">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9D8876] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'collection' && e.target.value.trim().length > 0) {
                  setActiveTab('collection');
                }
              }}
              placeholder="Cari novel, penulis, atau genre..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#F2ECE4] hover:bg-[#ECE4D8] focus:bg-white text-[#2C221E] placeholder-[#9D8876] rounded-full border border-transparent focus:border-[#C4A882] focus:outline-none focus:ring-2 focus:ring-[#C4A882]/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9D8876] hover:text-[#5C4534] bg-[#E2D5C5] rounded-full w-4 h-4 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {user ? (
            <>
              {/* Shelf vs Grid view toggle (useful on collection & home) */}
              <div className="hidden md:flex items-center bg-[#EFE8DC] p-1 rounded-xl border border-[#E0D4C3]">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Tampilan Grid Kartu"
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#5A381E] shadow-xs'
                      : 'text-[#85705F] hover:text-[#2C221E]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('shelf')}
                  title="Tampilan Rak Buku Kayu"
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                    viewMode === 'shelf'
                      ? 'bg-white text-[#5A381E] shadow-xs'
                      : 'text-[#85705F] hover:text-[#2C221E]'
                  }`}
                >
                  <Library className="w-4 h-4" />
                </button>
              </div>

              {/* Tambah Novel Button */}
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#8A5A36] hover:bg-[#724828] active:scale-95 text-[#FAF7F2] text-sm font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Tambah Novel</span>
              </button>

              {/* Profile icon */}
              <button
                onClick={() => setActiveTab('profile')}
                className="relative p-1 rounded-full border-2 border-[#D5C2AE] hover:border-[#8A5A36] transition-colors"
                title={user.name}
              >
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover bg-[#E8DFD5]"
                />
                {favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C25450] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {favoriteCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8A5A36] hover:bg-[#734A2B] text-white text-sm font-medium shadow-sm transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk / Daftar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
