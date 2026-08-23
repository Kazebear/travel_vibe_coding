-- ============================================================================
-- TravelViet — Supabase schema, RLS, triggers, RPC functions
--
-- Chạy 1 LẦN DUY NHẤT trong Supabase Dashboard > SQL Editor > New query > Run.
-- An toàn để chạy trên project rỗng. KHÔNG chạy lại lần 2 (các CREATE TABLE sẽ lỗi
-- vì bảng đã tồn tại) — nếu cần chạy lại, xoá thủ công các bảng/hàm trước.
-- ============================================================================

-- 1. PROFILES (hồ sơ công khai, gắn 1-1 với auth.users) --------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  phone text,
  country text,
  address text,
  avatar text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 2. AIRLINES / AIRPORTS ------------------------------------------------------
create table public.airlines (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  logo text,
  country text,
  active boolean default true
);

create table public.airports (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  city text not null,
  country text not null
);

-- 3. FLIGHTS -------------------------------------------------------------------
create table public.flights (
  id bigint generated always as identity primary key,
  flight_number text not null,
  airline_id bigint not null,
  origin_airport_id bigint not null,
  destination_airport_id bigint not null,
  departure_date date not null,
  departure_time text not null,
  arrival_time text not null,
  duration_minutes integer not null,
  trip_type text not null,
  stops integer default 0,
  aircraft text,
  economy_price numeric not null,
  business_price numeric not null,
  services text,
  status text default 'available',
  constraint fk_flights_airline foreign key (airline_id) references public.airlines(id),
  constraint fk_flights_origin foreign key (origin_airport_id) references public.airports(id),
  constraint fk_flights_destination foreign key (destination_airport_id) references public.airports(id)
);

-- 4. TOURS + ITINERARIES --------------------------------------------------------
create table public.tours (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  operator text not null,
  origin text not null,
  destination text not null,
  country text not null,
  departure_date date not null,
  departure_time text not null default '07:00',
  days integer not null,
  nights integer not null,
  airline_id bigint,
  aircraft text,
  price numeric not null,
  thumbnail text,
  description text,
  included_services text,
  excluded_services text,
  status text default 'available',
  featured boolean default false,
  created_at timestamptz not null default now(),
  constraint fk_tours_airline foreign key (airline_id) references public.airlines(id)
);

create table public.tour_itineraries (
  id bigint generated always as identity primary key,
  tour_id bigint not null references public.tours(id) on delete cascade,
  day_number integer not null,
  title text not null,
  description text not null,
  meals text,
  accommodation text
);

