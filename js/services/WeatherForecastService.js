import { WEATHER_API_BASE_URL } from '../utils/constants.js';

const REQUEST_TIMEOUT_MS = 8000;

export class ForecastCityNotFoundError extends Error {
  constructor(city) {
    super(`Không tìm thấy thành phố "${city}".`);
    this.name = 'ForecastCityNotFoundError';
  }
}

export class ForecastApiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForecastApiError';
  }
}

export function forecastIconUrl(icon) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export async function getFiveDayForecastByCity(cityName, { timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const city = (cityName ?? '').trim();
  if (!city) throw new ForecastCityNotFoundError(city);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(`${WEATHER_API_BASE_URL}/?city=${encodeURIComponent(city)}`, { signal: controller.signal });
  } catch (e) {
    if (e.name === 'AbortError') throw new ForecastApiError('Máy chủ thời tiết phản hồi quá chậm. Vui lòng thử lại.');
    throw new ForecastApiError('Không thể kết nối đến máy chủ thời tiết. Vui lòng thử lại.');
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 404) throw new ForecastCityNotFoundError(city);
  if (!res.ok) throw new ForecastApiError('Không thể tải dữ liệu thời tiết. Vui lòng thử lại.');

  const data = await res.json();
  return data;
}
