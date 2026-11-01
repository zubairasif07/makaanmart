import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Building2, Users, MapPin, Shield, CheckCircle2,
} from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';
import PropertyCard from '@/components/property/PropertyCard';
import { PropertyCardSkeleton, Badge, StarRating, Avatar } from '@/components/ui';
import { getAgents, getBlogPosts, getCities, getFeaturedProperties, getLatestProperties, getPublicStats, type PublicStats } from '@/services/api';
import { PROPERTY_TYPES } from '@/config';
import { useIntersectionObserver } from '@/hooks';
import { formatDate, cn } from '@/utils';
import type { Agent, BlogPost, City, Property } from '@/types';

// ─── Stats strip ─────────────────────────────────────────────────────────────
const statCards = [
  { label: 'Active Listings', field: 'listings', icon: Building2 },
  { label: 'Cities Represented', field: 'cities', icon: MapPin },
  { label: 'Registered Buyers', field: 'buyers', icon: Users },
  { label: 'Registered Sellers', field: 'sellers', icon: Shield },
] as const;

// ─── How it works ─────────────────────────────────────────────────────────────
const howItWorks = [
  {
    step: '01', icon: '🔍',
    title: 'Search',
    desc: 'Use our advanced filters to find properties that match your exact requirements.',
  },
  {
    step: '02', icon: '💬',
    title: 'Connect',
    desc: 'Directly contact verified agents and sellers via call, WhatsApp, or email.',
  },
  {
    step: '03', icon: '🏠',
    title: 'Visit',
    desc: 'Schedule a physical or virtual viewing at a time that suits you.',
  },
  {
    step: '04', icon: '🤝',
    title: 'Close',
    desc: 'Finalise the deal with our guided documentation and handover support.',
  },
];

