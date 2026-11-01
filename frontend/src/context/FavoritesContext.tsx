import React, {
  createContext, useContext, useState, useEffect, type ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { getFavoriteIds, saveFavoriteIds } from '@/services/api';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const ownerId = user?.id ?? 'guest';
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem(`favorites:${ownerId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [loadedOwner, setLoadedOwner] = useState<string | null>(ownerId);

  useEffect(() => {
    let active = true;
    setLoadedOwner(null);
    if (!isAuthenticated) {
      setFavorites(JSON.parse(localStorage.getItem(`favorites:${ownerId}`) || '[]'));
      setLoadedOwner(ownerId);
      return () => { active = false; };
    }
    getFavoriteIds().then((ids) => {
      if (!active) return;
      setFavorites(ids);
      localStorage.setItem(`favorites:${ownerId}`, JSON.stringify(ids));
      setLoadedOwner(ownerId);
    }).catch((error: unknown) => {
      if (!active) return;
      console.error('Could not load saved properties:', error);
      setFavorites(JSON.parse(localStorage.getItem(`favorites:${ownerId}`) || '[]'));
      setLoadedOwner(ownerId);
    });
    return () => { active = false; };
  }, [isAuthenticated, ownerId]);

  useEffect(() => {
    if (loadedOwner !== ownerId) return;
    localStorage.setItem(`favorites:${ownerId}`, JSON.stringify(favorites));
    if (isAuthenticated) {
      saveFavoriteIds(favorites).catch((error: unknown) => console.error('Could not save your properties:', error));
    }
  }, [favorites, isAuthenticated, loadedOwner, ownerId]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be inside FavoritesProvider');
  return ctx;
}
