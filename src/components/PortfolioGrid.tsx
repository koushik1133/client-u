import React, { useState } from 'react';
import { Eye, Play, X, MapPin, User as UserIcon, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PortfolioItem } from '../types/flashCinema';
import { PORTFOLIO_ITEMS } from '../data/mockData';

export const PortfolioGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const categories = ['All', 'Wedding Films', 'Fashion Flash', 'Commercial Ads', 'Drone Cinema'];

  const filteredItems = activeCategory === 'All'
    ? PORTFOLIO_ITEMS
    : PORTFOLIO_ITEMS.filter(item => item.category === activeCategory);

  return (
    <section id="portfolio" className="py-20 px-4 lg:px-8 relative">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 border-amber-500/40 text-amber-300 text-xs font-bold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CINEMATIC SHOWCASE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
            Master Reels & <span className="text-gradient-gold">Flash Photography</span>
          </h2>
          <p className="text-sm text-gray-300 mt-2">
            Explore our award-winning productions filmed across Hyderabad, Taj Falaknuma Palace, and Jubilee Hills Flagship Stage.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                activeCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'glass-pill text-gray-300 hover:text-white hover:bg-white/10'
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
              className="glass-panel p-4 border-white/15 cursor-pointer group hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Media Container */}
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-slate-950">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

                {/* Play Badge if video */}
                {item.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-slate-950 translate-x-0.5" />
                    </div>
                  </div>
                )}

                {/* Category Pill */}
                <div className="absolute top-3 left-3 glass-pill px-3 py-1 text-[11px] font-bold text-amber-300">
                  {item.category}
                </div>

                {/* Director Badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-200">
                  <span className="flex items-center gap-1 font-semibold text-white">
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dir: {item.director}</span>
                  </span>
                  <span className="flex items-center gap-2 text-[11px] font-mono text-amber-300">
                    <Eye className="w-3.5 h-3.5" /> {item.views}
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors font-['Outfit']">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              {/* Camera & Lens Meta */}
              <div className="pt-3 border-t border-white/10 mt-4 flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span className="truncate max-w-[200px]">📷 {item.cameraGear}</span>
                <span className="text-amber-400 font-semibold">🔍 {item.lens}</span>
              </div>
            </div>
          ))}
        </div>

        {/* LIGHTBOX MODAL */}
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fadeIn">
            <div className="relative w-full max-w-4xl glass-panel p-6 border-white/20 max-h-[90vh] overflow-y-auto space-y-6">
              
              {/* Close Button */}
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors border-none cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  {activeModalItem.category} • {activeModalItem.client}
                </span>
                <h3 className="text-2xl font-extrabold text-white font-['Outfit'] mt-0.5">
                  {activeModalItem.title}
                </h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{activeModalItem.location}</span>
                </p>
              </div>

              {/* Media Player or Photo Gallery Slider */}
              {activeModalItem.videoUrl ? (
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 shadow-2xl border border-white/10">
                  <video
                    src={activeModalItem.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 border border-white/10">
                    <img
                      src={activeModalItem.galleryImages[activeImageIndex] || activeModalItem.coverImage}
                      alt="Gallery View"
                      className="w-full h-full object-cover"
                    />

                    {activeModalItem.galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImageIndex((activeImageIndex - 1 + activeModalItem.galleryImages.length) % activeModalItem.galleryImages.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white border-none cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActiveImageIndex((activeImageIndex + 1) % activeModalItem.galleryImages.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white border-none cursor-pointer"
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
                        className={`w-20 h-14 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                          activeImageIndex === idx ? 'border-amber-400 scale-105' : 'border-transparent opacity-60'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">CINEMA CAMERA</span>
                  <strong className="text-white font-mono">{activeModalItem.cameraGear}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">CINEMA LENS</span>
                  <strong className="text-amber-400 font-mono">{activeModalItem.lens}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">DIRECTOR</span>
                  <strong className="text-white font-mono">{activeModalItem.director}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">COLLECTIVE VIEWS</span>
                  <strong className="text-emerald-400 font-mono">{activeModalItem.views}</strong>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
