import { registerRoute, buildUrl, navigate } from '../router.js';
import { ROUTES, PAGE_SIZE_ADMIN } from '../utils/constants.js';
import { renderAdminShell } from '../components/AdminLayout.js';
import { getFlightsPage, countFlights, deleteFlight } from '../services/FlightService.js';
import { renderPagination } from '../components/Pagination.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate, formatDuration } from '../utils/formatDate.js';
import { showConfirm } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';
import { skeletonTable } from '../utils/loading.js';

function renderPage(root, params) {
  const contentEl = renderAdminShell(root, ROUTES.ADMIN_FLIGHTS, skeletonTable(8));
  if (!contentEl) return;
  const page = Math.max(1, Number(params.page) || 1);
  draw(contentEl, page);
}

async function draw(contentEl, page) {
  try {
    const total = await countFlights();
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_ADMIN));
    page = Math.min(page, totalPages);
    const flights = await getFlightsPage(page, PAGE_SIZE_ADMIN);

    const pagination = renderPagination(page, totalPages, (p) => navigate(buildUrl(ROUTES.ADMIN_FLIGHTS, { page: p })));

    contentEl.innerHTML = `
      <div class="admin-page-header">
        <h1>Quản lý Chuyến bay</h1>
        <a href="${ROUTES.ADMIN_FLIGHTS_CREATE}" data-link class="btn btn-primary">+ Tạo Chuyến Bay</a>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>ID</th><th>Airline</th><th>Số hiệu</th><th>Origin</th><th>Destination</th><th>Departure</th><th>Arrival</th><th>Duration</th><th>Aircraft</th><th>Giá PT</th><th>Giá TG</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              ${
                flights.length
                  ? flights
                      .map(
                        (f) => `
                <tr>
                  <td>${f.id}</td>
                  <td>${f.airline_name}</td>
                  <td>${f.flight_number}</td>
                  <td>${f.origin_code}</td>
                  <td>${f.destination_code}</td>
                  <td>${formatDate(f.departure_date)} ${f.departure_time}</td>
                  <td>${f.arrival_time}</td>
                  <td>${formatDuration(f.duration_minutes)}</td>
                  <td>${f.aircraft}</td>
                  <td>${formatCurrency(f.economy_price)}</td>
                  <td>${formatCurrency(f.business_price)}</td>
                  <td><span class="badge ${f.status === 'available' ? 'badge-success' : 'badge-danger'}">${f.status === 'available' ? 'Còn chỗ' : 'Hết chỗ'}</span></td>
                  <td>
                    <div class="flex gap-2">
                      <a href="${buildUrl(ROUTES.ADMIN_FLIGHTS_CREATE, { id: f.id })}" data-link class="btn btn-secondary btn-sm">Sửa</a>
                      <button type="button" class="btn btn-danger btn-sm" data-delete="${f.id}">Xóa</button>
                    </div>
                  </td>
                </tr>
              `
                      )
                      .join('')
                  : `<tr><td colspan="13" class="text-center text-muted">Chưa có chuyến bay nào.</td></tr>`
              }
            </tbody>
          </table>
        </div>
        ${pagination.html}
      </div>
    `;

    pagination.bind(contentEl);

    contentEl.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const ok = await showConfirm({ title: 'Xóa chuyến bay', message: `Bạn có chắc muốn xóa chuyến bay #${btn.dataset.delete}?`, danger: true, confirmText: 'Xóa' });
        if (ok) {
          try {
            await deleteFlight(Number(btn.dataset.delete));
            showToast('Đã xóa chuyến bay.', 'success');
            draw(contentEl, page);
          } catch (e) {
            showToast('Không thể xóa: chuyến bay này đã có khách đặt.', 'error');
          }
        }
      });
    });
  } catch (e) {
    contentEl.innerHTML = `<div class="state-box"><div class="state-icon">⚠️</div>Không thể tải dữ liệu. Vui lòng thử lại.</div>`;
  }
}

registerRoute(ROUTES.ADMIN_FLIGHTS, (params) => {
  renderPage(document.getElementById('page-root'), params);
});
