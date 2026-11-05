import React from 'react';
import { 
  Home, 
  BookMarked, 
  FolderTree, 
  Heart, 
  History, 
  UserCircle2 
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { ActiveTab } from '../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, novels } = useLibrary();

  const favoriteCount = novels.filter(n => n.isFavorite).length;

  const items: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'collection', label: 'Koleksi', icon: BookMarked },
    { id: 'categories', label: 'Kategori', icon: FolderTree },
    { id: 'favorites', label: 'Favorit', icon: Heart, badge: favoriteCount },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'profile', label: 'Profil', icon: UserCircle2 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E8DFD5] px-2 py-1.5 shadow-lg shadow-black/5">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-[#8A5A36] font-semibold'
                  : 'text-[#8C7A6B] hover:text-[#3B291A]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#C25450] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A5A36] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
