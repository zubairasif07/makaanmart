import React, { useEffect } from 'react';
import {
  Shield, Users, MapPin, Award, TrendingUp, Heart,
  Building2, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/utils';

const values = [
  { icon: Shield, title: 'Trust & Transparency', desc: 'Every listing goes through our verification process. We verify property documents and seller identities so you deal with confidence.' },
  { icon: Users, title: 'Community First', desc: 'We connect buyers, sellers, and agents in one seamless marketplace — creating a thriving real estate community across Pakistan.' },
  { icon: TrendingUp, title: 'Data-Driven Insights', desc: 'Our platform uses market data to provide fair pricing recommendations and trend analysis for smarter property decisions.' },
  { icon: Heart, title: 'Customer-Centric', desc: 'From first search to final handshake, our team is dedicated to making your real estate journey smooth and hassle-free.' },
];

const team = [
  { name: 'Faisal Iqbal', role: 'CEO & Founder', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
  { name: 'Ayesha Tariq', role: 'Head of Product', img: 'https://images.unsplash.com/photo-1494790108755-2616b612b898?w=300&q=80' },
  { name: 'Hassan Ali', role: 'CTO', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80' },
  { name: 'Maryam Khan', role: 'Head of Marketing', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80' },
];

export default function AboutPage() {
  useEffect(() => { document.title = 'About Us | MakaanMart'; }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-950 to-navy-800 py-20">
        <div className="container-custom text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-white/80 text-sm font-medium">Pakistan's #1 Property Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 text-balance">
            Redefining Real Estate<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">in Pakistan</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            MakaanMart was founded with a simple mission: make property buying, selling, and renting accessible, transparent, and enjoyable for every Pakistani.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-white dark:bg-navy-950">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-emerald-600 font-semibold text-sm mb-2">✦ Our Story</p>
              <h2 className="text-3xl font-extrabold text-navy-900 dark:text-white mb-4">From a vision to Pakistan's fastest-growing property platform</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Founded in 2020, MakaanMart started as a small directory of verified properties in Lahore. Today, we serve millions of users across 45 cities with over 50,000 active listings.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Our technology-first approach, combined with on-the-ground verification teams, ensures every property you see is genuine and accurately represented. We partner with over 3,500 verified agents and agencies to bring you the best deals.
              </p>
              <div className="grid grid-cols-3 gap-6 mt-8">
                {[
                  { val: '50K+', label: 'Listings' },
                  { val: '45+', label: 'Cities' },
                  { val: '200K+', label: 'Users' },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-extrabold text-navy-900 dark:text-white">{val}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80"
                alt="MakaanMart office"
                className="rounded-2xl shadow-xl"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -left-6 bg-emerald-500 text-white rounded-2xl p-5 shadow-lg">
                <p className="text-3xl font-extrabold">4+</p>
                <p className="text-sm">Years of Trust</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-emerald-600 font-semibold text-sm mb-2">✦ What Drives Us</p>
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-100 dark:border-navy-700 hover:shadow-card-hover transition-all hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-navy-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white dark:bg-navy-950">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-emerald-600 font-semibold text-sm mb-2">✦ Leadership</p>
            <h2 className="section-title">Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((m) => (
              <div key={m.name} className="text-center group">
                <div className="w-28 h-28 mx-auto rounded-full overflow-hidden mb-3 ring-4 ring-gray-100 dark:ring-navy-700 group-hover:ring-emerald-500 transition-all">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="font-bold text-navy-900 dark:text-white">{m.name}</p>
                <p className="text-sm text-gray-500">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
