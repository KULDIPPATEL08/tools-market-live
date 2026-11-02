import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('scoutboard_token'),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('scoutboard_token', token);
    else localStorage.removeItem('scoutboard_token');
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('scoutboard_token');
    set({ user: null, token: null });
  },
}));

interface UIState {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  activeQuickAction: 'url' | 'source' | 'project' | null;
  setActiveQuickAction: (action: 'url' | 'source' | 'project' | null) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),
  activeQuickAction: null,
  setActiveQuickAction: (activeQuickAction) => set({ activeQuickAction }),
  globalSearchQuery: '',
  setGlobalSearchQuery: (globalSearchQuery) => set({ globalSearchQuery }),
}));

