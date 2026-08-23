import { registerRoute } from '../router.js';
import { ROUTES, DEPARTURE_TIME_SLOTS } from '../utils/constants.js';
import { searchFlights } from '../services/FlightService.js';
import { getAllAirlines } from '../repositories/AirlineRepository.js';
import { renderFlightCard } from '../components/FlightCard.js';
import { skeletonList } from '../utils/loading.js';
import { formatDate } from '../utils/formatDate.js';

let filterState = {};

function initFilterState(params) {
  filterState = {
    origin: params.origin || '',
    destination: params.destination || '',
    date: params.date || '',
    airlineIds: params.airline ? [Number(params.airline)] : [],
    tripTypes: [],
    stopsMode: '',
    timeSlots: [],
    fareClass: params.class === 'business' ? 'business' : 'economy',
    sort: '',
  };
}

function renderFilterSidebar(airlines) {
  return `
    <aside class="filter-sidebar" id="filterSidebar">
      <button type="button" class="filter-drawer-close" id="filterDrawerClose">✕ Đóng bộ lọc</button>
      <div class="flex items-center justify-between mb-4">
        <h3>Bộ lọc</h3>
        <button type="button" class="filter-reset" id="filterReset">Xóa lọc</button>
      </div>

      <div class="filter-block">
        <div class="filter-block-title">Sắp xếp giá</div>
        <label class="filter-option"><input type="radio" name="sort" value="price_asc" ${filterState.sort === 'price_asc' ? 'checked' : ''}/> Giá thấp đến cao</label>
        <label class="filter-option"><input type="radio" name="sort" value="price_desc" ${filterState.sort === 'price_desc' ? 'checked' : ''}/> Giá cao đến thấp</label>
      </div>

      <div class="filter-block">
        <div class="filter-block-title">Loại vé</div>
        <label class="filter-option"><input type="checkbox" data-group="tripTypes" value="round-trip" ${filterState.tripTypes.includes('round-trip') ? 'checked' : ''}/> Khứ hồi</label>
        <label class="filter-option"><input type="checkbox" data-group="tripTypes" value="one-way" ${filterState.tripTypes.includes('one-way') ? 'checked' : ''}/> Một chiều</label>
      </div>

      <div class="filter-block">
        <div class="filter-block-title">Số điểm dừng</div>
        <label class="filter-option"><input type="radio" name="stopsMode" value="" ${filterState.stopsMode === '' ? 'checked' : ''}/> Tất cả</label>
        <label class="filter-option"><input type="radio" name="stopsMode" value="direct" ${filterState.stopsMode === 'direct' ? 'checked' : ''}/> Bay thẳng</label>
        <label class="filter-option"><input type="radio" name="stopsMode" value="multi-city" ${filterState.stopsMode === 'multi-city' ? 'checked' : ''}/> Nhiều thành phố</label>
      </div>

      <div class="filter-block">
        <div class="filter-block-title">Hãng hàng không</div>
        ${airlines.map((a) => `<label class="filter-option"><input type="checkbox" data-group="airlineIds" value="${a.id}" ${filterState.airlineIds.includes(a.id) ? 'checked' : ''}/> ${a.name}</label>`).join('')}
      </div>

      <div class="filter-block">
        <div class="filter-block-title">Giờ cất cánh</div>
        ${DEPARTURE_TIME_SLOTS.map((s) => `<label class="filter-option"><input type="checkbox" data-group="timeSlots" value="${s.id}" ${filterState.timeSlots.includes(s.id) ? 'checked' : ''}/> ${s.label}</label>`).join('')}
      </div>

      <div class="filter-block">
        <div class="filter-block-title">Hạng dịch vụ</div>
        <label class="filter-option"><input type="radio" name="fareClass" value="economy" ${filterState.fareClass === 'economy' ? 'checked' : ''}/> Phổ thông</label>
        <label class="filter-option"><input type="radio" name="fareClass" value="business" ${filterState.fareClass === 'business' ? 'checked' : ''}/> Thương gia</label>
      </div>
    </aside>
    <div class="filter-drawer-backdrop" id="filterBackdrop"></div>
  `;
}

