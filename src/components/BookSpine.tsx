import React from 'react';
import { Novel } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { Bookmark, Heart } from 'lucide-react';

interface BookSpineProps {
  novel: Novel;
}

// Map genres to elegant book binding colors
const GENRE_SPINE_COLORS: Record<string, { bg: string; text: string; accent: string; ribbon: string }> = {
  Romance: { bg: 'from-[#8C3A48] to-[#5C232E]', text: '#FADEE2', accent: '#DDA0A9', ribbon: '#E65C70' },
  Fantasy: { bg: 'from-[#2B4C5F] to-[#162D3B]', text: '#D8ECF8', accent: '#8EBCD8', ribbon: '#3891C8' },
  Horror: { bg: 'from-[#2D282A] to-[#141213]', text: '#E5DCDD', accent: '#9B8B8E', ribbon: '#851B27' },
  Mystery: { bg: 'from-[#3A435E] to-[#20273B]', text: '#DFE5F5', accent: '#99A8D1', ribbon: '#6B7AB4' },
  Adventure: { bg: 'from-[#7A5528] to-[#4E3414]', text: '#FBF0DD', accent: '#D6B788', ribbon: '#E29738' },
  Comedy: { bg: 'from-[#9C6D38] to-[#67441E]', text: '#FFF1DE', accent: '#DEC097', ribbon: '#EBB352' },
  Thriller: { bg: 'from-[#6E2E23] to-[#441810]', text: '#FCE0DB', accent: '#DE9C91', ribbon: '#C43625' },
  Drama: { bg: 'from-[#4D3B5C] to-[#2E203B]', text: '#EFE7F7', accent: '#BAA2D1', ribbon: '#8D61B8' },
  Lainnya: { bg: 'from-[#4A4744] to-[#2C2A29]', text: '#EAE8E6', accent: '#B8B5B2', ribbon: '#8C857E' },
};

export const BookSpine: React.FC<BookSpineProps> = ({ novel }) => {
  const { setSelectedNovel, openReader, toggleFavorite } = useLibrary();

  const palette = GENRE_SPINE_COLORS[novel.genre] || GENRE_SPINE_COLORS['Lainnya'];

  return (
    <div 
      className="group relative flex flex-col items-center cursor-pointer select-none transition-transform duration-300 hover:-translate-y-4"
      onClick={() => setSelectedNovel(novel)}
    >
      {/* Tooltip on hover */}
      <div className="absolute -top-12 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#2C221E] text-white text-[11px] font-medium py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md">
        {novel.title} • {novel.progressPercent}%
        <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-4 border-transparent border-t-[#2C221E]" />
      </div>

      {/* Standing Book on the shelf */}
      <div 
        className={`relative w-14 sm:w-16 h-48 sm:h-56 rounded-t-md rounded-b-xs bg-gradient-to-r ${palette.bg} shadow-md group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-2 border-l border-white/20 border-r border-black/30 overflow-hidden`}
        style={{
          boxShadow: '3px 4px 8px rgba(0,0,0,0.3), inset 2px 0 3px rgba(255,255,255,0.2)'
        }}
      >
        {/* Leather texture / debossed line details */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-black/25" />
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/15" />
        <div className="absolute bottom-6 left-0 right-0 h-0.5 bg-black/25" />
        <div className="absolute bottom-7 left-0 right-0 h-0.5 bg-white/15" />

        {/* Hanging Bookmark Ribbon */}
        {novel.currentPage > 0 && (
          <div 
            className="absolute top-0 right-2 w-2 h-6 shadow-xs"
            style={{ backgroundColor: palette.ribbon }}
          />
        )}

        {/* Favorite Icon */}
        <div className="flex justify-between items-center z-10">
          <span className="text-[8px] font-bold tracking-widest uppercase opacity-75" style={{ color: palette.accent }}>
            {novel.fileType.toUpperCase()}
          </span>
          {novel.isFavorite && (
            <Heart className="w-2.5 h-2.5 fill-red-400 text-red-400" />
          )}
        </div>

        {/* Vertical Title along spine */}
        <div className="flex-1 flex items-center justify-center py-2 overflow-hidden">
          <span 
            className="font-serif-title font-bold text-xs tracking-wide transform -rotate-90 whitespace-nowrap overflow-ellipsis max-w-[130px]"
            style={{ color: palette.text }}
            title={novel.title}
          >
            {novel.title}
          </span>
        </div>

        {/* Author & Progress indicator */}
        <div className="z-10 text-center">
          <p className="text-[8px] font-medium truncate opacity-80" style={{ color: palette.accent }}>
            {novel.author.split(' ')[0]}
          </p>
          {/* Mini progress line */}
          <div className="w-full bg-black/30 h-1 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full rounded-full"
              style={{ 
                width: `${novel.progressPercent}%`,
                backgroundColor: palette.ribbon 
              }}
            />
          </div>
        </div>
      </div>

      {/* Book Foot shadow on wooden shelf */}
      <div className="w-14 sm:w-16 h-2 bg-black/20 rounded-full blur-[2px] -mt-1 group-hover:scale-75 transition-all" />
    </div>
  );
};
