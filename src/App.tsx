import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { AuthModal } from './components/AuthModal';
import { NovelDetailModal } from './components/NovelDetailModal';
import { NovelFormModal } from './components/NovelFormModal';
import { ReaderModal } from './components/ReaderModal';

import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';

const AppContent: React.FC = () => {
  const { activeTab } = useLibrary();
  const { user, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'collection':
        return <CollectionPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'favorites':
        return <FavoritesPage />;
      case 'history':
        return <HistoryPage />;
      case 'profile':
        return <ProfilePage onOpenAuth={() => setIsAuthModalOpen(true)} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C221E]">
      {/* Top Navigation */}
      <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-20 lg:pb-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
              <div className="w-10 h-10 border-3 border-[#8A5A36] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-[#7A6756]">Menyiapkan perpustakaan NovelBox...</p>
            </div>
          ) : (
            renderActiveTab()
          )}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <NovelDetailModal />
      <NovelFormModal />
      <ReaderModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <AppContent />
      </LibraryProvider>
    </AuthProvider>
  );
}
