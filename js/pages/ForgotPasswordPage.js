import { registerRoute } from '../router.js';
import { ROUTES } from '../utils/constants.js';
import { requestPasswordReset } from '../services/AuthService.js';
import { showToast } from '../components/Toast.js';

function renderPage(root) {
  root.innerHTML = `
    <div class="auth-wrap">
      <div class="card auth-card">
        <div class="auth-brand">✈ TravelViet</div>
        <h1 class="auth-title">Quên mật khẩu?</h1>
        <div id="formArea">
          <form id="forgotForm" novalidate>
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input type="email" id="email" class="form-input" required />
              <div class="form-error" id="forgotError"></div>
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="forgotBtn">Gửi yêu cầu</button>
          </form>
        </div>
        <div class="auth-links">
          <a href="${ROUTES.LOGIN}" data-link>← Quay lại đăng nhập</a>
        </div>
      </div>
    </div>
  `;

  root.querySelector('#forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = root.querySelector('#email').value.trim();
    const errorEl = root.querySelector('#forgotError');
    const btn = root.querySelector('#forgotBtn');
    errorEl.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Đang gửi...';
    try {
      await requestPasswordReset(email);
      root.querySelector('#formArea').innerHTML = `
        <div class="state-box">
          <div class="state-icon">📧</div>
          Yêu cầu đặt lại mật khẩu đã được gửi đến <strong>${email}</strong>.<br/>
          <span style="font-size:13px">(Chế độ demo — vui lòng liên hệ quản trị viên để đặt lại mật khẩu thực tế.)</span>
        </div>
      `;
      showToast('Đã gửi yêu cầu đặt lại mật khẩu.', 'success');
    } catch (err) {
      errorEl.textContent = err.message;
      btn.disabled = false;
      btn.textContent = 'Gửi yêu cầu';
    }
  });
}

registerRoute(ROUTES.FORGOT_PASSWORD, () => {
  renderPage(document.getElementById('page-root'));
});
