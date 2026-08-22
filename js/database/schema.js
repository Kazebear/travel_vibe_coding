export function createSchema(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
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

    CREATE TABLE IF NOT EXISTS airlines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      logo TEXT,
      country TEXT,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS airports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS flights (
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

    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      operator TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      country TEXT NOT NULL,
      departure_date TEXT NOT NULL,
      departure_time TEXT NOT NULL DEFAULT '07:00',
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

    CREATE TABLE IF NOT EXISTS tour_itineraries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tour_id INTEGER NOT NULL,
      day_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      meals TEXT,
      accommodation TEXT,
      FOREIGN KEY (tour_id) REFERENCES tours(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
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

    CREATE TABLE IF NOT EXISTS booking_flights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      flight_id INTEGER NOT NULL,
      fare_class TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      price REAL NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (flight_id) REFERENCES flights(id)
    );

    CREATE TABLE IF NOT EXISTS booking_tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      tour_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      price REAL NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (tour_id) REFERENCES tours(id)
    );

    CREATE INDEX IF NOT EXISTS idx_flights_departure_date ON flights(departure_date);
    CREATE INDEX IF NOT EXISTS idx_flights_airline ON flights(airline_id);
    CREATE INDEX IF NOT EXISTS idx_flights_origin ON flights(origin_airport_id);
    CREATE INDEX IF NOT EXISTS idx_flights_destination ON flights(destination_airport_id);
    CREATE INDEX IF NOT EXISTS idx_tours_departure_date ON tours(departure_date);
    CREATE INDEX IF NOT EXISTS idx_tours_country ON tours(country);
    CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(featured);
    CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
  `);
}

export const SCHEMA_VERSION = 1;
