# Product Requirements Document — TravelViet

## 1. Product

TravelViet — Du Lịch Việt.

Website cung cấp chức năng tìm kiếm và lựa chọn:

* Chuyến bay.
* Tour du lịch.

Người dùng có thể đưa các sản phẩm vào giỏ hàng và tiến hành đăng ký đặt dịch vụ.

---

# 2. Homepage

## 2.1 Hero Search

Hero section phải có form tìm chuyến bay.

Các trường:

* Điểm xuất phát.
* Điểm đến.
* Ngày đi.
* Ngày về.
* Vé khứ hồi.
* Vé một chiều.
* Số hành khách.
* Hạng dịch vụ.
* Button `Tìm Kiếm`.

Nếu chọn `Vé một chiều`:

* Ẩn hoặc disable ngày về.

Nếu chọn `Vé khứ hồi`:

* Hiển thị ngày về.

Click `Tìm Kiếm`:

* Validate dữ liệu.
* Lưu search parameters.
* Chuyển tới `/flights`.

---

# 3. Featured Tours

Homepage hiển thị 8 tour nổi bật.

Mỗi card:

* Thumbnail 600x400.
* Tên tour.
* Hãng/tour operator.
* Điểm đến.
* Số ngày.
* Số đêm.
* Giá.
* Button hoặc clickable card.

Click card:

`/tour-detail?id=<tourId>`

---

# 4. Airlines

Hiển thị logo các hãng:

* VietJet Air.
* Vietnam Airlines.
* Bamboo Airways.
* Pacific Airlines.
* Singapore Airlines.
* Thai Airways.
* AirAsia.
* Korean Air.
* Japan Airlines.
* Emirates.

Click logo:

Chuyển tới `/flights`.

Có thể truyền airline filter:

`/flights?airline=<airlineId>`

---

# 5. Flights

Layout:

```text
------------------------------------------------
| FILTER SIDEBAR | FLIGHT RESULT               |
|                |                             |
| Price          | Flight Card                 |
| Trip Type      | Flight Card                 |
| Stops          | Flight Card                 |
| Airlines       | Flight Card                 |
| Departure      | Flight Card                 |
| Class          | Flight Card                 |
------------------------------------------------
```

## Filter

### Giá

* Giá thấp đến cao.
* Giá cao đến thấp.

### Loại vé

* Khứ hồi.
* Một chiều.

### Số điểm dừng

* Bay thẳng.
* Nhiều thành phố.

### Hãng hàng không

Checkbox:

* VietJet Air.
* Vietnam Airlines.
* Bamboo Airways.
* Singapore Airlines.
* Thai Airways.
* AirAsia.
* Korean Air.
* Japan Airlines.
* Emirates.

### Thời gian cất cánh

* 00:00–06:00.
* 06:00–12:00.
* 12:00–18:00.
* 18:00–24:00.

### Hạng dịch vụ

* Phổ thông.
* Thương gia.

---

# 6. Flight Result Card

Hiển thị:

* Logo hãng.
* Tên hãng.
* Mã chuyến bay.
* Sân bay đi.
* Sân bay đến.
* Giờ cất cánh.
* Giờ hạ cánh.
* Thời gian bay.
* Số điểm dừng.
* Hạng dịch vụ.
* Giá.
* Dịch vụ đi kèm.
* Button `Xem chi tiết`.

Click card:

`/flight-detail?id=<flightId>`

---

# 7. Flight Detail

Hiển thị:

* Điểm đi.
* Điểm đến.
* Ngày bay.
* Giờ cất cánh.
* Giờ hạ cánh.
* Thời gian bay.
* Hãng bay.
* Mã chuyến bay.
* Loại máy bay.
* Số điểm dừng.

## Fare Selection

Hai lựa chọn:

### Economy

Hiển thị:

* Giá.
* Hành lý.
* Hành lý xách tay.
* Chọn ghế nếu có.
* Điều kiện vé.

### Business

Hiển thị:

* Giá.
* Hành lý.
* Ưu tiên check-in.
* Lounge nếu có.
* Chọn ghế.
* Điều kiện vé.

Button:

`Chọn chuyến bay`

Sau khi chọn:

* Thêm flight vào cart.
* Hiển thị thông báo thành công.
* Có thể chuyển tới `/cart`.

---

# 8. Tours

Layout giống Flights:

