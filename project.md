# PROJECT.md — Nhật ký xây dựng TravelViet

Tài liệu này ghi lại toàn bộ quá trình xây dựng website **TravelViet (Du Lịch Việt)** — từ lúc chốt yêu cầu đến khi hoàn thiện các tính năng chính. Dùng để tra cứu lại quyết định đã đưa ra, lý do, và những gì còn cần làm.

---

## 1. Yêu cầu ban đầu

* **Tên website:** Du Lịch Việt (TravelViet)
* **Công nghệ:** HTML, CSS, JavaScript thuần — **không backend**
* **Database:** SQLite chạy trong trình duyệt
* **Giao diện:** tông màu sáng, nền trắng
* **Phạm vi:** Trang chủ (tìm chuyến bay + tour nổi bật + hãng hàng không), Flights, Tour, Cart, Auth (Login/Register/Forgot Password), Admin (Dashboard, quản lý Tour, quản lý Chuyến bay)

---

## 2. Giai đoạn 1 — Soạn & rà soát tài liệu spec

Trước khi code, đã tạo 8 file spec trong thư mục gốc:

| File | Nội dung |
|---|---|
| `README.md` | Tổng quan, công nghệ, màu sắc, quy tắc |
| `PRD.md` | Yêu cầu chi tiết từng trang/tính năng |
| `ARCHITECTURE.md` | Kiến trúc frontend, folder structure, state, router |
| `DATABASE.md` | Schema SQLite, query cần có, pagination |
| `UI_SPEC.md` | Layout/wireframe từng trang |
| `ROUTES.md` | Danh sách route, navigation flow |
| `SEED_DATA.md` | Dữ liệu mẫu cần seed |
| `ACCEPTANCE.md` | Checklist nghiệm thu |

**Đối chiếu với yêu cầu gốc, phát hiện và sửa 4 điểm lệch trước khi code:**

1. Nền `#F5F7FA` (xám nhạt) → đổi thành `#FFFFFF` (trắng) theo đúng yêu cầu "nền trắng".
2. Filter trang Tour thiếu "hãng hàng không" + "giờ cất cánh" như Flights → bổ sung.
3. Admin chỉ có "Quản lý" (list), thiếu "Tạo" Tour/Chuyến bay → bổ sung route `/admin/tours/create`, `/admin/flights/create`.
4. Sidebar Admin thiếu mục Profile → bổ sung.

---

## 3. Giai đoạn 2 — Xây dựng toàn bộ website

### Kiến trúc

```
Browser
├── HTML/CSS (reset, variables, global, components, pages, responsive)
├── Router (History API, tự viết — js/router.js)
├── State (AppState đơn giản — js/state.js)
├── Components (Header, Footer, Toast, Modal, Pagination, FlightCard, TourCard, AdminLayout)
├── Pages (14 trang)
├── Services (business logic)
├── Repositories (truy vấn SQL)
└── Database (sql.js / SQLite WASM — chạy hoàn toàn trong trình duyệt)
```

Không dùng framework (React/Vue...) — thuần ES6 modules, ghép HTML bằng template string, re-render thủ công.

### Database

* Dùng **sql.js (SQLite WASM)** load qua CDN, không cần cài đặt.
* Database export ra base64, lưu trong `localStorage` để **persist qua các lần load lại trang**.
* Seed tự động khi chưa có dữ liệu: 10 hãng bay, 11 sân bay, **100 chuyến bay**, **115 tour** (đúng 8 tour "Nổi bật"), lịch trình từng ngày cho mỗi tour, ~260 booking mẫu để Dashboard có số liệu thống kê.
* Mật khẩu hash bằng Web Crypto API (SHA-256) trước khi lưu.

### Danh sách trang đã hoàn thành

* `/` — Trang chủ: hero search (khứ hồi/một chiều), 8 tour nổi bật, grid hãng hàng không
* `/flights` — Danh sách chuyến bay + filter sidebar (giá, loại vé, điểm dừng, hãng bay, giờ cất cánh, hạng dịch vụ) + filter drawer trên mobile
* `/flight-detail` — Chi tiết chuyến bay, chọn hạng Phổ thông/Thương gia, thêm vào giỏ
* `/tours` — Danh sách tour + filter tương tự
* `/tour-detail` — Chi tiết tour, lịch trình dạng timeline, thêm vào giỏ
* `/cart` — Giỏ hàng → Form thông tin khách hàng → Success screen + email xác nhận (demo mode)
* `/login`, `/register`, `/forgot-password` — Auth
* `/profile` — Thông tin cá nhân, cập nhật được
* `/dashboard` — 4 KPI, Bar chart Top 10 hãng bay, Pie chart tỷ lệ quốc gia, bảng Top 10 quốc gia (dùng Chart.js qua CDN)
* `/admin/tours`, `/admin/flights` — Danh sách + phân trang 20/trang
* `/admin/tours/create`, `/admin/flights/create` — Form Tạo (kiêm Sửa, xem mục 5)
* `404` — trang không tồn tại

