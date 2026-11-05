import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Novel, NovelGenre, NovelStatus, ActiveTab, ViewMode } from '../types';
import { api } from '../api';
import { useAuth } from './AuthContext';

interface LibraryContextType {
  novels: Novel[];
  isLoading: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: NovelGenre | 'All';
  setSelectedCategory: (cat: NovelGenre | 'All') => void;
  selectedStatus: NovelStatus | 'all';
  setSelectedStatus: (status: NovelStatus | 'all') => void;
  
  // Modals & Navigation
  selectedNovel: Novel | null;
  setSelectedNovel: (novel: Novel | null) => void;
  novelToEdit: Novel | null;
  isFormOpen: boolean;
  openCreateModal: () => void;
  openEditModal: (novel: Novel) => void;
  closeFormModal: () => void;
  activeReaderNovel: Novel | null;
  openReader: (novel: Novel) => void;
  closeReader: () => void;

  // Actions
  refreshNovels: () => Promise<void>;
  createNovel: (data: Partial<Novel>) => Promise<Novel>;
  updateNovel: (id: string, data: Partial<Novel>) => Promise<Novel>;
  deleteNovel: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  updateReadingProgress: (id: string, currentPage: number, totalPages?: number) => Promise<void>;
  changeNovelStatus: (id: string, status: NovelStatus) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<NovelGenre | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<NovelStatus | 'all'>('all');

  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [novelToEdit, setNovelToEdit] = useState<Novel | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [activeReaderNovel, setActiveReaderNovel] = useState<Novel | null>(null);

  const refreshNovels = useCallback(async () => {
    if (!user) {
      setNovels([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.getNovels();
      setNovels(data);

      // Keep activeReaderNovel or selectedNovel in sync if updated
      if (activeReaderNovel) {
        const found = data.find(n => n.id === activeReaderNovel.id);
        if (found) setActiveReaderNovel(found);
      }
      if (selectedNovel) {
        const found = data.find(n => n.id === selectedNovel.id);
        if (found) setSelectedNovel(found);
      }
    } catch (err) {
      console.error('Failed to load novels:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, activeReaderNovel, selectedNovel]);

  useEffect(() => {
    refreshNovels();
  }, [user]);

  const openCreateModal = () => {
    setNovelToEdit(null);
    setIsFormOpen(true);
  };

  const openEditModal = (novel: Novel) => {
    setNovelToEdit(novel);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setNovelToEdit(null);
    setIsFormOpen(false);
  };

  const openReader = (novel: Novel) => {
    setActiveReaderNovel(novel);
    setSelectedNovel(null); // close detail modal if open
  };

  const closeReader = () => {
    setActiveReaderNovel(null);
    refreshNovels();
  };

  const createNovel = async (data: Partial<Novel>): Promise<Novel> => {
    const created = await api.createNovel(data);
    setNovels(prev => [created, ...prev]);
    return created;
  };

  const updateNovel = async (id: string, data: Partial<Novel>): Promise<Novel> => {
    const updated = await api.updateNovel(id, data);
    setNovels(prev => prev.map(n => (n.id === id ? updated : n)));
    if (selectedNovel?.id === id) setSelectedNovel(updated);
    if (activeReaderNovel?.id === id) setActiveReaderNovel(updated);
    return updated;
  };

  const deleteNovel = async (id: string): Promise<void> => {
    await api.deleteNovel(id);
    setNovels(prev => prev.filter(n => n.id !== id));
    if (selectedNovel?.id === id) setSelectedNovel(null);
    if (activeReaderNovel?.id === id) setActiveReaderNovel(null);
  };

  const toggleFavorite = async (id: string): Promise<void> => {
    // Optimistic update
    setNovels(prev => prev.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
    if (selectedNovel?.id === id) {
      setSelectedNovel(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
    try {
      const updated = await api.toggleFavorite(id);
      setNovels(prev => prev.map(n => n.id === id ? updated : n));
      if (selectedNovel?.id === id) setSelectedNovel(updated);
    } catch (err) {
      // Revert if error
      refreshNovels();
      throw err;
    }
  };

  const updateReadingProgress = async (id: string, currentPage: number, totalPages?: number) => {
    const novel = novels.find(n => n.id === id);
    if (!novel) return;

    const tot = totalPages || novel.totalPages || 100;
    const progressPercent = Math.round((currentPage / tot) * 100);
    const newStatus = currentPage >= tot ? 'completed' : currentPage > 0 ? 'reading' : novel.status;

    // Optimistic update
    setNovels(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          currentPage,
          totalPages: tot,
          progressPercent,
          status: newStatus,
          lastReadAt: new Date().toISOString()
        };
      }
      return n;
    }));

    try {
      const updated = await api.updateNovel(id, {
        currentPage,
        totalPages: tot,
        status: newStatus
      });
      if (activeReaderNovel?.id === id) setActiveReaderNovel(updated);
      if (selectedNovel?.id === id) setSelectedNovel(updated);
    } catch (err) {
      console.error('Failed to sync reading progress:', err);
    }
  };

  const changeNovelStatus = async (id: string, status: NovelStatus) => {
    const novel = novels.find(n => n.id === id);
    if (!novel) return;

    let currentPage = novel.currentPage;
    if (status === 'completed') {
      currentPage = novel.totalPages;
    } else if (status === 'unread' && novel.status === 'completed') {
      currentPage = 0;
    }

    const updated = await api.updateNovel(id, {
      status,
      currentPage
    });
    setNovels(prev => prev.map(n => (n.id === id ? updated : n)));
    if (selectedNovel?.id === id) setSelectedNovel(updated);
  };

  return (
    <LibraryContext.Provider
      value={{
        novels,
        isLoading,
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedStatus,
        setSelectedStatus,
        selectedNovel,
        setSelectedNovel,
        novelToEdit,
        isFormOpen,
        openCreateModal,
        openEditModal,
        closeFormModal,
        activeReaderNovel,
        openReader,
        closeReader,
        refreshNovels,
        createNovel,
        updateNovel,
        deleteNovel,
        toggleFavorite,
        updateReadingProgress,
        changeNovelStatus,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
