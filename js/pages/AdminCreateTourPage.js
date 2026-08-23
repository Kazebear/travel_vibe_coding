import { registerRoute, navigate } from '../router.js';
import { ROUTES, AIRCRAFT_TYPES } from '../utils/constants.js';
import { renderAdminShell } from '../components/AdminLayout.js';
import { createTour, updateTour, getTourById, getTourItinerary } from '../services/TourService.js';
import { getAllAirlines } from '../repositories/AirlineRepository.js';
import { required } from '../utils/validation.js';
import { showToast } from '../components/Toast.js';
import { todayISO } from '../utils/formatDate.js';
import { skeletonTable } from '../utils/loading.js';

function itineraryDayFields(dayNumber, values = {}) {
  return `
    <div class="itinerary-editor-day" data-day="${dayNumber}">
      <div class="itinerary-editor-day-title">Ngày ${dayNumber}</div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Tiêu đề</label>
          <input type="text" class="form-input" data-field="title" value="${values.title || ''}" placeholder="VD: TP.HCM → Đà Nẵng" />
        </div>
        <div class="form-group">
          <label class="form-label">Ăn uống</label>
          <input type="text" class="form-input" data-field="meals" value="${values.meals || 'Sáng, Trưa, Tối'}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả</label>
        <textarea class="form-textarea" rows="2" data-field="description" placeholder="Mô tả hoạt động trong ngày">${values.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Lưu trú</label>
        <input type="text" class="form-input" data-field="accommodation" value="${values.accommodation || 'Khách sạn 3-4 sao'}" />
      </div>
    </div>
  `;
}

function renderItineraryEditor(container, count, valuesByDay = {}) {
  const items = [];
  for (let d = 1; d <= count; d++) items.push(itineraryDayFields(d, valuesByDay[d] || {}));
  container.innerHTML = items.join('');
}