-- 5. BOOKINGS ---------------------------------------------------------------------
create table public.bookings (
  id bigint generated always as identity primary key,
  booking_code text not null unique,
  user_id uuid references public.profiles(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  country text,
  address text,
  total_amount numeric not null,
  status text default 'completed',
  created_at timestamptz not null default now()
);

create table public.booking_flights (
  id bigint generated always as identity primary key,
  booking_id bigint not null references public.bookings(id) on delete cascade,
  flight_id bigint not null references public.flights(id),
  fare_class text not null,
  quantity integer default 1,
  price numeric not null
);

create table public.booking_tours (
  id bigint generated always as identity primary key,
  booking_id bigint not null references public.bookings(id) on delete cascade,
  tour_id bigint not null references public.tours(id),
  quantity integer default 1,
  price numeric not null
);

-- 6. INDEXES --------------------------------------------------------------------
create index idx_flights_departure_date on public.flights(departure_date);
create index idx_flights_airline on public.flights(airline_id);
create index idx_flights_origin on public.flights(origin_airport_id);
create index idx_flights_destination on public.flights(destination_airport_id);
create index idx_tours_departure_date on public.tours(departure_date);
create index idx_tours_country on public.tours(country);
create index idx_tours_featured on public.tours(featured);
create index idx_bookings_created_at on public.bookings(created_at);

-- 7. Helper: is_admin() ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- 8. Trigger: tự tạo profile khi có user Auth mới -----------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, phone, address, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'address',
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 9. RPC: tra email theo username (đăng nhập bằng username) + kiểm tra username trống --
create or replace function public.fn_email_by_username(p_username text)
returns text
language sql
security definer
stable
set search_path = public, auth
as $$
  select u.email::text
  from auth.users u
  join public.profiles p on p.id = u.id
  where p.username = p_username
  limit 1;
$$;

create or replace function public.fn_username_available(p_username text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select not exists(select 1 from public.profiles where username = p_username);
$$;

revoke execute on function public.fn_email_by_username(text) from public;
grant execute on function public.fn_email_by_username(text) to anon, authenticated;
revoke execute on function public.fn_username_available(text) from public;
grant execute on function public.fn_username_available(text) to anon, authenticated;

-- 10. RPC cho Dashboard (thay cho GROUP BY mà PostgREST không hỗ trợ trực tiếp) -------
create or replace function public.fn_monthly_tour_count()
returns integer language sql security definer stable set search_path = public as $$
  select count(*)::integer from public.tours
  where to_char(departure_date, 'YYYY-MM') = to_char(now(), 'YYYY-MM');
$$;

create or replace function public.fn_tour_customer_count()
returns integer language sql security definer stable set search_path = public as $$
  select count(distinct booking_id)::integer from public.booking_tours;
$$;

create or replace function public.fn_flight_customer_count()
returns integer language sql security definer stable set search_path = public as $$
  select count(distinct booking_id)::integer from public.booking_flights;
$$;

create or replace function public.fn_top_airlines(limit_n integer default 10)
returns table(airline text, bookings bigint)
language sql security definer stable set search_path = public as $$
  select al.name as airline, count(bf.id) as bookings
  from public.booking_flights bf
  join public.flights f on f.id = bf.flight_id
  join public.airlines al on al.id = f.airline_id
  group by al.id, al.name
  order by bookings desc
  limit limit_n;
$$;

create or replace function public.fn_top_tour_countries(limit_n integer default 10)
returns table(country text, tour_count bigint, customer_count bigint)
language sql security definer stable set search_path = public as $$
  select t.country as country, count(distinct t.id) as tour_count, count(bt.id) as customer_count
  from public.booking_tours bt
  join public.tours t on t.id = bt.tour_id
  group by t.country
  order by customer_count desc
  limit limit_n;
$$;

revoke execute on function public.fn_monthly_tour_count() from public;
revoke execute on function public.fn_tour_customer_count() from public;
revoke execute on function public.fn_flight_customer_count() from public;
revoke execute on function public.fn_top_airlines(integer) from public;
revoke execute on function public.fn_top_tour_countries(integer) from public;
grant execute on function public.fn_monthly_tour_count() to authenticated;
grant execute on function public.fn_tour_customer_count() to authenticated;
grant execute on function public.fn_flight_customer_count() to authenticated;
grant execute on function public.fn_top_airlines(integer) to authenticated;
grant execute on function public.fn_top_tour_countries(integer) to authenticated;

-- 11. Row Level Security -----------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.airlines enable row level security;
alter table public.airports enable row level security;
alter table public.flights enable row level security;
alter table public.tours enable row level security;
alter table public.tour_itineraries enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_flights enable row level security;
alter table public.booking_tours enable row level security;

-- profiles: chỉ xem/sửa chính mình; cột role không cho user tự sửa (grant theo cột)
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (full_name, phone, country, address, avatar, updated_at) on public.profiles to authenticated;

-- airlines / airports: đọc công khai, ghi chỉ admin (app không có UI quản lý, nhưng cần cho seed 1 lần)
create policy "airlines_select_all" on public.airlines for select using (true);
create policy "airlines_insert_admin" on public.airlines for insert with check (public.is_admin());
create policy "airports_select_all" on public.airports for select using (true);
create policy "airports_insert_admin" on public.airports for insert with check (public.is_admin());

-- flights: đọc công khai, ghi chỉ admin
create policy "flights_select_all" on public.flights for select using (true);
create policy "flights_insert_admin" on public.flights for insert with check (public.is_admin());
create policy "flights_update_admin" on public.flights for update using (public.is_admin());
create policy "flights_delete_admin" on public.flights for delete using (public.is_admin());

-- tours / tour_itineraries: đọc công khai, ghi chỉ admin
create policy "tours_select_all" on public.tours for select using (true);
create policy "tours_insert_admin" on public.tours for insert with check (public.is_admin());
create policy "tours_update_admin" on public.tours for update using (public.is_admin());
create policy "tours_delete_admin" on public.tours for delete using (public.is_admin());

create policy "itineraries_select_all" on public.tour_itineraries for select using (true);
create policy "itineraries_insert_admin" on public.tour_itineraries for insert with check (public.is_admin());
create policy "itineraries_update_admin" on public.tour_itineraries for update using (public.is_admin());
create policy "itineraries_delete_admin" on public.tour_itineraries for delete using (public.is_admin());

-- bookings: đặt vé công khai (không cần đăng nhập), chỉ chủ booking hoặc admin đọc được
create policy "bookings_insert_public" on public.bookings for insert with check (true);
create policy "bookings_select_own_or_admin" on public.bookings for select using (user_id = auth.uid() or public.is_admin());

-- booking_flights / booking_tours: chỉ cần insert công khai, app không đọc trực tiếp
create policy "booking_flights_insert_public" on public.booking_flights for insert with check (true);
create policy "booking_tours_insert_public" on public.booking_tours for insert with check (true);