```text
------------------------------------------------
| FILTER SIDEBAR | TOUR RESULTS                |
------------------------------------------------
```

Filter:

* Giá thấp đến cao.
* Giá cao đến thấp.
* Hãng hàng không (checkbox, giống Flights: VietJet Air, Vietnam Airlines, Bamboo Airways, Singapore Airlines, Thai Airways, AirAsia, Korean Air, Japan Airlines, Emirates).
* Thời gian cất cánh (giờ): 00:00–06:00, 06:00–12:00, 12:00–18:00, 18:00–24:00.
* Hãng/tour operator.
* Số ngày.
* Điểm đến.

---

# 9. Tour Result Card

Hiển thị:

* Thumbnail.
* Tên tour.
* Tour operator.
* Điểm đi.
* Điểm đến.
* Ngày khởi hành.
* Số ngày/đêm.
* Phương tiện/hãng bay.
* Giá.
* Dịch vụ.
* Button `Xem chi tiết`.

---

# 10. Tour Detail

Hiển thị:

* Tên tour.
* Điểm đi.
* Điểm đến.
* Ngày khởi hành.
* Số ngày.
* Số đêm.
* Hãng bay nếu tour có sử dụng máy bay.
* Loại máy bay.
* Giá.
* Dịch vụ bao gồm.
* Dịch vụ không bao gồm.
* Điều kiện tour.

## Itinerary

Hiển thị lịch trình theo ngày:

```text
Ngày 1
TP.HCM → Hà Nội
Nhận phòng khách sạn
Tham quan...

Ngày 2
Hà Nội
Tham quan...

Ngày 3
Hà Nội → TP.HCM
Kết thúc tour
```

Button:

`Chọn tour`

Sau khi chọn:

* Add tour vào Cart.

---

# 11. Cart

Hiển thị hai nhóm:

## Flights

Mỗi item:

* Airline.
* Route.
* Date.
* Time.
* Fare.
* Price.
* Remove.

## Tours

Mỗi item:

* Tour.
* Destination.
* Date.
* Duration.
* Price.
* Remove.

Có:

* Tổng tiền.
* Xóa từng item.
* Xóa toàn bộ giỏ hàng.
* Tiếp tục mua sắm.
* Đăng ký/đặt dịch vụ.

---

# 12. Booking Form

Thông tin:

* Họ tên.
* Email.
* Số điện thoại.
* Quốc gia.
* Địa chỉ.
* Ghi chú.

Validate trước khi submit.

Sau khi submit:

* Tạo booking.
* Lưu vào SQLite.
* Clear cart.
* Hiển thị màn hình hoàn thành.

---

# 13. Email

Frontend không có khả năng trực tiếp kết nối SMTP.

Thiết kế:

```text
EmailService
    |
    +-- EmailJS implementation
    |
    +-- mailto fallback
    |
    +-- Demo mode
```

Email xác nhận phải có:

* Mã booking.
* Tên khách.
* Danh sách chuyến bay.
* Danh sách tour.
* Tổng tiền.
* Thời gian đặt.

Email người gửi trong cấu hình production:

`nvhai061993@gmail.com`

Không hard-code secret/API key vào repository.

---

# 14. Authentication

Trang:

* Login.
* Register.
* Forgot Password.

Login:

* Email/Username.
* Password.

Register:

* Full name.
* Username (bắt buộc, 5-15 ký tự, không ký tự đặc biệt).
* Email (bắt buộc, đúng định dạng).
* Số điện thoại (bắt buộc, đúng 10 chữ số).
* Địa chỉ (không bắt buộc, tối đa 100 ký tự).
* Password (bắt buộc, 5-15 ký tự).
* Confirm password.

Tài khoản mới tạo luôn có role `user`.

Forgot Password:

* Email.
* Hiển thị trạng thái yêu cầu reset.

---

# 15. Dashboard

Chỉ Admin được truy cập.

4 KPI:

1. Số tour trong tháng.
2. Số chuyến bay.
3. Số khách đặt tour.
4. Số khách đặt chuyến bay.

---

# 16. Dashboard Charts

## Bar Chart

Top 10 hãng bay được đặt nhiều nhất.

X:

Airline.

Y:

Number of bookings.

## Pie Chart

Tỷ lệ quốc gia có khách đặt tour.

---

# 17. Top Countries Table

