import { ROUTES } from '../utils/constants.js';
import { getState, subscribe } from '../state.js';
import { logout } from '../services/AuthService.js';
import { navigate } from '../router.js';
import { showToast } from './Toast.js';

function userInitial(user) {
  const name = user.full_name || user.username || '?';
  return name.trim().charAt(0).toUpperCase();
}

function userMenuHtml(user) {
  const isAdmin = user.role === 'admin';
  return `
    <div class="user-menu" id="userMenu">
      <button type="button" class="user-trigger" id="userTrigger">
        <span class="avatar">${userInitial(user)}</span>
        <span class="label">${user.full_name || user.username}</span>
      </button>
      <div class="user-dropdown">
        ${isAdmin ? `<a href="${ROUTES.DASHBOARD}" data-link>Dashboard</a>` : ''}
        <a href="${ROUTES.PROFILE}" data-link>Thông tin cá nhân</a>
        <button type="button" id="logoutBtn">Đăng xuất</button>
      </div>
    </div>
  `;
}

export function mountHeader(root) {
  render();
  subscribe(render);

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('userMenu');
    if (menu && !menu.contains(e.target)) menu.classList.remove('open');
  });

  function render() {
    const { currentUser, cart } = getState();
    const cartCount = (cart.flights?.length || 0) + (cart.tours?.length || 0);
    const isAdmin = currentUser && currentUser.role === 'admin';
    const path = window.location.pathname;
    const isActive = (p) => (path === p ? 'active' : '');

    root.innerHTML = `
      <header class="header">
        <div class="container header-inner">
          <a href="${ROUTES.HOME}" data-link class="logo">
            <span class="logo-mark">✈</span> TravelViet
          </a>
          <nav class="nav" id="mainNav">
            <a href="${ROUTES.HOME}" data-link class="nav-link ${isActive(ROUTES.HOME)}">Trang chủ</a>
            <a href="${ROUTES.FLIGHTS}" data-link class="nav-link ${isActive(ROUTES.FLIGHTS)}">Chuyến bay</a>
            <a href="${ROUTES.TOURS}" data-link class="nav-link ${isActive(ROUTES.TOURS)}">Tour</a>
            <a href="${ROUTES.CART}" data-link class="nav-link ${isActive(ROUTES.CART)}">Giỏ hàng</a>
            ${isAdmin ? `<a href="${ROUTES.DASHBOARD}" data-link class="nav-link ${isActive(ROUTES.DASHBOARD)}">Dashboard</a>` : ''}
          </nav>
          <div class="header-actions">
            <a href="${ROUTES.CART}" data-link class="btn btn-secondary nav-cart" aria-label="Giỏ hàng">
              🛒 <span class="label">Giỏ hàng</span>
              ${cartCount ? `<span class="nav-cart-count">${cartCount}</span>` : ''}
            </a>
            ${currentUser ? userMenuHtml(currentUser) : `<a href="${ROUTES.LOGIN}" data-link class="btn btn-primary">Đăng nhập</a>`}
            <button type="button" class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu">☰</button>
          </div>
        </div>
      </header>
    `;

    const userTrigger = document.getElementById('userTrigger');
    if (userTrigger) {
      userTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('userMenu').classList.toggle('open');
      });
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        logout();
        showToast('Đã đăng xuất.', 'success');
        navigate(ROUTES.HOME);
      });
    }
    const mobileBtn = document.getElementById('mobileMenuBtn');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        document.getElementById('mainNav').classList.toggle('mobile-open');
      });
    }
  }
}
