import { registerRoute } from '../router.js';
import { ROUTES } from '../utils/constants.js';
import { renderAdminShell } from '../components/AdminLayout.js';
import { getDashboardKpis, getTopAirlines, getTopCountries } from '../services/DashboardService.js';
import { skeletonTable } from '../utils/loading.js';

let barChartInstance = null;
let pieChartInstance = null;

function kpiCard(icon, value, label, color) {
  return `
    <div class="card kpi-card">
      <div class="kpi-icon" style="background:${color}22;color:${color}">${icon}</div>
      <div class="kpi-value">${Number(value).toLocaleString('vi-VN')}</div>
      <div class="kpi-label">${label}</div>
    </div>
  `;
}

function renderPage(root) {
  const contentEl = renderAdminShell(root, ROUTES.DASHBOARD, skeletonTable(6));
  if (!contentEl) return;
  draw(contentEl);
}

async function draw(contentEl) {
  let kpis, topAirlines, topCountries;
  let error = null;
  try {
    [kpis, topAirlines, topCountries] = await Promise.all([getDashboardKpis(), getTopAirlines(10), getTopCountries(10)]);
  } catch (e) {
    error = e;
  }

  if (error) {
    contentEl.innerHTML = `<div class="state-box"><div class="state-icon">⚠️</div>Không thể tải dữ liệu. Vui lòng thử lại.</div>`;
    return;
  }

  contentEl.innerHTML = `
    <div class="admin-page-header"><h1>Dashboard</h1></div>
    <div class="kpi-grid">
      ${kpiCard('🧳', kpis.monthlyTours, 'Tour trong tháng', '#0B5ED7')}
      ${kpiCard('✈️', kpis.flightCount, 'Số chuyến bay', '#00A8E8')}
      ${kpiCard('👥', kpis.tourCustomers, 'Khách đặt tour', '#198754')}
      ${kpiCard('🎫', kpis.flightCustomers, 'Khách đặt chuyến bay', '#FFB703')}
    </div>

    <div class="chart-grid">
      <div class="card chart-card">
        <div class="chart-card-title">Top 10 hãng bay được đặt nhiều nhất</div>
        ${topAirlines.length ? '<canvas id="airlineBarChart" height="260"></canvas>' : '<div class="state-box"><div class="state-icon">📊</div>Chưa có dữ liệu.</div>'}
      </div>
      <div class="card chart-card">
        <div class="chart-card-title">Tỷ lệ quốc gia có khách đặt tour</div>
        ${topCountries.length ? '<canvas id="countryPieChart" height="260"></canvas>' : '<div class="state-box"><div class="state-icon">🌍</div>Chưa có dữ liệu.</div>'}
      </div>
    </div>

    <div class="card" style="padding:20px">
      <div class="dashboard-section-title">Top 10 quốc gia được đặt tour nhiều nhất</div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>#</th><th>Đất nước</th><th>Số tour</th><th>Số khách đặt vé</th></tr></thead>
          <tbody>
            ${
              topCountries.length
                ? topCountries.map((c, i) => `<tr><td>${i + 1}</td><td>${c.country}</td><td>${c.tour_count}</td><td>${c.customer_count}</td></tr>`).join('')
                : `<tr><td colspan="4" class="text-center text-muted">Chưa có dữ liệu.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (topAirlines.length || topCountries.length) renderCharts(topAirlines, topCountries);
}

function renderCharts(topAirlines, topCountries) {
  if (!window.Chart) return;

  if (barChartInstance) { barChartInstance.destroy(); barChartInstance = null; }
  if (pieChartInstance) { pieChartInstance.destroy(); pieChartInstance = null; }

  const barCtx = document.getElementById('airlineBarChart');
  if (barCtx && topAirlines.length) {
    barChartInstance = new window.Chart(barCtx, {
      type: 'bar',
      data: {
        labels: topAirlines.map((a) => a.airline),
        datasets: [{ label: 'Số lượt đặt', data: topAirlines.map((a) => a.bookings), backgroundColor: '#0B5ED7', borderRadius: 6 }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { ticks: { autoSkip: false, maxRotation: 40, minRotation: 0 } } },
      },
    });
  }

  const pieCtx = document.getElementById('countryPieChart');
  if (pieCtx && topCountries.length) {
    const pieColors = ['#0B5ED7', '#00A8E8', '#198754', '#FFB703', '#DC3545', '#6f42c1', '#20c997', '#fd7e14', '#0d6efd', '#d63384'];
    pieChartInstance = new window.Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: topCountries.map((c) => c.country),
        datasets: [{ data: topCountries.map((c) => c.customer_count), backgroundColor: pieColors }],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });
  }
}

registerRoute(ROUTES.DASHBOARD, () => {
  renderPage(document.getElementById('page-root'));
});
