import { createContext, useContext, useReducer, ReactNode } from 'react';
import { useToast } from './use-toast';

// Global app state interface
interface AppState {
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  user: {
    theme: 'light' | 'dark' | 'system';
    language: 'de' | 'en';
    preferences: {
      animationsEnabled: boolean;
      notificationsEnabled: boolean;
      compactMode: boolean;
    };
  };
  cache: Record<string, any>;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
}

// Action types
type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<AppState['user']['preferences']> }
  | { type: 'SET_THEME'; payload: AppState['user']['theme'] }
  | { type: 'CACHE_SET'; payload: { key: string; value: any } }
  | { type: 'CACHE_CLEAR'; payload?: string };

// Initial state
const initialState: AppState = {
  isLoading: false,
  error: null,
  notifications: [],
  user: {
    theme: 'system',
    language: 'de',
    preferences: {
      animationsEnabled: true,
      notificationsEnabled: true,
      compactMode: false,
    }
  },
  cache: {}
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_NOTIFICATION':
      const notification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false
      };
      return {
        ...state,
        notifications: [notification, ...state.notifications.slice(0, 19)] // Keep only 20 notifications
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        )
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    
    case 'UPDATE_USER_PREFERENCES':
      return {
        ...state,
        user: {
          ...state.user,
          preferences: { ...state.user.preferences, ...action.payload }
        }
      };
    
    case 'SET_THEME':
      return {
        ...state,
        user: { ...state.user, theme: action.payload }
      };
    
    case 'CACHE_SET':
      return {
        ...state,
        cache: { ...state.cache, [action.payload.key]: action.payload.value }
      };
    
    case 'CACHE_CLEAR':
      if (action.payload) {
        const { [action.payload]: removed, ...rest } = state.cache;
        return { ...state, cache: rest };
      }
      return { ...state, cache: {} };
    
    default:
      return state;
  }
}

// Context
const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export function AppStateProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Hook
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  const { state, dispatch } = context;
  const { toast } = useToast();

  // Helper functions
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
    if (error) {
      toast({
        title: 'Fehler',
        description: error,
        variant: 'destructive'
      });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const markNotificationRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const updatePreferences = (preferences: Partial<AppState['user']['preferences']>) => {
    dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: preferences });
    // Persist to localStorage
    const current = localStorage.getItem('terminagent-preferences');
    const existing = current ? JSON.parse(current) : {};
    localStorage.setItem('terminagent-preferences', JSON.stringify({
      ...existing,
      ...preferences
    }));
  };

  const setTheme = (theme: AppState['user']['theme']) => {
    dispatch({ type: 'SET_THEME', payload: theme });
    localStorage.setItem('terminagent-theme', theme);
  };

  const cacheSet = (key: string, value: any) => {
    dispatch({ type: 'CACHE_SET', payload: { key, value } });
  };

  const cacheClear = (key?: string) => {
    dispatch({ type: 'CACHE_CLEAR', payload: key });
  };

  const cacheGet = (key: string) => {
    return state.cache[key];
  };

  // Computed values
  const unreadNotifications = state.notifications.filter(n => !n.read);

  return {
    // State
    ...state,
    unreadNotifications,
    
    // Actions
    setLoading,
    setError,
    addNotification,
    markNotificationRead,
    clearNotifications,
    updatePreferences,
    setTheme,
    cacheSet,
    cacheClear,
    cacheGet,
  };
}