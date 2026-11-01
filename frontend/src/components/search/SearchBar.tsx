import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui';
import { APP_CONFIG, PROPERTY_TYPES } from '@/config';
import { useDebounce, useClickOutside } from '@/hooks';
import { searchAutosuggest } from '@/services/api';
import { cn } from '@/utils';
import type { Purpose } from '@/types';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
}

const tabs: { label: string; value: Purpose }[] = [
  { label: 'Buy', value: 'buy' },
  { label: 'Rent', value: 'rent' },
  { label: 'Commercial', value: 'commercial' },
];

export default function SearchBar({ variant = 'hero' }: SearchBarProps) {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState<Purpose>('buy');
  const [query, setQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [beds, setBeds] = useState('');

  const debouncedQuery = useDebounce(query, 300);
  const suggestRef = useClickOutside<HTMLDivElement>(() => setShowSuggestions(false));

  React.useEffect(() => {
    if (debouncedQuery.length < 2) { setSuggestions([]); return; }
    searchAutosuggest(debouncedQuery).then((res) => { setSuggestions(res); setShowSuggestions(true); });
  }, [debouncedQuery]);

  const handleSearch = (location = query) => {
    const params = new URLSearchParams();
    params.set('purpose', purpose);
    if (location) params.set('q', location);
    if (propertyType) params.set('type', propertyType);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (beds) params.set('minBeds', beds);
    navigate(`/listings?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className={cn(
      'w-full',
      variant === 'hero' && 'max-w-4xl',
    )}>
      {/* Purpose Tabs */}
      <div className="flex gap-1 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPurpose(tab.value)}
            className={cn(
              'px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all duration-200',
              purpose === tab.value
                ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white shadow-sm'
                : 'bg-white/30 dark:bg-navy-800/30 text-white/80 hover:bg-white/50',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Box */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl rounded-tl-none shadow-xl p-2 flex flex-col md:flex-row gap-2">
        {/* Location Input */}
        <div ref={suggestRef} className="relative flex-1 min-w-0">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-700 border border-transparent focus-within:border-emerald-400 transition-colors">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="City, area, or society…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              className="bg-transparent outline-none text-sm font-medium text-navy-900 dark:text-white placeholder:text-gray-400 w-full"
              aria-label="Search location"
              aria-autocomplete="list"
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-gray-100 dark:border-navy-700 overflow-hidden z-50 animate-scale-in">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-navy-900 dark:text-white hover:bg-gray-50 dark:hover:bg-navy-700 text-left transition-colors"
                  onClick={() => { setQuery(s); setShowSuggestions(false); }}
                >
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Type */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-700 min-w-[160px]">
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="bg-transparent outline-none text-sm font-medium text-navy-900 dark:text-white w-full appearance-none cursor-pointer"
            aria-label="Property type"
          >
            <option value="">All Types</option>
            {Object.entries(PROPERTY_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" />
        </div>

        {/* Beds (hero only) */}
        {variant === 'hero' && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-700 min-w-[120px]">
            <select
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              className="bg-transparent outline-none text-sm font-medium text-navy-900 dark:text-white w-full appearance-none cursor-pointer"
              aria-label="Bedrooms"
            >
              <option value="">Any Beds</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}+ Beds</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" />
          </div>
        )}

        {/* Search Button */}
        <Button variant="emerald" size="md" onClick={() => handleSearch()} className="md:px-8 flex-shrink-0">
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>

      {/* Quick chips */}
      {variant === 'hero' && (
        <div className="flex flex-wrap gap-2 mt-3">
          {['DHA Lahore', 'Bahria Town', 'Clifton Karachi', 'F-7 Islamabad', 'Gulberg'].map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); handleSearch(s); }}
              className="text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
