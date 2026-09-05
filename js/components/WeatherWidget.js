import { getCurrentWeatherByCity, WeatherCityNotFoundError } from '../services/WeatherService.js';
import { getFiveDayForecastByCity, forecastIconUrl, ForecastCityNotFoundError } from '../services/WeatherForecastService.js';

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function forecastDayLabel(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  const weekday = d.toLocaleDateString('vi-VN', { weekday: 'short' });
  const dayMonth = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  return `${weekday}, ${dayMonth}`;
}

function renderForecastList(forecast) {
  if (!forecast.length) return '';
  return `
    <div class="forecast-list">
      ${forecast
        .map(
          (day) => `
        <div class="forecast-day">
          <div class="forecast-day-label">${escapeHtml(forecastDayLabel(day.date))}</div>
          <img class="forecast-icon" src="${forecastIconUrl(day.icon)}" alt="${escapeHtml(day.description)}" width="50" height="50" loading="lazy" />
          <div class="forecast-desc">${escapeHtml(day.description)}</div>
          <div class="forecast-temp"><span class="forecast-temp-max">${day.tempMax}°</span> / <span class="forecast-temp-min">${day.tempMin}°</span></div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

export function renderWeatherWidget() {
  return `
    <div class="weather-widget" id="weatherWidget">
      <form id="weatherForm" class="weather-form" novalidate>
        <div class="form-group field-icon-input">
          <label class="form-label" for="weatherCityInput">Tra cứu thời tiết</label>
          <span class="icon">📍</span>
          <input type="text" id="weatherCityInput" class="form-input" placeholder="Nhập tên thành phố, ví dụ: Đà Nẵng" required />
        </div>
        <button type="submit" class="btn btn-secondary">Xem thời tiết</button>
      </form>
      <div id="weatherResult" class="weather-result" aria-live="polite"></div>
      <div id="weatherForecastResult" class="weather-forecast-result" aria-live="polite"></div>
    </div>
  `;
}

export function bindWeatherWidget(root) {
  const widget = root.querySelector('#weatherWidget');
  if (!widget) return;
  const form = widget.querySelector('#weatherForm');
  const input = widget.querySelector('#weatherCityInput');
  const resultEl = widget.querySelector('#weatherResult');
  const forecastEl = widget.querySelector('#weatherForecastResult');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = input.value.trim();
    if (!city) return;

    resultEl.innerHTML = `<div class="skeleton" style="height:72px"></div>`;
    forecastEl.innerHTML = `<div class="skeleton" style="height:140px"></div>`;

    const [currentResult, forecastResult] = await Promise.allSettled([getCurrentWeatherByCity(city), getFiveDayForecastByCity(city)]);

    if (currentResult.status === 'fulfilled') {
      const weather = currentResult.value;
      const location = [weather.city, weather.admin1, weather.country].filter(Boolean).map(escapeHtml).join(', ');
      resultEl.innerHTML = `
        <div class="weather-card">
          <div class="weather-temp">${Math.round(weather.temperature)}°C</div>
          <div class="weather-info">
            <div class="weather-location">${location}</div>
            <div class="weather-desc">${escapeHtml(weather.description)}</div>
          </div>
        </div>
      `;
    } else {
      const err = currentResult.reason;
      const message = err instanceof WeatherCityNotFoundError ? err.message : 'Không thể tải dữ liệu thời tiết. Vui lòng thử lại.';
      resultEl.innerHTML = `<div class="state-box"><div class="state-icon">⚠️</div>${escapeHtml(message)}</div>`;
    }

    if (forecastResult.status === 'fulfilled') {
      forecastEl.innerHTML = renderForecastList(forecastResult.value.forecast);
    } else {
      const err = forecastResult.reason;
      const message = err instanceof ForecastCityNotFoundError ? err.message : 'Không thể tải dự báo 5 ngày. Vui lòng thử lại.';
      forecastEl.innerHTML = `<div class="state-box"><div class="state-icon">⚠️</div>${escapeHtml(message)}</div>`;
    }
  });
}
