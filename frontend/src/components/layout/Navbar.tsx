import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Search, Heart, User, Moon, Sun, Menu, X,
  Building2, ChevronDown, Bell, LogOut, LayoutDashboard,
  Plus,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Button, Avatar } from '@/components/ui';
import { cn } from '@/utils';
import { APP_CONFIG } from '@/config';

const navLinks = [
  { label: 'Buy', to: '/listings?purpose=buy' },
  { label: 'Rent', to: '/listings?purpose=rent' },
  { label: 'Commercial', to: '/listings?purpose=commercial' },
  { label: 'Agents', to: '/agents' },
  { label: 'Blog', to: '/blog' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 dark:bg-navy-950/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-navy-800'
          : 'bg-transparent',
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-900 to-emerald-600 flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-navy-900 dark:text-white">
              Makaan<span className="text-emerald-500">Mart</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'nav-link px-3 py-2 rounded-lg',
                    isActive && 'text-navy-900 dark:text-white bg-gray-100 dark:bg-navy-800',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-navy-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {/* Favorites */}
            <Link
              to="/favorites"
              className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-navy-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
              aria-label="Saved properties"
            >
              <Heart className="w-4.5 h-4.5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
                >
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <span className="text-sm font-semibold text-navy-900 dark:text-white max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-navy-800 rounded-2xl shadow-xl border border-gray-100 dark:border-navy-700 overflow-hidden animate-scale-in z-50">
                    <div className="p-3 border-b border-gray-100 dark:border-navy-700">
                      <p className="text-sm font-bold text-navy-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link
                          to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard'}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="emerald" size="sm" onClick={() => navigate('/list-property')}>
                  <Plus className="w-4 h-4" /> List Property
                </Button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-navy-800 pb-4 animate-fade-in">
            <nav className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'nav-link px-4 py-3 rounded-xl font-medium',
                      isActive && 'bg-gray-100 dark:bg-navy-800 text-navy-900 dark:text-white',
                    )
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="flex items-center gap-3 px-4 pt-3 border-t border-gray-100 dark:border-navy-800 mt-2">
                <button onClick={toggleTheme} className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300">
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
                {isAuthenticated ? (
                  <Button variant="ghost" size="sm" onClick={() => { logout(); setMobileOpen(false); }}>
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                      Sign In
                    </Button>
                    <Button variant="emerald" size="sm" onClick={() => { navigate('/list-property'); setMobileOpen(false); }}>
                      List Property
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
