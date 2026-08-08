import React, { useState } from 'react';
import { Camera, Clock, User as UserIcon, LogOut, ChevronDown, Sparkles, Film, Menu, X } from 'lucide-react';
import type { User, TimezoneOption } from '../types/flashCinema';
import { TIMEZONES } from '../data/mockData';

interface NavbarProps {
  user: User | null;
  selectedTimezone: TimezoneOption;
  onSelectTimezone: (tz: TimezoneOption) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onNavigateSection: (sectionId: string) => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  selectedTimezone,
  onSelectTimezone,
  onOpenAuthModal,
  onLogout,
  onNavigateSection,
  activeSection
}) => {
  const [tzDropdownOpen, setTzDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'portfolio', label: 'Film Reels' },
    { id: 'booking', label: 'Book 8K Shoot' },
    { id: 'calculator', label: 'Packages' },
    { id: 'gear', label: 'Studio Vault' },
    { id: 'dashboard', label: user ? 'Client Portal' : 'Portal Demo' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
      <div className="max-w-7xl mx-auto glass-panel px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-white/10 shadow-2xl">
        
        {/* Brand Logo */}
        <button 
          onClick={() => {
            onNavigateSection('hero');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 sm:gap-3 group text-left bg-transparent border-none cursor-pointer p-0"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-rose-500 p-[1px] flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#04060a] rounded-[11px] flex items-center justify-center">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="font-serif text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>APEX FLASH</span>
              <span className="text-gradient-gold font-sans text-sm tracking-widest font-extrabold uppercase bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                STUDIOS
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] tracking-widest text-slate-400 font-mono flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-rec-pulse inline-block"></span>
                LIVE REC
              </span>
              <span>• LA</span>
              <span>• NYC</span>
              <span>• MIA</span>
            </div>
          </div>
        </button>

        {/* Nav Links - Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => onNavigateSection(link.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border-none cursor-pointer ${
                activeSection === link.id
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right Controls: Timezone + Auth + Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Timezone Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTzDropdownOpen(!tzDropdownOpen)}
              className="glass-pill px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-semibold text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer"
            >
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>{selectedTimezone.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
            </button>

            {tzDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-panel p-2 z-50 border border-white/15 shadow-2xl">
                <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Select US Studio Timezone
                </div>
                <div className="space-y-1 mt-1">
                  {TIMEZONES.map(tz => (
                    <button
                      key={tz.id}
                      onClick={() => {
                        onSelectTimezone(tz);
                        setTzDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors border-none cursor-pointer ${
                        selectedTimezone.id === tz.id
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                          : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{tz.name}</span>
                      <span className="text-[10px] font-mono text-amber-400">{tz.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 glass-pill px-2.5 sm:px-3 py-1.5 border-amber-500/30 hover:border-amber-400 transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center text-[10px] sm:text-xs font-bold text-black uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-white hidden md:inline">{user.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 glass-panel p-2 z-50 border border-white/15">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onNavigateSection('dashboard');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10 flex items-center gap-2 border-none cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>My Shoots & Media</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 border-none cursor-pointer mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn-secondary text-[11px] sm:text-xs py-1.5 px-2.5 sm:px-3 flex items-center gap-1"
            >
              <UserIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Desktop CTA */}
          <button
            onClick={() => onNavigateSection('booking')}
            className="btn-primary text-xs py-1.5 px-3.5 shadow-lg flex items-center gap-1.5 hidden sm:flex"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Book 8K Shoot</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-white/10 border-none cursor-pointer flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-7xl mx-auto glass-panel p-4 border-white/15 shadow-2xl space-y-2">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => {
                onNavigateSection(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-medium transition-colors border-none cursor-pointer flex items-center justify-between ${
                activeSection === link.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>{link.label}</span>
              {activeSection === link.id && <Sparkles className="w-4 h-4 text-amber-400" />}
            </button>
          ))}

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigateSection('booking');
                setMobileMenuOpen(false);
              }}
              className="w-full btn-primary text-sm py-3 justify-center"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Schedule US 8K Shoot</span>
            </button>
          </div>
        </div>
      )}

    </nav>
  );
};

