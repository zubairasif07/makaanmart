import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Heart, Search, Settings,
  MessageSquare, Clock, Trash2,
} from 'lucide-react';
import { Button, EmptyState, Badge } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import PropertyCard from '@/components/property/PropertyCard';
import { useRecentlyViewed } from '@/hooks';
import {
  deleteSavedSearch, getMyInquiries, getProperties, getPropertyById,
  getSavedSearches, updateProfile, type SavedSearch,
} from '@/services/api';
import { cn, timeAgo } from '@/utils';
import type { Inquiry, Property, SearchFilters } from '@/types';

function SideLink({ to, icon: Icon, label, badge }: { to: string; icon: React.ElementType; label: string; badge?: number }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
        isActive
          ? 'bg-navy-900 text-white dark:bg-emerald-600'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700',
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{badge}</span>
      )}
    </NavLink>
  );
}

export function BuyerDashboardLayout() {
  return (
    <div className="bg-gray-50 dark:bg-navy-900 min-h-screen">
      <div className="container-custom py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 p-3 sticky top-24 space-y-1">
              <SideLink to="/buyer/dashboard" icon={LayoutDashboard} label="Overview" />
              <SideLink to="/buyer/dashboard/saved" icon={Heart} label="Saved" />
              <SideLink to="/buyer/dashboard/searches" icon={Search} label="Saved Searches" />
              <SideLink to="/buyer/dashboard/inquiries" icon={MessageSquare} label="Inquiry History" />
              <SideLink to="/buyer/dashboard/settings" icon={Settings} label="Settings" />
            </div>
          </aside>
          <main className="flex-1 min-w-0"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}

export function BuyerOverview() {
  const { favorites } = useFavorites();
  const { viewed } = useRecentlyViewed();
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Buyer Dashboard | MakaanMart';
    Promise.all([
      Promise.all(viewed.slice(0, 3).map((id) => getPropertyById(id))),
      getMyInquiries(),
      getSavedSearches(),
    ]).then(([recent, buyerInquiries, searches]) => {
      setRecentProperties(recent.filter((property): property is Property => property !== null));
      setInquiries(buyerInquiries);
      setSavedSearches(searches);
    }).catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load your dashboard.'));
  }, [viewed]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">My Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Saved Properties', value: favorites.length, icon: Heart, color: 'bg-red-50 dark:bg-red-900/20 text-red-500' },
          { label: 'Saved Searches', value: savedSearches.length, icon: Search, color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' },
          { label: 'Inquiries Sent', value: inquiries.length, icon: MessageSquare, color: 'bg-navy-50 dark:bg-navy-700 text-navy-700 dark:text-navy-200' },
          { label: 'Recently Viewed', value: viewed.length, icon: Clock, color: 'bg-gold-400/10 text-gold-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-gray-100 dark:border-navy-700">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', color)}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-navy-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      <div>
        <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Recently Viewed</h2>
        {recentProperties.length > 0
          ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{recentProperties.map((property) => <PropertyCard key={property.id} property={property} />)}</div>
          : <p className="text-sm text-gray-500">Properties you view will appear here.</p>}
      </div>
    </div>
  );
}

export function BuyerSavedProperties() {
  const { favorites } = useFavorites();
  const [saved, setSaved] = useState<Property[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Saved Properties | MakaanMart'; }, []);

  useEffect(() => {
    if (favorites.length === 0) {
      setSaved([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(favorites.map((id) => getPropertyById(id)))
      .then((properties) => setSaved(properties.filter((property): property is Property => property !== null)))
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load saved properties.'))
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Saved Properties</h1>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      {loading ? <p className="text-sm text-gray-500">Loading saved properties…</p> : saved.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-16 h-16" />}
          title="No saved properties"
          description="Browse listings and tap the heart icon to save."
          action={<Link to="/listings"><Button variant="emerald">Browse Properties</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  );
}

export function BuyerSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Saved Searches | MakaanMart'; }, []);

  useEffect(() => {
    getSavedSearches()
      .then(setSearches)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load saved searches.'))
      .finally(() => setLoading(false));
  }, []);

  const resultsUrl = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key === 'query' ? 'q' : key === 'sortBy' ? 'sort' : key, String(value));
    });
    return `/listings?${params}`;
  };

  const removeSearch = async (id: string) => {
    setError('');
    try {
      await deleteSavedSearch(id);
      setSearches((current) => current.filter((search) => search.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not remove this search.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Saved Searches</h1>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      <div className="space-y-3">
        {!loading && searches.length === 0 && <p className="text-sm text-gray-500">Save a search from the listings page to find it here.</p>}
        {searches.map((s) => (
          <div key={s.id} className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <Search className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-navy-900 dark:text-white">{s.name}</p>
                <p className="text-xs text-gray-400">Created {timeAgo(s.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to={resultsUrl(s.filters)}><Button variant="secondary" size="xs">View Results</Button></Link>
              <Button aria-label={`Delete ${s.name}`} variant="ghost" size="icon-sm" onClick={() => void removeSearch(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BuyerInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Inquiry History | MakaanMart'; }, []);

  useEffect(() => {
    getMyInquiries()
      .then(setInquiries)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load inquiry history.'));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Inquiry History</h1>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      <div className="space-y-3">
        {inquiries.map((inq) => (
          <div key={inq.id} className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 p-5 flex items-center justify-between">
            <div>
              <Link to={`/property/${inq.propertyId}`} className="font-bold text-navy-900 dark:text-white text-sm hover:text-emerald-600">{inq.propertyTitle}</Link>
              <p className="text-xs text-gray-400 mt-0.5">{timeAgo(inq.createdAt)}</p>
            </div>
            <Badge variant={inq.status === 'replied' ? 'verified' : inq.status === 'read' ? 'featured' : 'secondary'}>
              {inq.status}
            </Badge>
          </div>
        ))}
        {inquiries.length === 0 && !error && <p className="text-sm text-gray-500">Your property inquiries will appear here.</p>}
      </div>
    </div>
  );
}

export function BuyerSettings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'Profile Settings | MakaanMart'; }, []);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await updateProfile({ name, phone });
      updateUser(result.user);
      setNotice('Your profile was saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Profile Settings</h1>
      <form onSubmit={save} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-semibold text-navy-900 dark:text-white">Full Name
            <input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} className="input-field mt-1.5" />
          </label>
          <label className="block text-sm font-semibold text-navy-900 dark:text-white">Email Address
            <input disabled value={user?.email ?? ''} className="input-field mt-1.5" />
          </label>
          <label className="block text-sm font-semibold text-navy-900 dark:text-white">Phone Number
            <input required minLength={10} value={phone} onChange={(event) => setPhone(event.target.value)} className="input-field mt-1.5" />
          </label>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {notice && <p role="status" className="text-sm text-emerald-600">{notice}</p>}
        <Button type="submit" variant="emerald" size="md" loading={saving}>Save Changes</Button>
      </form>
    </div>
  );
}
