import React, { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { PropertyCardSkeleton } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

// ─── Lazy-loaded pages (code splitting) ──────────────────────────────────────
const HomePage = lazy(() => import('@/pages/HomePage'));
const ListingsPage = lazy(() => import('@/pages/ListingsPage'));
const PropertyDetailPage = lazy(() => import('@/pages/PropertyDetailPage'));
const AgentProfilePage = lazy(() => import('@/pages/AgentProfilePage'));
const AgentsDirectoryPage = lazy(() => import('@/pages/AgentsDirectoryPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const BlogPostPage = lazy(() => import('@/pages/BlogPage').then((module) => ({ default: module.BlogPostPage })));

// Dashboard lazy imports
const SellerDashboardModule = import('@/pages/SellerDashboard');
const BuyerDashboardModule = import('@/pages/BuyerDashboard');
const AdminDashboardModule = import('@/pages/AdminDashboard');

const SellerDashboardLayout = lazy(() => SellerDashboardModule.then((m) => ({ default: m.SellerDashboardLayout })));
const SellerOverview = lazy(() => SellerDashboardModule.then((m) => ({ default: m.SellerOverview })));
const SellerListings = lazy(() => SellerDashboardModule.then((m) => ({ default: m.SellerListings })));
const SellerAddListing = lazy(() => SellerDashboardModule.then((m) => ({ default: m.SellerAddListing })));
const SellerInquiries = lazy(() => SellerDashboardModule.then((m) => ({ default: m.SellerInquiries })));
const SellerPackages = lazy(() => SellerDashboardModule.then((m) => ({ default: m.SellerPackages })));
const SellerSettings = lazy(() => SellerDashboardModule.then((m) => ({ default: m.SellerSettings })));

const BuyerDashboardLayout = lazy(() => BuyerDashboardModule.then((m) => ({ default: m.BuyerDashboardLayout })));
const BuyerOverview = lazy(() => BuyerDashboardModule.then((m) => ({ default: m.BuyerOverview })));
const BuyerSavedProperties = lazy(() => BuyerDashboardModule.then((m) => ({ default: m.BuyerSavedProperties })));
const BuyerSavedSearches = lazy(() => BuyerDashboardModule.then((m) => ({ default: m.BuyerSavedSearches })));
const BuyerInquiries = lazy(() => BuyerDashboardModule.then((m) => ({ default: m.BuyerInquiries })));
const BuyerSettings = lazy(() => BuyerDashboardModule.then((m) => ({ default: m.BuyerSettings })));

const AdminDashboardLayout = lazy(() => AdminDashboardModule.then((m) => ({ default: m.AdminDashboardLayout })));
const AdminOverview = lazy(() => AdminDashboardModule.then((m) => ({ default: m.AdminOverview })));
const AdminListings = lazy(() => AdminDashboardModule.then((m) => ({ default: m.AdminListings })));
const AdminUsers = lazy(() => AdminDashboardModule.then((m) => ({ default: m.AdminUsers })));

// ─── Loading fallback ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="container-custom py-16">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading…</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
      </div>
    </div>
  );
}

function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: UserRole[];
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!roles.includes(user.role)) {
    const destination = user.role === 'admin'
      ? '/admin/dashboard'
      : user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard';
    return <Navigate to={destination} replace />;
  }
  return children;
}

