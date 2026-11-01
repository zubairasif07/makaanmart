import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';
import { cn } from '@/utils';

const faqCategories = [
  {
    name: 'Buying',
    items: [
      { q: 'How do I search for properties?', a: 'Use our search bar on the homepage or listings page. You can filter by city, area, property type, price range, bedrooms, and more. You can also use the quick search chips for popular areas.' },
      { q: 'How do I know a listing is genuine?', a: 'Look for the "Verified" badge on listings. Our team physically verifies property documents and seller identities. We also display the dealer\'s rating, reviews, and activity history for full transparency.' },
      { q: 'Can I schedule a property viewing?', a: 'Yes! Click the "Request Viewing" button on any property detail page. Fill in the form and the agent will contact you to arrange a convenient time. You can also directly call or WhatsApp the agent.' },
      { q: 'What does "Featured" or "Premium" mean?', a: 'Featured listings are highlighted by our editors as excellent value. Premium listings are promoted by agents for maximum visibility. All listings, regardless of tag, are subject to our verification process.' },
      { q: 'Can I compare properties?', a: 'Yes! Click the compare icon (bar chart) on any property card to add it to your comparison list. You can compare up to 3 properties side by side.' },
    ],
  },
  {
    name: 'Selling',
    items: [
      { q: 'How do I list my property?', a: 'Click "List Your Property" in the navigation or footer. Register as a seller, fill in the multi-step listing form with property details, photos, and pricing. Your listing will be reviewed and published within 24 hours.' },
      { q: 'Is listing my property free?', a: 'Yes, our Basic plan allows up to 5 free listings. For more listings, featured badges, and analytics, check our Pro and Enterprise packages on the dashboard.' },
      { q: 'How do I manage inquiries?', a: 'All inquiries appear in your seller dashboard under "Inquiries & Leads". You\'ll receive email and WhatsApp notifications for new inquiries. Mark them as read, reply directly, or schedule viewings.' },
      { q: 'Can I edit or delete a listing?', a: 'Yes. Go to "My Listings" in your seller dashboard. Click the edit (pencil) icon to update details, or the trash icon to delete. You can also mark a property as "Sold" to remove it from search results.' },
    ],
  },
  {
    name: 'Account',
    items: [
      { q: 'How do I create an account?', a: 'Click "Sign In" in the top navigation, then switch to "Create Account". Choose your role (Buyer or Seller/Dealer), fill in your details, and you\'re all set. OTP verification may be required for sellers.' },
      { q: 'Can I switch from buyer to seller?', a: 'Contact our support team to upgrade your account from buyer to seller. You\'ll need to provide additional verification documents for seller access.' },
      { q: 'How do I reset my password?', a: 'Click "Forgot password?" on the login page. Enter your registered email and we\'ll send a reset link. Check your spam folder if you don\'t see it within a few minutes.' },
    ],
  },
  {
    name: 'Pricing & Payments',
    items: [
      { q: 'What area units does MakaanMart use?', a: 'We support Marla, Kanal, Square Feet (Sq Ft), and Square Meters. You can switch between units in the listing details. Marla is the default unit for residential properties in Pakistan.' },
      { q: 'How is the mortgage calculator estimated?', a: 'Our EMI calculator uses standard amortisation formulae. You can adjust the loan amount, interest rate, and tenure. The calculated EMI is an estimate — actual bank terms may vary. Consult your bank for official rates.' },
      { q: 'Are there any hidden charges?', a: 'No. Browsing and basic listing is completely free. Premium features like featured badges and analytics dashboards are available through optional paid packages, clearly listed on the pricing page.' },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-navy-700 last:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
        aria-expanded={open}
      >
        <span className={cn(
          'text-sm font-semibold transition-colors',
          open ? 'text-emerald-600' : 'text-navy-900 dark:text-white group-hover:text-emerald-600',
        )}>
          {q}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed animate-fade-in pr-8">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { document.title = 'Frequently Asked Questions | MakaanMart'; }, []);

  const filteredCategories = faqCategories.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !searchQuery ||
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div>
      <section className="bg-gradient-to-br from-navy-950 to-navy-800 py-16">
        <div className="container-custom text-center">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            Find quick answers about buying, selling, and using MakaanMart
          </p>
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              aria-label="Search FAQs"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-navy-900">
        <div className="container-custom max-w-3xl">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-bold text-navy-900 dark:text-white mb-2">No results found</p>
              <p className="text-gray-500">Try a different search term or browse all categories.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map((cat) => (
                <div key={cat.name}>
                  <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" /> {cat.name}
                  </h2>
                  <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 px-5">
                    {cat.items.map((item) => <FAQItem key={item.q} {...item} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
