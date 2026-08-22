export function skeletonList(count = 4, height = 110) {
  return `<div class="result-list">${Array.from({ length: count }).map(() => `<div class="skeleton" style="height:${height}px"></div>`).join('')}</div>`;
}

export function skeletonGrid(count = 8, height = 320) {
  return `<div class="tour-grid">${Array.from({ length: count }).map(() => `<div class="skeleton" style="height:${height}px"></div>`).join('')}</div>`;
}

export function skeletonTable(rows = 8) {
  return `<div class="card" style="padding:16px"><div style="display:flex;flex-direction:column;gap:10px">${Array.from({ length: rows }).map(() => `<div class="skeleton" style="height:36px"></div>`).join('')}</div></div>`;
}
