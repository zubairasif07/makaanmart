import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Grid3X3, List, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import FilterSidebar from '@/components/search/FilterSidebar';
import PropertyCard from '@/components/property/PropertyCard';
import { PropertyCardSkeleton, Button, EmptyState } from '@/components/ui';
import { getProperties } from '@/services/api';
import { SORT_OPTIONS } from '@/config';
import { cn } from '@/utils';
import type { Property, SearchFilters } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { createSavedSearch } from '@/services/api';

type ViewMode = 'grid' | 'list';

function ActiveFilterChips({
  filters,
  onRemove,
}: {
  filters: SearchFilters;
  onRemove: (key: keyof SearchFilters) => void;
}) {
  const chips: { key: keyof SearchFilters; label: string }[] = [];
  if (filters.query) chips.push({ key: 'query', label: filters.query });
  if (filters.featured) chips.push({ key: 'featured', label: 'Featured' });
  if (filters.purpose) chips.push({ key: 'purpose', label: `For ${filters.purpose}` });
  if (filters.city) chips.push({ key: 'city', label: filters.city });
  if (filters.type) chips.push({ key: 'type', label: filters.type });
  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      key: 'minPrice',
      label: `PKR ${(filters.minPrice ?? 0).toLocaleString()} – ${filters.maxPrice ? filters.maxPrice.toLocaleString() : '∞'}`,
    });
  }
  if (filters.minBeds) chips.push({ key: 'minBeds', label: `${filters.minBeds}+ Beds` });
  if (filters.furnished) chips.push({ key: 'furnished', label: filters.furnished });
  if (filters.postedWithin) chips.push({ key: 'postedWithin', label: `Last ${filters.postedWithin} days` });
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map(({ key, label }) => (
        <span key={String(key)} className="filter-chip">
          {label}
          <button
            onClick={() => onRemove(key)}
            className="ml-1 text-navy-400 hover:text-navy-800 dark:hover:text-white transition-colors"
            aria-label={`Remove ${label} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [savingSearch, setSavingSearch] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const getFiltersFromParams = useCallback((): SearchFilters => ({
    query: searchParams.get('q') || undefined,
    featured: searchParams.get('featured') === 'true' || undefined,
    purpose: (searchParams.get('purpose') as any) || undefined,
    city: searchParams.get('city') || undefined,
    type: (searchParams.get('type') as any) || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minBeds: searchParams.get('minBeds') ? Number(searchParams.get('minBeds')) : undefined,
    maxBeds: searchParams.get('maxBeds') ? Number(searchParams.get('maxBeds')) : undefined,
    minBaths: searchParams.get('minBaths') ? Number(searchParams.get('minBaths')) : undefined,
    minArea: searchParams.get('minArea') ? Number(searchParams.get('minArea')) : undefined,
    maxArea: searchParams.get('maxArea') ? Number(searchParams.get('maxArea')) : undefined,
    areaUnit: (searchParams.get('areaUnit') as SearchFilters['areaUnit']) || undefined,
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || undefined,
    furnished: (searchParams.get('furnished') as any) || undefined,
    postedWithin: searchParams.get('postedWithin') ? Number(searchParams.get('postedWithin')) : undefined,
    sortBy: (searchParams.get('sort') as any) || 'newest',
  }), [searchParams]);

  const [filters, setFilters] = useState<SearchFilters>(getFiltersFromParams);

  useEffect(() => {
    setFilters(getFiltersFromParams());
    setPage(1);
  }, [searchParams, getFiltersFromParams]);

  useEffect(() => {
    document.title = `Properties for ${filters.purpose === 'rent' ? 'Rent' : filters.purpose === 'commercial' ? 'Commercial' : 'Sale'} in Pakistan | MakaanMart`;
    setLoading(true);
    getProperties(filters, page, 12).then(({ data, total: t, totalPages: tp }) => {
      setProperties(data);
      setTotal(t);
      setTotalPages(tp);
      setLoading(false);
    });
  }, [filters, page]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        const key = k === 'query' ? 'q' : k === 'sortBy' ? 'sort' : k;
        params.set(key, Array.isArray(v) ? v.join(',') : String(v));
      }
    });
    setSearchParams(params);
  };

  const handleFilterRemove = (key: keyof SearchFilters) => {
    handleFiltersChange({ ...filters, [key]: undefined });
  };

  const handleReset = () => {
    setFilters({});
    setSearchParams({});
    setPage(1);
  };

  const handleSaveSearch = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    const name = [filters.query, filters.city, filters.type, filters.purpose]
      .filter(Boolean)
      .join(' · ') || 'My property search';
    setSavingSearch(true);
    setSaveMessage('');
    setSaveError('');
    try {
      await createSavedSearch(name, filters);
      setSaveMessage('Search saved to your buyer dashboard.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save this search.');
    } finally {
      setSavingSearch(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-navy-900 min-h-screen">
      {/* Top bar */}
      <div className="bg-white dark:bg-navy-800 border-b border-gray-100 dark:border-navy-700 sticky top-16 z-30">
        <div className="container-custom py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex-shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </Button>
            {!loading && (
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                <span className="font-bold text-navy-900 dark:text-white">{total}</span> properties found
              </p>
            )}
            <Button variant="secondary" size="sm" loading={savingSearch} onClick={() => void handleSaveSearch()}>
              Save search
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400 hidden sm:block" />
              <select
                value={filters.sortBy ?? 'newest'}
                onChange={(e) => handleFiltersChange({ ...filters, sortBy: e.target.value as any })}
                className="text-sm font-medium text-navy-900 dark:text-white bg-transparent border-0 outline-none cursor-pointer"
                aria-label="Sort properties"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-navy-700 rounded-xl p-1">
              {([['grid', Grid3X3], ['list', List]] as const).map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                    viewMode === mode
                      ? 'bg-white dark:bg-navy-600 text-navy-900 dark:text-white shadow-sm'
                      : 'text-gray-400 hover:text-navy-900 dark:hover:text-white',
                  )}
                  aria-label={`${mode} view`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {saveMessage && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{saveMessage}</p>}
        {saveError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{saveError}</p>}
        <div className="flex gap-6">
          {/* Filter sidebar — desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0 self-start sticky top-32">
            <FilterSidebar
              filters={filters}
              onChange={handleFiltersChange}
              onReset={handleReset}
            />
          </aside>

          {/* Listings */}
          <div className="flex-1 min-w-0">
            <ActiveFilterChips filters={filters} onRemove={handleFilterRemove} />

            {loading ? (
              <div className={cn(
                'grid gap-5',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
              )}>
                {Array.from({ length: 6 }, (_, i) => <PropertyCardSkeleton key={i} />)}
              </div>
            ) : properties.length === 0 ? (
              <EmptyState
                icon={<Grid3X3 className="w-16 h-16" />}
                title="No properties found"
                description="Try adjusting your filters or search in a different area."
                action={<Button variant="emerald" onClick={handleReset}>Clear All Filters</Button>}
              />
            ) : (
              <div className={cn(
                'grid gap-5',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
              )}>
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} view={viewMode} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        'w-10 h-10 rounded-xl text-sm font-bold transition-all',
                        page === p
                          ? 'bg-navy-900 text-white'
                          : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 border border-gray-200 dark:border-navy-700',
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-navy-900 shadow-2xl overflow-y-auto animate-slide-up">
            <FilterSidebar
              filters={filters}
              onChange={(f) => { handleFiltersChange(f); }}
              onReset={handleReset}
              mobile
              onClose={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
