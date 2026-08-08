import React from 'react';
import { Camera, Award, Zap } from 'lucide-react';
import { GEAR_INVENTORY, CREW_MEMBERS } from '../data/mockData';

export const GearAndCrew: React.FC = () => {
  return (
    <section id="gear" className="py-24 px-4 lg:px-8 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 glass-pill-gold px-4 py-1.5 text-xs font-mono font-bold uppercase">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>US STUDIO EQUIPMENT & DIRECTORS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Master Gear Vault & <span className="text-gradient-gold italic font-normal">Award Directors</span>
          </h2>
          <p className="text-base text-slate-300 font-light max-w-2xl mx-auto">
            Our Sunset Blvd Los Angeles & SoHo NYC flagship stages house state-of-the-art RED 8K cinema cameras, Profoto flash generators, and Emmy/Cannes award-winning cinematographers.
          </p>
        </div>

        {/* Section 1: Gear Vault */}
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-400" />
            <span>High-Speed US Cinema Gear Inventory</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GEAR_INVENTORY.map(item => (
              <div key={item.id} className="glass-panel p-4 border-white/15 space-y-3 group hover:border-amber-500/50 transition-all duration-300">
                <div className="h-40 rounded-2xl overflow-hidden bg-slate-950">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">{item.category} • {item.brand}</span>
                  <h4 className="text-base font-serif font-bold text-white mt-0.5">{item.name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-1">{item.specs}</p>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Stage Ready
                  </span>
                  <span className="text-amber-300 font-bold">${item.dailyRateUSD.toLocaleString('en-US')}/day</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Director Bios */}
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Meet Our US Directors & Photographers</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CREW_MEMBERS.map(member => (
              <div key={member.id} className="glass-panel p-6 sm:p-8 border-white/15 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-amber-500/40 shadow-2xl shrink-0"
                />
                <div className="space-y-2.5 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-xl font-serif font-bold text-white">{member.name}</h4>
                    <span className="text-xs text-amber-400 font-mono font-bold">{member.instagram}</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-amber-300">{member.role}</p>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{member.awards}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

