# TravelViet — Frontend Architecture

## 1. Architecture

TravelViet sử dụng kiến trúc Frontend-only.

```text
Browser
│
├── HTML
├── CSS
├── JavaScript
│
├── Router
├── Components
├── Pages
├── Services
│
├── Repository Layer
│       │
│       └── Supabase JS client (PostgREST + Auth)
│                   │
│                   └── Supabase Postgres (schema: supabase/schema.sql, bảo vệ bằng RLS)
│
└── localStorage (chỉ cho cart/UI state — session do Supabase Auth quản lý)
```

Không có server backend tự viết. Trình duyệt gọi thẳng Supabase bằng publishable/anon key; toàn bộ phân quyền nằm ở Row Level Security trên Postgres, không ở tầng JavaScript.

---

# 2. Recommended Folder Structure

```text
travelviet/
│
├── index.html
│
├── assets/
│   ├── images/
│   ├── logos/
│   └── icons/
│
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── global.css
│   ├── components.css
│   ├── pages.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   ├── router.js
│   │
│   ├── components/
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── FlightCard.js
│   │   ├── TourCard.js
│   │   ├── FilterSidebar.js
│   │   ├── CartItem.js
│   │   ├── Modal.js
│   │   └── Toast.js
│   │
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── FlightsPage.js
│   │   ├── FlightDetailPage.js
│   │   ├── ToursPage.js
│   │   ├── TourDetailPage.js
│   │   ├── CartPage.js
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── ForgotPasswordPage.js
│   │   ├── ProfilePage.js
│   │   ├── DashboardPage.js
│   │   ├── AdminToursPage.js
│   │   ├── AdminCreateTourPage.js
│   │   ├── AdminFlightsPage.js
│   │   └── AdminCreateFlightPage.js
│   │
│   ├── database/
│   │   ├── database.js
│   │   ├── schema.js
│   │   └── seed.js
│   │
│   ├── repositories/
│   │   ├── UserRepository.js
│   │   ├── FlightRepository.js
│   │   ├── TourRepository.js
│   │   ├── BookingRepository.js
│   │   └── AirlineRepository.js
│   │
│   ├── services/
│   │   ├── AuthService.js
│   │   ├── FlightService.js
│   │   ├── TourService.js
│   │   ├── CartService.js
│   │   ├── BookingService.js
│   │   ├── EmailService.js
│   │   └── DashboardService.js
│   │
│   └── utils/
│       ├── formatCurrency.js
│       ├── formatDate.js
│       ├── validation.js
│       ├── storage.js
│       └── constants.js
│
├── data/
│   └── travelviet.sqlite
│
└── docs/
    ├── README.md
    ├── PRD.md
    ├── ARCHITECTURE.md
    ├── DATABASE.md
    ├── UI_SPEC.md
    ├── ROUTES.md
    ├── SEED_DATA.md
    └── ACCEPTANCE.md
```

---

# 3. Application State

State chính:

```javascript
{
  currentUser,
  cart,
  searchParams,
  filters,
  currentRoute
}
```

Không sử dụng global state phức tạp nếu không cần thiết.

Có thể dùng một `AppState` object đơn giản.

---

# 4. Router

Sử dụng History API:

```javascript
history.pushState()
window.addEventListener('popstate', ...)
```

Routes:

```text
/
 /flights
 /flight-detail
 /tours
 /tour-detail
 /cart
 /login
 /register
 /forgot-password
 /profile
 /dashboard
 /admin/tours
 /admin/tours/create
 /admin/flights
 /admin/flights/create
```

Query parameters:

```text
/flights?origin=SGN&destination=HAN
/flight-detail?id=FL001
/tour-detail?id=TOUR001
```

---

# 5. Component Rules

Component phải:

* Có một trách nhiệm chính.
* Có thể render lại.
* Không truy cập SQLite trực tiếp.
* Không chứa business logic phức tạp.

Ví dụ:

```text
FlightCard
    ↓
FlightService
    ↓
FlightRepository
    ↓
SQLite
```

Không:

```text
FlightCard
    ↓
SQLite
```

---

# 6. Service Rules

Service xử lý business logic.

Ví dụ:

```text
FlightService.searchFlights()
FlightService.filterFlights()
FlightService.getFlightById()

TourService.getFeaturedTours()
TourService.searchTours()
TourService.createTour()

FlightService.createFlight()

CartService.addFlight()
CartService.addTour()
CartService.removeItem()
CartService.clearCart()

BookingService.createBooking()

AuthService.login()
AuthService.register()
AuthService.logout()
```

---

# 7. Security

Không có backend riêng nên phân quyền nằm hoàn toàn ở Supabase Row Level Security (RLS), không phải ở tầng JavaScript — xem [supabase/schema.sql](supabase/schema.sql).

* Password do Supabase Auth quản lý (không tự hash/lưu password nữa).
* Publishable/anon key được thiết kế để public trong frontend — bảo vệ bằng RLS, không phải bằng việc giấu key. Không dùng service_role key ở bất kỳ đâu trong code ứng dụng.
* Ghi dữ liệu (tạo/sửa/xóa tour, chuyến bay) chỉ admin qua RLS (`is_admin()`), không dựa vào việc ẩn nút trên UI.
* `bookings`/`booking_flights`/`booking_tours` cho phép insert công khai (giữ luồng đặt vé không cần đăng nhập) — giới hạn cố hữu của kiến trúc không backend.
* Validate tất cả input.
* Escape dữ liệu khi render HTML.
* Không dùng `innerHTML` với dữ liệu người dùng nếu không cần.

---

# 8. Responsive

Breakpoints đề xuất:

```text
Mobile: < 768px
Tablet: 768px - 1023px
Desktop: >= 1024px
```

Desktop:

* Sidebar filter cố định chiều rộng khoảng 280–320px.
* Content chiếm phần còn lại.

Mobile:

* Sidebar thành Filter Drawer.
* Cards chuyển thành single column.
* Header có mobile menu.
* Search form chuyển thành vertical layout.

---

# 9. Error Handling

Các trạng thái bắt buộc:

### Loading

Hiển thị skeleton/spinner.

### Empty

Ví dụ:

`Không tìm thấy chuyến bay phù hợp.`

### Error

Ví dụ:

`Không thể tải dữ liệu. Vui lòng thử lại.`

### Success

Toast:

`Đã thêm chuyến bay vào giỏ hàng.`

---

# 10. Coding Rules

* ES6 modules.
* `const`/`let`, không dùng `var`.
* Function nhỏ.
* Tên biến bằng tiếng Anh.
* UI text bằng tiếng Việt.
* Không duplicate code.
* Không inline CSS.
* Không inline JavaScript.
* Không hard-code business data trong page.
