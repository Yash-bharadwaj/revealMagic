
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { firestoreService } from '../services/firestoreService';
import { GOOGLE_SEARCH_URL } from '../constants';

const TRENDING_SEARCHES = [
  'makar sankranti wishes',
  'bts world tour dates',
  'flipkart iphone 17',
  'tata punch facelift',
  'weather forecast today',
  'latest movie releases',
  'cricket world cup 2025',
  'stock market today',
  'best restaurants near me',
  'tech news updates'
];

const SearchPage: React.FC = () => {
  const { performerId } = useParams<{ performerId: string }>();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Replace current history entry instead of adding new one
    if (window.history.replaceState) {
      window.history.replaceState(null, "", window.location.href);
    }

    // Check lock status
    if (performerId) {
      firestoreService.getLockStatus(performerId).then((locked) => {
        setIsLocked(locked);
        // If link is locked, redirect to Google homepage immediately
        if (locked) {
          try {
            window.top!.location.replace('https://www.google.com');
          } catch (err) {
            window.location.replace('https://www.google.com');
          }
        }
      }).catch((error) => {
        console.error('Error checking lock status:', error);
      });
    }

    // Prevent overscroll bounce on mobile
    const preventOverscroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Allow scrolling in scrollable containers
      if (target.closest('.overflow-y-auto, [style*="overflow"]')) {
        return;
      }
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      // Prevent bounce at top
      if (scrollTop <= 0 && e.touches[0].pageY > (e as any).initialTouchY) {
        e.preventDefault();
        return false;
      }
      
      // Prevent bounce at bottom
      if (scrollTop + clientHeight >= scrollHeight - 1 && e.touches[0].pageY < (e as any).initialTouchY) {
        e.preventDefault();
        return false;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      (e as any).initialTouchY = e.touches[0].pageY;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', preventOverscroll, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', preventOverscroll);
    };
  }, [performerId]);

  // Redirect to Google if link becomes locked
  useEffect(() => {
    if (isLocked) {
      try {
        window.top!.location.replace('https://www.google.com');
      } catch (err) {
        window.location.replace('https://www.google.com');
      }
    }
  }, [isLocked]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // If link is locked, redirect to real Google
    if (isLocked) {
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmedQuery)}`;
      try {
        window.top!.location.replace(googleUrl);
      } catch (err) {
        window.location.replace(googleUrl);
      }
      return;
    }

    if (performerId) {
      try {
        await firestoreService.submitSearch(performerId, trimmedQuery);
      } catch (error) {
        console.error('Error submitting search:', error);
      }
    }

    const googleUrl = `${GOOGLE_SEARCH_URL}${encodeURIComponent(trimmedQuery)}`;
    try {
      // Use replace to prevent going back to search page
      window.top!.location.replace(googleUrl);
    } catch (err) {
      // Use replace to prevent going back to search page
      window.location.replace(googleUrl);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      window.location.replace('https://lens.google.com/');
    }
  };

  const toggleAIMode = () => {
    setIsAIMode(!isAIMode);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <>
      <style>{`
        @keyframes themeFade {
          0% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            opacity: 1;
          }
        }
        .theme-transition {
          animation: themeFade 0.6s ease-in-out;
        }
      `}</style>
      <div 
        className={`min-h-screen flex flex-col font-sans overflow-x-hidden transition-colors duration-500 ease-in-out theme-transition ${
          isDarkTheme 
            ? 'bg-[#202124] sm:bg-[#202124]' 
            : 'bg-white sm:bg-white'
        }`}
        style={{
          overscrollBehavior: 'none',
          overscrollBehaviorY: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
      {/* Header - Desktop */}
      <header className="hidden sm:flex w-full items-center justify-between px-4 sm:px-6 h-[60px]">
        <div className="flex items-center gap-6 text-[13px] text-[#202124]">
          <a href="#" className="hover:underline cursor-pointer whitespace-nowrap">About</a>
          <a href="#" className="hover:underline cursor-pointer whitespace-nowrap">Store</a>
          <a href="#" className="hover:underline cursor-pointer whitespace-nowrap">Gmail</a>
          <a href="#" className="hover:underline cursor-pointer whitespace-nowrap">Images</a>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" aria-label="Google apps">
            <svg className="w-5 h-5 text-[#5f6368]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6,8c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.9,8,6,8z M12,20c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S10.9,20,12,20z M6,20 c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.9,20,6,20z M6,14c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.9,14,6,14z M12,14c1.1,0,2-0.9,2-2 s-0.9-2-2-2s-2,0.9-2,2S10.9,14,12,14z M18,14c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S16.9,14,18,14z M18,8c1.1,0,2-0.9,2-2 s-0.9-2-2-2s-2,0.9-2,2S16.9,8,18,8z M12,8c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S10.9,8,12,8z M18,20c1.1,0,2-0.9,2-2s-0.9-2-2-2 s-2,0.9-2,2S16.9,20,18,20z"></path>
            </svg>
          </button>
          <button className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2 rounded-[4px] font-medium hover:shadow-[0_1px_3px_1px_rgba(66,64,67,0.15),0_1px_2px_0_rgba(60,64,67,0.3)] transition-all text-sm cursor-pointer whitespace-nowrap">
            Sign in
          </button>
        </div>
      </header>

      {/* Header - Mobile */}
      <header className={`sm:hidden w-full flex items-center justify-between px-4 h-[48px] transition-colors duration-500 ease-in-out ${
        isDarkTheme ? 'bg-[#202124]' : 'bg-white'
      }`}>
        <div className="flex items-center gap-2">
          <button className="p-2 cursor-pointer" aria-label="Filter">
            <svg className={`w-5 h-5 ${isDarkTheme ? 'text-white' : 'text-[#5f6368]'}`} fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
              <path d="M209-120q-42 0-70.5-28.5T110-217q0-14 3-25.5t9-21.5l228-341q10-14 15-31t5-34v-110h-20q-13 0-21.5-8.5T320-810q0-13 8.5-21.5T350-840h260q13 0 21.5 8.5T640-810q0 13-8.5 21.5T610-780h-20v110q0 17 5 34t15 31l227 341q6 9 9.5 20.5T850-217q0 41-28 69t-69 28H209Zm221-660v110q0 26-7.5 50.5T401-573L276-385q-6 8-8.5 16t-2.5 16q0 23 17 39.5t42 16.5q28 0 56-12t80-47q69-45 103.5-62.5T633-443q4-1 5.5-4.5t-.5-7.5l-78-117q-15-21-22.5-46t-7.5-52v-110H430Z"/>
            </svg>
          </button>
          <div className="flex items-center gap-1">
            <a href="#" className={`px-3 py-2 text-sm font-medium border-b-2 cursor-pointer ${
              isDarkTheme 
                ? 'text-[#8ab4f8] border-[#8ab4f8]' 
                : 'text-[#1a73e8] border-[#1a73e8]'
            }`}>ALL</a>
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className={`px-3 py-2 text-sm cursor-pointer ${
                isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#5f6368]'
              }`}
            >
              IMAGES
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 cursor-pointer relative" aria-label="Notifications" onClick={(e) => e.preventDefault()}>
            <svg className={`w-5 h-5 ${isDarkTheme ? 'text-white' : 'text-[#5f6368]'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
            <span className="absolute top-1 right-1 bg-[#EA4335] text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center leading-none">
              4
            </span>
          </button>
          <button className="p-2 cursor-pointer" aria-label="Google apps" onClick={(e) => e.preventDefault()}>
            <svg className={`w-5 h-5 ${isDarkTheme ? 'text-white' : 'text-[#5f6368]'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M6,8c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.9,8,6,8z M12,20c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S10.9,20,12,20z M6,20 c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.9,20,6,20z M6,14c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S4.9,14,6,14z M12,14c1.1,0,2-0.9,2-2 s-0.9-2-2-2s-2,0.9-2,2S10.9,14,12,14z M18,14c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S16.9,14,18,14z M18,8c1.1,0,2-0.9,2-2 s-0.9-2-2-2s-2,0.9-2,2S16.9,8,18,8z M12,8c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S10.9,8,12,8z M18,20c1.1,0,2-0.9,2-2s-0.9-2-2-2 s-2,0.9-2,2S16.9,20,18,20z"></path>
            </svg>
          </button>
          <button 
            className={`bg-[#1a73e8] hover:bg-[#1557b0] text-white px-3 py-1.5 rounded-[4px] font-medium hover:shadow-[0_1px_3px_1px_rgba(66,64,67,0.15),0_1px_2px_0_rgba(60,64,67,0.3)] transition-all text-xs cursor-pointer whitespace-nowrap rounded-full`}
            onClick={(e) => e.preventDefault()}
          >
            Sign in
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-12 sm:pt-[120px] pb-8 px-4">
        {/* Google Logo */}
        <div className="mb-6 sm:mb-10">
          <img 
            src="/GooogleLogo.png" 
            alt="Google" 
            className="h-[50px] sm:h-[92px] w-auto transition-opacity duration-500 ease-in-out"
            style={{
              filter: isDarkTheme ? 'brightness(0) invert(1)' : 'none'
            }}
          />
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-[584px] mb-6 sm:mb-8">
          <div 
            className={`flex items-center w-full h-[44px] sm:h-[46px] px-4 sm:px-5 rounded-full border transition-all duration-500 ease-in-out ${
              isDarkTheme 
                ? 'bg-[#303134] sm:bg-[#303134]' 
                : 'bg-white sm:bg-white'
            }
            ${isFocused 
              ? 'shadow-[0_2px_5px_1px_rgba(64,60,67,0.16)] border-transparent' 
              : isDarkTheme
                ? 'border-[#5f6368] hover:shadow-[0_2px_5px_1px_rgba(64,60,67,0.16)] hover:border-transparent'
                : 'border-[#dfe1e5] hover:shadow-[0_2px_5px_1px_rgba(64,60,67,0.16)] hover:border-transparent'
            }`}
          >
            {/* Search Icon - Mobile / Plus Icon - Desktop */}
            <button type="button" className={`p-1.5 rounded-full transition-colors cursor-pointer mr-2 flex-shrink-0 ${
              isDarkTheme 
                ? 'hover:bg-[#3c4043] sm:hover:bg-[#3c4043]' 
                : 'hover:bg-gray-100 sm:hover:bg-gray-100'
            }`}>
              {/* Search Icon for Mobile */}
              <svg className={`w-5 h-5 sm:hidden ${
                isDarkTheme ? 'text-white' : 'text-[#9aa0a6]'
              }`} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              {/* Plus Icon for Desktop */}
              <svg className={`hidden sm:block w-5 h-5 ${
                isDarkTheme ? 'text-white' : 'text-[#9aa0a6]'
              }`} fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
                <path d="M434.5-434.5H191.87v-91H434.5v-242.63h91v242.63h242.63v91H525.5v242.63h-91V-434.5Z"/>
              </svg>
            </button>

            {/* Input */}
            <input 
              ref={inputRef}
              type="search" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={(e) => {
                setIsFocused(true);
                // Scroll input into view on mobile when keyboard appears
                if (window.innerWidth < 640) {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }
              }}
              onBlur={() => setIsFocused(false)}
              enterKeyHint="search"
              className="flex-1 min-w-0 focus:outline-none text-[16px] h-full bg-transparent placeholder:text-[#9aa0a6] transition-colors duration-500 ease-in-out"
              style={{
                color: isDarkTheme ? '#ffffff' : '#202124'
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder=""
            />

            {/* Right Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-2 flex-shrink-0">
              {/* AI Mode - Mobile first */}
              <button
                type="button"
                onClick={toggleAIMode}
                className={`sm:hidden p-1.5 rounded-full transition-all cursor-pointer ${
                  isAIMode 
                    ? 'bg-[#1a73e8] text-white' 
                    : isDarkTheme 
                      ? 'text-[#9aa0a6]' 
                      : 'text-[#5f6368]'
                }`}
                title="AI Mode"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.65 11.58c.18-.5.27-1.03.31-1.58h-2c-.1 1.03-.51 1.93-1.27 2.69-.88.87-1.94 1.31-3.19 1.31C7.03 14 5 12.07 5 9.5 5 7.03 6.93 5 9.5 5c.46 0 .89.08 1.3.2l1.56-1.56C11.5 3.22 10.55 3 9.5 3 5.85 3 3 5.85 3 9.5S5.85 16 9.5 16c.56 0 2.26-.06 3.8-1.3l6.3 6.3 1.4-1.4-6.3-6.3c.4-.5.72-1.08.95-1.72z"/>
                  <path d="M17.5 12c0-3.04 2.46-5.5 5.5-5.5-3.04 0-5.5-2.46-5.5-5.5 0 3.04-2.46 5.5-5.5 5.5 3.04 0 5.5 2.46 5.5 5.5z"/>
                </svg>
              </button>

              {/* Microphone */}
              <button
                type="button"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isDarkTheme 
                    ? 'hover:bg-[#3c4043]' 
                    : 'hover:bg-gray-100'
                }`}
                title="Voice Search"
              >
                <img 
                  src="https://www.gstatic.com/images/branding/googlemic/2x/googlemic_color_24dp.png" 
                  className="w-6 h-6" 
                  alt="Voice Search"
                />
              </button>

              {/* Camera */}
              <button
                type="button"
                onClick={handleCameraClick}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isDarkTheme 
                    ? 'hover:bg-[#3c4043]' 
                    : 'hover:bg-gray-100'
                }`}
                title="Search by image"
              >
                <svg className={`w-6 h-6 ${
                  isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#5f6368]'
                }`} fill="currentColor" viewBox="0 -960 960 960">
                  <path d="M480-320q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Zm240 160q-33 0-56.5-23.5T640-240q0-33 23.5-56.5T720-320q33 0 56.5 23.5T800-240q0 33-23.5 56.5T720-160Zm-440 40q-66 0-113-47t-47-113v-80h80v80q0 33 23.5 56.5T280-200h200v80H280Zm480-320v-160q0-33-23.5-56.5T680-680H280q-33 0-56.5 23.5T200-600v120h-80v-120q0-66 47-113t113-47h80l40-80h160l40 80h80q66 0 113 47t47 113v160h-80Z"/>
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

              {/* AI Mode - Desktop */}
              <button
                type="button"
                onClick={toggleAIMode}
                className={`hidden sm:flex px-3 py-1.5 rounded-full text-xs font-medium transition-all items-center gap-1.5 cursor-pointer ${
                  isAIMode 
                    ? 'bg-[#1a73e8] text-white' 
                    : 'bg-[#f1f3f4] text-[#3c4043] hover:bg-[#e8eaed]'
                }`}
                title="AI Mode"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.65 11.58c.18-.5.27-1.03.31-1.58h-2c-.1 1.03-.51 1.93-1.27 2.69-.88.87-1.94 1.31-3.19 1.31C7.03 14 5 12.07 5 9.5 5 7.03 6.93 5 9.5 5c.46 0 .89.08 1.3.2l1.56-1.56C11.5 3.22 10.55 3 9.5 3 5.85 3 3 5.85 3 9.5S5.85 16 9.5 16c.56 0 2.26-.06 3.8-1.3l6.3 6.3 1.4-1.4-6.3-6.3c.4-.5.72-1.08.95-1.72z"/>
                  <path d="M17.5 12c0-3.04 2.46-5.5 5.5-5.5-3.04 0-5.5-2.46-5.5-5.5 0 3.04-2.46 5.5-5.5 5.5 3.04 0 5.5 2.46 5.5 5.5z"/>
                </svg>
                <span className="whitespace-nowrap">AI Mode</span>
              </button>
            </div>
          </div>

          {/* Search Buttons - Desktop Only */}
          <div className="hidden sm:flex mt-7 flex-row justify-center gap-3">
            <button 
              type="submit"
              className="px-4 py-2 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow-[0_1px_1px_rgba(0,0,0,0.1)] rounded-[4px] text-sm text-[#3c4043] transition-all min-w-[120px] sm:min-w-[126px] cursor-pointer"
            >
              Google Search
            </button>
            <button 
              type="button"
              className="px-4 py-2 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow-[0_1px_1px_rgba(0,0,0,0.1)] rounded-[4px] text-sm text-[#3c4043] transition-all min-w-[120px] sm:min-w-[126px] cursor-pointer"
            >
              I'm Feeling Lucky
            </button>
          </div>
        </form>

        {/* Promotional Link - Desktop */}
        <div className="hidden sm:flex items-center justify-center gap-2 mb-6">
          <img 
            src="/googlebag.png" 
            alt="Google" 
            className="w-5 h-5 flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <a href="#" className="text-[#1a73e8] hover:underline text-sm cursor-pointer whitespace-nowrap">
            Enjoy Republic Day deals on the latest Google Pixel devices & more
          </a>
        </div>

        {/* Language Options */}
        <div className="text-center mb-6 sm:mb-12">
          <p className={`text-[13px] mb-2 ${
            isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#4d5156]'
          }`}>Google offered in:</p>
          <div className="flex flex-wrap justify-center gap-x-1.5 sm:gap-x-2 gap-y-1 text-[13px]">
            <a href="#" className={`hover:underline cursor-pointer ${
              isDarkTheme ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
            }`}>हिन्दी</a>
            <span className={isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#4d5156]'}>·</span>
            <a href="#" className={`hover:underline cursor-pointer ${
              isDarkTheme ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
            }`}>বাংলা</a>
            <span className={isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#4d5156]'}>·</span>
            <a href="#" className={`hover:underline cursor-pointer ${
              isDarkTheme ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
            }`}>తెలుగు</a>
            <span className={isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#4d5156]'}>·</span>
            <a href="#" className={`hover:underline cursor-pointer ${
              isDarkTheme ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
            }`}>मराठी</a>
            <span className={isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#4d5156]'}>·</span>
            <a href="#" className={`hover:underline cursor-pointer ${
              isDarkTheme ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
            }`}>தமிழ்</a>
            <span className={isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#4d5156]'}>·</span>
            <a href="#" className={`hover:underline cursor-pointer ${
              isDarkTheme ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
            }`}>ગુજરાતી</a>
            <span className={isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#4d5156]'}>·</span>
            <a href="#" className={`hover:underline cursor-pointer ${
              isDarkTheme ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
            }`}>ಕನ್ನಡ</a>
            <span className={isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#4d5156]'}>·</span>
            <a href="#" className={`hover:underline cursor-pointer ${
              isDarkTheme ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
            }`}>മലയാളം</a>
            <span className={isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#4d5156]'}>·</span>
            <a href="#" className={`hover:underline cursor-pointer ${
              isDarkTheme ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
            }`}>ਪੰਜਾਬੀ</a>
          </div>
        </div>

        {/* Trending Searches - Mobile */}
        <div className="w-full max-w-[584px] sm:hidden">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className={`text-base font-medium ${
              isDarkTheme ? 'text-white' : 'text-[#202124]'
            }`}>Trending searches</h2>
            <button className="p-1 cursor-pointer" onClick={(e) => e.preventDefault()}>
              <svg className={`w-5 h-5 ${
                isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#5f6368]'
              }`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
          <div 
            className="w-full overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: isDarkTheme ? '#5f6368 transparent' : '#dadce0 transparent',
              maxHeight: '180px'
            }}
          >
            <style>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .trending-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .trending-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .trending-scroll::-webkit-scrollbar-thumb {
                background-color: ${isDarkTheme ? '#5f6368' : '#dadce0'};
                border-radius: 3px;
              }
              .trending-scroll::-webkit-scrollbar-thumb:hover {
                background-color: ${isDarkTheme ? '#70757a' : '#bdc1c6'};
              }
            `}</style>
            <div className="trending-scroll">
              {TRENDING_SEARCHES.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    handleSearch();
                  }}
                  className={`w-full flex items-center gap-3 px-2 py-3 text-left transition-all duration-200 cursor-pointer transform hover:scale-[1.01] ${
                    isDarkTheme
                      ? 'hover:bg-[#303134] active:bg-[#3c4043]'
                      : 'hover:bg-gray-50 active:bg-gray-100'
                  } ${
                    index < TRENDING_SEARCHES.length - 1 
                      ? `border-b ${isDarkTheme ? 'border-[#3c4043]' : 'border-[#e8eaed]'}`
                      : ''
                  }`}
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  <svg className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                    isDarkTheme ? 'text-[#9aa0a6]' : 'text-[#5f6368]'
                  }`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                  <span className={`text-sm transition-colors duration-200 ${
                    isDarkTheme ? 'text-white' : 'text-[#202124]'
                  }`}>{search}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`w-full text-[14px] mt-auto transition-colors duration-500 ease-in-out ${
        isDarkTheme 
          ? 'bg-[#171717] text-[#bdc1c6]' 
          : 'bg-[#f2f2f2] text-[#70757a]'
      }`}>
        {/* India Strip */}
        <div className={`px-4 sm:px-7 py-[15px] ${
          isDarkTheme ? 'border-b border-[#3c4043]' : 'border-b border-[#dadce0]'
        }`}>
          <span className={`font-medium ${
            isDarkTheme ? 'text-[#bdc1c6]' : 'text-[#70757a]'
          }`}>India</span>
        </div>
        {/* Links Section - Combined */}
        <div className="px-4 sm:px-7 py-[15px] flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2">
          <button 
            onClick={toggleTheme}
            className={`hover:underline cursor-pointer ${
              isDarkTheme ? 'text-[#bdc1c6]' : 'text-[#70757a]'
            }`}
          >
            Dark theme: {isDarkTheme ? 'on' : 'off'}
          </button>
          <button 
            onClick={(e) => e.preventDefault()}
            className={`hover:underline cursor-pointer bg-transparent border-none p-0 ${
              isDarkTheme ? 'text-[#bdc1c6]' : 'text-[#70757a]'
            }`}
          >Settings</button>
          <button 
            onClick={(e) => e.preventDefault()}
            className={`hover:underline cursor-pointer bg-transparent border-none p-0 ${
              isDarkTheme ? 'text-[#bdc1c6]' : 'text-[#70757a]'
            }`}
          >Privacy</button>
          <button 
            onClick={(e) => e.preventDefault()}
            className={`hover:underline cursor-pointer bg-transparent border-none p-0 ${
              isDarkTheme ? 'text-[#bdc1c6]' : 'text-[#70757a]'
            }`}
          >Terms</button>
          <button 
            onClick={(e) => e.preventDefault()}
            className={`hover:underline cursor-pointer bg-transparent border-none p-0 ${
              isDarkTheme ? 'text-[#bdc1c6]' : 'text-[#70757a]'
            }`}
          >Advertising</button>
          <button 
            onClick={(e) => e.preventDefault()}
            className={`hover:underline cursor-pointer border-b bg-transparent p-0 ${
              isDarkTheme 
                ? 'text-[#bdc1c6] border-[#bdc1c6]' 
                : 'text-[#70757a] border-[#70757a]'
            }`}
          >Business</button>
          <button 
            onClick={(e) => e.preventDefault()}
            className={`hover:underline cursor-pointer bg-transparent border-none p-0 ${
              isDarkTheme ? 'text-[#bdc1c6]' : 'text-[#70757a]'
            }`}
          >About</button>
        </div>
      </footer>
    </div>
    </>
  );
};

export default SearchPage;
