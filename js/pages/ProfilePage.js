import { registerRoute, navigate } from '../router.js';
import { ROUTES, USER_ROLE } from '../utils/constants.js';
import { getCurrentUser, refreshCurrentUser } from '../services/AuthService.js';
import { getUserById, updateUser } from '../repositories/UserRepository.js';
import { isValidPhone, required } from '../utils/validation.js';
import { formatDate } from '../utils/formatDate.js';
import { showToast } from '../components/Toast.js';

function userInitial(user) {
  const name = user.full_name || user.username || '?';
  return name.trim().charAt(0).toUpperCase();
}

function renderPage(root) {
  const sessionUser = getCurrentUser();
  if (!sessionUser) {
    navigate(ROUTES.LOGIN, { replace: true });
    return;
  }
  const user = getUserById(sessionUser.id) || sessionUser;

  root.innerHTML = `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb"><a href="${ROUTES.HOME}" data-link>Trang chủ</a> / Thông tin cá nhân</div>
        <h1 class="page-header-title">Thông tin cá nhân</h1>
      </div>
    </div>
    <div class="container profile-layout">
      <div class="card profile-summary">
        <div class="profile-avatar-lg">${userInitial(user)}</div>
        <div style="font-weight:700;font-size:17px">${user.full_name || user.username}</div>
        <div class="text-muted" style="font-size:13px">${user.email}</div>
        <span class="badge ${user.role === USER_ROLE.ADMIN ? 'badge-info' : 'badge-success'} profile-role">${user.role === USER_ROLE.ADMIN ? 'Quản trị viên' : 'Khách hàng'}</span>
        <div class="text-muted mt-4" style="font-size:12px">Tham gia: ${formatDate((user.created_at || '').slice(0, 10))}</div>
      </div>

      <form id="profileForm" class="card profile-form" novalidate>
        <h3 class="mb-4">Cập nhật thông tin</h3>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="fullName">Họ tên</label>
            <input type="text" id="fullName" class="form-input" value="${user.full_name || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input type="text" id="username" class="form-input" value="${user.username}" disabled />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input type="email" id="email" class="form-input" value="${user.email}" disabled />
          </div>
          <div class="form-group">
            <label class="form-label" for="phone">Số điện thoại</label>
            <input type="tel" id="phone" class="form-input" value="${user.phone || ''}" />
            <div class="form-error" id="phoneError"></div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="country">Quốc gia</label>
            <input type="text" id="country" class="form-input" value="${user.country || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="address">Địa chỉ</label>
            <input type="text" id="address" class="form-input" value="${user.address || ''}" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" id="saveProfileBtn">Lưu thay đổi</button>
      </form>
    </div>
  `;

  root.querySelector('#profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = root.querySelector('#phone').value.trim();
    const errorEl = root.querySelector('#phoneError');
    errorEl.textContent = '';

    if (phone && !isValidPhone(phone)) {
      errorEl.textContent = 'Số điện thoại không hợp lệ.';
      return;
    }

    const data = {
      full_name: root.querySelector('#fullName').value.trim(),
      phone,
      country: root.querySelector('#country').value.trim(),
      address: root.querySelector('#address').value.trim(),
    };

    if (!required(data.full_name)) {
      showToast('Vui lòng nhập họ tên.', 'warning');
      return;
    }

    updateUser(user.id, data);
    const updated = getUserById(user.id);
    refreshCurrentUser(updated);
    showToast('Đã cập nhật thông tin cá nhân.', 'success');
    renderPage(root);
  });
}

registerRoute(ROUTES.PROFILE, () => {
  renderPage(document.getElementById('page-root'));
});
