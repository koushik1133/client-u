import React from 'react';
import { Camera, MapPin, Phone, Mail, Share2, Video, Globe, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 pt-16 pb-12 px-4 lg:px-8 bg-slate-950/80">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
              <Camera className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-white font-['Plus_Jakarta_Sans']">APEX FLASH <span className="text-emerald-400">STUDIOS</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            America’s premier high-fashion flash photography, 8K video production, and luxury destination wedding cinema studio with stages in Los Angeles and New York.
          </p>
          <div className="flex items-center gap-3 pt-2">
            {[Share2, Video, Globe].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-lg glass-pill flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-400 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Studio Locations */}
        <div className="space-y-3 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider font-['Plus_Jakarta_Sans']">US Flagship Studios</h4>
          <div className="flex items-start gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Los Angeles: 8490 Sunset Blvd, Hollywood, CA 90069</span>
          </div>
          <div className="flex items-start gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>New York: 450 Broome St, SoHo, NY 10013</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 pt-1">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>+1 (310) 555-0199 / +1 (212) 555-0188</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>bookings@apexflashstudios.com</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider font-['Plus_Jakarta_Sans'] flex items-center gap-1">
            <span>Production Categories</span>
          </h4>
          <ul className="space-y-1.5 text-slate-400">
            <li><a href="#booking" className="hover:text-emerald-400 transition-colors">High-Fashion Editorial Flash</a></li>
            <li><a href="#booking" className="hover:text-emerald-400 transition-colors">Cinematic Luxury Wedding Films</a></li>
            <li><a href="#booking" className="hover:text-emerald-400 transition-colors">RED 8K TV Commercials & Music Videos</a></li>
            <li><a href="#booking" className="hover:text-emerald-400 transition-colors">FAA 4K Drone Aerial Cinema</a></li>
            <li><a href="#booking" className="hover:text-emerald-400 transition-colors">4K Vertical Reels & Social Shorts</a></li>
          </ul>
        </div>

        {/* Direct US Booking Support */}
        <div className="space-y-3 glass-panel p-4 border-emerald-500/30">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Instant US Consultation</h4>
          <p className="text-[11px] text-slate-300">
            Need urgent shoot availability in LA, NYC, Miami, or Napa Valley this week? Connect directly with Lead Director Marcus.
          </p>
          <a
            href="https://wa.me/13105550199?text=Hi%20Apex%20Flash%20Studios,%20I'd%20like%20to%20inquire%20about%20a%20US%20shoot!"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full btn-primary justify-center py-2 text-xs text-white font-bold"
          >
            <span>Direct WhatsApp / SMS Connect</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-white" />
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
        <p>© 2026 Apex Flash Studios Inc. (United States). All Rights Reserved.</p>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Terms of Commercial Production</a>
          <a href="#" className="hover:text-slate-300">W-9 / Tax Invoice Help</a>
        </div>
      </div>
    </footer>
  );
};
