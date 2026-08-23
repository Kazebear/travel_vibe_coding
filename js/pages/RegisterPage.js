import { registerRoute, navigate } from '../router.js';
import { ROUTES } from '../utils/constants.js';
import { register } from '../services/AuthService.js';
import { isValidUsername, isValidEmail, isValidPassword, isValidPhone10, isValidAddress, required } from '../utils/validation.js';
import { showToast } from '../components/Toast.js';

function renderPage(root) {
  root.innerHTML = `
    <div class="auth-wrap">
      <div class="card auth-card">
        <div class="auth-brand">✈ TravelViet</div>
        <h1 class="auth-title">Đăng ký</h1>
        <form id="registerForm" novalidate>
          <div class="form-group">
            <label class="form-label" for="fullName">Họ tên</label>
            <input type="text" id="fullName" class="form-input" required />
            <div class="form-error" data-error="fullName"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input type="text" id="username" class="form-input" required />
            <div class="form-hint">5-15 ký tự, chỉ chữ và số, không ký tự đặc biệt.</div>
            <div class="form-error" data-error="username"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input type="email" id="email" class="form-input" required />
            <div class="form-error" data-error="email"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="phone">Số điện thoại</label>
            <input type="tel" id="phone" class="form-input" required maxlength="10" placeholder="VD: 0901234567" />
            <div class="form-hint">Gồm đúng 10 chữ số.</div>
            <div class="form-error" data-error="phone"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="address">Địa chỉ</label>
            <input type="text" id="address" class="form-input" maxlength="100" />
            <div class="form-hint">Tối đa 100 ký tự.</div>
            <div class="form-error" data-error="address"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input type="password" id="password" class="form-input" required />
            <div class="form-hint">6-15 ký tự.</div>
            <div class="form-error" data-error="password"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="confirmPassword">Xác nhận Password</label>
            <input type="password" id="confirmPassword" class="form-input" required />
            <div class="form-error" data-error="confirmPassword"></div>
          </div>
          <button type="submit" class="btn btn-primary btn-block" id="registerBtn">Đăng ký</button>
        </form>
        <div class="auth-links">
          Đã có tài khoản? <a href="${ROUTES.LOGIN}" data-link>Đăng nhập</a>
        </div>
      </div>
    </div>
  `;

  function setError(field, msg) {
    const el = root.querySelector(`[data-error="${field}"]`);
    if (el) el.textContent = msg || '';
    const input = root.querySelector(`#${field}`);
    if (input) input.classList.toggle('is-invalid', !!msg);
  }

  root.querySelector('#registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      fullName: root.querySelector('#fullName').value.trim(),
      username: root.querySelector('#username').value.trim(),
      email: root.querySelector('#email').value.trim(),
      phone: root.querySelector('#phone').value.trim(),
      address: root.querySelector('#address').value.trim(),
      password: root.querySelector('#password').value,
      confirmPassword: root.querySelector('#confirmPassword').value,
    };

    ['fullName', 'username', 'email', 'phone', 'address', 'password', 'confirmPassword'].forEach((f) => setError(f, ''));

    let hasError = false;
    if (!required(data.fullName)) { setError('fullName', 'Vui lòng nhập họ tên.'); hasError = true; }
    if (!isValidUsername(data.username)) { setError('username', 'Username phải từ 5-15 ký tự, không ký tự đặc biệt.'); hasError = true; }
    if (!isValidEmail(data.email)) { setError('email', 'Email không hợp lệ.'); hasError = true; }
    if (!isValidPhone10(data.phone)) { setError('phone', 'Số điện thoại phải gồm đúng 10 chữ số.'); hasError = true; }
    if (!isValidAddress(data.address, 100)) { setError('address', 'Địa chỉ không được vượt quá 100 ký tự.'); hasError = true; }
    if (!isValidPassword(data.password)) { setError('password', 'Password phải từ 6-15 ký tự.'); hasError = true; }
    if (data.password !== data.confirmPassword) { setError('confirmPassword', 'Xác nhận mật khẩu không khớp.'); hasError = true; }

    if (hasError) {
      showToast('Vui lòng nhập đầy đủ thông tin.', 'warning');
      return;
    }

    const btn = root.querySelector('#registerBtn');
    btn.disabled = true;
    btn.textContent = 'Đang đăng ký...';
    try {
      await register(data);
      showToast('Đăng ký thành công.', 'success');
      navigate(ROUTES.HOME);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Đăng ký';
    }
  });
}

registerRoute(ROUTES.REGISTER, () => {
  renderPage(document.getElementById('page-root'));
});
