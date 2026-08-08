import React from 'react';
import type { User, Booking } from '../types/flashCinema';
import { SAMPLE_BOOKINGS } from '../data/mockData';
import { Film, Calendar, Download, Play, Shield } from 'lucide-react';

interface ClientDashboardProps {
  user: User | null;
  userBookings: Booking[];
  onOpenAuthModal: () => void;
  onNavigateBooking: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  user,
  userBookings,
  onOpenAuthModal,
  onNavigateBooking
}) => {
  const pipelineSteps = [
    { key: 'booked', label: '1. Booked' },
    { key: 'pre-production', label: '2. Pre-Production' },
    { key: 'shoot-day', label: '3. Shoot Day' },
    { key: 'color-grading', label: '4. Color Grading' },
    { key: 'delivered', label: '5. Delivered' }
  ];

  // Combine demo bookings if logged in or empty
  const allBookings = userBookings.length > 0 ? userBookings : SAMPLE_BOOKINGS;
  const activeBooking = allBookings[0];

  if (!user) {
    return (
      <section id="dashboard" className="py-24 px-4 lg:px-8 relative min-h-[70vh] flex items-center justify-center">
        <div className="glass-panel p-8 sm:p-10 max-w-lg mx-auto border-amber-500/40 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-3xl font-serif font-bold text-white">Authenticated Client Portal</h3>
            <p className="text-xs text-slate-300 font-light mt-2">
              Sign in to view your scheduled US shoots, track editing pipeline status, and access your 4K media proofing gallery.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onOpenAuthModal}
              className="btn-primary text-sm py-3.5 px-6 justify-center"
            >
              <span>Sign In / Demo Login</span>
            </button>
            <button
              onClick={onNavigateBooking}
              className="btn-secondary text-sm py-3.5 px-6 justify-center"
            >
              <span>Book New Shoot</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="dashboard" className="py-24 px-4 lg:px-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="glass-panel p-6 sm:p-8 border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-[2px] shadow-2xl">
              <div className="w-full h-full bg-[#04060a] rounded-[14px] flex items-center justify-center text-2xl font-bold text-amber-400 uppercase">
                {user.name.charAt(0)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-serif font-bold text-white">{user.name}</h2>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold uppercase border border-amber-500/30">
                  {user.role} Account
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">{user.company} • {user.email}</p>
            </div>
          </div>

          <button
            onClick={onNavigateBooking}
            className="btn-primary text-xs py-3 px-5"
          >
            <Calendar className="w-4 h-4 text-black" />
            <span>Schedule Another Shoot</span>
          </button>
        </div>

        {/* Active Shoot Pipeline Tracker */}
        {activeBooking && (
          <div className="glass-panel p-6 sm:p-8 space-y-6 border-amber-500/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">ACTIVE SHOOT #{activeBooking.id}</span>
                <h3 className="text-2xl font-serif font-bold text-white mt-1">
                  {activeBooking.category.title}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> {activeBooking.date}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{activeBooking.convertedTime}</p>
              </div>
            </div>

            {/* Pipeline Step Bar */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Production Status Timeline</label>
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
                {pipelineSteps.map(step => {
                  const isCurrent = activeBooking.status === step.key;
                  return (
                    <div
                      key={step.key}
                      className={`py-3 px-1 rounded-xl font-bold border transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-black border-amber-500 shadow-xl'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      {step.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Venue & Booking Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-950/80 border border-white/10 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">US STAGE / LOCATION</span>
                <strong className="text-white">{activeBooking.location.name} ({activeBooking.location.area})</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TIMEZONE</span>
                <strong className="text-amber-300">{activeBooking.clientTimezone.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">INVOICE TOTAL</span>
                <strong className="text-amber-400">${activeBooking.totalUSD.toLocaleString('en-US')} (Paid)</strong>
              </div>
            </div>
          </div>
        )}

        {/* Media Proofing Vault */}
        {activeBooking && activeBooking.proofMedia && (
          <div className="glass-panel p-6 sm:p-8 space-y-6 border-white/15">
            <div>
              <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
                <Film className="w-6 h-6 text-amber-400" />
                <span>4K Media Proofing Room & Download Vault</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Preview your draft stills and color-graded teasers uploaded by Lead Director Marcus Vance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activeBooking.proofMedia.map(proof => (
                <div key={proof.id} className="glass-panel p-5 border-white/10 space-y-3">
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950">
                    <img src={proof.thumbnail} alt={proof.title} className="w-full h-full object-cover" />
                    {proof.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="w-12 h-12 text-amber-400 fill-amber-400" />
                      </div>
                    )}
                    <span className="absolute top-3 right-3 text-[10px] font-mono font-bold bg-black/80 text-amber-400 px-2.5 py-1 rounded border border-amber-500/30 uppercase">
                      {proof.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-serif font-bold text-white">{proof.title}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">{proof.resolution} • {proof.fileSize}</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => alert(`Downloading high-resolution ${proof.title}...`)}
                      className="btn-primary text-xs py-2.5 px-4 flex-1 justify-center"
                    >
                      <Download className="w-3.5 h-3.5 text-black" />
                      <span>Download RAW File</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

