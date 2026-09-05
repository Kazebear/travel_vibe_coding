import { getCurrentWeatherByCity, WeatherCityNotFoundError } from '../services/WeatherService.js';

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
    </div>
  `;
}

export function bindWeatherWidget(root) {
  const widget = root.querySelector('#weatherWidget');
  if (!widget) return;
  const form = widget.querySelector('#weatherForm');
  const input = widget.querySelector('#weatherCityInput');
  const resultEl = widget.querySelector('#weatherResult');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = input.value.trim();
    if (!city) return;

    resultEl.innerHTML = `<div class="skeleton" style="height:72px"></div>`;
    try {
      const weather = await getCurrentWeatherByCity(city);
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
    } catch (err) {
      const message = err instanceof WeatherCityNotFoundError ? err.message : 'Không thể tải dữ liệu thời tiết. Vui lòng thử lại.';
      resultEl.innerHTML = `<div class="state-box"><div class="state-icon">⚠️</div>${escapeHtml(message)}</div>`;
    }
  });
}
