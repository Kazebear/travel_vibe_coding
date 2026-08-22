import { sha256Hex } from '../utils/hash.js';
import { todayISO, addDaysISO, nowISO } from '../utils/formatDate.js';

const AIRLINES = [
  { code: 'VJ', name: 'VietJet Air', country: 'Vietnam' },
  { code: 'VN', name: 'Vietnam Airlines', country: 'Vietnam' },
  { code: 'QH', name: 'Bamboo Airways', country: 'Vietnam' },
  { code: 'BL', name: 'Pacific Airlines', country: 'Vietnam' },
  { code: 'SQ', name: 'Singapore Airlines', country: 'Singapore' },
  { code: 'TG', name: 'Thai Airways', country: 'Thailand' },
  { code: 'AK', name: 'AirAsia', country: 'Malaysia' },
  { code: 'KE', name: 'Korean Air', country: 'South Korea' },
  { code: 'JL', name: 'Japan Airlines', country: 'Japan' },
  { code: 'EK', name: 'Emirates', country: 'UAE' },
];

const AIRPORTS = [
  { code: 'SGN', name: 'Tân Sơn Nhất', city: 'Hồ Chí Minh', country: 'Vietnam' },
  { code: 'HAN', name: 'Nội Bài', city: 'Hà Nội', country: 'Vietnam' },
  { code: 'DAD', name: 'Đà Nẵng', city: 'Đà Nẵng', country: 'Vietnam' },
  { code: 'CXR', name: 'Cam Ranh', city: 'Khánh Hòa', country: 'Vietnam' },
  { code: 'PQC', name: 'Phú Quốc', city: 'Kiên Giang', country: 'Vietnam' },
  { code: 'HPH', name: 'Cát Bi', city: 'Hải Phòng', country: 'Vietnam' },
  { code: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore' },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand' },
  { code: 'ICN', name: 'Incheon', city: 'Seoul', country: 'South Korea' },
  { code: 'NRT', name: 'Narita', city: 'Tokyo', country: 'Japan' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
];

const AIRCRAFT_TYPES = ['Airbus A320', 'Airbus A321', 'Airbus A330', 'Airbus A350', 'Boeing 737', 'Boeing 787', 'Boeing 777'];
const SERVICE_POOL = ['Hành lý 20kg', 'Suất ăn', 'Chọn chỗ ngồi', 'Ưu tiên check-in', 'Giải trí trên chuyến bay'];
const OPERATORS = ['Vietravel', 'Saigontourist', 'Fiditour', 'TransViet Travel', 'Du Lịch Việt', 'Bến Thành Tourist', 'Hanoitourist'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}
function sample(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(randomInt(0, copy.length - 1), 1)[0]);
  }
  return out;
}
function pad2(n) {
  return String(n).padStart(2, '0');
}
function roundTo(value, step) {
  return Math.round(value / step) * step;
}
function addMinutesToTime(hh, mm, duration) {
  const total = (hh * 60 + mm + duration) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function buildFlights(airlineCodeToId, airportCodeToId) {
  const domesticAirports = ['SGN', 'HAN', 'DAD', 'CXR', 'PQC', 'HPH'];
  const intlAirports = ['SIN', 'BKK', 'ICN', 'NRT', 'DXB'];
  const domesticAirlines = ['VJ', 'VN', 'QH', 'BL'];
  const intlAirlines = ['VN', 'SQ', 'TG', 'AK', 'KE', 'JL', 'EK'];
  const hubs = ['SGN', 'HAN'];

  const rows = [];

  function buildOne(originCode, destCode, airlineCode, isDomestic) {
    const hh = randomInt(0, 23);
    const mm = randomChoice([0, 15, 30, 45]);
    const duration = isDomestic ? randomInt(70, 140) : randomInt(180, 420);
    const economy = isDomestic
      ? roundTo(randomInt(800000, 3000000), 10000)
      : roundTo(randomInt(3000000, 15000000), 10000);
    const business = roundTo(economy * randomFloat(2.2, 3.2), 10000);
    const tripType = randomChoice(['round-trip', 'round-trip', 'one-way', 'one-way', 'multi-city']);
    const stops = tripType === 'multi-city' ? randomInt(1, 2) : Math.random() < 0.15 ? 1 : 0;

    rows.push({
      flight_number: airlineCode + randomInt(100, 999),
      airline_id: airlineCodeToId[airlineCode],
      origin_airport_id: airportCodeToId[originCode],
      destination_airport_id: airportCodeToId[destCode],
      departure_date: addDaysISO(todayISO(), randomInt(1, 60)),
      departure_time: `${pad2(hh)}:${pad2(mm)}`,
      arrival_time: addMinutesToTime(hh, mm, duration),
      duration_minutes: duration,
      trip_type: tripType,
      stops,
      aircraft: randomChoice(AIRCRAFT_TYPES),
      economy_price: economy,
      business_price: business,
      services: sample(SERVICE_POOL, randomInt(2, 4)).join(', '),
      status: 'available',
    });
  }

  for (const origin of domesticAirports) {
    for (const dest of domesticAirports) {
      if (origin === dest) continue;
      for (let k = 0; k < 2; k++) {
        buildOne(origin, dest, randomChoice(domesticAirlines), true);
      }
    }
  }

  for (const hub of hubs) {
    for (const intl of intlAirports) {
      for (let dir = 0; dir < 2; dir++) {
        const origin = dir === 0 ? hub : intl;
        const dest = dir === 0 ? intl : hub;
        for (let k = 0; k < 2; k++) {
          buildOne(origin, dest, randomChoice(intlAirlines), false);
        }
      }
    }
  }

  return rows;
}

const TOUR_TEMPLATES = [
  { name: 'Hà Nội - Hạ Long', country: 'Vietnam', origin: 'TP. Hồ Chí Minh', destination: 'Hạ Long', days: 4, nights: 3, featured: true, airlineCode: 'VN', priceRange: [4500000, 7000000] },
  { name: 'Đà Nẵng - Hội An - Bà Nà Hills', country: 'Vietnam', origin: 'TP. Hồ Chí Minh', destination: 'Đà Nẵng', days: 4, nights: 3, featured: true, airlineCode: 'VJ', priceRange: [4900000, 7900000] },
  { name: 'Phú Quốc', country: 'Vietnam', origin: 'TP. Hồ Chí Minh', destination: 'Phú Quốc', days: 4, nights: 3, featured: true, airlineCode: 'QH', priceRange: [5200000, 8500000] },
  { name: 'Nha Trang', country: 'Vietnam', origin: 'TP. Hồ Chí Minh', destination: 'Nha Trang', days: 4, nights: 3, featured: true, airlineCode: 'VJ', priceRange: [3900000, 6500000] },
  { name: 'Đà Lạt', country: 'Vietnam', origin: 'TP. Hồ Chí Minh', destination: 'Đà Lạt', days: 3, nights: 2, featured: true, airlineCode: null, priceRange: [2500000, 4200000] },
  { name: 'Hà Nội - Ninh Bình', country: 'Vietnam', origin: 'Hà Nội', destination: 'Ninh Bình', days: 3, nights: 2, featured: true, airlineCode: null, priceRange: [2200000, 3800000] },
  { name: 'TP.HCM - Miền Tây', country: 'Vietnam', origin: 'TP. Hồ Chí Minh', destination: 'Miền Tây', days: 3, nights: 2, featured: true, airlineCode: null, priceRange: [1900000, 3200000] },
  { name: 'Sapa - Fansipan', country: 'Vietnam', origin: 'Hà Nội', destination: 'Sapa', days: 4, nights: 3, featured: true, airlineCode: null, priceRange: [3200000, 5200000] },
  { name: 'Huế - Động Phong Nha', country: 'Vietnam', origin: 'Hà Nội', destination: 'Huế', days: 4, nights: 3, airlineCode: 'VN', priceRange: [3800000, 6200000] },
  { name: 'Quy Nhơn - Phú Yên', country: 'Vietnam', origin: 'TP. Hồ Chí Minh', destination: 'Quy Nhơn', days: 3, nights: 2, airlineCode: 'VJ', priceRange: [3200000, 5300000] },
  { name: 'Côn Đảo', country: 'Vietnam', origin: 'TP. Hồ Chí Minh', destination: 'Côn Đảo', days: 3, nights: 2, airlineCode: 'VN', priceRange: [4200000, 6800000] },
  { name: 'Hà Giang - Cao nguyên đá', country: 'Vietnam', origin: 'Hà Nội', destination: 'Hà Giang', days: 4, nights: 3, airlineCode: null, priceRange: [3000000, 5000000] },
  { name: 'Bangkok - Pattaya', country: 'Thailand', origin: 'TP. Hồ Chí Minh', destination: 'Bangkok', days: 5, nights: 4, airlineCode: 'TG', priceRange: [7500000, 11000000] },
  { name: 'Singapore - Sentosa', country: 'Singapore', origin: 'TP. Hồ Chí Minh', destination: 'Singapore', days: 4, nights: 3, airlineCode: 'SQ', priceRange: [9500000, 14000000] },
  { name: 'Tokyo - Osaka', country: 'Japan', origin: 'Hà Nội', destination: 'Tokyo', days: 6, nights: 5, airlineCode: 'JL', priceRange: [22000000, 32000000] },
  { name: 'Seoul - Nami Island', country: 'South Korea', origin: 'TP. Hồ Chí Minh', destination: 'Seoul', days: 5, nights: 4, airlineCode: 'KE', priceRange: [18000000, 26000000] },
  { name: 'Bắc Kinh - Thượng Hải', country: 'China', origin: 'Hà Nội', destination: 'Bắc Kinh', days: 6, nights: 5, airlineCode: null, priceRange: [17000000, 25000000] },
  { name: 'Kuala Lumpur - Langkawi', country: 'Malaysia', origin: 'TP. Hồ Chí Minh', destination: 'Kuala Lumpur', days: 4, nights: 3, airlineCode: 'AK', priceRange: [7000000, 10500000] },
  { name: 'Bali - Đảo thiên đường', country: 'Indonesia', origin: 'TP. Hồ Chí Minh', destination: 'Bali', days: 5, nights: 4, airlineCode: null, priceRange: [12000000, 18000000] },
  { name: 'Paris - Versailles', country: 'France', origin: 'Hà Nội', destination: 'Paris', days: 7, nights: 6, airlineCode: null, priceRange: [38000000, 55000000] },
  { name: 'Rome - Venice', country: 'Italy', origin: 'Hà Nội', destination: 'Rome', days: 7, nights: 6, airlineCode: null, priceRange: [40000000, 58000000] },
  { name: 'Sydney - Melbourne', country: 'Australia', origin: 'TP. Hồ Chí Minh', destination: 'Sydney', days: 7, nights: 6, airlineCode: null, priceRange: [42000000, 60000000] },
  { name: 'Dubai - Abu Dhabi', country: 'UAE', origin: 'TP. Hồ Chí Minh', destination: 'Dubai', days: 5, nights: 4, airlineCode: 'EK', priceRange: [26000000, 38000000] },
];

const DAY_ACTIVITIES = [
  'Nhận phòng khách sạn, tự do khám phá thành phố',
  'Tham quan các điểm nổi bật, thưởng thức ẩm thực địa phương',
  'Trải nghiệm văn hóa bản địa, mua sắm đặc sản',
  'Tham quan danh lam thắng cảnh, chụp ảnh lưu niệm',
  'Nghỉ dưỡng, tự do tắm biển hoặc dạo phố',
  'Di chuyển đến điểm tham quan tiếp theo',
];

function buildItinerary(template) {
  const days = [];
  for (let d = 1; d <= template.days; d++) {
    let title;
    let description;
    if (d === 1) {
      title = `${template.origin} → ${template.destination}`;
      description = `Khởi hành từ ${template.origin}, di chuyển đến ${template.destination}. Nhận phòng khách sạn, tự do nghỉ ngơi.`;
    } else if (d === template.days) {
      title = `${template.destination} → ${template.origin}`;
      description = `Trả phòng khách sạn, di chuyển ra sân bay/bến xe, kết thúc chương trình tour và về lại ${template.origin}.`;
    } else {
      title = template.destination;
      description = randomChoice(DAY_ACTIVITIES) + '.';
    }
    days.push({
      day_number: d,
      title,
      description,
      meals: 'Sáng, Trưa, Tối',
      accommodation: d === template.days ? '' : 'Khách sạn 3-4 sao',
    });
  }
  return days;
}

function buildTours(airlineCodeToId) {
  const tours = [];
  let featuredUsed = 0;

  TOUR_TEMPLATES.forEach((template, tIndex) => {
    const departures = 5;
    for (let dIdx = 0; dIdx < departures; dIdx++) {
      const isFeaturedInstance = !!template.featured && dIdx === 0;
      if (isFeaturedInstance) featuredUsed++;
      const price = roundTo(randomInt(template.priceRange[0], template.priceRange[1]), 10000);
      tours.push({
        code: `TOUR${String(tIndex + 1).padStart(2, '0')}${String(dIdx + 1).padStart(2, '0')}`,
        name: `${template.name} ${template.days}N${template.nights}Đ`,
        operator: randomChoice(OPERATORS),
        origin: template.origin,
        destination: template.destination,
        country: template.country,
        departure_date: addDaysISO(todayISO(), randomInt(7, 90)),
        departure_time: `${pad2(randomInt(0, 23))}:${pad2(randomChoice([0, 15, 30, 45]))}`,
        days: template.days,
        nights: template.nights,
        airline_id: template.airlineCode ? airlineCodeToId[template.airlineCode] : null,
        aircraft: template.airlineCode ? randomChoice(AIRCRAFT_TYPES) : null,
        price,
        thumbnail: `https://picsum.photos/seed/travelviet-${tIndex}-${dIdx}/600/400`,
        description: `Hành trình ${template.name} ${template.days} ngày ${template.nights} đêm, khám phá ${template.destination} cùng ${template.country === 'Vietnam' ? 'TravelViet' : 'đối tác quốc tế'}.`,
        included_services: 'Vé máy bay/xe khứ hồi, khách sạn, ăn uống theo chương trình, hướng dẫn viên, bảo hiểm du lịch',
        excluded_services: 'Chi phí cá nhân, đồ uống ngoài chương trình, tip hướng dẫn viên và lái xe',
        status: 'available',
        featured: isFeaturedInstance ? 1 : 0,
        created_at: nowISO(),
        itinerary: buildItinerary(template),
      });
    }
  });

  return tours;
}

function bookingCode(prefix, index) {
  return `${prefix}${String(Date.now()).slice(-5)}${String(index).padStart(4, '0')}`;
}

const CUSTOMER_NAMES = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Thu Dung', 'Hoàng Minh Đức', 'Vũ Thị Hoa', 'Đặng Quốc Khánh', 'Bùi Thị Lan', 'Ngô Văn Nam', 'Đỗ Thị Oanh'];

function buildBookings(flightRows, tourRows) {
  const bookings = [];
  const bookingFlights = [];
  const bookingTours = [];
  const count = 260;

  for (let i = 1; i <= count; i++) {
    const name = randomChoice(CUSTOMER_NAMES);
    const email = `khach${i}@example.com`;
    let total = 0;
    const flightItems = [];
    const tourItems = [];

    const wantsFlight = Math.random() < 0.7;
    const wantsTour = Math.random() < 0.55 || !wantsFlight;

    if (wantsFlight) {
      const n = randomInt(1, 2);
      for (let k = 0; k < n; k++) {
        const flightIndex = randomInt(0, flightRows.length - 1);
        const fareClass = Math.random() < 0.8 ? 'economy' : 'business';
        const price = fareClass === 'economy' ? flightRows[flightIndex].economy_price : flightRows[flightIndex].business_price;
        flightItems.push({ flightId: flightIndex + 1, fareClass, price });
        total += price;
      }
    }
    if (wantsTour) {
      const tourIndex = randomInt(0, tourRows.length - 1);
      const price = tourRows[tourIndex].price;
      tourItems.push({ tourId: tourIndex + 1, price });
      total += price;
    }

    bookings.push({
      booking_code: bookingCode('TV', i),
      customer_name: name,
      customer_email: email,
      customer_phone: `09${randomInt(10000000, 99999999)}`,
      country: 'Vietnam',
      address: 'Việt Nam',
      total_amount: total,
      status: 'completed',
      created_at: addDaysISO(todayISO(), -randomInt(0, 45)) + 'T09:00:00.000Z',
    });

    flightItems.forEach((it) => bookingFlights.push({ bookingIndex: i - 1, ...it }));
    tourItems.forEach((it) => bookingTours.push({ bookingIndex: i - 1, ...it }));
  }

  return { bookings, bookingFlights, bookingTours };
}

export async function seedDatabase(db) {
  db.run('BEGIN TRANSACTION;');

  const adminHash = await sha256Hex('Admin123!');
  const userHash = await sha256Hex('User123!');
  const now = nowISO();

  db.run(
    `INSERT INTO users (username, email, password_hash, role, full_name, phone, country, address, avatar, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['admin01', 'admin@travel.com', adminHash, 'admin', 'TravelViet Administrator', '0900000001', 'Vietnam', 'TP. Hồ Chí Minh', '', now]
  );
  db.run(
    `INSERT INTO users (username, email, password_hash, role, full_name, phone, country, address, avatar, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['user01', 'user@travel.com', userHash, 'user', 'Nguyễn Văn User', '0900000002', 'Vietnam', 'Hà Nội', '', now]
  );

  const airlineCodeToId = {};
  AIRLINES.forEach((a, idx) => {
    const id = idx + 1;
    airlineCodeToId[a.code] = id;
    db.run(`INSERT INTO airlines (code, name, logo, country, active) VALUES (?, ?, ?, ?, 1)`, [a.code, a.name, '', a.country]);
  });

  const airportCodeToId = {};
  AIRPORTS.forEach((a, idx) => {
    const id = idx + 1;
    airportCodeToId[a.code] = id;
    db.run(`INSERT INTO airports (code, name, city, country) VALUES (?, ?, ?, ?)`, [a.code, a.name, a.city, a.country]);
  });

  const flightRows = buildFlights(airlineCodeToId, airportCodeToId);
  flightRows.forEach((f) => {
    db.run(
      `INSERT INTO flights (flight_number, airline_id, origin_airport_id, destination_airport_id, departure_date, departure_time, arrival_time, duration_minutes, trip_type, stops, aircraft, economy_price, business_price, services, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [f.flight_number, f.airline_id, f.origin_airport_id, f.destination_airport_id, f.departure_date, f.departure_time, f.arrival_time, f.duration_minutes, f.trip_type, f.stops, f.aircraft, f.economy_price, f.business_price, f.services, f.status]
    );
  });

  const tourRows = buildTours(airlineCodeToId);
  tourRows.forEach((t) => {
    db.run(
      `INSERT INTO tours (code, name, operator, origin, destination, country, departure_date, departure_time, days, nights, airline_id, aircraft, price, thumbnail, description, included_services, excluded_services, status, featured, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.code, t.name, t.operator, t.origin, t.destination, t.country, t.departure_date, t.departure_time, t.days, t.nights, t.airline_id, t.aircraft, t.price, t.thumbnail, t.description, t.included_services, t.excluded_services, t.status, t.featured, t.created_at]
    );
  });

  let tourIdCursor = 1;
  tourRows.forEach((t) => {
    const tourId = tourIdCursor++;
    t.itinerary.forEach((day) => {
      db.run(
        `INSERT INTO tour_itineraries (tour_id, day_number, title, description, meals, accommodation) VALUES (?, ?, ?, ?, ?, ?)`,
        [tourId, day.day_number, day.title, day.description, day.meals, day.accommodation]
      );
    });
  });

  const { bookings, bookingFlights, bookingTours } = buildBookings(flightRows, tourRows);
  bookings.forEach((b) => {
    db.run(
      `INSERT INTO bookings (booking_code, customer_name, customer_email, customer_phone, country, address, total_amount, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.booking_code, b.customer_name, b.customer_email, b.customer_phone, b.country, b.address, b.total_amount, b.status, b.created_at]
    );
  });

  bookingFlights.forEach((bf) => {
    db.run(
      `INSERT INTO booking_flights (booking_id, flight_id, fare_class, quantity, price) VALUES (?, ?, ?, 1, ?)`,
      [bf.bookingIndex + 1, bf.flightId, bf.fareClass, bf.price]
    );
  });
  bookingTours.forEach((bt) => {
    db.run(
      `INSERT INTO booking_tours (booking_id, tour_id, quantity, price) VALUES (?, ?, 1, ?)`,
      [bt.bookingIndex + 1, bt.tourId, bt.price]
    );
  });

  db.run('COMMIT;');
}