// ─── AnimatedSection ──────────────────────────────────────────────────────────
function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className,
      )}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Property[]>([]);
  const [latest, setLatest] = useState<Property[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [siteStats, setSiteStats] = useState<PublicStats>({ listings: 0, cities: 0, buyers: 0, sellers: 0 });
  const [loading, setLoading] = useState(true);
  const [homeError, setHomeError] = useState('');

  useEffect(() => {
    document.title = 'MakaanMart — Find Your Dream Home in Pakistan';
    Promise.all([getFeaturedProperties(), getLatestProperties(8), getPublicStats(), getCities(), getAgents(), getBlogPosts()]).then(([f, l, stats, cityData, agentData, blogPosts]) => {
      setFeatured(f);
      setLatest(l);
      setSiteStats(stats);
      setCities(cityData);
      setAgents(agentData.slice(0, 5));
      setArticles(blogPosts.slice(0, 3));
    }).catch((error: unknown) => {
      setHomeError(error instanceof Error ? error.message : 'Could not load property listings.');
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80"
            alt="Hero background"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/70 to-transparent" />
        </div>

        <div className="container-custom relative z-10 pt-20 pb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-5">
              <Badge variant="verified" className="text-sm px-3 py-1">
                <Shield className="w-3.5 h-3.5" />                 Pakistan's Property Marketplace
              </Badge>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-5 text-balance">
              Find Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                {' '}Perfect{' '}
              </span>
              Home
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              Search available homes, apartments, plots, and commercial spaces. Buy, rent, or list a property in one place.
            </p>
            <SearchBar variant="hero" />
            {homeError && <p role="alert" className="mt-4 rounded-lg bg-white/90 p-3 text-sm text-red-600">{homeError}</p>}
          </div>
        </div>

        {/* Stats floating card */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container-custom pb-0">
            <div className="hidden md:grid grid-cols-4 gap-px bg-gray-200 dark:bg-navy-700 rounded-t-2xl overflow-hidden shadow-xl">
              {statCards.map(({ label, field, icon: Icon }) => (
                <div key={label} className="bg-white dark:bg-navy-800 px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-navy-900 dark:text-white">{siteStats[field].toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROPERTIES ─────────────────────────────────────────────── */}
      <section className="pt-16 md:pt-24 pb-16 bg-gray-50 dark:bg-navy-900">
        <div className="container-custom">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-emerald-600 font-semibold text-sm mb-1">✦ Handpicked for You</p>
                <h2 className="section-title">Featured Properties</h2>
                <p className="section-subtitle">Premium, verified listings from top dealers</p>
              </div>
              <Link to="/listings?featured=true" className="hidden md:flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <p className="rounded-2xl bg-white p-6 text-sm text-gray-500 dark:bg-navy-800">There are no featured listings right now. Browse all properties to see what is available.</p>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link to="/listings?featured=true" className="btn-secondary inline-flex items-center gap-2">
              View All Featured <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BROWSE BY CITY ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-navy-950">
        <div className="container-custom">
          <AnimatedSection>
            <div className="text-center mb-10">
              <p className="text-emerald-600 font-semibold text-sm mb-1">✦ Explore by Location</p>
              <h2 className="section-title">Browse by City</h2>
              <p className="section-subtitle">Find properties in Pakistan's most vibrant cities</p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {cities.map((city) => (
                <Link
                  key={city.id}
                  to={`/listings?city=${city.name}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm">{city.name}</p>
                    <p className="text-white/70 text-xs">{city.listings.toLocaleString()} listings</p>
                  </div>
                </Link>
              ))}
            </div>
            {!loading && cities.length === 0 && <p className="mt-4 text-center text-sm text-gray-500">Cities will appear here as listings are added.</p>}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── BROWSE BY TYPE ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900">
        <div className="container-custom">
          <AnimatedSection>
            <div className="text-center mb-10">
              <p className="text-emerald-600 font-semibold text-sm mb-1">✦ All Property Types</p>
              <h2 className="section-title">What Are You Looking For?</h2>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
              {Object.entries(PROPERTY_TYPES).map(([key, { label, icon }]) => (
                <Link
                  key={key}
                  to={`/listings?type=${key}`}
                  className="group flex flex-col items-center gap-2 p-4 bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200 text-center"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform duration-200">{icon}</span>
                  <span className="text-xs font-semibold text-navy-800 dark:text-gray-200 leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── LATEST LISTINGS ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-navy-950">
        <div className="container-custom">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-emerald-600 font-semibold text-sm mb-1">✦ Fresh on Market</p>
                <h2 className="section-title">Latest Listings</h2>
                <p className="section-subtitle">Newly added properties across Pakistan</p>
              </div>
              <Link to="/listings?sort=newest" className="hidden md:flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }, (_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : latest.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latest.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <p className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-500 dark:bg-navy-800">No listings are available yet.</p>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-navy-950 to-navy-800 dark:from-navy-950 dark:to-navy-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-400 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <AnimatedSection>
            <div className="text-center mb-14">
              <p className="text-emerald-400 font-semibold text-sm mb-2">✦ Simple Process</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">How MakaanMart Works</h2>
              <p className="text-gray-400 mt-2">From search to keys in hand — in just 4 steps</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map(({ step, icon, title, desc }) => (
              <AnimatedSection key={step}>
                <div className="relative text-center group">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-3xl mb-4 group-hover:bg-emerald-600/20 transition-colors">
                    {icon}
                  </div>
                  <div className="absolute -top-2 -left-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TOP AGENTS ──────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900">
        <div className="container-custom">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-emerald-600 font-semibold text-sm mb-1">✦ Expert Dealers</p>
                <h2 className="section-title">Top Agents & Dealers</h2>
                <p className="section-subtitle">Work with Pakistan's most trusted property professionals</p>
              </div>
              <Link to="/agents" className="hidden md:flex items-center gap-1 text-sm font-semibold text-emerald-600">
                All Agents <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  to={`/agents/${agent.id}`}
                  className="card p-5 text-center group"
                >
                  <div className="relative inline-block mb-3">
                    <Avatar src={agent.avatar} name={agent.name} size="xl" className="mx-auto" />
                    {agent.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-navy-900 dark:text-white text-sm mb-0.5 truncate">{agent.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{agent.agency ?? 'Independent'}</p>
                  <StarRating rating={agent.rating} showValue />
                  <p className="text-xs text-gray-400 mt-1">{agent.totalListings} listings</p>
                </Link>
              ))}
            </div>
            {!loading && agents.length === 0 && <p className="mt-4 text-center text-sm text-gray-500">Seller profiles will appear here when sellers join.</p>}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── MARKETPLACE FEATURES ────────────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-navy-950">
        <div className="container-custom">
          <AnimatedSection>
            <div className="text-center mb-10">
              <p className="text-emerald-600 font-semibold text-sm mb-1">✦ Built for Property Search</p>
              <h2 className="section-title">A Clearer Way to Find Property</h2>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: 'Search your way', text: 'Filter active property listings by location, budget, type, and features.' },
                { title: 'Save what matters', text: 'Keep favorite properties and saved searches with your account.' },
                { title: 'Contact directly', text: 'Send inquiries to listing owners and follow replies from your dashboard.' },
              ].map(({ title, text }) => (
                <div key={title} className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-100 dark:border-navy-700">
                  <h3 className="font-bold text-navy-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── BLOG ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900">
        <div className="container-custom">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-emerald-600 font-semibold text-sm mb-1">✦ Insights & Guides</p>
                <h2 className="section-title">Real Estate Blog</h2>
              </div>
              <Link to="/blog" className="hidden md:flex items-center gap-1 text-sm font-semibold text-emerald-600">
                All Articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="card group overflow-hidden">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-navy-900 dark:text-white text-sm leading-snug line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{post.author}</span>
                      <span>{post.readTime} min read · {formatDate(post.publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {!loading && articles.length === 0 && <p className="text-sm text-gray-500">Articles will appear here when published.</p>}
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
