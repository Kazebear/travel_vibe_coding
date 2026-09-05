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
| 2026-08-23 | Kết nối Supabase — xem mục 10 |

---

## 10. Kết nối Supabase (2026-08-23)

Chuyển từ SQLite/sql.js (chạy trong trình duyệt, dữ liệu riêng từng máy) sang **Supabase Postgres** làm nơi lưu trữ dùng chung. Vẫn không có backend tự viết — trình duyệt gọi thẳng Supabase qua `@supabase/supabase-js` bằng publishable/anon key, phân quyền bằng Row Level Security (RLS).

Project Supabase: `sghzjlrpdgyrmfeejsgc`.

### Quyết định

* **Dùng Supabase Auth thật** thay vì bảng `users` tự viết + hash SHA-256 — anon key không mang danh tính đăng nhập ở tầng database, chỉ Supabase Auth mới cho phép viết RLS dựa trên `auth.uid()`. Đổi tên bảng `users` → `profiles` (gắn 1-1 với `auth.users`).
* Giữ nguyên kiến trúc phân lớp Page → Service → Repository → DB (xem [ARCHITECTURE.md](ARCHITECTURE.md)); chỉ Repository + AuthService đổi cách nói chuyện với dữ liệu, Page/Component chủ yếu chỉ thêm `await` (mọi lệnh gọi DB giờ là bất đồng bộ qua mạng thay vì đồng bộ trong bộ nhớ).
* Các query GROUP BY phức tạp cho Dashboard (top hãng bay, top quốc gia...) chuyển thành RPC function (`fn_top_airlines`, `fn_top_tour_countries`, ...) vì PostgREST query builder không hỗ trợ GROUP BY trực tiếp.
* Đăng nhập bằng "Email / Username" (giữ nguyên UX cũ) cần thêm RPC `fn_email_by_username` vì Supabase Auth chỉ đăng nhập bằng email.
* Giới hạn độ dài password tối thiểu đổi từ 5 → 6 ký tự để khớp mức tối thiểu mặc định của Supabase Auth.

### Các bước setup thủ công trên Supabase Dashboard (chỉ làm 1 lần)

1. SQL Editor → chạy toàn bộ [supabase/schema.sql](supabase/schema.sql).
2. Authentication → Providers → Email → tắt **Confirm email** (để tài khoản demo đăng nhập được ngay, không cần xác nhận qua email).
3. Chạy script Node tạo 2 tài khoản demo (xem `scripts/` do Claude cung cấp lúc thực hiện, không nằm trong repo vì chỉ chạy 1 lần) → tạo `admin@travel.com`/`Admin123!` và `user@travel.com`/`User123!`.
4. SQL Editor → chạy: `update profiles set role='admin' where username='admin';` để nâng quyền tài khoản admin (không thể tự làm qua anon key vì cột `role` bị revoke UPDATE khỏi user thường — xem RLS trong schema.sql).
5. Chạy script Node seed dữ liệu mẫu (đăng nhập bằng tài khoản admin để thoả RLS) → 10 hãng bay, 11 sân bay, 100 chuyến bay, 115 tour + lịch trình, ~260 booking.

### Giới hạn đã biết

* Insert `bookings`/`booking_flights`/`booking_tours` mở công khai (giữ đúng luồng đặt vé không cần đăng nhập) → về lý thuyết ai cũng chèn được booking rác vào DB thật — giới hạn cố hữu của kiến trúc không backend, không riêng do Supabase.
* Email đặt lại mật khẩu (`resetPasswordForEmail`) dùng SMTP mặc định của Supabase (free tier, giới hạn số lượng/giờ) — đủ cho demo.

---

## 11. Tính năng thời tiết (2026-09-05)

### 11.1 Thời tiết hiện tại — Open-Meteo (frontend-only)

Thêm widget tra cứu thời tiết hiện tại theo tên thành phố trên trang chủ ([HomePage.js](js/pages/HomePage.js)). [WeatherService.js](js/services/WeatherService.js) gọi thẳng Geocoding + Forecast API của Open-Meteo từ trình duyệt — không cần key, đúng kiến trúc frontend-only gốc của dự án.

