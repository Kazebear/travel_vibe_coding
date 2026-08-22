import { ROUTES } from '../utils/constants.js';

export function mountFooter(root) {
  root.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <div class="footer-title">TravelViet</div>
            <p class="text-muted" style="font-size:14px;line-height:1.7">
              Nền tảng đặt chuyến bay và tour du lịch, giúp bạn khám phá Việt Nam và thế giới một cách dễ dàng.
            </p>
          </div>
          <div class="footer-col">
            <div class="footer-title">Khám phá</div>
            <a href="${ROUTES.FLIGHTS}" data-link>Chuyến bay</a>
            <a href="${ROUTES.TOURS}" data-link>Tour du lịch</a>
            <a href="${ROUTES.CART}" data-link>Giỏ hàng</a>
          </div>
          <div class="footer-col">
            <div class="footer-title">Tài khoản</div>
            <a href="${ROUTES.LOGIN}" data-link>Đăng nhập</a>
            <a href="${ROUTES.REGISTER}" data-link>Đăng ký</a>
            <a href="${ROUTES.PROFILE}" data-link>Thông tin cá nhân</a>
          </div>
          <div class="footer-col">
            <div class="footer-title">Liên hệ</div>
            <a href="mailto:nvhai061993@gmail.com">nvhai061993@gmail.com</a>
            <a href="tel:0900000000">0900 000 000</a>
          </div>
        </div>
        <div class="footer-bottom">
          © ${new Date().getFullYear()} TravelViet — Du Lịch Việt. Dự án demo, không kết nối thanh toán thật.
        </div>
      </div>
    </footer>
  `;
}
