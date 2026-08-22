const COLORS = ['#0B5ED7', '#00A8E8', '#198754', '#DC3545', '#FFB703', '#6f42c1', '#20c997', '#fd7e14', '#0d6efd', '#d63384'];

export function airlineColor(code) {
  let hash = 0;
  const str = String(code || '');
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function airlineBadge(code, size = 42) {
  return `<span class="airline-badge" style="width:${size}px;height:${size}px;background:${airlineColor(code)};color:#fff;border-color:${airlineColor(code)}">${code || '?'}</span>`;
}
