
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800 selection:text-white">
      {/* Minimal Top Nav */}
      <nav className="flex items-center justify-between px-8 h-20 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <span className="text-black font-black text-xs">R</span>
          </div>
          <span className="font-bold tracking-tighter text-lg">REVEAL</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-zinc-400">
          <span className="hover:text-white cursor-pointer transition-colors">Technology</span>
          <span className="hover:text-white cursor-pointer transition-colors">Ethics</span>
          <span className="hover:text-white cursor-pointer transition-colors">Support</span>
          <button 
            onClick={() => navigate('/login')}
            className="text-white hover:text-zinc-300 transition-colors"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-8">
            The Digital Mentalist's Standard
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
            Real-time revelation.<br/>Zero suspicion.
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
            The most advanced search-capture system ever designed for professional mentalists. 
            Perfectly deceptive. Instantly delivered.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/login')}
              className="h-12 px-8 bg-white hover:bg-zinc-200 text-black font-bold rounded-md transition-all text-sm w-full sm:w-auto"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Product Display / Teaser */}
      <section className="px-6 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 aspect-video overflow-hidden group shadow-2xl shadow-white/5">
             {/* Mock interface representation */}
             <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
                <div className="w-full max-w-md space-y-4 px-8">
                  <div className="h-2 w-1/2 bg-zinc-800 rounded-full mx-auto"></div>
                  <div className="h-12 w-full border border-zinc-800 rounded-full flex items-center px-4">
                    <div className="w-4 h-4 bg-zinc-800 rounded-full"></div>
                  </div>
                  <div className="flex justify-center gap-2">
                    <div className="h-8 w-24 bg-zinc-900 rounded-md"></div>
                    <div className="h-8 w-24 bg-zinc-900 rounded-md"></div>
                  </div>
                </div>
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
             <div className="absolute bottom-10 left-10">
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">System Preview</p>
                <p className="text-xl font-bold mt-1">1:1 Deception Interface</p>
             </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="border-t border-zinc-900 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900 rounded-2xl overflow-hidden">
            <div className="bg-black p-10 group">
              <div className="w-10 h-10 border border-zinc-800 rounded-lg flex items-center justify-center mb-6 group-hover:border-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-lg font-bold mb-3">Instant Sync</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Utilizing low-latency listeners to deliver spectator data to your device in under 100ms.
              </p>
            </div>
            <div className="bg-black p-10 group">
              <div className="w-10 h-10 border border-zinc-800 rounded-lg flex items-center justify-center mb-6 group-hover:border-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </div>
              <h3 className="text-lg font-bold mb-3">Ghost Mode</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                A perfectly replicated search engine interface that withstands the most intense scrutiny.
              </p>
            </div>
            <div className="bg-black p-10 group">
              <div className="w-10 h-10 border border-zinc-800 rounded-lg flex items-center justify-center mb-6 group-hover:border-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-lg font-bold mb-3">Silent Alerts</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Receive vibration patterns or text reveal directly to your smartwatch without looking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
               <span className="text-black font-black text-[10px]">R</span>
             </div>
             <span className="font-bold tracking-tighter text-sm uppercase">Reveal System</span>
           </div>
           <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-zinc-600">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-white cursor-pointer transition-colors">Ethics</span>
           </div>
           <p className="text-xs text-zinc-700 font-medium uppercase tracking-widest">
             © 2025 Mentalism Labs.
           </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
