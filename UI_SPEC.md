# TravelViet — UI Specification

## 1. Visual Direction

Phong cách:

**Modern Vietnamese Travel Booking**

Cảm giác:

* Cao cấp.
* Tin cậy.
* Sạch.
* Dễ sử dụng.
* Nhiều hình ảnh.
* Không quá nhiều màu.

Nền trang (background) chủ đạo: **trắng** (`#FFFFFF`). Chỉ dùng tông xám nhạt `#F5F7FA` cho các block phụ (card nền, table header, section xen kẽ) để tạo phân lớp thị giác, không dùng làm nền tổng thể của trang.

---

# 2. Header

Desktop:

```text
[TravelViet Logo]   Trang chủ  Chuyến bay  Tour  Giỏ hàng  | Đăng nhập
```

Khi user login:

```text
[Avatar] Nguyễn Văn A
```

Admin (Sidebar):

```text
Dashboard
Tours
  ├─ Quản lý Tour
  └─ Tạo Tour
Flights
  ├─ Quản lý Chuyến bay
  └─ Tạo Chuyến bay
Profile
```

---

# 3. Homepage Hero

Hero background:

* Ảnh phong cảnh Việt Nam.
* Overlay tối nhẹ.

Title:

`Khám phá Việt Nam cùng TravelViet`

Subtitle:

`Tìm chuyến bay và tour du lịch phù hợp với bạn`

Search panel màu trắng.

---

# 4. Search Flight Component

```text
[Khứ hồi] [Một chiều]

Điểm đi       Điểm đến

Ngày đi       Ngày về

Hành khách    Hạng dịch vụ

              [Tìm Kiếm]
```

Input phải có icon phù hợp.

---

# 5. Tour Cards

Desktop:

4 cards/row.

Tablet:

2 cards/row.

Mobile:

1 card/row.

Card:

```text
┌─────────────────────────┐
│                         │
│       600 x 400         │
│                         │
├─────────────────────────┤
│ Hà Nội - Hạ Long        │
│ Vietnam Travel          │
│ 4 ngày / 3 đêm          │
│                         │
│ Từ 5.990.000đ           │
│                         │
│ [Xem tour]              │
└─────────────────────────┘
```

---

# 6. Airline Logos

Hiển thị dạng grid.

Logo phải:

* Có background trắng.
* Có border nhẹ.
* Có hover.
* Không méo tỷ lệ.
* Alt text đầy đủ.

---

# 7. Flights Page

Sidebar:

```text
Bộ lọc
----------------
Sắp xếp giá

Loại vé

Điểm dừng

Hãng hàng không

Giờ cất cánh

Hạng dịch vụ
```

---

# 7.1 Tours Page Sidebar

```text
Bộ lọc
----------------
Sắp xếp giá

Hãng hàng không

Giờ cất cánh

Hãng/tour operator

Số ngày

Điểm đến
```

Result card:

```text
Vietnam Airlines
VN123

SGN 08:00 ───────── 10:10 HAN
       2h10m | Bay thẳng

Economy
2.350.000đ

[Xem chi tiết]
```

---

# 8. Flight Detail

Layout:

```text
Thông tin chuyến bay
─────────────────────

SGN                     HAN
08:00                   10:10

Vietnam Airlines
VN123
Airbus A321
2h10m

─────────────────────

Chọn hạng vé

┌───────────────┐
│ Phổ thông     │
│ 2.350.000đ    │
│ ✓ 7kg cabin   │
│ ✓ 20kg bag    │
│ [Chọn]        │
└───────────────┘

┌───────────────┐
│ Thương gia    │
│ 5.900.000đ    │
│ ✓ 10kg cabin  │
│ ✓ 30kg bag    │
│ ✓ Lounge      │
│ [Chọn]        │
└───────────────┘
```

---

# 9. Tour Page

Tour result card:

```text
┌───────────────────────────────┐
│ Thumbnail                     │
├───────────────────────────────┤
│ Đà Nẵng - Hội An              │
│ Vietnam Travel                │
│                               │
│ 4 ngày / 3 đêm                │
│ Khởi hành: 15/09/2026         │
│                               │
│ 7.990.000đ                    │
│                               │
│ [Xem chi tiết]                │
└───────────────────────────────┘
```

---

# 10. Tour Detail

Hero:

* Large image.
* Tour name.
* Destination.
* Price.

Thông tin:

```text
Điểm đi
Điểm đến
Ngày khởi hành
Số ngày
Số đêm
Hãng bay
Loại máy bay
```

Itinerary dạng timeline.

---

# 11. Cart

Cart summary phải luôn dễ nhìn.

Desktop:

```text
Items                         Summary
──────────────────────        ─────────────
Flight SGN-HAN                Subtotal
Tour Hà Nội                   Discount
                              Total
                              [Đăng ký]
```

Mobile:

Stack thành một cột.

---

# 12. Login

Card giữa màn hình:

```text
TravelViet

Đăng nhập

Email / Username
Password

[Đăng nhập]

Quên mật khẩu?
Chưa có tài khoản? Đăng ký
```

---

# 13. Register

Fields:

* Full name.
* Username.
* Email.
* Phone (10 số).
* Address (tối đa 100 ký tự).
* Password.
* Confirm password.

Validation message hiển thị ngay dưới input.

---

# 14. Forgot Password

```text
Quên mật khẩu?

Email

[Gửi yêu cầu]

← Quay lại đăng nhập
```

---

# 15. Dashboard

KPI cards:

```text
┌─────────────┐ ┌─────────────┐
│ 1,248       │ │ 8,520       │
│ Tour tháng  │ │ Chuyến bay  │
└─────────────┘ └─────────────┘

┌─────────────┐ ┌─────────────┐
│ 892         │ │ 1,560       │
│ Khách tour  │ │ Khách bay   │
└─────────────┘ └─────────────┘
```

Charts bên dưới.

---

# 15.1 Admin Create Tour / Create Flight

Form layout dạng 2 cột trên Desktop, 1 cột trên Mobile.

```text
Tạo Tour / Tạo Chuyến Bay
─────────────────────────
[Field]        [Field]
[Field]        [Field]
[Field]        [Field]

[Hủy]          [Lưu]
```

Validate inline dưới mỗi field. Sau khi lưu thành công hiển thị Toast và quay lại trang danh sách tương ứng.

---

# 16. Tables

Table style:

* Header background `#F1F5F9`.
* Row hover.
* Border nhẹ.
* Pagination.
* Responsive horizontal scroll trên mobile.

---

# 17. Toast

Success:

`✓ Đã thêm vào giỏ hàng`

Error:

`Không thể thực hiện thao tác.`

Warning:

`Vui lòng nhập đầy đủ thông tin.`

---

# 18. Accessibility

Phải có:

* `label` cho form.
* `alt` cho ảnh.
* Keyboard focus.
* Visible focus state.
* Button có text rõ nghĩa.
* Màu không phải phương tiện duy nhất để biểu đạt trạng thái.