**Bug đã sửa:** Open-Meteo geocoding khớp sai với một số tên có dấu tiếng Việt (vd "Đà Lạt" có dấu ra một xã hẻo lánh ở Quảng Trị thay vì Đà Lạt, Lâm Đồng — xác minh bằng cách gọi trực tiếp API, lỗi này tồn tại bất kể `count` hay tham số `language`). Đã sửa bằng cách bỏ dấu tiếng Việt trước khi gửi tên thành phố cho geocoding; tên hiển thị vẫn có dấu đầy đủ vì server tự trả về theo `language=vi`. Đã kiểm tra lại toàn bộ thành phố lớn (Hà Nội, Đà Nẵng, Huế, Cần Thơ, Nha Trang, Hải Phòng, Vũng Tàu, Quy Nhơn).

### 11.2 Dự báo 5 ngày — OpenWeatherMap qua Cloudflare Worker (ngoại lệ kiến trúc)

Yêu cầu thêm dự báo 5 ngày dùng OpenWeatherMap, cần API key riêng của người dùng. Khác với Supabase anon key (thiết kế để public, bảo vệ bằng RLS) hay Open-Meteo (miễn phí, không cần key), **key của OpenWeatherMap không được thiết kế để lộ ra trình duyệt** — gắn thẳng vào code chạy client sẽ để lộ key cho bất kỳ ai xem Network tab sau khi deploy.

**Quyết định** (người dùng xác nhận, chấp nhận phá lệ "không backend" đã ghi trong README.md mục 7): thêm một Cloudflare Worker nhỏ ([worker/weather.js](worker/weather.js)) làm proxy — nhận `?city=`, gọi OpenWeatherMap bằng key giữ ở server (Worker secret), gộp dữ liệu 3 giờ/lần thành 5 ngày (nhiệt độ min/max, mô tả, icon lấy giờ gần 12:00 trưa làm đại diện), trả JSON gọn cho frontend. Đây là **ngoại lệ duy nhất** với nguyên tắc frontend-only — đã ghi rõ trong README.md mục 7 và ARCHITECTURE.md mục 1.

Frontend: [WeatherForecastService.js](js/services/WeatherForecastService.js) gọi Worker (không gọi thẳng OpenWeatherMap), [WeatherWidget.js](js/components/WeatherWidget.js) hiển thị song song thời tiết hiện tại (Open-Meteo) + dự báo 5 ngày (Worker) bằng `Promise.allSettled` — một bên lỗi không chặn bên kia.

**Quản lý secret:**

* API key gốc lưu ở `.env` (theo yêu cầu người dùng) — nhưng file `.env` **không** được trình duyệt hay Cloudflare Worker đọc trực tiếp (dự án không có bước build/bundler để inject biến môi trường vào code client, và Worker runtime cũng không tự đọc `.env`). Đây chỉ là nơi lưu key gốc theo ý người dùng.
* `.dev.vars` (cùng nội dung, dùng cho `wrangler dev` ở máy local) và `.env` đều đã thêm vào `.gitignore` — không commit lên Git.
* Production: chạy `npx wrangler secret put OPENWEATHER_API_KEY` một lần (nhập giá trị từ `.env`) để lưu vào Cloudflare, **không** lưu trong `wrangler.toml`.

### 11.3 Các bước deploy Worker thật

Đã deploy thành công (2026-09-05) tại `https://travelviet-weather.phongnguyen19990911.workers.dev`, secret `OPENWEATHER_API_KEY` đã cấu hình. Các bước đã chạy (tất cả lệnh phải chạy **từ trong thư mục `worker/`**, xem lý do ở mục 11.4):

