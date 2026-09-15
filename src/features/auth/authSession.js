const TOKEN_STORAGE_KEY = 'cuplik_auth_token';
const USER_STORAGE_KEY = 'cuplik_auth_user';

let currentToken = null;
let currentUser = null;
const invalidationListeners = new Set();

// Initialize from storage on module load if available
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    currentToken = localStorage.getItem(TOKEN_STORAGE_KEY) || null;
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    if (rawUser) {
      currentUser = JSON.parse(rawUser);
    }
  } catch (e) {
    console.warn('Error accessing localStorage:', e);
  }
}

export const authSession = {
  getToken() {
    if (!currentToken && typeof window !== 'undefined' && window.localStorage) {
      currentToken = localStorage.getItem(TOKEN_STORAGE_KEY) || null;
    }
    return currentToken;
  },

  getUser() {
    if (!currentUser && typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(USER_STORAGE_KEY);
        if (raw) currentUser = JSON.parse(raw);
      } catch (e) {
        currentUser = null;
      }
    }
    return currentUser;
  },

  setSession(token, user) {
    currentToken = token;
    currentUser = user;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
        if (user) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch (e) {
        console.warn('Error writing to localStorage:', e);
      }
    }
  },

  clearSession() {
    currentToken = null;
    currentUser = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      } catch (e) {
        console.warn('Error clearing localStorage:', e);
      }
    }
  },

  notifyInvalidated(message = 'Session expired') {
    authSession.clearSession();
    invalidationListeners.forEach((listener) => {
      try {
        listener(message);
      } catch (err) {
        console.error('Error in auth session invalidation listener:', err);
      }
    });
  },

  subscribeToInvalidation(callback) {
    invalidationListeners.add(callback);
    return () => {
      invalidationListeners.delete(callback);
    };
  },
};
