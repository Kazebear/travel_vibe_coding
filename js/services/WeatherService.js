const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 8000;

// Mã thời tiết WMO do Open-Meteo trả về (weathercode) -> mô tả ngắn tiếng Việt
const WEATHER_CODE_LABELS = {
  0: 'Trời quang',
  1: 'Ít mây',
  2: 'Có mây',
  3: 'Nhiều mây',
  45: 'Sương mù',
  48: 'Sương mù đóng băng',
  51: 'Mưa phùn nhẹ',
  53: 'Mưa phùn vừa',
  55: 'Mưa phùn dày',
  56: 'Mưa phùn đóng băng nhẹ',
  57: 'Mưa phùn đóng băng dày',
  61: 'Mưa nhẹ',
  63: 'Mưa vừa',
  65: 'Mưa to',
  66: 'Mưa đóng băng nhẹ',
  67: 'Mưa đóng băng nặng',
  71: 'Tuyết rơi nhẹ',
  73: 'Tuyết rơi vừa',
  75: 'Tuyết rơi dày',
  77: 'Hạt tuyết',
  80: 'Mưa rào nhẹ',
  81: 'Mưa rào vừa',
  82: 'Mưa rào dữ dội',
  85: 'Mưa tuyết rào nhẹ',
  86: 'Mưa tuyết rào dày',
  95: 'Dông',
  96: 'Dông kèm mưa đá nhẹ',
  99: 'Dông kèm mưa đá nặng',
};

export class WeatherCityNotFoundError extends Error {
  constructor(city) {
    super(`Không tìm thấy thành phố "${city}".`);
    this.name = 'WeatherCityNotFoundError';
  }
}

export class WeatherApiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

async function fetchJson(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new WeatherApiError(`Open-Meteo trả về lỗi HTTP ${res.status}.`);
    return await res.json();
  } catch (e) {
    if (e instanceof WeatherApiError) throw e;
    if (e.name === 'AbortError') throw new WeatherApiError('Máy chủ thời tiết phản hồi quá chậm. Vui lòng thử lại.');
    throw new WeatherApiError('Không thể kết nối đến máy chủ thời tiết. Vui lòng thử lại.');
  } finally {
    clearTimeout(timer);
  }
}

function weatherDescription(code) {
  return WEATHER_CODE_LABELS[code] ?? 'Không xác định';
}

export async function getCurrentWeatherByCity(cityName, { timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const city = (cityName ?? '').trim();
  if (!city) throw new WeatherCityNotFoundError(city);

  const geoUrl = `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=vi&format=json`;
  const geoData = await fetchJson(geoUrl, timeoutMs);
  const match = geoData.results?.[0];
  if (!match) throw new WeatherCityNotFoundError(city);

  const forecastUrl = `${FORECAST_URL}?latitude=${match.latitude}&longitude=${match.longitude}&current_weather=true&timezone=auto`;
  const forecastData = await fetchJson(forecastUrl, timeoutMs);
  const current = forecastData.current_weather;
  if (!current) throw new WeatherApiError('Không thể tải dữ liệu thời tiết. Vui lòng thử lại.');

  return {
    city: match.name,
    admin1: match.admin1 || '',
    country: match.country || '',
    temperature: current.temperature,
    windSpeed: current.windspeed,
    weatherCode: current.weathercode,
    description: weatherDescription(current.weathercode),
    observedAt: current.time,
  };
}
