
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SearchEvent } from '../types';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { getFCMToken } from '../firebase/config';

// Shimmer animation styles
const shimmerStyles = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .shimmer-badge {
    background: linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.3) 50%, rgba(16, 185, 129, 0.2) 100%);
    background-size: 200% 100%;
    animation: shimmer 3s ease-in-out infinite;
  }
  .shimmer-badge:hover {
    background: linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, rgba(52, 211, 153, 0.4) 50%, rgba(16, 185, 129, 0.3) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }
  @keyframes shimmer-slide {
    0% { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateX(200%) skewX(-15deg); opacity: 0; }
  }
  .shimmer-overlay {
    animation: shimmer-slide 2.5s ease-in-out infinite;
  }
`;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { performerId: urlPerformerId } = useParams<{ performerId?: string }>();
  const [events, setEvents] = useState<SearchEvent[]>([]);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use URL performerId if available, otherwise fall back to user's performerId
  const performerId = urlPerformerId || user?.performerId;

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
  }, [user, navigate]);

  // Verify performer route access
  useEffect(() => {
    if (user && user.role === 'performer' && urlPerformerId) {
      // If performer tries to access a different performer's route, redirect to their own
      if (user.performerId && urlPerformerId !== user.performerId) {
        navigate(`/${user.performerId}`, { replace: true });
      }
    } else if (user && user.role === 'performer' && !urlPerformerId && user.performerId) {
      // If performer accesses /dashboard, redirect to their performer route
      navigate(`/${user.performerId}`, { replace: true });
    }
  }, [user, urlPerformerId, navigate]);

  useEffect(() => {
    if (!performerId) {
      setIsLoading(false);
      return;
    }

    // Load initial history and cleanup old searches
    firestoreService.getHistory(performerId).then(async (history) => {
      setEvents(history);
      setIsLoading(false);
      // Cleanup old searches (keep only top 30)
      await firestoreService.cleanupOldSearches(performerId);
    }).catch((error) => {
      console.error('Error loading history:', error);
      setIsLoading(false);
    });

    // Subscribe to real-time updates
    const unsubscribe = firestoreService.subscribe(performerId, async (newEvent) => {
      setEvents(prev => {
        // Allow duplicates - just add new event at the beginning
        const updated = [newEvent, ...prev].sort((a, b) => b.timestamp - a.timestamp);
        // Keep only top 30
        return updated.slice(0, 30);
      });
      
      // Reset to first page when new search arrives
      setCurrentPage(1);
      
      // Cleanup old searches after adding new one
      firestoreService.cleanupOldSearches(performerId).catch(err => {
        console.error('Error cleaning up after new search:', err);
      });
    });

    // Check notification permission
    if ('Notification' in window) {
      setIsNotificationsEnabled(Notification.permission === 'granted');
    }

    return () => unsubscribe();
  }, [performerId]);

  const toggleNotifications = async () => {
    if (!performerId) return;

    if ('Notification' in window) {
      if (!isNotificationsEnabled) {
        // Enable notifications
        const permission = await Notification.requestPermission();
        const enabled = permission === 'granted';
        setIsNotificationsEnabled(enabled);

        if (enabled) {
          // Get FCM token and save to Firestore
          try {
            const token = await getFCMToken();
            if (token && user?.id) {
              console.log('FCM token obtained, saving to Firestore...', token.substring(0, 20) + '...');
              await firestoreService.updateUserFCMToken(user.id, token);
              console.log('FCM token saved successfully');
            } else {
              console.warn('FCM token not obtained or user ID missing', { token: token ? 'exists' : 'missing', userId: user?.id });
            }
          } catch (error) {
            console.error('Error getting FCM token:', error);
          }
        }
      } else {
        // Disable notifications
        setIsNotificationsEnabled(false);
        // Optionally remove FCM token from Firestore
        if (user?.id) {
          try {
            await firestoreService.updateUserFCMToken(user.id, '');
          } catch (error) {
            console.error('Error removing FCM token:', error);
          }
        }
      }
    }
  };

  const searchLink = performerId 
    ? `${window.location.origin}/#/search/${performerId}`
    : '';

  const copyLink = () => {
    if (searchLink) {
      navigator.clipboard.writeText(searchLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  if (!performerId && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Performer ID Required</h2>
            <p className="text-zinc-500 mb-4">No performer ID has been assigned to your account yet.</p>
            <p className="text-zinc-700 text-sm mb-6">An administrator needs to:</p>
            <ol className="text-left text-zinc-600 text-sm space-y-2 mb-6">
              <li>1. Create a performer profile for you</li>
              <li>2. Link your user account to that performer</li>
            </ol>
            <p className="text-zinc-700 text-xs">Please contact an administrator to get your account set up.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-white rounded-lg mb-4"></div>
          <p className="text-zinc-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800 selection:text-white">
      <style>{shimmerStyles}</style>
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Compact Header - Responsive */}
        <header className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Peak</h1>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="bg-zinc-950 border border-zinc-800 px-2 sm:px-3 py-1.5 rounded flex items-center gap-2 min-w-0">
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider flex-shrink-0">Link</span>
                <a 
                  href={searchLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] sm:text-xs font-mono text-zinc-300 hover:text-emerald-400 flex-1 truncate min-w-0 underline decoration-zinc-700 hover:decoration-emerald-400 transition-colors"
                  title="Open search page"
                >
                  {searchLink}
                </a>
                <button
                  onClick={copyLink}
                  className="text-zinc-500 hover:text-white transition-colors p-1 rounded hover:bg-zinc-800 flex-shrink-0"
                  title="Copy link"
                >
                  {linkCopied ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Toggle Switch with Label */}
              <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-1.5" title="Get push notifications when someone searches">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Push Alerts</span>
                <button
                  onClick={toggleNotifications}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-black flex-shrink-0 ${
                    isNotificationsEnabled 
                      ? 'bg-emerald-500' 
                      : 'bg-zinc-700'
                  }`}
                  role="switch"
                  aria-checked={isNotificationsEnabled}
                  aria-label="Toggle push notifications for new searches"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* History Table - Compact & Responsive with Pagination */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[10px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-500">History</h3>
            <div className="h-px flex-1 mx-2 sm:mx-3 bg-zinc-900"></div>
          </div>
          
          <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/30">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse min-w-[300px]">
                <tbody className="divide-y divide-zinc-900">
                  {events.length > 0 ? (() => {
                    const totalPages = Math.ceil(events.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedEvents = events.slice(startIndex, endIndex);
                    const globalIndex = startIndex;

                    return paginatedEvents.map((event, localIndex) => {
                      const index = globalIndex + localIndex;
                      return (
                        <tr key={event.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <p className={`font-bold text-zinc-200 tracking-tight break-words ${index === 0 ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'}`}>
                                {event.query}
                              </p>
                              {index === 0 && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded shimmer-badge border border-emerald-500/30 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-emerald-400 flex-shrink-0">
                                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                                  <span>LATEST</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-right whitespace-nowrap">
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-zinc-600">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </td>
                        </tr>
                      );
                    });
                  })() : (
                    <tr>
                      <td colSpan={2} className="px-3 py-12 text-center text-[10px] text-zinc-700 uppercase tracking-wider font-bold">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {events.length > itemsPerPage && (
              <div className="border-t border-zinc-900 bg-zinc-950/50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white disabled:text-zinc-700 disabled:cursor-not-allowed border border-zinc-800 rounded hover:border-zinc-600 transition-colors disabled:hover:border-zinc-800"
                    >
                      Prev
                    </button>
                    <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 px-2">
                      Page {currentPage} of {Math.ceil(events.length / itemsPerPage)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(events.length / itemsPerPage), prev + 1))}
                      disabled={currentPage >= Math.ceil(events.length / itemsPerPage)}
                      className="px-2 sm:px-3 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white disabled:text-zinc-700 disabled:cursor-not-allowed border border-zinc-800 rounded hover:border-zinc-600 transition-colors disabled:hover:border-zinc-800"
                    >
                      Next
                    </button>
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
                    {events.length} total
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>


        <footer className="mt-16 text-center py-10">
           <div className="h-px w-10 bg-zinc-800 mx-auto mb-6"></div>
           <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.5em]">Reveal Technology • v2.0.4</p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
