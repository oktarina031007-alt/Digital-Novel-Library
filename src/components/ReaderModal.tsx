import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Maximize2, 
  Minimize2,
  Heart,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  AlertCircle,
  Home,
  ArrowLeft,
  BookMarked
} from 'lucide-react';
import { Novel, ReaderSettings, ReaderTheme } from '../types';
import { useLibrary } from '../context/LibraryContext';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker URL from public directory
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

const THEMES: ReaderTheme[] = [
  { id: 'cream', name: 'Krem Hangat', bg: '#F7F2E9', text: '#2C221E', cardBg: '#EFE8DC', accent: '#8A5A36' },
  { id: 'sepia', name: 'Sepia Klasik', bg: '#EFE4D0', text: '#3E2E1E', cardBg: '#E4D5BE', accent: '#7A4E2D' },
  { id: 'white', name: 'Kertas Putih', bg: '#FFFFFF', text: '#212121', cardBg: '#F5F5F5', accent: '#424242' },
  { id: 'dark', name: 'Malam Gelap', bg: '#1E1B18', text: '#E6DFD5', cardBg: '#2A2622', accent: '#C4A882' },
];

export const ReaderModal: React.FC = () => {
  const { 
    activeReaderNovel, 
    closeReader, 
    updateReadingProgress, 
    toggleFavorite, 
    changeNovelStatus,
    setActiveTab 
  } = useLibrary();

  if (!activeReaderNovel) return null;

  const novel = activeReaderNovel;
  const initialTotalPages = Math.max(1, novel.totalPages || 1);
  const initialPage = Math.min(Math.max(1, novel.currentPage || 1), initialTotalPages);

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [effectiveTotalPages, setEffectiveTotalPages] = useState<number>(initialTotalPages);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // PDF.js rendering states
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfScale, setPdfScale] = useState<number>(1.25);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // EPUB extracted content (if file is epub)
  const [epubChapters, setEpubChapters] = useState<{ id: string; title: string; html: string }[]>([]);
  const [isLoadingEpub, setIsLoadingEpub] = useState(false);

  // Reader typography & appearance settings
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    const saved = localStorage.getItem('novelbox_reader_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      fontSize: 18,
      fontFamily: 'serif',
      theme: 'cream',
      lineHeight: 1.8,
    };
  });

  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Always enforce strict bounds on currentPage
  const displayCurrentPage = Math.min(Math.max(1, currentPage), effectiveTotalPages);

  // Auto-correct currentPage if it ever exceeds effectiveTotalPages (e.g. from previous stale state or fast novel change)
  useEffect(() => {
    if (currentPage > effectiveTotalPages) {
      const clamped = Math.max(1, effectiveTotalPages);
      setCurrentPage(clamped);
      updateReadingProgress(novel.id, clamped, effectiveTotalPages);
    } else if (currentPage < 1) {
      setCurrentPage(1);
      updateReadingProgress(novel.id, 1, effectiveTotalPages);
    }
  }, [currentPage, effectiveTotalPages, novel.id]);

  // Reset & clamp page whenever active novel changes
  useEffect(() => {
    const safeTotal = Math.max(1, novel.totalPages || 1);
    const safePage = Math.min(Math.max(1, novel.currentPage || 1), safeTotal);
    setEffectiveTotalPages(safeTotal);
    setCurrentPage(safePage);
  }, [novel.id, novel.totalPages, novel.currentPage]);

  // Save settings to local storage
  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('novelbox_reader_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const activeTheme = THEMES.find((t) => t.id === settings.theme) || THEMES[0];

  // Auto-sync page progress to server with strict bounds
  const handlePageChange = (newPage: number) => {
    const clamped = Math.min(Math.max(1, newPage), effectiveTotalPages);
    setCurrentPage(clamped);
    updateReadingProgress(novel.id, clamped, effectiveTotalPages);

    // If reaching last page for the first time
    if (clamped === effectiveTotalPages && novel.status !== 'completed') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  };

  const handlePrevPage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (displayCurrentPage > 1) {
      handlePageChange(displayCurrentPage - 1);
    }
  };

  const handleNextPage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (displayCurrentPage < effectiveTotalPages) {
      handlePageChange(displayCurrentPage + 1);
    }
  };

  const handleGoHome = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    updateReadingProgress(novel.id, displayCurrentPage, effectiveTotalPages);
    setActiveTab('home');
    closeReader();
  };

  const handleGoCollection = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    updateReadingProgress(novel.id, displayCurrentPage, effectiveTotalPages);
    setActiveTab('collection');
    closeReader();
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    updateReadingProgress(novel.id, displayCurrentPage, effectiveTotalPages);
    closeReader();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handlePageChange(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePageChange(currentPage - 1);
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, effectiveTotalPages, isFullscreen]);

  // Load PDF using PDF.js and sync real page count
  useEffect(() => {
    if (novel.fileType === 'pdf' && novel.fileUrl) {
      let isCancelled = false;
      setIsPdfLoading(true);
      setPdfError(null);

      pdfjsLib.getDocument({ url: novel.fileUrl }).promise
        .then((doc) => {
          if (!isCancelled) {
            setPdfDoc(doc);
            if (doc.numPages && doc.numPages > 0) {
              const numPages = doc.numPages;
              setEffectiveTotalPages(numPages);
              setCurrentPage((prev) => {
                const safe = Math.min(Math.max(1, prev), numPages);
                updateReadingProgress(novel.id, safe, numPages);
                return safe;
              });
            }
          }
        })
        .catch((err) => {
          console.warn('PDF.js rendering note:', err);
          if (!isCancelled) {
            setPdfError(err.message || 'Gagal memuat dokumen dengan canvas PDF');
          }
        })
        .finally(() => {
          if (!isCancelled) setIsPdfLoading(false);
        });

      return () => {
        isCancelled = true;
      };
    } else {
      setPdfDoc(null);
    }
  }, [novel.fileUrl, novel.fileType]);

  // Render current PDF page onto canvas
  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      let renderTask: any = null;
      const pageToRender = Math.min(Math.max(1, displayCurrentPage), pdfDoc.numPages);

      pdfDoc.getPage(pageToRender).then((page: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const viewport = page.getViewport({ scale: pdfScale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        renderTask = page.render(renderContext);
        renderTask.promise.catch((err: any) => {
          if (err?.name !== 'RenderingCancelledException') {
            console.error('PDF page render error:', err);
          }
        });
      });

      return () => {
        if (renderTask) {
          try {
            renderTask.cancel();
          } catch {}
        }
      };
    }
  }, [pdfDoc, displayCurrentPage, pdfScale]);

  // Load EPUB files using JSZip if provided
  useEffect(() => {
    if (novel.fileType === 'epub' && novel.fileUrl) {
      setIsLoadingEpub(true);
      fetch(novel.fileUrl)
        .then((res) => res.arrayBuffer())
        .then(async (buffer) => {
          const zip = await JSZip.loadAsync(buffer);
          const chaptersList: { id: string; title: string; html: string }[] = [];

          const htmlFiles = Object.keys(zip.files).filter(
            (name) => name.endsWith('.html') || name.endsWith('.xhtml')
          );

          for (let i = 0; i < Math.min(htmlFiles.length, 30); i++) {
            const fileName = htmlFiles[i];
            const content = await zip.files[fileName].async('text');
            const cleanContent = content
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

            chaptersList.push({
              id: `ch_${i + 1}`,
              title: `Bab ${i + 1}`,
              html: cleanContent,
            });
          }

          if (chaptersList.length > 0) {
            setEpubChapters(chaptersList);
            setEffectiveTotalPages(chaptersList.length);
            setCurrentPage((prev) => Math.min(Math.max(1, prev), chaptersList.length));
          }
        })
        .catch((err) => {
          console.warn('Could not parse EPUB directly:', err);
        })
        .finally(() => {
          setIsLoadingEpub(false);
        });
    }
  }, [novel.fileUrl, novel.fileType]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Determine current content to render
  const renderContent = () => {
    // 1. If PDF fileUrl is present
    if (novel.fileType === 'pdf' && novel.fileUrl) {
      if (isPdfLoading) {
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] space-y-3">
            <div className="w-10 h-10 border-3 border-[#8A5A36] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium opacity-80">Membuka berkas PDF...</p>
          </div>
        );
      }

      // If PDF canvas render is ready
      if (pdfDoc && !pdfError) {
        return (
          <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 w-full overflow-y-auto">
            {/* Zoom toolbar */}
            <div className="flex items-center gap-2 mb-4 p-1.5 rounded-xl bg-black/10 backdrop-blur-xs text-xs font-semibold select-none">
              <button
                type="button"
                onClick={() => setPdfScale(Math.max(0.75, pdfScale - 0.25))}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
                title="Perkecil"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5">{Math.round(pdfScale * 100)}%</span>
              <button
                type="button"
                onClick={() => setPdfScale(Math.min(2.5, pdfScale + 0.25))}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
                title="Perbesar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPdfScale(1.25)}
                className="px-2 py-1 rounded-lg hover:bg-black/10 transition-colors text-[11px] cursor-pointer"
                title="Reset Ukuran"
              >
                Reset
              </button>
            </div>

            {/* Canvas Page */}
            <div className="rounded-xl overflow-hidden shadow-2xl border border-black/15 bg-white max-w-full">
              <canvas ref={canvasRef} className="block max-w-full h-auto" />
            </div>

            {/* Quick exit & navigation buttons below canvas */}
            <div className="mt-8 mb-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleGoCollection}
                className="px-4 py-2 rounded-xl bg-[#8A5A36] hover:bg-[#724828] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Pilihan Novel Lain</span>
              </button>
              <button
                type="button"
                onClick={handleGoHome}
                className="px-4 py-2 rounded-xl bg-black/10 hover:bg-black/15 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#8A5A36]" />
                <span>Ke Beranda</span>
              </button>
            </div>
          </div>
        );
      }

      // Fallback: Embed PDF object or iframe
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full h-full">
          <div className="w-full max-w-4xl h-[75vh] rounded-2xl overflow-hidden shadow-lg border border-black/10 bg-white">
            <object
              data={`${novel.fileUrl}#page=${currentPage}`}
              type="application/pdf"
              className="w-full h-full"
            >
              <iframe
                src={`${novel.fileUrl}#page=${currentPage}`}
                className="w-full h-full border-none"
                title={novel.title}
              />
            </object>
          </div>
        </div>
      );
    }

    // 2. If EPUB chapters were extracted
    if (epubChapters.length > 0) {
      const chapterIndex = Math.min(
        Math.floor(((currentPage - 1) / effectiveTotalPages) * epubChapters.length),
        epubChapters.length - 1
      );
      const ch = epubChapters[chapterIndex] || epubChapters[0];

      return (
        <div className="max-w-3xl mx-auto py-8 px-6 sm:px-12 leading-relaxed">
          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold mb-8 text-center" style={{ color: activeTheme.accent }}>
            {ch.title}
          </h2>
          <div
            className="prose max-w-none reader-body"
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              fontFamily:
                settings.fontFamily === 'serif'
                  ? 'var(--font-serif)'
                  : settings.fontFamily === 'reader'
                  ? 'var(--font-reader)'
                  : 'var(--font-sans)',
            }}
            dangerouslySetInnerHTML={{ __html: ch.html }}
          />

          {/* Quick exit & navigation buttons */}
          <div className="mt-12 pt-6 border-t border-black/10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGoCollection}
              className="px-4 py-2 rounded-xl bg-[#8A5A36] hover:bg-[#724828] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Pilihan Novel Lain</span>
            </button>
            <button
              type="button"
              onClick={handleGoHome}
              className="px-4 py-2 rounded-xl bg-black/10 hover:bg-black/15 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#8A5A36]" />
              <span>Ke Beranda</span>
            </button>
          </div>
        </div>
      );
    }

    // 3. Built-in structured chapters
    if (novel.chapters && novel.chapters.length > 0) {
      const chapterIdx = Math.min(
        Math.floor(((currentPage - 1) / effectiveTotalPages) * novel.chapters.length),
        novel.chapters.length - 1
      );
      const ch = novel.chapters[chapterIdx];

      return (
        <div className="max-w-2xl mx-auto py-10 px-6 sm:px-10">
          <div className="text-center mb-10 pb-6 border-b border-black/10">
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">
              {novel.title} • {novel.author}
            </span>
            <h2 
              className="font-serif-title text-2xl sm:text-3xl font-bold mt-2"
              style={{ color: activeTheme.accent }}
            >
              {ch.title}
            </h2>
          </div>

          <div
            className="whitespace-pre-line text-justify leading-relaxed"
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              fontFamily:
                settings.fontFamily === 'serif'
                  ? 'var(--font-serif)'
                  : settings.fontFamily === 'reader'
                  ? 'var(--font-reader)'
                  : 'var(--font-sans)',
            }}
          >
            {ch.content}
          </div>

          {/* Quick exit & navigation buttons */}
          <div className="mt-12 pt-6 border-t border-black/10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGoCollection}
              className="px-4 py-2 rounded-xl bg-[#8A5A36] hover:bg-[#724828] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Pilihan Novel Lain</span>
            </button>
            <button
              type="button"
              onClick={handleGoHome}
              className="px-4 py-2 rounded-xl bg-black/10 hover:bg-black/15 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#8A5A36]" />
              <span>Ke Beranda</span>
            </button>
          </div>
        </div>
      );
    }

    // 4. Fallback synopsis & file actions
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 sm:px-10 text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-black/5">
          <BookOpen className="w-8 h-8 opacity-70" />
        </div>
        <h2 className="font-serif-title text-2xl font-bold mb-2">{novel.title}</h2>
        <p className="text-sm opacity-75 mb-6">Karya {novel.author}</p>

        <div className="p-6 rounded-2xl bg-black/5 text-left mb-6 font-serif leading-relaxed text-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Sinopsis</h4>
          <p>{novel.synopsis}</p>
        </div>

        {novel.fileUrl && (
          <div className="mb-6">
            <a
              href={novel.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8A5A36] text-white text-sm font-semibold shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Buka / Unduh Berkas Asli ({novel.fileType.toUpperCase()})</span>
            </a>
          </div>
        )}

        <p className="text-xs opacity-60 mb-6">
          Gunakan tombol navigasi halaman di bawah untuk melacak dan menyimpan riwayat bacaanmu secara otomatis.
        </p>

        {/* Quick exit & navigation buttons */}
        <div className="pt-6 border-t border-black/10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleGoCollection}
            className="px-4 py-2 rounded-xl bg-[#8A5A36] hover:bg-[#724828] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Pilihan Novel Lain</span>
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            className="px-4 py-2 rounded-xl bg-black/10 hover:bg-black/15 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#8A5A36]" />
            <span>Ke Beranda</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={readerContainerRef}
      className="fixed inset-0 z-50 flex flex-col transition-colors duration-300 overflow-hidden"
      style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}
    >
      {/* Top Header Controls */}
      <header 
        className="flex items-center justify-between px-3 sm:px-8 py-3 border-b backdrop-blur-md transition-colors gap-2"
        style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: `${activeTheme.bg}EE` }}
      >
        {/* Left: Navigation Buttons (Ke Beranda & Pilih Novel Lain) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 truncate">
          {/* Tombol Ke Beranda */}
          <button
            type="button"
            onClick={handleGoHome}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-black/15 bg-black/5 hover:bg-black/10 active:scale-95 transition-all text-xs font-semibold select-none flex-shrink-0 cursor-pointer"
            title="Keluar dan Kembali ke Beranda"
          >
            <Home className="w-3.5 h-3.5 text-[#8A5A36]" />
            <span className="hidden sm:inline">Ke Beranda</span>
          </button>

          {/* Tombol Keluar untuk Kembali ke Pilihan Novel Lain */}
          <button
            type="button"
            onClick={handleGoCollection}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-black/15 bg-black/5 hover:bg-black/10 active:scale-95 transition-all text-xs font-semibold select-none flex-shrink-0 cursor-pointer"
            title="Keluar untuk Kembali ke Pilihan Novel Lain"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Pilih Novel Lain</span>
          </button>

          {/* Tombol Tutup X */}
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-black/10 active:scale-95 transition-all flex-shrink-0 opacity-70 hover:opacity-100 cursor-pointer"
            title="Tutup Reader & Kembali"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Book Title & Info */}
          <div className="truncate hidden lg:block pl-2 border-l border-black/10">
            <h1 className="font-serif-title font-bold text-sm truncate">
              {novel.title}
            </h1>
            <p className="text-[11px] opacity-70 truncate">
              {novel.author} • {novel.genre}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Status selector directly in reader */}
          <select
            value={novel.status}
            onChange={(e) => changeNovelStatus(novel.id, e.target.value as any)}
            className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-black/15 bg-transparent cursor-pointer"
          >
            <option value="unread" className="text-black">Belum Dibaca</option>
            <option value="reading" className="text-black">Sedang Dibaca</option>
            <option value="completed" className="text-black">Selesai Dibaca</option>
          </select>

          {/* Favorite */}
          <button
            type="button"
            onClick={() => toggleFavorite(novel.id)}
            className="p-2 rounded-xl hover:bg-black/10 transition-colors cursor-pointer"
            title={novel.isFavorite ? 'Favorit' : 'Tambah ke Favorit'}
          >
            <Heart className={`w-4 h-4 ${novel.isFavorite ? 'fill-[#C24138] text-[#C24138]' : ''}`} />
          </button>

          {/* Reader Settings toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              showSettings ? 'bg-black/15' : 'hover:bg-black/10'
            }`}
            title="Pengaturan Bacaan"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:block p-2 rounded-xl hover:bg-black/10 transition-colors cursor-pointer"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Floating Settings Drawer / Panel */}
      {showSettings && (
        <div 
          className="absolute top-16 right-4 sm:right-8 z-40 w-72 p-4 rounded-2xl shadow-xl border border-black/10 animate-in fade-in slide-in-from-top-2"
          style={{ backgroundColor: activeTheme.cardBg }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Tampilan Bacaan</span>
            <button type="button" onClick={() => setShowSettings(false)} className="text-xs opacity-60 hover:opacity-100 cursor-pointer">✕</button>
          </div>

          {/* Font Size controls */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span>Ukuran Tulisan</span>
              <span className="font-bold">{settings.fontSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ fontSize: Math.max(13, settings.fontSize - 1) })}
                className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                A-
              </button>
              <input
                type="range"
                min="13"
                max="28"
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                className="flex-1 accent-[#8A5A36] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => updateSettings({ fontSize: Math.min(28, settings.fontSize + 1) })}
                className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                A+
              </button>
            </div>
          </div>

          {/* Font Family selector */}
          <div className="mb-4">
            <span className="text-xs block mb-1.5 opacity-80">Gaya Huruf</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'serif', label: 'Serif' },
                { id: 'reader', label: 'Lora' },
                { id: 'sans', label: 'Modern' },
              ].map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => updateSettings({ fontFamily: f.id as any })}
                  className={`py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                    settings.fontFamily === f.id
                      ? 'border-[#8A5A36] bg-[#8A5A36] text-white'
                      : 'border-black/15 hover:bg-black/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme selector */}
          <div>
            <span className="text-xs block mb-1.5 opacity-80">Warna Kertas</span>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => updateSettings({ theme: theme.id })}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                    settings.theme === theme.id ? 'border-[#8A5A36] ring-1 ring-[#8A5A36]' : 'border-black/15'
                  }`}
                  style={{ backgroundColor: theme.bg, color: theme.text }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Canvas / Content */}
      <main className="flex-1 overflow-y-auto relative focus:outline-none">
        {isLoadingEpub ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div className="w-8 h-8 border-3 border-[#8A5A36] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium opacity-70">Membuka berkas EPUB...</p>
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {/* Bottom Navigation & Page Controls */}
      <footer 
        className="px-4 sm:px-8 py-3 border-t backdrop-blur-md flex flex-col gap-2 transition-colors select-none"
        style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: `${activeTheme.bg}EE` }}
      >
        {/* Progress Bar with Slider */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={effectiveTotalPages}
            value={displayCurrentPage}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val)) {
                handlePageChange(val);
              }
            }}
            className="w-full accent-[#8A5A36] h-2 bg-black/10 rounded-full cursor-pointer touch-none"
          />
        </div>

        {/* Page Prev/Next Controls */}
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={displayCurrentPage <= 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/15 hover:bg-black/10 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Halaman Sebelumnya</span>
          </button>

          {/* Page Indicator and Jump to page */}
          <div className="flex items-center gap-2 font-medium">
            <span>Halaman</span>
            <input
              type="number"
              min={1}
              max={effectiveTotalPages}
              value={displayCurrentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  handlePageChange(val);
                }
              }}
              onBlur={(e) => {
                const val = parseInt(e.target.value, 10);
                if (isNaN(val) || val < 1) {
                  handlePageChange(1);
                } else if (val > effectiveTotalPages) {
                  handlePageChange(effectiveTotalPages);
                }
              }}
              className="w-14 py-1 text-center font-bold rounded-lg border border-black/20 bg-transparent focus:outline-none focus:border-[#8A5A36]"
            />
            <span>dari {effectiveTotalPages}</span>
            <span className="hidden sm:inline opacity-60">
              ({Math.round((displayCurrentPage / effectiveTotalPages) * 100)}%)
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={displayCurrentPage >= effectiveTotalPages}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/15 hover:bg-black/10 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none font-semibold cursor-pointer"
            title="Halaman Berikutnya"
          >
            <span className="hidden sm:inline">Halaman Berikutnya</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