10 quốc gia có lượng đặt tour nhiều nhất.

Columns:

* Đất nước.
* Số tour.
* Số khách đặt vé.

Sort giảm dần theo booking count.

---

# 18. Admin Tour List

Hiển thị danh sách tour.

20 tour/trang.

Columns:

* ID.
* Tour.
* Điểm đi.
* Điểm đến.
* Ngày khởi hành.
* Số ngày.
* Giá.
* Operator.
* Status.
* Action (Sửa, Xóa).

Pagination:

* Previous.
* Page number.
* Next.

Button `+ Tạo Tour` dẫn tới `/admin/tours/create`.

## 18.1 Tạo Tour

Form nhập:

* Tên tour.
* Mã tour.
* Operator.
* Điểm đi.
* Điểm đến.
* Quốc gia.
* Ngày khởi hành.
* Số ngày.
* Số đêm.
* Hãng bay (chọn từ danh sách airlines, optional).
* Loại máy bay (optional).
* Giá.
* Thumbnail (URL, tỷ lệ 600x400).
* Mô tả.
* Dịch vụ bao gồm.
* Dịch vụ không bao gồm.
* Lịch trình từng ngày (thêm/xóa động theo số ngày).
* Status (available/unavailable).

Validate trước khi submit. Sau khi submit:

* Lưu tour + itinerary vào SQLite.
* Hiển thị thông báo thành công.
* Quay lại `/admin/tours`.

## 18.2 Sửa Tour

Click `Sửa` ở Admin Tour List mở lại form Tạo Tour (`/admin/tours/create?id=<tourId>`) ở chế độ Sửa:

* Toàn bộ trường và lịch trình được nạp sẵn dữ liệu hiện tại của tour.
* Tiêu đề trang và nút submit đổi thành "Sửa Tour" / "Cập nhật Tour".
* Nếu `id` không tồn tại: hiển thị empty/error state kèm nút quay lại danh sách.

Sau khi submit:

* Cập nhật tour + toàn bộ lịch trình (itinerary) vào SQLite.
* Hiển thị thông báo thành công.
* Quay lại `/admin/tours`.

---

# 19. Admin Flight List

20 chuyến bay/trang.

Columns:

* ID.
* Airline.
* Flight number.
* Origin.
* Destination.
* Departure.
* Arrival.
* Duration.
* Aircraft.
* Class.
* Price.
* Status.
* Action (Sửa, Xóa).

Button `+ Tạo Chuyến Bay` dẫn tới `/admin/flights/create`.

## 19.1 Tạo Chuyến Bay

Form nhập:

* Số hiệu chuyến bay.
* Hãng bay (chọn từ danh sách airlines).
* Sân bay đi.
* Sân bay đến.
* Ngày bay.
* Giờ cất cánh.
* Giờ hạ cánh.
* Loại vé (một chiều/khứ hồi/nhiều thành phố).
* Số điểm dừng.
* Loại máy bay.
* Giá Phổ thông.
* Giá Thương gia.
* Dịch vụ đi kèm.
* Status (available/unavailable).

Validate trước khi submit. Sau khi submit:

* Lưu flight vào SQLite.
* Hiển thị thông báo thành công.
* Quay lại `/admin/flights`.

## 19.2 Sửa Chuyến Bay

Click `Sửa` ở Admin Flight List mở lại form Tạo Chuyến Bay (`/admin/flights/create?id=<flightId>`) ở chế độ Sửa, toàn bộ trường được nạp sẵn dữ liệu hiện tại. Nếu `id` không tồn tại: hiển thị empty/error state kèm nút quay lại danh sách. Sau khi submit: cập nhật flight vào SQLite, hiển thị thông báo thành công, quay lại `/admin/flights`.

---

# 20. Profile

Hiển thị:

* Avatar.
* Họ tên.
* Username.
* Email.
* Số điện thoại.
* Quốc gia.
* Địa chỉ.
* Ngày tạo tài khoản.

Cho phép cập nhật thông tin profile.

---

# 21. Definition of Done

Một chức năng chỉ được xem là hoàn thành khi:

* UI hoạt động.
* Responsive.
* Có validation.
* Dữ liệu đọc/ghi SQLite.
* Có loading state.
* Có empty state.
* Có error state.
* Không có console error.
* Navigation hoạt động.
* Không reload trang không cần thiết.
* Có feedback sau thao tác.
