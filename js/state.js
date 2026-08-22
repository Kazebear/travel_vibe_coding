import { getItem, setItem, removeItem } from './utils/storage.js';
import { STORAGE_KEYS } from './utils/constants.js';

const listeners = new Set();

const state = {
  currentUser: getItem(STORAGE_KEYS.SESSION_USER, null),
  cart: getItem(STORAGE_KEYS.CART, { flights: [], tours: [] }),
  searchParams: getItem(STORAGE_KEYS.SEARCH_PARAMS, null),
};

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn(state));
}

export function setCurrentUser(user) {
  state.currentUser = user;
  if (user) setItem(STORAGE_KEYS.SESSION_USER, user);
  else removeItem(STORAGE_KEYS.SESSION_USER);
  notify();
}

export function setCart(cart) {
  state.cart = cart;
  setItem(STORAGE_KEYS.CART, cart);
  notify();
}

export function setSearchParams(params) {
  state.searchParams = params;
  setItem(STORAGE_KEYS.SEARCH_PARAMS, params);
  notify();
}
