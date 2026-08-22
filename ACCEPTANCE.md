# TravelViet — Acceptance Criteria

## 1. Homepage

* [ ] Header hiển thị đúng.
* [ ] Logo TravelViet hoạt động.
* [ ] Search flight hiển thị.
* [ ] Có Round Trip.
* [ ] Có One Way.
* [ ] Có Origin.
* [ ] Có Destination.
* [ ] Có Departure Date.
* [ ] Có Return Date.
* [ ] Click Search chuyển tới Flights.
* [ ] Hiển thị đúng 8 featured tours.
* [ ] Thumbnail tour tỷ lệ 600x400.
* [ ] Click tour chuyển Tour Detail.
* [ ] Hiển thị airline logos.
* [ ] Click airline chuyển Flights và filter hãng tương ứng.

---

# 2. Flights

* [ ] Hiển thị danh sách flights.
* [ ] Filter giá thấp → cao.
* [ ] Filter giá cao → thấp.
* [ ] Filter round trip.
* [ ] Filter one way.
* [ ] Filter direct.
* [ ] Filter multi-city.
* [ ] Filter airline.
* [ ] Filter departure time.
* [ ] Filter Economy.
* [ ] Filter Business.
* [ ] Có empty state.
* [ ] Có loading state.
* [ ] Click flight chuyển Detail.

---

# 3. Flight Detail

* [ ] Hiển thị origin.
* [ ] Hiển thị destination.
* [ ] Hiển thị departure.
* [ ] Hiển thị arrival.
* [ ] Hiển thị duration.
* [ ] Hiển thị airline.
* [ ] Hiển thị flight number.
* [ ] Hiển thị aircraft.
* [ ] Hiển thị Economy.
* [ ] Hiển thị Business.
* [ ] Có fare selection.
* [ ] Click Select Flight thêm vào Cart.
* [ ] Toast thành công.

---

# 4. Tours

* [ ] Hiển thị tour list.
* [ ] Filter price ascending.
* [ ] Filter price descending.
* [ ] Filter operator.
* [ ] Filter departure time.
* [ ] Filter destination.
* [ ] Click tour mở detail.

---

# 5. Tour Detail

* [ ] Hiển thị origin.
* [ ] Hiển thị destination.
* [ ] Hiển thị departure date.
* [ ] Hiển thị duration.
* [ ] Hiển thị airline.
* [ ] Hiển thị aircraft.
* [ ] Hiển thị price.
* [ ] Hiển thị services.
* [ ] Hiển thị itinerary.
* [ ] Click Select Tour thêm vào Cart.

---

# 6. Cart

* [ ] Hiển thị flight items.
* [ ] Hiển thị tour items.
* [ ] Hiển thị quantity.
* [ ] Hiển thị price.
* [ ] Hiển thị total.
* [ ] Có remove item.
* [ ] Có clear cart.
* [ ] Cart được lưu khi refresh.
* [ ] Empty cart hiển thị đúng.
* [ ] Có booking form.

---

# 7. Booking

* [ ] Full name required.
* [ ] Email required.
* [ ] Email format validation.
* [ ] Phone validation.
* [ ] Country.
* [ ] Address.
* [ ] Booking được lưu SQLite.
* [ ] Booking code được tạo.
* [ ] Cart được clear sau booking.
* [ ] Hiển thị success screen.

---

# 8. Authentication

* [ ] Login page hoạt động.
* [ ] Register page hoạt động.
* [ ] Forgot Password hoạt động.
* [ ] Username 5–15 characters.
* [ ] Username không có special characters.
* [ ] Password 5–15 characters.
* [ ] Email validation.
* [ ] Số điện thoại bắt buộc, đúng 10 chữ số.
* [ ] Địa chỉ tối đa 100 ký tự.
* [ ] Confirm password validation.
* [ ] Tài khoản đăng ký mới có role user.
* [ ] Admin account login được.
* [ ] User account login được.
* [ ] Logout hoạt động.

