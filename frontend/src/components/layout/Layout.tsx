import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { IS_API_UNCONFIGURED } from '@/config/runtime';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-navy-950 transition-colors duration-300">
      <ScrollRestoration />
      <Navbar />
      <main className="flex-1 pt-16">
        {IS_API_UNCONFIGURED && (
          <div role="status" className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
            No property backend is connected. Listings will appear after sellers can submit properties through a connected backend. Accounts and inquiries are unavailable.
          </div>
        )}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
