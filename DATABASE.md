# TravelViet — Database Specification

> **Đã chuyển sang Supabase Postgres.** Schema/RLS/trigger/RPC thật nằm ở [supabase/schema.sql](supabase/schema.sql) — chạy 1 lần trong Supabase SQL Editor. Nội dung SQLite bên dưới chỉ còn giá trị tham khảo ý nghĩa từng bảng/field (tên bảng `users` cũ nay là `profiles`, gắn với Supabase Auth); cú pháp SQL cụ thể không còn áp dụng. Xem quyết định + các bước setup thủ công trong [project.md](project.md).

## 1. Database (lịch sử — SQLite, đã thay thế)

Tên database:

`travelviet.sqlite`

Database chạy phía client bằng SQLite WASM/sql.js.

Database phải được khởi tạo tự động nếu chưa tồn tại.

---

# 2. Tables

## users

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    full_name TEXT,
    phone TEXT,
    country TEXT,
    address TEXT,
    avatar TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT
);
```

Role:

```text
admin
user
```

---

## airlines

```sql
CREATE TABLE airlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    logo TEXT,
    country TEXT,
    active INTEGER DEFAULT 1
);
```

---

## airports

```sql
CREATE TABLE airports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL
);
```

---

## flights

```sql
CREATE TABLE flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_number TEXT NOT NULL,
    airline_id INTEGER NOT NULL,
    origin_airport_id INTEGER NOT NULL,
    destination_airport_id INTEGER NOT NULL,
    departure_date TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    trip_type TEXT NOT NULL,
    stops INTEGER DEFAULT 0,
    aircraft TEXT,
    economy_price REAL NOT NULL,
    business_price REAL NOT NULL,
    services TEXT,
    status TEXT DEFAULT 'available',
    FOREIGN KEY (airline_id) REFERENCES airlines(id),
    FOREIGN KEY (origin_airport_id) REFERENCES airports(id),
    FOREIGN KEY (destination_airport_id) REFERENCES airports(id)
);
```

Trip type:

```text
one-way
round-trip
multi-city
```

---

## tours

```sql
CREATE TABLE tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    operator TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    country TEXT NOT NULL,
    departure_date TEXT NOT NULL,
    days INTEGER NOT NULL,
    nights INTEGER NOT NULL,
    airline_id INTEGER,
    aircraft TEXT,
    price REAL NOT NULL,
    thumbnail TEXT,
    description TEXT,
    included_services TEXT,
    excluded_services TEXT,
    status TEXT DEFAULT 'available',
    featured INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (airline_id) REFERENCES airlines(id)
);
```

---

## tour_itineraries

```sql
CREATE TABLE tour_itineraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tour_id INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    meals TEXT,
    accommodation TEXT,
    FOREIGN KEY (tour_id) REFERENCES tours(id)
);
```

---

## bookings

```sql
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code TEXT NOT NULL UNIQUE,
    user_id INTEGER,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    country TEXT,
    address TEXT,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## booking_flights

```sql
CREATE TABLE booking_flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    flight_id INTEGER NOT NULL,
    fare_class TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    price REAL NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (flight_id) REFERENCES flights(id)
);
```

---

## booking_tours

```sql
CREATE TABLE booking_tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    tour_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    price REAL NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (tour_id) REFERENCES tours(id)
);
```

---

# 3. Indexes

Create indexes:

```sql
CREATE INDEX idx_flights_departure_date
ON flights(departure_date);

CREATE INDEX idx_flights_airline
ON flights(airline_id);

CREATE INDEX idx_flights_origin
ON flights(origin_airport_id);

CREATE INDEX idx_flights_destination
ON flights(destination_airport_id);

CREATE INDEX idx_tours_departure_date
ON tours(departure_date);

CREATE INDEX idx_tours_country
ON tours(country);

CREATE INDEX idx_tours_featured
ON tours(featured);

CREATE INDEX idx_bookings_created_at
ON bookings(created_at);
```

---

# 4. Required Queries

Flights:

```text
getFlights()
getFlightById(id)
searchFlights(params)
filterFlights(filters)
countFlights()
createFlight(data)
updateFlight(id, data)
```

Tours:

```text
getTours()
getTourById(id)
getFeaturedTours()
searchTours(params)
filterTours(filters)
countTours()
createTour(data)
updateTour(id, data)
createTourItinerary(tourId, days)
```

Dashboard:

```text
getMonthlyTourCount()
getFlightCount()
getTourCustomerCount()
getFlightCustomerCount()
getTopAirlines()
getTopTourCountries()
```

---

# 5. Pagination

Admin lists phải sử dụng SQL pagination.

20 records/page.

Concept:

```sql
LIMIT 20 OFFSET ?
```

Không load toàn bộ dữ liệu rồi mới phân trang bằng JavaScript nếu database đã có thể xử lý pagination.

---

# 6. Database Initialization

Khi app khởi động:

```text
1. Load SQLite WASM/sql.js.
2. Open database.
3. Kiểm tra schema.
4. Nếu chưa có tables → CREATE TABLE.
5. Kiểm tra seed data.
6. Nếu database mới → seed.
7. Start application.
```

---

# 7. Cart Persistence

Giỏ hàng có thể lưu:

* SQLite hoặc
* localStorage.

Khuyến nghị:

```text
SQLite = persistent business data
localStorage = temporary UI/session state
```

Cart object:

```javascript
{
    flights: [],
    tours: []
}
```

---

# 8. Demo Authentication

Seed hai user:

```text
admin@travel.com
Admin123!

user@travel.com
User123!
```

Password phải được hash trước khi lưu database nếu triển khai implementation thực tế.

---

# 9. Booking Flow

```text
Cart
 ↓
Customer Form
 ↓
Validation
 ↓
BookingService
 ↓
Create booking
 ↓
Create booking_flights
 ↓
Create booking_tours
 ↓
Clear cart
 ↓
Success
 ↓
EmailService
```
