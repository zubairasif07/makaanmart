import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import { Avatar, Badge, Button, EmptyState } from '@/components/ui';
import {
  getAdminSummary, getAdminUsers, getSellerListings, updateListing, updateUserRole,
  type AdminSummary,
} from '@/services/api';
import type { Property, User } from '@/types';
import { formatPrice, timeAgo, cn } from '@/utils';

function SideLink({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => cn(
        'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
        isActive
          ? 'bg-navy-900 text-white dark:bg-emerald-600'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700',
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </NavLink>
  );
}

export function AdminDashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <div className="container-custom py-6">
        <div className="flex gap-6">
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <div className="sticky top-24 space-y-1 rounded-2xl border border-gray-100 bg-white p-3 dark:border-navy-700 dark:bg-navy-800">
              <SideLink to="/admin/dashboard" icon={LayoutDashboard} label="Overview" />
              <SideLink to="/admin/dashboard/listings" icon={Building2} label="Listings" />
              <SideLink to="/admin/dashboard/users" icon={Users} label="Users" />
            </div>
          </aside>
          <main className="min-w-0 flex-1"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}

function useAdminListings() {
  const [listings, setListings] = useState<Property[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = () => getSellerListings()
    .then(setListings)
    .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load listings.'))
    .finally(() => setLoading(false));

  useEffect(() => { void refresh(); }, []);
  return { listings, setListings, error, setError, loading, refresh };
}

export function AdminOverview() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [error, setError] = useState('');
  const { listings, setListings, loading, refresh } = useAdminListings();

  useEffect(() => {
    document.title = 'Admin Dashboard | MakaanMart';
    getAdminSummary()
      .then(setSummary)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load dashboard.'));
  }, []);

  const pending = listings.filter((property) => property.status === 'pending').slice(0, 5);

  const moderate = async (property: Property, status: 'active' | 'rejected') => {
    setError('');
    try {
      const updated = await updateListing(property.id, { status });
      setListings((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSummary((current) => current ? {
        ...current,
        pendingListings: Math.max(0, current.pendingListings - 1),
      } : current);
    } catch (moderationError) {
      setError(moderationError instanceof Error ? moderationError.message : 'Could not moderate this listing.');
    }
  };

  const stats = [
    { label: 'Total Listings', value: summary?.listings ?? '—', icon: Building2 },
    { label: 'Pending Approval', value: summary?.pendingListings ?? '—', icon: Clock },
    { label: 'Registered Users', value: summary?.users ?? '—', icon: Users },
    { label: 'New Inquiries', value: summary?.inquiries ?? '—', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Admin Dashboard</h1>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-navy-700 dark:bg-navy-800">
            <Icon className="mb-3 h-5 w-5 text-emerald-600" />
            <p className="text-2xl font-extrabold text-navy-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>
      <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 dark:border-navy-700 dark:bg-navy-800">
        <h2 className="font-bold text-navy-900 dark:text-white">Listings awaiting review</h2>
        {pending.map((property) => (
          <div key={property.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-3 dark:bg-navy-700/50">
            <div className="flex min-w-0 items-center gap-3">
              <img src={property.images[0]?.url} alt="" className="h-12 w-14 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">{property.title}</p>
                <p className="text-xs text-gray-500">{property.agent.name} · {timeAgo(property.postedAt)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="emerald" size="xs" onClick={() => void moderate(property, 'active')}><CheckCircle2 className="h-3.5 w-3.5" /> Approve</Button>
              <Button variant="danger" size="xs" onClick={() => void moderate(property, 'rejected')}><XCircle className="h-3.5 w-3.5" /> Reject</Button>
            </div>
          </div>
        ))}
        {!loading && pending.length === 0 && <p className="text-sm text-gray-500">There are no listings awaiting review.</p>}
        <Button variant="secondary" size="sm" onClick={() => void refresh()}>Refresh</Button>
      </section>
    </div>
  );
}

export function AdminListings() {
  const { listings, setListings, error, setError, loading } = useAdminListings();
  useEffect(() => { document.title = 'Manage Listings | MakaanMart'; }, []);

  const moderate = async (property: Property, status: 'active' | 'rejected') => {
    setError('');
    try {
      const updated = await updateListing(property.id, { status });
      setListings((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (moderationError) {
      setError(moderationError instanceof Error ? moderationError.message : 'Could not update listing.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Manage Listings</h1>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50 dark:border-navy-700 dark:bg-navy-700/50">
              <th className="px-5 py-3 text-left">Property</th><th className="px-3 py-3 text-left">Agent</th>
              <th className="px-3 py-3 text-left">Status</th><th className="px-3 py-3 text-right">Price</th><th className="px-5 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {listings.map((property) => (
                <tr key={property.id}>
                  <td className="px-5 py-3 font-semibold">{property.title}</td>
                  <td className="px-3 py-3"><span className="flex items-center gap-2"><Avatar src={property.agent.avatar} name={property.agent.name} size="sm" />{property.agent.name}</span></td>
                  <td className="px-3 py-3"><Badge variant={property.status === 'active' ? 'verified' : property.status === 'pending' ? 'featured' : 'secondary'}>{property.status}</Badge></td>
                  <td className="px-3 py-3 text-right font-bold">{formatPrice(property.price)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {property.status !== 'active' && <Button variant="emerald" size="xs" onClick={() => void moderate(property, 'active')}>Approve</Button>}
                      {property.status !== 'rejected' && <Button variant="danger" size="xs" onClick={() => void moderate(property, 'rejected')}>Reject</Button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && listings.length === 0 && <tr><td colSpan={5} className="p-8"><EmptyState title="No listings found" /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Manage Users | MakaanMart';
    getAdminUsers()
      .then(setUsers)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load users.'))
      .finally(() => setLoading(false));
  }, []);

  const changeRole = async (user: User) => {
    const role = user.role === 'seller' ? 'buyer' : 'seller';
    setError('');
    try {
      const updated = await updateUserRole(user.id, role);
      setUsers((current) => current.map((item) => item.id === user.id ? updated : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update user role.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Manage Users</h1>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50 dark:border-navy-700 dark:bg-navy-700/50">
            <th className="p-4">User</th><th className="p-4">Phone</th><th className="p-4">Role</th><th className="p-4">Joined</th><th className="p-4">Action</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-4"><div className="flex items-center gap-3"><Avatar name={user.name} size="sm" /><span><b>{user.name}</b><br /><span className="text-xs text-gray-500">{user.email}</span></span></div></td>
                <td className="p-4">{user.phone}</td><td className="p-4"><Badge>{user.role}</Badge></td><td className="p-4">{timeAgo(user.createdAt)}</td>
                <td className="p-4">{user.role !== 'admin' && <Button variant="secondary" size="xs" onClick={() => void changeRole(user)}>{user.role === 'seller' ? 'Make buyer' : 'Make seller'}</Button>}</td>
              </tr>
            ))}
            {!loading && users.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