// ─── Router ──────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense> },
      { path: 'listings', element: <Suspense fallback={<PageLoader />}><ListingsPage /></Suspense> },
      { path: 'property/:slug', element: <Suspense fallback={<PageLoader />}><PropertyDetailPage /></Suspense> },
      { path: 'agents', element: <Suspense fallback={<PageLoader />}><AgentsDirectoryPage /></Suspense> },
      { path: 'agents/:id', element: <Suspense fallback={<PageLoader />}><AgentProfilePage /></Suspense> },
      { path: 'favorites', element: <Suspense fallback={<PageLoader />}><FavoritesPage /></Suspense> },
      { path: 'about', element: <Suspense fallback={<PageLoader />}><AboutPage /></Suspense> },
      { path: 'contact', element: <Suspense fallback={<PageLoader />}><ContactPage /></Suspense> },
      { path: 'faq', element: <Suspense fallback={<PageLoader />}><FAQPage /></Suspense> },
      { path: 'blog', element: <Suspense fallback={<PageLoader />}><BlogPage /></Suspense> },
      { path: 'blog/:slug', element: <Suspense fallback={<PageLoader />}><BlogPostPage /></Suspense> },

      // Seller Dashboard
      {
        path: 'seller/dashboard',
        element: <ProtectedRoute roles={['seller', 'admin']}><Suspense fallback={<PageLoader />}><SellerDashboardLayout /></Suspense></ProtectedRoute>,
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><SellerOverview /></Suspense> },
          { path: 'listings', element: <Suspense fallback={<PageLoader />}><SellerListings /></Suspense> },
          { path: 'add', element: <Suspense fallback={<PageLoader />}><SellerAddListing /></Suspense> },
          { path: 'inquiries', element: <Suspense fallback={<PageLoader />}><SellerInquiries /></Suspense> },
          { path: 'packages', element: <Suspense fallback={<PageLoader />}><SellerPackages /></Suspense> },
          { path: 'settings', element: <Suspense fallback={<PageLoader />}><SellerSettings /></Suspense> },
        ],
      },

      // Buyer Dashboard
      {
        path: 'buyer/dashboard',
        element: <ProtectedRoute roles={['buyer']}><Suspense fallback={<PageLoader />}><BuyerDashboardLayout /></Suspense></ProtectedRoute>,
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><BuyerOverview /></Suspense> },
          { path: 'saved', element: <Suspense fallback={<PageLoader />}><BuyerSavedProperties /></Suspense> },
          { path: 'searches', element: <Suspense fallback={<PageLoader />}><BuyerSavedSearches /></Suspense> },
          { path: 'inquiries', element: <Suspense fallback={<PageLoader />}><BuyerInquiries /></Suspense> },
          { path: 'settings', element: <Suspense fallback={<PageLoader />}><BuyerSettings /></Suspense> },
        ],
      },

      // Admin Dashboard
      {
        path: 'admin/dashboard',
        element: <ProtectedRoute roles={['admin']}><Suspense fallback={<PageLoader />}><AdminDashboardLayout /></Suspense></ProtectedRoute>,
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><AdminOverview /></Suspense> },
          { path: 'listings', element: <Suspense fallback={<PageLoader />}><AdminListings /></Suspense> },
          { path: 'users', element: <Suspense fallback={<PageLoader />}><AdminUsers /></Suspense> },
        ],
      },

      // Catch-all static pages
      { path: 'list-property', element: <ProtectedRoute roles={['seller', 'admin']}><Suspense fallback={<PageLoader />}><SellerAddListing /></Suspense></ProtectedRoute> },
      { path: 'privacy', element: <Suspense fallback={<PageLoader />}><StaticPage title="Privacy Policy" /></Suspense> },
      { path: 'terms', element: <Suspense fallback={<PageLoader />}><StaticPage title="Terms of Service" /></Suspense> },

      // 404
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Login has no layout (full-page)
  { path: '/login', element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
  { path: '/register', element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
]);

// ─── Static placeholder page ─────────────────────────────────────────────────
function StaticPage({ title }: { title: string }) {
  React.useEffect(() => { document.title = `${title} | MakaanMart`; }, [title]);
  return (
    <div className="py-16">
      <div className="container-custom max-w-3xl">
        <h1 className="text-3xl font-extrabold text-navy-900 dark:text-white mb-6">{title}</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          <p>This page contains the {title.toLowerCase()} for MakaanMart. Content will be added when the legal team finalizes the documents.</p>
          <p className="mt-4">For any questions about our {title.toLowerCase()}, please <a href="/contact" className="text-emerald-600">contact us</a>.</p>
        </div>
      </div>
    </div>
  );
}

// ─── 404 page ────────────────────────────────────────────────────────────────
function NotFoundPage() {
  React.useEffect(() => { document.title = '404 — Page Not Found | MakaanMart'; }, []);
  return (
    <div className="container-custom py-24 text-center">
      <p className="text-8xl font-extrabold text-gray-200 dark:text-navy-700 mb-4">404</p>
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <a
        href="/"
        className="inline-flex items-center gap-2 btn-emerald"
      >
        Go Home
      </a>
    </div>
  );
}

// ─── App component ───────────────────────────────────────────────────────────
export default function App() {
  return <RouterProvider router={router} />;
}
