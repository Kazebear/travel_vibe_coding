export function formatCurrency(amount) {
  const value = Math.round(Number(amount) || 0);
  return value.toLocaleString('vi-VN') + 'đ';
}
