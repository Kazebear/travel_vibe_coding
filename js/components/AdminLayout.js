import { ROUTES } from '../utils/constants.js';
import { isAdmin } from '../services/AuthService.js';
import { navigate } from '../router.js';

export function renderAdminShell(root, activeRoute, skeletonHtml) {
  if (!isAdmin()) {
    navigate(ROUTES.LOGIN, { replace: true });
    return null;
  }
  const isActive = (p) => (activeRoute === p ? 'active' : '');
  root.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <a href="${ROUTES.DASHBOARD}" data-link class="admin-sidebar-link ${isActive(ROUTES.DASHBOARD)}">📊 Dashboard</a>
        <div class="admin-sidebar-group-title">Tours</div>
        <a href="${ROUTES.ADMIN_TOURS}" data-link class="admin-sidebar-link ${isActive(ROUTES.ADMIN_TOURS)}">📋 Quản lý Tour</a>
        <a href="${ROUTES.ADMIN_TOURS_CREATE}" data-link class="admin-sidebar-link ${isActive(ROUTES.ADMIN_TOURS_CREATE)}">➕ Tạo Tour</a>
        <div class="admin-sidebar-group-title">Flights</div>
        <a href="${ROUTES.ADMIN_FLIGHTS}" data-link class="admin-sidebar-link ${isActive(ROUTES.ADMIN_FLIGHTS)}">📋 Quản lý Chuyến bay</a>
        <a href="${ROUTES.ADMIN_FLIGHTS_CREATE}" data-link class="admin-sidebar-link ${isActive(ROUTES.ADMIN_FLIGHTS_CREATE)}">➕ Tạo Chuyến bay</a>
        <div class="admin-sidebar-group-title">Tài khoản</div>
        <a href="${ROUTES.PROFILE}" data-link class="admin-sidebar-link ${isActive(ROUTES.PROFILE)}">👤 Profile</a>
      </aside>
      <div class="admin-content" id="adminContent">${skeletonHtml || ''}</div>
    </div>
  `;
  return root.querySelector('#adminContent');
}
