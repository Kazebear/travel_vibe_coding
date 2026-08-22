import { registerRoute, navigate } from '../router.js';
import { ROUTES } from '../utils/constants.js';
import { getCart, removeFlightFromCart, removeTourFromCart, clearCart, getCartTotal } from '../services/CartService.js';
import { createBookingFromCart, validateBookingForm } from '../services/BookingService.js';
import { getCurrentUser } from '../services/AuthService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/formatDate.js';
import { showToast } from '../components/Toast.js';
import { showConfirm } from '../components/Modal.js';

let view = 'cart';
let lastBookingSummary = null;

function renderCartItems(cart) {
  const empty = !cart.flights.length && !cart.tours.length;
  if (empty) {
    return `
      <div class="state-box">
        <div class="state-icon">🛒</div>
        Giỏ hàng của bạn đang trống.
        <div class="mt-4 flex gap-2" style="justify-content:center">
          <a href="${ROUTES.FLIGHTS}" data-link class="btn btn-primary">Tìm chuyến bay</a>
          <a href="${ROUTES.TOURS}" data-link class="btn btn-secondary">Tìm tour</a>
        </div>
      </div>
    `;
  }

  let html = '';
  if (cart.flights.length) {
    html += `<div class="cart-group-title">Chuyến bay (${cart.flights.length})</div>`;
    cart.flights.forEach((f, i) => {
      html += `
        <div class="cart-item">
          <div class="cart-item-icon">✈️</div>
          <div class="cart-item-info">
            <div class="cart-item-title">${f.airline} · ${f.flightNumber}</div>
            <div class="cart-item-meta">${f.origin} → ${f.destination} · ${formatDate(f.date)} ${f.departureTime} · ${f.fareClass === 'business' ? 'Thương gia' : 'Phổ thông'}</div>
          </div>
          <div class="cart-item-price">${formatCurrency(f.price)}</div>
          <button type="button" class="cart-item-remove" data-remove-flight="${i}">Xóa</button>
        </div>
      `;
    });
  }
  if (cart.tours.length) {
    html += `<div class="cart-group-title mt-4">Tour du lịch (${cart.tours.length})</div>`;
    cart.tours.forEach((t, i) => {
      html += `
        <div class="cart-item">
          <div class="cart-item-icon">🧳</div>
          <div class="cart-item-info">
            <div class="cart-item-title">${t.name}</div>
            <div class="cart-item-meta">${t.destination} · Khởi hành ${formatDate(t.date)} · ${t.days} ngày ${t.nights} đêm</div>
          </div>
          <div class="cart-item-price">${formatCurrency(t.price)}</div>
          <button type="button" class="cart-item-remove" data-remove-tour="${i}">Xóa</button>
        </div>
      `;
    });
  }
  return html;
}

function renderCartView(root) {
  const cart = getCart();
  const total = getCartTotal();
  const empty = !cart.flights.length && !cart.tours.length;

  root.innerHTML = `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb"><a href="${ROUTES.HOME}" data-link>Trang chủ</a> / Giỏ hàng</div>
        <h1 class="page-header-title">Giỏ hàng của bạn</h1>
      </div>
    </div>
    <div class="container" style="padding:32px 0 64px">
      <div class="cart-layout">
        <div>
          ${renderCartItems(cart)}
        </div>
        ${
          !empty
            ? `
        <div class="card cart-summary">
          <div class="cart-summary-row"><span>Số lượng</span><span>${cart.flights.length + cart.tours.length} mục</span></div>
          <div class="cart-summary-total"><span>Tổng tiền</span><span>${formatCurrency(total)}</span></div>
          <button type="button" class="btn btn-primary btn-block mt-4" id="checkoutBtn">Đăng ký / Đặt dịch vụ</button>
          <a href="${ROUTES.HOME}" data-link class="btn btn-secondary btn-block mt-4">Tiếp tục mua sắm</a>
          <button type="button" class="btn btn-outline btn-block mt-4" id="clearCartBtn">Xóa giỏ hàng</button>
        </div>`
            : ''
        }
      </div>
    </div>
  `;

  root.querySelectorAll('[data-remove-flight]').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFlightFromCart(Number(btn.dataset.removeFlight));
      showToast('Đã xóa khỏi giỏ hàng.', 'success');
      renderCartView(root);
    });
  });
  root.querySelectorAll('[data-remove-tour]').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeTourFromCart(Number(btn.dataset.removeTour));
      showToast('Đã xóa khỏi giỏ hàng.', 'success');
      renderCartView(root);
    });
  });
  const clearBtn = root.querySelector('#clearCartBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      const ok = await showConfirm({ title: 'Xóa giỏ hàng', message: 'Bạn có chắc muốn xóa toàn bộ giỏ hàng?', danger: true, confirmText: 'Xóa' });
      if (ok) {
        clearCart();
        showToast('Đã xóa giỏ hàng.', 'success');
        renderCartView(root);
      }
    });
  }
  const checkoutBtn = root.querySelector('#checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      view = 'form';
      renderFormView(root);
    });
  }
}

