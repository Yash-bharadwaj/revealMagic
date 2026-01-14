
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { firestoreService } from '../services/firestoreService';
import { GOOGLE_SEARCH_URL } from '../constants';

const TRENDING_SEARCHES = [
  'makar sankranti wishes',
  'bts world tour dates',
  'flipkart iphone 17',
  'tata punch facelift'
];

const SearchPage: React.FC = () => {
  const { performerId } = useParams<{ performerId: string }>();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (window.history.pushState) {
      window.history.pushState(null, "", window.location.href);
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    if (performerId) {
      try {
        await firestoreService.submitSearch(performerId, trimmedQuery);
      } catch (error) {
        console.error('Error submitting search:', error);
      }
    }

    setIsRedirecting(true);
    try {
      window.top!.location.href = `${GOOGLE_SEARCH_URL}${encodeURIComponent(trimmedQuery)}`;
    } catch (err) {
      window.location.href = `${GOOGLE_SEARCH_URL}${encodeURIComponent(trimmedQuery)}`;
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      window.location.href = 'https://lens.google.com/';
    }
  };

  const toggleAIMode = () => {
    setIsAIMode(!isAIMode);
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4285F4]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      {/* Google Header */}
      <header className="w-full flex items-center justify-between px-4 sm:px-6 h-[60px]">
        <div className="flex items-center gap-6 text-[13px] text-[#202124]">
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Store</a>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-[13px] text-[#202124]">
          <a href="#" className="hover:underline">Gmail</a>
          <a href="#" className="hover:underline">Images</a>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-[#5f6368]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6,8c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.9,8,6,8z M12,20c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S10.9,20,12,20z M6,20 c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.9,20,6,20z M6,14c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.9,14,6,14z M12,14c1.1,0,2-0.9,2-2 s-0.9-2-2-2s-2,0.9-2,2S10.9,14,12,14z M18,14c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S16.9,14,18,14z M18,8c1.1,0,2-0.9,2-2 s-0.9-2-2-2s-2,0.9-2,2S16.9,8,18,8z M12,8c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S10.9,8,12,8z M18,20c1.1,0,2-0.9,2-2s-0.9-2-2-2 s-2,0.9-2,2S16.9,20,18,20z"></path>
            </svg>
          </button>
          <button className="bg-[#1a73e8] text-white px-6 py-2 rounded-[4px] font-medium hover:shadow-md transition-shadow text-sm">
            Sign in
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-6 sm:pt-[120px] pb-8 px-4">
        {/* Google Logo */}
        <div className="mb-8 sm:mb-10">
          <div className="text-[80px] sm:text-[92px] font-normal tracking-[-0.02em] google-font leading-none">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-[584px] mb-8">
          <div 
            className={`flex items-center w-full h-[44px] sm:h-[46px] px-4 sm:px-5 rounded-full border transition-all bg-white
            ${isFocused 
              ? 'shadow-[0_2px_5px_1px_rgba(64,60,67,0.16)] border-transparent' 
              : 'border-[#dfe1e5] hover:shadow-[0_2px_5px_1px_rgba(64,60,67,0.16)] hover:border-transparent'
            }`}
          >
            {/* Search Icon */}
            <svg className="w-5 h-5 text-[#9aa0a6] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>

            {/* Input */}
            <input 
              ref={inputRef}
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 min-w-0 focus:outline-none text-[16px] text-[#202124] h-full bg-transparent"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />

            {/* Right Icons */}
            <div className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0">
              {/* Plus Icon */}
              <button
                type="button"
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                title="Add"
              >
                <svg className="w-5 h-5 text-[#5f6368]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>

              {/* Microphone */}
              <button
                type="button"
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                title="Voice Search"
              >
                <img 
                  src="https://www.gstatic.com/images/branding/googlemic/2x/googlemic_color_24dp.png" 
                  className="w-6 h-6" 
                  alt="Voice Search" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </button>

              {/* Camera / Lens */}
              <button
                type="button"
                onClick={handleCameraClick}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                title="Search by image"
              >
                <svg className="w-6 h-6 text-[#5f6368]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                capture="environment"
              />

              {/* AI Mode */}
              <button
                type="button"
                onClick={toggleAIMode}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isAIMode 
                    ? 'bg-[#1a73e8] text-white' 
                    : 'bg-[#f1f3f4] text-[#3c4043] hover:bg-[#e8eaed]'
                }`}
                title="AI Mode"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l1.09 3.26L16 6l-2.91 1.09L12 10.18l-1.09-2.09L8 6l2.91-0.74L12 2zm0 16l-1.09-1.09L9 16l1.09 1.09L12 18.18l1.91-1.09L15 16l-1.09-1.09L12 18zm6-8l-1.09-1.09L16 8l1.09 1.09L18 10.18l1.91-1.09L21 8l-1.09-1.09L18 10zm-12 0l-1.09-1.09L4 8l1.09 1.09L6 10.18l1.91-1.09L9 8l-1.09-1.09L6 10z"/>
                </svg>
                <span>AI Mode</span>
              </button>
            </div>
          </div>

          {/* Search Buttons */}
          <div className="mt-7 flex justify-center gap-3">
            <button 
              type="submit"
              className="px-4 py-2 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow-[0_1px_1px_rgba(0,0,0,0.1)] rounded-[4px] text-sm text-[#3c4043] transition-all min-w-[120px] sm:min-w-[126px]"
            >
              Google Search
            </button>
            <button 
              type="button"
              className="px-4 py-2 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow-[0_1px_1px_rgba(0,0,0,0.1)] rounded-[4px] text-sm text-[#3c4043] transition-all min-w-[120px] sm:min-w-[126px]"
            >
              I'm Feeling Lucky
            </button>
          </div>
        </form>

        {/* Promotional Link - Desktop */}
        <div className="hidden sm:block mb-6">
          <a href="#" className="text-[#1a73e8] hover:underline text-sm">
            Enjoy Republic Day deals on the latest Google Pixel devices & more
          </a>
        </div>

        {/* Language Options */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-[13px] text-[#4d5156] mb-2">Google offered in:</p>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[13px]">
            <a href="#" className="text-[#1a0dab] hover:underline">हिन्दी</a>
            <a href="#" className="text-[#1a0dab] hover:underline">বাংলা</a>
            <a href="#" className="text-[#1a0dab] hover:underline">తెలుగు</a>
            <a href="#" className="text-[#1a0dab] hover:underline">मराठी</a>
            <a href="#" className="text-[#1a0dab] hover:underline">தமிழ்</a>
            <a href="#" className="text-[#1a0dab] hover:underline">ગુજરાતી</a>
            <a href="#" className="text-[#1a0dab] hover:underline">ಕನ್ನಡ</a>
            <a href="#" className="text-[#1a0dab] hover:underline">മലയാളം</a>
            <a href="#" className="text-[#1a0dab] hover:underline">ਪੰਜਾਬੀ</a>
          </div>
        </div>

        {/* Trending Searches - Mobile */}
        <div className="w-full max-w-[584px] sm:hidden">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-base font-medium text-[#202124]">Trending searches</h2>
            <button className="p-1">
              <svg className="w-5 h-5 text-[#5f6368]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
          <div className="space-y-0">
            {TRENDING_SEARCHES.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(search);
                  handleSearch();
                }}
                className="w-full flex items-center gap-3 px-2 py-3 hover:bg-gray-50 border-b border-gray-100 text-left"
              >
                <svg className="w-4 h-4 text-[#5f6368] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
                <span className="text-sm text-[#202124]">{search}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#f2f2f2] text-[14px] text-[#70757a] mt-auto">
        <div className="px-4 sm:px-7 py-[15px] border-b border-[#dadce0]">
          <span>India</span>
        </div>
        <div className="px-4 sm:px-7 py-[15px] flex flex-wrap justify-center sm:justify-between gap-x-7 gap-y-3 max-w-[1600px] mx-auto">
          <div className="flex flex-wrap gap-x-7">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Advertising</a>
            <a href="#" className="hover:underline">Business</a>
            <a href="#" className="hover:underline">How Search works</a>
          </div>
          <div className="flex flex-wrap gap-x-7">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SearchPage;
