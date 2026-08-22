export function showConfirm({ title, message, confirmText = 'Xác nhận', cancelText = 'Hủy', danger = false }) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-title">${title}</div>
        <div class="text-muted">${message}</div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">${cancelText}</button>
          <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-action="confirm">${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    function close(result) {
      overlay.remove();
      resolve(result);
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.dataset.action === 'cancel') close(false);
      else if (e.target.dataset.action === 'confirm') close(true);
    });
  });
}