function renderFormView(root) {
  const user = getCurrentUser();
  const total = getCartTotal();

  root.innerHTML = `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb"><a href="${ROUTES.CART}" data-link>Giỏ hàng</a> / Thông tin đặt chỗ</div>
        <h1 class="page-header-title">Thông tin khách hàng</h1>
      </div>
    </div>
    <div class="container" style="padding:32px 0 64px;max-width:640px">
      <form id="bookingForm" class="card" style="padding:28px" novalidate>
        <div class="form-group">
          <label class="form-label" for="fullName">Họ tên *</label>
          <input type="text" id="fullName" class="form-input" value="${user?.full_name || ''}" required />
          <div class="form-error" data-error="fullName"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="email">Email *</label>
          <input type="email" id="email" class="form-input" value="${user?.email || ''}" required />
          <div class="form-error" data-error="email"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="phone">Số điện thoại *</label>
            <input type="tel" id="phone" class="form-input" value="${user?.phone || ''}" required />
            <div class="form-error" data-error="phone"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="country">Quốc gia *</label>
            <input type="text" id="country" class="form-input" value="${user?.country || 'Vietnam'}" required />
            <div class="form-error" data-error="country"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="address">Địa chỉ *</label>
          <input type="text" id="address" class="form-input" value="${user?.address || ''}" required />
          <div class="form-error" data-error="address"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="note">Ghi chú</label>
          <textarea id="note" class="form-textarea" rows="3"></textarea>
        </div>
        <div class="cart-summary-total mb-4"><span>Tổng thanh toán</span><span>${formatCurrency(total)}</span></div>
        <button type="submit" class="btn btn-primary btn-block" id="submitBookingBtn">Đăng ký đặt dịch vụ</button>
        <button type="button" class="btn btn-secondary btn-block mt-4" id="backToCartBtn">← Quay lại giỏ hàng</button>
      </form>
    </div>
  `;

  root.querySelector('#backToCartBtn').addEventListener('click', () => {
    view = 'cart';
    renderCartView(root);
  });

  root.querySelector('#bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      fullName: root.querySelector('#fullName').value.trim(),
      email: root.querySelector('#email').value.trim(),
      phone: root.querySelector('#phone').value.trim(),
      country: root.querySelector('#country').value.trim(),
      address: root.querySelector('#address').value.trim(),
    };
    const errors = validateBookingForm(data);
    root.querySelectorAll('[data-error]').forEach((el) => (el.textContent = ''));
    root.querySelectorAll('.form-input').forEach((el) => el.classList.remove('is-invalid'));

    if (Object.keys(errors).length) {
      Object.entries(errors).forEach(([field, msg]) => {
        const errEl = root.querySelector(`[data-error="${field}"]`);
        if (errEl) errEl.textContent = msg;
        const inputEl = root.querySelector(`#${field}`);
        if (inputEl) inputEl.classList.add('is-invalid');
      });
      showToast('Vui lòng nhập đầy đủ thông tin.', 'warning');
      return;
    }

    const submitBtn = root.querySelector('#submitBookingBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';

    try {
      const summary = await createBookingFromCart(data, getCurrentUser()?.id);
      lastBookingSummary = summary;
      view = 'success';
      renderSuccessView(root);
    } catch (err) {
      showToast(err.message || 'Không thể thực hiện thao tác.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Đăng ký đặt dịch vụ';
    }
  });
}

function renderSuccessView(root) {
  const s = lastBookingSummary;
  root.innerHTML = `
    <div class="container">
      <div class="success-box">
        <div class="success-icon">✓</div>
        <h1>Đặt chỗ thành công!</h1>
        <p class="text-muted mt-4">Cảm ơn ${s.customer.fullName}, TravelViet đã ghi nhận đơn đặt chỗ của bạn.</p>
        <div class="success-code">${s.bookingCode}</div>
        <div class="card text-center" style="padding:20px;text-align:left">
          <div class="cart-summary-row"><span>Khách hàng</span><span>${s.customer.fullName}</span></div>
          <div class="cart-summary-row"><span>Email</span><span>${s.customer.email}</span></div>
          <div class="cart-summary-row"><span>Số chuyến bay</span><span>${s.flights.length}</span></div>
          <div class="cart-summary-row"><span>Số tour</span><span>${s.tours.length}</span></div>
          <div class="cart-summary-total"><span>Tổng tiền</span><span>${formatCurrency(s.total)}</span></div>
        </div>
        <p class="text-muted mt-4" style="font-size:13px">
          Email xác nhận đã được gửi từ <strong>nvhai061993@gmail.com</strong> đến <strong>${s.customer.email}</strong>.
          ${s.email?.mode === 'demo' ? '(Chế độ demo — email được ghi log tại console, chưa kết nối SMTP thật.)' : ''}
        </p>
        <div class="mt-4 flex gap-2" style="justify-content:center">
          <a href="${s.email?.mailtoLink || '#'}" class="btn btn-secondary">Gửi lại qua ứng dụng Email</a>
          <a href="${ROUTES.HOME}" data-link class="btn btn-primary">Về trang chủ</a>
        </div>
      </div>
    </div>
  `;
}

function renderPage(root) {
  view = 'cart';
  renderCartView(root);
}

registerRoute(ROUTES.CART, () => {
  renderPage(document.getElementById('page-root'));
});
