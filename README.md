# Du Lịch Việt — TravelViet

## 1. Tổng quan

**Tên website:** Du Lịch Việt
**Tên tiếng Anh:** TravelViet
**Loại ứng dụng:** Website đặt chuyến bay và tour du lịch
**Kiến trúc:** Frontend-only / Single Page Application
**Backend:** Không có
**Database:** SQLite chạy trong trình duyệt bằng SQLite WASM/sql.js
**Ngôn ngữ:** HTML5, CSS3, Vanilla JavaScript
**Responsive:** Desktop, Tablet, Mobile

TravelViet là website du lịch cho phép người dùng:

* Tìm kiếm chuyến bay.
* Lọc chuyến bay.
* Xem chi tiết chuyến bay.
* Chọn hạng vé.
* Tìm kiếm tour.
* Lọc tour.
* Xem chi tiết tour.
* Chọn tour.
* Quản lý giỏ hàng.
* Nhập thông tin khách hàng.
* Đăng ký đặt tour/chuyến bay.
* Đăng nhập/đăng ký tài khoản.
* Xem thông tin cá nhân.
* Admin xem Dashboard.
* Admin quản lý danh sách tour.
* Admin quản lý danh sách chuyến bay.

---

## 2. Công nghệ bắt buộc

Không sử dụng backend.

### Frontend

* HTML5
* CSS3
* JavaScript ES6+
* CSS Variables
* Flexbox
* CSS Grid
* Responsive Design

### Database

Sử dụng SQLite phía client:

* SQLite WASM hoặc sql.js.
* Database được khởi tạo khi ứng dụng chạy.
* Seed dữ liệu mẫu tự động.
* Có repository/service layer để JavaScript giao tiếp với SQLite.

Không được hard-code toàn bộ dữ liệu trực tiếp trong HTML.

---

## 3. Nguyên tắc UI/UX

Thiết kế theo phong cách website du lịch hiện đại.

Màu chủ đạo:

* Primary: `#0B5ED7`
* Secondary: `#00A8E8`
* Accent: `#FFB703`
* Success: `#198754`
* Danger: `#DC3545`
* Background: `#FFFFFF`
* Surface (card nền phụ): `#F5F7FA`
* Text: `#172033`

Font:

* Inter hoặc system sans-serif.

Thiết kế:

* Header rõ ràng.
* Hero section nổi bật.
* Card bo góc.
* Shadow nhẹ.
* Button có trạng thái hover.
* Form dễ sử dụng.
* Sidebar filter trên Desktop.
* Filter chuyển thành drawer trên Mobile.
* Giá tiền sử dụng định dạng VND.
* Hình tour chuẩn thumbnail 600x400.

---

## 4. Các trang

### Public

* `/`
* `/flights`
* `/flight-detail`
* `/tours`
* `/tour-detail`
* `/cart`
* `/login`
* `/register`
* `/forgot-password`
* `/profile`

### Admin

* `/dashboard`
* `/admin/tours`
* `/admin/tours/create`
* `/admin/flights`
* `/admin/flights/create`
* `/profile` (dùng chung với user, truy cập được từ sidebar admin)

---

## 5. Tài khoản demo

### Admin

Email:

`admin@travel.com`

Password:

`Admin123!`

### User

Email:

`user@travel.com`

Password:

`User123!`

---

## 6. Quy tắc username/password

Username:

* 5 đến 15 ký tự.
* Không chứa ký tự đặc biệt.
* Cho phép chữ và số.

Password:

* 5 đến 15 ký tự.

Email:

* Phải đúng định dạng email.

---

## 7. Quy tắc quan trọng

Không tạo backend.

Không tạo API server.

Không sử dụng PHP, Node.js server, Express, Laravel, Java Spring hoặc server-side database.

Toàn bộ business logic phải chạy ở browser.

Tách code theo:

* UI
* Components
* Services
* Repository
* Database
* Utilities
* Pages

---

## 8. Mục tiêu

Website phải có cảm giác như một sản phẩm du lịch thương mại thực tế, không phải một trang demo đơn giản.

Ưu tiên:

1. UX.
2. Responsive.
3. Tính nhất quán.
4. Khả năng tái sử dụng component.
5. Dữ liệu SQLite.
6. Code dễ mở rộng.
7. Accessibility cơ bản.
8. Không có lỗi JavaScript trong Console.
