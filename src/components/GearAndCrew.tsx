import React from 'react';
import { Camera, Award, Zap } from 'lucide-react';
import { GEAR_INVENTORY, CREW_MEMBERS } from '../data/mockData';

export const GearAndCrew: React.FC = () => {
  return (
    <section id="gear" className="py-20 px-4 lg:px-8 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase mb-3">
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>US STUDIO EQUIPMENT & DIRECTORS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Master Gear Vault & <span className="text-emerald-400">Award-Winning Directors</span>
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Our Sunset Blvd Los Angeles & SoHo NYC flagship studios house state-of-the-art RED 8K cinema cameras, Profoto flash generators, and Emmy/Cannes award-winning cinematographers.
          </p>
        </div>

        {/* Section 1: Gear Vault */}
        <div>
          <h3 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span>High-Speed US Gear Inventory</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GEAR_INVENTORY.map(item => (
              <div key={item.id} className="glass-panel p-4 border-slate-700/50 space-y-3 group hover:border-emerald-500/40 transition-all">
                <div className="h-36 rounded-xl overflow-hidden bg-slate-950">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{item.category} • {item.brand}</span>
                  <h4 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans'] mt-0.5">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{item.specs}</p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Available
                  </span>
                  <span className="text-slate-300 font-mono">${item.dailyRateUSD.toLocaleString('en-US')}/day</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Director Bios */}
        <div>
          <h3 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Meet Our US Directors & Photographers</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CREW_MEMBERS.map(member => (
              <div key={member.id} className="glass-panel p-6 border-slate-700/50 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-xl shrink-0"
                />
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">{member.name}</h4>
                    <span className="text-xs text-emerald-400 font-mono font-semibold">{member.instagram}</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-300">{member.role}</p>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <Award className="w-3.5 h-3.5" />
                    <span>{member.awards}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
