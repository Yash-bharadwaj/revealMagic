
import { SearchEvent, Performer } from '../types';

type Listener = (event: SearchEvent) => void;
type PerformerListener = (performers: Performer[]) => void;

class MockStore {
  private listeners: Set<Listener> = new Set();
  private performerListeners: Set<PerformerListener> = new Set();
  
  private history: SearchEvent[] = [];
  private performers: Performer[] = [
    {
      id: 'magic-123',
      name: 'The Great Mysterioso',
      username: 'mysterioso',
      status: 'active',
      createdAt: Date.now() - 86400000 * 10,
      totalSearches: 42,
      lastActive: Date.now() - 3600000
    },
    {
      id: 'demo-user',
      name: 'Demo Performer',
      username: 'demo',
      status: 'active',
      createdAt: Date.now() - 86400000,
      totalSearches: 12,
      lastActive: Date.now()
    }
  ];

  subscribe(callback: Listener) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  subscribePerformers(callback: PerformerListener) {
    this.performerListeners.add(callback);
    callback([...this.performers]);
    return () => this.performerListeners.delete(callback);
  }

  async submitSearch(performerId: string, query: string): Promise<void> {
    const newEvent: SearchEvent = {
      id: Math.random().toString(36).substr(2, 9),
      performerId,
      query,
      timestamp: Date.now(),
      deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser'
    };

    this.history.unshift(newEvent);
    
    // Update performer stats
    const performer = this.performers.find(p => p.id === performerId);
    if (performer) {
      performer.totalSearches++;
      performer.lastActive = Date.now();
      this.notifyPerformerListeners();
    }

    this.listeners.forEach(listener => listener(newEvent));

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Reveal: Search Received', {
        body: `"${query}"`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png'
      });
    }
  }

  getHistory(performerId: string): SearchEvent[] {
    return this.history.filter(e => e.performerId === performerId);
  }

  getGlobalStats() {
    return {
      totalSearches: this.history.length + 54, // Adding some base number for realism
      activePerformers: this.performers.filter(p => p.status === 'active').length,
      recentActivity: this.history.slice(0, 5)
    };
  }

  addPerformer(performer: Omit<Performer, 'id' | 'createdAt' | 'totalSearches' | 'status'>) {
    const newPerformer: Performer = {
      ...performer,
      id: Math.random().toString(36).substr(2, 6),
      createdAt: Date.now(),
      totalSearches: 0,
      status: 'active'
    };
    this.performers.push(newPerformer);
    this.notifyPerformerListeners();
    return newPerformer;
  }

  deletePerformer(id: string) {
    this.performers = this.performers.filter(p => p.id !== id);
    this.notifyPerformerListeners();
  }

  private notifyPerformerListeners() {
    this.performerListeners.forEach(listener => listener([...this.performers]));
  }
}

export const mockStore = new MockStore();
