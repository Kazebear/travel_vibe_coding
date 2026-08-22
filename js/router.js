const routes = [];
let notFoundHandler = null;

export function registerRoute(path, handler) {
  routes.push({ path, handler });
}

export function registerNotFound(handler) {
  notFoundHandler = handler;
}

function matchRoute(pathname) {
  return routes.find((r) => r.path === pathname);
}

export function getQueryParams() {
  return Object.fromEntries(new URL(window.location.href).searchParams.entries());
}

export function buildUrl(path, params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.set(k, v);
  });
  const qs = usp.toString();
  return qs ? `${path}?${qs}` : path;
}

export function navigate(path, { replace = false } = {}) {
  if (replace) history.replaceState({}, '', path);
  else history.pushState({}, '', path);
  render();
}

export function render() {
  const url = new URL(window.location.href);
  const params = Object.fromEntries(url.searchParams.entries());
  const match = matchRoute(url.pathname);
  window.scrollTo(0, 0);
  if (match) {
    match.handler(params);
  } else if (notFoundHandler) {
    notFoundHandler(params);
  }
}

export function initRouter() {
  window.addEventListener('popstate', render);
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-link]');
    if (link && link.getAttribute('href')) {
      e.preventDefault();
      navigate(link.getAttribute('href'));
    }
  });
  render();
}