---

# 9. Dashboard

* [ ] Chỉ admin được truy cập.
* [ ] KPI Tour trong tháng.
* [ ] KPI số chuyến bay.
* [ ] KPI khách đặt tour.
* [ ] KPI khách đặt chuyến bay.
* [ ] Bar Chart Top 10 airlines.
* [ ] Pie Chart quốc gia.
* [ ] Top 10 countries table.

---

# 10. Admin Tours

* [ ] Hiển thị danh sách.
* [ ] SQLite query.
* [ ] 20 tours/page.
* [ ] Pagination.
* [ ] Previous.
* [ ] Next.
* [ ] Page number.
* [ ] Responsive table.
* [ ] Button "+ Tạo Tour" mở `/admin/tours/create`.
* [ ] Form tạo tour có validate.
* [ ] Tạo tour lưu vào SQLite (kèm itinerary).
* [ ] Sau khi tạo, quay lại danh sách và thấy tour mới.
* [ ] Button "Sửa" mở form đã điền sẵn dữ liệu tour hiện tại (kèm itinerary).
* [ ] Cập nhật tour lưu đúng vào SQLite, không tạo bản ghi trùng.
* [ ] Sửa tour với id không tồn tại hiển thị error state.

---

# 11. Admin Flights

* [ ] Hiển thị danh sách.
* [ ] SQLite query.
* [ ] 20 flights/page.
* [ ] Pagination.
* [ ] Previous.
* [ ] Next.
* [ ] Page number.
* [ ] Responsive table.
* [ ] Button "+ Tạo Chuyến Bay" mở `/admin/flights/create`.
* [ ] Form tạo chuyến bay có validate.
* [ ] Tạo chuyến bay lưu vào SQLite.
* [ ] Sau khi tạo, quay lại danh sách và thấy chuyến bay mới.
* [ ] Button "Sửa" mở form đã điền sẵn dữ liệu chuyến bay hiện tại.
* [ ] Cập nhật chuyến bay lưu đúng vào SQLite, không tạo bản ghi trùng.
* [ ] Sửa chuyến bay với id không tồn tại hiển thị error state.

---

# 12. Profile

* [ ] Hiển thị avatar.
* [ ] Full name.
* [ ] Username.
* [ ] Email.
* [ ] Phone.
* [ ] Country.
* [ ] Address.
* [ ] Created date.
* [ ] Có edit profile.
* [ ] Lưu thay đổi SQLite.

---

# 13. Responsive

Test:

* [ ] 375px.
* [ ] 390px.
* [ ] 768px.
* [ ] 1024px.
* [ ] 1440px.

Không được:

* Horizontal overflow không cần thiết.
* Text bị cắt.
* Button nằm ngoài viewport.
* Form bị vỡ layout.

---

# 14. Technical

* [ ] Không có backend.
* [ ] Không có server-side code.
* [ ] SQLite hoạt động trong browser.
* [ ] Seed data tự động.
* [ ] Không có JavaScript console errors.
* [ ] Không có broken image.
* [ ] Không có broken navigation.
* [ ] Không hard-code toàn bộ database vào HTML.
* [ ] Code sử dụng ES6 modules.
* [ ] Components có thể tái sử dụng.

---

# 15. Final Quality

Trước khi hoàn thành:

* [ ] Kiểm tra toàn bộ navigation.
* [ ] Kiểm tra toàn bộ form.
* [ ] Kiểm tra database CRUD.
* [ ] Kiểm tra filter.
* [ ] Kiểm tra pagination.
* [ ] Kiểm tra cart.
* [ ] Kiểm tra booking.
* [ ] Kiểm tra authentication.
* [ ] Kiểm tra admin authorization.
* [ ] Kiểm tra responsive.
* [ ] Kiểm tra console.
* [ ] Kiểm tra accessibility cơ bản.
