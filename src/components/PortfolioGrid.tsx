import React, { useState } from 'react';
import { Eye, Play, X, MapPin, User as UserIcon, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PortfolioItem } from '../types/flashCinema';
import { PORTFOLIO_ITEMS } from '../data/mockData';

export const PortfolioGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const categories = ['All', 'Commercial Ads', 'Fashion Editorial', 'Music Videos', 'Film Documentaries'];

  const filteredItems = activeCategory === 'All'
    ? PORTFOLIO_ITEMS
    : PORTFOLIO_ITEMS.filter(item => item.category === activeCategory || (activeCategory === 'Commercial Ads' && item.category === 'Commercial Ads'));

  return (
    <section id="portfolio" className="py-24 px-4 lg:px-8 relative">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Editorial Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 glass-pill-gold px-4 py-1.5 text-xs font-mono font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>8K CINEMATIC REELS SHOWCASE</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Master Reels & <span className="text-gradient-gold italic font-normal">Fashion Stills</span>
          </h2>
          <p className="text-base text-slate-300 font-light max-w-2xl mx-auto">
            Explore our award-winning productions filmed across Hollywood Hills, Manhattan Penthouses, and South Beach Miami soundstages.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all border-none cursor-pointer ${
                activeCategory === cat
                  ? 'btn-primary text-black shadow-lg scale-105'
                  : 'glass-pill text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => {
                setActiveModalItem(item);
                setActiveImageIndex(0);
              }}
              className="glass-panel p-5 border-white/15 cursor-pointer group hover:border-amber-500/50 transition-all duration-500 flex flex-col justify-between"
            >
              {/* Media Container */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 bg-slate-950">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#04060a] via-transparent to-black/30 opacity-90"></div>

                {/* Play Button Icon */}
                {item.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-black translate-x-0.5" />
                    </div>
                  </div>
                )}

                {/* Category Pill */}
                <div className="absolute top-3.5 left-3.5 glass-pill-gold px-3 py-1 text-[11px] font-mono font-bold text-amber-300">
                  {item.category}
                </div>

                {/* Director Badge */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-slate-200">
                  <span className="flex items-center gap-1.5 font-semibold text-white font-mono">
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dir: {item.director}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 bg-black/60 px-2 py-0.5 rounded-md border border-white/10">
                    <Eye className="w-3.5 h-3.5" /> {item.views}
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              {/* Camera & Lens Meta */}
              <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="truncate max-w-[210px]">🎥 {item.cameraGear}</span>
                <span className="text-amber-400 font-bold">🔍 {item.lens}</span>
              </div>
            </div>
          ))}
        </div>

        {/* LIGHTBOX MODAL */}
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
            <div className="relative w-full max-w-4xl glass-panel p-6 sm:p-8 border-white/20 max-h-[90vh] overflow-y-auto space-y-6">
              
              {/* Close Button */}
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors border-none cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                  {activeModalItem.category} • {activeModalItem.client}
                </span>
                <h3 className="text-3xl font-serif font-bold text-white mt-1">
                  {activeModalItem.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{activeModalItem.location}</span>
                </p>
              </div>

              {/* Media Player or Photo Gallery Slider */}
              {activeModalItem.videoUrl ? (
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-white/15">
                  <video
                    src={activeModalItem.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-white/15">
                    <img
                      src={activeModalItem.galleryImages[activeImageIndex] || activeModalItem.coverImage}
                      alt="Gallery View"
                      className="w-full h-full object-cover"
                    />

                    {activeModalItem.galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImageIndex((activeImageIndex - 1 + activeModalItem.galleryImages.length) % activeModalItem.galleryImages.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white border-none cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActiveImageIndex((activeImageIndex + 1) % activeModalItem.galleryImages.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white border-none cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {activeModalItem.galleryImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Thumb"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-24 h-16 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                          activeImageIndex === idx ? 'border-amber-400 scale-105 shadow-lg' : 'border-transparent opacity-60'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">CAMERA RIG</span>
                  <strong className="text-white">{activeModalItem.cameraGear}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CINEMA LENS</span>
                  <strong className="text-amber-400">{activeModalItem.lens}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DIRECTOR</span>
                  <strong className="text-white">{activeModalItem.director}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">REEL VIEWS</span>
                  <strong className="text-rose-400">{activeModalItem.views}</strong>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};

