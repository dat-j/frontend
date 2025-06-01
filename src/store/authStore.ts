import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

interface FacebookPage {
  id: string;
  name: string;
  picture?: string;
  access_token: string;
  category?: string;
  followers_count?: number;
  is_connected: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  facebookPages?: FacebookPage[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  connectFacebookPage: (pageId: string, accessToken: string) => Promise<void>;
  disconnectFacebookPage: (pageId: string) => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  processFacebookCallback: (code: string, state: string, redirectUri: string) => Promise<void>;
  loadConnectedPages: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(email, password);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(name, email, password);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
        authService.logout();
      },

      refreshUser: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const user = await authService.getProfile();
          set({ user });
        } catch (error) {
          // Token might be invalid, logout
          get().logout();
        }
      },

      connectFacebookPage: async (pageId: string, accessToken: string) => {
        set({ isLoading: true });
        try {
          const updatedUser = await authService.connectFacebookPage(pageId, accessToken);
          set({ 
            user: updatedUser,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      disconnectFacebookPage: async (pageId: string) => {
        set({ isLoading: true });
        try {
          const updatedUser = await authService.disconnectFacebookPage(pageId);
          set({ 
            user: updatedUser,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token: string) => {
        set({ token });
      },

      processFacebookCallback: async (code: string, state: string, redirectUri: string) => {
        set({ isLoading: true });
        try {
          const userData = await authService.processFacebookCallback(code, state, redirectUri);
          set({ 
            user: userData, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loadConnectedPages: async () => {
        try {
          const pages = await authService.getConnectedPages();
          const currentUser = get().user;
          if (currentUser) {
            set({ 
              user: { 
                ...currentUser, 
                facebookPages: pages 
              } 
            });
          }
        } catch (error) {
          // Don't throw here, just log the error
          console.error('Error loading connected pages:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
); 