async function renderPage(root, params) {
  const editId = params.id ? Number(params.id) : null;
  const contentEl = renderAdminShell(root, ROUTES.ADMIN_TOURS_CREATE, skeletonTable(4));
  if (!contentEl) return;

  let tour = null;
  let itineraryValuesByDay = {};
  if (editId) {
    tour = await getTourById(editId);
    if (!tour) {
      contentEl.innerHTML = `<div class="state-box"><div class="state-icon">⚠️</div>Không tìm thấy tour cần sửa.<div class="mt-4"><a href="${ROUTES.ADMIN_TOURS}" data-link class="btn btn-primary">Quay lại danh sách</a></div></div>`;
      return;
    }
    (await getTourItinerary(editId)).forEach((day) => {
      itineraryValuesByDay[day.day_number] = day;
    });
  }

  const airlines = await getAllAirlines();
  const isEdit = !!tour;

  contentEl.innerHTML = `
    <div class="admin-page-header"><h1>${isEdit ? 'Sửa Tour' : 'Tạo Tour'}</h1></div>
    <form id="createTourForm" class="card admin-form-card" novalidate>
      <div class="admin-form-grid">
        <div class="form-group">
          <label class="form-label">Tên tour *</label>
          <input type="text" id="name" class="form-input" required value="${tour?.name || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Mã tour *</label>
          <input type="text" id="code" class="form-input" required value="${tour?.code || `TOUR-${Date.now().toString().slice(-6)}`}" />
        </div>
        <div class="form-group">
          <label class="form-label">Operator *</label>
          <input type="text" id="operator" class="form-input" required placeholder="VD: Vietravel" value="${tour?.operator || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Quốc gia *</label>
          <input type="text" id="country" class="form-input" required placeholder="VD: Vietnam" value="${tour?.country || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Điểm đi *</label>
          <input type="text" id="origin" class="form-input" required value="${tour?.origin || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Điểm đến *</label>
          <input type="text" id="destination" class="form-input" required value="${tour?.destination || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Ngày khởi hành *</label>
          <input type="date" id="departureDate" class="form-input" required min="${todayISO()}" value="${tour?.departure_date || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Giờ khởi hành *</label>
          <input type="time" id="departureTime" class="form-input" required value="${tour?.departure_time || '07:00'}" />
        </div>
        <div class="form-group">
          <label class="form-label">Số ngày *</label>
          <input type="number" id="days" class="form-input" min="1" max="14" required value="${tour?.days || 3}" />
        </div>
        <div class="form-group">
          <label class="form-label">Số đêm *</label>
          <input type="number" id="nights" class="form-input" min="0" max="13" required value="${tour?.nights ?? 2}" />
        </div>
        <div class="form-group">
          <label class="form-label">Hãng bay (nếu có)</label>
          <select id="airlineId" class="form-select">
            <option value="" ${!tour?.airline_id ? 'selected' : ''}>Không sử dụng máy bay</option>
            ${airlines.map((a) => `<option value="${a.id}" ${tour?.airline_id === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Loại máy bay</label>
          <select id="aircraft" class="form-select">
            <option value="" ${!tour?.aircraft ? 'selected' : ''}>--</option>
            ${AIRCRAFT_TYPES.map((a) => `<option value="${a}" ${tour?.aircraft === a ? 'selected' : ''}>${a}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Giá (VND) *</label>
          <input type="number" id="price" class="form-input" min="0" step="10000" required value="${tour?.price || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Thumbnail URL (600x400)</label>
          <input type="text" id="thumbnail" class="form-input" placeholder="Để trống sẽ dùng ảnh mẫu" value="${tour?.thumbnail || ''}" />
        </div>
        <div class="form-group full">
          <label class="form-label">Mô tả</label>
          <textarea id="description" class="form-textarea" rows="2">${tour?.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Dịch vụ bao gồm</label>
          <textarea id="includedServices" class="form-textarea" rows="2">${tour?.included_services || 'Vé máy bay/xe khứ hồi, khách sạn, ăn uống theo chương trình, hướng dẫn viên, bảo hiểm du lịch'}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Dịch vụ không bao gồm</label>
          <textarea id="excludedServices" class="form-textarea" rows="2">${tour?.excluded_services || 'Chi phí cá nhân, đồ uống ngoài chương trình, tip hướng dẫn viên'}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Trạng thái</label>
          <select id="status" class="form-select">
            <option value="available" ${(tour?.status || 'available') === 'available' ? 'selected' : ''}>Còn chỗ</option>
            <option value="unavailable" ${tour?.status === 'unavailable' ? 'selected' : ''}>Hết chỗ</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tour nổi bật</label>
          <label class="filter-option"><input type="checkbox" id="featured" ${tour?.featured ? 'checked' : ''} /> Hiển thị ở trang chủ (Featured)</label>
        </div>
      </div>

      <h3 class="mt-4 mb-4">Lịch trình chuyến đi</h3>
      <div id="itineraryEditor"></div>

      <div class="form-error" id="createTourError"></div>
      <div class="flex gap-2 mt-4">
        <button type="submit" class="btn btn-primary" id="submitTourBtn">${isEdit ? 'Cập nhật Tour' : 'Lưu Tour'}</button>
        <a href="${ROUTES.ADMIN_TOURS}" data-link class="btn btn-secondary">Hủy</a>
      </div>
    </form>
  `;

  const itineraryContainer = contentEl.querySelector('#itineraryEditor');
  const daysInput = contentEl.querySelector('#days');
  renderItineraryEditor(itineraryContainer, Number(daysInput.value) || 1, itineraryValuesByDay);
  daysInput.addEventListener('change', () => {
    const n = Math.min(14, Math.max(1, Number(daysInput.value) || 1));
    daysInput.value = n;
    renderItineraryEditor(itineraryContainer, n, itineraryValuesByDay);
  });

  contentEl.querySelector('#createTourForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = contentEl.querySelector('#createTourError');
    errorEl.textContent = '';

    const data = {
      name: contentEl.querySelector('#name').value.trim(),
      code: contentEl.querySelector('#code').value.trim(),
      operator: contentEl.querySelector('#operator').value.trim(),
      country: contentEl.querySelector('#country').value.trim(),
      origin: contentEl.querySelector('#origin').value.trim(),
      destination: contentEl.querySelector('#destination').value.trim(),
      departure_date: contentEl.querySelector('#departureDate').value,
      departure_time: contentEl.querySelector('#departureTime').value,
      days: Number(contentEl.querySelector('#days').value),
      nights: Number(contentEl.querySelector('#nights').value),
      airline_id: contentEl.querySelector('#airlineId').value ? Number(contentEl.querySelector('#airlineId').value) : null,
      aircraft: contentEl.querySelector('#aircraft').value || null,
      price: Number(contentEl.querySelector('#price').value),
      thumbnail: contentEl.querySelector('#thumbnail').value.trim() || `https://picsum.photos/seed/admin-${Date.now()}/600/400`,
      description: contentEl.querySelector('#description').value.trim(),
      included_services: contentEl.querySelector('#includedServices').value.trim(),
      excluded_services: contentEl.querySelector('#excludedServices').value.trim(),
      status: contentEl.querySelector('#status').value,
      featured: contentEl.querySelector('#featured').checked,
    };

    if (!required(data.name) || !required(data.code) || !required(data.operator) || !required(data.origin) || !required(data.destination) || !required(data.country) || !data.departure_date || !data.price) {
      errorEl.textContent = 'Vui lòng nhập đầy đủ các trường bắt buộc (*).';
      showToast('Vui lòng nhập đầy đủ thông tin.', 'warning');
      return;
    }

    const itineraryDays = Array.from(itineraryContainer.querySelectorAll('.itinerary-editor-day')).map((dayEl) => ({
      day_number: Number(dayEl.dataset.day),
      title: dayEl.querySelector('[data-field="title"]').value.trim() || `Ngày ${dayEl.dataset.day}`,
      description: dayEl.querySelector('[data-field="description"]').value.trim() || 'Đang cập nhật lịch trình chi tiết.',
      meals: dayEl.querySelector('[data-field="meals"]').value.trim(),
      accommodation: dayEl.querySelector('[data-field="accommodation"]').value.trim(),
    }));

    try {
      if (isEdit) {
        await updateTour(editId, data, itineraryDays);
        showToast('Đã cập nhật tour.', 'success');
      } else {
        await createTour(data, itineraryDays);
        showToast('Đã tạo tour mới.', 'success');
      }
      navigate(ROUTES.ADMIN_TOURS);
    } catch (err) {
      errorEl.textContent = 'Không thể lưu tour. Vui lòng kiểm tra lại mã tour (phải là duy nhất).';
      showToast('Không thể thực hiện thao tác.', 'error');
    }
  });
}

registerRoute(ROUTES.ADMIN_TOURS_CREATE, (params) => {
  renderPage(document.getElementById('page-root'), params);
});
