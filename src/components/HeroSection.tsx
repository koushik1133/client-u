import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Calendar, Film, Star, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

interface HeroSectionProps {
  onNavigateBooking: () => void;
  onNavigatePortfolio: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigateBooking, onNavigatePortfolio }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section id="hero" className="relative min-h-screen pt-28 pb-16 px-4 lg:px-8 flex items-center justify-center overflow-hidden">
      
      {/* Background Mesh Orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none animate-glow"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-glow"></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Column: Copy & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-pill px-4 py-2 border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>US CINEMATIC FLASH SHOOT & PRODUCTION STUDIOS</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-['Plus_Jakarta_Sans']">
            Cinematic Flash Shoots <br className="hidden sm:inline" />
            <span className="text-gradient-emerald">& 8K Cinema Production</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
            From high-fashion editorial stills and Hollywood wedding documentaries to RED 8K commercial ads. Experience America’s premier glassmorphic production studios in Los Angeles, New York, and Miami.
          </p>

          {/* Key Feature Bullets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold text-slate-200 max-w-xl mx-auto lg:mx-0">
            {[
              'Profoto 2400W Flash Rigs',
              'RED V-Raptor 8K Cinema',
              'FAA 4K Drone Coverage',
              '24-48h Express Delivery',
              'Nationwide Timezone Booking',
              'Dolby Atmos Color Studio'
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 glass-pill px-3 py-1.5 border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button
              onClick={onNavigateBooking}
              className="btn-primary text-sm px-8 py-4 w-full sm:w-auto justify-center font-bold shadow-2xl group"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Schedule Flash Shoot</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onNavigatePortfolio}
              className="btn-secondary text-sm px-8 py-4 w-full sm:w-auto justify-center"
            >
              <Film className="w-4 h-4 text-emerald-400" />
              <span>Explore Portfolio Reels</span>
            </button>
          </div>

          {/* Social Proof Bar */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-center lg:justify-start gap-8 text-left">
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                <strong className="text-white font-semibold">4.9/5 Rating</strong> across 600+ US shoots
              </p>
            </div>
            <div className="h-8 w-[1px] bg-white/15"></div>
            <div>
              <p className="text-lg font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">120M+</p>
              <p className="text-xs text-slate-400">Reel Impressions</p>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Cinematic Video Card */}
        <div className="lg:col-span-5 relative">
          <div className="glass-panel p-3 border-emerald-500/30 relative overflow-hidden shadow-2xl rounded-2xl group">
            
            {/* Reel Frame Video/Image */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
                alt="Apex Flash Cinematic Reel"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

              {/* Video Player Controls Simulation */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-white hover:bg-white/20 transition-colors border-none cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-white hover:bg-white/20 transition-colors border-none cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>

              {/* Live Badge */}
              <div className="absolute top-4 left-4 glass-pill px-2.5 py-1 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>REC 8K RAW</span>
              </div>

              {/* Bottom Video Meta */}
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <div className="glass-panel p-3 border-white/20 bg-slate-950/70 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Napa Valley Vineyard Estate Gala</p>
                      <p className="text-[10px] text-emerald-300">RED V-Raptor 8K • Napa Valley, CA</p>
                    </div>
                    <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-slate-300">
                      120 FPS
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Gear Card */}
            <div className="absolute -bottom-6 -left-6 glass-panel p-3 border-emerald-500/40 hidden sm:flex items-center gap-3 shadow-2xl animate-float">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Profoto Pro-11 Pack</p>
                <p className="text-[10px] text-slate-300">1/80,000s Freeze Motion</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
