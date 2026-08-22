# TravelViet — Routes & Navigation

## Public Routes

| Route                     | Page            | Auth |
| ------------------------- | --------------- | ---- |
| `/`                       | Homepage        | No   |
| `/flights`                | Flights         | No   |
| `/flight-detail?id=FL001` | Flight Detail   | No   |
| `/tours`                  | Tours           | No   |
| `/tour-detail?id=TOUR001` | Tour Detail     | No   |
| `/cart`                   | Cart            | No   |
| `/login`                  | Login           | No   |
| `/register`               | Register        | No   |
| `/forgot-password`        | Forgot Password | No   |
| `/profile`                | Profile         | User |

---

# Admin Routes

| Route                   | Page          | Role  |
| ----------------------- | ------------- | ----- |
| `/dashboard`            | Dashboard     | Admin |
| `/admin/tours`          | List Tours    | Admin |
| `/admin/tours/create`   | Create Tour   | Admin |
| `/admin/flights`        | List Flights  | Admin |
| `/admin/flights/create` | Create Flight | Admin |
| `/profile`              | Profile       | Admin |

---

# Navigation Flow

## Flight Search

```text
Homepage
 ↓
Search Flight
 ↓
Flights
 ↓
Flight Detail
 ↓
Select Fare
 ↓
Cart
 ↓
Booking Form
 ↓
Success
```

---

# Tour Flow

```text
Homepage
 ↓
Featured Tour
 ↓
Tour Detail
 ↓
Select Tour
 ↓
Cart
 ↓
Booking Form
 ↓
Success
```

---

# Authentication Flow

```text
Login
 ↓
Validate
 ↓
Success
 ↓
Home/Profile/Dashboard
```

Admin:

```text
admin@travel.com
 ↓
Login
 ↓
Dashboard
```

User:

```text
user@travel.com
 ↓
Login
 ↓
Home/Profile
```

---

# Unauthorized

Nếu user truy cập:

```text
/dashboard
/admin/tours
/admin/flights
```

mà không có role `admin`:

* Không cho render nội dung admin.
* Redirect `/login`.
* Hiển thị thông báo nếu phù hợp.

---

# Query Parameters

## Flights

```text
/flights?origin=SGN&destination=HAN
```

Có thể thêm:

```text
date
returnDate
tripType
passengers
class
airline
```

---

## Flight Detail

```text
/flight-detail?id=1
```

---

## Tour Detail

```text
/tour-detail?id=1
```

---

# Search State

Search state phải được giữ khi user:

```text
Homepage
→ Flights
→ Detail
→ Back
```

Có thể lưu vào:

```text
sessionStorage
```

hoặc AppState.

---

# Browser Back

Phải hỗ trợ:

```text
history.back()
```

mà không làm mất state quan trọng.

---

# 404

Nếu route không tồn tại:

Hiển thị:

```text
404

Trang bạn tìm kiếm không tồn tại.

[Quay về trang chủ]
```
