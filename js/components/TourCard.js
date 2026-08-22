import { ROUTES } from '../utils/constants.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/formatDate.js';
import { buildUrl } from '../router.js';

export function renderTourCard(tour) {
  return `
    <a href="${buildUrl(ROUTES.TOUR_DETAIL, { id: tour.id })}" data-link class="tour-card">
      <div class="tour-card-thumb">
        <img src="${tour.thumbnail}" alt="Tour ${tour.name}" loading="lazy" width="600" height="400" />
        ${tour.featured ? '<span class="badge badge-warning tour-card-badge">Nổi bật</span>' : ''}
      </div>
      <div class="tour-card-body">
        <div class="tour-card-title">${tour.name}</div>
        <div class="tour-card-operator">${tour.operator}</div>
        <div class="tour-card-duration">${tour.days} ngày / ${tour.nights} đêm</div>
        <div class="tour-card-price"><span class="from">Từ</span> ${formatCurrency(tour.price)}</div>
      </div>
      <div class="tour-card-footer">
        <span class="btn btn-outline btn-sm btn-block">Xem tour</span>
      </div>
    </a>
  `;
}

export function renderTourResultCard(tour) {
  return `
    <a href="${buildUrl(ROUTES.TOUR_DETAIL, { id: tour.id })}" data-link class="tour-result-card">
      <div class="tour-result-thumb"><img src="${tour.thumbnail}" alt="Tour ${tour.name}" loading="lazy" width="600" height="400"/></div>
      <div class="tour-result-body">
        <div class="tour-result-title">${tour.name}</div>
        <div class="tour-result-meta">${tour.operator} · ${tour.origin} → ${tour.destination} · Khởi hành ${formatDate(tour.departure_date)}</div>
        <div class="tour-result-services">
          ${tour.airline_name ? `<span class="badge badge-info">${tour.airline_name}</span>` : ''}
          <span class="badge badge-success">${tour.days} ngày ${tour.nights} đêm</span>
        </div>
        <div class="tour-result-footer">
          <div class="tour-result-price">${formatCurrency(tour.price)}</div>
          <span class="btn btn-primary btn-sm">Xem chi tiết</span>
        </div>
      </div>
    </a>
  `;
}
