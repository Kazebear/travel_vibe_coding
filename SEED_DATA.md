# TravelViet — Seed Data

## 1. Demo Users

### Admin

```text
Email: admin@travel.com
Password: Admin123!
Role: admin
Name: TravelViet Administrator
```

### User

```text
Email: user@travel.com
Password: User123!
Role: user
Name: Nguyễn Văn User
```

---

# 2. Airlines

Tạo tối thiểu 10 hãng:

1. VietJet Air
2. Vietnam Airlines
3. Bamboo Airways
4. Pacific Airlines
5. Singapore Airlines
6. Thai Airways
7. AirAsia
8. Korean Air
9. Japan Airlines
10. Emirates

Mỗi hãng:

* ID.
* IATA code.
* Name.
* Country.
* Logo.

---

# 3. Airports

Tạo dữ liệu tối thiểu:

```text
SGN — Tân Sơn Nhất — Hồ Chí Minh — Vietnam
HAN — Nội Bài — Hà Nội — Vietnam
DAD — Đà Nẵng — Đà Nẵng — Vietnam
CXR — Cam Ranh — Khánh Hòa — Vietnam
PQC — Phú Quốc — Kiên Giang — Vietnam
HPH — Cát Bi — Hải Phòng — Vietnam
SIN — Changi — Singapore — Singapore
BKK — Suvarnabhumi — Bangkok — Thailand
ICN — Incheon — Seoul — South Korea
NRT — Narita — Tokyo — Japan
DXB — Dubai International — Dubai — UAE
```

---

# 4. Flights

Tạo tối thiểu 100 chuyến bay mẫu.

Phân bố:

* Vietnam Airlines.
* VietJet Air.
* Bamboo Airways.
* Singapore Airlines.
* Thai Airways.
* AirAsia.
* Korean Air.
* Japan Airlines.
* Emirates.

Có:

* Nội địa.
* Quốc tế.
* Một chiều.
* Khứ hồi.
* Bay thẳng.
* Có điểm dừng.

Khoảng giá:

```text
Economy: 800.000 - 15.000.000 VND
Business: 3.000.000 - 45.000.000 VND
```

Aircraft:

```text
Airbus A320
Airbus A321
Airbus A330
Airbus A350
Boeing 737
Boeing 787
Boeing 777
```

---

# 5. Featured Tours

Homepage phải có chính xác 8 tour nổi bật.

Đề xuất:

1. Hà Nội — Hạ Long 4N3Đ
2. Đà Nẵng — Hội An — Bà Nà Hills 4N3Đ
3. Phú Quốc 4N3Đ
4. Nha Trang 4N3Đ
5. Đà Lạt 3N2Đ
6. Hà Nội — Ninh Bình 3N2Đ
7. TP.HCM — Miền Tây 3N2Đ
8. Sapa — Fansipan 4N3Đ

Mỗi tour:

* Thumbnail 600x400.
* Destination.
* Operator.
* Departure date.
* Duration.
* Price.
* Airline nếu có.
* Aircraft nếu có.
* Services.

---

# 6. Tour Dataset

Tạo tối thiểu 100 tour để kiểm tra pagination.

Phân bố điểm đến:

* Vietnam.
* Thailand.
* Singapore.
* Japan.
* South Korea.
* China.
* Malaysia.
* Indonesia.
* France.
* Italy.
* Australia.
* UAE.

---

# 7. Tour Itinerary

Mỗi tour phải có itinerary.

Ví dụ:

```text
Day 1
TP.HCM → Đà Nẵng
Nhận phòng khách sạn
Tự do khám phá thành phố

Day 2
Bà Nà Hills
Golden Bridge
Fantasy Park

Day 3
Hội An
Phố cổ
Chùa Cầu
Thả đèn hoa đăng

Day 4
Đà Nẵng → TP.HCM
Kết thúc chương trình
```

---

# 8. Booking Data

Seed một số booking để Dashboard có dữ liệu.

Phải đủ dữ liệu để biểu đồ:

* Top 10 airlines.
* Top countries.

Có ít nhất 10 quốc gia.

---

# 9. Dashboard Expected Data

Seed booking sao cho:

### Top airlines

Có thể tạo dữ liệu ví dụ:

```text
Vietnam Airlines
VietJet Air
Singapore Airlines
AirAsia
Thai Airways
Korean Air
Japan Airlines
Emirates
Bamboo Airways
Pacific Airlines
```

### Countries

```text
Vietnam
Thailand
Singapore
Japan
South Korea
Malaysia
Indonesia
China
France
Italy
```

Số lượng phải khác nhau để Pie Chart thể hiện rõ tỷ lệ.
