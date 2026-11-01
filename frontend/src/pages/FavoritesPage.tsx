import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Search } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { getPropertyById } from '@/services/api';
import PropertyCard from '@/components/property/PropertyCard';
import { PropertyCardSkeleton, EmptyState, Button } from '@/components/ui';
import type { Property } from '@/types';

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Saved Properties | MakaanMart';
    if (favorites.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(favorites.map((id) => getPropertyById(id))).then((results) => {
      setProperties(results.filter(Boolean) as Property[]);
      setLoading(false);
    });
  }, [favorites]);

  return (
    <div className="bg-gray-50 dark:bg-navy-900 min-h-screen">
      <div className="bg-white dark:bg-navy-800 border-b border-gray-100 dark:border-navy-700">
        <div className="container-custom py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Saved Properties</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }, (_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-16 h-16" />}
            title="No saved properties yet"
            description="Browse listings and tap the heart icon to save properties you love."
            action={
              <Link to="/listings">
                <Button variant="emerald">
                  <Search className="w-4 h-4" /> Browse Properties
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
