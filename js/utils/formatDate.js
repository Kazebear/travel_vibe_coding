export function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

export function formatDateTime(isoDate, time) {
  return `${formatDate(isoDate)}${time ? ' ' + time : ''}`;
}

export function formatDuration(minutes) {
  const m = Number(minutes) || 0;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h${mm > 0 ? mm.toString().padStart(2, '0') + 'm' : ''}`;
}

export function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function nowISO() {
  return new Date().toISOString();
}
