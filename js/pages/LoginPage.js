import { registerRoute, navigate } from '../router.js';
import { ROUTES } from '../utils/constants.js';
import { login, isAdmin } from '../services/AuthService.js';
import { showToast } from '../components/Toast.js';

function renderPage(root) {
  root.innerHTML = `
    <div class="auth-wrap">
      <div class="card auth-card">
        <div class="auth-brand">✈ TravelViet</div>
        <h1 class="auth-title">Đăng nhập</h1>
        <form id="loginForm" novalidate>
          <div class="form-group">
            <label class="form-label" for="identifier">Email / Username</label>
            <input type="text" id="identifier" class="form-input" required autocomplete="username" />
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input type="password" id="password" class="form-input" required autocomplete="current-password" />
          </div>
          <div class="form-error" id="loginError"></div>
          <button type="submit" class="btn btn-primary btn-block" id="loginBtn">Đăng nhập</button>
        </form>
        <div class="auth-links">
          <a href="${ROUTES.FORGOT_PASSWORD}" data-link>Quên mật khẩu?</a>
        </div>
        <div class="auth-links">
          Chưa có tài khoản? <a href="${ROUTES.REGISTER}" data-link>Đăng ký</a>
        </div>
        <div class="card mt-4" style="padding:14px;background:var(--color-surface);font-size:12px;line-height:1.7">
          <strong>Tài khoản demo</strong><br/>
          Admin: admin@travel.com / Admin123!<br/>
          User: user@travel.com / User123!
        </div>
      </div>
    </div>
  `;

  root.querySelector('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = root.querySelector('#identifier').value.trim();
    const password = root.querySelector('#password').value;
    const errorEl = root.querySelector('#loginError');
    const btn = root.querySelector('#loginBtn');
    errorEl.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Đang đăng nhập...';
    try {
      await login(identifier, password);
      showToast('Đăng nhập thành công.', 'success');
      navigate(isAdmin() ? ROUTES.DASHBOARD : ROUTES.HOME);
    } catch (err) {
      errorEl.textContent = err.message;
      btn.disabled = false;
      btn.textContent = 'Đăng nhập';
    }
  });
}

registerRoute(ROUTES.LOGIN, () => {
  renderPage(document.getElementById('page-root'));
});
