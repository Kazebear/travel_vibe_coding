/**
 * TravelViet có thể được host ở gốc domain (localhost, Netlify, Vercel, custom domain)
 * hoặc ở subpath khi deploy qua GitHub Pages dạng project site
 * (https://<user>.github.io/<repo>/). BASE_PATH được suy ra tự động từ hostname
 * để mọi route/asset đều trỏ đúng nơi mà không cần cấu hình thủ công.
 */
const GH_PAGES_REPO = 'travel_vibe_coding';

export const BASE_PATH = (() => {
  if (typeof window === 'undefined') return '/';
  return window.location.hostname.endsWith('github.io') ? `/${GH_PAGES_REPO}/` : '/';
})();

export function withBase(path) {
  if (!path || path === '/') return BASE_PATH;
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return BASE_PATH + clean;
}
