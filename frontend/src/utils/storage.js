// Centralized localStorage keys & helpers so the rest of the app never
// touches window.localStorage directly (easier to swap storage strategy).

export const STORAGE_KEYS = {
  TOKEN: 'shopwave_token',
  USER: 'shopwave_user',
  GUEST_CART: 'shopwave_guest_cart',
};

export const getStoredToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    else localStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch {
    /* ignore storage errors (e.g. private browsing) */
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  } catch {
    /* ignore */
  }
};

export const getGuestCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setGuestCart = (items) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(items));
  } catch {
    /* ignore */
  }
};

export const clearAuthStorage = () => {
  setStoredToken(null);
  setStoredUser(null);
};
