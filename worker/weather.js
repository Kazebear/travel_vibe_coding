const OPENWEATHER_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const UPSTREAM_TIMEOUT_MS = 8000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  });
}

function groupByDay(list) {
  const days = new Map();
  for (const item of list) {
    const date = item.dt_txt.slice(0, 10);
    if (!days.has(date)) days.set(date, []);
    days.get(date).push(item);
  }
  return days;
}

function pickNoonEntry(entries) {
  return entries.reduce((best, e) => {
    const hour = Number(e.dt_txt.slice(11, 13));
    const bestHour = Number(best.dt_txt.slice(11, 13));
    return Math.abs(hour - 12) < Math.abs(bestHour - 12) ? e : best;
  }, entries[0]);
}

function buildForecast(list) {
  const days = [...groupByDay(list).entries()].slice(0, 5);
  return days.map(([date, entries]) => {
    const rep = pickNoonEntry(entries);
    const temps = entries.map((e) => e.main.temp);
    return {
      date,
      tempMin: Math.round(Math.min(...temps)),
      tempMax: Math.round(Math.max(...temps)),
      description: rep.weather[0]?.description || '',
      icon: rep.weather[0]?.icon || '',
    };
  });
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    if (request.method !== 'GET') {
      return json({ error: 'method_not_allowed', message: 'Chỉ hỗ trợ GET.' }, 405);
    }

    const url = new URL(request.url);
    const city = (url.searchParams.get('city') || '').trim();
    if (!city) {
      return json({ error: 'missing_city', message: 'Thiếu tham số city.' }, 400);
    }
    if (!env.OPENWEATHER_API_KEY) {
      return json({ error: 'server_misconfigured', message: 'Máy chủ chưa cấu hình API key.' }, 500);
    }

    const apiUrl = `${OPENWEATHER_FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${env.OPENWEATHER_API_KEY}&units=metric&lang=vi`;

    let upstream;
    try {
      upstream = await fetchWithTimeout(apiUrl, UPSTREAM_TIMEOUT_MS);
    } catch (e) {
      const timedOut = e.name === 'AbortError';
      return json(
        { error: timedOut ? 'upstream_timeout' : 'upstream_unreachable', message: 'Máy chủ thời tiết phản hồi quá chậm. Vui lòng thử lại.' },
        504
      );
    }

    if (upstream.status === 404) {
      return json({ error: 'city_not_found', message: `Không tìm thấy thành phố "${city}".` }, 404);
    }
    if (!upstream.ok) {
      return json({ error: 'upstream_error', message: 'Không thể tải dữ liệu thời tiết. Vui lòng thử lại.' }, 502);
    }

    const data = await upstream.json();
    return json({
      city: data.city?.name || city,
      country: data.city?.country || '',
      forecast: buildForecast(data.list || []),
    });
  },
};
