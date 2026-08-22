import { registerNotFound } from '../router.js';
import { ROUTES } from '../utils/constants.js';

export function mountNotFoundRoute() {
  registerNotFound(() => {
    const root = document.getElementById('page-root');
    root.innerHTML = `
      <div class="container">
        <div class="notfound-box">
          <div class="notfound-code">404</div>
          <p class="mt-4">Trang bạn tìm kiếm không tồn tại.</p>
          <div class="mt-4"><a href="${ROUTES.HOME}" data-link class="btn btn-primary">Quay về trang chủ</a></div>
        </div>
      </div>
    `;
  });
}
