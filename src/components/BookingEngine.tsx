import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Camera, Sparkles, Check, ChevronRight, ChevronLeft, ShieldCheck, Download, User as UserIcon, CheckCircle2, Zap } from 'lucide-react';
import type { ShootCategory, TimeSlot, TimezoneOption, GearAddon, LocationOption, Booking, User } from '../types/flashCinema';
import { SHOOT_CATEGORIES, TIME_SLOTS_PST, GEAR_ADDONS, LOCATIONS, TIMEZONES } from '../data/mockData';

interface BookingEngineProps {
  user: User | null;
  selectedTimezone: TimezoneOption;
  onSelectTimezone: (tz: TimezoneOption) => void;
  onBookingConfirmed: (booking: Booking) => void;
  onOpenAuthModal: () => void;
}

export const BookingEngine: React.FC<BookingEngineProps> = ({
  user,
  selectedTimezone,
  onSelectTimezone,
  onBookingConfirmed,
  onOpenAuthModal
}) => {
  const [step, setStep] = useState<number>(1);

  // Selection States
  const [selectedCategory, setSelectedCategory] = useState<ShootCategory>(SHOOT_CATEGORIES[0]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>(TIME_SLOTS_PST[0]);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(LOCATIONS[0]);
  const [addons, setAddons] = useState<GearAddon[]>(GEAR_ADDONS.map(a => ({ ...a, selected: false })));
  
  // Client Contact Details (Pre-filled if user logged in)
  const [clientName, setClientName] = useState(user ? user.name : '');
  const [clientEmail, setClientEmail] = useState(user ? user.email : '');
  const [clientPhone, setClientPhone] = useState(user ? user.phone || '' : '');
  const [specialNotes, setSpecialNotes] = useState('');
  
  const [bookingDone, setBookingDone] = useState<Booking | null>(null);

  // Helper: Convert PST slot time into selected timezone
  const convertSlotToTimezone = (slotPST: string, tz: TimezoneOption): string => {
    if (tz.id === 'pst') return `${slotPST} PST`;
    
    const [timeStr, period] = slotPST.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const diffHours = tz.utcOffsetHours - (-8); // Difference relative to PST (GMT-8)
    let convertedHour = (hours + diffHours + 24) % 24;
    const convPeriod = convertedHour >= 12 ? 'PM' : 'AM';
    const finalHour = convertedHour % 12 === 0 ? 12 : Math.floor(convertedHour % 12);
    
    return `${finalHour}:${minutes < 10 ? '0' + minutes : minutes} ${convPeriod} ${tz.code}`;
  };

  // Pricing calculations (USD)
  const categoryPrice = selectedCategory.basePriceUSD;
  const locationFee = selectedLocation.extraFeeUSD;
  const addonsTotal = addons.filter(a => a.selected).reduce((acc, curr) => acc + curr.priceUSD, 0);
  const subtotal = categoryPrice + locationFee + addonsTotal;
  const taxUSD = Math.round((subtotal * 0.08875) * 100) / 100; // US Commercial Sales Tax 8.875%
  const grandTotal = Math.round((subtotal + taxUSD) * 100) / 100;

  const toggleAddon = (addonId: string) => {
    setAddons(addons.map(a => a.id === addonId ? { ...a, selected: !a.selected } : a));
  };

  const handleFinalBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName || !clientEmail || !clientPhone) {
      alert('Please fill in your name, email, and phone number.');
      return;
    }

    const newBooking: Booking = {
      id: 'APEX-US-' + Math.floor(1000 + Math.random() * 9000),
      userId: user ? user.id : 'guest-' + Date.now(),
      clientName,
      clientEmail,
      clientPhone,
      category: selectedCategory,
      date: selectedDate,
      timeSlotPST: selectedSlot.timePST,
      convertedTime: `${selectedSlot.timePST} PST (${convertSlotToTimezone(selectedSlot.timePST, selectedTimezone)})`,
      clientTimezone: selectedTimezone,
      location: selectedLocation,
      selectedAddons: addons.filter(a => a.selected),
      specialInstructions: specialNotes,
      subtotalUSD: subtotal,
      taxUSD: taxUSD,
      totalUSD: grandTotal,
      status: 'booked',
      createdAt: new Date().toISOString()
    };

    setBookingDone(newBooking);
    onBookingConfirmed(newBooking);
  };

  // Generate .ICS iCalendar download file
  const downloadCalendarICS = () => {
    if (!bookingDone) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apex Flash Studios//USA//EN
BEGIN:VEVENT
SUMMARY:Apex Flash Shoot: ${bookingDone.category.title}
DESCRIPTION:Scheduled at ${bookingDone.location.name} (${bookingDone.location.area}). Booking ID: ${bookingDone.id}
LOCATION:${bookingDone.location.name}, ${bookingDone.location.area}, USA
DTSTART:${bookingDone.date.replace(/-/g, '')}T090000Z
DTEND:${bookingDone.date.replace(/-/g, '')}T130000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${bookingDone.id}-Schedule.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="booking" className="py-24 px-4 lg:px-8 relative">
      
      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 glass-pill-gold px-4 py-1.5 text-xs font-mono font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>NATIONWIDE US TIMEZONE SCHEDULER</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Schedule Your <span className="text-gradient-gold italic font-normal">8K Shoot</span> & Production
          </h2>
          <p className="text-base text-slate-300 font-light max-w-2xl mx-auto">
            Select your shoot package, stage location, camera add-ons, and convert shoot times across US timezones in real time.
          </p>
        </div>

        {/* Wizard Progress Bar */}
        {!bookingDone && (
          <div className="glass-panel p-3 sm:p-4 border-white/15">
            <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
              {[
                { s: 1, full: '1. Package Tier', short: '1. Package' },
                { s: 2, full: '2. Timezone & Slot', short: '2. Slot' },
                { s: 3, full: '3. Stage Venue', short: '3. Stage' },
                { s: 4, full: '4. Gear Add-ons', short: '4. Gear' },
                { s: 5, full: '5. Lock Booking', short: '5. Lock' }
              ].map(item => (
                <button
                  key={item.s}
                  onClick={() => setStep(item.s)}
                  className={`py-2.5 px-2 rounded-xl font-bold transition-all border-none cursor-pointer truncate ${
                    step === item.s
                      ? 'btn-primary text-black shadow-lg scale-105'
                      : step > item.s
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  <span className="hidden sm:inline">{item.full}</span>
                  <span className="inline sm:hidden">{item.short}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Shoot Category Selection */}
        {!bookingDone && step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
                <Camera className="w-6 h-6 text-amber-400" />
                <span>Select Shoot Package Tier</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">Step 1 of 5</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SHOOT_CATEGORIES.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`glass-panel p-5 cursor-pointer relative overflow-hidden transition-all border ${
                    selectedCategory.id === cat.id
                      ? 'border-amber-500 bg-amber-500/15 shadow-2xl scale-[1.02]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {cat.popular && (
                    <span className="absolute top-3 right-3 text-[10px] font-mono font-bold bg-amber-500 text-black px-2.5 py-0.5 rounded-full uppercase shadow-lg">
                      Popular Tier
                    </span>
                  )}

                  <div className="h-44 rounded-2xl overflow-hidden mb-4 relative">
                    <img src={cat.coverImage} alt={cat.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#04060a] via-transparent to-transparent"></div>
                  </div>

                  <h4 className="text-xl font-serif font-bold text-white">{cat.title}</h4>
                  <p className="text-xs text-amber-400 font-mono font-bold mb-2">{cat.subtitle}</p>
                  <p className="text-xs text-slate-300 font-light line-clamp-2 mb-4">{cat.description}</p>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Base Price (USD)</span>
                      <p className="text-xl font-bold text-amber-400 font-serif">
                        ${cat.basePriceUSD.toLocaleString('en-US')}
                      </p>
                    </div>
                    <span className="text-xs text-slate-300 glass-pill px-3 py-1">
                      {cat.durationHours} Hours Shoot
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="btn-primary text-sm px-7 py-3.5"
              >
                <span>Continue to Calendar & Timezone</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Interactive Date Picker & Timezone Conversion */}
        {!bookingDone && step === 2 && (
          <div className="glass-panel p-6 sm:p-8 space-y-6 border-white/15 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
                  <CalendarIcon className="w-6 h-6 text-amber-400" />
                  <span>Select Date & Time Slot</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Converts US West Coast (PST) timings directly into your selected US local timezone
                </p>
              </div>

              {/* Timezone Switcher */}
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/15">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-slate-300">Your Timezone:</span>
                <select
                  value={selectedTimezone.id}
                  onChange={e => {
                    const tz = TIMEZONES.find(t => t.id === e.target.value);
                    if (tz) onSelectTimezone(tz);
                  }}
                  className="bg-slate-900 text-amber-300 text-xs font-mono font-bold rounded-lg px-2.5 py-1 border border-white/20 focus:outline-none"
                >
                  {TIMEZONES.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Date Selector */}
              <div className="md:col-span-5 space-y-4">
                <label className="block text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Shoot Date Selection
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl p-3.5 text-white text-sm font-mono focus:border-amber-400 focus:outline-none"
                />

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2 font-mono">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Selected Date Summary</span>
                  </div>
                  <p className="text-slate-300">
                    Target Shoot Date: <strong className="text-white">{selectedDate}</strong>
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Golden hour sunset lighting conditions on this date will peak at ~05:30 PM PST.
                  </p>
                </div>
              </div>

              {/* Time Slots Converter */}
              <div className="md:col-span-7 space-y-4">
                <label className="block text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Available Time Slots (Auto-Converted to {selectedTimezone.code})
                </label>

                <div className="space-y-3">
                  {TIME_SLOTS_PST.map(slot => {
                    const convertedStr = convertSlotToTimezone(slot.timePST, selectedTimezone);
                    const isSelected = selectedSlot.id === slot.id;

                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white shadow-xl'
                            : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-amber-500 text-black' : 'bg-white/10 text-slate-400'}`}>
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold font-serif">{slot.label}</p>
                            <p className="text-xs text-amber-400 font-mono">
                              PST: {slot.timePST} → <strong className="text-white">{convertedStr}</strong>
                            </p>
                          </div>
                        </div>

                        {slot.isPeak && (
                          <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md border border-amber-500/40">
                            Golden Hour
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="flex justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary text-sm px-6 py-3"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-primary text-sm px-7 py-3"
              >
                <span>Continue to Stage Location</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: US Location / Studio Picker */}
        {!bookingDone && step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
                <MapPin className="w-6 h-6 text-amber-400" />
                <span>Select Studio Stage Location</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">Step 3 of 5</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {LOCATIONS.map(loc => (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`glass-panel p-5 cursor-pointer border transition-all flex flex-col justify-between ${
                    selectedLocation.id === loc.id
                      ? 'border-amber-500 bg-amber-500/15 shadow-2xl scale-[1.01]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="h-48 rounded-2xl overflow-hidden mb-4 relative">
                      <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3.5 left-3.5 text-[10px] font-mono font-bold bg-black/80 backdrop-blur-md text-amber-300 px-3 py-1 rounded-full uppercase border border-amber-500/30">
                        {loc.area}
                      </span>
                    </div>

                    <h4 className="text-xl font-serif font-bold text-white">{loc.name}</h4>
                    <p className="text-xs text-slate-300 font-light mt-1">{loc.description}</p>
                  </div>

                  <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between font-mono">
                    <span className="text-xs text-slate-400">Stage Location Fee:</span>
                    <span className="text-base font-bold text-amber-400 font-serif">
                      {loc.extraFeeUSD === 0 ? 'Included in Base' : `+$${loc.extraFeeUSD.toLocaleString('en-US')}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary text-sm px-6 py-3"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(4)}
                className="btn-primary text-sm px-7 py-3"
              >
                <span>Continue to Gear Add-ons</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Gear & Add-On Configurator */}
        {!bookingDone && step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
                <Camera className="w-6 h-6 text-amber-400" />
                <span>Select Cinema Gear & Speed Add-ons</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">Step 4 of 5</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {addons.map(addon => (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`glass-panel p-5 cursor-pointer border transition-all flex flex-col justify-between ${
                    addon.selected
                      ? 'border-amber-500 bg-amber-500/15 shadow-xl'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">{addon.category}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${addon.selected ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/30'}`}>
                        {addon.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <h4 className="text-base font-serif font-bold text-white">{addon.name}</h4>
                    <p className="text-xs text-slate-300 font-light mt-1">{addon.description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between font-mono">
                    <span className="text-xs text-slate-400">Add-on Price:</span>
                    <span className="text-sm font-bold text-amber-400">+$${addon.priceUSD.toLocaleString('en-US')}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(3)}
                className="btn-secondary text-sm px-6 py-3"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(5)}
                className="btn-primary text-sm px-7 py-3"
              >
                <span>Proceed to Confirmation & Review</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Review, Contact & Price Summary */}
        {!bookingDone && step === 5 && (
          <form onSubmit={handleFinalBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            
            {/* Left: Contact Info */}
            <div className="lg:col-span-7 glass-panel p-6 sm:p-8 space-y-5 border-white/15">
              <h3 className="text-2xl font-serif font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2.5">
                <UserIcon className="w-6 h-6 text-amber-400" />
                <span>Client Contact Details</span>
              </h3>

              {!user && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-200">Have an account with us?</span>
                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="text-amber-400 font-bold hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Sign In for 1-Click Fill
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">Client Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl p-3.5 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah.j@vogue.com"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-white/20 rounded-xl p-3.5 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (310) 555-0199"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-white/20 rounded-xl p-3.5 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">Special Shoot Notes / Creative Vision</label>
                <textarea
                  rows={3}
                  placeholder="Mention specific lighting moods, camera lenses, styling requirements, or reference reels..."
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl p-3.5 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Right: Itemized Invoice Summary */}
            <div className="lg:col-span-5 glass-panel p-6 sm:p-8 space-y-5 border-amber-500/40 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-serif font-bold text-white border-b border-white/10 pb-4 flex items-center justify-between">
                  <span>Price Breakdown</span>
                  <span className="text-xs font-mono text-amber-400">USD ($)</span>
                </h3>

                <div className="space-y-3.5 pt-4 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-300">{selectedCategory.title} ({selectedCategory.durationHours}h)</span>
                    <span className="text-white font-bold">${categoryPrice.toLocaleString('en-US')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-300">Stage: {selectedLocation.name}</span>
                    <span className="text-white font-bold">{locationFee === 0 ? 'Included' : `+$${locationFee.toLocaleString('en-US')}`}</span>
                  </div>

                  {addons.filter(a => a.selected).map(a => (
                    <div key={a.id} className="flex justify-between text-amber-300">
                      <span>Add-on: {a.name}</span>
                      <span className="font-bold">+$${a.priceUSD.toLocaleString('en-US')}</span>
                    </div>
                  ))}

                  <div className="h-[1px] bg-white/10 my-2"></div>

                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span className="font-bold">${subtotal.toLocaleString('en-US')}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>US Sales Tax (8.875%)</span>
                    <span className="font-bold">${taxUSD.toLocaleString('en-US')}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex justify-between items-center text-white mt-4">
                    <span className="font-serif font-bold text-sm">Grand Total (USD)</span>
                    <span className="text-2xl font-serif font-bold text-amber-400">
                      ${grandTotal.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="w-full btn-primary justify-center py-4 text-base shadow-2xl"
                >
                  <ShieldCheck className="w-5 h-5 text-black" />
                  <span>Confirm & Lock Booking Slot</span>
                </button>
                <p className="text-[10px] font-mono text-center text-slate-400">
                  Instant confirmation email & SMS dispatch upon locking slot.
                </p>
              </div>
            </div>
          </form>
        )}

        {/* BOOKING SUCCESS CONFIRMATION MODAL */}
        {bookingDone && (
          <div className="glass-panel p-8 sm:p-10 max-w-2xl mx-auto border-amber-500/40 text-center space-y-6 animate-fadeIn shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                BOOKING CONFIRMED & LOCKED
              </span>
              <h3 className="text-3xl font-serif font-bold text-white mt-1">
                {bookingDone.category.title}
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-1">
                Booking Reference ID: <strong className="text-amber-400">{bookingDone.id}</strong>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/15 text-left text-xs space-y-2.5 font-mono">
              <p><span className="text-slate-400">Client:</span> <strong className="text-white">{bookingDone.clientName}</strong> ({bookingDone.clientEmail})</p>
              <p><span className="text-slate-400">Shoot Date:</span> <strong className="text-amber-300">{bookingDone.date}</strong></p>
              <p><span className="text-slate-400">Converted Slot:</span> <strong className="text-amber-300">{bookingDone.convertedTime}</strong></p>
              <p><span className="text-slate-400">Stage Venue:</span> <strong className="text-white">{bookingDone.location.name} ({bookingDone.location.area})</strong></p>
              <p><span className="text-slate-400">Total Paid/Locked:</span> <strong className="text-amber-400">${bookingDone.totalUSD.toLocaleString('en-US')} (incl. Tax)</strong></p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={downloadCalendarICS}
                className="btn-primary text-xs py-3 px-6"
              >
                <Download className="w-4 h-4 text-black" />
                <span>Download .ICS Calendar Event</span>
              </button>

              <button
                onClick={() => {
                  setBookingDone(null);
                  setStep(1);
                }}
                className="btn-secondary text-xs py-3 px-6"
              >
                <span>Book Another Shoot</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

