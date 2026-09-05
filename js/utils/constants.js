import { withBase } from './basePath.js';

export const ROUTES = {
  HOME: withBase('/'),
  FLIGHTS: withBase('/flights'),
  FLIGHT_DETAIL: withBase('/flight-detail'),
  TOURS: withBase('/tours'),
  TOUR_DETAIL: withBase('/tour-detail'),
  CART: withBase('/cart'),
  LOGIN: withBase('/login'),
  REGISTER: withBase('/register'),
  FORGOT_PASSWORD: withBase('/forgot-password'),
  PROFILE: withBase('/profile'),
  DASHBOARD: withBase('/dashboard'),
  ADMIN_TOURS: withBase('/admin/tours'),
  ADMIN_TOURS_CREATE: withBase('/admin/tours/create'),
  ADMIN_FLIGHTS: withBase('/admin/flights'),
  ADMIN_FLIGHTS_CREATE: withBase('/admin/flights/create'),
};

export const TRIP_TYPE = {
  ROUND_TRIP: 'round-trip',
  ONE_WAY: 'one-way',
  MULTI_CITY: 'multi-city',
};

export const FARE_CLASS = {
  ECONOMY: 'economy',
  BUSINESS: 'business',
};

export const FARE_CLASS_LABEL = {
  economy: 'Phổ thông',
  business: 'Thương gia',
};

export const TRIP_TYPE_LABEL = {
  'round-trip': 'Khứ hồi',
  'one-way': 'Một chiều',
  'multi-city': 'Nhiều thành phố',
};

export const DEPARTURE_TIME_SLOTS = [
  { id: 'dawn', label: '00:00 - 06:00', from: 0, to: 6 },
  { id: 'morning', label: '06:00 - 12:00', from: 6, to: 12 },
  { id: 'afternoon', label: '12:00 - 18:00', from: 12, to: 18 },
  { id: 'evening', label: '18:00 - 24:00', from: 18, to: 24 },
];

export const PAGE_SIZE_ADMIN = 20;

export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
};

export const STORAGE_KEYS = {
  SESSION_USER: 'travelviet_session_user',
  CART: 'travelviet_cart',
  SEARCH_PARAMS: 'travelviet_search_params',
};

export const EMAIL_SENDER = 'nvhai061993@gmail.com';

// Cloudflare Worker (worker/weather.js) giu API key OpenWeatherMap, khong goi thang tu trinh duyet.
// Sau khi `wrangler deploy`, dat window.WEATHER_API_BASE_URL truoc khi app.js load (vd trong index.html)
// tro ve URL Worker that (vd https://travelviet-weather.<subdomain>.workers.dev).
export const WEATHER_API_BASE_URL = window.WEATHER_API_BASE_URL || 'http://127.0.0.1:8787';

export const AIRCRAFT_TYPES = [
  'Airbus A320', 'Airbus A321', 'Airbus A330', 'Airbus A350',
  'Boeing 737', 'Boeing 787', 'Boeing 777',
];
