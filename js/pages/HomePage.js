import { registerRoute, navigate, buildUrl } from '../router.js';
import { ROUTES } from '../utils/constants.js';
import { getFeaturedTours } from '../services/TourService.js';
import { getAllAirports } from '../repositories/AirportRepository.js';
import { getAllAirlines } from '../repositories/AirlineRepository.js';
import { renderTourCard } from '../components/TourCard.js';
import { setSearchParams } from '../state.js';
import { todayISO, addDaysISO } from '../utils/formatDate.js';
import { airlineColor } from '../utils/airlineVisual.js';
import { skeletonGrid } from '../utils/loading.js';
import { renderWeatherWidget, bindWeatherWidget } from '../components/WeatherWidget.js';

function renderPage(root) {
  root.innerHTML = `<div class="container" style="padding:48px 0">${skeletonGrid(4, 220)}</div>`;
  draw(root);
}

async function draw(root) {
  let airports = [];
  let airlines = [];
  let tours = [];
  let error = null;
  try {
    [airports, airlines, tours] = await Promise.all([getAllAirports(), getAllAirlines(), getFeaturedTours(8)]);
  } catch (e) {
    error = e;
  }

  if (error) {
    root.innerHTML = `<div class="container" style="padding:48px 0"><div class="state-box"><div class="state-icon">⚠️</div>Không thể tải dữ liệu. Vui lòng thử lại.</div></div>`;
    return;
  }

  const airportOptions = airports.map((a) => `<option value="${a.code}">${a.city} (${a.code})</option>`).join('');

  root.innerHTML = `
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Khám phá Việt Nam cùng TravelViet</h1>
          <p class="hero-subtitle">Tìm chuyến bay và tour du lịch phù hợp với bạn</p>
        </div>
        <div class="search-panel">
          <div class="trip-type-tabs" role="tablist" aria-label="Loại vé">
            <button type="button" class="trip-type-tab active" data-trip="round-trip">Khứ hồi</button>
            <button type="button" class="trip-type-tab" data-trip="one-way">Một chiều</button>
          </div>
          <form id="searchForm" novalidate>
            <div class="search-fields">
              <div class="form-group field-icon-input">
                <label class="form-label" for="originSelect">Điểm đi</label>
                <span class="icon">🛫</span>
                <select id="originSelect" class="form-select" required>
                  <option value="">Chọn điểm đi</option>
                  ${airportOptions}
                </select>
              </div>
              <div class="form-group field-icon-input">
                <label class="form-label" for="destinationSelect">Điểm đến</label>
                <span class="icon">🛬</span>
                <select id="destinationSelect" class="form-select" required>
                  <option value="">Chọn điểm đến</option>
                  ${airportOptions}
                </select>
              </div>
              <div class="form-group field-icon-input">
                <label class="form-label" for="departDate">Ngày đi</label>
                <span class="icon">📅</span>
                <input type="date" id="departDate" class="form-input" required min="${todayISO()}" value="${addDaysISO(todayISO(), 7)}" />
              </div>
              <div class="form-group field-icon-input" id="returnDateGroup">
                <label class="form-label" for="returnDate">Ngày về</label>
                <span class="icon">📅</span>
                <input type="date" id="returnDate" class="form-input" min="${todayISO()}" value="${addDaysISO(todayISO(), 10)}" />
              </div>
              <button type="submit" class="btn btn-primary">Tìm Kiếm</button>
            </div>
            <div class="form-error" id="searchError"></div>
          </form>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Thời tiết điểm đến</h2>
        <p class="section-subtitle">Xem nhanh thời tiết hiện tại trước khi lên kế hoạch</p>
        ${renderWeatherWidget()}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Tour du lịch nổi bật</h2>
        <p class="section-subtitle">8 hành trình được yêu thích nhất tại TravelViet</p>
        ${tours.length ? `<div class="tour-grid">${tours.map(renderTourCard).join('')}</div>` : `<div class="state-box"><div class="state-icon">🧳</div>Chưa có tour nổi bật.</div>`}
      </div>
    </section>

    <section class="section" style="background:var(--color-surface)">
      <div class="container">
        <h2 class="section-title">Hãng hàng không đối tác</h2>
        <p class="section-subtitle">Đặt vé từ các hãng hàng không uy tín, click để xem chuyến bay</p>
        <div class="airline-grid">
          ${airlines
            .map(
              (a) => `
            <a href="${buildUrl(ROUTES.FLIGHTS, { airline: a.id })}" data-link class="airline-logo-card" aria-label="Xem chuyến bay của ${a.name}">
              <span style="font-weight:800;font-size:15px;color:${airlineColor(a.code)}">${a.name}</span>
            </a>
          `
            )
            .join('')}
        </div>
      </div>
    </section>
  `;

  bindSearchForm(root);
  bindWeatherWidget(root);
}

function bindSearchForm(root) {
  const tripTabs = root.querySelectorAll('.trip-type-tab');
  const returnGroup = root.querySelector('#returnDateGroup');
  let tripType = 'round-trip';

  tripTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tripTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      tripType = tab.dataset.trip;
      returnGroup.style.display = tripType === 'one-way' ? 'none' : '';
    });
  });

  const form = root.querySelector('#searchForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const origin = root.querySelector('#originSelect').value;
    const destination = root.querySelector('#destinationSelect').value;
    const date = root.querySelector('#departDate').value;
    const returnDate = root.querySelector('#returnDate').value;
    const errorEl = root.querySelector('#searchError');

    if (!origin || !destination) {
      errorEl.textContent = 'Vui lòng chọn điểm đi và điểm đến.';
      return;
    }
    if (origin === destination) {
      errorEl.textContent = 'Điểm đi và điểm đến không được trùng nhau.';
      return;
    }
    if (!date) {
      errorEl.textContent = 'Vui lòng chọn ngày đi.';
      return;
    }
    errorEl.textContent = '';

    const params = { origin, destination, date, tripType };
    if (tripType === 'round-trip' && returnDate) params.returnDate = returnDate;
    setSearchParams(params);
    navigate(buildUrl(ROUTES.FLIGHTS, params));
  });
}

registerRoute(ROUTES.HOME, () => {
  renderPage(document.getElementById('page-root'));
});
