import { registerRoute, navigate } from '../router.js';
import { ROUTES, AIRCRAFT_TYPES } from '../utils/constants.js';
import { renderAdminShell } from '../components/AdminLayout.js';
import { createFlight, updateFlight, getFlightById } from '../services/FlightService.js';
import { getAllAirlines } from '../repositories/AirlineRepository.js';
import { getAllAirports } from '../repositories/AirportRepository.js';
import { required } from '../utils/validation.js';
import { showToast } from '../components/Toast.js';
import { todayISO } from '../utils/formatDate.js';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function addMinutesToTime(time, duration) {
  const [hh, mm] = time.split(':').map(Number);
  const total = (hh * 60 + mm + duration) % (24 * 60);
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

function renderPage(root, params) {
  const editId = params.id ? Number(params.id) : null;
  const contentEl = renderAdminShell(root, ROUTES.ADMIN_FLIGHTS_CREATE, '');
  if (!contentEl) return;

  let flight = null;
  if (editId) {
    flight = getFlightById(editId);
    if (!flight) {
      contentEl.innerHTML = `<div class="state-box"><div class="state-icon">⚠️</div>Không tìm thấy chuyến bay cần sửa.<div class="mt-4"><a href="${ROUTES.ADMIN_FLIGHTS}" data-link class="btn btn-primary">Quay lại danh sách</a></div></div>`;
      return;
    }
  }
  const isEdit = !!flight;

  const airlines = getAllAirlines();
  const airports = getAllAirports();
  const airportOptions = (selectedId) =>
    airports.map((a) => `<option value="${a.id}" ${selectedId === a.id ? 'selected' : ''}>${a.city} (${a.code})</option>`).join('');

  contentEl.innerHTML = `
    <div class="admin-page-header"><h1>${isEdit ? 'Sửa Chuyến Bay' : 'Tạo Chuyến Bay'}</h1></div>
    <form id="createFlightForm" class="card admin-form-card" novalidate>
      <div class="admin-form-grid">
        <div class="form-group">
          <label class="form-label">Số hiệu chuyến bay *</label>
          <input type="text" id="flightNumber" class="form-input" required placeholder="VD: VN123" value="${flight?.flight_number || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Hãng bay *</label>
          <select id="airlineId" class="form-select" required>
            <option value="" ${!flight ? 'selected' : ''}>Chọn hãng bay</option>
            ${airlines.map((a) => `<option value="${a.id}" ${flight?.airline_id === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Sân bay đi *</label>
          <select id="originAirport" class="form-select" required>
            <option value="" ${!flight ? 'selected' : ''}>Chọn sân bay đi</option>
            ${airportOptions(flight?.origin_airport_id)}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Sân bay đến *</label>
          <select id="destinationAirport" class="form-select" required>
            <option value="" ${!flight ? 'selected' : ''}>Chọn sân bay đến</option>
            ${airportOptions(flight?.destination_airport_id)}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Ngày bay *</label>
          <input type="date" id="departureDate" class="form-input" required min="${todayISO()}" value="${flight?.departure_date || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Giờ cất cánh *</label>
          <input type="time" id="departureTime" class="form-input" required value="${flight?.departure_time || '08:00'}" />
        </div>
        <div class="form-group">
          <label class="form-label">Thời gian bay (phút) *</label>
          <input type="number" id="duration" class="form-input" min="30" required value="${flight?.duration_minutes || 120}" />
        </div>
        <div class="form-group">
          <label class="form-label">Loại vé *</label>
          <select id="tripType" class="form-select" required>
            <option value="one-way" ${(flight?.trip_type || 'one-way') === 'one-way' ? 'selected' : ''}>Một chiều</option>
            <option value="round-trip" ${flight?.trip_type === 'round-trip' ? 'selected' : ''}>Khứ hồi</option>
            <option value="multi-city" ${flight?.trip_type === 'multi-city' ? 'selected' : ''}>Nhiều thành phố</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Số điểm dừng</label>
          <input type="number" id="stops" class="form-input" min="0" max="3" value="${flight?.stops ?? 0}" />
        </div>
        <div class="form-group">
          <label class="form-label">Loại máy bay *</label>
          <select id="aircraft" class="form-select" required>
            ${AIRCRAFT_TYPES.map((a) => `<option value="${a}" ${flight?.aircraft === a ? 'selected' : ''}>${a}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Giá Phổ thông (VND) *</label>
          <input type="number" id="economyPrice" class="form-input" min="0" step="10000" required value="${flight?.economy_price || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Giá Thương gia (VND) *</label>
          <input type="number" id="businessPrice" class="form-input" min="0" step="10000" required value="${flight?.business_price || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Trạng thái</label>
          <select id="status" class="form-select">
            <option value="available" ${(flight?.status || 'available') === 'available' ? 'selected' : ''}>Còn chỗ</option>
            <option value="unavailable" ${flight?.status === 'unavailable' ? 'selected' : ''}>Hết chỗ</option>
          </select>
        </div>
        <div class="form-group full">
          <label class="form-label">Dịch vụ đi kèm</label>
          <input type="text" id="services" class="form-input" placeholder="VD: Hành lý 20kg, Suất ăn" value="${flight?.services || 'Hành lý 20kg, Suất ăn'}" />
        </div>
      </div>
      <div class="form-error" id="createFlightError"></div>
      <div class="flex gap-2 mt-4">
        <button type="submit" class="btn btn-primary" id="submitFlightBtn">${isEdit ? 'Cập nhật Chuyến Bay' : 'Lưu Chuyến Bay'}</button>
        <a href="${ROUTES.ADMIN_FLIGHTS}" data-link class="btn btn-secondary">Hủy</a>
      </div>
    </form>
  `;

  contentEl.querySelector('#createFlightForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const errorEl = contentEl.querySelector('#createFlightError');
    errorEl.textContent = '';

    const originId = contentEl.querySelector('#originAirport').value;
    const destinationId = contentEl.querySelector('#destinationAirport').value;
    const airlineId = contentEl.querySelector('#airlineId').value;
    const departureTime = contentEl.querySelector('#departureTime').value;
    const duration = Number(contentEl.querySelector('#duration').value);

    if (!required(contentEl.querySelector('#flightNumber').value) || !airlineId || !originId || !destinationId || !contentEl.querySelector('#departureDate').value) {
      errorEl.textContent = 'Vui lòng nhập đầy đủ các trường bắt buộc (*).';
      showToast('Vui lòng nhập đầy đủ thông tin.', 'warning');
      return;
    }
    if (originId === destinationId) {
      errorEl.textContent = 'Sân bay đi và sân bay đến không được trùng nhau.';
      return;
    }

    const data = {
      flight_number: contentEl.querySelector('#flightNumber').value.trim(),
      airline_id: Number(airlineId),
      origin_airport_id: Number(originId),
      destination_airport_id: Number(destinationId),
      departure_date: contentEl.querySelector('#departureDate').value,
      departure_time: departureTime,
      arrival_time: addMinutesToTime(departureTime, duration),
      duration_minutes: duration,
      trip_type: contentEl.querySelector('#tripType').value,
      stops: Number(contentEl.querySelector('#stops').value) || 0,
      aircraft: contentEl.querySelector('#aircraft').value,
      economy_price: Number(contentEl.querySelector('#economyPrice').value),
      business_price: Number(contentEl.querySelector('#businessPrice').value),
      services: contentEl.querySelector('#services').value.trim(),
      status: contentEl.querySelector('#status').value,
    };

    if (data.business_price <= data.economy_price) {
      errorEl.textContent = 'Giá Thương gia phải lớn hơn giá Phổ thông.';
      return;
    }

    try {
      if (isEdit) {
        updateFlight(editId, data);
        showToast('Đã cập nhật chuyến bay.', 'success');
      } else {
        createFlight(data);
        showToast('Đã tạo chuyến bay mới.', 'success');
      }
      navigate(ROUTES.ADMIN_FLIGHTS);
    } catch (err) {
      errorEl.textContent = 'Không thể lưu chuyến bay. Vui lòng thử lại.';
      showToast('Không thể thực hiện thao tác.', 'error');
    }
  });
}

registerRoute(ROUTES.ADMIN_FLIGHTS_CREATE, (params) => {
  renderPage(document.getElementById('page-root'), params);
});
