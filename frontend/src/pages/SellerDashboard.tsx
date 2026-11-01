import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Plus, MessageSquare, BarChart2,
  Settings, Package, Eye, TrendingUp, Users, ChevronRight,
  Pencil, Trash2, Star, MoreVertical, Image, Upload,
  ArrowUpRight, Bell, Zap, CheckCircle2,
} from 'lucide-react';
import {
  Badge, Button, Avatar, Skeleton, StarRating, EmptyState,
} from '@/components/ui';
import { APP_CONFIG, AREA_UNITS, AMENITY_LIST, PROPERTY_TYPES } from '@/config';
import {
  createListing, deleteListing, getSellerInquiries, getSellerListings,
  updateInquiryStatus, updateListing, uploadListingImages, updateProfile,
} from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatArea, timeAgo, cn } from '@/utils';
import type { Inquiry, Property, Purpose, PropertyType, AreaUnit } from '@/types';

// ─── Sidebar link component ──────────────────────────────────────────────────
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
        <span className="w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

// ─── SELLER DASHBOARD LAYOUT ─────────────────────────────────────────────────
export function SellerDashboardLayout() {
  const [newInquiries, setNewInquiries] = useState(0);

  useEffect(() => {
    getSellerInquiries()
      .then((inquiries) => setNewInquiries(inquiries.filter((inquiry) => inquiry.status === 'new').length))
      .catch((error: unknown) => console.error('Could not load inquiry count:', error));
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-navy-900 min-h-screen">
      <div className="container-custom py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 p-3 sticky top-24 space-y-1">
              <SideLink to="/seller/dashboard" icon={LayoutDashboard} label="Overview" />
              <SideLink to="/seller/dashboard/listings" icon={Building2} label="My Listings" />
              <SideLink to="/seller/dashboard/add" icon={Plus} label="Add Listing" />
              <SideLink to="/seller/dashboard/inquiries" icon={MessageSquare} label="Inquiries" badge={newInquiries} />
              <SideLink to="/seller/dashboard/packages" icon={Package} label="Packages" />
              <SideLink to="/seller/dashboard/settings" icon={Settings} label="Settings" />
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW ────────────────────────────────────────────────────────────────
export function SellerOverview() {
  const [myListings, setMyListings] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const totalViews = myListings.reduce((acc, p) => acc + p.views, 0);
  const totalInquiries = myListings.reduce((acc, p) => acc + p.inquiries, 0);

  useEffect(() => {
    document.title = 'Seller Dashboard | MakaanMart';
    Promise.all([getSellerListings(), getSellerInquiries()])
      .then(([listings, sellerInquiries]) => {
        setMyListings(listings);
        setInquiries(sellerInquiries);
      })
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Listings', value: myListings.length, icon: Building2, color: 'bg-navy-50 dark:bg-navy-700 text-navy-700 dark:text-navy-200' },
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' },
    { label: 'Inquiries', value: totalInquiries, icon: MessageSquare, color: 'bg-gold-400/10 text-gold-600' },
    { label: 'Avg. Rating', value: '—', icon: Star, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back! Here's your property overview.</p>
        </div>
        <Link to="/seller/dashboard/add">
          <Button variant="emerald" size="sm">
            <Plus className="w-4 h-4" /> Add Listing
          </Button>
        </Link>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-gray-100 dark:border-navy-700">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', color)}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-navy-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Inquiries */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-navy-700">
          <h2 className="font-bold text-navy-900 dark:text-white">Recent Inquiries</h2>
          <Link to="/seller/dashboard/inquiries" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-navy-700">
          {inquiries.slice(0, 3).map((inq) => (
            <div key={inq.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors">
              <div className={cn(
                'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                inq.status === 'new' ? 'bg-emerald-500' : inq.status === 'read' ? 'bg-gold-400' : 'bg-gray-300',
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-navy-900 dark:text-white truncate">{inq.buyerName}</p>
                <p className="text-xs text-gray-400 truncate mb-1">{inq.propertyTitle}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{inq.message}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <Badge variant={inq.type === 'viewing' ? 'verified' : 'secondary'} className="text-[10px]">
                  {inq.type === 'viewing' ? '🏠 Viewing' : '📩 Inquiry'}
                </Badge>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(inq.createdAt)}</p>
              </div>
            </div>
          ))}
          {!loading && inquiries.length === 0 && (
            <p className="px-5 py-6 text-sm text-gray-500">No inquiries yet. New buyer messages will appear here.</p>
          )}
        </div>
      </div>

      {/* Recent Listings */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-navy-700">
          <h2 className="font-bold text-navy-900 dark:text-white">Your Listings</h2>
          <Link to="/seller/dashboard/listings" className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-navy-700/50">
                <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400">Property</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-500 dark:text-gray-400">Price</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-500 dark:text-gray-400">Views</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400">Inquiries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {myListings.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]?.url} alt={p.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                      <p className="font-semibold text-navy-900 dark:text-white truncate max-w-[240px]">{p.title}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={p.status === 'active' ? 'verified' : p.status === 'pending' ? 'featured' : 'secondary'}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-navy-900 dark:text-white whitespace-nowrap">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-300">
                    {p.views.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-300">
                    {p.inquiries}
                  </td>
                </tr>
              ))}
              {!loading && myListings.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">You have not listed a property yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MY LISTINGS ─────────────────────────────────────────────────────────────
export function SellerListings() {
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyListing, setBusyListing] = useState('');

  const refresh = () => getSellerListings()
    .then(setListings)
    .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load listings.'))
    .finally(() => setLoading(false));

  useEffect(() => {
    document.title = 'My Listings | MakaanMart';
    void refresh();
  }, []);

  const handleDelete = async (property: Property) => {
    if (!window.confirm(`Delete "${property.title}"? This cannot be undone.`)) return;
    setBusyListing(property.id);
    setError('');
    try {
      await deleteListing(property.id);
      setListings((current) => current.filter((listing) => listing.id !== property.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete listing.');
    } finally {
      setBusyListing('');
    }
  };

  const handleMarkSold = async (property: Property) => {
    setBusyListing(property.id);
    setError('');
    try {
      const updated = await updateListing(property.id, { status: 'sold' });
      setListings((current) => current.map((listing) => listing.id === updated.id ? updated : listing));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update listing.');
    } finally {
      setBusyListing('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">My Listings</h1>
        <Link to="/seller/dashboard/add">
          <Button variant="emerald" size="sm"><Plus className="w-4 h-4" /> Add Listing</Button>
        </Link>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}

      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-navy-700/50 border-b border-gray-100 dark:border-navy-700">
                <th className="text-left px-5 py-3 font-semibold text-gray-500">Property</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-500">Status</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-500">Price</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-500">Views</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-500">Leads</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {listings.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/property/${p.slug}`} className="flex items-center gap-3 group">
                      <img src={p.images[0]?.url} alt={p.title} className="w-14 h-11 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                      <div className="min-w-0">
                        <p className="font-semibold text-navy-900 dark:text-white truncate max-w-[200px] group-hover:text-emerald-600 transition-colors">{p.title}</p>
                        <p className="text-xs text-gray-400">{p.location.area}, {p.location.city}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={p.status === 'active' ? 'verified' : p.status === 'pending' ? 'featured' : 'secondary'}>{p.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-navy-900 dark:text-white whitespace-nowrap">{formatPrice(p.price)}</td>
                  <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-300">{p.views.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-300">{p.inquiries}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      {p.status === 'active' && (
                        <button
                          disabled={busyListing === p.id}
                          onClick={() => void handleMarkSold(p)}
                          className="px-2 rounded-lg bg-gray-100 dark:bg-navy-700 text-xs text-gray-600 hover:text-emerald-600 disabled:opacity-50"
                        >
                          Mark sold
                        </button>
                      )}
                      <button
                        disabled={busyListing === p.id}
                        onClick={() => void handleDelete(p)}
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-navy-700 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                        aria-label={`Delete ${p.title}`}
                      ><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && listings.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">No listings yet. Add your first property to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADD LISTING (multi-step form UI) ────────────────────────────────────────
interface ListingDraft {
  title: string;
  purpose: Purpose;
  type: PropertyType;
  price: string;
  city: string;
  areaName: string;
  address: string;
  area: string;
  areaUnit: AreaUnit;
  bedrooms: string;
  bathrooms: string;
  floors: string;
  parkingSpaces: string;
  furnished: string;
  description: string;
  amenities: string[];
  videoUrl: string;
}

const initialListingDraft: ListingDraft = {
  title: '',
  purpose: 'buy',
  type: 'house',
  price: '',
  city: '',
  areaName: '',
  address: '',
  area: '',
  areaUnit: 'marla',
  bedrooms: '',
  bathrooms: '',
  floors: '',
  parkingSpaces: '',
  furnished: '',
  description: '',
  amenities: [],
  videoUrl: '',
};

export function SellerAddListing() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(initialListingDraft);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const totalSteps = 5;

  useEffect(() => { document.title = 'Add New Listing | MakaanMart'; }, []);

  const update = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const nextStep = () => {
    setError('');
    if (step === 1 && (draft.title.trim().length < 8 || Number(draft.price) <= 0)) {
      setError('Enter a title with at least 8 characters and a valid price.');
      return;
    }
    if (step === 2 && (!draft.city || !draft.areaName.trim())) {
      setError('Choose a city and enter the area or society.');
      return;
    }
    if (step === 3 && (Number(draft.area) <= 0 || draft.description.trim().length < 20)) {
      setError('Enter the property size and a description of at least 20 characters.');
      return;
    }
    setStep((current) => current + 1);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const urls = await uploadListingImages(selectedFiles);
      setUploadedImages((current) => [...current, ...urls]);
      setSelectedFiles([]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload your images.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await createListing({
        ...draft,
        area: Number(draft.area),
        price: Number(draft.price),
        bedrooms: draft.bedrooms ? Number(draft.bedrooms) : undefined,
        bathrooms: draft.bathrooms ? Number(draft.bathrooms) : undefined,
        floors: draft.floors ? Number(draft.floors) : undefined,
        parkingSpaces: draft.parkingSpaces ? Number(draft.parkingSpaces) : undefined,
        furnished: draft.furnished || undefined,
        images: uploadedImages,
      });
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit this listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Location' },
    { num: 3, label: 'Details' },
    { num: 4, label: 'Media' },
    { num: 5, label: 'Review' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Add New Listing</h1>

      {submitted ? (
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center dark:bg-navy-800">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
          <h2 className="mb-2 text-xl font-bold text-navy-900 dark:text-white">Listing submitted for review</h2>
          <p className="mb-6 text-sm text-gray-500">It is saved to your account and will appear publicly after administrator approval.</p>
          <Link to="/seller/dashboard/listings"><Button variant="emerald">View your listings</Button></Link>
        </div>
      ) : (
      <>
      {/* Step indicator */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 p-5">
        <div className="flex items-center justify-between mb-6">
          {steps.map(({ num, label }) => (
            <div key={num} className="flex-1 flex flex-col items-center relative">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10',
                num <= step
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 dark:bg-navy-600 text-gray-500 dark:text-gray-400',
              )}>
                {num}
              </div>
              <span className={cn(
                'text-xs font-medium mt-1.5 transition-colors',
                num <= step ? 'text-emerald-600' : 'text-gray-400',
              )}>
                {label}
              </span>
              {num < totalSteps && (
                <div className={cn(
                  'absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5',
                  num < step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-navy-600',
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">Property Title</label>
                  <input value={draft.title} onChange={(event) => update('title', event.target.value)} type="text" placeholder="e.g. 5 Marla House in DHA Phase 5" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">Purpose</label>
                  <div className="flex gap-2">
                    {([{ label: 'For Sale', value: 'buy' }, { label: 'For Rent', value: 'rent' }, { label: 'Commercial', value: 'commercial' }] as const).map((purpose) => (
                      <button type="button" key={purpose.value} onClick={() => update('purpose', purpose.value)} className={cn(
                        'flex-1 rounded-xl border py-2.5 text-sm font-bold transition-all',
                        draft.purpose === purpose.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20'
                          : 'border-gray-200 text-gray-600 hover:border-emerald-500 dark:border-navy-600 dark:text-gray-300',
                      )}>
                        {purpose.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">Property Type</label>
                  <select value={draft.type} onChange={(event) => update('type', event.target.value as PropertyType)} className="input-field">
                    {Object.entries(PROPERTY_TYPES).map(([type, details]) => <option key={type} value={type}>{details.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">Price (PKR)</label>
                  <input value={draft.price} onChange={(event) => update('price', event.target.value)} type="number" min="1" placeholder="e.g. 32500000" className="input-field" />
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">City</label>
                  <select value={draft.city} onChange={(event) => update('city', event.target.value)} className="input-field">
                    <option value="">Choose a city</option>
                    {APP_CONFIG.supportedCities.map((city) => <option key={city}>{city}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">Area / Society</label>
                  <input value={draft.areaName} onChange={(event) => update('areaName', event.target.value)} type="text" placeholder="e.g. DHA Phase 5" className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">Full Address</label>
                  <input value={draft.address} onChange={(event) => update('address', event.target.value)} type="text" placeholder="Block, street, house number" className="input-field" />
                </div>
              </div>
              <p className="text-sm text-gray-500">Your city and area will be shown on the listing. Add the street address if you want to share it publicly.</p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy-900 dark:text-white">Area Size</label>
                  <input value={draft.area} onChange={(event) => update('area', event.target.value)} type="number" min="0.1" step="0.1" placeholder="5" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy-900 dark:text-white">Area Unit</label>
                  <select value={draft.areaUnit} onChange={(event) => update('areaUnit', event.target.value as AreaUnit)} className="input-field">
                    {Object.entries(AREA_UNITS).map(([unit, info]) => <option key={unit} value={unit}>{info.label}</option>)}
                  </select>
                </div>
                {([
                  ['Bedrooms', 'bedrooms'],
                  ['Bathrooms', 'bathrooms'],
                  ['Floors', 'floors'],
                  ['Parking Spaces', 'parkingSpaces'],
                ] as const).map(([label, key]) => (
                  <div key={key}>
                    <label className="mb-1.5 block text-sm font-semibold text-navy-900 dark:text-white">{label}</label>
                    <input value={draft[key]} onChange={(event) => update(key, event.target.value)} type="number" min="0" placeholder="Optional" className="input-field" />
                  </div>
                ))}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-900 dark:text-white">Furnishing</label>
                <select value={draft.furnished} onChange={(event) => update('furnished', event.target.value)} className="input-field">
                  <option value="">Not specified</option>
                  <option value="furnished">Furnished</option>
                  <option value="semi-furnished">Semi-furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">Description</label>
                <textarea value={draft.description} onChange={(event) => update('description', event.target.value)} rows={4} placeholder="Describe your property in detail..." className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-2">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {AMENITY_LIST.map((amenity) => (
                    <label key={amenity.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.amenities.includes(amenity.id)}
                        onChange={(event) => update('amenities', event.target.checked
                          ? [...draft.amenities, amenity.id]
                          : draft.amenities.filter((item) => item !== amenity.id))}
                        className="h-4 w-4 rounded accent-emerald-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <label className="block border-2 border-dashed border-gray-200 dark:border-navy-600 rounded-2xl p-10 text-center hover:border-emerald-500 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-gray-300 dark:text-navy-600 mx-auto mb-3" />
                <p className="font-semibold text-navy-900 dark:text-white">Drag & drop images here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse • Up to 20 images • JPG, PNG, WebP</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    setSelectedFiles((current) => [...current, ...files].slice(0, 20 - uploadedImages.length));
                    event.target.value = '';
                  }}
                />
              </label>
              {selectedFiles.length > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">{selectedFiles.length} photo(s) selected</p>
                  <Button type="button" variant="secondary" size="sm" loading={uploading} onClick={() => void handleUpload()}>
                    Upload photos
                  </Button>
                </div>
              )}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {uploadedImages.map((url, index) => (
                    <div key={url} className="relative">
                      <img src={url} alt={`Listing photo ${index + 1}`} className="h-24 w-full rounded-lg object-cover" />
                      <button type="button" onClick={() => setUploadedImages((current) => current.filter((image) => image !== url))} className="absolute right-1 top-1 rounded bg-white px-2 py-1 text-xs text-red-600">Remove</button>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">Video Tour URL (Optional)</label>
                <input value={draft.videoUrl} onChange={(event) => update('videoUrl', event.target.value)} type="url" placeholder="https://youtube.com/watch?v=..." className="input-field" />
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="animate-fade-in text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-2">Review & Submit</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                {draft.title} · {draft.city}, {draft.areaName} · PKR {Number(draft.price || 0).toLocaleString()} · {uploadedImages.length} photo(s)
              </p>
              <Button variant="emerald" size="lg" loading={submitting} onClick={() => void handleSubmit()}>
                Submit for review <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        {/* Navigation */}
        <div className="flex justify-between pt-5 border-t border-gray-100 dark:border-navy-700 mt-6">
          <Button variant="ghost" size="sm" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
            Previous
          </Button>
          {step < totalSteps ? (
            <Button variant="primary" size="sm" onClick={nextStep}>
              Next Step <ChevronRight className="w-4 h-4" />
            </Button>
          ) : null}
        </div>
      </div>
      </>
      )}
    </div>
  );
}

// ─── INQUIRIES ───────────────────────────────────────────────────────────────
export function SellerInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Inquiries | MakaanMart'; }, []);

  useEffect(() => {
    getSellerInquiries()
      .then(setInquiries)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load inquiries.'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (inquiry: Inquiry) => {
    setError('');
    try {
      await updateInquiryStatus(inquiry.id, 'read');
      setInquiries((current) => current.map((item) => item.id === inquiry.id ? { ...item, status: 'read' } : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update this inquiry.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Inquiries & Leads</h1>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      <div className="space-y-3">
        {inquiries.map((inq) => (
          <div key={inq.id} className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 p-5 hover:shadow-card transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Avatar name={inq.buyerName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-navy-900 dark:text-white">{inq.buyerName}</p>
                    <Badge variant={inq.status === 'new' ? 'verified' : inq.status === 'read' ? 'featured' : 'secondary'} className="text-[10px]">
                      {inq.status}
                    </Badge>
                    <Badge variant={inq.type === 'viewing' ? 'premium' : 'outline'} className="text-[10px]">
                      {inq.type === 'viewing' ? '🏠 Viewing Request' : '📩 Inquiry'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{inq.buyerEmail} · {inq.buyerPhone}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(inq.createdAt)}</span>
            </div>
            <p className="text-sm text-emerald-600 font-medium mb-1.5 truncate">📌 {inq.propertyTitle}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{inq.message}</p>
            <div className="flex gap-2 mt-4">
              <a
                href={`mailto:${encodeURIComponent(inq.buyerEmail)}?subject=${encodeURIComponent(`Re: ${inq.propertyTitle}`)}`}
                className="inline-flex items-center rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Reply by email
              </a>
              {inq.status === 'new' && (
                <Button variant="secondary" size="xs" onClick={() => void markRead(inq)}>Mark Read</Button>
              )}
            </div>
          </div>
        ))}
        {!loading && inquiries.length === 0 && (
          <EmptyState title="No inquiries yet" description="Buyer messages about your listings will appear here." />
        )}
      </div>
    </div>
  );
}

// ─── PACKAGES ────────────────────────────────────────────────────────────────
export function SellerPackages() {
  useEffect(() => { document.title = 'Packages | MakaanMart'; }, []);

  const packages = [
    { name: 'Basic', price: 0, features: ['5 Listings', 'Standard placement', 'Email support'], highlighted: false },
    { name: 'Pro', price: 4999, features: ['25 Listings', 'Featured badges', 'Priority support', 'Analytics dashboard', 'Boost 3 listings/mo'], highlighted: true },
    { name: 'Enterprise', price: 14999, features: ['Unlimited Listings', 'Premium badges', 'Dedicated manager', 'API access', 'Agency profile page', 'Bulk uploads'], highlighted: false },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Subscription Packages</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {packages.map((pkg) => (
          <div key={pkg.name} className={cn(
            'rounded-2xl border p-6 transition-all',
            pkg.highlighted
              ? 'bg-navy-900 text-white border-navy-900 shadow-xl scale-[1.02]'
              : 'bg-white dark:bg-navy-800 border-gray-100 dark:border-navy-700',
          )}>
            {pkg.highlighted && <Badge variant="featured" className="mb-3">Most Popular</Badge>}
            <h3 className="text-xl font-extrabold mb-1">{pkg.name}</h3>
            <p className="text-3xl font-extrabold mb-1">
              {pkg.price === 0 ? 'Free' : `PKR ${pkg.price.toLocaleString()}`}
              {pkg.price > 0 && <span className={cn('text-sm font-normal', pkg.highlighted ? 'text-gray-400' : 'text-gray-400')}>/month</span>}
            </p>
            <ul className="space-y-2 mt-5 mb-6">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <svg className={cn('w-4 h-4 flex-shrink-0', pkg.highlighted ? 'text-emerald-400' : 'text-emerald-500')} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className={pkg.highlighted ? '' : 'text-gray-600 dark:text-gray-300'}>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={pkg.highlighted ? 'emerald' : 'secondary'}
              size="md"
              className="w-full"
            >
              {pkg.price === 0 ? 'Current Plan' : 'Upgrade'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export function SellerSettings() {
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
        <div className="flex items-center gap-4 mb-4">
          <Avatar name={user?.name ?? ''} size="xl" />
          <p className="text-sm text-gray-500">Seller account</p>
        </div>
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
