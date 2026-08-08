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
    <section id="hero" className="relative min-h-screen pt-32 pb-20 px-4 lg:px-8 flex items-center justify-center overflow-hidden">
      
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-glow"></div>
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] rounded-full bg-rose-500/10 blur-3xl pointer-events-none animate-glow"></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Column: Copy & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          
          {/* Studio Badge */}
          <div className="inline-flex items-center gap-2 glass-pill-gold px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>US PREMIER 8K CINEMATIC FLASH & PRODUCTION STUDIOS</span>
          </div>

          {/* Editorial Serif Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight leading-[1.08]">
            We Craft Cinema <br className="hidden sm:inline" />
            <span className="text-gradient-gold italic font-normal">Masterpieces</span> in 8K RAW
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed mx-auto lg:mx-0">
            From high-fashion editorial stills and commercial ad campaigns to RED 8K cinema productions. Experience America’s premier glassmorphism production stages in Los Angeles, New York, and Miami.
          </p>

          {/* Feature Spec Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-slate-200 max-w-xl mx-auto lg:mx-0">
            {[
              'Profoto 2400W Flash Rigs',
              'RED V-Raptor 8K VV',
              'ARRI Alexa Mini LF',
              'Cooke Anamorphic T1.8',
              '24-48h Express Delivery',
              'Dolby Atmos Sound Stage'
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 glass-pill px-3 py-2 border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button
              onClick={onNavigateBooking}
              className="btn-primary text-sm px-8 py-4 w-full sm:w-auto justify-center font-bold shadow-2xl group"
            >
              <Calendar className="w-4.5 h-4.5 text-black" />
              <span>Schedule 8K Shoot</span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onNavigatePortfolio}
              className="btn-secondary text-sm px-8 py-4 w-full sm:w-auto justify-center"
            >
              <Film className="w-4.5 h-4.5 text-amber-400" />
              <span>Watch Film Reels</span>
            </button>
          </div>

          {/* Social Proof & Metrics */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-center lg:justify-start gap-8 text-left">
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                <strong className="text-white font-bold">4.99/5 Rating</strong> across 750+ US Shoots
              </p>
            </div>
            <div className="h-8 w-[1px] bg-white/15"></div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight font-serif text-gradient-gold">150M+</p>
              <p className="text-xs text-slate-400 font-mono">Global Film Views</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Video Preview Card */}
        <div className="lg:col-span-5 relative">
          <div className="glass-panel p-3.5 border-amber-500/30 relative overflow-hidden shadow-2xl rounded-3xl group">
            
            {/* Reel Frame Video/Image */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
                alt="Apex Flash Cinematic Reel"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#04060a] via-transparent to-black/30"></div>

              {/* Video Player Controls */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-white hover:bg-white/20 transition-colors border-none cursor-pointer"
                  title="Toggle Audio"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-white hover:bg-white/20 transition-colors border-none cursor-pointer"
                  title="Toggle Play"
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-white" />}
                </button>
              </div>

              {/* Camera Status Badge */}
              <div className="absolute top-4 left-4 glass-pill-gold px-3 py-1 text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-rec-pulse"></span>
                <span>REC 8K RAW • 120FPS</span>
              </div>

              {/* Bottom Metadata Panel */}
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <div className="glass-panel p-3.5 border-white/20 bg-slate-950/80 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white font-serif">Beverly Hills High Fashion Gala</p>
                      <p className="text-[10px] text-amber-400 font-mono">RED V-Raptor 8K • Los Angeles Stage A</p>
                    </div>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-bold">
                      ANAMORPHIC
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Equipment Spec Pill */}
            <div className="absolute -bottom-6 -left-6 glass-panel p-3 border-amber-500/40 hidden sm:flex items-center gap-3 shadow-2xl animate-float">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white font-serif">Profoto Pro-11 Flash</p>
                <p className="text-[10px] text-slate-300 font-mono">1/80,000s High Speed Sync</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

