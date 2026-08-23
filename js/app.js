import { initAuth } from './database/supabaseClient.js';
import { initRouter } from './router.js';
import { mountHeader } from './components/Header.js';
import { mountFooter } from './components/Footer.js';
import { initToast } from './components/Toast.js';
import { mountNotFoundRoute } from './pages/NotFoundPage.js';

import './pages/HomePage.js';
import './pages/FlightsPage.js';
import './pages/FlightDetailPage.js';
import './pages/ToursPage.js';
import './pages/TourDetailPage.js';
import './pages/CartPage.js';
import './pages/LoginPage.js';
import './pages/RegisterPage.js';
import './pages/ForgotPasswordPage.js';
import './pages/ProfilePage.js';
import './pages/DashboardPage.js';
import './pages/AdminToursPage.js';
import './pages/AdminCreateTourPage.js';
import './pages/AdminFlightsPage.js';
import './pages/AdminCreateFlightPage.js';

async function bootstrap() {
  const appRoot = document.getElementById('app');
  const loadingScreen = document.getElementById('loading-screen');

  try {
    await initAuth();
  } catch (err) {
    console.error('Không thể kết nối Supabase:', err);
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div class="state-box">
          <div class="state-icon">⚠️</div>
          Không thể kết nối đến máy chủ. Vui lòng tải lại trang.
        </div>
      `;
    }
    return;
  }

  if (loadingScreen) loadingScreen.remove();
  appRoot.style.display = '';

  initToast();
  mountHeader(document.getElementById('header-root'));
  mountFooter(document.getElementById('footer-root'));
  mountNotFoundRoute();
  initRouter();
}

bootstrap();
