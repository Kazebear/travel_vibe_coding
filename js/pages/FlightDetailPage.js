import { registerRoute, navigate } from '../router.js';
import { ROUTES } from '../utils/constants.js';
import { getFlightById } from '../services/FlightService.js';
import { addFlightToCart } from '../services/CartService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate, formatDuration } from '../utils/formatDate.js';
import { showToast } from '../components/Toast.js';
import { skeletonList } from '../utils/loading.js';

function renderNotFound(root) {
  root.innerHTML = `
    <div class="container">
      <div class="state-box">
        <div class="state-icon">✈️</div>
        Không tìm thấy chuyến bay.
        <div class="mt-4"><a href="${ROUTES.FLIGHTS}" data-link class="btn btn-primary">Quay lại danh sách chuyến bay</a></div>
      </div>
    </div>
  `;
}

function fareCard(type, flight) {
  const isBusiness = type === 'business';
  const price = isBusiness ? flight.business_price : flight.economy_price;
  const title = isBusiness ? 'Thương gia' : 'Phổ thông';
  const cabinBag = isBusiness ? '10kg' : '7kg';
  const checkedBag = isBusiness ? '30kg' : '20kg';
  const extras = isBusiness
    ? ['Ưu tiên check-in', 'Phòng chờ Lounge (nếu có)', 'Chọn ghế miễn phí', 'Đổi vé linh hoạt']
    : ['Chọn ghế theo phí (nếu có)', 'Đổi vé mất phí', flight.services || 'Dịch vụ tiêu chuẩn'];

  return `
    <div class="fare-card card ${isBusiness ? 'recommended' : ''}" data-fare="${type}">
      <div class="fare-card-title">${title}</div>
      <div class="fare-card-price">${formatCurrency(price)}</div>
      <ul class="fare-card-list">
        <li><span class="check">✓</span> Hành lý xách tay ${cabinBag}</li>
        <li><span class="check">✓</span> Hành lý ký gửi ${checkedBag}</li>
        ${extras.map((e) => `<li><span class="check">✓</span> ${e}</li>`).join('')}
      </ul>
      <button type="button" class="btn btn-primary btn-block" data-select-fare="${type}">Chọn chuyến bay</button>
    </div>
  `;
}

async function renderPage(root, params) {
  root.innerHTML = `<div class="container" style="padding:32px 0">${skeletonList(1, 320)}</div>`;

  let flight = null;
  try {
    flight = await getFlightById(params.id);
  } catch (e) {
    flight = null;
  }
  if (!flight) {
    renderNotFound(root);
    return;
  }

  root.innerHTML = `
    <div class="detail-hero">
      <div class="container">
        <div class="breadcrumb"><a href="${ROUTES.HOME}" data-link>Trang chủ</a> / <a href="${ROUTES.FLIGHTS}" data-link>Chuyến bay</a> / Chi tiết</div>
        <h1>Thông tin chuyến bay</h1>
        <div class="detail-route">
          <div class="detail-endpoint">
            <div class="city">${flight.origin_code}</div>
            <div class="code">${flight.origin_city}</div>
            <div style="font-size:22px;font-weight:700;margin-top:8px">${flight.departure_time}</div>
          </div>
          <div class="detail-arrow">✈ ── ${formatDuration(flight.duration_minutes)} ── ✈</div>
          <div class="detail-endpoint">
            <div class="city">${flight.destination_code}</div>
            <div class="code">${flight.destination_city}</div>
            <div style="font-size:22px;font-weight:700;margin-top:8px">${flight.arrival_time}</div>
          </div>
        </div>
        <div class="detail-info-grid">
          <div class="detail-info-item"><div class="label">Hãng bay</div><div class="value">${flight.airline_name}</div></div>
          <div class="detail-info-item"><div class="label">Số hiệu</div><div class="value">${flight.flight_number}</div></div>
          <div class="detail-info-item"><div class="label">Loại máy bay</div><div class="value">${flight.aircraft}</div></div>
          <div class="detail-info-item"><div class="label">Ngày bay</div><div class="value">${formatDate(flight.departure_date)}</div></div>
          <div class="detail-info-item"><div class="label">Số điểm dừng</div><div class="value">${flight.stops === 0 ? 'Bay thẳng' : flight.stops + ' điểm dừng'}</div></div>
          <div class="detail-info-item"><div class="label">Loại vé</div><div class="value">${flight.trip_type === 'round-trip' ? 'Khứ hồi' : flight.trip_type === 'one-way' ? 'Một chiều' : 'Nhiều thành phố'}</div></div>
        </div>
      </div>
    </div>

    <div class="container">
      <h2 class="section-title" style="margin-top:32px">Chọn hạng vé</h2>
      <div class="fare-grid">
        ${fareCard('economy', flight)}
        ${fareCard('business', flight)}
      </div>
    </div>
  `;

  root.querySelectorAll('[data-select-fare]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fareClass = btn.dataset.selectFare;
      addFlightToCart(flight, fareClass);
      showToast('Đã thêm chuyến bay vào giỏ hàng.', 'success');
      setTimeout(() => navigate(ROUTES.CART), 500);
    });
  });
}

registerRoute(ROUTES.FLIGHT_DETAIL, (params) => {
  renderPage(document.getElementById('page-root'), params);
});