function renderResults(flights) {
  if (!flights.length) {
    return `<div class="state-box"><div class="state-icon">🔍</div>Không tìm thấy chuyến bay phù hợp.<br/><span style="font-size:13px">Thử thay đổi bộ lọc để xem thêm kết quả.</span></div>`;
  }
  return `<div class="result-list">${flights.map(renderFlightCard).join('')}</div>`;
}

function renderPage(root, params) {
  initFilterState(params);

  root.innerHTML = `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb"><a href="${ROUTES.HOME}" data-link>Trang chủ</a> / Chuyến bay</div>
        <h1 class="page-header-title">Kết quả chuyến bay</h1>
      </div>
    </div>
    <div class="container">
      <div class="listing-layout">
        <div class="listing-results" style="flex:1">${skeletonList(4, 130)}</div>
      </div>
    </div>
  `;

  draw();

  async function draw() {
    const timeSlotObjs = filterState.timeSlots.map((id) => DEPARTURE_TIME_SLOTS.find((s) => s.id === id));

    let airlines = [];
    let flights = [];
    let error = null;
    try {
      [airlines, flights] = await Promise.all([getAllAirlines(), searchFlights({ ...filterState, timeSlots: timeSlotObjs })]);
    } catch (e) {
      error = e;
    }

    root.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="${ROUTES.HOME}" data-link>Trang chủ</a> / Chuyến bay</div>
          <h1 class="page-header-title">Kết quả chuyến bay</h1>
          ${filterState.origin && filterState.destination ? `<p class="text-muted">${filterState.origin} → ${filterState.destination}${filterState.date ? ' · Từ ngày ' + formatDate(filterState.date) : ''}</p>` : ''}
        </div>
      </div>
      <div class="container">
        <div class="listing-layout">
          ${renderFilterSidebar(airlines)}
          <div class="listing-results">
            <div class="listing-toolbar">
              <button type="button" class="btn btn-secondary filter-drawer-trigger" id="filterDrawerTrigger">☰ Bộ lọc</button>
              <span class="text-muted">${flights.length} chuyến bay</span>
            </div>
            ${error ? `<div class="state-box"><div class="state-icon">⚠️</div>Không thể tải dữ liệu. Vui lòng thử lại.</div>` : renderResults(flights)}
          </div>
        </div>
      </div>
    `;

    bindFilterEvents(root);
  }

  function bindFilterEvents(root) {
    root.querySelectorAll('input[name="sort"]').forEach((i) => i.addEventListener('change', () => { filterState.sort = i.value; draw(); }));
    root.querySelectorAll('input[name="stopsMode"]').forEach((i) => i.addEventListener('change', () => { filterState.stopsMode = i.value; draw(); }));
    root.querySelectorAll('input[name="fareClass"]').forEach((i) => i.addEventListener('change', () => { filterState.fareClass = i.value; draw(); }));
    root.querySelectorAll('input[data-group]').forEach((i) =>
      i.addEventListener('change', () => {
        const group = i.dataset.group;
        const value = group === 'airlineIds' ? Number(i.value) : i.value;
        const set = new Set(filterState[group]);
        if (i.checked) set.add(value);
        else set.delete(value);
        filterState[group] = Array.from(set);
        draw();
      })
    );

    const resetBtn = root.querySelector('#filterReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const { origin, destination, date } = filterState;
        filterState = { origin, destination, date, airlineIds: [], tripTypes: [], stopsMode: '', timeSlots: [], fareClass: 'economy', sort: '' };
        draw();
      });
    }

    const drawerTrigger = root.querySelector('#filterDrawerTrigger');
    const drawerClose = root.querySelector('#filterDrawerClose');
    const backdrop = root.querySelector('#filterBackdrop');
    const sidebar = root.querySelector('#filterSidebar');
    const openDrawer = () => { sidebar.classList.add('open'); backdrop.classList.add('open'); };
    const closeDrawer = () => { sidebar.classList.remove('open'); backdrop.classList.remove('open'); };
    if (drawerTrigger) drawerTrigger.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
  }
}

registerRoute(ROUTES.FLIGHTS, (params) => {
  renderPage(document.getElementById('page-root'), params);
});
