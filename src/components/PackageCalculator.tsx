import React, { useState } from 'react';
import { Calculator, Check, ArrowRight } from 'lucide-react';

interface PackageCalculatorProps {
  onNavigateBooking: () => void;
}

export const PackageCalculator: React.FC<PackageCalculatorProps> = ({ onNavigateBooking }) => {
  const [durationHours, setDurationHours] = useState<number>(6);
  const [cameraCount, setCameraCount] = useState<number>(2);
  const [hasDrone, setHasDrone] = useState<boolean>(true);
  const [hasExpress, setHasExpress] = useState<boolean>(false);
  const [hasDolbyMaster, setHasDolbyMaster] = useState<boolean>(true);

  // Live Price Calculation (USD)
  const hourlyRate = 350;
  const cameraRate = cameraCount * 300;
  const basePrice = durationHours * hourlyRate + cameraRate;
  const droneFee = hasDrone ? 450 : 0;
  const expressFee = hasExpress ? 350 : 0;
  const dolbyFee = hasDolbyMaster ? 400 : 0;

  const estimatedTotal = basePrice + droneFee + expressFee + dolbyFee;
  const estimatedTax = Math.round((estimatedTotal * 0.08875) * 100) / 100;
  const finalEstimate = Math.round((estimatedTotal + estimatedTax) * 100) / 100;

  return (
    <section id="calculator" className="py-20 px-4 lg:px-8 relative bg-slate-950/40">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase mb-3">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>CUSTOM QUOTE BUILDER</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Interactive <span className="text-emerald-400">Package & Budget Configurator</span>
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Configure your shoot duration, camera count, drone aerials, and post-production delivery options to get an instant live estimate in USD.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Column */}
          <div className="lg:col-span-7 glass-panel p-6 space-y-6 border-slate-700/50">
            
            {/* Duration Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300">Shoot Duration (Hours)</span>
                <span className="text-emerald-400 font-mono text-base">{durationHours} Hours</span>
              </div>
              <input
                type="range"
                min={2}
                max={14}
                step={1}
                value={durationHours}
                onChange={e => setDurationHours(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>2 Hours (Half Day)</span>
                <span>8 Hours (Full Day)</span>
                <span>14 Hours (Multi-Day Gala)</span>
              </div>
            </div>

            {/* Camera Operators Count */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Cinema Camera Rigs & Crew Count
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { count: 1, label: '1 RED/Sony Rig' },
                  { count: 2, label: '2 Cinema Rigs' },
                  { count: 3, label: '3 Master Rigs' }
                ].map(item => (
                  <button
                    key={item.count}
                    onClick={() => setCameraCount(item.count)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      cameraCount === item.count
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Addons */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Production Upgrades & Speed Options
              </label>

              {[
                { state: hasDrone, setState: setHasDrone, title: '4K FPV Drone Aerial Coverage', price: 450 },
                { state: hasExpress, setState: setHasExpress, title: '24-Hour Express Teaser Delivery', price: 350 },
                { state: hasDolbyMaster, setState: setHasDolbyMaster, title: 'DaVinci Color Master & Dolby Audio', price: 400 }
              ].map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => opt.setState(!opt.state)}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    opt.state
                      ? 'bg-emerald-600/15 border-emerald-500 text-white'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${opt.state ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-white/30'}`}>
                      {opt.state && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-semibold">{opt.title}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">+$${opt.price.toLocaleString('en-US')}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Live Estimate Card */}
          <div className="lg:col-span-5 glass-panel p-6 border-emerald-500/40 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">ESTIMATED INVESTMENT</span>
              <h3 className="text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans'] mt-1">
                ${finalEstimate.toLocaleString('en-US')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Includes 8.875% US tax & full commercial usage rights</p>

              <div className="space-y-2.5 pt-4 text-xs font-mono border-t border-white/10 mt-4">
                <div className="flex justify-between text-slate-300">
                  <span>Base Shoot ({durationHours}h x {cameraCount} Rigs)</span>
                  <span>${basePrice.toLocaleString('en-US')}</span>
                </div>
                {hasDrone && (
                  <div className="flex justify-between text-emerald-300">
                    <span>FPV Drone Aerial Cinema</span>
                    <span>+$450</span>
                  </div>
                )}
                {hasExpress && (
                  <div className="flex justify-between text-emerald-300">
                    <span>24h Express Delivery</span>
                    <span>+$350</span>
                  </div>
                )}
                {hasDolbyMaster && (
                  <div className="flex justify-between text-emerald-300">
                    <span>Dolby Audio & Color Master</span>
                    <span>+$400</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 pt-2 border-t border-white/10">
                  <span>US Sales Tax (8.875%)</span>
                  <span>${estimatedTax.toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onNavigateBooking}
              className="w-full btn-primary justify-center py-3.5 text-sm font-bold shadow-2xl"
            >
              <span>Lock This Custom Estimate</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