---

## 4. Giai đoạn 3 — Kiểm thử & sửa lỗi thật

Chạy thử toàn bộ luồng trên trình duyệt (không chỉ đọc code). Phát hiện và sửa:

1. **Deep-link vỡ ở route lồng nhau** (`/admin/tours/create`): asset path tương đối (`js/app.js`) bị resolve sai khi URL có 2+ segment → sửa thành absolute path (`/js/app.js`) + thêm `<base href="/">`. Cũng thêm `404.html` kiểu GitHub Pages để hỗ trợ hosting tĩnh thật sau này.
2. **Tràn ngang 10px trên mobile 375px**: nút giỏ hàng/đăng nhập trong header quá rộng → giảm padding, ẩn label chữ trên mobile.
3. **Kết quả tìm chuyến bay luôn rỗng**: filter theo đúng 1 ngày cụ thể trong khi dữ liệu demo rải rác 60 ngày → đổi sang lọc "từ ngày đó trở đi" (`>=`).

Đã test end-to-end: tìm chuyến bay → chọn vé → giỏ hàng → đặt chỗ → email demo; tour → giỏ hàng; đăng ký/đăng nhập; admin tạo tour + chuyến bay; phân quyền chặn user thường vào `/admin`; trang 404; responsive mobile — không còn lỗi console.

---

## 5. Các tính năng bổ sung theo yêu cầu

### 5.1 Validation trang Đăng ký (bổ sung sau khi build xong)

* Username bắt buộc, 5–15 ký tự, không ký tự đặc biệt
* Password bắt buộc, 5–15 ký tự + xác nhận mật khẩu
* Email bắt buộc, đúng định dạng
* **Số điện thoại bắt buộc, đúng 10 chữ số** (mới thêm)
* **Địa chỉ, tối đa 100 ký tự** (mới thêm, không bắt buộc)
* Tài khoản mới luôn có `role = user`

### 5.2 Sửa (Edit) Tour / Chuyến bay cho Admin

Trước đó Admin chỉ có Tạo + Xóa + Danh sách. Đã bổ sung:

* `updateTour()` / `updateFlight()` ở tầng Repository + Service
* Trang Tạo Tour/Chuyến bay được tái sử dụng làm trang Sửa: đọc `?id=` trên URL, nếu có thì nạp sẵn toàn bộ dữ liệu (kể cả lịch trình từng ngày), đổi tiêu đề/nút thành "Sửa"/"Cập nhật"
* Nút **Sửa** thêm vào danh sách Admin Tours/Flights
* Xử lý trường hợp sửa `id` không tồn tại → hiển thị error state

---

## 6. Tài khoản demo

```
Admin: admin@travel.com / Admin123!
User:  user@travel.com  / User123!
```

## 7. Chạy thử local

```bash
npx --yes serve -s -l 5173 .
```

Bắt buộc dùng flag `-s` (SPA fallback) vì router dùng History API — server tĩnh thường (không rewrite) sẽ 404 khi load thẳng route con.

---

## 8. Hạn chế đã biết / việc có thể làm thêm

* Logo hãng bay dùng badge chữ màu thay vì logo thật (tránh phụ thuộc asset ngoài + bản quyền).
* Ảnh thumbnail tour dùng picsum.photos (ảnh mẫu, không phải ảnh địa điểm thật).
* Email chỉ ở chế độ demo (log console + nút mailto) — muốn gửi thật cần cấu hình EmailJS.
* "Quên mật khẩu" chỉ xác nhận yêu cầu, chưa thực sự reset mật khẩu.
* Hash mật khẩu SHA-256 không salt — đủ cho demo, chưa đạt chuẩn production.
* Chưa có test tự động (unit/e2e).
* Deploy thật cần host tĩnh hỗ trợ rewrite mọi path về `index.html`.

---

## 9. Nhật ký cập nhật

| Ngày | Nội dung |
|---|---|
| 2026-08-22 | Soạn 8 file spec, rà soát & sửa 4 điểm lệch so với yêu cầu |
| 2026-08-22 | Build toàn bộ website (DB, repositories, services, 14 trang), test end-to-end, sửa 3 bug (deep-link, mobile overflow, filter ngày) |
| 2026-08-22 | Thêm validation SĐT/Địa chỉ cho trang Đăng ký |
| 2026-08-22 | Thêm tính năng Sửa Tour/Chuyến bay cho Admin |
