import React from 'react';
import { 
  Home, 
  BookMarked, 
  FolderTree, 
  Heart, 
  History, 
  UserCircle2, 
  BookOpenCheck,
  Sparkles
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, novels } = useLibrary();
  const { user } = useAuth();

  const totalCount = novels.length;
  const readingCount = novels.filter(n => n.status === 'reading').length;
  const completedCount = novels.filter(n => n.status === 'completed').length;
  const favoriteCount = novels.filter(n => n.isFavorite).length;

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'collection', label: 'Koleksi Saya', icon: BookMarked, badge: totalCount },
    { id: 'categories', label: 'Kategori', icon: FolderTree },
    { id: 'favorites', label: 'Favorit', icon: Heart, badge: favoriteCount },
    { id: 'history', label: 'Riwayat Bacaan', icon: History },
    { id: 'profile', label: 'Profil Saya', icon: UserCircle2 },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#E8DFD5] bg-[#F7F2EB]/60 min-h-[calc(100vh-4.5rem)] p-5 select-none flex-shrink-0">
      {/* Navigation Links */}
      <div className="space-y-1.5 flex-1">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#9E8B7A]">Menu Utama</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#EADBCC] text-[#4A2E16] font-semibold shadow-xs'
                  : 'text-[#6B5747] hover:bg-[#EFE8DC] hover:text-[#2C221E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#8A5A36]' : 'text-[#8C7866] group-hover:text-[#5A381E]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-[#8A5A36] text-white'
                      : 'bg-[#E4D8C8] text-[#6E5642]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini Stats Card in Sidebar */}
      {user && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-[#EFE5D8] to-[#E3D4C0] border border-[#DBCAB3] shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-[#7A4E2D]">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide uppercase">Progres Membaca</span>
          </div>
          <p className="text-xs text-[#6B5544] mb-3">
            {readingCount > 0
              ? `Kamu sedang menikmati ${readingCount} novel saat ini.`
              : 'Pilih novel untuk mulai petualangan membaca barumu.'}
          </p>

          <div className="space-y-1.5 text-xs text-[#523F31]">
            <div className="flex justify-between">
              <span>Selesai dibaca:</span>
              <span className="font-bold text-[#8A5A36]">{completedCount} buku</span>
            </div>
            <div className="w-full bg-[#D4C0A7] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#8A5A36] h-full rounded-full transition-all duration-500"
                style={{
                  width: totalCount > 0 ? `${Math.min(100, Math.round((completedCount / totalCount) * 100))}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quote / Aesthetic note */}
      <div className="mt-4 pt-4 border-t border-[#E8DFD5] text-center">
        <p className="font-serif italic text-xs text-[#998574]">
          "Buku adalah mimpi yang kau pegang di tanganmu."
        </p>
      </div>
    </aside>
  );
};
