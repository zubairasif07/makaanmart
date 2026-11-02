import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { IS_DEMO_MODE } from '@/config/runtime';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-navy-950 transition-colors duration-300">
      <ScrollRestoration />
      <Navbar />
      <main className="flex-1 pt-16">
        {IS_DEMO_MODE && (
          <div role="status" className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
            Demo mode: sample listings only. Prices, availability, and agent details are examples, not real offers. Accounts and inquiries are unavailable.
          </div>
        )}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
