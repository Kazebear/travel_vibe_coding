import { registerRoute } from '../router.js';
import { ROUTES, DEPARTURE_TIME_SLOTS } from '../utils/constants.js';
import { searchTours, getDistinctOperators } from '../services/TourService.js';
import { getAllAirlines } from '../repositories/AirlineRepository.js';
import { renderTourResultCard } from '../components/TourCard.js';
import { skeletonList } from '../utils/loading.js';

let filterState = {};

function initFilterState(params) {
  filterState = {
    destination: params.destination || '',
    country: params.country || '',
    operator: '',
    airlineIds: [],
    timeSlots: [],
    days: '',
    sort: '',
  };
}

function renderFilterSidebar(airlines, operators) {
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
        <div class="filter-block-title">Hãng hàng không</div>
        ${airlines.map((a) => `<label class="filter-option"><input type="checkbox" data-group="airlineIds" value="${a.id}" ${filterState.airlineIds.includes(a.id) ? 'checked' : ''}/> ${a.name}</label>`).join('')}
      </div>

      <div class="filter-block">
        <div class="filter-block-title">Giờ khởi hành</div>
        ${DEPARTURE_TIME_SLOTS.map((s) => `<label class="filter-option"><input type="checkbox" data-group="timeSlots" value="${s.id}" ${filterState.timeSlots.includes(s.id) ? 'checked' : ''}/> ${s.label}</label>`).join('')}
      </div>

      <div class="filter-block">
        <div class="filter-block-title">Hãng lữ hành</div>
        <select class="form-select" id="operatorSelect">
          <option value="">Tất cả</option>
          ${operators.map((op) => `<option value="${op}" ${filterState.operator === op ? 'selected' : ''}>${op}</option>`).join('')}
        </select>
      </div>

      <div class="filter-block">
        <div class="filter-block-title">Số ngày</div>
        <select class="form-select" id="daysSelect">
          <option value="">Tất cả</option>
          ${[3, 4, 5, 6, 7].map((d) => `<option value="${d}" ${String(filterState.days) === String(d) ? 'selected' : ''}>${d} ngày</option>`).join('')}
        </select>
      </div>

      <div class="filter-block">
        <div class="filter-block-title">Điểm đến</div>
        <input type="text" class="form-input" id="destinationInput" placeholder="Nhập điểm đến..." value="${filterState.destination}" />
      </div>
    </aside>
    <div class="filter-drawer-backdrop" id="filterBackdrop"></div>
  `;
}

function renderResults(tours) {
  if (!tours.length) {
    return `<div class="state-box"><div class="state-icon">🧳</div>Không tìm thấy tour phù hợp.<br/><span style="font-size:13px">Thử thay đổi bộ lọc để xem thêm kết quả.</span></div>`;
  }
  return `<div class="result-list">${tours.map(renderTourResultCard).join('')}</div>`;
}

function renderPage(root, params) {
  initFilterState(params);

  root.innerHTML = `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb"><a href="${ROUTES.HOME}" data-link>Trang chủ</a> / Tour</div>
        <h1 class="page-header-title">Tour du lịch</h1>
      </div>
    </div>
    <div class="container">
      <div class="listing-layout">
        <div class="listing-results" style="flex:1">${skeletonList(4, 180)}</div>
      </div>
    </div>
  `;

  draw();

  async function draw() {
    const timeSlotObjs = filterState.timeSlots.map((id) => DEPARTURE_TIME_SLOTS.find((s) => s.id === id));

    let airlines = [];
    let operators = [];
    let tours = [];
    let error = null;
    try {
      [airlines, operators, tours] = await Promise.all([
        getAllAirlines(),
        getDistinctOperators(),
        searchTours({ ...filterState, timeSlots: timeSlotObjs }),
      ]);
    } catch (e) {
      error = e;
    }

    root.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="${ROUTES.HOME}" data-link>Trang chủ</a> / Tour</div>
          <h1 class="page-header-title">Tour du lịch</h1>
        </div>
      </div>
      <div class="container">
        <div class="listing-layout">
          ${renderFilterSidebar(airlines, operators)}
          <div class="listing-results">
            <div class="listing-toolbar">
              <button type="button" class="btn btn-secondary filter-drawer-trigger" id="filterDrawerTrigger">☰ Bộ lọc</button>
              <span class="text-muted">${tours.length} tour</span>
            </div>
            ${error ? `<div class="state-box"><div class="state-icon">⚠️</div>Không thể tải dữ liệu. Vui lòng thử lại.</div>` : renderResults(tours)}
          </div>
        </div>
      </div>
    `;

    bindFilterEvents(root);
  }

  function bindFilterEvents(root) {
    root.querySelectorAll('input[name="sort"]').forEach((i) => i.addEventListener('change', () => { filterState.sort = i.value; draw(); }));
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
    const operatorSelect = root.querySelector('#operatorSelect');
    if (operatorSelect) operatorSelect.addEventListener('change', () => { filterState.operator = operatorSelect.value; draw(); });
    const daysSelect = root.querySelector('#daysSelect');
    if (daysSelect) daysSelect.addEventListener('change', () => { filterState.days = daysSelect.value; draw(); });
    const destinationInput = root.querySelector('#destinationInput');
    if (destinationInput) {
      let timer;
      destinationInput.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => { filterState.destination = destinationInput.value; draw(); }, 350);
      });
    }

    const resetBtn = root.querySelector('#filterReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        filterState = { destination: '', country: '', operator: '', airlineIds: [], timeSlots: [], days: '', sort: '' };
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

registerRoute(ROUTES.TOURS, (params) => {
  renderPage(document.getElementById('page-root'), params);
});
