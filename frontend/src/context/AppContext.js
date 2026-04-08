import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  projects: [],
  materials: [],
  notifications: [],
  isLoading: true,
};

// ─── Action Types ─────────────────────────────────────────────────────────────
export const ACTIONS = {
  SET_USER:            'SET_USER',
  SET_TOKEN:           'SET_TOKEN',
  LOGOUT:              'LOGOUT',
  SET_PROJECTS:        'SET_PROJECTS',
  ADD_PROJECT:         'ADD_PROJECT',
  UPDATE_PROJECT:      'UPDATE_PROJECT',
  SET_MATERIALS:       'SET_MATERIALS',
  ADD_MATERIAL:        'ADD_MATERIAL',
  SET_NOTIFICATIONS:   'SET_NOTIFICATIONS',
  ADD_NOTIFICATION:    'ADD_NOTIFICATION',
  SET_LOADING:         'SET_LOADING',
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    case ACTIONS.SET_TOKEN:
      return { ...state, token: action.payload };
    case ACTIONS.LOGOUT:
      return { ...initialState, isLoading: false };
    case ACTIONS.SET_PROJECTS:
      return { ...state, projects: action.payload };
    case ACTIONS.ADD_PROJECT:
      return { ...state, projects: [action.payload, ...state.projects] };
    case ACTIONS.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case ACTIONS.SET_MATERIALS:
      return { ...state, materials: action.payload };
    case ACTIONS.ADD_MATERIAL:
      return { ...state, materials: [action.payload, ...state.materials] };
    case ACTIONS.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };
    case ACTIONS.ADD_NOTIFICATION:
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Rehydrate auth from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userJson = await AsyncStorage.getItem('user');
        if (token && userJson) {
          dispatch({ type: ACTIONS.SET_TOKEN,  payload: token });
          dispatch({ type: ACTIONS.SET_USER,   payload: JSON.parse(userJson) });
        }
      } catch (e) {
        console.warn('Failed to load auth state:', e);
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    })();
  }, []);

  // Persist auth whenever it changes
  useEffect(() => {
    if (state.token) AsyncStorage.setItem('token', state.token);
    if (state.user)  AsyncStorage.setItem('user',  JSON.stringify(state.user));
  }, [state.token, state.user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be inside AppProvider');
  return ctx;
}