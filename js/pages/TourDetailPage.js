import { registerRoute, navigate } from '../router.js';
import { ROUTES } from '../utils/constants.js';
import { getTourById, getTourItinerary } from '../services/TourService.js';
import { addTourToCart } from '../services/CartService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/formatDate.js';
import { showToast } from '../components/Toast.js';
import { skeletonList } from '../utils/loading.js';

function renderNotFound(root) {
  root.innerHTML = `
    <div class="container">
      <div class="state-box">
        <div class="state-icon">🧳</div>
        Không tìm thấy tour.
        <div class="mt-4"><a href="${ROUTES.TOURS}" data-link class="btn btn-primary">Quay lại danh sách tour</a></div>
      </div>
    </div>
  `;
}

function renderItinerary(days) {
  if (!days.length) return '<p class="text-muted">Chưa có lịch trình chi tiết.</p>';
  return `
    <div class="itinerary">
      ${days
        .map(
          (d) => `
        <div class="itinerary-day">
          <div class="itinerary-marker">${d.day_number}</div>
          <div class="itinerary-content">
            <div class="itinerary-title">Ngày ${d.day_number}: ${d.title}</div>
            <div class="itinerary-desc">${d.description}</div>
            <div class="itinerary-meta">
              ${d.meals ? `<span>🍽 ${d.meals}</span>` : ''}
              ${d.accommodation ? `<span>🏨 ${d.accommodation}</span>` : ''}
            </div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

async function renderPage(root, params) {
  root.innerHTML = `<div class="container" style="padding:32px 0">${skeletonList(1, 380)}</div>`;

  let tour = null;
  try {
    tour = await getTourById(params.id);
  } catch (e) {
    tour = null;
  }
  if (!tour) {
    renderNotFound(root);
    return;
  }
  let itinerary = [];
  try {
    itinerary = await getTourItinerary(tour.id);
  } catch (e) {
    itinerary = [];
  }

  root.innerHTML = `
    <div class="detail-hero" style="background:linear-gradient(rgba(23,32,51,0.55),rgba(23,32,51,0.55)),url('${tour.thumbnail}') center/cover;color:#fff">
      <div class="container">
        <div class="breadcrumb" style="color:rgba(255,255,255,0.85)"><a href="${ROUTES.HOME}" data-link style="color:#fff">Trang chủ</a> / <a href="${ROUTES.TOURS}" data-link style="color:#fff">Tour</a> / Chi tiết</div>
        <h1>${tour.name}</h1>
        <p style="opacity:0.9;margin-top:8px">${tour.origin} → ${tour.destination}, ${tour.country}</p>
        <div style="font-size:26px;font-weight:800;margin-top:12px">${formatCurrency(tour.price)}<span style="font-size:14px;font-weight:400"> / khách</span></div>
      </div>
    </div>

    <div class="container">
      <div class="detail-info-grid" style="margin-top:24px">
        <div class="detail-info-item"><div class="label">Điểm đi</div><div class="value">${tour.origin}</div></div>
        <div class="detail-info-item"><div class="label">Điểm đến</div><div class="value">${tour.destination}</div></div>
        <div class="detail-info-item"><div class="label">Ngày khởi hành</div><div class="value">${formatDate(tour.departure_date)}</div></div>
        <div class="detail-info-item"><div class="label">Thời gian</div><div class="value">${tour.days} ngày / ${tour.nights} đêm</div></div>
        ${tour.airline_name ? `<div class="detail-info-item"><div class="label">Hãng bay</div><div class="value">${tour.airline_name}</div></div>` : ''}
        ${tour.aircraft ? `<div class="detail-info-item"><div class="label">Loại máy bay</div><div class="value">${tour.aircraft}</div></div>` : ''}
        <div class="detail-info-item"><div class="label">Hãng lữ hành</div><div class="value">${tour.operator}</div></div>
        <div class="detail-info-item"><div class="label">Trạng thái</div><div class="value">${tour.status === 'available' ? 'Còn chỗ' : 'Hết chỗ'}</div></div>
      </div>

      <div style="display:grid;grid-template-columns:2fr 1fr;gap:32px;margin-top:32px" class="tour-detail-grid">
        <div>
          <h2 class="section-title" style="font-size:22px">Mô tả</h2>
          <p class="text-muted" style="line-height:1.7;margin-bottom:24px">${tour.description}</p>

          <h2 class="section-title" style="font-size:22px">Lịch trình chuyến đi</h2>
          ${renderItinerary(itinerary)}
        </div>
        <div>
          <div class="card" style="padding:20px;position:sticky;top:96px">
            <div style="font-weight:700;margin-bottom:12px">Dịch vụ bao gồm</div>
            <p class="text-muted" style="font-size:14px;line-height:1.7;margin-bottom:16px">${tour.included_services}</p>
            <div style="font-weight:700;margin-bottom:12px">Dịch vụ không bao gồm</div>
            <p class="text-muted" style="font-size:14px;line-height:1.7;margin-bottom:20px">${tour.excluded_services}</p>
            <div class="cart-summary-total" style="margin-bottom:16px">
              <span>Giá tour</span><span>${formatCurrency(tour.price)}</span>
            </div>
            <button type="button" class="btn btn-primary btn-block" id="selectTourBtn">Chọn tour</button>
          </div>
        </div>
      </div>
    </div>
  `;

  root.querySelector('#selectTourBtn').addEventListener('click', () => {
    addTourToCart(tour);
    showToast('Đã thêm tour vào giỏ hàng.', 'success');
    setTimeout(() => navigate(ROUTES.CART), 500);
  });
}

registerRoute(ROUTES.TOUR_DETAIL, (params) => {
  renderPage(document.getElementById('page-root'), params);
});