1. `npx wrangler login` — đăng nhập Cloudflare (`npx.cmd wrangler login` trên PowerShell Windows nếu execution policy chặn `.ps1`).
2. `cd worker && npx wrangler secret put OPENWEATHER_API_KEY` — dán giá trị key khi được hỏi.
3. `cd worker && npx wrangler deploy` — lấy URL Worker được cấp (dạng `https://travelviet-weather.<subdomain>.workers.dev`).
4. Trong `index.html`, đã thêm trước thẻ script load `js/app.js`:
   ```html
   <script>window.WEATHER_API_BASE_URL = 'https://travelviet-weather.phongnguyen19990911.workers.dev';</script>
   ```
   (mặc định khi chưa cấu hình là `http://127.0.0.1:8787`, chỉ dùng cho `wrangler dev` ở local.)

### 11.4 Sự cố: push code làm sập site thật (2026-09-05) — đã khắc phục

**Chuyện đã xảy ra:** ban đầu `wrangler.toml` của Worker thời tiết đặt ở **gốc repo**. Tài khoản Cloudflare của người dùng đã có sẵn Worker `travel-vibe-coding` (site tĩnh TravelViet, deploy thủ công từ 2026-08-23) với cơ chế tự build/deploy mỗi khi có push lên GitHub — nhiều khả năng cơ chế này quét `wrangler.toml` ở gốc repo để biết cách build. Vì repo giờ có 2 `wrangler.toml`-worthy code (site tĩnh cũ + Worker thời tiết mới), sau các lần push tính năng thời tiết, Worker `travel-vibe-coding` bị build/deploy nhầm thành code của `worker/weather.js` — **site thật bị ghi đè, trả lỗi JSON thay vì trang web** trong một khoảng thời gian (khoảng 2026-09-05T06:58 → 07:35).

**Phát hiện:** kiểm tra `https://travel-vibe-coding.phongnguyen19990911.workers.dev/` trả về `{"error":"missing_city",...}` thay vì HTML; đối chiếu `wrangler deployments list --name travel-vibe-coding` thấy các bản deploy mới trùng thời điểm các lần push.

**Khắc phục:**
1. Rollback khẩn cấp Worker `travel-vibe-coding` về version tốt cuối (`9295d26e...`, 2026-08-23) bằng `wrangler rollback` → site chạy lại được (nhưng tạm thời mất tính năng thời tiết vì đó là bản trước khi có tính năng này).
2. Chuyển `wrangler.toml` (và `.dev.vars`) của Worker thời tiết vào hẳn trong `worker/` (`worker/wrangler.toml`, `main = "weather.js"`) — **không còn `wrangler.toml` nào ở gốc repo** để tránh bị quét nhầm. Deploy Worker thời tiết từ nay phải chạy trong thư mục `worker/`.
3. Redeploy `travelviet-weather` từ vị trí mới, xác nhận secret vẫn còn (secret gắn theo tên Worker, không mất khi redeploy) và hoạt động lại bình thường.

**Việc người dùng cần tự kiểm tra thêm** (Claude không có quyền truy cập dashboard Cloudflare): vào Cloudflare Dashboard → Workers & Pages → `travel-vibe-coding` → tab **Settings → Build** (hoặc tương đương) để xem chính xác cấu hình auto-deploy đang trỏ vào đâu, và cân nhắc tắt auto-deploy-on-push cho Worker này nếu không chủ đích dùng, hoặc giới hạn root directory build cho đúng — tránh lặp lại sự cố nếu sau này có thêm Worker khác trong repo.

### Giới hạn đã biết (mục 11)

* Worker không giới hạn origin gọi tới (`Access-Control-Allow-Origin: *`) và không rate-limit theo IP — đủ cho demo, ai biết URL Worker cũng gọi được (nhưng không lấy được key).
* Gộp dữ liệu 3 giờ/lần của OpenWeatherMap thành "5 ngày" theo mốc giờ gần 12:00 trưa làm đại diện; ngày đầu tiên có thể là phần còn lại của hôm nay (dữ liệu bắt đầu từ thời điểm gọi API, không phải từ 00:00).
* Sau sự cố mục 11.4, site `travel-vibe-coding` đang chạy bản **trước khi có tính năng thời tiết** — cần push lại (hoặc trigger deploy lại) sau khi xác nhận cơ chế auto-deploy đã an toàn, để đưa tính năng thời tiết trở lại site thật.
