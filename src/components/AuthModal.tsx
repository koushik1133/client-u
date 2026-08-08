import React, { useState } from 'react';
import { X, User as UserIcon, Lock, Mail, Phone, Building, Sparkles, ShieldCheck, Camera } from 'lucide-react';
import type { User, UserRole } from '../types/flashCinema';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('client');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (tab === 'signup' && !name) {
      setError('Please enter your full name.');
      return;
    }

    // Mock Login / Signup creation
    const loggedUser: User = {
      id: 'user-' + Date.now(),
      name: tab === 'signup' ? name : email.split('@')[0].toUpperCase(),
      email,
      role,
      company: company || 'Vogue US Haute Couture',
      phone: phone || '+1 (310) 555-0199',
      timezone: 'PST',
      createdAt: new Date().toISOString()
    };

    onLoginSuccess(loggedUser);
    onClose();
  };

  const handleQuickDemoLogin = (demoRole: UserRole) => {
    let demoUser: User;
    if (demoRole === 'director') {
      demoUser = {
        id: 'director-1',
        name: 'Marcus Vance',
        email: 'marcus.vance@apexflashstudios.com',
        role: 'director',
        company: 'Apex Flash Cinema Studios US',
        phone: '+1 (310) 555-0188',
        timezone: 'PST',
        createdAt: '2025-01-01T00:00:00Z'
      };
    } else {
      demoUser = {
        id: 'client-demo',
        name: 'Sarah Jenkins',
        email: 'sarah.j@vogue.com',
        role: 'client',
        company: 'Vogue US Creative Team',
        phone: '+1 (310) 555-0199',
        timezone: 'PST',
        createdAt: '2026-08-01T00:00:00Z'
      };
    }
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel p-6 border border-slate-700 shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors border-none cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-3">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">
            {tab === 'signin' ? 'Sign In to APEX FLASH' : 'Create US Client Account'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Access your bookings, 4K media proofing room & schedule shoots nationwide
          </p>
        </div>

        {/* Quick Demo Login Banner */}
        <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/30">
          <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 mb-2 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant 1-Click US Demo Logins</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('client')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>US Client Demo</span>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('director')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Director Demo</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-5 border border-white/10">
          <button
            type="button"
            onClick={() => { setTab('signin'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all border-none cursor-pointer ${
              tab === 'signin' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all border-none cursor-pointer ${
              tab === 'signup' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="sarah.j@vogue.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          {tab === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+1 (310) 555-0199"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Brand (Optional)</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Vogue US / Hollywood Fashion"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'client'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>US Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('director')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'director'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Director / Staff</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full btn-primary justify-center py-3 mt-4 text-sm"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>{tab === 'signin' ? 'Sign In & Access Portal' : 'Create Account'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
