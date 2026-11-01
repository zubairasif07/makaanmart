import React, { useState } from 'react';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import type { SearchFilters, Purpose, PropertyType } from '@/types';
import { APP_CONFIG, PROPERTY_TYPES, AMENITY_LIST } from '@/config';
import { Button } from '@/components/ui';
import { cn } from '@/utils';

interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
  mobile?: boolean;
  onClose?: () => void;
}

const purposeOptions: { label: string; value: Purpose }[] = [
  { label: 'Buy', value: 'buy' },
  { label: 'Rent', value: 'rent' },
  { label: 'Commercial', value: 'commercial' },
];

const furnishedOptions = ['furnished', 'semi-furnished', 'unfurnished'] as const;
const bedOptions = [1, 2, 3, 4, 5, 6];
const pricePresets = {
  buy: [
    { label: 'Under 50 Lakh', min: 0, max: 5000000 },
    { label: '50L – 1 Cr', min: 5000000, max: 10000000 },
    { label: '1 – 3 Cr', min: 10000000, max: 30000000 },
    { label: '3 – 5 Cr', min: 30000000, max: 50000000 },
    { label: 'Above 5 Cr', min: 50000000, max: Infinity },
  ],
  rent: [
    { label: 'Under 20K', min: 0, max: 20000 },
    { label: '20K – 50K', min: 20000, max: 50000 },
    { label: '50K – 1 Lakh', min: 50000, max: 100000 },
    { label: 'Above 1 Lakh', min: 100000, max: Infinity },
  ],
  commercial: [
    { label: 'Under 50K/mo', min: 0, max: 50000 },
    { label: '50K – 2 Lakh/mo', min: 50000, max: 200000 },
    { label: 'Above 2 Lakh/mo', min: 200000, max: Infinity },
  ],
};

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-navy-700 pb-4 mb-4 last:border-0 last:mb-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between mb-3 text-sm font-bold text-navy-900 dark:text-white hover:text-emerald-600 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="animate-fade-in">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  mobile,
  onClose,
}: FilterSidebarProps) {
  const update = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className={cn(
      'bg-white dark:bg-navy-800 rounded-2xl p-5 border border-gray-100 dark:border-navy-700',
      mobile && 'fixed inset-0 z-50 overflow-y-auto rounded-none',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4.5 h-4.5 text-navy-900 dark:text-white" />
          <h3 className="font-bold text-navy-900 dark:text-white">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Reset All
          </button>
          {mobile && onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Purpose */}
      <FilterSection title="Purpose">
        <div className="flex gap-2">
          {purposeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ purpose: opt.value })}
              className={cn(
                'flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
                filters.purpose === opt.value
                  ? 'bg-navy-900 text-white'
                  : 'bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* City */}
      <FilterSection title="City">
        <select
          value={filters.city ?? ''}
          onChange={(e) => update({ city: e.target.value || undefined })}
          className="input-field text-sm"
          aria-label="Filter by city"
        >
          <option value="">All Cities</option>
          {APP_CONFIG.supportedCities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </FilterSection>

      {/* Property Type */}
      <FilterSection title="Property Type">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PROPERTY_TYPES).map(([key, { label, icon }]) => (
            <button
              key={key}
              onClick={() => update({ type: filters.type === key ? undefined : key as PropertyType })}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border',
                filters.type === key
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-gray-50 dark:bg-navy-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600 hover:border-navy-300',
              )}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice ?? ''}
            onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="input-field text-sm"
            aria-label="Minimum price"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice ?? ''}
            onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="input-field text-sm"
            aria-label="Maximum price"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(pricePresets[filters.purpose ?? 'buy'] ?? pricePresets.buy).map((p) => (
            <button
              key={p.label}
              onClick={() => update({ minPrice: p.min || undefined, maxPrice: p.max === Infinity ? undefined : p.max })}
              className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Bedrooms */}
      <FilterSection title="Bedrooms">
        <div className="flex flex-wrap gap-2">
          {bedOptions.map((n) => (
            <button
              key={n}
              onClick={() => update({ minBeds: filters.minBeds === n ? undefined : n })}
              className={cn(
                'w-10 h-10 rounded-xl text-sm font-bold transition-all border',
                filters.minBeds === n
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-gray-50 dark:bg-navy-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600',
              )}
            >
              {n}+
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Furnished */}
      <FilterSection title="Furnished Status" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {furnishedOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => update({ furnished: filters.furnished === opt ? undefined : opt })}
              className={cn(
                'px-3 py-1.5 rounded-xl text-sm font-medium capitalize transition-all border',
                filters.furnished === opt
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-gray-50 dark:bg-navy-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600',
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection title="Amenities" defaultOpen={false}>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
          {AMENITY_LIST.map((a) => {
            const active = filters.amenities?.includes(a.id);
            return (
              <label key={a.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!!active}
                  onChange={() => {
                    const curr = filters.amenities ?? [];
                    update({
                      amenities: active ? curr.filter((x) => x !== a.id) : [...curr, a.id],
                    });
                  }}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-navy-900 dark:group-hover:text-white transition-colors">
                  {a.label}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Posted Within */}
      <FilterSection title="Posted Within" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {[1, 7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => update({ postedWithin: filters.postedWithin === days ? undefined : days })}
              className={cn(
                'px-3 py-1.5 rounded-xl text-sm font-medium transition-all border',
                filters.postedWithin === days
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-gray-50 dark:bg-navy-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600',
              )}
            >
              {days === 1 ? 'Today' : `${days} Days`}
            </button>
          ))}
        </div>
      </FilterSection>

      {mobile && (
        <Button variant="emerald" size="lg" className="w-full mt-4" onClick={onClose}>
          Show Results
        </Button>
      )}
    </div>
  );
}
