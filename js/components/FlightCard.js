import { ROUTES } from '../utils/constants.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDuration } from '../utils/formatDate.js';
import { airlineBadge } from '../utils/airlineVisual.js';
import { buildUrl } from '../router.js';

export function renderFlightCard(flight) {
  return `
    <a href="${buildUrl(ROUTES.FLIGHT_DETAIL, { id: flight.id })}" data-link class="flight-card">
      <div class="flight-card-airline">
        ${airlineBadge(flight.airline_code)}
        <div>
          <div class="flight-card-airline-name">${flight.airline_name}</div>
          <div class="flight-card-airline-code">${flight.flight_number}</div>
        </div>
      </div>
      <div class="flight-card-route">
        <div class="flight-endpoint">
          <div class="time">${flight.departure_time}</div>
          <div class="code">${flight.origin_code}</div>
        </div>
        <div class="flight-path">
          <div class="line"></div>
          <div class="duration">${formatDuration(flight.duration_minutes)}</div>
          <div class="stops">${flight.stops === 0 ? 'Bay thẳng' : flight.stops + ' điểm dừng'}</div>
        </div>
        <div class="flight-endpoint">
          <div class="time">${flight.arrival_time}</div>
          <div class="code">${flight.destination_code}</div>
        </div>
      </div>
      <div class="flight-card-fare">
        <div class="flight-card-class">Phổ thông từ</div>
        <div class="flight-card-price">${formatCurrency(flight.economy_price)}</div>
        <span class="btn btn-outline btn-sm">Xem chi tiết</span>
      </div>
    </a>
  `;
}
