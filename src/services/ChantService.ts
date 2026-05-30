import { Chant, UserChant, ChantSession } from '../types';
import defaultChants from '../data/chants.json';

function getLocal<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function setLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

class ChantService {
  private listeners: ((chants: UserChant[]) => void)[] = [];

  private notifyListeners() {
    const chants = this.getLocalChants();
    this.listeners.forEach(l => l(chants));
  }

  getLocalChants(): UserChant[] {
    const chants = getLocal<UserChant[]>('app_user_chants', []);
    if (chants.length === 0) {
      const mapped = defaultChants.map(c => ({
        id: c.id.toString(),
        title: c.name,
        chant: c.chant,
        totalCount: 0,
        lastUsed: 0,
        isCustom: false
      }));
      setLocal('app_user_chants', mapped);
      return mapped.sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
    }
    return chants.sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
  }

  async getUserChants(): Promise<UserChant[]> {
    return this.getLocalChants();
  }

  async addChant(chant: Omit<UserChant, 'id' | 'totalCount'>): Promise<string> {
    const chants = this.getLocalChants();
    const newChant: UserChant = {
      ...chant,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      totalCount: 0,
      lastUsed: Date.now(),
      isCustom: true
    };
    chants.push(newChant);
    setLocal('app_user_chants', chants);
    this.notifyListeners();
    return newChant.id;
  }

  async deleteChant(chantId: string): Promise<void> {
    const chants = this.getLocalChants();
    const updated = chants.filter(c => c.id !== chantId);
    setLocal('app_user_chants', updated);
    this.notifyListeners();
  }

  async logSession(chantId: string, count: number): Promise<void> {
    const sessions = getLocal<ChantSession[]>('app_chant_sessions', []);
    const session: ChantSession = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      chantId,
      count,
      timestamp: Date.now()
    };
    sessions.push(session);
    setLocal('app_chant_sessions', sessions);

    const chants = this.getLocalChants();
    const chantIndex = chants.findIndex(c => c.id === chantId);
    if (chantIndex >= 0) {
      chants[chantIndex].totalCount += count;
      chants[chantIndex].lastUsed = Date.now();
      setLocal('app_user_chants', chants);
    }
    
    this.notifyListeners();
  }

  subscribeToUserChants(callback: (chants: UserChant[]) => void) {
    this.listeners.push(callback);
    callback(this.getLocalChants());
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async updateMilestone(chantId: string, milestone: number): Promise<void> {
    const chants = this.getLocalChants();
    const chantIndex = chants.findIndex(c => c.id === chantId);
    if (chantIndex >= 0) {
      chants[chantIndex].milestone = milestone;
      setLocal('app_user_chants', chants);
      this.notifyListeners();
    }
  }

  async getSessionHistory(): Promise<ChantSession[]> {
    const sessions = getLocal<ChantSession[]>('app_chant_sessions', []);
    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const chantService = new ChantService();
