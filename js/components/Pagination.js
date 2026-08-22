export function renderPagination(currentPage, totalPages, onChange) {
  if (totalPages <= 1) return { html: '', bind: () => {} };
  const pages = [];
  const maxButtons = 5;
  let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  const html = `
    <div class="pagination" data-pagination>
      <button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
      ${pages.map((p) => `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`).join('')}
      <button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>
    </div>
  `;
  return { html, bind: (root) => bindPagination(root, onChange) };
}

function bindPagination(root, onChange) {
  const el = root.querySelector('[data-pagination]');
  if (!el) return;
  el.querySelectorAll('.pagination-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = Number(btn.dataset.page);
      if (page >= 1) onChange(page);
    });
  });
}
