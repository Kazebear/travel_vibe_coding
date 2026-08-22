import { registerRoute, buildUrl, navigate } from '../router.js';
import { ROUTES, PAGE_SIZE_ADMIN } from '../utils/constants.js';
import { renderAdminShell } from '../components/AdminLayout.js';
import { getToursPage, countTours, deleteTour } from '../services/TourService.js';
import { renderPagination } from '../components/Pagination.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/formatDate.js';
import { showConfirm } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';
import { skeletonTable } from '../utils/loading.js';

function renderPage(root, params) {
  const contentEl = renderAdminShell(root, ROUTES.ADMIN_TOURS, skeletonTable(8));
  if (!contentEl) return;
  const page = Math.max(1, Number(params.page) || 1);
  setTimeout(() => draw(contentEl, page), 150);
}

function draw(contentEl, page) {
  let total, tours, error = null;
  try {
    total = countTours();
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_ADMIN));
    page = Math.min(page, totalPages);
    tours = getToursPage(page, PAGE_SIZE_ADMIN);

    const pagination = renderPagination(page, totalPages, (p) => navigate(buildUrl(ROUTES.ADMIN_TOURS, { page: p })));

    contentEl.innerHTML = `
      <div class="admin-page-header">
        <h1>Quản lý Tour</h1>
        <a href="${ROUTES.ADMIN_TOURS_CREATE}" data-link class="btn btn-primary">+ Tạo Tour</a>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>ID</th><th>Tour</th><th>Điểm đi</th><th>Điểm đến</th><th>Khởi hành</th><th>Số ngày</th><th>Giá</th><th>Operator</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              ${
                tours.length
                  ? tours
                      .map(
                        (t) => `
                <tr>
                  <td>${t.id}</td>
                  <td>${t.name}</td>
                  <td>${t.origin}</td>
                  <td>${t.destination}</td>
                  <td>${formatDate(t.departure_date)}</td>
                  <td>${t.days}</td>
                  <td>${formatCurrency(t.price)}</td>
                  <td>${t.operator}</td>
                  <td><span class="badge ${t.status === 'available' ? 'badge-success' : 'badge-danger'}">${t.status === 'available' ? 'Còn chỗ' : 'Hết chỗ'}</span></td>
                  <td>
                    <div class="flex gap-2">
                      <a href="${buildUrl(ROUTES.ADMIN_TOURS_CREATE, { id: t.id })}" data-link class="btn btn-secondary btn-sm">Sửa</a>
                      <button type="button" class="btn btn-danger btn-sm" data-delete="${t.id}">Xóa</button>
                    </div>
                  </td>
                </tr>
              `
                      )
                      .join('')
                  : `<tr><td colspan="10" class="text-center text-muted">Chưa có tour nào.</td></tr>`
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
        const ok = await showConfirm({ title: 'Xóa tour', message: `Bạn có chắc muốn xóa tour #${btn.dataset.delete}?`, danger: true, confirmText: 'Xóa' });
        if (ok) {
          deleteTour(Number(btn.dataset.delete));
          showToast('Đã xóa tour.', 'success');
          draw(contentEl, page);
        }
      });
    });
  } catch (e) {
    contentEl.innerHTML = `<div class="state-box"><div class="state-icon">⚠️</div>Không thể tải dữ liệu. Vui lòng thử lại.</div>`;
  }
}

registerRoute(ROUTES.ADMIN_TOURS, (params) => {
  renderPage(document.getElementById('page-root'), params);
});
