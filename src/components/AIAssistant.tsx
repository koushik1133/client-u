import React, { useState } from 'react';
import { X, Send, Sparkles, Bot } from 'lucide-react';
import type { ChatMessage } from '../types/flashCinema';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Hello! I am FlashBot AI, your US Flash Shoot & Cinema Production Assistant. How can I help you select the ideal shoot package, venue stage, or US timezone slot today?',
      timestamp: 'Just now',
      suggestions: [
        'Best golden hour timing in Los Angeles / Malibu?',
        'Recommend Napa Valley Wedding package',
        'How does nationwide timezone booking work?'
      ]
    }
  ]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate intelligent AI response for US market
    setTimeout(() => {
      let replyText = '';
      const q = query.toLowerCase();

      if (q.includes('golden hour') || q.includes('timing') || q.includes('malibu') || q.includes('la')) {
        replyText = 'In California (PST), Golden Hour coastal sunset lighting peaks between 05:15 PM and 06:15 PM at our Sunset Blvd Flagship Studio and Malibu Beach locations. We recommend booking Slot 4 (05:30 PM PST) for natural warmth combined with Profoto flash fill!';
      } else if (q.includes('wedding') || q.includes('napa') || q.includes('hamptons')) {
        replyText = 'For luxury estate weddings (Napa Valley, the Hamptons, Malibu, or Beverly Hills), our "Cinematic Destination Wedding Films" package ($4,500) is our top choice. It includes 3 Cinema Camera Operators (RED 8K / Sony FX6), FAA 4K Drone coverage, and Dolby Atmos audio master!';
      } else if (q.includes('timezone') || q.includes('convert')) {
        replyText = 'Our interactive calendar automatically converts West Coast (PST) shoot times into your local US timezone (EST, CST, MST, GMT). For example, a 10:00 AM PST shoot corresponds to 1:00 PM EST in New York! Select your timezone at the top right.';
      } else {
        replyText = 'Thanks for asking! Our Sunset Blvd Los Angeles & SoHo NYC flagship studios feature 5,500 sq ft of soundproof stage, Profoto Pro-11 flash generators, and RED 8K cinema cameras. You can use our 5-step booking scheduler to pick your date & gear add-ons directly.';
      }

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary py-3.5 px-5 rounded-full shadow-2xl flex items-center gap-2 font-bold group hover:scale-105 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-black text-amber-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs text-black font-extrabold">Ask FlashBot AI</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 glass-panel border-amber-500/40 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-[500px]">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#04060a] via-slate-900 to-[#04060a] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-white">FlashBot AI US Assistant</h4>
                <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span> Live US Consultation
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white bg-white/10 p-1.5 rounded-lg border-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-black font-semibold rounded-br-none'
                    : 'bg-white/10 text-slate-200 border border-white/15 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">{msg.timestamp}</span>

                {msg.suggestions && (
                  <div className="mt-2 space-y-1 w-full font-mono">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(sug)}
                        className="w-full text-left p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors border-none cursor-pointer"
                      >
                        ⚡ {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={e => { e.preventDefault(); handleSend(); }}
            className="p-3 border-t border-white/10 bg-slate-950 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about US shoots, gear, or timings..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center hover:scale-105 transition-transform border-none cursor-pointer"
            >
              <Send className="w-4 h-4 fill-black" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

