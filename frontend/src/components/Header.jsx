import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Menu, X, Search } from 'lucide-react';
import SearchModal from './SearchModal';

const navLinks = [
  { path: '/explore', label: 'Explore' },
  { path: '/navigate', label: 'Navigation' },
  { path: '/places', label: 'Places' },
  { path: '/live', label: 'Live Conditions' },
  { path: '/parking', label: 'Parking' },
  { path: '/dsa', label: 'DSA & Perf' },
  { path: '/admin', label: 'Admin' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/" className="flex items-center gap-2">
                <Compass className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl text-slate-900 tracking-tight">Meridian</span>
              </NavLink>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-4 items-center">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/emergency"
                className="ml-4 px-4 py-2 rounded-md text-sm font-bold bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
              >
                Emergency
              </NavLink>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-slate-500"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/emergency"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-bold text-danger hover:bg-danger/10"
              >
                Emergency
              </NavLink>
            </div>
          </div>
        )}
      </header>

      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
