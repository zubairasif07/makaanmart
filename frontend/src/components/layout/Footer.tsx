import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Phone, Mail, MapPin,
} from 'lucide-react';
import { APP_CONFIG } from '@/config';

const footerLinks = {
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Blog', to: '/blog' },
    { label: 'Press', to: '/press' },
    { label: 'Contact', to: '/contact' },
  ],
  Properties: [
    { label: 'Houses for Sale', to: '/listings?type=house&purpose=buy' },
    { label: 'Apartments for Rent', to: '/listings?type=apartment&purpose=rent' },
    { label: 'Plots & Land', to: '/listings?type=plot' },
    { label: 'Commercial', to: '/listings?purpose=commercial' },
    { label: 'New Projects', to: '/listings?type=project' },
  ],
  Support: [
    { label: 'FAQ', to: '/faq' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Sitemap', to: '/sitemap' },
  ],
};

const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan'];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-gray-300">
      <div className="container-custom pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-700 to-emerald-600 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Makaan<span className="text-emerald-400">Mart</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Pakistan's most trusted real estate marketplace. Buy, rent, or sell properties with confidence.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Cities */}
        <div className="border-t border-navy-800 pt-8 mb-8">
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">Top Cities</h4>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <Link
                key={city}
                to={`/listings?city=${city}`}
                className="px-3 py-1 rounded-lg bg-navy-800 text-sm text-gray-400 hover:text-white hover:bg-navy-700 transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact + Copyright */}
        <div className="border-t border-navy-800 pt-8 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> {APP_CONFIG.contactPhone}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> {APP_CONFIG.contactEmail}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Lahore, Pakistan
            </span>
          </div>
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} MakaanMart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
